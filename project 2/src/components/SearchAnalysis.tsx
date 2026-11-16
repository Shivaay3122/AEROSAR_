import { useState } from 'react';
import type { MissionInputs, CalculationResult, ScenarioResult } from '@/types';
import { calculate } from '@/lib/calculations';
import { BarChart3, Play, Ruler, Clock, Wind, Navigation, GitCompare } from 'lucide-react';

interface SearchAnalysisProps {
  baseInputs: MissionInputs;
  baseResult: CalculationResult | null;
  onRunScenarios: (inputs: MissionInputs[]) => void;
  scenarios: ScenarioResult[];
}

export default function SearchAnalysis({ baseInputs, baseResult, onRunScenarios, scenarios }: SearchAnalysisProps) {
  const [uncertaintyMod, setUncertaintyMod] = useState(baseInputs.positionUncertaintyKm || 8);
  const [elapsedMod, setElapsedMod] = useState(0);
  const [windMod, setWindMod] = useState(0);
  const [headingMod, setHeadingMod] = useState(0);
  const [localScenarios, setLocalScenarios] = useState<ScenarioResult[]>(scenarios);

  const runComparison = () => {
    if (!baseResult) return;

    // Scenario A: increased uncertainty
    const scenarioA: MissionInputs = {
      ...baseInputs,
      positionUncertaintyKm: Math.max(0, baseInputs.positionUncertaintyKm + uncertaintyMod),
    };

    // Scenario B: modified elapsed (by adjusting timestamp), wind, and heading
    const baseTime = new Date(baseInputs.timestamp);
    const adjustedTime = new Date(baseTime.getTime() - elapsedMod * 3600000);
    const scenarioB: MissionInputs = {
      ...baseInputs,
      timestamp: adjustedTime.toISOString(),
      windSpeed: Math.max(0, baseInputs.windSpeed + windMod),
      heading: ((baseInputs.heading + headingMod) % 360 + 360) % 360,
    };

    const resultA = calculate(scenarioA, baseResult.isSimulated);
    const resultB = calculate(scenarioB, baseResult.isSimulated);

    const results: ScenarioResult[] = [
      { label: 'Base Case', result: baseResult },
      { label: 'Modified Uncertainty', result: resultA },
      { label: 'Modified Time/Wind/Heading', result: resultB },
    ];
    setLocalScenarios(results);
    onRunScenarios([scenarioA, scenarioB]);
  };

  const scenariosToShow = localScenarios.length > 0 ? localScenarios : scenarios;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan" />
          <div>
            <h1 className="text-xl font-bold text-primary">Search Analysis</h1>
            <p className="text-xs text-muted">Compare scenarios using the same calculation engine</p>
          </div>
        </div>

        {!baseResult ? (
          <div className="bg-panel rounded-lg border border-subtle p-8 text-center">
            <p className="text-muted text-sm">
              Run a mission calculation from Mission Control first, then return here to compare scenarios.
            </p>
          </div>
        ) : (
          <>
            {/* Scenario Controls */}
            <div className="bg-panel rounded-lg border border-subtle p-4">
              <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-cyan" />
                Scenario Adjustments
              </h2>
              <p className="text-xs text-muted mb-4">
                Modify parameters below to compare against the base case. Each scenario uses the real calculation engine.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted font-medium block mb-1">
                    ± Uncertainty (km)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={uncertaintyMod}
                    onChange={(e) => setUncertaintyMod(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input border border-subtle rounded-md text-sm text-primary focus:outline-none focus:border-cyan/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium block mb-1">
                    ± Elapsed Time (h)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={elapsedMod}
                    onChange={(e) => setElapsedMod(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input border border-subtle rounded-md text-sm text-primary focus:outline-none focus:border-cyan/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium block mb-1">
                    ± Wind Speed
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={windMod}
                    onChange={(e) => setWindMod(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input border border-subtle rounded-md text-sm text-primary focus:outline-none focus:border-cyan/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted font-medium block mb-1">
                    ± Heading (°)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={headingMod}
                    onChange={(e) => setHeadingMod(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input border border-subtle rounded-md text-sm text-primary focus:outline-none focus:border-cyan/50"
                  />
                </div>
              </div>
              <button
                onClick={runComparison}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-cyan text-base font-semibold rounded-md hover:bg-cyan/90 transition-colors"
                style={{ color: '#080D18' }}
              >
                <Play className="w-4 h-4" />
                Run Scenario Comparison
              </button>
            </div>

            {/* Results Table */}
            {scenariosToShow.length > 0 && (
              <div className="bg-panel rounded-lg border border-subtle p-4 animate-fade-in">
                <h2 className="text-sm font-semibold text-primary mb-3">Comparison Results</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-subtle">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted uppercase tracking-wider">Metric</th>
                        {scenariosToShow.map((s, i) => (
                          <th key={i} className="text-right py-2 px-3 text-xs font-semibold text-primary uppercase tracking-wider">
                            {s.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-subtle">
                        <td className="py-2 px-3 text-muted flex items-center gap-2">
                          <Ruler className="w-3.5 h-3.5 text-cyan" /> Search Area
                        </td>
                        {scenariosToShow.map((s, i) => (
                          <td key={i} className="text-right py-2 px-3 text-primary font-semibold">
                            {s.result.searchAreaKm2 >= 1000
                              ? `${(s.result.searchAreaKm2 / 1000).toFixed(2)}k km²`
                              : `${s.result.searchAreaKm2.toFixed(1)} km²`}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-subtle">
                        <td className="py-2 px-3 text-muted flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-cyan" /> Elapsed Time
                        </td>
                        {scenariosToShow.map((s, i) => (
                          <td key={i} className="text-right py-2 px-3 text-primary">{s.result.elapsedTimeLabel}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-subtle">
                        <td className="py-2 px-3 text-muted flex items-center gap-2">
                          <Navigation className="w-3.5 h-3.5 text-cyan" /> Nominal Distance
                        </td>
                        {scenariosToShow.map((s, i) => (
                          <td key={i} className="text-right py-2 px-3 text-primary">{s.result.nominalDistanceLabel}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-subtle">
                        <td className="py-2 px-3 text-muted flex items-center gap-2">
                          <Wind className="w-3.5 h-3.5 text-cyan" /> Wind Drift
                        </td>
                        {scenariosToShow.map((s, i) => (
                          <td key={i} className="text-right py-2 px-3 text-primary">{s.result.windDriftKm.toFixed(1)} km</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-muted flex items-center gap-2">
                          <Ruler className="w-3.5 h-3.5 text-cyan" /> Uncertainty Radius
                        </td>
                        {scenariosToShow.map((s, i) => (
                          <td key={i} className="text-right py-2 px-3 text-primary">{s.result.positionUncertaintyKm} km</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {scenariosToShow.length >= 2 && (
                  <div className="mt-4 p-3 bg-elevated rounded-md border border-subtle">
                    <h3 className="text-xs font-semibold text-primary mb-1">Area Difference</h3>
                    <p className="text-sm text-muted">
                      {(scenariosToShow[1].result.searchAreaKm2 - scenariosToShow[0].result.searchAreaKm2).toFixed(1)} km²
                      {' '}
                      between {scenariosToShow[0].label} and {scenariosToShow[1].label}.
                      {' '}
                      ({(((scenariosToShow[1].result.searchAreaKm2 - scenariosToShow[0].result.searchAreaKm2) / Math.max(scenariosToShow[0].result.searchAreaKm2, 0.01)) * 100).toFixed(1)}%)
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-amber-dim border border-amber/20 rounded-md">
              <p className="text-[11px] text-amber leading-relaxed">
                Scenario comparisons use the same simplified model as the main calculation.
                No probability values are claimed. Results are deterministic for identical inputs.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
