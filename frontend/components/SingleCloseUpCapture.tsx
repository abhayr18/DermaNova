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
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-navara-border space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navara-borderSubtle pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#232e1b] border border-navara-sage/40 flex items-center justify-center text-navara-matcha shadow">
            <Focus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-navara-ivory tracking-tight flex items-center gap-2">
              <span>Single Close-Up Face Scanner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navara-matcha/20 text-navara-matcha border border-navara-matcha/30">
                Lóvi Vision Protocol
              </span>
            </h3>
            <p className="text-xs text-navara-stone font-mono">
              One focused photo of your face or concern zone is all our AI needs to pinpoint 11+ conditions
            </p>
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="px-4 py-2 rounded-2xl bg-[#1c2219] hover:bg-[#283221] border border-navara-sage/40 text-navara-cream text-xs font-mono font-bold flex items-center gap-1.5 transition shadow active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-navara-terracotta" />
          <span>Demo Case (Sample Face)</span>
        </button>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-[#141712] border border-navara-border flex items-center justify-center shadow-2xl group">
        {capturedImage ? (
          /* Preview Mode of Captured/Uploaded Photo */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Patient skin scan preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#181d15]/90 backdrop-blur-md border border-navara-border text-navara-ivory text-xs font-mono flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-navara-matcha" />
              <span>Photo Ready for AI Pinpoint Analysis</span>
            </div>

            <button
              onClick={handleRetake}
              disabled={isLoading}
              className="absolute top-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#181d15]/90 hover:bg-[#232e1b] border border-navara-border text-navara-cream text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md transition shadow"
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
              <div className="w-60 h-76 rounded-[44px] border-2 border-dashed border-navara-matcha/70 shadow-[0_0_35px_rgba(212,224,188,0.2)] transition-all animate-pulse-slow relative">
                {/* Corner crosshairs in Navara ivory */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-navara-ivory" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-navara-ivory" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-navara-ivory" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-navara-ivory" />
              </div>
            </div>

            {/* Dynamic prompt overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#181d15]/90 backdrop-blur-md border border-navara-border text-[11px] font-mono text-navara-ivory pointer-events-none flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-navara-matcha animate-ping" />
              <span>Frame close-up of face or affected skin</span>
            </div>

            {/* In-view Camera Action Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="w-11 h-11 rounded-full bg-[#181d15]/90 hover:bg-[#232e1b] border border-navara-border text-navara-cream flex items-center justify-center backdrop-blur-md transition shadow"
                title="Flip to back camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-navara-ivory hover:bg-navara-cream p-1 shadow-2xl transition transform active:scale-95 flex items-center justify-center ring-4 ring-navara-matcha/40"
              >
                <div className="w-full h-full rounded-full border-2 border-navara-dark bg-gradient-to-tr from-[#2a3b19] to-[#8f9a72] flex items-center justify-center text-navara-ivory font-bold">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => setUseWebcam(false)}
                className="w-11 h-11 rounded-full bg-[#181d15]/90 hover:bg-[#232e1b] border border-navara-border text-navara-cream flex items-center justify-center backdrop-blur-md transition shadow"
                title="Upload Photo File"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* File Upload View */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#232e1b] border border-navara-sage/40 text-navara-matcha flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-luxury text-base font-bold text-navara-ivory">
                Upload 1 Close-Up Photo
              </h4>
              <p className="text-xs text-navara-stone leading-relaxed">
                Select a clear, well-lit photo of your face or concern area showing acne, redness, or spots.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-navara-ivory hover:bg-navara-cream text-navara-dark font-extrabold text-xs transition shadow-xl"
              >
                Choose Photo from Device
              </button>
              <button
                onClick={() => setUseWebcam(true)}
                className="px-4 py-2 rounded-xl bg-[#1c2219] hover:bg-[#232e1b] border border-navara-borderSubtle text-navara-stone text-xs font-mono transition"
              >
                Switch back to Live Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-navara-stone font-mono">
          <ShieldCheck className="w-4 h-4 text-navara-matcha shrink-0" />
          <span>Single close-up scan • AI will pinpoint exact disease areas</span>
        </div>

        <button
          onClick={handleStartAnalysis}
          disabled={!capturedImage || isLoading}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition shadow-2xl ${
            capturedImage && !isLoading
              ? 'bg-navara-ivory hover:bg-navara-cream text-navara-dark cursor-pointer shadow-navara-ivory/20 active:scale-95'
              : 'bg-[#181d15] text-navara-stone/60 cursor-not-allowed border border-navara-borderSubtle'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-navara-dark/20 border-t-navara-dark rounded-full animate-spin" />
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
