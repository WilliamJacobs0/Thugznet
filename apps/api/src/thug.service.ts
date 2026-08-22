import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ThugService {
  constructor(private readonly prisma: PrismaService) {}

  getThugz() {
    return this.prisma.thug.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, firstName: true, displayName: true },
    });
  }

  updateDisplayName(thugId: number, value: unknown) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException('Display name is required.');
    }

    const displayName = value.trim();

    if (displayName.length > 50) {
      throw new BadRequestException(
        'Display name must be 50 characters or fewer.',
      );
    }

    return this.prisma.thug.update({
      where: { id: thugId },
      data: { displayName },
      select: { id: true, firstName: true, displayName: true },
    });
  }
}
