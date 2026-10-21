'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  FlipHorizontal,
  Sun,
  Eye,
  Sliders,
  Check,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface CaptureUploadScreenProps {
  onImageSelected: (image: string | File) => void;
  onUseSampleImage: () => void;
  isLoading?: boolean;
}

export const CaptureUploadScreen: React.FC<CaptureUploadScreenProps> = ({
  onImageSelected,
  onUseSampleImage,
  isLoading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize webcam when enabled
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      if (!useWebcam) return;
      setCameraError(null);

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
            audio: false,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setCameraPermissionGranted(true);
          }
        } else {
          setCameraError('Camera access is not supported on this browser.');
          setUseWebcam(false);
        }
      } catch (err: any) {
        console.warn('Webcam stream error:', err);
        setCameraPermissionGranted(false);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow access in browser settings or upload a file directly.'
            : 'Camera could not be accessed. Please upload a photo from your device.'
        );
        setUseWebcam(false);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useWebcam, facingMode]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPEG, PNG, or WebP photograph.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setUseWebcam(false);
  };

  // Capture frame from webcam
  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 960;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSelectedImage(dataUrl);
    setSelectedFile(null);
    setUseWebcam(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    if (!consentGiven) {
      setErrorMessage('Please confirm your consent for photo processing before proceeding.');
      return;
    }
    if (selectedFile) {
      onImageSelected(selectedFile);
    } else {
      onImageSelected(selectedImage);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider">
              Diagnostic Studio
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Multi-Spectral Face Alignment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Cutaneous Photo Ingestion
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload or capture a clean frontal photograph. Model calibrates lighting and anatomical planes before biomarker evaluation.
          </p>
        </div>

        {/* Demo Fast Track Button */}
        <button
          type="button"
          onClick={onUseSampleImage}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold transition shrink-0"
        >
          <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
          <span>Load Clinical Reference Sample</span>
        </button>
      </div>

      {/* Main Capture Box */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
        
        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="underline font-mono text-xs">
              Dismiss
            </button>
          </div>
        )}

        {cameraError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Central Capture/Preview Viewport */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[440px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
          
          {/* STATE A: Selected Image Preview */}
          {selectedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={selectedImage}
                alt="Selected Face Preview"
                className="w-full h-full object-contain"
              />

              {/* Facial Alignment Overlay Over Image */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[62%] sm:w-[50%] h-[78%] sm:h-[72%] border border-teal-400/50 rounded-[48%] border-dashed flex flex-col justify-between py-6 sm:py-8 px-4">
                  {/* Eye Level Line */}
                  <div className="w-full border-t border-teal-400/40 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-teal-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-teal-500/30">
                      Ocular Meridian
                    </span>
                  </div>
                  {/* Chin Level Line */}
                  <div className="w-1/2 mx-auto border-t border-teal-400/40 relative">
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-teal-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-teal-500/30">
                      Mentum Base
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready Tag */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Anatomical Plane Calibrated</span>
              </div>

              {/* Quick Actions (Replace / Remove) */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono transition shadow-sm"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition shadow-sm"
                >
                  Replace Photo
                </button>
              </div>
            </div>
          ) : useWebcam ? (
            /* STATE B: Live Webcam Stream with Alignment Guide */
            <div className="relative w-full h-full bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Facial Alignment Guide (Oval + Chin + Eye Guide) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[62%] sm:w-[50%] h-[80%] sm:h-[75%] border-2 border-teal-400/70 rounded-[48%] flex flex-col justify-between py-8 sm:py-10 px-4">
                  <div className="w-full border-t border-teal-400/50 relative">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30">
                      Align Eye Level Here
                    </span>
                  </div>
                  <div className="w-1/3 mx-auto border-t border-teal-400/50 relative">
                    <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30">
                      Chin Line
                    </span>
                  </div>
                </div>
              </div>

              {/* Webcam Controls */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
                <button
                  type="button"
                  onClick={() => setUseWebcam(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-mono transition border border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={captureWebcamSnapshot}
                  className="px-6 py-2.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>Capture Frame</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
                  }
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-200 transition border border-slate-700"
                  title="Flip camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STATE C: Empty / Initial Prompt */
            <div className="text-center p-6 space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-teal-400 border border-slate-700 flex items-center justify-center mx-auto shadow-sm">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Position Frontal Facial Photo
                </h3>
                <p className="text-xs text-slate-400">
                  Select a well-lit photo or initialize your webcam feed to scan 8 cutaneous biomarkers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUseWebcam(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Camera className="w-4 h-4 text-teal-400" />
                  <span>Launch Camera</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Diagnostic Quality Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
            <Sun className="w-4 h-4 text-teal-600" />
            <span>Optimal Precision Capture Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full face centered & clear</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Diffused natural daylight</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero beauty smoothing filters</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Eyewear removed, hair cleared</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Neutral background</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>JPEG, PNG, WebP up to 15MB</span>
            </div>
          </div>
        </div>

        {/* Consent & Privacy Confirmation */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div className="space-y-0.5 text-xs text-slate-800">
              <span className="font-mono font-semibold text-slate-900">
                Local-Only Biometric Processing Consent
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Photographs are analyzed locally via neural weights for clinical assessment and routine synthesis. Zero third-party telemetry or ad-network tracking.
              </p>
            </div>
          </label>
        </div>

        {/* Action Button: Run Clinical Inference */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Trust Architecture • Non-Invasive Inference</span>
          </div>

          <button
            type="button"
            disabled={!selectedImage || !consentGiven || isLoading}
            onClick={handleAnalyze}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing Neural Inference...</span>
              </>
            ) : (
              <>
                <span>Run Cutaneous Inference</span>
                <Sparkles className="w-4 h-4 text-teal-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
