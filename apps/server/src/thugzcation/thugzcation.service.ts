import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type ThugzMansionInput = {
  title: string;
  listingUrl: string;
  summary: string;
  location?: string | null;
  bedrooms?: number | null;
};

@Injectable()
export class ThugzcationService {
  constructor(private readonly prisma: PrismaService) {}

  async getThugzcation() {
    const thugzcation = await this.getCurrentThugzcation();

    return {
      thugzcation: {
        id: thugzcation.id,
        year: thugzcation.year,
        selectedThugzMansion: thugzcation.selectedThugzMansion
          ? this.publicMansion(thugzcation.selectedThugzMansion)
          : null,
      },
      eligibleThugzMansions: thugzcation.eligibleThugzMansions.map((mansion) =>
        this.publicMansion(mansion),
      ),
    };
  }

  async addThugzMansion(nominatedByThugId: number, request: ThugzMansionInput) {
    const mansion = this.validMansion(request);
    const thugzcation = await this.getCurrentThugzcation();

    const existingMansion = await this.prisma.thugzMansion.findUnique({
      where: {
        thugzcationId_listingUrl: {
          thugzcationId: thugzcation.id,
          listingUrl: mansion.listingUrl,
        },
      },
    });

    if (existingMansion) {
      throw new ConflictException('That listing is already eligible.');
    }

    const createdMansion = await this.prisma.thugzMansion.create({
      data: {
        thugzcationId: thugzcation.id,
        ...mansion,
        nominatedByThugId,
      },
    });

    return this.publicMansion(createdMansion);
  }

  async updateThugzMansion(mansionId: number, request: ThugzMansionInput) {
    const mansion = this.validMansion(request);
    const thugzcation = await this.getCurrentThugzcation();
    await this.requireMansion(mansionId, thugzcation.id);

    const duplicateListing = await this.prisma.thugzMansion.findFirst({
      where: {
        thugzcationId: thugzcation.id,
        listingUrl: mansion.listingUrl,
        NOT: { id: mansionId },
      },
    });

    if (duplicateListing) {
      throw new ConflictException('That listing is already eligible.');
    }

    const updatedMansion = await this.prisma.thugzMansion.update({
      where: { id: mansionId },
      data: mansion,
    });

    return this.publicMansion(updatedMansion);
  }

  async deleteThugzMansion(mansionId: number) {
    const thugzcation = await this.getCurrentThugzcation();
    await this.requireMansion(mansionId, thugzcation.id);

    const deletedMansion = await this.prisma.thugzMansion.delete({
      where: { id: mansionId },
    });

    return this.publicMansion(deletedMansion);
  }

  private publicMansion(mansion: {
    id: number;
    title: string;
    listingUrl: string;
    summary: string;
    location: string | null;
    bedrooms: number | null;
  }) {
    return {
      id: mansion.id,
      title: mansion.title,
      listingUrl: mansion.listingUrl,
      summary: mansion.summary,
      location: mansion.location,
      bedrooms: mansion.bedrooms,
    };
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

  private async requireMansion(mansionId: number, thugzcationId: number) {
    const mansion = await this.prisma.thugzMansion.findFirst({
      where: { id: mansionId, thugzcationId },
      select: { id: true },
    });

    if (!mansion) {
      throw new NotFoundException('Thugz Mansion not found.');
    }
  }

  private validMansion(request: ThugzMansionInput) {
    return {
      title: this.requiredText(request.title, 'Title'),
      listingUrl: this.validListingUrl(request.listingUrl),
      summary: this.requiredText(request.summary, 'Summary'),
      location: this.optionalText(request.location, 'Location'),
      bedrooms: this.optionalWholeNumber(request.bedrooms, 'Bedrooms'),
    };
  }

  private requiredText(value: unknown, label: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${label} is required.`);
    }

    return value.trim();
  }

  private optionalText(value: unknown, label: string) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${label} must be text.`);
    }

    return value.trim() || null;
  }

  private optionalWholeNumber(value: unknown, label: string) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new BadRequestException(`${label} must be a whole number.`);
    }

    return value;
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
