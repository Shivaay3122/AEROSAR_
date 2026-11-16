import { X, Radio, ArrowRight } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  { t: 'Last Known Position', d: 'Enter the aircraft\'s last known coordinates and UTC timestamp.' },
  { t: 'Validated Inputs', d: 'All inputs are validated for range and type before calculation proceeds.' },
  { t: 'Motion & Uncertainty Model', d: 'The engine estimates nominal movement along heading and models wind drift with a simplified heuristic.' },
  { t: 'Estimated Search Region', d: 'A convex hull of position-uncertainty circles defines the search polygon on the map.' },
  { t: 'Mission Report', d: 'Export a printable report or GeoJSON of the search geometry for coordination.' },
];

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-lg w-full bg-panel rounded-xl border border-default shadow-elevated p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded text-muted hover:text-primary hover:bg-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-dim border border-cyan/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">How AEROSAR Works</h2>
            <p className="text-xs text-muted">Search &amp; Rescue Intelligence System</p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-cyan-dim border border-cyan/30 text-cyan text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-faint rotate-90 my-1" />
                )}
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-primary">{step.t}</div>
                <div className="text-xs text-muted leading-relaxed">{step.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-3 bg-amber-dim border border-amber/20 rounded-md">
          <p className="text-[11px] text-amber leading-relaxed">
            AEROSAR is a decision-support prototype. It is not a validated operational
            search-and-rescue system. Real SAR operations require qualified coordination and
            validated procedures.
          </p>
        </div>
      </div>
    </div>
  );
}
