'use client';

import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface HistoricalTelemetryScreenProps {
  onBackToDashboard: () => void;
  onOpenAnalysisResults: () => void;
  onOpenConsultation: () => void;
}

interface ScanRecord {
  id: string;
  date: string;
  time: string;
  dayNumber: number;
  weekNumber: number;
  barrierScore: number;
  barrierDelta: string;
  hydrationPercent: number;
  tewlRate: string;
  erythemaPercent: number;
  erythemaStatus: string;
  ostiaPurity: number;
  microclimate: string;
  batchContext: string;
  chromaticTemp: string;
  isActiveBaseline?: boolean;
}

const mockScanRecords: ScanRecord[] = [
  {
    id: '#DN-8841-B',
    date: 'Nov 29, 2024',
    time: '08:42 PST',
    dayNumber: 56,
    weekNumber: 8,
    barrierScore: 89,
    barrierDelta: '+4 Δ',
    hydrationPercent: 84,
    tewlRate: '8.2 g/m²h',
    erythemaPercent: 12,
    erythemaStatus: 'Normative Flush',
    ostiaPurity: 78,
    microclimate: 'Seattle • RH 44%',
    batchContext: 'Formulation Batch 04 active (Centella 1%)',
    chromaticTemp: '5400K D65 Daylight',
    isActiveBaseline: true,
  },
  {
    id: '#DN-8622-A',
    date: 'Nov 15, 2024',
    time: '09:15 PST',
    dayNumber: 42,
    weekNumber: 6,
    barrierScore: 85,
    barrierDelta: '+5 Δ',
    hydrationPercent: 79,
    tewlRate: '10.4 g/m²h',
    erythemaPercent: 15,
    erythemaStatus: 'Mild Reactive',
    ostiaPurity: 74,
    microclimate: 'Seattle • RH 48%',
    batchContext: 'Azelaic Acid 10% daily introduced',
    chromaticTemp: '5400K Daylight',
  },
  {
    id: '#DN-8314-C',
    date: 'Nov 01, 2024',
    time: '18:30 PST',
    dayNumber: 28,
    weekNumber: 4,
    barrierScore: 75,
    barrierDelta: '+7 Δ',
    hydrationPercent: 69,
    tewlRate: '13.1 g/m²h',
    erythemaPercent: 18,
    erythemaStatus: 'Moderate',
    ostiaPurity: 69,
    microclimate: 'Portland • RH 52%',
    batchContext: 'Mid-cycle tele-consult review complete',
    chromaticTemp: '5400K Daylight',
  },
  {
    id: '#DN-8109-B',
    date: 'Oct 18, 2024',
    time: '08:10 PST',
    dayNumber: 14,
    weekNumber: 2,
    barrierScore: 71,
    barrierDelta: '+3 Δ',
    hydrationPercent: 62,
    tewlRate: '15.6 g/m²h',
    erythemaPercent: 23,
    erythemaStatus: 'Transient Erythema',
    ostiaPurity: 64,
    microclimate: 'Seattle • RH 40%',
    batchContext: 'Ceramide NP Barrier Cream added',
    chromaticTemp: '5400K Daylight',
  },
  {
    id: '#DN-7910-A',
    date: 'Oct 04, 2024',
    time: '10:05 PST',
    dayNumber: 0,
    weekNumber: 0,
    barrierScore: 68,
    barrierDelta: 'Baseline',
    hydrationPercent: 52,
    tewlRate: '19.4 g/m²h',
    erythemaPercent: 28,
    erythemaStatus: 'Grade 1 Flushing',
    ostiaPurity: 58,
    microclimate: 'Seattle • RH 38%',
    batchContext: 'Initial intake calibration (Intake baseline)',
    chromaticTemp: '5400K Daylight',
  },
];

