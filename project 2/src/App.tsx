import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { CalculationResult, MissionInputs, Page, SavedMission, ScenarioResult } from '@/types';
import { supabase } from '@/lib/supabase';
import AuthScreen from '@/components/AuthScreen';
import { calculate, DEMO_MISSION, speedLabel } from '@/lib/calculations';
import { validateInputs } from '@/lib/validation';
import { exportGeoJSON, downloadFile, printReport, loadMissions, saveMission, deleteMission, generateMissionId } from '@/lib/export';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import MissionInputForm from '@/components/MissionInputForm';
import SARMap from '@/components/SARMap';
import IntelligencePanel from '@/components/IntelligencePanel';
import EmptyState from '@/components/EmptyState';
import MapLegend from '@/components/MapLegend';
import AboutDialog from '@/components/AboutDialog';
import SearchAnalysis from '@/components/SearchAnalysis';
import MissionHistory from '@/components/MissionHistory';
import { Radio, Loader2, Play } from 'lucide-react';

const EMPTY_INPUTS: MissionInputs = {
  lat: 0,
  lon: 0,
  timestamp: '',
  heading: 0,
  speed: 0,
  speedUnit: 'knots',
  endurance: 0,
  windDirection: 0,
  windSpeed: 0,
  windSpeedUnit: 'knots',
  positionUncertaintyKm: 0,
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [page, setPage] = useState<Page>('mission-control');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputs, setInputs] = useState<MissionInputs>(EMPTY_INPUTS);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fitTrigger, setFitTrigger] = useState(0);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [flyTrigger, setFlyTrigger] = useState(-1);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [missions, setMissions] = useState<SavedMission[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    }).catch(() => {
      if (!mounted) return;
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setAuthReady(true);
    });

    const timeout = setTimeout(() => {
      if (!mounted) return;
      setAuthReady(true);
    }, 3000);

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (session) setMissions(loadMissions());
  }, [session]);

  const handleSignOut = useCallback(() => {
    supabase.auth.signOut();
    setSession(null);
    setResult(null);
    setInputs(EMPTY_INPUTS);
  }, []);

  const handleCalculate = useCallback(() => {
    const errs = validateInputs(inputs);
    if (errs.length > 0) {
      const map: Record<string, string> = {};
      errs.forEach((e) => { map[e.field] = e.message; });
      setErrors(map);
      return;
    }
    setErrors({});
    setCalculating(true);
    setTimeout(() => {
      const r = calculate(inputs, false);
      setResult(r);
      setCalculating(false);
      setFitTrigger((t) => t + 1);
    }, 400);
  }, [inputs]);

  const handleDemo = useCallback(() => {
    setInputs(DEMO_MISSION);
    setErrors({});
    setCalculating(true);
    setTimeout(() => {
      const r = calculate(DEMO_MISSION, true);
      setResult(r);
      setCalculating(false);
      setFitTrigger((t) => t + 1);
    }, 400);
  }, []);

  const handleReset = useCallback(() => {
    setInputs(EMPTY_INPUTS);
    setResult(null);
    setErrors({});
    setScenarios([]);
  }, []);

  const handleInputChange = useCallback((field: keyof MissionInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
    }
  }, [errors]);

  const handleFitMap = useCallback(() => {
    setFitTrigger((t) => t + 1);
  }, []);

  const handleCenterLKP = useCallback(() => {
    setCenterTrigger((t) => t + 1);
  }, []);

  const handleFlyRoute = useCallback(() => {
    setFlyTrigger((t) => t + 1);
  }, []);

  const handleSaveMission = useCallback(() => {
    if (!result) return;
    const mission: SavedMission = {
      id: generateMissionId(),
      ref: result.missionRef,
      savedAt: new Date().toISOString(),
      inputs: result.inputs,
      result,
      label: result.isSimulated ? 'Demo Mission' : 'Custom Mission',
    };
    saveMission(mission);
    setMissions(loadMissions());
  }, [result]);

  const handleOpenMission = useCallback((mission: SavedMission) => {
    setInputs(mission.inputs);
    setResult(mission.result);
    setPage('mission-control');
    setFitTrigger((t) => t + 1);
  }, []);

  const handleDeleteMission = useCallback((id: string) => {
    deleteMission(id);
    setMissions(loadMissions());
  }, []);

  const handlePrintReport = useCallback(() => {
    if (result) printReport(result);
  }, [result]);

  const handleExportGeoJSON = useCallback(() => {
    if (result) {
      const json = exportGeoJSON(result);
      downloadFile(`${result.missionRef}_search_area.geojson`, json, 'application/geo+json');
    }
  }, [result]);

  const handleRunScenarios = useCallback((scenarioInputs: MissionInputs[]) => {
    const results: ScenarioResult[] = scenarioInputs.map((si, idx) => {
      const r = calculate(si, inputs === DEMO_MISSION || si === DEMO_MISSION);
      return { label: `Scenario ${idx + 1}`, result: r };
    });
    setScenarios(results);
  }, [inputs]);

  if (!authReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base">
        <Loader2 className="w-8 h-8 text-cyan animate-spin-sm" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthed={(s) => setSession(s)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-base text-primary overflow-hidden">
      <TopNav
        currentPage={page}
        onNavigate={setPage}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onSignOut={handleSignOut}
        userEmail={session.user.email}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={page}
          onNavigate={(p) => { setPage(p); setSidebarOpen(false); }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          hasResult={!!result}
        />

        <main className="flex-1 overflow-hidden relative" key={page}>
          {page === 'mission-control' && (
            <>
              {result || calculating ? (
                <div className="h-full flex flex-col lg:flex-row gap-2 p-2 overflow-hidden animate-fly-in">
                  {/* Mission Inputs */}
                  <div className="w-full lg:w-[22%] min-w-[280px] max-h-[40%] lg:max-h-full overflow-y-auto">
                    <MissionInputForm
                      inputs={inputs}
                      errors={errors}
                      onChange={handleInputChange}
                      onCalculate={handleCalculate}
                      onDemo={handleDemo}
                      onReset={handleReset}
                      calculating={calculating}
                    />
                  </div>

                  {/* Map */}
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-subtle shadow-elevated min-h-[300px] h-full">
                    {calculating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-base z-[1000]">
                        <Loader2 className="w-8 h-8 text-cyan animate-spin-sm mb-3" />
                        <span className="text-muted text-sm">Calculating search area…</span>
                      </div>
                    ) : (
                      <>
                        <SARMap
                          result={result}
                          fitTrigger={fitTrigger}
                          centerTrigger={centerTrigger}
                          flyTrigger={flyTrigger}
                          onMapClick={(lat, lon) => {
                            handleInputChange('lat', lat);
                            handleInputChange('lon', lon);
                          }}
                        />
                        {/* Map controls */}
                        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
                          <button
                            onClick={handleFlyRoute}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-panel/90 backdrop-blur border border-subtle rounded-md text-xs text-primary hover:bg-elevated transition-colors shadow-panel"
                            title="Animate aircraft flying the mission route"
                          >
                            <Play className="w-3.5 h-3.5 text-cyan" />
                            Fly Route
                          </button>
                          <button
                            onClick={handleFitMap}
                            className="px-3 py-1.5 bg-panel/90 backdrop-blur border border-subtle rounded-md text-xs text-primary hover:bg-elevated transition-colors shadow-panel"
                            title="Fit map to search area"
                          >
                            Fit Search Area
                          </button>
                          <button
                            onClick={handleCenterLKP}
                            className="px-3 py-1.5 bg-panel/90 backdrop-blur border border-subtle rounded-md text-xs text-primary hover:bg-elevated transition-colors shadow-panel"
                            title="Return to last known position"
                          >
                            Return to LKP
                          </button>
                          <button
                            onClick={() => setShowLegend((s) => !s)}
                            className="px-3 py-1.5 bg-panel/90 backdrop-blur border border-subtle rounded-md text-xs text-primary hover:bg-elevated transition-colors shadow-panel"
                          >
                            {showLegend ? 'Hide' : 'Show'} Legend
                          </button>
                        </div>
                        {showLegend && result && (
                          <MapLegend />
                        )}
                      </>
                    )}
                  </div>

                  {/* Intelligence Panel */}
                  <div className="w-full lg:w-[20%] min-w-[260px] max-h-[40%] lg:max-h-full overflow-y-auto">
                    {result && (
                      <IntelligencePanel
                        result={result}
                        onSaveMission={handleSaveMission}
                        onPrintReport={handlePrintReport}
                        onExportGeoJSON={handleExportGeoJSON}
                        onGoToAnalysis={() => setPage('search-analysis')}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState onDemo={handleDemo} onNewMission={() => {
                  setInputs({ ...EMPTY_INPUTS, timestamp: new Date().toISOString().slice(0, 16) });
                }} />
              )}
            </>
          )}

          {page === 'search-analysis' && (
            <div key="search-analysis" className="h-full animate-fly-in">
            <SearchAnalysis
              baseInputs={inputs}
              baseResult={result}
              onRunScenarios={handleRunScenarios}
              scenarios={scenarios}
            />
            </div>
          )}

          {page === 'mission-history' && (
            <div key="mission-history" className="h-full animate-fly-in">
            <MissionHistory
              missions={missions}
              onOpen={handleOpenMission}
              onDelete={handleDeleteMission}
            />
            </div>
          )}

          {page === 'about' && (
            <div className="h-full overflow-y-auto animate-fly-in">
              <div className="max-w-3xl mx-auto p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-cyan-dim border border-cyan/30 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">About AEROSAR</h1>
                    <p className="text-muted text-sm">Aircraft Search &amp; Rescue Intelligence System</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-muted leading-relaxed">
                  <p>
                    AEROSAR is a decision-support prototype that helps users estimate and visualize
                    a potential aircraft search region after contact is lost. It combines last known
                    position, aircraft movement assumptions, environmental conditions, and position
                    uncertainty into an interactive map visualization with downloadable mission reports.
                  </p>
                  <div className="bg-panel border border-subtle rounded-lg p-5">
                    <h2 className="text-primary font-semibold mb-3">How It Works</h2>
                    <ol className="space-y-2.5">
                      {[
                        { t: 'Last Known Position', d: 'Enter the aircraft\'s last known latitude, longitude, and timestamp in UTC.' },
                        { t: 'Validated Inputs', d: 'All inputs are validated for range and type before calculation.' },
                        { t: 'Motion & Uncertainty Model', d: 'The engine estimates nominal movement along the heading and models wind drift with a simplified heuristic.' },
                        { t: 'Estimated Search Region', d: 'A convex hull of position-uncertainty circles at the last known and estimated positions defines the search polygon.' },
                        { t: 'Mission Report', d: 'Export a printable HTML report or GeoJSON of the search geometry for coordination.' },
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-dim border border-cyan/30 text-cyan text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <span className="text-primary font-medium">{step.t}</span>
                            <span className="text-muted"> — {step.d}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="bg-amber-dim border border-amber/30 rounded-lg p-5">
                    <h2 className="text-amber font-semibold mb-2">Important Disclaimer</h2>
                    <p>
                      AEROSAR is a prototype for demonstration purposes only. It is not a validated
                      operational search-and-rescue system. All calculations use simplified models and
                      should not be used for real emergency response. Real SAR operations require
                      qualified coordination and validated procedures.
                    </p>
                  </div>
                  <div className="bg-panel border border-subtle rounded-lg p-5">
                    <h2 className="text-primary font-semibold mb-2">Calculation Model</h2>
                    <p className="mb-2">
                      The engine uses great-circle navigation for destination-point calculation,
                      haversine distance, and a convex hull of position-uncertainty circles to define
                      the search polygon. Wind drift uses a conservative 15% drift factor.
                    </p>
                    <p>
                      Units: Speed in {speedLabel('knots')}, {speedLabel('kmh')}, or {speedLabel('mph')}.
                      Distances in kilometers. Area in km².
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
