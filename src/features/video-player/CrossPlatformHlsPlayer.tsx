'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { Play, RotateCcw } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';

export interface CrossPlatformHlsPlayerProps {
  lessonId: string; manifestUrl: string; title?: string;
  studentName?: string; studentPhone?: string;
  showWatermark?: boolean; onLessonComplete?: (lessonId: string) => void;
}

type IOSHTMLVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void;
};

const DEMO_DURATION_SEC = 20;

export function CrossPlatformHlsPlayer({
  lessonId, manifestUrl, studentName = 'طالب الثانوية العامة',
  studentPhone = '010XXXXXXXX', showWatermark = false, onLessonComplete,
}: CrossPlatformHlsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<IOSHTMLVideoElement | null>(null);
  const lastSavedAtRef = useRef<number>(0);
  const completionSentRef = useRef<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsVisibleRef = useRef<boolean>(true);
  const storageKey = `lms_lesson_pos_${lessonId}`;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [quality, setQuality] = useState<string>('1080p FHD');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEMO_DURATION_SEC);
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);

  controlsVisibleRef.current = areControlsVisible;

  const resetHideTimer = useCallback(() => {
    setAreControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) hideTimerRef.current = setTimeout(() => setAreControlsVisible(false), 3000);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) { setAreControlsVisible(true); if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }
    else resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    setIsPlaying(false); completionSentRef.current = false;
    try { const s = Number(localStorage.getItem(storageKey) || '0'); setCurrentTime(s > 0 && s < DEMO_DURATION_SEC ? s : 0); }
    catch { setCurrentTime(0); }
  }, [storageKey]);

  useEffect(() => {
    const onFsChange = () => {
      const isNativeFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNativeFs && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;
    let hls: Hls | null = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && video.canPlayType('application/vnd.apple.mpegurl')) { video.src = manifestUrl; }
    else if (Hls.isSupported()) {
      hls = new Hls({ backBufferLength: 30, enableWorker: true });
      hls.loadSource(manifestUrl); hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = manifestUrl; }
    return () => { if (hls) hls.destroy(); };
  }, [manifestUrl]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackRate;
        const now = Date.now();
        if (now - lastSavedAtRef.current >= 3000) {
          try { localStorage.setItem(storageKey, String(Math.floor(next))); } catch {}
          lastSavedAtRef.current = now;
        }
        if (next >= duration) {
          setIsPlaying(false);
          const v = videoRef.current; if (v) v.pause();
          if (!completionSentRef.current && onLessonComplete) { completionSentRef.current = true; onLessonComplete(lessonId); }
          return duration;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying, playbackRate, duration, lessonId, onLessonComplete, storageKey]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (nextState && currentTime >= duration) { setCurrentTime(0); completionSentRef.current = false; if (video) video.currentTime = 0; }
      if (video) { if (nextState) video.play().catch(() => {}); else video.pause(); }
      return nextState;
    });
  }, [currentTime, duration]);

  const handleVideoClick = useCallback(() => {
    if (!controlsVisibleRef.current) { resetHideTimer(); return; }
    togglePlay();
  }, [resetHideTimer, togglePlay]);

  const handleSeek = useCallback((newTimeSec: number) => {
    const clamped = Math.max(0, Math.min(duration, newTimeSec));
    setCurrentTime(clamped);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) video.currentTime = clamped;
    try { localStorage.setItem(storageKey, String(Math.floor(clamped))); } catch {}
    if (clamped >= duration) {
      setIsPlaying(false);
      if (video) video.pause();
      if (!completionSentRef.current && onLessonComplete) { completionSentRef.current = true; onLessonComplete(lessonId); }
    }
  }, [duration, lessonId, onLessonComplete, storageKey]);

  const handleSkip = useCallback((deltaSec: number) => handleSeek(currentTime + deltaSec), [currentTime, handleSeek]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    setIsMuted((prev) => { const n = !prev; if (video) video.muted = n; return n; });
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped); setIsMuted(clamped === 0);
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
    if (!container) return;
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        setIsFullscreen(false); return;
      }
      if (isFullscreen) { setIsFullscreen(false); return; }
      if (container.requestFullscreen) { await container.requestFullscreen(); setIsFullscreen(true); }
      else if ((container as any).webkitRequestFullscreen) { await (container as any).webkitRequestFullscreen(); setIsFullscreen(true); }
      else { setIsFullscreen(true); }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handleSkip(-5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleSkip(5); }
      else if (e.key === 'm') { e.preventDefault(); toggleMute(); }
      else if (e.key === 'f') { e.preventDefault(); handleFullscreenToggle(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSkip, toggleMute, handleFullscreenToggle]);

  const isEnded = currentTime >= duration;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      tabIndex={0}
      onMouseMove={resetHideTimer}
      onTouchStart={() => { if (areControlsVisible) resetHideTimer(); }}
      className={`group relative w-full select-none bg-black focus:outline-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-[100dvh] w-screen flex items-center justify-center overflow-hidden' : 'aspect-video rounded-2xl shadow-2xl border border-teal-500/25 overflow-hidden'
      }`}
    >
      <div onClick={handleVideoClick} className="relative h-full w-full cursor-pointer flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef} playsInline webkit-playsinline="true" muted={isMuted} controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()} onLoadedMetadata={() => setDuration(DEMO_DURATION_SEC)}
          onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false); setCurrentTime(duration);
            if (!completionSentRef.current && onLessonComplete) { completionSentRef.current = true; onLessonComplete(lessonId); }
          }}
          className="h-full w-full object-contain pointer-events-none"
        />
        {(!isPlaying || isEnded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none transition-opacity">
            {isEnded ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/75 px-5 py-3 backdrop-blur-md border border-white/15 text-white shadow-2xl">
                <RotateCcw className="h-7 w-7 text-emerald-400" /><span className="text-xs font-bold font-sans">إعادة المشاهدة</span>
              </div>
            ) : (
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-400/30 transition transform hover:scale-105">
                <Play className="h-7 w-7 fill-current ml-0.5" />
              </div>
            )}
          </div>
        )}
        {showWatermark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="animate-watermark absolute top-6 left-6 rounded bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/50 backdrop-blur-sm">
              {studentName} • {studentPhone}
            </span>
          </div>
        )}
      </div>

      <VideoPlayerControls
        isPlaying={isPlaying} isMuted={isMuted} volume={volume} currentTime={currentTime} duration={duration}
        playbackRate={playbackRate} quality={quality} isFullscreen={isFullscreen} isVisible={areControlsVisible}
        onTogglePlay={togglePlay} onSeek={handleSeek} onSkip={handleSkip} onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange} onPlaybackRateChange={handlePlaybackRateChange}
        onQualityChange={setQuality} onToggleFullscreen={handleFullscreenToggle}
      />
    </div>
  );
}
