import { Module } from '@nestjs/common';
import { EntraAuthGuard } from './auth/entra-auth.guard';
import { PrismaService } from './prisma.service';
import { ThugController } from './thug.controller';
import { ThugService } from './thug.service';
import { ThugzcationController } from './thugzcation.controller';
import { ThugzcationService } from './thugzcation.service';

@Module({
  imports: [],
  controllers: [ThugzcationController, ThugController],
  providers: [
    ThugzcationService,
    ThugService,
    EntraAuthGuard,
    PrismaService,
  ],
})
export class AppModule {}
