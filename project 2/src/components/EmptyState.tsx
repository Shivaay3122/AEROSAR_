import { Plane, Rocket, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  onDemo: () => void;
  onNewMission: () => void;
}

export default function EmptyState({ onDemo, onNewMission }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-lg text-center animate-slide-up">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 rounded-full bg-cyan-dim blur-2xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan/15 to-transparent border border-cyan/25 flex items-center justify-center shadow-glow">
            <Plane className="w-10 h-10 text-cyan" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
          Ready to define a search mission
        </h1>
        <p className="text-muted text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
          Enter last known position, aircraft details, and environmental conditions to estimate
          and visualize a potential search region on an interactive map.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onDemo}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan text-base font-semibold rounded-md hover:bg-cyan/90 transition-colors shadow-glow"
            style={{ color: '#080D18' }}
          >
            <Rocket className="w-4 h-4" />
            Load Demo Mission
          </button>
          <button
            onClick={onNewMission}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-elevated text-primary font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
          >
            <Plane className="w-4 h-4 text-cyan" />
            Start New Mission
          </button>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-dim border border-amber/20 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5 text-amber" />
          <span className="text-[11px] text-amber font-medium">
            Prototype only — not for real emergency response
          </span>
        </div>
      </div>
    </div>
  );
}
