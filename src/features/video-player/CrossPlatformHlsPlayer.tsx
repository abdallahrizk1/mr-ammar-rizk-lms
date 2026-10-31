'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { Play, RotateCcw } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';
import { DoubleTapRippleOverlay } from './DoubleTapRippleOverlay';
import { useVideoGestures } from './useVideoGestures';

export interface CrossPlatformHlsPlayerProps {
  lessonId: string; manifestUrl: string; title?: string; studentName?: string;
  studentPhone?: string; showWatermark?: boolean; onLessonComplete?: (lessonId: string) => void;
}
type IOSHTMLVideoElement = HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitExitFullscreen?: () => void; };

export function CrossPlatformHlsPlayer({
  lessonId, manifestUrl, studentName = 'طالب الثانوية العامة',
  studentPhone = '010XXXXXXXX', showWatermark = false, onLessonComplete,
}: CrossPlatformHlsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null); const videoRef = useRef<IOSHTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null); const lastSavedAtRef = useRef<number>(0);
  const targetSeekTimeRef = useRef<number>(0); const lastSeekTimestampRef = useRef<number>(0);
  const completionSentRef = useRef<boolean>(false); const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bufferingTimeoutRef = useRef<NodeJS.Timeout | null>(null); const controlsVisibleRef = useRef<boolean>(true);
  const seekDebounceRef = useRef<NodeJS.Timeout | null>(null); const storageKey = `lms_lesson_pos_${lessonId}`;

  const [isPlaying, setIsPlaying] = useState<boolean>(false); const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1); const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [quality, setQuality] = useState<string>('1080p FHD'); const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); const [duration, setDuration] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false); const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  controlsVisibleRef.current = areControlsVisible;

  const resetHideTimer = useCallback(() => {
    setAreControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) hideTimerRef.current = setTimeout(() => setAreControlsVisible(false), 3000);
  }, [isPlaying]);

  const clearBuffering = useCallback(() => {
    if (bufferingTimeoutRef.current) { clearTimeout(bufferingTimeoutRef.current); bufferingTimeoutRef.current = null; }
    setIsBuffering(false);
  }, []);

  const handleWaiting = useCallback(() => {
    if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    // Suppress buffering overlay during or immediately after seeks / skips (within 800ms)
    if (Date.now() - lastSeekTimestampRef.current < 800) return;
    bufferingTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastSeekTimestampRef.current >= 800) setIsBuffering(true);
    }, 750);
  }, []);

  useEffect(() => {
    if (!isPlaying) { setAreControlsVisible(true); if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }
    else resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    setIsPlaying(false); completionSentRef.current = false;
    try {
      const s = Number(localStorage.getItem(storageKey) || '0');
      setCurrentTime(s > 0 ? s : 0); if (s > 0 && videoRef.current) videoRef.current.currentTime = s;
    } catch { setCurrentTime(0); }
  }, [storageKey]);

  useEffect(() => {
    const onFs = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFs && isFullscreen) setIsFullscreen(false);
    };
    const v = videoRef.current;
    const onIOSIn = () => setIsFullscreen(true); const onIOSOut = () => setIsFullscreen(false);
    document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
    if (v) { v.addEventListener('webkitbeginfullscreen', onIOSIn); v.addEventListener('webkitendfullscreen', onIOSOut); }
    return () => {
      document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs);
      if (v) { v.removeEventListener('webkitbeginfullscreen', onIOSIn); v.removeEventListener('webkitendfullscreen', onIOSOut); }
    };
  }, [isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;
    let hls: Hls | null = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl; try { video.load(); } catch {}
    } else if (Hls.isSupported()) {
      hls = new Hls({ backBufferLength: 90, maxBufferLength: 60, maxMaxBufferLength: 300, maxBufferHole: 0.5, enableWorker: true });
      hlsRef.current = hls; hls.loadSource(manifestUrl); hls.attachMedia(video);
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        if (data.details?.totalduration && Number.isFinite(data.details.totalduration) && data.details.totalduration > 0) setDuration(data.details.totalduration);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls?.startLoad();
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError();
        else { hls?.destroy(); hlsRef.current = null; }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = manifestUrl; try { video.load(); } catch {} }
    return () => { if (hls) { hls.destroy(); hlsRef.current = null; } };
  }, [manifestUrl]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      if (duration > 0 && currentTime >= duration) { video.currentTime = 0; setCurrentTime(0); completionSentRef.current = false; }
      video.play().catch(() => {});
    } else { video.pause(); }
  }, [currentTime, duration]);

  const handleSeek = useCallback((newTimeSec: number) => {
    const clamped = Math.max(0, duration > 0 ? Math.min(duration, newTimeSec) : Math.max(0, newTimeSec));
    targetSeekTimeRef.current = clamped; lastSeekTimestampRef.current = Date.now();
    clearBuffering(); setCurrentTime(clamped);
    if (seekDebounceRef.current) clearTimeout(seekDebounceRef.current);
    seekDebounceRef.current = setTimeout(() => { const v = videoRef.current; if (v) { try { v.currentTime = clamped; } catch {} } }, 50);
    const now = Date.now();
    if (now - lastSavedAtRef.current >= 1500) { try { localStorage.setItem(storageKey, String(Math.floor(clamped))); } catch {} lastSavedAtRef.current = now; }
    if (duration > 0 && clamped >= duration) {
      setIsPlaying(false); if (videoRef.current) videoRef.current.pause();
      if (!completionSentRef.current && onLessonComplete) { completionSentRef.current = true; onLessonComplete(lessonId); }
    }
  }, [clearBuffering, duration, lessonId, onLessonComplete, storageKey]);

  const handleSkip = useCallback((deltaSec: number) => {
    const isRapid = Date.now() - lastSeekTimestampRef.current < 650;
    const base = isRapid ? targetSeekTimeRef.current : (videoRef.current?.currentTime ?? currentTime);
    handleSeek(base + deltaSec);
  }, [currentTime, handleSeek]);

  const { ripple, handleVideoAreaClick } = useVideoGestures({ controlsVisibleRef, resetHideTimer, togglePlay, handleSkip });
  const toggleMute = useCallback(() => { const v = videoRef.current; setIsMuted((p) => { const n = !p; if (v) v.muted = n; return n; }); }, []);
  const handleVolumeChange = useCallback((newVol: number) => { const c = Math.max(0, Math.min(1, newVol)); setVolume(c); setIsMuted(c === 0); const v = videoRef.current; if (v) { v.volume = c; v.muted = c === 0; } }, []);
  const handlePlaybackRateChange = useCallback((rate: number) => { setPlaybackRate(rate); if (videoRef.current) videoRef.current.playbackRate = rate; }, []);
  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality); const hls = hlsRef.current;
    if (!hls || !hls.levels?.length) return;
    if (newQuality === 'تلقائي') { hls.currentLevel = -1; return; }
    const targetH = parseInt(newQuality, 10);
    if (Number.isFinite(targetH)) { const idx = hls.levels.findIndex((lvl) => lvl.height === targetH); if (idx !== -1) hls.currentLevel = idx; }
  }, []);
  const handleFullscreenToggle = useCallback(async () => {
    const container = containerRef.current; const video = videoRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      } else if (container.requestFullscreen) { await container.requestFullscreen(); setIsFullscreen(true); }
      else if ((container as any).webkitRequestFullscreen) { await (container as any).webkitRequestFullscreen(); setIsFullscreen(true); }
      else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else setIsFullscreen(true);
    } catch {
      if (video?.webkitEnterFullscreen) { try { video.webkitEnterFullscreen(); } catch { setIsFullscreen((p) => !p); } }
      else setIsFullscreen((p) => !p);
    }
  }, []);
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

  const isEnded = duration > 0 && currentTime >= duration;

  return (
    <div
      ref={containerRef} dir="ltr" tabIndex={0} onMouseMove={resetHideTimer}
      onTouchStart={() => { if (areControlsVisible) resetHideTimer(); }}
      className={`group relative w-full select-none bg-black focus:outline-none touch-manipulation overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 h-[100dvh] w-screen flex items-center justify-center' : 'aspect-video rounded-xl sm:rounded-2xl shadow-2xl border border-teal-500/25'
      }`}
    >
      <div onClick={handleVideoAreaClick} className="relative h-full w-full cursor-pointer flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={videoRef} preload="auto" playsInline webkit-playsinline="true" muted={isMuted} controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setDuration(d); }}
          onDurationChange={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setDuration(d); }}
          onWaiting={handleWaiting}
          onSeeked={() => {
            clearBuffering(); const v = videoRef.current; const now = Date.now();
            if (v && Number.isFinite(v.currentTime) && now - lastSeekTimestampRef.current >= 300) setCurrentTime(v.currentTime);
          }}
          onCanPlay={clearBuffering} onPlaying={() => { clearBuffering(); setIsPlaying(true); }}
          onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget; const now = Date.now();
            if (isBuffering) setIsBuffering(false);
            if (!v.seeking && now - lastSeekTimestampRef.current >= 450) setCurrentTime(v.currentTime);
            if (duration === 0 && Number.isFinite(v.duration) && v.duration > 0) setDuration(v.duration);
            if (now - lastSavedAtRef.current >= 3000) { try { localStorage.setItem(storageKey, String(Math.floor(v.currentTime))); } catch {} lastSavedAtRef.current = now; }
          }}
          onEnded={() => {
            setIsPlaying(false); const v = videoRef.current;
            if (v && Number.isFinite(v.duration)) setCurrentTime(v.duration);
            if (!completionSentRef.current && onLessonComplete) { completionSentRef.current = true; onLessonComplete(lessonId); }
          }}
          className="h-full w-full object-contain pointer-events-none"
        />
        <DoubleTapRippleOverlay ripple={ripple} />
        {isBuffering && isPlaying && !isEnded && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25"><div className="h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent shadow-lg" /></div>
        )}
        {(!isPlaying || isEnded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 pointer-events-none transition-opacity">
            {isEnded ? (
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl bg-black/75 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md border border-white/15 text-white shadow-2xl"><RotateCcw className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400" /><span className="text-xs font-bold font-sans">إعادة المشاهدة</span></div>
            ) : (
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-400/30 transition transform hover:scale-105"><Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" /></div>
            )}
          </div>
        )}
        {showWatermark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="animate-watermark absolute top-6 left-6 rounded bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/50 backdrop-blur-sm">{studentName} • {studentPhone}</span>
          </div>
        )}
      </div>

      <VideoPlayerControls
        isPlaying={isPlaying} isMuted={isMuted} volume={volume} currentTime={currentTime} duration={duration}
        playbackRate={playbackRate} quality={quality} isFullscreen={isFullscreen} isVisible={areControlsVisible}
        onTogglePlay={togglePlay} onSeek={handleSeek} onSkip={handleSkip} onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange} onPlaybackRateChange={handlePlaybackRateChange} onQualityChange={handleQualityChange} onToggleFullscreen={handleFullscreenToggle}
      />
    </div>
  );
}
