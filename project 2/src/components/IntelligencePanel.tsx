import type { CalculationResult } from '@/types';
import { Ruler, Clock, Navigation, MapPin, CheckCircle2, Activity, Save, FileDown, FileText, BarChart3, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface IntelligencePanelProps {
  result: CalculationResult;
  onSaveMission: () => void;
  onPrintReport: () => void;
  onExportGeoJSON: () => void;
  onGoToAnalysis: () => void;
}

function MetricCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Ruler;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-panel rounded-md border border-subtle p-3 flex items-start gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-muted uppercase tracking-wider font-medium">{label}</div>
        <div className="text-base font-bold text-primary truncate">{value}</div>
        {sub && <div className="text-[10px] text-faint mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function IntelligencePanel({ result, onSaveMission, onPrintReport, onExportGeoJSON, onGoToAnalysis }: IntelligencePanelProps) {
  const areaDisplay = result.searchAreaKm2 >= 1000
    ? `${(result.searchAreaKm2 / 1000).toFixed(2)}k km²`
    : `${result.searchAreaKm2.toFixed(1)} km²`;

  const completenessColor =
    result.inputCompleteness >= 90 ? 'text-radar' :
    result.inputCompleteness >= 50 ? 'text-amber' : 'text-critical';

  return (
    <div className="bg-panel rounded-lg border border-subtle p-4 space-y-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Mission Intelligence</h3>
        </div>
        {result.isSimulated && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-dim text-amber font-semibold border border-amber/20">
            SIMULATED
          </span>
        )}
      </div>

      <div className="text-[10px] text-faint">
        Mission Ref: <span className="text-muted font-mono">{result.missionRef}</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={Ruler}
          label="Search Area"
          value={areaDisplay}
          accent="bg-cyan-dim text-cyan"
        />
        <MetricCard
          icon={Clock}
          label="Elapsed Time"
          value={result.elapsedTimeLabel}
          sub="since last contact"
          accent="bg-cyan-dim text-cyan"
        />
        <MetricCard
          icon={Navigation}
          label="Nominal Distance"
          value={result.nominalDistanceLabel}
          sub={`wind drift: ${result.windDriftKm.toFixed(1)} km`}
          accent="bg-radar-dim text-radar"
        />
        <MetricCard
          icon={MapPin}
          label="Uncertainty"
          value={`${result.positionUncertaintyKm} km`}
          sub="radius"
          accent="bg-amber-dim text-amber"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Input Complete"
          value={`${result.inputCompleteness}%`}
          accent={`bg-elevated ${completenessColor}`}
        />
        <MetricCard
          icon={Activity}
          label="Calc Status"
          value="Complete"
          sub={new Date(result.calculationTimeUTC).toUTCString().slice(17, 25)}
          accent="bg-radar-dim text-radar"
        />
      </div>

      {/* Assumptions */}
      {result.assumptions.length > 0 && (
        <div className="bg-elevated rounded-md border border-subtle p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-cyan" />
            <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wide">Model Assumptions</h4>
          </div>
          <ul className="space-y-1.5">
            {result.assumptions.map((a, i) => (
              <li key={i} className="text-[11px] text-muted leading-relaxed flex gap-1.5">
                <span className="text-cyan flex-shrink-0">▸</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Info */}
      {result.missingInfo.length > 0 && (
        <div className="bg-elevated rounded-md border border-amber/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber" />
            <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wide">Missing Information</h4>
          </div>
          <ul className="space-y-1.5">
            {result.missingInfo.map((m, i) => (
              <li key={i} className="text-[11px] text-muted leading-relaxed flex gap-1.5">
                <span className="text-amber flex-shrink-0">▸</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-elevated rounded-md border border-amber/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber" />
            <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wide">Warnings</h4>
          </div>
          <ul className="space-y-1.5">
            {result.warnings.map((w, i) => (
              <li key={i} className="text-[11px] text-amber/90 leading-relaxed flex gap-1.5">
                <span className="text-amber flex-shrink-0">▸</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Limitations */}
      <div className="bg-elevated rounded-md border border-critical/20 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-critical" />
          <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wide">Model Limitations</h4>
        </div>
        <ul className="space-y-1.5">
          {result.limitations.map((l, i) => (
            <li key={i} className="text-[11px] text-muted leading-relaxed flex gap-1.5">
              <span className="text-critical flex-shrink-0">▸</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSaveMission}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-elevated text-primary text-xs font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-cyan" />
            Save Mission
          </button>
          <button
            onClick={onGoToAnalysis}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-elevated text-primary text-xs font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan" />
            Analyze
          </button>
        </div>
        <button
          onClick={onPrintReport}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-elevated text-primary text-xs font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan" />
          Print / Export Report
        </button>
        <button
          onClick={onExportGeoJSON}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-muted text-xs font-medium rounded-md border border-subtle hover:text-primary hover:border-default transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          Download GeoJSON
        </button>
      </div>
    </div>
  );
}
