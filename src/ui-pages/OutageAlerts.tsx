'use client';

import React, { useState } from 'react';
import { useJourneyStore, type OutageCategory } from '../stores/useJourneyStore';
import { useAppStore } from '../stores/useAppStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Coins,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function OutageAlerts() {
  const { outages, voteOutage, addOutage } = useJourneyStore();
  const { notifications, markNotificationRead, accessPoints, badges, awardPoints } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'outage' | 'operational'>('all');
  const [justVotedId, setJustVotedId] = useState<string | null>(null);

  const unread = notifications.filter((n) => !n.read && n.type === 'outage');

  const filteredOutages = outages.filter((o) => {
    if (filter === 'outage') return o.status === 'Outage';
    if (filter === 'operational') return o.status === 'Operational';
    return true;
  });

  const handleVote = (
    outageId: string,
    voteType: 'CONFIRM_OUTAGE' | 'REPORT_FIXED',
    infrastructure: string
  ) => {
    voteOutage(outageId, voteType, 'user-me');
    awardPoints(
      10,
      `Crowd verification submitted for ${infrastructure}`
    );
    setJustVotedId(outageId);
    setTimeout(() => setJustVotedId(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* HEADER & INCENTIVE WALLET BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-display font-bold text-white">
                Crowd-Verification Hub
              </h1>
              <p className="text-xs text-slate-400">
                Decentralized infrastructure consensus & community accessibility tracking
              </p>
            </div>
          </div>
        </div>

        {/* AccessPoints Wallet */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/40 px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
            <div>
              <div className="text-sm font-bold text-amber-300 font-mono">
                {accessPoints} <span className="text-[10px] text-amber-400/80">PTS</span>
              </div>
              <div className="text-[10px] text-slate-400">AccessPoints Balance</div>
            </div>
          </div>
          <div className="text-right pl-3 border-l border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              {badges[badges.length - 1] || 'Community Scout'}
            </span>
            <span className="text-[9px] text-slate-400">Tier Status</span>
          </div>
        </div>
      </div>

      {/* UNREAD NOTIFICATIONS */}
      {unread.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Urgent Alerts on Your Planned Routes
          </p>
          <div className="space-y-2">
            {unread.map((n) => (
              <Card key={n.id} className="p-4 border-l-4 border-l-red-500 bg-red-950/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                  </div>
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          {(['all', 'outage', 'operational'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === t
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {t === 'all'
                ? `All Reports (${outages.length})`
                : t === 'outage'
                ? `Active Outages (${outages.filter((o) => o.status === 'Outage').length})`
                : `Verified Operational (${outages.filter((o) => o.status === 'Operational').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* OUTAGE VERIFICATION CARDS LIST */}
      <div className="space-y-4">
        {filteredOutages.map((o) => {
          const userVote = o.voters?.['user-me'];
          const totalVotes = (o.upvotes || 0) + (o.downvotes || 0);
          const score = o.confidenceScore ?? (o.confidence === 'High' ? 85 : 60);

          return (
            <Card
              key={o.id}
              className={`p-5 transition-all border ${
                o.status === 'Outage'
                  ? 'border-red-500/30 hover:border-red-500/50 bg-slate-900/80'
                  : 'border-emerald-500/30 hover:border-emerald-500/50 bg-slate-900/80'
              }`}
            >
              {/* Top row: Category, Title, Status */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                      {o.category || 'INFRASTRUCTURE'}
                    </span>
                    {o.verifiedByCrowd && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Decentralized Crowd-Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {o.infrastructure}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {o.location}
                  </p>
                </div>

                <Badge
                  variant={o.status === 'Operational' ? 'feasible' : 'danger'}
                  size="md"
                >
                  {o.status === 'Operational' ? 'Fixed / Operational' : 'Out of Service'}
                </Badge>
              </div>

              {/* Consensus Meter Bar */}
              <div className="my-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Consensus Confidence Score
                  </span>
                  <span className="font-mono font-bold text-sky-400">{score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      o.status === 'Operational'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : score >= 75
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-sky-500 to-amber-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>
                    Confirmations: <strong className="text-red-400">{o.upvotes || 0}</strong> broken
                  </span>
                  <span>
                    Validations: <strong className="text-emerald-400">{o.downvotes || 0}</strong> working
                  </span>
                  <span>Total votes: {totalVotes}</span>
                </div>
              </div>

              {/* Metadata Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mb-3.5">
                <div>
                  <span className="text-slate-500 block">Reported By:</span>
                  <span className="text-slate-300 font-medium">{o.reportedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reported At:</span>
                  <span className="text-slate-300 font-medium">
                    {new Date(o.reportedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {o.verifiedAt && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">Crowd Restored At:</span>
                    <span className="text-emerald-400 font-medium">
                      {new Date(o.verifiedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Traveler Voting Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {userVote ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      You voted: {userVote === 'CONFIRM_OUTAGE' ? 'Broken' : 'Working / Fixed'}
                    </span>
                  ) : (
                    'Are you near this station? Cast your verification vote to earn +10 PTS:'
                  )}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(o.id, 'CONFIRM_OUTAGE', o.infrastructure)}
                    className={`flex-1 sm:flex-none border-red-500/40 hover:bg-red-500/10 text-red-300 text-xs gap-1.5 ${
                      userVote === 'CONFIRM_OUTAGE' ? 'bg-red-500/20 border-red-500 font-bold' : ''
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                    <span>Still Broken</span>
                    <span className="text-[10px] text-red-400/80">(+10 PTS)</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(o.id, 'REPORT_FIXED', o.infrastructure)}
                    className={`flex-1 sm:flex-none border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 text-xs gap-1.5 ${
                      userVote === 'REPORT_FIXED' ? 'bg-emerald-500/20 border-emerald-500 font-bold' : ''
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fixed & Working</span>
                    <span className="text-[10px] text-emerald-400/80">(+10 PTS)</span>
                  </Button>
                </div>
              </div>

              {/* Feedback toast on vote */}
              {justVotedId === o.id && (
                <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                  <span>Vote registered! Your decentralized verification updated the route consensus.</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1 font-mono">
                    <Coins className="w-3.5 h-3.5" /> +10 PTS
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* REPORT AN ISSUE FORM WITH POINTS REWARD */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white">Report New Infrastructure Issue</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Report broken elevators, steep ramps, or locked gates. Every verified report earns{' '}
          <strong className="text-amber-400 font-mono">+25 AccessPoints</strong>.
        </p>
        <ReportForm />
      </div>
    </div>
  );
}

function ReportForm() {
  const { addOutage } = useJourneyStore();
  const { awardPoints } = useAppStore();
  const [form, setForm] = useState({
    infrastructure: '',
    location: '',
    category: 'ELEVATOR' as OutageCategory,
    notes: '',
  });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOutage({
      id: `outage-${Date.now()}`,
      infrastructure: form.infrastructure,
      location: form.location,
      category: form.category,
      status: 'Outage',
      reportedBy: 'You (Traveler Report)',
      reportedAt: new Date().toISOString(),
      confidence: 'Medium',
      confidenceScore: 70,
      upvotes: 1,
      downvotes: 0,
      verifiedByCrowd: true,
      affectedSegments: [],
    });

    awardPoints(25, `Reported ${form.infrastructure} at ${form.location}`);
    setDone(true);
    setForm({ infrastructure: '', location: '', category: 'ELEVATOR', notes: '' });
  };

  if (done) {
    return (
      <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Report submitted for crowd verification! Thank you for contributing.</span>
        </div>
        <span className="font-bold text-amber-300 font-mono flex items-center gap-1">
          <Coins className="w-4 h-4" /> +25 PTS
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Infrastructure Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as OutageCategory })}
            className="w-full px-3 py-2 border border-slate-700 rounded-xl text-sm bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ELEVATOR">Elevator / Lift</option>
            <option value="RAMP">Step-Free Ramp</option>
            <option value="TACTILE_PATH">TGSI Tactile Guideway</option>
            <option value="HYDRAULIC_LIFT">Hydraulic Bus / Train Lift</option>
            <option value="PLATFORM_GAP">Platform Boarding Gap</option>
            <option value="GENERAL">General Access Barrier</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Equipment / Location Details
          </label>
          <input
            value={form.infrastructure}
            onChange={(e) => setForm({ ...form, infrastructure: e.target.value })}
            placeholder="e.g. Gate 2 Concourse Elevator"
            className="w-full px-3 py-2 border border-slate-700 rounded-xl text-sm bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1">Station or Landmark</label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Guindy Metro Station / Chennai Central"
          className="w-full px-3 py-2 border border-slate-700 rounded-xl text-sm bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" size="md">
          Submit Report (+25 PTS)
        </Button>
      </div>
    </form>
  );
}

