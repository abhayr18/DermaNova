'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  User,
  Scan,
  FlipHorizontal
} from 'lucide-react';

interface MultiAngleCaptureProps {
  onImagesReady: (frontImage: string | File, leftImage?: string | File, rightImage?: string | File) => void;
  onRunDemo: () => void;
  isLoading: boolean;
}

type AngleStep = 'front' | 'left' | 'right';

export const MultiAngleCapture: React.FC<MultiAngleCaptureProps> = ({
  onImagesReady,
  onRunDemo,
  isLoading
}) => {
  const [activeStep, setActiveStep] = useState<AngleStep>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);

  const [useWebcam, setUseWebcam] = useState<boolean>(true);
  const [hasWebcamPermission, setHasWebcamPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasWebcamPermission(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setHasWebcamPermission(false);
      setUseWebcam(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (useWebcam) {
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
  }, [useWebcam, startCamera]);

  const captureCurrentAngle = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (activeStep === 'front') {
      setFrontImage(dataUrl);
      setActiveStep('left');
    } else if (activeStep === 'left') {
      setLeftImage(dataUrl);
      setActiveStep('right');
    } else if (activeStep === 'right') {
      setRightImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (activeStep === 'front') {
        setFrontImage(dataUrl);
        setActiveStep('left');
      } else if (activeStep === 'left') {
        setLeftImage(dataUrl);
        setActiveStep('right');
      } else if (activeStep === 'right') {
        setRightImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToAnalysis = () => {
    if (frontImage) {
      onImagesReady(frontImage, leftImage || undefined, rightImage || undefined);
    }
  };

  const stepMeta = {
    front: {
      title: 'Step 1: Front Face',
      guide: 'Look directly into camera • Keep neutral expression',
      hint: 'Detects forehead acne, T-zone oiliness & nose pores',
      subPrompt: 'Align face inside the oval guide'
    },
    left: {
      title: 'Step 2: Left Cheek Profile',
      guide: 'Turn your head slightly to the right (Show left cheek)',
      hint: 'Detects lateral cheek acne, hormonal spots & scarring',
      subPrompt: 'Keep left cheek centered in the frame'
    },
    right: {
      title: 'Step 3: Right Cheek Profile',
      guide: 'Turn your head slightly to the left (Show right cheek)',
      hint: 'Detects contralateral blemishes, pigmentation & texture',
      subPrompt: 'Keep right cheek centered in the frame'
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4 shadow-xl">
      {/* CureSkin Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Scan className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              3-Angle Clinical Skin Scan
            </h3>
            <p className="text-[11px] text-slate-400">
              CureSkin standard multi-angle facial imaging protocol
            </p>
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-brand-500/30 text-brand-300 hover:bg-brand-950 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Quick Demo Scan</span>
        </button>
      </div>

      {/* 3 Step Pills */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveStep('front')}
          className={`p-2 rounded-xl text-left border transition ${
            activeStep === 'front'
              ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 ring-1 ring-brand-500/30'
              : frontImage
              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span>1. FRONT</span>
            {frontImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[11px] font-medium truncate mt-0.5">
            {frontImage ? 'Captured' : 'Pending'}
          </div>
        </button>

        <button
          onClick={() => setActiveStep('left')}
          className={`p-2 rounded-xl text-left border transition ${
            activeStep === 'left'
              ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 ring-1 ring-brand-500/30'
              : leftImage
              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span>2. LEFT CHEEK</span>
            {leftImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[11px] font-medium truncate mt-0.5">
            {leftImage ? 'Captured' : 'Optional'}
          </div>
        </button>

        <button
          onClick={() => setActiveStep('right')}
          className={`p-2 rounded-xl text-left border transition ${
            activeStep === 'right'
              ? 'bg-brand-500/10 border-brand-500/40 text-brand-300 ring-1 ring-brand-500/30'
              : rightImage
              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span>3. RIGHT CHEEK</span>
            {rightImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[11px] font-medium truncate mt-0.5">
            {rightImage ? 'Captured' : 'Optional'}
          </div>
        </button>
      </div>

      {/* Guide Banner */}
      <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-white font-bold">{stepMeta[activeStep].title}: </span>
          <span className="text-slate-300">{stepMeta[activeStep].guide}</span>
        </div>
        <span className="text-[10px] text-brand-400 font-mono hidden sm:inline">
          {stepMeta[activeStep].hint}
        </span>
      </div>

      {/* Camera / Viewport Area */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group">
        {useWebcam && hasWebcamPermission !== false ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* CureSkin Oval Alignment Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-52 h-72 rounded-[48%] border-2 border-dashed transition-all duration-300 ${
                  activeStep === 'front'
                    ? 'border-brand-400/80 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                    : 'border-emerald-400/80 rotate-12 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
              />
            </div>

            {/* Micro Prompt badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-medium text-slate-200 pointer-events-none">
              {stepMeta[activeStep].subPrompt}
            </div>

            {/* Camera Controls Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center backdrop-blur-md transition"
                title="Flip Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={captureCurrentAngle}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1.5 shadow-2xl transition transform active:scale-95 flex items-center justify-center ring-4 ring-brand-500/40"
              >
                <div className="w-full h-full rounded-full border-2 border-slate-900 bg-brand-500 flex items-center justify-center text-slate-950 font-bold">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => setUseWebcam(false)}
                className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center backdrop-blur-md transition"
                title="Upload Photo File"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* File Upload Mode */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Upload {stepMeta[activeStep].title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Select a clear, well-lit photo of your {activeStep === 'front' ? 'face' : `${activeStep} cheek`}.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition"
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

      {/* Captured Thumbnails Preview & Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Thumbnails */}
          {['front', 'left', 'right'].map((angle) => {
            const img = angle === 'front' ? frontImage : angle === 'left' ? leftImage : rightImage;
            return (
              <div
                key={angle}
                onClick={() => setActiveStep(angle as AngleStep)}
                className={`w-14 h-14 rounded-xl overflow-hidden border cursor-pointer relative bg-slate-900 transition ${
                  activeStep === angle ? 'ring-2 ring-brand-400 border-transparent' : 'border-slate-800'
                }`}
              >
                {img ? (
                  <img src={img} alt={angle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-mono text-slate-500 p-1 text-center">
                    <User className="w-3.5 h-3.5 mb-0.5" />
                    <span>{angle}</span>
                  </div>
                )}
                {img && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-[11px] text-slate-400 pl-1">
            {frontImage ? (
              <span className="text-emerald-400 font-semibold">Front scan ready.</span>
            ) : (
              <span>Front scan required to begin.</span>
            )}
          </div>
        </div>

        {/* Start Diagnostic Analysis CTA */}
        <button
          onClick={handleProceedToAnalysis}
          disabled={!frontImage || isLoading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xl ${
            frontImage && !isLoading
              ? 'bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 cursor-pointer shadow-brand-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              <span>Analyzing Clinical Biomarkers...</span>
            </>
          ) : (
            <>
              <span>Analyze My Skin</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
