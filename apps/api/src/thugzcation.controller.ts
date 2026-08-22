import { Body, Controller, Get, Post } from '@nestjs/common';
import { ThugzcationService } from './thugzcation.service';

export type CreateThugzMansionRequest = {
  title: string;
  listingUrl: string;
  summary: string;
};

@Controller('thugzcation')
export class ThugzcationController {
  constructor(private readonly thugzcationService: ThugzcationService) {}

  @Get()
  getThugzcation() {
    return this.thugzcationService.getThugzcation();
  }

  @Post('mansions')
  addThugzMansion(@Body() request: CreateThugzMansionRequest) {
    return this.thugzcationService.addThugzMansion(request);
  }
}
