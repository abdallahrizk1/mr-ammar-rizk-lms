'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export interface CrossPlatformHlsPlayerProps {
  lessonId: string;
  manifestUrl: string;
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

export function CrossPlatformHlsPlayer({
  lessonId,
  manifestUrl,
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    let hls: Hls | null = null;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const restorePosition = () => {
      const savedSeconds = Number(localStorage.getItem(storageKey) || '0');
      if (savedSeconds > 0 && Number.isFinite(savedSeconds)) {
        video.currentTime = savedSeconds;
      }
    };

    if (isIOS && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', restorePosition, { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls({
        backBufferLength: 60,
        maxBufferHole: 0.5,
        enableWorker: true,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, restorePosition);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', restorePosition, { once: true });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [manifestUrl, storageKey]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const duration = video.duration || 1;
    setProgress((current / duration) * 100);

    const now = Date.now();
    if (now - lastSavedAtRef.current >= 3000) {
      localStorage.setItem(storageKey, String(Math.floor(current)));
      lastSavedAtRef.current = now;
    }
  }, [storageKey]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        return;
      }
      if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') {
        video.webkitExitFullscreen();
        setIsFullscreen(false);
        return;
      }
      if (typeof container.requestFullscreen === 'function') {
        await container.requestFullscreen();
        setIsFullscreen(true);
        return;
      }
      if (typeof video.webkitEnterFullscreen === 'function') {
        video.webkitEnterFullscreen();
      }
    } catch {
      if (typeof video.webkitEnterFullscreen === 'function') {
        video.webkitEnterFullscreen();
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className="group relative w-full overflow-hidden rounded-2xl bg-black select-none shadow-2xl"
    >
      <video
        ref={videoRef}
        playsInline
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (!completionSentRef.current && onLessonComplete) {
            completionSentRef.current = true;
            onLessonComplete(lessonId);
          }
        }}
        className="aspect-video w-full cursor-pointer bg-slate-950"
        onClick={togglePlay}
      />

      {showWatermark && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="animate-watermark absolute top-6 left-6 rounded bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/50 backdrop-blur-sm">
            {studentName} • {studentPhone}
          </span>
        </div>
      )}

      {/* Video Custom Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-95 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        {/* Progress track */}
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-bio-teal to-gold transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-lg p-1.5 hover:bg-white/20 transition active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (v) v.currentTime = Math.max(0, v.currentTime - 10);
              }}
              className="rounded-lg p-1.5 hover:bg-white/20 transition active:scale-95"
              aria-label="Rewind 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg p-1.5 hover:bg-white/20 transition active:scale-95"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-300">HLS HD</span>
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className="rounded-lg p-1.5 hover:bg-white/20 transition active:scale-95"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
