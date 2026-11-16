import type { MissionInputs } from '@/types';
import { useCallback } from 'react';
import { Calculator, Rocket, RotateCcw, Info, MapPin, Wind, Plane, AlertTriangle } from 'lucide-react';
import { speedLabel } from '@/lib/calculations';

interface MissionInputFormProps {
  inputs: MissionInputs;
  errors: Record<string, string>;
  onChange: (field: keyof MissionInputs, value: string | number) => void;
  onCalculate: () => void;
  onDemo: () => void;
  onReset: () => void;
  calculating: boolean;
}

function Field({
  label,
  required,
  optional,
  tooltip,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  tooltip?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-xs font-medium text-muted">{label}</label>
        {required && <span className="text-[10px] text-critical">*</span>}
        {optional && <span className="text-[10px] text-faint">(optional)</span>}
        {tooltip && (
          <span className="relative group">
            <Info className="w-3 h-3 text-faint cursor-help" />
            <span className="absolute left-full ml-2 top-0 z-10 hidden group-hover:block w-48 p-2 bg-elevated border border-default rounded-md text-[10px] text-muted shadow-elevated">
              {tooltip}
            </span>
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-[10px] text-critical flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full px-3 py-2 bg-input border border-subtle rounded-md text-sm text-primary placeholder-faint focus:outline-none focus:border-cyan/50 transition-colors";

export default function MissionInputForm({ inputs, errors, onChange, onCalculate, onDemo, onReset, calculating }: MissionInputFormProps) {
  const handleNumChange = useCallback((field: keyof MissionInputs, value: string) => {
    if (value === '') {
      onChange(field, 0);
    } else {
      const n = parseFloat(value);
      onChange(field, isNaN(n) ? 0 : n);
    }
  }, [onChange]);

  const formatLocalDT = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-panel rounded-lg border border-subtle p-4 space-y-4 h-full overflow-y-auto">
      {/* Section: Last Known Position */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Last Known Position</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" required tooltip="Decimal degrees, -90 to 90" error={errors.lat}>
            <input
              type="number"
              step="any"
              value={inputs.lat || ''}
              onChange={(e) => handleNumChange('lat', e.target.value)}
              className={inputClass}
              placeholder="36.852"
            />
          </Field>
          <Field label="Longitude" required tooltip="Decimal degrees, -180 to 180" error={errors.lon}>
            <input
              type="number"
              step="any"
              value={inputs.lon || ''}
              onChange={(e) => handleNumChange('lon', e.target.value)}
              className={inputClass}
              placeholder="-76.293"
            />
          </Field>
        </div>
        <p className="mt-1.5 text-[10px] text-cyan/70 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Tip: Click anywhere on the map to set coordinates automatically.
        </p>
        <div className="mt-3">
          <Field label="Timestamp (UTC)" required tooltip="Date and time of last contact in UTC" error={errors.timestamp}>
            <input
              type="datetime-local"
              value={formatLocalDT(inputs.timestamp)}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  onChange('timestamp', new Date(val).toISOString());
                } else {
                  onChange('timestamp', '');
                }
              }}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Position Uncertainty (km)" required tooltip="Radius of positional uncertainty around last known position">
            <input
              type="number"
              step="any"
              min="0"
              value={inputs.positionUncertaintyKm || ''}
              onChange={(e) => handleNumChange('positionUncertaintyKm', e.target.value)}
              className={inputClass}
              placeholder="8"
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      {/* Section: Aircraft Details */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Aircraft Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Heading (°)" required tooltip="Compass heading 0–359 degrees" error={errors.heading}>
            <input
              type="number"
              min="0"
              max="359"
              value={inputs.heading || ''}
              onChange={(e) => handleNumChange('heading', e.target.value)}
              className={inputClass}
              placeholder="75"
            />
          </Field>
          <Field label="Endurance (h)" required tooltip="Remaining fuel endurance in hours" error={errors.endurance}>
            <input
              type="number"
              step="any"
              min="0"
              value={inputs.endurance || ''}
              onChange={(e) => handleNumChange('endurance', e.target.value)}
              className={inputClass}
              placeholder="4.5"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Speed" required error={errors.speed}>
            <input
              type="number"
              step="any"
              min="0"
              value={inputs.speed || ''}
              onChange={(e) => handleNumChange('speed', e.target.value)}
              className={inputClass}
              placeholder="145"
            />
          </Field>
          <Field label="Unit" required>
            <select
              value={inputs.speedUnit}
              onChange={(e) => onChange('speedUnit', e.target.value)}
              className={inputClass}
            >
              <option value="knots">knots</option>
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      {/* Section: Environment */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Environment</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wind Dir (°)" required tooltip="Direction wind is coming FROM, 0–359" error={errors.windDirection}>
            <input
              type="number"
              min="0"
              max="359"
              value={inputs.windDirection || ''}
              onChange={(e) => handleNumChange('windDirection', e.target.value)}
              className={inputClass}
              placeholder="210"
            />
          </Field>
          <Field label="Wind Speed" required error={errors.windSpeed}>
            <input
              type="number"
              step="any"
              min="0"
              value={inputs.windSpeed || ''}
              onChange={(e) => handleNumChange('windSpeed', e.target.value)}
              className={inputClass}
              placeholder="22"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Wind Unit" required>
            <select
              value={inputs.windSpeedUnit}
              onChange={(e) => onChange('windSpeedUnit', e.target.value)}
              className={inputClass}
            >
              <option value="knots">knots</option>
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onCalculate}
          disabled={calculating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan text-base font-semibold rounded-md hover:bg-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
          style={{ color: '#080D18' }}
        >
          <Calculator className="w-4 h-4" />
          {calculating ? 'Calculating…' : 'Calculate Search Area'}
        </button>
        <button
          onClick={onDemo}
          disabled={calculating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-elevated text-primary font-medium rounded-md border border-default hover:border-cyan/30 transition-colors disabled:opacity-50"
        >
          <Rocket className="w-4 h-4 text-cyan" />
          Load Demo Mission
        </button>
        <button
          onClick={onReset}
          disabled={calculating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-muted font-medium rounded-md border border-subtle hover:text-primary hover:border-default transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Mission
        </button>
      </div>

      <div className="pt-2 text-[10px] text-faint text-center">
        Units: {speedLabel(inputs.speedUnit)} · {speedLabel(inputs.windSpeedUnit)} · km
      </div>
    </div>
  );
}
