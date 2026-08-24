import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { DungeonMaster } from './dungeon-master';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { MockDungeonMaster } from './mock-dungeon-master';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [GamesController],
  providers: [
    GamesService,
    { provide: DungeonMaster, useClass: MockDungeonMaster },
  ],
})
export class ThugsAndDragonsModule {}
