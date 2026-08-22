import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ThugzcationController } from './thugzcation.controller';
import { ThugzcationService } from './thugzcation.service';

@Module({
  imports: [],
  controllers: [ThugzcationController],
  providers: [ThugzcationService, PrismaService],
})
export class AppModule {}
