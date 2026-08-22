import { Test, TestingModule } from '@nestjs/testing';
import { ThugzcationController } from './thugzcation.controller';
import { ThugzcationService } from './thugzcation.service';

describe('ThugzcationController', () => {
  const view = {
    thugzcation: { id: 1, year: 2026, selectedThugzMansion: null },
    thugz: [
      { id: 1, name: 'Willie Steel' },
      { id: 2, name: 'Jake Jarkin' },
    ],
    eligibleThugzMansions: [],
  };

  let controller: ThugzcationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThugzcationController],
      providers: [
        {
          provide: ThugzcationService,
          useValue: { getThugzcation: jest.fn().mockResolvedValue(view) },
        },
      ],
    }).compile();

    controller = module.get(ThugzcationController);
  });

  it('returns the Thugzcation view', async () => {
    await expect(controller.getThugzcation()).resolves.toEqual(view);
  });
});
