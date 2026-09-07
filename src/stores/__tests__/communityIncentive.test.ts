import { describe, it, expect, beforeEach } from 'vitest';
import { useJourneyStore } from '../useJourneyStore';
import { useAppStore } from '../useAppStore';

describe('Community Incentive & Verification Loop', () => {
  beforeEach(() => {
    // Reset stores to default states
    useJourneyStore.setState({
      outages: [
        {
          id: 'test-outage-1',
          infrastructure: 'Gate 4 Elevator',
          location: 'Chennai Central Station',
          status: 'Outage',
          reportedBy: 'Station Staff',
          reportedAt: new Date().toISOString(),
          confidence: 'Medium',
          confidenceScore: 67,
          upvotes: 3,
          downvotes: 1,
          category: 'ELEVATOR',
          verifiedByCrowd: true,
          affectedSegments: ['seg-test-1'],
        },
      ],
    });

    useAppStore.setState({
      accessPoints: 150,
      badges: ['Community Scout'],
      notifications: [],
    });
  });

  it('Traveler Upvoting: increments upvotes and increases consensus confidence score', () => {
    const store = useJourneyStore.getState();
    store.voteOutage('test-outage-1', 'CONFIRM_OUTAGE', 'traveler-user-1');

    const updated = useJourneyStore.getState().outages.find((o) => o.id === 'test-outage-1');
    expect(updated).toBeDefined();
    expect(updated?.upvotes).toBe(4);
    expect(updated?.confidenceScore).toBeGreaterThanOrEqual(70);
    expect(updated?.status).toBe('Outage');
  });

  it('Traveler Downvoting & Consensus: switching votes to REPORT_FIXED reduces score', () => {
    const store = useJourneyStore.getState();
    store.voteOutage('test-outage-1', 'REPORT_FIXED', 'traveler-user-1');

    const updated = useJourneyStore.getState().outages.find((o) => o.id === 'test-outage-1');
    expect(updated).toBeDefined();
    expect(updated?.downvotes).toBe(2);
    expect(updated?.confidenceScore).toBeLessThan(67);
  });

  it('Automated Consensus Transition: multiple fixed reports automatically transition status to Operational', () => {
    const store = useJourneyStore.getState();

    // Cast 4 successive crowd verification votes reporting equipment is working
    store.voteOutage('test-outage-1', 'REPORT_FIXED', 'user-1');
    store.voteOutage('test-outage-1', 'REPORT_FIXED', 'user-2');
    store.voteOutage('test-outage-1', 'REPORT_FIXED', 'user-3');
    store.voteOutage('test-outage-1', 'REPORT_FIXED', 'user-4');

    const updated = useJourneyStore.getState().outages.find((o) => o.id === 'test-outage-1');
    expect(updated).toBeDefined();
    // Confidence score should have dropped below 45% threshold
    expect(updated?.confidenceScore).toBeLessThanOrEqual(45);
    expect(updated?.status).toBe('Operational');
    expect(updated?.verifiedAt).toBeDefined();
  });

  it('AccessPoints Reward Token Loop: awards points and unlocks milestone badges', () => {
    const appStore = useAppStore.getState();
    expect(appStore.accessPoints).toBe(150);

    // Award +25 points for reporting infrastructure
    appStore.awardPoints(25, 'Reported broken ramp');
    expect(useAppStore.getState().accessPoints).toBe(175);

    // Award +30 points: exceeds 200 pts milestone, unlocking 'Verified Pathfinder'
    appStore.awardPoints(30, 'Verified multiple transit elevators');
    const state200 = useAppStore.getState();
    expect(state200.accessPoints).toBe(205);
    expect(state200.badges).toContain('Verified Pathfinder');

    // Award +100 points: exceeds 300 pts milestone, unlocking 'Chennai Transit Guardian'
    appStore.awardPoints(100, 'Consensus reached on 5 community audits');
    const state300 = useAppStore.getState();
    expect(state300.accessPoints).toBe(305);
    expect(state300.badges).toContain('Chennai Transit Guardian');
  });
});
