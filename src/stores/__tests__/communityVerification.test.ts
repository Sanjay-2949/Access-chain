import { describe, it, expect, beforeEach } from 'vitest';
import { useJourneyStore } from '../useJourneyStore';
import { useCommunityStore } from '../useCommunityStore';

describe('Community Incentive & Verification Loop', () => {
  beforeEach(() => {
    // Reset store state
    useJourneyStore.setState({
      outages: [
        {
          id: 'test-outage-1',
          infrastructure: 'Station Lift A',
          location: 'Saidapet Metro',
          status: 'Outage',
          reportedBy: 'Traveler 1',
          reportedAt: new Date().toISOString(),
          confidence: 'Low',
          affectedSegments: [],
          votes: { up: 0, down: 0 },
          voters: [],
          crowdConfidence: 0,
        },
      ],
    });

    useCommunityStore.setState({
      contributors: [],
    });
  });

  it('records an upvote and increases crowd confidence', () => {
    const { voteOutage } = useJourneyStore.getState();
    voteOutage('test-outage-1', 'up', 'user-101');

    const updated = useJourneyStore.getState().outages[0];
    expect(updated.votes?.up).toBe(1);
    expect(updated.votes?.down).toBe(0);
    expect(updated.voters).toContain('user-101');
    expect(updated.crowdConfidence).toBeGreaterThan(0);
  });

  it('prevents duplicate votes from the same user', () => {
    const { voteOutage } = useJourneyStore.getState();
    voteOutage('test-outage-1', 'up', 'user-101');
    voteOutage('test-outage-1', 'up', 'user-101'); // duplicate

    const updated = useJourneyStore.getState().outages[0];
    expect(updated.votes?.up).toBe(1);
    expect(updated.voters?.length).toBe(1);
  });

  it('escalates confidence to High when multiple users corroborate', () => {
    const { voteOutage } = useJourneyStore.getState();
    // 15 users vote up
    for (let i = 1; i <= 15; i++) {
      voteOutage('test-outage-1', 'up', `user-${i}`);
    }

    const updated = useJourneyStore.getState().outages[0];
    expect(updated.crowdConfidence).toBeGreaterThanOrEqual(70);
    expect(updated.confidence).toBe('High');
    expect(updated.verifiedAt).toBeDefined();
  });

  it('awards points and promotes contributor through tiers (Newcomer -> Helper -> Champion -> Guardian)', () => {
    const { awardPoints } = useCommunityStore.getState();

    // 1 vote = 5 points -> Newcomer
    awardPoints('user-alpha', 'Priya', 5, 'vote');
    let contributor = useCommunityStore.getState().contributors[0];
    expect(contributor.points).toBe(5);
    expect(contributor.badge).toBe('Newcomer');
    expect(contributor.totalVotes).toBe(1);

    // Add points to cross 50 -> Helper
    awardPoints('user-alpha', 'Priya', 50, 'report');
    contributor = useCommunityStore.getState().contributors[0];
    expect(contributor.points).toBe(55);
    expect(contributor.badge).toBe('Helper');
    expect(contributor.verifiedReports).toBe(1);

    // Cross 150 -> Champion
    awardPoints('user-alpha', 'Priya', 100, 'report');
    contributor = useCommunityStore.getState().contributors[0];
    expect(contributor.points).toBe(155);
    expect(contributor.badge).toBe('Champion');

    // Cross 300 -> Guardian
    awardPoints('user-alpha', 'Priya', 150, 'verification');
    contributor = useCommunityStore.getState().contributors[0];
    expect(contributor.points).toBe(305);
    expect(contributor.badge).toBe('Guardian');
  });
});
