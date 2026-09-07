'use client';

import React, { useState } from 'react';
import { useJourneyStore, type OutageCategory } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { useCommunityStore, type ContributorTier } from '../stores/useCommunityStore';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GooglePlacesAutocomplete } from '../components/map/GooglePlacesAutocomplete';
import {
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Award,
  Users,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function OutageAlerts() {
  const [activeTab, setActiveTab] = useState<'reports' | 'report-form' | 'leaderboard'>('reports');
  const { outages, voteOutage } = useJourneyStore();
  const { user, notifications, markNotificationRead } = useAppStore();
  const { contributors, awardPoints } = useCommunityStore();

  const currentUserId = user?.id || 'traveler-user';
  const currentUserName = user?.name || 'Active Traveler';

  const unreadAlerts = notifications.filter((n) => !n.read && n.type === 'outage');

  const myContributorProfile = contributors.find((c) => c.userId === currentUserId);

  const handleVote = (outageId: string, vote: 'up' | 'down') => {
    voteOutage(outageId, vote, currentUserId);
    awardPoints(currentUserId, currentUserName, 5, 'vote');
  };

  const getBadgeColor = (tier: ContributorTier) => {
    switch (tier) {
      case 'Guardian':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Champion':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Helper':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* HEADER WITH USER KARMA / POINTS SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--border)]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)] flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Outage Alerts & Crowd Verification
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Real-time accessibility obstacle tracking validated by travelers on the ground.
          </p>
        </div>

        {/* User's Verification Karma Pill */}
        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] px-4 py-2.5 rounded-2xl shadow-sm self-start sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Your Verification Points
            </div>
            <div className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>{myContributorProfile?.points ?? 0} pts</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${getBadgeColor(myContributorProfile?.badge || 'Newcomer')}`}>
                {myContributorProfile?.badge || 'Newcomer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UNREAD JOURNEY NOTIFICATIONS */}
      {unreadAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--danger)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Urgent Alerts for Your Routes
          </p>
          <div className="space-y-2">
            {unreadAlerts.map((n) => (
              <Card key={n.id} className="p-3.5 border-l-4 border-l-[var(--danger)] bg-red-500/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{n.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.message}</p>
                  </div>
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded bg-[var(--card)] border border-[var(--border)] shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Live Outages & Voting</span>
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
            {outages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('report-form')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'report-form'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Obstacle (+15 pts)</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Verifier Leaderboard</span>
          {contributors.length > 0 && (
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
              {contributors.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE OUTAGES & DECENTRALIZED CROWD VOTING */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>Tap Upvote if you confirmed the issue, or Downvote if it has been repaired.</span>
            <span className="font-semibold text-emerald-500">+5 pts per vote</span>
          </div>

          {outages.map((o) => {
            const hasVoted = o.voters?.includes(currentUserId);
            const upCount = o.votes?.up ?? 0;
            const downCount = o.votes?.down ?? 0;
            const totalVotes = upCount + downCount;

            // Crowd confidence score
            const score = o.crowdConfidence ?? (o.confidence === 'High' ? 85 : o.confidence === 'Medium' ? 55 : 20);

            return (
              <Card key={o.id} className="p-5 transition-all hover:border-[var(--ring)]/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        {o.category || 'Infrastructure'}
                      </span>
                      <Badge variant={o.status === 'Operational' ? 'feasible' : o.status === 'Outage' ? 'danger' : 'unknown'}>
                        {o.status}
                      </Badge>
                      <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(o.reportedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {o.infrastructure}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {o.location}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Reported by: <strong className="text-[var(--foreground)]">{o.reportedBy}</strong>
                    </p>
                  </div>

                  {/* CROWD UPVOTE / DOWNVOTE BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0 bg-[var(--secondary)]/60 p-2 rounded-2xl border border-[var(--border)] self-start">
                    <button
                      onClick={() => handleVote(o.id, 'up')}
                      disabled={hasVoted}
                      title={hasVoted ? 'You already voted on this report' : 'Confirm outage is still active (+5 pts)'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        hasVoted
                          ? 'opacity-60 cursor-not-allowed text-[var(--muted-foreground)]'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-95'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Still Broken</span>
                      <span className="font-mono ml-0.5 bg-black/20 px-1.5 py-0.5 rounded text-[11px]">
                        {upCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleVote(o.id, 'down')}
                      disabled={hasVoted}
                      title={hasVoted ? 'You already voted on this report' : 'Report that this has been fixed (+5 pts)'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        hasVoted
                          ? 'opacity-60 cursor-not-allowed text-[var(--muted-foreground)]'
                          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 active:scale-95'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Fixed / Clear</span>
                      <span className="font-mono ml-0.5 bg-black/20 px-1.5 py-0.5 rounded text-[11px]">
                        {downCount}
                      </span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC CONFIDENCE METER */}
                <div className="mt-4 pt-3.5 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Crowd Verification Confidence:</span>
                      <strong className="text-[var(--foreground)]">{score}%</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {totalVotes === 0 ? 'Awaiting traveler votes' : `${totalVotes} crowd verification${totalVotes > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        score >= 70
                          ? 'bg-emerald-500'
                          : score >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, score)}%` }}
                    />
                  </div>

                  {/* Confidence Tier Tag */}
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span
                      className={`font-semibold ${
                        score >= 70
                          ? 'text-emerald-400'
                          : score >= 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {score >= 70
                        ? '● High Confidence — Verified by Crowd Consensus'
                        : score >= 40
                        ? '● Moderate Confidence — Community Corroborated'
                        : '● Preliminary / Single Traveler Report'}
                    </span>
                    {hasVoted && (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        You verified this (+5 pts)
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: REPORT AN ISSUE FORM */}
      {activeTab === 'report-form' && (
        <ReportIssueForm
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onSuccess={() => setActiveTab('reports')}
        />
      )}

      {/* TAB 3: COMMUNITY LEADERBOARD & INCENTIVES */}
      {activeTab === 'leaderboard' && (
        <LeaderboardView contributors={contributors} currentUserId={currentUserId} />
      )}
    </div>
  );
}

