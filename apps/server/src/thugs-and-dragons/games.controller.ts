import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentThug, type AuthenticatedThug } from '../auth/current-thug';
import { ThugAuthGuard } from '../auth/thug-auth.guard';
import {
  GamesService,
  type StartTurnInput,
  type SubmitPlayerInput,
} from './games.service';

@Controller('thugs-and-dragons')
@UseGuards(ThugAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('games')
  listGames() {
    return this.gamesService.listGames();
  }

  @Post('games')
  createGame(@CurrentThug() thug: AuthenticatedThug) {
    return this.gamesService.createGame(thug.id);
  }

  @Get('games/:gameId')
  getGame(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gamesService.getGame(gameId);
  }

  @Delete('games/:gameId')
  deleteGame(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gamesService.deleteGame(gameId);
  }

  @Post('games/:gameId/players')
  joinGame(
    @Param('gameId', ParseIntPipe) gameId: number,
    @CurrentThug() thug: AuthenticatedThug,
  ) {
    return this.gamesService.joinGame(gameId, thug.id);
  }

  @Post('games/:gameId/turns')
  startTurn(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() request: StartTurnInput,
  ) {
    return this.gamesService.startTurn(gameId, request);
  }

  @Post('turns/:turnId/inputs')
  submitInput(
    @Param('turnId', ParseIntPipe) turnId: number,
    @CurrentThug() thug: AuthenticatedThug,
    @Body() request: SubmitPlayerInput,
  ) {
    return this.gamesService.submitInput(turnId, thug.id, request);
  }

  @Post('turns/:turnId/resolve')
  resolveTurn(@Param('turnId', ParseIntPipe) turnId: number) {
    return this.gamesService.resolveTurn(turnId);
  }
}
