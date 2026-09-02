'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Navigation, Bookmark, AlertTriangle, Bus, Train, Footprints } from 'lucide-react';
import type { JourneySegment } from '@/stores/useJourneyStore';

interface GoogleTransitItineraryViewProps {
  segments: JourneySegment[];
  totalDuration: number;
  totalDistance: number;
  originName: string;
  destName: string;
  onClose?: () => void;
  onStart?: () => void;
  onSave?: () => void;
  onReportDelay?: () => void;
}

function ModeIcon({ mode }: { mode: string }) {
  const cls = 'w-4 h-4';
  switch (mode) {
    case 'bus': return <Bus className={cls} />;
    case 'train': return <Train className={cls} />;
    case 'metro': return <Train className={cls} />;
    default: return <Footprints className={cls} />;
  }
}

function ModeBadge({ segment }: { segment: JourneySegment }) {
  const isTransit = segment.type === 'bus' || segment.type === 'train' || segment.type === 'metro';
  if (!isTransit && segment.type !== 'walk') return null;

  if (segment.type === 'walk') {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Footprints className="w-3 h-3" />
        <span>{segment.duration}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-800">
      <ModeIcon mode={segment.type} />
      <span>{segment.operator?.split(' ')[0] || ''}</span>
    </div>
  );
}

export default function GoogleTransitItineraryView({
  segments,
  totalDuration,
  totalDistance,
  originName,
  destName,
  onClose,
  onStart,
  onSave,
  onReportDelay,
}: GoogleTransitItineraryViewProps) {
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const now = new Date();
  const arriveTime = new Date(now.getTime() + totalDuration * 60000);
  const arriveStr = arriveTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });
  const nowStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });

  const durationStr =
    totalDuration >= 60
      ? `${Math.floor(totalDuration / 60)} hr ${totalDuration % 60} min`
      : `${totalDuration} min`;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-md w-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-bold text-gray-900">{durationStr}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Arrive {arriveStr}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Mode badges ribbon */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {segments.map((seg, i) => (
            <React.Fragment key={seg.id}>
              {i > 0 && <span className="text-gray-300 text-xs">›</span>}
              <ModeBadge segment={seg} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
        {/* Origin */}
        <div className="flex items-center gap-3 py-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-200 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{originName}</p>
          </div>
          <span className="text-sm text-gray-500">{nowStr}</span>
        </div>

        {/* Segments */}
        {segments.map((seg) => {
          const isTransit = seg.type === 'bus' || seg.type === 'train' || seg.type === 'metro';
          const isExpanded = expandedSegment === seg.id;
          const stopCount = (seg as any).stopCount;

          return (
            <div key={seg.id} className="relative">
              {/* Connecting dots */}
              <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="pl-8 py-2">
                {seg.type === 'walk' ? (
                  /* Walk segment */
                  <div className="flex items-center gap-2 py-1">
                    <Footprints className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Walk {seg.duration} min ({seg.distance}m)
                    </span>
                    <div className="ml-auto p-1 bg-blue-50 rounded">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  /* Transit segment */
                  <div>
                    {/* Stop name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600 flex-shrink-0 -ml-[29px]" />
                      <p className="text-sm font-medium text-gray-900">{seg.from}</p>
                    </div>

                    {/* Transit line card */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white rounded text-xs font-bold text-gray-800 border border-gray-300">
                            {(seg as any).lineName || seg.label?.match(/\b\d+[A-Z]?\b/)?.[0] || seg.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-700">{seg.to}</span>
                        </div>
                        {seg.departure && (
                          <span className="text-sm font-medium text-gray-800">{seg.departure}</span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Scheduled · in {seg.duration} min
                      </p>

                      {/* Crowding and Accessibility badges */}
                      <div className="flex items-center gap-2 mt-2">
                        <button className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <span>👥</span> Not too crowded
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <span>♿</span> Accessibility
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Intermediate stops expander */}
                      {stopCount && stopCount > 0 && (
                        <button
                          onClick={() => setExpandedSegment(isExpanded ? null : seg.id)}
                          className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          Ride {stopCount} stops ({seg.duration} min)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Destination */}
        <div className="flex items-center gap-3 py-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-200 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{destName}</p>
          </div>
          <span className="text-sm text-gray-500">{arriveStr}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Start
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onReportDelay}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Report delay
        </button>
      </div>
    </div>
  );
}
