'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { Play, Sparkles } from 'lucide-react';
import { VideoPlayerControls, formatVideoTime } from './VideoPlayerControls';

export interface CrossPlatformHlsPlayerProps {
  lessonId: string;
  manifestUrl: string;
  title?: string;
  studentName?: string;
  studentPhone?: string;
  showWatermark?: boolean; // Default is false as strictly requested
  onLessonComplete?: (lessonId: string) => void;
}

type IOSHTMLVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

const DEMO_DURATION_SEC = 20;

export function CrossPlatformHlsPlayer({
  lessonId,
  manifestUrl,
  title = 'شرح تفصيلي للدعامة الفسيولوجية والتركيبية في النبات',
  studentName = 'طالب الثانوية العامة',
  studentPhone = '010XXXXXXXX',
  showWatermark = false,
  onLessonComplete,
}: CrossPlatformHlsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<IOSHTMLVideoElement | null>(null);
  const lastSavedAtRef = useRef<number>(0);
  const completionSentRef = useRef<boolean>(false);
  const storageKey = `lms_lesson_pos_${lessonId}`;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [quality, setQuality] = useState<string>('1080p FHD');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEMO_DURATION_SEC);

  useEffect(() => {
    setIsPlaying(false);
    completionSentRef.current = false;
    try {
      const saved = Number(localStorage.getItem(storageKey) || '0');
      setCurrentTime(saved > 0 && saved < DEMO_DURATION_SEC ? saved : 0);
    } catch {
      setCurrentTime(0);
    }
  }, [storageKey]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;
    let hls: Hls | null = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
    } else if (Hls.isSupported()) {
      hls = new Hls({ backBufferLength: 30, enableWorker: true });
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
    }
    return () => { if (hls) hls.destroy(); };
  }, [manifestUrl]);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 100;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackRate;
        const now = Date.now();
        if (now - lastSavedAtRef.current >= 3000) {
          try { localStorage.setItem(storageKey, String(Math.floor(next))); } catch {}
          lastSavedAtRef.current = now;
        }
        if (next >= duration) {
          setIsPlaying(false);
          if (!completionSentRef.current && onLessonComplete) {
            completionSentRef.current = true;
            onLessonComplete(lessonId);
          }
          return duration;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackRate, duration, lessonId, onLessonComplete, storageKey]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (nextState && currentTime >= duration) {
        setCurrentTime(0);
        completionSentRef.current = false;
      }
      if (video) {
        if (nextState) video.play().catch(() => {});
        else video.pause();
      }
      return nextState;
    });
  }, [currentTime, duration]);

  const handleSeek = useCallback((newTimeSec: number) => {
    const clamped = Math.max(0, Math.min(duration, newTimeSec));
    setCurrentTime(clamped);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) video.currentTime = clamped;
    try { localStorage.setItem(storageKey, String(Math.floor(clamped))); } catch {}
  }, [duration, storageKey]);

  const handleSkip = useCallback((deltaSec: number) => handleSeek(currentTime + deltaSec), [currentTime, handleSeek]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    setIsMuted((prev) => {
      const next = !prev;
      if (video) video.muted = next;
      return next;
    });
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    const video = videoRef.current;
    if (video) { video.volume = clamped; video.muted = clamped === 0; }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); setIsFullscreen(false); return; }
      if (typeof container.requestFullscreen === 'function') { await container.requestFullscreen(); setIsFullscreen(true); return; }
      if (video && typeof video.webkitEnterFullscreen === 'function') video.webkitEnterFullscreen();
    } catch {
      if (video && typeof video.webkitEnterFullscreen === 'function') video.webkitEnterFullscreen();
    }
  }, []);

  return (
    <div ref={containerRef} dir="ltr" className="group relative w-full overflow-hidden rounded-2xl bg-[#041113] border border-teal-500/25 shadow-2xl select-none">
      <div onClick={togglePlay} className="relative aspect-video w-full cursor-pointer overflow-hidden bg-gradient-to-br from-[#061B1E] via-[#09272B] to-[#041012]">
        <video ref={videoRef} playsInline muted={isMuted} controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} onLoadedMetadata={() => setDuration(DEMO_DURATION_SEC)} className="absolute inset-0 h-full w-full object-cover opacity-25 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-between p-3 sm:p-6 text-center" dir="rtl">
          <div className="flex w-full items-center justify-between gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 font-bold text-emerald-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /><span>منصة أ/ عمار رزق • {quality}</span>
            </span>
            <span className="rounded-full bg-black/50 border border-white/10 px-2.5 py-1 font-mono font-bold text-teal-200">
              {playbackRate}x • {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
            </span>
          </div>

          <div className="my-auto flex flex-col items-center max-w-md space-y-2 sm:space-y-3 px-2">
            {!isPlaying ? (
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-400/30 transition transform hover:scale-105">
                <Play className="h-7 w-7 fill-current ml-0.5" />
              </div>
            ) : (
              <div className="flex items-end gap-1 h-10">
                {[0.6, 1, 0.75, 0.9, 0.5, 0.85, 0.65].map((h, i) => (
                  <span key={i} className="w-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ height: `${Math.max(25, ((currentTime * 15 + i * 20) % 100) * h)}%` }} />
                ))}
              </div>
            )}
            <h3 className="text-xs sm:text-base md:text-lg font-black text-white drop-shadow line-clamp-2">{title}</h3>
            <p className="text-[11px] sm:text-xs text-teal-200/80 hidden xs:block">
              {currentTime < 7
                ? 'الجزء 1: شرح الخاصية الأسموزية وضغط الامتلاء في الفجوة العصارية'
                : currentTime < 14
                ? 'الجزء 2: العلاقة البيانية بين الضغط الأسموزي والدعامة الفسيولوجية'
                : 'الجزء 3: مقارنة شاملة بين الدعامة الفسيولوجية والدعامة التركيبية'}
            </p>
          </div>
          <div className="h-6 sm:h-8" />
        </div>

        {showWatermark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="animate-watermark absolute top-6 left-6 rounded bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/50 backdrop-blur-sm">
              {studentName} • {studentPhone}
            </span>
          </div>
        )}
      </div>

      <VideoPlayerControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        currentTime={currentTime}
        duration={duration}
        playbackRate={playbackRate}
        quality={quality}
        isFullscreen={isFullscreen}
        onTogglePlay={togglePlay}
        onSeek={handleSeek}
        onSkip={handleSkip}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onPlaybackRateChange={handlePlaybackRateChange}
        onQualityChange={setQuality}
        onToggleFullscreen={handleFullscreenToggle}
      />
    </div>
  );
}
