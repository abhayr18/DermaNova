'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FlipHorizontal,
  ChevronRight,
  Focus,
  AlertCircle
} from 'lucide-react';

interface SingleCloseUpCaptureProps {
  onImageReady: (image: string | File) => void;
  onRunDemo: () => void;
  isLoading: boolean;
}

export const SingleCloseUpCapture: React.FC<SingleCloseUpCaptureProps> = ({
  onImageReady,
  onRunDemo,
  isLoading
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useWebcam, setUseWebcam] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable. You can upload a photo file from your device.');
      setUseWebcam(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (useWebcam && !capturedImage) {
      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam, capturedImage, startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const maxDim = 720;
    let width = videoRef.current.videoWidth || 640;
    let height = videoRef.current.videoHeight || 480;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
    setCapturedImage(dataUrl);
    setSelectedFile(null);

    // Stop camera stream after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 720;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
          setCapturedImage(compressedDataUrl);
          setSelectedFile(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Stop camera stream if active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setUseWebcam(true);
    startCamera();
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      onImageReady(selectedFile);
    } else if (capturedImage) {
      onImageReady(capturedImage);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Focus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>Single Close-Up Skin Scanner</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                1-Photo Protocol
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              One focused photo of your face or concern area is all our AI needs
            </p>
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-brand-500/20 hover:from-cyan-500/30 hover:to-brand-500/30 border border-brand-500/30 text-brand-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Demo Case (Instant)</span>
        </button>
      </div>

      {cameraError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group">
        {capturedImage ? (
          /* Preview Mode of Captured/Uploaded Photo */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Patient skin scan preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Photo Ready for AI Pinpoint Detection</span>
            </div>

            <button
              onClick={handleRetake}
              disabled={isLoading}
              className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        ) : useWebcam ? (
          /* Live Camera Stream */
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Close-Up Focus Reticle Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-72 rounded-[42px] border-2 border-dashed border-brand-400/70 shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all animate-pulse-slow relative">
                {/* Corner crosshairs */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand-400" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand-400" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand-400" />
              </div>
            </div>

            {/* Dynamic prompt overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-medium text-slate-200 pointer-events-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Frame close-up of face or affected skin</span>
            </div>

            {/* In-view Camera Action Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center backdrop-blur-md transition shadow"
                title="Flip to back camera for close-up"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1 shadow-2xl transition transform active:scale-95 flex items-center justify-center ring-4 ring-brand-500/40"
              >
                <div className="w-full h-full rounded-full border-2 border-slate-950 bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => setUseWebcam(false)}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center backdrop-blur-md transition shadow"
                title="Upload Photo File"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* File Upload View */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Upload 1 Close-Up Photo
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Select a clear, well-lit photo of your face or the specific skin area showing acne, redness, or spots.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold text-xs transition shadow-lg"
              >
                Choose Photo from Device
              </button>
              <button
                onClick={() => setUseWebcam(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition"
              >
                Switch back to Live Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Single close-up scan • AI will pinpoint exact disease areas</span>
        </div>

        <button
          onClick={handleStartAnalysis}
          disabled={!capturedImage || isLoading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-xl ${
            capturedImage && !isLoading
              ? 'bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-400 hover:opacity-95 text-slate-950 cursor-pointer shadow-brand-500/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              <span>Detecting Lesion Coordinates...</span>
            </>
          ) : (
            <>
              <span>Analyze & Locate Skin Diseases</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
