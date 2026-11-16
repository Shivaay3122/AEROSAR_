import { Plane, Layers } from 'lucide-react';

export default function MapLegend() {
  const items = [
    { color: '#FF5D6C', label: 'Search Area Polygon', filled: true },
    { color: '#42E8A5', label: 'Nominal Track', dashed: true },
    { color: '#FFB547', label: 'Position Uncertainty', dashed: true, filled: true },
    { color: '#FFB547', label: 'Wind Drift Track', dashed: true },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-[500] bg-panel/90 backdrop-blur border border-subtle rounded-md p-3 shadow-panel max-w-[200px]">
      <div className="flex items-center gap-1.5 mb-2">
        <Layers className="w-3.5 h-3.5 text-cyan" />
        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wide">Legend</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded-sm border flex-shrink-0"
              style={{
                borderColor: item.color,
                backgroundColor: item.filled ? `${item.color}20` : 'transparent',
                borderStyle: item.dashed ? 'dashed' : 'solid',
                borderWidth: '1.5px',
              }}
            />
            <span className="text-[10px] text-muted">{item.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 pt-1 border-t border-subtle">
          <Plane className="w-3 h-3 text-cyan flex-shrink-0" />
          <span className="text-[10px] text-muted">Last Known Position</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-radar bg-radar/30 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(66,232,165,0.5)' }} />
          <span className="text-[10px] text-muted">Estimated Position</span>
        </li>
      </ul>
    </div>
  );
}
