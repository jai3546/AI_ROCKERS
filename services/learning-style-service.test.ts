import { describe, it, expect } from 'vitest';
import { updateLearningStyleProfile, initialLearningStyleProfile } from './learning-style-service';

describe('updateLearningStyleProfile', () => {
  it('equal scores -> unknown', () => {
    const profile = updateLearningStyleProfile(initialLearningStyleProfile, {});
    expect(profile.primaryStyle).toBe('unknown');
    expect(profile.secondaryStyle).toBe('unknown');
  });

  it('visual dominant input -> visual', () => {
    const profile = updateLearningStyleProfile(initialLearningStyleProfile, {
      imageInteractions: 50,
      videoInteractions: 30
    });
    expect(profile.primaryStyle).toBe('visual');
  });

  it('normalized scores sum to 100', () => {
    const profile = updateLearningStyleProfile(initialLearningStyleProfile, {
      videoInteractions: 10,
      audioInteractions: 5,
      practicalInteractions: 20
    });
    const sum = profile.visualScore + profile.auditoryScore + profile.kinestheticScore;
    expect(Math.abs(sum - 100)).toBeLessThanOrEqual(2);
  });
});
