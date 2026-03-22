"use client";

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing?: boolean;
  hasRecorded?: boolean;
  onReset?: () => void;
}

export default function AudioRecorder({ onRecordingComplete, isProcessing = false, hasRecorded = false, onReset }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    return stopRecording;
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / bufferLength;
        setVolume(Math.min(100, Math.round((average / 255) * 100 * 2)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
        setVolume(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error microphone:', error);
      alert("Microphone inaccessible.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasRecorded) {
    return (
      <div className="w-full flex flex-col gap-6 items-center">
        <div className="flex items-center gap-2 px-6 py-4 bg-secondary-container/30 border border-secondary/20 text-secondary rounded-full font-bold">
           <span className="material-symbols-outlined">check_circle</span>
           Prise vocale enregistrée !
        </div>
        <div className="flex gap-4">
          <button 
            disabled={true}
            className="px-8 py-3 bg-secondary-container text-on-secondary-container font-headline font-bold rounded-full hover:bg-secondary-container/80 transition-all opacity-50 cursor-not-allowed hidden"
          >
            Réécouter
          </button>
          <button 
            onClick={onReset}
            disabled={isProcessing}
            className="px-8 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-full hover:bg-surface-variant transition-all disabled:opacity-50"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Large Pulse Microphone */}
      <div className="relative flex items-center justify-center mb-8 h-48 w-48">
        {isRecording && (
          <>
            <div className="absolute w-48 h-48 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-40 h-40 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </>
        )}
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 z-10 ${
            isRecording 
              ? "bg-error text-on-error hover:bg-error-dim shadow-error/20" 
              : "bg-gradient-to-br from-primary to-primary-container text-on-primary hover:scale-[1.05] active:scale-95 shadow-primary/20"
          }`}
        >
          <span className="material-symbols-outlined !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isRecording ? "stop" : "mic"}
          </span>
        </button>
      </div>

      {/* Waveform Visualizer */}
      <div className="w-full flex flex-col gap-4 items-center h-32">
        {isRecording ? (
          <>
            <div className="w-full h-24 flex items-center justify-center gap-[4px] px-8">
              {Array.from({ length: 30 }).map((_, i) => {
                // A simulated wave based on volume
                const waveMath = Math.sin(i + (Date.now()/500)) * 0.5 + 0.5;
                const heightPercent = Math.max(10, volume * waveMath);
                return (
                  <div 
                    key={i}
                    className="w-2 bg-primary rounded-full transition-all duration-75"
                    style={{ height: `${heightPercent}%`, opacity: heightPercent > 10 ? 1 : 0.4 }}
                  ></div>
                );
              })}
            </div>
            <p className="text-on-surface-variant font-medium font-body">Enregistrement en cours... {formatTime(recordingTime)}</p>
          </>
        ) : (
          <p className="text-on-surface-variant font-medium mt-auto font-body">Touchez le micro pour démarrer l'enregistrement</p>
        )}
      </div>
    </div>
  );
}
