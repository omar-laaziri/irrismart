import {
  BatteryCharging,
  Clock3,
  CloudRain,
  Droplets,
  Flame,
  Gauge,
  Leaf,
  ShieldCheck,
  ThermometerSun
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { RecommendationCard } from "../components/RecommendationCard";
import { SectionTitle } from "../components/SectionTitle";
import { SnapshotCard } from "../components/SnapshotCard";
import { useLanguage } from "../context/LanguageContext";
import { usePlot } from "../context/PlotContext";
import { useI18n } from "../i18n";
import type { DashboardData, SimulationResponse, SimulationScenarioId, TrendLevel } from "../types";

function deltaLabel(value: number, unit = "") {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${unit}`;
}

function trendClass(level: TrendLevel) {
  return `level-pill level-${level}`;
}

export function DashboardPage() {
  const t = useI18n();
  const { locale } = useLanguage();
  const { activePlotId, loading: plotLoading } = usePlot();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<SimulationScenarioId>("irrigate_today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async (plotId: string) => {
    setLoading(true);
    setError(false);

    try {
      const [dashboardData, simulationData] = await Promise.all([
        api.getDashboard(plotId),
        api.getSimulation(plotId)
      ]);
      setDashboard(dashboardData);
      setSimulation(simulationData);
      setActiveScenarioId("irrigate_today");
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activePlotId) {
      return;
    }
    void loadData(activePlotId);
  }, [activePlotId, loadData]);

  const selectedScenario = useMemo(() => {
    if (!simulation) {
      return null;
    }

    return (
      simulation.scenarios.find((scenario) => scenario.id === activeScenarioId) ?? simulation.scenarios[0]
    );
  }, [activeScenarioId, simulation]);

  if (loading || plotLoading || !activePlotId) {
    return <p className="state-message">{t.common.loading}</p>;
  }

  if (error || !dashboard || !simulation || !selectedScenario) {
    return (
      <div className="state-block card">
        <p>{t.common.error}</p>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            if (activePlotId) {
              void loadData(activePlotId);
            }
          }}
        >
          {t.common.retry}
        </button>
      </div>
    );
  }

  const selectedPlot = dashboard.selectedPlot;
  const selectedCrop =
    t.dashboard.crops[selectedPlot.crop_type as keyof typeof t.dashboard.crops] ?? selectedPlot.crop_type;
  const selectedSoil =
    t.dashboard.soils[selectedPlot.soil_type as keyof typeof t.dashboard.soils] ?? selectedPlot.soil_type;

  const reliabilityLabel =
    t.common.reliabilityStatus[
      dashboard.intelligence.sensor_reliability as keyof typeof t.common.reliabilityStatus
    ];
  const consistencyLabel =
    t.common.consistencyStatus[
      dashboard.intelligence.trend_consistency as keyof typeof t.common.consistencyStatus
    ];

  return (
    <>
      <SectionTitle title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      <section className="intelligence-strip card">
        <article>
          <p>{t.common.dataConfidence}</p>
          <strong>{dashboard.intelligence.data_confidence}%</strong>
        </article>
        <article>
          <p>{t.common.reliability}</p>
          <strong>
            <ShieldCheck size={14} /> {reliabilityLabel}
          </strong>
        </article>
        <article>
          <p>{t.common.trendConsistency}</p>
          <strong>
            <Gauge size={14} /> {consistencyLabel}
          </strong>
        </article>
        <article>
          <p>{t.common.freshness}</p>
          <strong>
            <Clock3 size={14} /> {dashboard.intelligence.freshness_minutes} {t.common.minutes}
          </strong>
        </article>
      </section>

      <RecommendationCard
        recommendation={dashboard.recommendation}
        generatedAt={dashboard.generatedAt}
        nextCheckInHours={dashboard.nextCheckInHours}
      />

      <section className="snapshot-grid">
        <SnapshotCard
          icon={Droplets}
          label={t.dashboard.metrics.moisture}
          value={`${dashboard.snapshot.soil_moisture}%`}
          tone="brand"
        />
        <SnapshotCard
          icon={ThermometerSun}
          label={t.dashboard.metrics.temperature}
          value={`${dashboard.snapshot.air_temperature}°C`}
          tone="warm"
        />
        <SnapshotCard
          icon={CloudRain}
          label={t.dashboard.metrics.rain}
          value={`${dashboard.snapshot.rain_mm_next_24h} mm`}
          tone="rain"
        />
        <SnapshotCard
          icon={BatteryCharging}
          label={t.dashboard.metrics.battery}
          value={`${dashboard.snapshot.battery_level}%`}
          tone="neutral"
        />
      </section>

      <section className="forecast-card card">
        <div className="mini-head">
          <h3>{t.dashboard.outlookTitle}</h3>
          <p>
            {t.dashboard.cropLabel}: {selectedCrop} • {t.dashboard.soilLabel}: {selectedSoil}
          </p>
        </div>

        <div className="forecast-grid">
          {dashboard.forecast.map((day) => {
            const dateLabel = new Intl.DateTimeFormat(locale, {
              weekday: "short",
              day: "2-digit",
              month: "2-digit"
            }).format(new Date(day.date));

            const needLabel =
              t.dashboard.levels[day.irrigation_need as keyof typeof t.dashboard.levels] ??
              day.irrigation_need;
            const stressLabel =
              t.dashboard.levels[day.temp_stress as keyof typeof t.dashboard.levels] ?? day.temp_stress;

            return (
              <article key={day.date} className="forecast-item">
                <p className="forecast-date">{dateLabel}</p>
                <div className="forecast-row">
                  <Leaf size={14} />
                  <span>{t.dashboard.outlookNeed}</span>
                  <strong className={trendClass(day.irrigation_need)}>{needLabel}</strong>
                </div>
                <div className="forecast-row">
                  <CloudRain size={14} />
                  <span>{t.dashboard.outlookRain}</span>
                  <strong>{day.rain_probability}%</strong>
                </div>
                <div className="forecast-row">
                  <Flame size={14} />
                  <span>{t.dashboard.outlookStress}</span>
                  <strong className={trendClass(day.temp_stress)}>{stressLabel}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="insights-grid">
        <article className="soil-health-card card">
          <div className="mini-head mini-head-inline">
            <h3>{t.dashboard.soilHealthTitle}</h3>
            <span className={`health-status health-${dashboard.soilHealth.status}`}>
              {
                t.dashboard.soilHealthStatus[
                  dashboard.soilHealth.status as keyof typeof t.dashboard.soilHealthStatus
                ]
              }
            </span>
          </div>

          <div className="soil-score-line">
            <strong>{dashboard.soilHealth.score}</strong>
            <span>/100</span>
          </div>

          <div className="soil-score-track">
            <span style={{ width: `${dashboard.soilHealth.score}%` }} />
          </div>

          <p className="soil-why">{t.dashboard.soilHealthWhy}</p>
          <ul className="soil-explain-list">
            {dashboard.soilHealth.explanation.map((item) => {
              const text =
                t.dashboard.soilHealthReasons[
                  item as keyof typeof t.dashboard.soilHealthReasons
                ] ?? item;
              return <li key={item}>{text}</li>;
            })}
          </ul>

          <div className="soil-components">
            {Object.entries(dashboard.soilHealth.components).map(([key, value]) => {
              const label =
                t.dashboard.soilHealthParts[key as keyof typeof t.dashboard.soilHealthParts] ?? key;
              return (
                <div key={key}>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className="simulation-card card">
          <div className="mini-head">
            <h3>{t.dashboard.simulationTitle}</h3>
            <p>{t.dashboard.simulationSubtitle}</p>
          </div>

          <div className="scenario-toggle">
            {simulation.scenarios.map((scenario) => {
              const label =
                t.dashboard.simulationScenarios[
                  scenario.id as keyof typeof t.dashboard.simulationScenarios
                ] ?? scenario.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === selectedScenario.id ? "scenario-btn is-active" : "scenario-btn"}
                  onClick={() => setActiveScenarioId(scenario.id)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="simulation-grid">
            <div>
              <p>{t.dashboard.simulationMetrics.estimatedMoisture}</p>
              <strong>{selectedScenario.estimated_soil_moisture}%</strong>
              <small
                className={
                  selectedScenario.delta_moisture >= 0 ? "delta-positive" : "delta-negative"
                }
              >
                {t.dashboard.simulationMetrics.deltaMoisture}: {deltaLabel(selectedScenario.delta_moisture, "%")}
              </small>
            </div>
            <div>
              <p>{t.dashboard.simulationMetrics.estimatedHealth}</p>
              <strong>{selectedScenario.estimated_soil_health}</strong>
              <small
                className={selectedScenario.delta_health >= 0 ? "delta-positive" : "delta-negative"}
              >
                {t.dashboard.simulationMetrics.deltaHealth}: {deltaLabel(selectedScenario.delta_health)}
              </small>
            </div>
          </div>

          <p className="simulation-summary">
            {t.dashboard.simulationSummaries[
              selectedScenario.summary as keyof typeof t.dashboard.simulationSummaries
            ] ?? selectedScenario.summary}
          </p>

          <p className="simulation-baseline">
            {t.dashboard.simulationBaseline}: {simulation.baseline.soil_moisture}% / {" "}
            {simulation.baseline.soil_health_score}
          </p>
        </article>
      </section>

      <section className="decision-log-card card">
        <div className="mini-head">
          <h3>{t.dashboard.decisionLogTitle}</h3>
          <p>{t.dashboard.decisionLogSubtitle}</p>
        </div>

        <div className="decision-log-list">
          {dashboard.decisionLog.slice(0, 5).map((log) => {
            const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(
              new Date(log.date)
            );
            const actionLabel =
              log.action === "irrigate" ? t.dashboard.actionIrrigate : t.dashboard.actionWait;
            const outcomeLabel =
              t.dashboard.decisionOutcome[
                log.outcome as keyof typeof t.dashboard.decisionOutcome
              ] ?? log.outcome;
            const reasonLabel =
              t.dashboard.decisionReasons[
                log.reason as keyof typeof t.dashboard.decisionReasons
              ] ?? log.reason;

            return (
              <article key={log.id} className="decision-log-item">
                <div>
                  <p className="decision-date">{date}</p>
                  <strong>{actionLabel}</strong>
                  <small>{reasonLabel}</small>
                </div>
                <div className="decision-metrics">
                  <span className={`outcome-chip outcome-${log.outcome}`}>{outcomeLabel}</span>
                  <span>{deltaLabel(log.moisture_change, "%")}</span>
                  <span>{deltaLabel(log.soil_health_delta)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
