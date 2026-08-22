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

  await Promise.all(
    ['Willie Steel', 'Jake Jarkin'].map((name) =>
      prisma.thug.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

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
    },
  });
}

main().finally(() => prisma.$disconnect());
