'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, RotateCcw } from 'lucide-react';
import { ForumVoiceNote } from '@/lib/data/forum-data';

interface ForumVoiceNotePlayerProps {
  voiceNote: ForumVoiceNote;
}

export function ForumVoiceNotePlayer({ voiceNote }: ForumVoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const duration = voiceNote.durationSec || 60;
  const progressPercent = Math.min(100, (currentSeconds / duration) * 100);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentSeconds(Math.floor(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentSeconds(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      dir="ltr"
      className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 dark:bg-[#071719] p-3 text-xs space-y-2 select-none"
    >
      <audio ref={audioRef} src={voiceNote.url} preload="none" />

      {/* Voice Badge Header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-bio-teal dark:text-emerald-300">
          <Mic className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span>تسجيل صوتي من مستر عمار 🎙️</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500 dark:text-teal-200/60">
          {formatTime(currentSeconds)} / {voiceNote.durationLabel}
        </span>
      </div>

      {/* Player Controls & Waveform Progress */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm transition active:scale-95"
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = 0;
              setCurrentSeconds(0);
            }
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          aria-label="Restart voice note"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Progress Track & Simulated Waveform */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-0.5 h-4">
            {[4, 8, 14, 10, 16, 6, 12, 18, 10, 14, 8, 16, 12, 6, 14, 18, 10, 8, 14, 12, 8, 4].map(
              (barHeight, idx) => {
                const barPercent = (idx / 22) * 100;
                const isPlayed = progressPercent >= barPercent;
                return (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-colors ${
                      isPlayed
                        ? 'bg-bio-teal dark:bg-emerald-400'
                        : 'bg-slate-300 dark:bg-teal-900/50'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              }
            )}
          </div>

          <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-[#091D20] overflow-hidden">
            <div
              className="h-full bg-bio-teal dark:bg-emerald-400 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
