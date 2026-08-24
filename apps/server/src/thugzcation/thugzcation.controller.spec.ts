import { Test, TestingModule } from '@nestjs/testing';
import { ThugAuthGuard } from '../auth/thug-auth.guard';
import { ThugzcationController } from './thugzcation.controller';
import { ThugzcationService } from './thugzcation.service';

describe('ThugzcationController', () => {
  const view = {
    thugzcation: { id: 1, year: 2026, selectedThugzMansion: null },
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
    })
      .overrideGuard(ThugAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get(ThugzcationController);
  });

  it('returns the Thugzcation view', async () => {
    await expect(controller.getThugzcation()).resolves.toEqual(view);
  });
});
