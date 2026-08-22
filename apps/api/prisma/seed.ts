import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const thugzcation = await prisma.thugzcation.upsert({
    where: { year: 2026 },
    update: {},
    create: { year: 2026 },
  });

  const willie = await prisma.thug.upsert({
    where: { firstName: 'Willie' },
    update: process.env.THUG_WILLIE_ENTRA_OBJECT_ID
      ? { entraObjectId: process.env.THUG_WILLIE_ENTRA_OBJECT_ID }
      : {},
    create: {
      firstName: 'Willie',
      displayName: 'Willie Steel',
      entraObjectId: process.env.THUG_WILLIE_ENTRA_OBJECT_ID || null,
    },
  });

  await prisma.thug.upsert({
    where: { firstName: 'Jake' },
    update: process.env.THUG_JAKE_ENTRA_OBJECT_ID
      ? { entraObjectId: process.env.THUG_JAKE_ENTRA_OBJECT_ID }
      : {},
    create: {
      firstName: 'Jake',
      displayName: 'Jake Jarkin',
      entraObjectId: process.env.THUG_JAKE_ENTRA_OBJECT_ID || null,
    },
  });

  await prisma.thugzMansion.upsert({
    where: {
      thugzcationId_listingUrl: {
        thugzcationId: thugzcation.id,
        listingUrl: 'https://example.com/listing',
      },
    },
    update: {},
    create: {
      thugzcationId: thugzcation.id,
      title: 'Local test nomination',
      listingUrl: 'https://example.com/listing',
      summary: '',
      nominatedByThugId: willie.id,
    },
  });
}

main().finally(() => prisma.$disconnect());
