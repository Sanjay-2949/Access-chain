import {
  VerificationStatus,
  StalenessTier,
  CONFIDENCE_CEILINGS,
  TEMPORAL_DECAY_FACTORS,
} from '../places/types';

export class TemporalService {
  /**
   * Calculate age in days from an ISO date string
   */
  public static calculateAgeInDays(isoDate?: string): number {
    if (!isoDate) return 999;
    const parsed = new Date(isoDate).getTime();
    if (isNaN(parsed)) return 999;
    const diffMs = Math.max(0, Date.now() - parsed);
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine staleness tier based on elapsed days since last physical verification
   */
  public static getStalenessTier(ageInDays: number): StalenessTier {
    if (ageInDays < 180) return 'FRESH';     // < 6 months
    if (ageInDays < 365) return 'AGING';     // 6 - 12 months
    if (ageInDays < 730) return 'STALE';     // 1 - 2 years
    return 'EXPIRED';                        // > 2 years
  }

  /**
   * Calculate effective routing confidence applying provenance ceiling and temporal decay
   */
  public static calculateEffectiveConfidence(
    rawConfidence: number,
    status: VerificationStatus,
    ageInDays: number
  ): { baseConfidence: number; effectiveConfidence: number; stalenessTier: StalenessTier } {
    const ceiling = CONFIDENCE_CEILINGS[status] || 30;
    const baseConfidence = Math.min(rawConfidence, ceiling);
    const stalenessTier = this.getStalenessTier(ageInDays);
    const decayFactor = TEMPORAL_DECAY_FACTORS[stalenessTier];
    const effectiveConfidence = Math.round(baseConfidence * decayFactor * 10) / 10;

    return {
      baseConfidence,
      effectiveConfidence,
      stalenessTier,
    };
  }
}
