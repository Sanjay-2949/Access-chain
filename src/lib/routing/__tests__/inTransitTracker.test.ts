import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateDistanceMeters,
  detectInTransitHazard,
  playAudibleChimeAlert,
  speakVoiceGuidance,
  triggerHapticAlert,
} from '../inTransitTracker';
import type { JourneySegment, Outage } from '@/stores/useJourneyStore';

describe('In-Transit GPS Tracking & Outage Hazard Detector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates Haversine distance accurately between known coordinates', () => {
    // Chennai Central to MA Chidambaram Stadium (~3km)
    const dist = calculateDistanceMeters(13.0827, 80.2707, 13.0582, 80.2793);
    expect(dist).toBeGreaterThan(2500);
    expect(dist).toBeLessThan(3500);

    // Identical point distance should be 0
    expect(calculateDistanceMeters(13.0827, 80.2707, 13.0827, 80.2707)).toBe(0);
  });

  it('detects upcoming outage hazard when user approaches affected segment', () => {
    const mockSegments: JourneySegment[] = [
      {
        id: 'seg-walk-1',
        type: 'walk',
        label: 'Walk to Station Entrance',
        from: 'Origin',
        to: 'Gate 4',
        duration: 3,
        accessibility: 'ACCESSIBLE',
        warnings: [],
        confidence: 95,
        dataSource: 'LIVE',
        startCoordinates: { lat: 13.0820, lng: 80.2700 },
        endCoordinates: { lat: 13.0825, lng: 80.2705 },
      },
      {
        id: 'seg-elevator-gate4',
        type: 'elevator',
        label: 'Gate 4 Station Elevator',
        from: 'Gate 4 Entrance',
        to: 'Platform 1',
        duration: 2,
        accessibility: 'ACCESSIBLE',
        warnings: [],
        confidence: 90,
        dataSource: 'LIVE',
        startCoordinates: { lat: 13.0826, lng: 80.2706 },
        endCoordinates: { lat: 13.0827, lng: 80.2707 },
      },
      {
        id: 'seg-metro-1',
        type: 'metro',
        label: 'Metro Transit Line',
        from: 'Platform 1',
        to: 'Destination Terminal',
        duration: 15,
        accessibility: 'ACCESSIBLE',
        warnings: [],
        confidence: 98,
        dataSource: 'LIVE',
        startCoordinates: { lat: 13.0827, lng: 80.2707 },
        endCoordinates: { lat: 13.0582, lng: 80.2793 },
      },
    ];

    const mockOutages: Outage[] = [
      {
        id: 'outage-gate4',
        infrastructure: 'Gate 4 Station Elevator',
        location: 'Chennai Central',
        status: 'Outage',
        reportedBy: 'Station Staff',
        reportedAt: new Date().toISOString(),
        confidence: 'High',
        affectedSegments: ['seg-elevator-gate4'],
        coordinates: { lat: 13.0826, lng: 80.2706 },
      },
    ];

    // User is at Gate 4 (lat: 13.0825, lng: 80.2705) - within 30m of elevator
    const alert = detectInTransitHazard(
      13.0825,
      80.2705,
      mockSegments,
      0, // Currently on step 0, approaching step 1
      mockOutages,
      250 // Proximity threshold
    );

    expect(alert).not.toBeNull();
    expect(alert?.outageId).toBe('outage-gate4');
    expect(alert?.affectedSegmentId).toBe('seg-elevator-gate4');
    expect(alert?.message).toContain('OUT OF SERVICE');
    expect(alert?.suggestedAlternative.segment.type).toBe('ramp');
    expect(alert?.suggestedAlternative.segment.label).toContain('Gate 5 Ramp');
    expect(alert?.suggestedAlternative.segment.accessibility).toBe('ACCESSIBLE');
  });

  it('does not trigger alert if outage is operational or resolved', () => {
    const mockSegments: JourneySegment[] = [
      {
        id: 'seg-elevator-gate4',
        type: 'elevator',
        label: 'Gate 4 Elevator',
        from: 'Entrance',
        to: 'Platform',
        duration: 2,
        accessibility: 'ACCESSIBLE',
        warnings: [],
        confidence: 90,
        dataSource: 'LIVE',
        startCoordinates: { lat: 13.0826, lng: 80.2706 },
      },
    ];

    const resolvedOutages: Outage[] = [
      {
        id: 'outage-gate4',
        infrastructure: 'Gate 4 Elevator',
        location: 'Chennai Central',
        status: 'Operational', // Resolved
        reportedBy: 'Station Staff',
        reportedAt: new Date().toISOString(),
        confidence: 'High',
        affectedSegments: ['seg-elevator-gate4'],
        coordinates: { lat: 13.0826, lng: 80.2706 },
      },
    ];

    const alert = detectInTransitHazard(13.0826, 80.2706, mockSegments, 0, resolvedOutages, 250);
    expect(alert).toBeNull();
  });

  it('executes audio, speech, and haptic functions safely without throwing', () => {
    expect(() => playAudibleChimeAlert()).not.toThrow();
    expect(() => speakVoiceGuidance('Test warning message')).not.toThrow();
    expect(() => triggerHapticAlert()).not.toThrow();
  });
});
