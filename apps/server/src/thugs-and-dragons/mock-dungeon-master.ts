import { Injectable } from '@nestjs/common';
import {
  DungeonMaster,
  type DungeonMasterContext,
  type TurnResolution,
} from './dungeon-master';

@Injectable()
export class MockDungeonMaster extends DungeonMaster {
  resolveTurn(context: DungeonMasterContext): Promise<TurnResolution> {
    const playerNames = new Map(
      context.players.map((player) => [player.id, player.displayName]),
    );
    const narrative = context.inputs
      .map(
        (input) =>
          `${playerNames.get(input.playerId) ?? 'Unknown Thug'}: ${input.text}`,
      )
      .join('\n');

    return Promise.resolve({ narrative });
  }
}
