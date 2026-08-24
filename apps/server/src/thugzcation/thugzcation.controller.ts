import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentThug, type AuthenticatedThug } from '../auth/current-thug';
import { ThugAuthGuard } from '../auth/thug-auth.guard';
import {
  type ThugzMansionInput,
  ThugzcationService,
} from './thugzcation.service';

@Controller('thugzcation')
export class ThugzcationController {
  constructor(private readonly thugzcationService: ThugzcationService) {}

  @Get()
  getThugzcation() {
    return this.thugzcationService.getThugzcation();
  }

  @Post('mansions')
  @UseGuards(ThugAuthGuard)
  addThugzMansion(
    @CurrentThug() thug: AuthenticatedThug,
    @Body() request: ThugzMansionInput,
  ) {
    return this.thugzcationService.addThugzMansion(thug.id, request);
  }

  @Patch('mansions/:id')
  @UseGuards(ThugAuthGuard)
  updateThugzMansion(
    @Param('id', ParseIntPipe) mansionId: number,
    @Body() request: ThugzMansionInput,
  ) {
    return this.thugzcationService.updateThugzMansion(mansionId, request);
  }

  @Delete('mansions/:id')
  @UseGuards(ThugAuthGuard)
  deleteThugzMansion(@Param('id', ParseIntPipe) mansionId: number) {
    return this.thugzcationService.deleteThugzMansion(mansionId);
  }
}
