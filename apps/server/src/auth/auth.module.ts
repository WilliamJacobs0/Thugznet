import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ThugAuthGuard } from './thug-auth.guard';

@Module({
  imports: [DatabaseModule],
  providers: [ThugAuthGuard],
  exports: [ThugAuthGuard],
})
export class AuthModule {}
