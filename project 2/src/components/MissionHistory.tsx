import type { SavedMission } from '@/types';
import { History, Trash2, FileText, MapPin, Clock, ArrowUpRight } from 'lucide-react';

interface MissionHistoryProps {
  missions: SavedMission[];
  onOpen: (m: SavedMission) => void;
  onDelete: (id: string) => void;
}

export default function MissionHistory({ missions, onOpen, onDelete }: MissionHistoryProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-cyan" />
          <div>
            <h1 className="text-xl font-bold text-primary">Mission History</h1>
            <p className="text-xs text-muted">Saved mission snapshots stored locally in your browser</p>
          </div>
        </div>

        {missions.length === 0 ? (
          <div className="bg-panel rounded-lg border border-subtle p-12 text-center">
            <History className="w-10 h-10 text-faint mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-primary mb-1">No saved missions</h2>
            <p className="text-xs text-muted">
              Run a calculation from Mission Control and click "Save Mission" to store a snapshot here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                className="bg-panel rounded-lg border border-subtle p-4 flex items-center gap-4 hover:border-default transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-cyan-dim border border-cyan/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-primary">{m.label}</span>
                    <span className="text-[10px] text-faint font-mono">{m.ref}</span>
                    {m.result.isSimulated && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-dim text-amber font-semibold border border-amber/20">
                        SIM
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {m.result.lastKnownPosition.lat.toFixed(3)}°, {m.result.lastKnownPosition.lon.toFixed(3)}°
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.savedAt).toLocaleString()}
                    </span>
                    <span className="text-cyan">
                      {m.result.searchAreaKm2.toFixed(0)} km²
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onOpen(m)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-elevated text-primary text-xs font-medium rounded-md border border-default hover:border-cyan/30 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Open
                  </button>
                  <button
                    onClick={() => onDelete(m.id)}
                    className="p-1.5 text-muted rounded-md hover:text-critical hover:bg-critical/10 transition-colors"
                    title="Delete mission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 bg-elevated rounded-md border border-subtle">
          <p className="text-[11px] text-faint leading-relaxed">
            Mission data is stored only in your browser's local storage. It is not synchronized to any server.
            Clearing your browser data will remove all saved missions.
          </p>
        </div>
      </div>
    </div>
  );
}
