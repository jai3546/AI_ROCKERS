import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma before importing the service so the test never touches a real DB.
// vi.hoisted ensures the mock object is created before vi.mock's hoisted factory
// runs, so the factory can reference it safely.
const mockLearningProfile = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    learningProfile: mockLearningProfile,
  },
}));

import {
  getLearningStyleProfile,
  saveLearningStyleProfile,
} from './db-service';

describe('getLearningStyleProfile', () => {
  beforeEach(() => {
    mockLearningProfile.findUnique.mockReset();
    mockLearningProfile.upsert.mockReset();
  });

  it('returns null when no row exists for the student', async () => {
    mockLearningProfile.findUnique.mockResolvedValue(null);
    const result = await getLearningStyleProfile('user-1');
    expect(result).toBeNull();
    expect(mockLearningProfile.findUnique).toHaveBeenCalledWith({
      where: { userId_domainType: { userId: 'user-1', domainType: 'default' } },
      select: {
        visualScore: true,
        auditoryScore: true,
        kinestheticScore: true,
        updatedAt: true,
      },
    });
  });

  it('returns the persisted scores + lastUpdated when a row exists', async () => {
    const updatedAt = new Date('2026-07-26T00:00:00.000Z');
    mockLearningProfile.findUnique.mockResolvedValue({
      visualScore: 53,
      auditoryScore: 24,
      kinestheticScore: 23,
      updatedAt,
    });
    const result = await getLearningStyleProfile('user-1', 'main');
    expect(result).toEqual({
      visualScore: 53,
      auditoryScore: 24,
      kinestheticScore: 23,
      lastUpdated: updatedAt,
    });
  });

  it('passes through the custom domainType', async () => {
    mockLearningProfile.findUnique.mockResolvedValue(null);
    await getLearningStyleProfile('user-2', 'special');
    expect(mockLearningProfile.findUnique.mock.calls[0]?.[0]).toMatchObject({
      where: {
        userId_domainType: { userId: 'user-2', domainType: 'special' },
      },
    });
  });

  it('defaults domainType to "default" when omitted', async () => {
    mockLearningProfile.findUnique.mockResolvedValue(null);
    await getLearningStyleProfile('user-3');
    const arg = mockLearningProfile.findUnique.mock.calls[0]?.[0];
    expect(arg.where.userId_domainType.domainType).toBe('default');
  });
});

describe('saveLearningStyleProfile', () => {
  beforeEach(() => {
    mockLearningProfile.upsert.mockReset();
  });

  it('calls upsert with clamped + rounded scores and the default domainType', async () => {
    mockLearningProfile.upsert.mockResolvedValue({
      updatedAt: new Date('2026-07-26T00:00:00.000Z'),
    });
    const result = await saveLearningStyleProfile('user-1', {
      visualScore: 52.7,
      auditoryScore: 24.2,
      kinestheticScore: 23.1,
    });
    expect(result.lastUpdated).toEqual(new Date('2026-07-26T00:00:00.000Z'));
    expect(mockLearningProfile.upsert).toHaveBeenCalledWith({
      where: { userId_domainType: { userId: 'user-1', domainType: 'default' } },
      update: {
        visualScore: 53,
        auditoryScore: 24,
        kinestheticScore: 23,
      },
      create: {
        userId: 'user-1',
        domainType: 'default',
        visualScore: 53,
        auditoryScore: 24,
        kinestheticScore: 23,
      },
      select: { updatedAt: true },
    });
  });

  it('clamps scores above 100 down to 100', async () => {
    mockLearningProfile.upsert.mockResolvedValue({
      updatedAt: new Date(),
    });
    await saveLearningStyleProfile('user-1', {
      visualScore: 150,
      auditoryScore: -10,
      kinestheticScore: 50,
    });
    const arg = mockLearningProfile.upsert.mock.calls[0]?.[0];
    expect(arg.update.visualScore).toBe(100);
    expect(arg.update.auditoryScore).toBe(0);
    expect(arg.update.kinestheticScore).toBe(50);
  });

  it('clamps negative scores to 0', async () => {
    mockLearningProfile.upsert.mockResolvedValue({ updatedAt: new Date() });
    await saveLearningStyleProfile('user-1', {
      visualScore: -5,
      auditoryScore: -100,
      kinestheticScore: -50,
    });
    const arg = mockLearningProfile.upsert.mock.calls[0]?.[0];
    expect(arg.update).toEqual({
      visualScore: 0,
      auditoryScore: 0,
      kinestheticScore: 0,
    });
    expect(arg.create).toEqual({
      userId: 'user-1',
      domainType: 'default',
      visualScore: 0,
      auditoryScore: 0,
      kinestheticScore: 0,
    });
  });

  it('passes through a custom domainType to both upsert branches', async () => {
    mockLearningProfile.upsert.mockResolvedValue({ updatedAt: new Date() });
    await saveLearningStyleProfile(
      'user-1',
      { visualScore: 50, auditoryScore: 30, kinestheticScore: 20 },
      'special',
    );
    const arg = mockLearningProfile.upsert.mock.calls[0]?.[0];
    expect(arg.where.userId_domainType.domainType).toBe('special');
    expect(arg.create.domainType).toBe('special');
  });

  it('rounds a 0.5 X.5 correctly with Math.round', async () => {
    mockLearningProfile.upsert.mockResolvedValue({ updatedAt: new Date() });
    await saveLearningStyleProfile('user-1', {
      visualScore: 33.5,
      auditoryScore: 33.4,
      kinestheticScore: 33.6,
    });
    const arg = mockLearningProfile.upsert.mock.calls[0]?.[0];
    expect(arg.update.visualScore).toBe(34);
    expect(arg.update.auditoryScore).toBe(33);
    expect(arg.update.kinestheticScore).toBe(34);
  });
});
