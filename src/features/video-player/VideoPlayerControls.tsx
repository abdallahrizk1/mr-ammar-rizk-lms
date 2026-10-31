'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastThrottledSeekRef = useRef<number>(0);

  const safeDuration = Math.max(1, duration);
  const isEnded = duration > 0 && currentTime >= duration;
  const activeTime = isScrubbing && scrubTime !== null ? scrubTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (activeTime / safeDuration) * 100));

  const commitSeek = useCallback((time: number) => {
    lastThrottledSeekRef.current = Date.now();
    const clamped = Math.max(0, Math.min(safeDuration, time));
    onSeek(clamped);
    setIsScrubbing(false);
    setTimeout(() => setScrubTime(null), 80);
  }, [onSeek, safeDuration]);

  const calculateTimeFromPointer = useCallback((clientX: number): number => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (offsetX / rect.width) * safeDuration;
  }, [safeDuration]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsScrubbing(true);
    setScrubTime(calculateTimeFromPointer(e.clientX));
  }, [calculateTimeFromPointer]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    const newTime = calculateTimeFromPointer(e.clientX);
    setScrubTime(newTime);
    const now = Date.now();
    if (now - lastThrottledSeekRef.current >= 200) {
      lastThrottledSeekRef.current = now;
      onSeek(newTime);
    }
  }, [calculateTimeFromPointer, isScrubbing, onSeek]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    commitSeek(calculateTimeFromPointer(e.clientX));
  }, [calculateTimeFromPointer, commitSeek, isScrubbing]);

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
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        onClick={(e) => e.stopPropagation()}
        className={`video-player-controls absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-1 pt-3 pb-1 sm:px-3 sm:pt-6 sm:pb-3 text-white select-none transition-opacity duration-300 ${
          isVisible || openMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Interactive Seek Bar */}
        <div
          ref={progressBarRef}
          dir="ltr"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="video-player-seek-bar group/bar relative mb-1 sm:mb-2 flex items-center w-full h-5 cursor-pointer touch-none"
        >
          <div className="relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-white/25 pointer-events-none">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 ${
                isScrubbing ? '' : 'transition-all duration-75'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-x-1/2 rounded-full bg-emerald-400 shadow-md ring-2 ring-white transition-transform group-hover/bar:scale-125"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Responsive Non-Wrapping Controls Row */}
        <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full flex-nowrap min-w-0">
          {/* Left Transport */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink min-w-0">
            <button
              type="button" onClick={onTogglePlay}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition active:scale-95 shadow-sm shrink-0"
              aria-label={isEnded ? 'إعادة التشغيل' : isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isEnded ? <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" /> : isPlaying ? <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" />}
            </button>
            <button
              type="button" onClick={() => onSkip(-10)}
              className="flex items-center gap-0.5 rounded-lg px-0.5 sm:px-1.5 py-1 text-[9px] sm:text-xs font-bold text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0"
              title="إرجاع 10 ثواني"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /><span>-10s</span>
            </button>
            <button
              type="button" onClick={() => onSkip(10)}
              className="flex items-center gap-0.5 rounded-lg px-0.5 sm:px-1.5 py-1 text-[9px] sm:text-xs font-bold text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0"
              title="تقديم 10 ثواني"
            >
              <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /><span>+10s</span>
            </button>
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={onToggleMute} className="rounded-lg p-0.5 sm:p-1 text-white/90 hover:bg-white/15 transition active:scale-95 shrink-0" aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}>
                {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </button>
              <input
                dir="ltr"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                aria-label="مستوى الصوت"
                className="hidden lg:block w-12 xl:w-16 accent-emerald-400 cursor-pointer h-1"
              />
            </div>
            <div className="font-mono text-[9px] sm:text-xs font-bold text-slate-200 whitespace-nowrap shrink-0">
              <span className="text-emerald-400">{formatVideoTime(activeTime)}</span><span className="mx-0.5 text-white/40">/</span><span>{formatVideoTime(safeDuration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed and Quality ONLY visible in Fullscreen or sm+ screens */}
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
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition active:scale-95 shrink-0"
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