// SUBCOMPONENT: REPORT ISSUE FORM
function ReportIssueForm({
  currentUserId,
  currentUserName,
  onSuccess,
}: {
  currentUserId: string;
  currentUserName: string;
  onSuccess: () => void;
}) {
  const { addOutage } = useJourneyStore();
  const { awardPoints } = useCommunityStore();

  const [form, setForm] = useState<{
    infrastructure: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    category: OutageCategory;
  }>({
    infrastructure: '',
    location: '',
    category: 'Elevator',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.infrastructure.trim() || !form.location.trim()) return;

    // Add outage to persistent store with real coordinates from Google Maps
    addOutage({
      id: `outage-${Date.now()}`,
      infrastructure: form.infrastructure.trim(),
      location: form.location.trim(),
      coordinates: form.coordinates,
      status: 'Outage',
      category: form.category,
      reportedBy: currentUserName,
      reporterUserId: currentUserId,
      reportedAt: new Date().toISOString(),
      confidence: 'Low',
      affectedSegments: [],
      votes: { up: 1, down: 0 },
      voters: [currentUserId],
      crowdConfidence: 25,
    });

    // Award 15 points for submitting a verified infrastructure report
    awardPoints(currentUserId, currentUserName, 15, 'report');

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[var(--primary)]" />
          Report an Accessibility Hazard
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Your report alerts nearby travelers in real time and automatically re-routes journeys around broken infrastructure.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center text-emerald-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
          <h3 className="font-bold text-base">Report Published Successfully!</h3>
          <p className="text-xs text-slate-300 mt-1">
            You earned <strong>+15 verification points</strong>. Returning to live alerts...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
              Infrastructure Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as OutageCategory }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="Elevator">Elevator / Lift</option>
              <option value="Ramp">Ramp / Step-Free Path</option>
              <option value="Tactile Path">Tactile Paving / TGSI Guideway</option>
              <option value="Boarding Area">Bus / Metro Boarding Platform</option>
              <option value="Signage">Visual / Audio Signage</option>
              <option value="Other">Other Accessibility Barrier</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
              Specific Obstacle Description
            </label>
            <input
              value={form.infrastructure}
              onChange={(e) => setForm((f) => ({ ...f, infrastructure: e.target.value }))}
              placeholder="e.g. Platform 2 South Elevator out of service"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
              Station or Landmark Location (Google Maps)
            </label>
            <GooglePlacesAutocomplete
              value={form.location}
              onChange={(loc) => setForm((f) => ({ ...f, location: loc }))}
              onSelectPlace={(place) =>
                setForm((f) => ({
                  ...f,
                  location: `${place.name}${place.address ? `, ${place.address}` : ''}`,
                  coordinates: { lat: place.lat, lng: place.lng },
                }))
              }
              placeholder="Search station, bus stand, metro, or landmark via Google Maps..."
              showCurrentLocationButton={true}
            />
            {form.coordinates ? (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Google Maps Coordinates: {form.coordinates.lat.toFixed(4)}, {form.coordinates.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1.5">
                Select from verified Google Maps suggestions to allow accurate route proximity matching.
              </p>
            )}
          </div>

          <div className="bg-[var(--secondary)]/60 p-3.5 rounded-xl border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--muted-foreground)]">Submission Reward:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              +15 Karma Points
            </span>
          </div>

          <Button type="submit" fullWidth className="bg-[var(--primary)] hover:bg-[#0c9490] text-white font-bold py-2.5">
            Publish Outage Report
          </Button>
        </form>
      )}
    </Card>
  );
}

