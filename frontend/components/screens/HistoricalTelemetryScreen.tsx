'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Droplet,
  Sun,
  Activity,
  Check,
  Copy,
  X,
  Stethoscope,
  ChevronDown,
  Sparkles,
  Sliders,
  AlertCircle,
  Camera,
  Database
} from 'lucide-react';
import { apiService, AnalysisResponse, UserAccount } from '../../services/api';

interface HistoricalTelemetryScreenProps {
  onBackToDashboard: () => void;
  onOpenAnalysisResults: () => void;
  onOpenConsultation: () => void;
  currentUser?: UserAccount | null;
  latestAnalysis?: AnalysisResponse | null;
}

interface NormalizedScan {
  id: string;
  date: string;
  time: string;
  barrierScore: number;
  skinType: string;
  primaryConcern: string;
  acneGrade: string;
  requiresReferral: boolean;
  rawAnalysisId: string;
}

export const HistoricalTelemetryScreen: React.FC<HistoricalTelemetryScreenProps> = ({
  onBackToDashboard,
  onOpenAnalysisResults,
  onOpenConsultation,
  currentUser,
  latestAnalysis,
}) => {
  const [scans, setScans] = useState<NormalizedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const resp = await apiService.getAnalyses();
        const items = resp?.items || [];
        
        let normalized: NormalizedScan[] = items.map((item: any, idx: number) => {
          const d = item.created_at ? new Date(item.created_at) : new Date();
          return {
            id: `#DN-${item.analysis_id ? item.analysis_id.slice(0, 6).toUpperCase() : `00${idx + 1}`}`,
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            barrierScore: item.overall_health_score || 0,
            skinType: item.detected_skin_type || 'Combination',
            primaryConcern: item.primary_concern || 'None',
            acneGrade: item.acne_severity_grade || 'None',
            requiresReferral: !!item.requires_clinical_referral,
            rawAnalysisId: item.analysis_id || '',
          };
        });

        if (normalized.length === 0 && latestAnalysis) {
          const d = latestAnalysis.timestamp ? new Date(latestAnalysis.timestamp) : new Date();
          normalized = [
            {
              id: `#DN-${latestAnalysis.analysis_id ? latestAnalysis.analysis_id.slice(0, 6).toUpperCase() : 'ACTIVE'}`,
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              barrierScore: latestAnalysis.overall_health_score,
              skinType: latestAnalysis.detected_skin_type,
              primaryConcern: latestAnalysis.top_concerns?.[0] || 'Evaluated',
              acneGrade: latestAnalysis.acne_severity_grade || 'None',
              requiresReferral: latestAnalysis.requires_clinical_referral,
              rawAnalysisId: latestAnalysis.analysis_id,
            },
          ];
        }

        if (isMounted) {
          setScans(normalized);
        }
      } catch (err) {
        if (latestAnalysis && isMounted) {
          const d = latestAnalysis.timestamp ? new Date(latestAnalysis.timestamp) : new Date();
          setScans([
            {
              id: `#DN-${latestAnalysis.analysis_id ? latestAnalysis.analysis_id.slice(0, 6).toUpperCase() : 'ACTIVE'}`,
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              barrierScore: latestAnalysis.overall_health_score,
              skinType: latestAnalysis.detected_skin_type,
              primaryConcern: latestAnalysis.top_concerns?.[0] || 'Evaluated',
              acneGrade: latestAnalysis.acne_severity_grade || 'None',
              requiresReferral: latestAnalysis.requires_clinical_referral,
              rawAnalysisId: latestAnalysis.analysis_id,
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [latestAnalysis]);

  const filteredScans = scans.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.primaryConcern.toLowerCase().includes(q) ||
      s.skinType.toLowerCase().includes(q) ||
      s.date.toLowerCase().includes(q)
    );
  });

  const latestScan = scans[0];

  const fhirJsonPayload = {
    resourceType: 'Bundle',
    id: `DN-BUNDLE-${Date.now()}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/dermal-telemetry-bundle'],
      lastUpdated: new Date().toISOString(),
      security: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted Clinical Telemetry',
        },
      ],
    },
    type: 'collection',
    timestamp: new Date().toISOString(),
    total: scans.length,
    entry: [
      {
        fullUrl: `urn:uuid:patient-${currentUser?.id || 'guest'}`,
        resource: {
          resourceType: 'Patient',
          id: currentUser?.id || 'anonymous-guest',
          name: [{ use: 'official', text: currentUser?.full_name || 'Anonymous Patient' }],
        },
      },
      {
        fullUrl: 'urn:uuid:device-dermanova-vision-ai',
        resource: {
          resourceType: 'Device',
          id: 'DERMANOVA-EFFICIENTNET-B0',
          deviceName: [{ name: 'DermaNova Multi-Spectral Optical Dermatology AI', type: 'model-name' }],
          version: [{ value: 'v1.0.0' }],
        },
      },
      ...(latestScan ? [
        {
          fullUrl: `urn:uuid:observation-barrier-${latestScan.rawAnalysisId}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-barrier-${latestScan.rawAnalysisId}`,
            status: 'final',
            code: { text: 'Cutaneous Barrier Health Score' },
            valueQuantity: { value: latestScan.barrierScore, unit: 'points (0-100)', system: 'https://dermanova.ai/metrics' },
            interpretation: [{ text: `Skin Type: ${latestScan.skinType}` }],
          },
        }
      ] : []),
    ],
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirJsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500">Retrieving longitudinal SQLite telemetry records...</span>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full space-y-6 animate-fade-in py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            No Telemetry Scans Recorded
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your calibration archive stores longitudinal facial scans, barrier health scores, and chromatic normalizations. Perform your first scan to initiate your biometric telemetry log.
          </p>
          <button
            onClick={onOpenAnalysisResults}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition shadow-xs"
          >
            <Camera className="w-4 h-4 text-teal-400" />
            <span>Perform Initial Skin Scan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      
      {/* Top Clinical Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="text-teal-700 font-bold uppercase tracking-wider">Telemetry Vault</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">SQLite Longitudinal Index</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
              {scans.length} {scans.length === 1 ? 'Scan' : 'Scans'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Calibration Archive & Telemetry Log
          </h1>
          <p className="text-xs text-slate-500">
            Longitudinal repository of verified optical facial scans, condition findings, and barrier health scores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsFhirModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <FileCode className="w-4 h-4 text-teal-600" />
            <span>Export FHIR Bundle</span>
          </button>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Consult Provider</span>
          </button>
        </div>
      </div>

      {/* Dynamic Telemetry Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500">
            <span>Total Ingestions</span>
            <History className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-2xl font-bold text-slate-900">{scans.length}</span>
            <span className="text-xs text-slate-500 font-mono">Records</span>
          </div>
          <p className="text-[11px] text-teal-700 font-mono font-medium">SQLite Indexed</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
            <span>Barrier Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-2xl font-bold text-emerald-900">{latestScan ? `${latestScan.barrierScore}/100` : '—'}</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-mono font-semibold">
            {latestScan ? latestScan.date : 'No scan'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500">
            <span>Skin Type Baseline</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {latestScan ? latestScan.skinType : '—'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Calibrated</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500">
            <span>Triage Priority</span>
            <Activity className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-base font-bold text-slate-900 truncate">
              {latestScan ? latestScan.primaryConcern : 'None'}
            </span>
          </div>
          <p className="text-[11px] text-teal-700 font-mono">
            {latestScan?.requiresReferral ? 'Clinical Review' : 'Normative Target'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scans by ID, date, or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Card Grid
          </button>
        </div>
      </div>

      {/* Main Scans List */}
      {viewMode === 'matrix' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Record ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Barrier Score</th>
                <th className="p-3.5">Skin Type</th>
                <th className="p-3.5">Primary Target</th>
                <th className="p-3.5">Triage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScans.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-bold text-slate-900">{s.id}</td>
                  <td className="p-3.5 text-slate-500">{s.date} • {s.time}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {s.barrierScore} / 100
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-900 font-medium">{s.skinType}</td>
                  <td className="p-3.5 text-slate-500">{s.primaryConcern}</td>
                  <td className="p-3.5">
                    {s.requiresReferral ? (
                      <span className="text-amber-800 font-bold">Referral Advised</span>
                    ) : (
                      <span className="text-teal-700 font-semibold">Normative</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredScans.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{s.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  Score: {s.barrierScore}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {s.date} at {s.time}
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1 font-mono">
                <div><span className="text-slate-500">Classification:</span> <strong className="text-slate-900">{s.skinType}</strong></div>
                <div><span className="text-slate-500">Biomarker:</span> <strong className="text-slate-900">{s.primaryConcern}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FHIR Export Modal */}
      {isFhirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900">HL7 FHIR Clinical Telemetry Bundle</h3>
                <p className="text-xs text-slate-500">Standardized clinical exchange format for your electronic medical record (EMR)</p>
              </div>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-teal-300 font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800">
              <pre>{JSON.stringify(fhirJsonPayload, null, 2)}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleCopyJson}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                <span>{copiedJson ? 'Copied to Clipboard' : 'Copy FHIR JSON'}</span>
              </button>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
