import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ThugsAndDragonsModule } from './thugs-and-dragons/thugs-and-dragons.module';
import { ThugzcationController } from './thugzcation/thugzcation.controller';
import { ThugzcationService } from './thugzcation/thugzcation.service';
import { ThugzController } from './thugz/thugz.controller';
import { ThugzService } from './thugz/thugz.service';

@Module({
  imports: [AuthModule, DatabaseModule, ThugsAndDragonsModule],
  controllers: [ThugzcationController, ThugzController],
  providers: [ThugzcationService, ThugzService],
})
export class AppModule {}
