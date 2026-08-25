import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DungeonMaster, type DungeonMasterContext } from './dungeon-master';

export type StartTurnInput = {
  prompt: string;
  durationSeconds: number;
};

export type SubmitPlayerInput = {
  text: string;
};

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dungeonMaster: DungeonMaster,
  ) {}

  async createGame(thugId: number) {
    const game = await this.prisma.$transaction((transaction) =>
      transaction.game.create({
        data: {
          joinCode: randomBytes(3).toString('hex').toUpperCase(),
          world: { create: {} },
          players: { create: { thugId } },
        },
      }),
    );

    return this.getGame(game.id);
  }

  async listGames() {
    const games = await this.prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        joinCode: true,
        createdAt: true,
        _count: { select: { players: true } },
        turns: {
          orderBy: { number: 'desc' },
          take: 1,
          select: {
            number: true,
            resolvedAt: true,
            narrative: true,
          },
        },
      },
    });

    return games.map((game) => ({
      id: game.id,
      joinCode: game.joinCode,
      createdAt: game.createdAt,
      playerCount: game._count.players,
      latestTurn: game.turns[0] ?? null,
    }));
  }

  async getGame(gameId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        world: {
          include: {
            characters: { orderBy: { id: 'asc' } },
            locations: { orderBy: { id: 'asc' } },
            things: { orderBy: { id: 'asc' } },
          },
        },
        players: {
          orderBy: { joinedAt: 'asc' },
          include: {
            thug: {
              select: { id: true, firstName: true, displayName: true },
            },
            controlledCharacters: { orderBy: { id: 'asc' } },
          },
        },
        turns: {
          orderBy: { number: 'asc' },
          include: {
            inputs: {
              orderBy: { createdAt: 'asc' },
              include: {
                player: {
                  select: {
                    id: true,
                    thug: { select: { displayName: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    return { ...game, serverTime: new Date() };
  }

  async deleteGame(gameId: number) {
    await this.requireGame(gameId);
    await this.prisma.game.delete({ where: { id: gameId } });
    return { id: gameId };
  }

  async joinGame(gameId: number, thugId: number) {
    await this.requireGame(gameId);
    await this.prisma.player.upsert({
      where: { gameId_thugId: { gameId, thugId } },
      update: {},
      create: { gameId, thugId },
    });
    return this.getGame(gameId);
  }

  async startTurn(gameId: number, request: StartTurnInput) {
    const prompt = this.requiredText(request.prompt, 'Prompt');
    const durationSeconds = request.durationSeconds;

    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0) {
      throw new BadRequestException(
        'Turn duration must be a positive number of seconds.',
      );
    }

    await this.requireGame(gameId);

    const unresolvedTurn = await this.prisma.turn.findFirst({
      where: { gameId, resolvedAt: null },
      select: { id: true },
    });

    if (unresolvedTurn) {
      throw new ConflictException('The current turn must resolve first.');
    }

    const latestTurn = await this.prisma.turn.findFirst({
      where: { gameId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    return this.prisma.turn.create({
      data: {
        gameId,
        number: (latestTurn?.number ?? 0) + 1,
        prompt,
        closesAt: new Date(Date.now() + durationSeconds * 1000),
      },
    });
  }

  async submitInput(
    turnId: number,
    thugId: number,
    request: SubmitPlayerInput,
  ) {
    const text = this.requiredText(request.text, 'Input');
    const turn = await this.prisma.turn.findUnique({
      where: { id: turnId },
      select: { gameId: true, closesAt: true, resolvedAt: true },
    });

    if (!turn) {
      throw new NotFoundException('Turn not found.');
    }

    if (turn.resolvedAt || turn.closesAt <= new Date()) {
      throw new ConflictException('The input window is closed.');
    }

    const player = await this.prisma.player.findUnique({
      where: { gameId_thugId: { gameId: turn.gameId, thugId } },
      select: { id: true },
    });

    if (!player) {
      throw new ForbiddenException('Join the game before submitting input.');
    }

    return this.prisma.playerInput.create({
      data: { turnId, playerId: player.id, text },
    });
  }

  async resolveTurn(turnId: number) {
    const turn = await this.turnForResolution(turnId);

    if (!turn) {
      throw new NotFoundException('Turn not found.');
    }

    if (turn.resolvedAt) {
      return this.turnResolution(turn);
    }

    if (turn.closesAt > new Date()) {
      throw new ConflictException('The input window is still open.');
    }

    if (!turn.game.world) {
      throw new ConflictException('The game has no world.');
    }

    const resolution = await this.dungeonMaster.resolveTurn(
      this.dungeonMasterContext(turn),
    );
    const resolvedAt = new Date();

    const update = await this.prisma.turn.updateMany({
      where: { id: turnId, resolvedAt: null },
      data: { narrative: resolution.narrative, resolvedAt },
    });

    if (update.count === 0) {
      const resolvedTurn = await this.prisma.turn.findUniqueOrThrow({
        where: { id: turnId },
      });
      return this.turnResolution(resolvedTurn);
    }

    return {
      id: turn.id,
      number: turn.number,
      narrative: resolution.narrative,
      resolvedAt,
    };
  }

  private dungeonMasterContext(
    turn: Awaited<ReturnType<GamesService['turnForResolution']>>,
  ): DungeonMasterContext {
    if (!turn || !turn.game.world) {
      throw new ConflictException('The game has no world.');
    }

    return {
      turn: { number: turn.number, prompt: turn.prompt },
      world: {
        description: turn.game.world.description,
        attributes: turn.game.world.attributes,
        characters: turn.game.world.characters,
        locations: turn.game.world.locations,
        things: turn.game.world.things,
      },
      players: turn.game.players.map((player) => ({
        id: player.id,
        displayName: player.thug.displayName,
        characterIds: player.controlledCharacters.map(
          (character) => character.id,
        ),
      })),
      inputs: turn.inputs.map((input) => ({
        playerId: input.playerId,
        text: input.text,
      })),
    };
  }

  private turnForResolution(turnId: number) {
    return this.prisma.turn.findUnique({
      where: { id: turnId },
      include: {
        inputs: { orderBy: { createdAt: 'asc' } },
        game: {
          include: {
            world: {
              include: {
                characters: { orderBy: { id: 'asc' } },
                locations: { orderBy: { id: 'asc' } },
                things: { orderBy: { id: 'asc' } },
              },
            },
            players: {
              orderBy: { joinedAt: 'asc' },
              include: {
                thug: { select: { displayName: true } },
                controlledCharacters: { select: { id: true } },
              },
            },
          },
        },
      },
    });
  }

  private turnResolution(turn: {
    id: number;
    number: number;
    narrative: string | null;
    resolvedAt: Date | null;
  }) {
    return {
      id: turn.id,
      number: turn.number,
      narrative: turn.narrative,
      resolvedAt: turn.resolvedAt,
    };
  }

  private async requireGame(gameId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });

    if (!game) {
      throw new NotFoundException('Game not found.');
    }
  }

  private requiredText(value: unknown, label: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${label} is required.`);
    }

    return value.trim();
  }
}
