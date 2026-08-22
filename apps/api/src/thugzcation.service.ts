import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { CreateThugzMansionRequest } from './thugzcation.controller';

@Injectable()
export class ThugzcationService {
  constructor(private readonly prisma: PrismaService) {}

  async getThugzcation() {
    const [thugzcation, thugz] = await Promise.all([
      this.getCurrentThugzcation(),
      this.prisma.thug.findMany({ orderBy: { id: 'asc' } }),
    ]);

    return {
      thugzcation: {
        id: thugzcation.id,
        year: thugzcation.year,
        selectedThugzMansion: thugzcation.selectedThugzMansion,
      },
      thugz,
      eligibleThugzMansions: thugzcation.eligibleThugzMansions,
    };
  }

  async addThugzMansion(request: CreateThugzMansionRequest) {
    const title = this.requiredText(request.title, 'Title');
    const listingUrl = this.validListingUrl(request.listingUrl);
    const summary = this.requiredText(request.summary, 'Summary');
    const thugzcation = await this.getCurrentThugzcation();

    const existingMansion = await this.prisma.thugzMansion.findUnique({
      where: {
        thugzcationId_listingUrl: {
          thugzcationId: thugzcation.id,
          listingUrl,
        },
      },
    });

    if (existingMansion) {
      throw new ConflictException('That listing is already eligible.');
    }

    return this.prisma.thugzMansion.create({
      data: {
        thugzcationId: thugzcation.id,
        title,
        listingUrl,
        summary,
      },
    });
  }

  private async getCurrentThugzcation() {
    const thugzcation = await this.prisma.thugzcation.findFirst({
      orderBy: { year: 'desc' },
      include: {
        eligibleThugzMansions: { orderBy: { createdAt: 'desc' } },
        selectedThugzMansion: true,
      },
    });

    if (!thugzcation) {
      throw new NotFoundException('No Thugzcation exists yet.');
    }

    return thugzcation;
  }

  private requiredText(value: unknown, label: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${label} is required.`);
    }

    return value.trim();
  }

  private validListingUrl(value: unknown) {
    const listingUrl = this.requiredText(value, 'Listing URL');

    try {
      const url = new URL(listingUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error();
      }
    } catch {
      throw new BadRequestException('Listing URL must be a valid web address.');
    }

    return listingUrl;
  }
}