// SUBCOMPONENT: LEADERBOARD & INCENTIVES VIEW
function LeaderboardView({
  contributors,
  currentUserId,
}: {
  contributors: ReturnType<typeof useCommunityStore.getState>['contributors'];
  currentUserId: string;
}) {
  const getBadgeColor = (tier: ContributorTier) => {
    switch (tier) {
      case 'Guardian':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Champion':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Helper':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* HOW IT WORKS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-sky-500/5 border-sky-500/20">
          <div className="text-xl mb-1">🗳️</div>
          <h4 className="text-sm font-bold text-[var(--foreground)]">5 Points / Vote</h4>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Confirm or refute active obstacle alerts to help other travelers route safely.
          </p>
        </Card>

        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="text-xl mb-1">📢</div>
          <h4 className="text-sm font-bold text-[var(--foreground)]">15 Points / Report</h4>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Report newly broken lifts, damaged ramps, or obstacles directly from your journey.
          </p>
        </Card>

        <Card className="p-4 bg-purple-500/5 border-purple-500/20">
          <div className="text-xl mb-1">🛡️</div>
          <h4 className="text-sm font-bold text-[var(--foreground)]">25 Points / Consensus</h4>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Earned when your obstacle report reaches High Confidence by community agreement.
          </p>
        </Card>
      </div>

      {/* LEADERBOARD TABLE */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              Community Verifier Leaderboard
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Rankings updated live from genuine traveler contributions.
            </p>
          </div>
        </div>

        {contributors.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
            <p className="text-sm font-bold text-[var(--foreground)]">No Verifications Recorded Yet</p>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              Be the first community champion! Vote on any active outage or publish a new report to earn your Newcomer badge.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {contributors.map((c, index) => {
              const isMe = c.userId === currentUserId;
              return (
                <div
                  key={c.userId}
                  className={`py-3 flex items-center justify-between gap-3 ${
                    isMe ? 'bg-[var(--primary)]/5 -mx-5 px-5 rounded-xl font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                        <span>{c.displayName}</span>
                        {isMe && (
                          <span className="text-[10px] bg-[var(--primary)] text-white px-1.5 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-2">
                        <span>{c.totalVotes} votes</span>
                        <span>•</span>
                        <span>{c.verifiedReports} reports</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md border font-bold ${getBadgeColor(c.badge)}`}>
                      {c.badge}
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {c.points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

