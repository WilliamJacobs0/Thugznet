import { Module } from '@nestjs/common';
import { ThugAuthGuard } from './auth/thug-auth.guard';
import { PrismaService } from './database/prisma.service';
import { ThugzcationController } from './thugzcation/thugzcation.controller';
import { ThugzcationService } from './thugzcation/thugzcation.service';
import { ThugzController } from './thugz/thugz.controller';
import { ThugzService } from './thugz/thugz.service';

@Module({
  imports: [],
  controllers: [ThugzcationController, ThugzController],
  providers: [
    ThugzcationService,
    ThugzService,
    ThugAuthGuard,
    PrismaService,
  ],
})
export class AppModule {}
