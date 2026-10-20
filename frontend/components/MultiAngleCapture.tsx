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
    <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#e6e2d8] space-y-6 shadow-sm">
      {/* DermaNova Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0ede6] pb-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#f4f6f1] border border-[#cbd7c1] flex items-center justify-center text-[#425335]">
            <Scan className="w-5 h-5 text-[#637852]" />
          </span>
          <div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-[#1a2217] tracking-tight">
              3-Angle Spatial Face Protocol
            </h3>
            <p className="text-xs text-[#6b7764] font-mono-clinical">
              DermaNova standard multi-angle spatial imaging protocol
            </p>
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="px-4 py-2 rounded-full bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#cbd7c1] text-[#1a2217] hover:bg-[#f4f6f1] text-xs font-mono-clinical font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#b85c3c]" />
          <span>Quick Demo Scan</span>
        </button>
      </div>

      {/* 3 Step Pills */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveStep('front')}
          className={`p-3 rounded-2xl text-left border transition ${
            activeStep === 'front'
              ? 'bg-[#f4f6f1] border-[#cbd7c1] text-[#425335] shadow-xs'
              : frontImage
              ? 'bg-[#faf9f5] border-[#cbd7c1] text-[#425335]'
              : 'bg-[#faf9f5] border-[#e6e2d8] text-[#6b7764]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono-clinical font-bold">
            <span>1. FRONT</span>
            {frontImage && <CheckCircle2 className="w-3.5 h-3.5 text-[#637852]" />}
          </div>
          <p className="text-[10px] mt-1 line-clamp-1 opacity-80">Direct View</p>
        </button>

        <button
          onClick={() => setActiveStep('left')}
          className={`p-3 rounded-2xl text-left border transition ${
            activeStep === 'left'
              ? 'bg-[#f4f6f1] border-[#cbd7c1] text-[#425335] shadow-xs'
              : leftImage
              ? 'bg-[#faf9f5] border-[#cbd7c1] text-[#425335]'
              : 'bg-[#faf9f5] border-[#e6e2d8] text-[#6b7764]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono-clinical font-bold">
            <span>2. LEFT</span>
            {leftImage && <CheckCircle2 className="w-3.5 h-3.5 text-[#637852]" />}
          </div>
          <p className="text-[10px] mt-1 line-clamp-1 opacity-80">Left Profile</p>
        </button>

        <button
          onClick={() => setActiveStep('right')}
          className={`p-3 rounded-2xl text-left border transition ${
            activeStep === 'right'
              ? 'bg-[#f4f6f1] border-[#cbd7c1] text-[#425335] shadow-xs'
              : rightImage
              ? 'bg-[#faf9f5] border-[#cbd7c1] text-[#425335]'
              : 'bg-[#faf9f5] border-[#e6e2d8] text-[#6b7764]'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono-clinical font-bold">
            <span>3. RIGHT</span>
            {rightImage && <CheckCircle2 className="w-3.5 h-3.5 text-[#637852]" />}
          </div>
          <p className="text-[10px] mt-1 line-clamp-1 opacity-80">Right Profile</p>
        </button>
      </div>

      {/* Guide Banner */}
      <div className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#e6e2d8] flex items-start gap-2.5 text-xs text-[#556050]">
        <AlertCircle className="w-4 h-4 text-[#637852] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#1a2217] font-mono-clinical">{stepMeta[activeStep].guide}</span>
          <span className="text-[#6b7764] block text-[11px] mt-0.5">{stepMeta[activeStep].hint}</span>
        </div>
      </div>

      {/* Camera / Viewport Area */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-[#1c2417] border border-[#e6e2d8] flex items-center justify-center shadow-inner group">
        {useWebcam && hasWebcamPermission !== false ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* DermaNova Oval Alignment Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={`w-52 h-72 rounded-[48%] border-2 border-dashed transition-all duration-300 ${
                  activeStep === 'front'
                    ? 'border-[#637852] shadow-[0_0_20px_rgba(99,120,82,0.3)]'
                    : 'border-[#b85c3c] rotate-12 shadow-[0_0_20px_rgba(184,92,60,0.3)]'
                }`}
              />
            </div>

            {/* Micro Prompt badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1c2417]/85 backdrop-blur-md border border-white/20 text-[11px] font-mono-clinical text-white pointer-events-none">
              {stepMeta[activeStep].subPrompt}
            </div>

            {/* Camera Controls Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="w-10 h-10 rounded-full bg-[#1c2417]/80 hover:bg-[#1c2417] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition"
                title="Flip Camera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={captureCurrentAngle}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1.5 shadow-2xl transition transform active:scale-95 flex items-center justify-center ring-4 ring-[#637852]/40"
              >
                <div className="w-full h-full rounded-full border-2 border-[#1c2417] bg-[#637852] flex items-center justify-center text-white font-bold">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => setUseWebcam(false)}
                className="w-10 h-10 rounded-full bg-[#1c2417]/80 hover:bg-[#1c2417] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition"
                title="Upload Photo File"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* File Upload Mode */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#f4f6f1] border border-[#cbd7c1] text-[#425335] flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7 text-[#637852]" />
            </div>
            <div>
              <h4 className="font-serif-luxury text-base font-normal text-[#1a2217]">
                Upload {stepMeta[activeStep].title}
              </h4>
              <p className="text-xs text-[#6b7764] mt-1 font-sans">
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
                className="px-5 py-2.5 rounded-full bg-[#1c2417] hover:bg-[#2d3b25] text-white font-mono-clinical font-semibold text-xs transition"
              >
                Choose Photo from Device
              </button>
              <button
                onClick={() => setUseWebcam(true)}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#faf9f5] border border-[#e6e2d8] text-[#1a2217] text-xs font-mono-clinical transition"
              >
                Switch back to Live Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Captured Thumbnails Preview & Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          {/* Thumbnails */}
          {['front', 'left', 'right'].map((angle) => {
            const img = angle === 'front' ? frontImage : angle === 'left' ? leftImage : rightImage;
            return (
              <div
                key={angle}
                onClick={() => setActiveStep(angle as AngleStep)}
                className={`w-14 h-14 rounded-2xl overflow-hidden border cursor-pointer relative bg-[#faf9f5] transition ${
                  activeStep === angle ? 'ring-2 ring-[#637852] border-transparent' : 'border-[#e6e2d8]'
                }`}
              >
                {img ? (
                  <img src={img} alt={angle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-mono-clinical text-[#6b7764] p-1 text-center">
                    <User className="w-3.5 h-3.5 mb-0.5 text-[#637852]" />
                    <span>{angle}</span>
                  </div>
                )}
                {img && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#637852] flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-[11px] text-[#6b7764] font-mono-clinical pl-1">
            {frontImage ? (
              <span className="text-[#425335] font-semibold">Front scan ready.</span>
            ) : (
              <span>Front scan required to begin.</span>
            )}
          </div>
        </div>

        {/* Start Diagnostic Analysis CTA */}
        <button
          onClick={handleProceedToAnalysis}
          disabled={!frontImage || isLoading}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-mono-clinical font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
            frontImage && !isLoading
              ? 'bg-[#1c2417] hover:bg-[#2d3b25] text-white cursor-pointer'
              : 'bg-[#e6e2d8] text-[#8c9486] cursor-not-allowed border border-[#d6e0ce]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing Clinical Biomarkers...</span>
            </>
          ) : (
            <>
              <span>Analyze My Skin</span>
              <ChevronRight className="w-4 h-4 text-[#b85c3c]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
