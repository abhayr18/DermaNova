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
  Camera
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

        // If no items in database response, but user has an active session scan, include it
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
        console.warn('Failed to load analysis history:', err);
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
        <div className="w-6 h-6 border-2 border-[#527665] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#777D76]">Loading telemetry records...</span>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="w-full space-y-8 animate-fade-in py-8">
        <div className="rounded-3xl border border-[#E8E8E1] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E8EFE9] text-[#304D40] flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-[#527665]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#252923]">
            No Telemetry Scans Recorded
          </h2>
          <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
            Your calibration archive stores longitudinal facial scans, barrier health scores, and chromatic normalizations. Perform your first scan to initiate your biometric telemetry log.
          </p>
          <button
            onClick={onOpenAnalysisResults}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#527665] hover:bg-[#304D40] text-white text-xs font-mono tracking-wider uppercase font-semibold transition shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Perform Initial Skin Scan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#777D76]">
            <span className="text-[#527665] font-semibold uppercase tracking-wider">Telemetry Vault</span>
            <span>/</span>
            <span className="text-[#304D40] font-semibold">Biometric Longitudinal Log</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] font-semibold text-[10px]">
              {scans.length} {scans.length === 1 ? 'Recorded Scan' : 'Recorded Scans'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#252923] tracking-tight">
            Calibration Archive &amp; Telemetry Log
          </h1>
          <p className="text-sm text-[#777D76] max-w-2xl leading-relaxed">
            Longitudinal repository of your verified optical facial scans, condition findings, and barrier health scores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsFhirModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <FileCode className="w-4 h-4 text-[#527665]" />
            <span>Export Clinical FHIR Dossier</span>
          </button>
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <Stethoscope className="w-4 h-4 text-[#E8EFE9]" />
            <span>Consult Provider</span>
          </button>
        </div>
      </div>

      {/* Dynamic Telemetry Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Total Scans</span>
            <History className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#252923] font-semibold">{scans.length}</span>
            <span className="text-xs text-[#777D76]">Captures</span>
          </div>
          <p className="text-[11px] text-[#527665] font-mono">Biometric history</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E8EFE9]/40 border border-[#c4ebd7] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#304D40]">
            <span>Latest Barrier Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#304D40]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#304D40] font-semibold">{latestScan ? `${latestScan.barrierScore}/100` : '—'}</span>
          </div>
          <p className="text-[11px] text-[#304D40] font-mono font-semibold">
            {latestScan ? latestScan.date : 'No scan'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Detected Skin Type</span>
            <Sparkles className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#252923] font-semibold">
              {latestScan ? latestScan.skinType : '—'}
            </span>
          </div>
          <p className="text-[11px] text-[#777D76] font-mono">Optical baseline</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Primary Focus</span>
            <Activity className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-xl text-[#252923] font-semibold truncate">
              {latestScan ? latestScan.primaryConcern : 'None'}
            </span>
          </div>
          <p className="text-[11px] text-[#527665] font-mono">
            {latestScan?.requiresReferral ? 'Clinical review advised' : 'Cosmetic maintenance'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777D76]" />
          <input
            type="text"
            placeholder="Search scans by ID, date, or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E8E1] text-xs font-mono text-[#252923] focus:outline-none focus:border-[#527665]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition ${
              viewMode === 'matrix'
                ? 'bg-white text-[#252923] font-semibold border border-[#E8E8E1] shadow-xs'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition ${
              viewMode === 'cards'
                ? 'bg-white text-[#252923] font-semibold border border-[#E8E8E1] shadow-xs'
                : 'text-[#777D76] hover:text-[#252923]'
            }`}
          >
            Cards View
          </button>
        </div>
      </div>

      {/* Main Scans List */}
      {viewMode === 'matrix' ? (
        <div className="overflow-x-auto rounded-3xl border border-[#E8E8E1] bg-white shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#E8E8E1] bg-[#FAF9F6] text-[#777D76] uppercase tracking-wider text-[10px]">
                <th className="p-4">Scan Identifier</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Barrier Score</th>
                <th className="p-4">Skin Type</th>
                <th className="p-4">Primary Concern</th>
                <th className="p-4">Triage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E1]">
              {filteredScans.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF9F6] transition">
                  <td className="p-4 font-semibold text-[#252923]">{s.id}</td>
                  <td className="p-4 text-[#777D76]">{s.date} • {s.time}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] font-semibold">
                      {s.barrierScore} / 100
                    </span>
                  </td>
                  <td className="p-4 text-[#252923]">{s.skinType}</td>
                  <td className="p-4 text-[#777D76]">{s.primaryConcern}</td>
                  <td className="p-4">
                    {s.requiresReferral ? (
                      <span className="text-[#b85c3c] font-semibold">Referral Recommended</span>
                    ) : (
                      <span className="text-[#527665]">Normative</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScans.map((s) => (
            <div key={s.id} className="p-5 rounded-3xl bg-white border border-[#E8E8E1] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#252923]">{s.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] text-[10px] font-mono font-semibold">
                  Score: {s.barrierScore}
                </span>
              </div>
              <div className="text-xs text-[#777D76] font-mono">
                {s.date} at {s.time}
              </div>
              <div className="pt-2 border-t border-[#E8E8E1] text-xs space-y-1">
                <div><strong>Skin Type:</strong> {s.skinType}</div>
                <div><strong>Primary Concern:</strong> {s.primaryConcern}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FHIR Export Modal */}
      {isFhirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl border border-[#E8E8E1] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div className="space-y-0.5">
                <h3 className="font-serif text-xl text-[#252923]">HL7 FHIR Clinical Telemetry Bundle</h3>
                <p className="text-xs text-[#777D76]">Standardized clinical exchange format for your electronic health records</p>
              </div>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF9F6] text-[#777D76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#1e231f] text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-96">
              <pre>{JSON.stringify(fhirJsonPayload, null, 2)}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleCopyJson}
                className="px-4 py-2 rounded-xl bg-[#527665] hover:bg-[#304D40] text-white text-xs font-mono transition flex items-center gap-1.5"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied to Clipboard' : 'Copy FHIR JSON'}</span>
              </button>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E8E1] text-xs font-mono text-[#777D76]"
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