export const HistoricalTelemetryScreen: React.FC<HistoricalTelemetryScreenProps> = ({
  onBackToDashboard,
  onOpenAnalysisResults,
  onOpenConsultation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Scans');
  const [selectedScans, setSelectedScans] = useState<string[]>(['#DN-8841-B', '#DN-7910-A']);
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [fhirTab, setFhirTab] = useState<'summary' | 'json' | 'crypto'>('json');
  const [copiedJson, setCopiedJson] = useState(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  const filterChips = [
    'All Scans (18)',
    'Flagged Concerns (4)',
    'Barrier Regimes (8)',
    'Post-Consultation (3)',
    'Erythema Shifts (5)',
  ];

  const toggleSelectScan = (id: string) => {
    if (selectedScans.includes(id)) {
      setSelectedScans(selectedScans.filter((s) => s !== id));
    } else {
      if (selectedScans.length >= 2) {
        setSelectedScans([selectedScans[1], id]);
      } else {
        setSelectedScans([...selectedScans, id]);
      }
    }
  };

  const fhirJsonPayload = {
    resourceType: 'Bundle',
    id: 'OB-2024-1128-DN8841B',
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/dermal-telemetry-bundle'],
      lastUpdated: '2024-11-29T08:32:14Z',
      security: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted Clinical Telemetry',
        },
      ],
    },
    type: 'collection',
    timestamp: '2024-11-29T08:32:14Z',
    total: 6,
    entry: [
      {
        fullUrl: 'urn:uuid:patient-elena-vance',
        resource: {
          resourceType: 'Patient',
          id: 'DN-8841-B',
          identifier: [{ system: 'https://dermanova.ai/patients', value: 'DN-8841-B' }],
          name: [{ use: 'official', family: 'Vance', given: ['Elena'] }],
          gender: 'female',
        },
      },
      {
        fullUrl: 'urn:uuid:device-dermanova-vision-ai',
        resource: {
          resourceType: 'Device',
          id: 'DN-VISION-AI-V1',
          deviceName: [{ name: 'DermaNova Optical Multi-Spectral Vision AI', type: 'model-name' }],
          version: [{ value: 'v1.0.4-calibrated-5400k' }],
        },
      },
      {
        fullUrl: 'urn:uuid:observation-barrier-integrity',
        resource: {
          resourceType: 'Observation',
          id: 'obs-barrier-89',
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam' }] }],
          code: { text: 'Stratum Corneum Barrier Integrity Index' },
          valueQuantity: { value: 89, unit: 'points (0-100)', system: 'https://dermanova.ai/metrics' },
          interpretation: [{ coding: [{ code: 'N', display: 'Optimal / Tier I Resilient' }] }],
        },
      },
      {
        fullUrl: 'urn:uuid:observation-malar-erythema',
        resource: {
          resourceType: 'Observation',
          id: 'obs-erythema-12',
          status: 'final',
          code: { text: 'Malar Micro-Vascular Coverage' },
          valueQuantity: { value: 12, unit: '% surface area', system: 'http://unitsofmeasure.org' },
          note: [{ text: 'Normative physiological vasodilation under 5400K standardized daylight' }],
        },
      },
    ],
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirJsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in pb-16">
      
      {/* =======================================================================
          TOP CONTEXT & BREADCRUMB BAR
         ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#777D76]">
            <span className="text-[#527665] font-semibold uppercase tracking-wider">Telemetry Vault</span>
            <span>/</span>
            <span className="text-[#304D40] font-semibold">Biometric Longitudinal Log</span>
            <span>/</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] font-semibold text-[10px]">
              18 Calibrated Scans
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#252923] tracking-tight">
            Calibration Archive &amp; Telemetry Log
          </h1>
          <p className="text-sm text-[#777D76] max-w-2xl leading-relaxed">
            Complete longitudinal repository of 18 multi-spectral biometric scans, chromatic daylight normalizations, and localized dermal biomarker telemetry across 56 days of circadian observation.
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

      {/* =======================================================================
          HIGH-LEVEL TELEMETRY METRIC STRIP (5-COL GRID)
         ======================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Scans Logged</span>
            <History className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#252923] font-semibold">18</span>
            <span className="text-xs text-[#777D76]">Captures</span>
          </div>
          <p className="text-[11px] text-[#527665] font-mono">8 consecutive cohorts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Baseline (Day 0)</span>
            <Calendar className="w-3.5 h-3.5 text-[#777D76]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#252923]">Oct 04</span>
            <span className="text-xs text-[#777D76]">#DN-7910</span>
          </div>
          <p className="text-[11px] text-[#777D76] font-mono">Intake Barrier 68/100</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E8EFE9]/40 border border-[#c4ebd7] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#304D40]">
            <span>Latest Calibrated</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#304D40]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#304D40] font-semibold">Nov 29</span>
            <span className="text-xs text-[#304D40] font-mono font-semibold">#DN-8841</span>
          </div>
          <p className="text-[11px] text-[#304D40] font-mono font-semibold">Active Barrier 89/100</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>TEWL Mean Flux</span>
            <Droplet className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#527665] font-semibold">-43.5%</span>
            <span className="text-xs text-[#777D76]">Vapor Loss</span>
          </div>
          <p className="text-[11px] text-[#527665] font-mono">Consistent lipid repletion</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#777D76]">
            <span>Chromatic Match</span>
            <Sun className="w-3.5 h-3.5 text-[#527665]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="font-serif text-2xl text-[#252923] font-semibold">100%</span>
            <span className="text-xs text-[#527665] font-semibold">5400K Verified</span>
          </div>
          <p className="text-[11px] text-[#777D76] font-mono">ΔE &lt; 0.38 tolerance</p>
        </div>
      </div>

      {/* =======================================================================
          LONGITUDINAL KINETIC TRAJECTORY (56-DAY DELTA PROGRESS CARD)
         ======================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E8E1] shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8EFE9] flex items-center justify-center text-[#304D40]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base text-[#252923] font-semibold">
                Longitudinal Kinetic Trajectory (56-Day Progress Delta)
              </h2>
              <p className="text-xs text-[#777D76]">
                Circadian observation tracking stratum corneum barrier reinforcement and micro-vascular recovery.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E8EFE9] text-[#304D40] text-xs font-mono font-semibold">
            56-Day Delta: +21 pts
          </span>
        </div>

        {/* 3 Metric Sub-tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FAF9F6] rounded-xl text-center">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-[#777D76]">Barrier Integrity Recovery</span>
            <div className="text-lg font-serif font-bold text-[#304D40]">+21 pts</div>
            <span className="text-[11px] text-[#777D76]">68 (Baseline) → 89 (Tier I Resilient)</span>
          </div>
          <div className="space-y-0.5 border-y sm:border-y-0 sm:border-x border-[#E8E8E1] py-2 sm:py-0">
            <span className="text-[11px] font-mono uppercase text-[#777D76]">Calibrated TEWL Flux</span>
            <div className="text-lg font-serif font-bold text-[#252923]">14.2 g/m²h</div>
            <span className="text-[11px] text-[#527665] font-semibold">-34% vs initial intake</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase text-[#777D76]">Routine Adherence</span>
            <div className="text-lg font-serif font-bold text-[#527665]">100%</div>
            <span className="text-[11px] text-[#777D76]">14d strict circadian compliance</span>
          </div>
        </div>

        {/* Progress Bar Timeline */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs font-mono text-[#777D76]">
            <span>Baseline: 68 (Reactive)</span>
            <span className="font-semibold text-[#304D40]">Current Level: 89 (Optimal / Tier I)</span>
          </div>
          <div className="w-full h-2.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#E8E8E1]">
            <div className="h-full bg-[#527665] rounded-full transition-all duration-700" style={{ width: '89%' }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#777D76]">
            <span>Oct 04</span>
            <span>Oct 18</span>
            <span>Nov 01</span>
            <span>Nov 15</span>
            <span className="font-bold text-[#304D40]">Today (Nov 29)</span>
          </div>
        </div>
      </div>

      {/* =======================================================================
          TOOLBAR: SEARCH, FILTER CHIPS & VIEW SWITCHER
         ======================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E8E1] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777D76]" />
            <input
              type="text"
              placeholder="Search by Scan ID (e.g. #DN-8841), formulation notes, or biomarkers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-xs font-sans text-[#252923] placeholder:text-[#777D76] focus:outline-none focus:border-[#527665] transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-[#E8E8E1] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#304D40] shadow-sm'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Telemetry Matrix
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-white text-[#304D40] shadow-sm'
                  : 'text-[#777D76] hover:text-[#252923]'
              }`}
            >
              Visual Cards
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {filterChips.map((chip) => {
            const label = chip.split(' ')[0];
            const isActive = activeFilter.startsWith(label);
            return (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-mono transition shadow-xs ${
                  isActive
                    ? 'bg-[#304D40] text-white font-semibold'
                    : 'bg-[#FAF9F6] hover:bg-[#E8EFE9] text-[#777D76] border border-[#E8E8E1]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          DIFFERENTIAL COMPARISON BAR (IF SCANS SELECTED)
         ======================================================================= */}
      {selectedScans.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#304D40] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-[#E8EFE9] animate-pulse" />
            <span>
              Differential Comparison Mode: <strong>{selectedScans.join(' vs ')}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAnalysisResults}
              className="px-3.5 py-1.5 rounded-lg bg-white text-[#304D40] text-xs font-semibold hover:bg-[#FAF9F6] transition"
            >
              Run Differential Vector Analysis
            </button>
            <button
              onClick={() => setSelectedScans([])}
              className="px-2 py-1.5 text-xs text-white/80 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          TELEMETRY DATA MATRIX TABLE
         ======================================================================= */}
      {viewMode === 'matrix' ? (
        <div className="rounded-2xl bg-white border border-[#E8E8E1] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] text-[#777D76] font-mono uppercase tracking-wider text-[11px] border-b border-[#E8E8E1]">
                  <th className="py-3 px-4 font-semibold">Select</th>
                  <th className="py-3 px-4 font-semibold">Scan Record</th>
                  <th className="py-3 px-4 font-semibold">Barrier Score</th>
                  <th className="py-3 px-4 font-semibold">Corneum Hydration</th>
                  <th className="py-3 px-4 font-semibold">Malar Erythema</th>
                  <th className="py-3 px-4 font-semibold">Ostia Purity</th>
                  <th className="py-3 px-4 font-semibold">Microclimate &amp; Context</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E1] text-[#252923]">
                {mockScanRecords.map((scan) => {
                  const isSelected = selectedScans.includes(scan.id);
                  return (
                    <tr
                      key={scan.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#E8EFE9]/40' : 'hover:bg-[#FAF9F6]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectScan(scan.id)}
                          className="w-4 h-4 rounded text-[#304D40] accent-[#304D40] cursor-pointer"
                        />
                      </td>

                      {/* Scan ID & Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#304D40]">{scan.id}</span>
                            {scan.isActiveBaseline && (
                              <span className="px-1.5 py-0.5 rounded bg-[#304D40] text-white text-[9px] font-mono font-semibold uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#777D76]">
                            Day {scan.dayNumber} • Week {scan.weekNumber} • {scan.date}
                          </div>
                          <div className="text-[10px] font-mono text-[#777D76]">{scan.chromaticTemp}</div>
                        </div>
                      </td>

                      {/* Barrier Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif text-lg font-bold text-[#252923]">
                            {scan.barrierScore}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#E8EFE9] text-[#304D40] font-mono text-[10px] font-semibold">
                            {scan.barrierDelta}
                          </span>
                        </div>
                      </td>

                      {/* Hydration */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-[#527665]">{scan.hydrationPercent}%</span>
                            <span className="text-[10px] text-[#777D76]">{scan.tewlRate}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#E8E8E1]">
                            <div
                              className="h-full bg-[#527665] rounded-full"
                              style={{ width: `${scan.hydrationPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Malar Erythema */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[#252923]">{scan.erythemaPercent}% Coverage</div>
                          <div className="text-[10px] font-mono text-[#777D76]">{scan.erythemaStatus}</div>
                        </div>
                      </td>

                      {/* Ostia Purity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono font-semibold">
                          <span>{scan.ostiaPurity}</span>
                          <span className="text-[#777D76] font-normal">/100</span>
                        </div>
                      </td>

                      {/* Microclimate */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="text-xs text-[#252923] font-medium">{scan.microclimate}</div>
                          <div className="text-[11px] text-[#777D76] truncate">{scan.batchContext}</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={onOpenAnalysisResults}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#E8EFE9] text-[#304D40] font-semibold text-[11px] transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Cards Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockScanRecords.map((scan) => {
            const isSelected = selectedScans.includes(scan.id);
            return (
              <div
                key={scan.id}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  isSelected ? 'border-[#304D40] ring-2 ring-[#304D40]/20 shadow-md' : 'border-[#E8E8E1] shadow-sm'
                } space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-[#304D40]">{scan.id}</span>
                      {scan.isActiveBaseline && (
                        <span className="px-1.5 py-0.5 rounded bg-[#304D40] text-white text-[9px] font-mono font-semibold">
                          Active Baseline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777D76] pt-0.5">{scan.date} • Day {scan.dayNumber}</p>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-[#FAF9F6] px-2.5 py-1 rounded-lg border border-[#E8E8E1]">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectScan(scan.id)}
                      className="w-3.5 h-3.5 accent-[#304D40] cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-[#777D76]">Compare</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                    <span className="text-[10px] font-mono text-[#777D76] block">Barrier Integrity</span>
                    <span className="font-serif text-lg font-bold text-[#304D40]">{scan.barrierScore}/100</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                    <span className="text-[10px] font-mono text-[#777D76] block">Corneum Hydration</span>
                    <span className="font-serif text-lg font-bold text-[#527665]">{scan.hydrationPercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                    <span className="text-[10px] font-mono text-[#777D76] block">Malar Erythema</span>
                    <span className="font-sans font-bold text-[#252923]">{scan.erythemaPercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                    <span className="text-[10px] font-mono text-[#777D76] block">Pore Ostia</span>
                    <span className="font-sans font-bold text-[#252923]">{scan.ostiaPurity}/100</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F6] text-[11px] text-[#777D76] leading-relaxed">
                  {scan.batchContext}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={onOpenAnalysisResults}
                    className="text-xs font-semibold text-[#527665] hover:text-[#304D40] flex items-center gap-1"
                  >
                    <span>Inspect Full Telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-[#777D76]">{scan.chromaticTemp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =======================================================================
          DATA EXPORT & CRYPTOGRAPHIC RETENTION CONTROLS
         ======================================================================= */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E8E1] shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] flex items-center justify-center text-[#304D40] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base text-[#252923] font-semibold">
              Biometric Telemetry Ledger &amp; Cryptographic Standards
            </h3>
            <p className="text-xs text-[#777D76] leading-relaxed">
              DermaNova complies with HL7® FHIR® R4 and ISO 27001 standards. Raw photographic captures are cryptographically purged after landmark coordinate normalization. Only non-diagnostic numerical telemetry is retained in your private client vault.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setIsFhirModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-[#E8EFE9]" />
            <span>Export Clinical Dossier (FHIR JSON / PDF)</span>
          </button>
          <button
            onClick={() => {
              const csvContent =
                'ScanID,Date,BarrierScore,Hydration,Erythema,OstiaPurity,Microclimate\n' +
                mockScanRecords
                  .map(
                    (s) =>
                      `${s.id},${s.date},${s.barrierScore},${s.hydrationPercent}%,${s.erythemaPercent}%,${s.ostiaPurity},"${s.microclimate}"`
                  )
                  .join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'dermanova_telemetry_stream.csv';
              a.click();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#E8EFE9] border border-[#E8E8E1] text-[#252923] text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-[#527665]" />
            <span>Download CSV Bio-Metrics Stream</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          MODAL: HL7® FHIR® R4 CLINICAL TELEMETRY EXPORT
         ======================================================================= */}
      {isFhirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E8E1] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E8E8E1] flex items-start justify-between gap-4 bg-[#FAF9F6]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#304D40] text-[10px] font-mono font-semibold uppercase">
                    FHIR Release 4.0.1
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E8E8E1] text-[#527665] text-[10px] font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#527665]" />
                    Signed (Ed25519)
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[#252923] font-semibold">
                  HL7® FHIR® R4 Clinical Telemetry Export
                </h3>
                <p className="text-xs text-[#777D76]">
                  Patient ID: <strong className="text-[#252923]">#DN-8841-B</strong> • Bundle: #OB-2024-1128
                </p>
              </div>
              <button
                onClick={() => setIsFhirModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#E8E8E1] flex items-center justify-center text-[#777D76] transition shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Controls */}
            <div className="px-6 py-2.5 border-b border-[#E8E8E1] flex items-center gap-2 bg-white">
              <button
                onClick={() => setFhirTab('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                  fhirTab === 'json'
                    ? 'bg-[#304D40] text-white shadow-xs'
                    : 'text-[#777D76] hover:bg-[#FAF9F6]'
                }`}
              >
                FHIR JSON Bundle
              </button>
              <button
                onClick={() => setFhirTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                  fhirTab === 'summary'
                    ? 'bg-[#304D40] text-white shadow-xs'
                    : 'text-[#777D76] hover:bg-[#FAF9F6]'
                }`}
              >
                Clinical Summary
              </button>
              <button
                onClick={() => setFhirTab('crypto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                  fhirTab === 'crypto'
                    ? 'bg-[#304D40] text-white shadow-xs'
                    : 'text-[#777D76] hover:bg-[#FAF9F6]'
                }`}
              >
                Provenance &amp; Cryptography
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {fhirTab === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#777D76]">
                    <span>bundle-ob-2024-1128.json (4.8 KB)</span>
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 text-[#527665] font-semibold hover:underline"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#252923] text-[#c4ebd7] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-80 select-all">
                    {JSON.stringify(fhirJsonPayload, null, 2)}
                  </pre>
                </div>
              )}

              {fhirTab === 'summary' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-1.5">
                    <span className="font-mono text-[#777D76] uppercase text-[10px] block">Observation Scope</span>
                    <p className="text-[#252923] leading-relaxed">
                      56-day longitudinal facial skin analysis tracking barrier integrity recovery, erythema mitigation, and stratum corneum hydration kinetics. Verified under 5400K daylight standards.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                      <span className="text-[10px] font-mono text-[#777D76] block">Barrier Tier</span>
                      <strong className="text-sm text-[#304D40]">Tier I Resilient (89/100)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1]">
                      <span className="text-[10px] font-mono text-[#777D76] block">Vasomotor State</span>
                      <strong className="text-sm text-[#527665]">Transient (12% Normative)</strong>
                    </div>
                  </div>
                </div>
              )}

              {fhirTab === 'crypto' && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777D76]">Signature Algorithm:</span>
                      <span className="font-bold text-[#304D40]">Ed25519-SHA512</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777D76]">Key Identifier:</span>
                      <span className="font-bold text-[#252923]">did:dermanova:vault-pk-8841</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777D76]">Biometric Hash:</span>
                      <span className="font-bold text-[#527665] truncate max-w-[200px]">
                        e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#777D76] leading-relaxed">
                    This cryptographic payload verifies that the biometric observations were recorded without post-hoc manipulation and comply with HIPAA-grade zero-knowledge storage protocols.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E8E8E1] bg-[#FAF9F6] flex items-center justify-between">
              <span className="text-[11px] text-[#777D76] font-mono">
                Standard: HL7 FHIR Release 4.0.1
              </span>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(fhirJsonPayload, null, 2)], {
                    type: 'application/fhir+json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'bundle-ob-2024-1128-DN8841B.fhir.json';
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-[#304D40] text-white text-xs font-semibold hover:bg-[#253d33] transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download FHIR JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
