'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, Minimize2, Gauge, Settings } from 'lucide-react';

export interface VideoPlayerControlsProps {
  isPlaying: boolean; isMuted: boolean; volume: number; currentTime: number; duration: number;
  playbackRate: number; quality: string; isFullscreen: boolean; isVisible?: boolean;
  onTogglePlay: () => void; onSeek: (newTimeSec: number) => void; onSkip: (deltaSec: number) => void;
  onToggleMute: () => void; onVolumeChange: (newVol: number) => void;
  onPlaybackRateChange: (rate: number) => void; onQualityChange: (q: string) => void;
  onToggleFullscreen: () => void;
}

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITY_OPTIONS = ['1080p FHD', '720p HD', '480p', 'تلقائي'];

export function formatVideoTime(sec: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function VideoPlayerControls({
  isPlaying, isMuted, volume, currentTime, duration, playbackRate, quality, isFullscreen, isVisible = true,
  onTogglePlay, onSeek, onSkip, onToggleMute, onVolumeChange, onPlaybackRateChange, onQualityChange, onToggleFullscreen,
}: VideoPlayerControlsProps) {
  const [openMenu, setOpenMenu] = useState<'speed' | 'quality' | null>(null);
  const safeDuration = Math.max(1, duration);
  const isEnded = duration > 0 && currentTime >= duration;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  useEffect(() => {
    setOpenMenu(null);
  }, [isFullscreen]);

  return (
    <>
      {openMenu && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpenMenu(null)} onTouchStart={() => setOpenMenu(null)} />
      )}
      <div
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-1 pt-3 pb-1 sm:px-3 sm:pt-6 sm:pb-3 text-white select-none transition-opacity duration-300 ${
          isVisible || openMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Interactive Seek Bar */}
        <div className="group/bar relative mb-1 sm:mb-2 flex items-center px-0.5 sm:px-1">
          <div className="relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="pointer-events-none absolute h-3 w-3 sm:h-4 sm:w-4 -translate-x-1/2 rounded-full bg-emerald-400 shadow-md ring-2 ring-white transition-transform group-hover/bar:scale-125" style={{ left: `${progressPercent}%` }} />
          <input
            type="range" min={0} max={safeDuration} step={0.1} value={Math.min(currentTime, safeDuration)}
            onChange={(e) => onSeek(Number(e.target.value))} aria-label="شريط تقديم وتأخير الفيديو"
            className="absolute inset-0 -top-2 h-7 w-full cursor-pointer opacity-0"
          />
        </div>

        {/* Responsive Non-Wrapping Row */}
        <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full flex-nowrap min-w-0">
          {/* Left Transport */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink min-w-0">
            <button
              type="button" onClick={onTogglePlay}
              className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition active:scale-95 shadow-sm shrink-0"
              aria-label={isEnded ? 'إعادة التشغيل' : isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isEnded ? <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" /> : isPlaying ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" />}
            </button>
            <button
              type="button" onClick={() => onSkip(-10)}
              className="flex items-center gap-0.5 rounded-lg px-0.5 sm:px-1.5 py-1 text-[9px] sm:text-[11px] font-bold text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0"
              title="إرجاع 10 ثواني"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /><span>-10s</span>
            </button>
            <button
              type="button" onClick={() => onSkip(10)}
              className="flex items-center gap-0.5 rounded-lg px-0.5 sm:px-1.5 py-1 text-[9px] sm:text-[11px] font-bold text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0"
              title="تقديم 10 ثواني"
            >
              <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /><span>+10s</span>
            </button>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={onToggleMute} className="rounded-lg p-0.5 sm:p-1 text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0" aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}>
                {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))} aria-label="مستوى الصوت"
                className="hidden lg:block w-12 xl:w-16 accent-emerald-400 cursor-pointer h-1"
              />
            </div>
            <div className="font-mono text-[9px] sm:text-[11px] md:text-xs font-bold text-slate-200 whitespace-nowrap shrink-0">
              <span className="text-emerald-400">{formatVideoTime(currentTime)}</span><span className="mx-0.5 text-white/40">/</span><span>{formatVideoTime(safeDuration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="relative flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* Speed Selector */}
            <div className={`relative ${isFullscreen ? 'block' : 'hidden sm:block'}`}>
              <button
                type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'speed' ? null : 'speed'); }}
                className="inline-flex items-center gap-0.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-1 sm:px-2 py-1 text-[9px] sm:text-xs font-bold transition active:scale-95 shrink-0"
                aria-label="سرعة التشغيل"
              >
                <Gauge className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" /><span>{playbackRate}x</span>
              </button>
              {openMenu === 'speed' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-28 rounded-xl border border-teal-500/30 bg-[#091D20]/95 p-1.5 shadow-2xl backdrop-blur-md z-50 max-h-32 sm:max-h-52 overflow-y-auto"
                >
                  <div className="px-2 py-0.5 text-[10px] font-bold text-teal-300/70 border-b border-white/10 mb-1 text-center">سرعة التشغيل</div>
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate} type="button" onClick={() => { onPlaybackRateChange(rate); setOpenMenu(null); }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-bold transition ${playbackRate === rate ? 'bg-emerald-600 text-white' : 'text-slate-200 hover:bg-white/10'}`}
                    >
                      <span>{rate}x</span>{rate === 1 && <span className="text-[10px] opacity-75">عادي</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Selector */}
            <div className={`relative ${isFullscreen ? 'block' : 'hidden sm:block'}`}>
              <button
                type="button" onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'quality' ? null : 'quality'); }}
                className="inline-flex items-center gap-0.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-1 sm:px-2 py-1 text-[9px] sm:text-xs font-bold transition active:scale-95 shrink-0"
                aria-label="جودة الفيديو"
              >
                <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 shrink-0" /><span>{quality.split(' ')[0]}</span>
              </button>
              {openMenu === 'quality' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full mb-1.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-32 rounded-xl border border-teal-500/30 bg-[#091D20]/95 p-1.5 shadow-2xl backdrop-blur-md z-50 max-h-32 sm:max-h-52 overflow-y-auto"
                >
                  <div className="px-2 py-0.5 text-[10px] font-bold text-teal-300/70 border-b border-white/10 mb-1 text-center">جودة العرض</div>
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q} type="button" onClick={() => { onQualityChange(q); setOpenMenu(null); }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-bold transition ${quality === q ? 'bg-emerald-600 text-white' : 'text-slate-200 hover:bg-white/10'}`}
                    >
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button" onClick={onToggleFullscreen}
              className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition active:scale-95 shrink-0"
              aria-label={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
