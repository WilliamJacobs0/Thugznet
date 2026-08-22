import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentThug, type AuthenticatedThug } from './auth/current-thug';
import { EntraAuthGuard } from './auth/entra-auth.guard';
import { ThugService } from './thug.service';

type UpdateDisplayNameRequest = {
  displayName: string;
};

@Controller()
@UseGuards(EntraAuthGuard)
export class ThugController {
  constructor(private readonly thugService: ThugService) {}

  @Get('me')
  getMe(@CurrentThug() thug: AuthenticatedThug) {
    return thug;
  }

  @Patch('me')
  updateMe(
    @CurrentThug() thug: AuthenticatedThug,
    @Body() request: UpdateDisplayNameRequest,
  ) {
    return this.thugService.updateDisplayName(thug.id, request.displayName);
  }

  @Get('thugz')
  getThugz() {
    return this.thugService.getThugz();
  }
}
