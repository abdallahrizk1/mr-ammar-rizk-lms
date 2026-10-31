'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle2 } from 'lucide-react';

interface VoiceNoteRecorderProps {
  onAudioRecorded: (audioBlob: Blob, audioUrl: string) => void;
  onClear: () => void;
}

export function VoiceNoteRecorder({ onAudioRecorded, onClear }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use audio/mp4 if supported (iOS/Safari) else audio/webm with fallback
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(finalBlob);
        setRecordedUrl(url);
        onAudioRecorded(finalBlob, url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch {
      // Microphone access error
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && recordedUrl) {
      audioElementRef.current = new Audio(recordedUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setRecordedUrl(null);
    setIsPlaying(false);
    setRecordSeconds(0);
    onClear();
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3 space-y-2" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Mic className="h-4 w-4 text-rose-500" />
          <span>تسجيل ريكورد صوتي للرد على الطالب (audio/mp4)</span>
        </span>
        {isRecording && (
          <span className="text-[11px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span>جارٍ التسجيل: {recordSeconds} ث</span>
          </span>
        )}
      </div>

      {!recordedUrl ? (
        <div>
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>بدء التسجيل من المايك 🎙️</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              <Square className="h-3.5 w-3.5" />
              <span>إنهاء التسجيل وحفظ الريكورد ⏹️</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'إيقاف' : 'استماع للتسجيل'}</span>
          </button>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>تم التسجيل ({recordSeconds} ث)</span>
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition mr-auto"
            title="حذف وإعادة التسجيل"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
