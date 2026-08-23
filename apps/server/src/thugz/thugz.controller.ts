import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentThug, type AuthenticatedThug } from '../auth/current-thug';
import { EntraAuthGuard } from '../auth/entra-auth.guard';
import { ThugzService } from './thugz.service';

type UpdateDisplayNameRequest = {
  displayName: string;
};

@Controller()
@UseGuards(EntraAuthGuard)
export class ThugzController {
  constructor(private readonly thugzService: ThugzService) {}

  @Get('me')
  getMe(@CurrentThug() thug: AuthenticatedThug) {
    return thug;
  }

  @Patch('me')
  updateMe(
    @CurrentThug() thug: AuthenticatedThug,
    @Body() request: UpdateDisplayNameRequest,
  ) {
    return this.thugzService.updateDisplayName(thug.id, request.displayName);
  }

  @Get('thugz')
  getThugz() {
    return this.thugzService.getThugz();
  }
}
