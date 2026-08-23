import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentThug, type AuthenticatedThug } from '../auth/current-thug';
import { EntraAuthGuard } from '../auth/entra-auth.guard';
import {
  type AddThugzMansionInput,
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
  @UseGuards(EntraAuthGuard)
  addThugzMansion(
    @CurrentThug() thug: AuthenticatedThug,
    @Body() request: AddThugzMansionInput,
  ) {
    return this.thugzcationService.addThugzMansion(thug.id, request);
  }
}
