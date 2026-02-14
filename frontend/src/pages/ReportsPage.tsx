import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { SectionTitle } from "../components/SectionTitle";
import { useLanguage } from "../context/LanguageContext";
import { usePlot } from "../context/PlotContext";
import { useI18n } from "../i18n";
import type { ReportsResponse } from "../types";

function deltaLabel(value: number, unit = "") {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${unit}`;
}

export function ReportsPage() {
  const t = useI18n();
  const { locale } = useLanguage();
  const { activePlotId, loading: plotLoading } = usePlot();
  const [report, setReport] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    if (!activePlotId) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await api.getReports(activePlotId);
      setReport(response);
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [activePlotId]);

  useEffect(() => {
    if (!activePlotId) {
      return;
    }
    void loadData();
  }, [activePlotId, loadData]);

  if (loading || plotLoading || !activePlotId) {
    return <p className="state-message">{t.common.loading}</p>;
  }

  if (error || !report) {
    return (
      <div className="state-block card">
        <p>{t.common.error}</p>
        <button type="button" className="ghost-btn" onClick={() => void loadData()}>
          {t.common.retry}
        </button>
      </div>
    );
  }

  const reliabilityLabel =
    t.common.reliabilityStatus[
      report.intelligence.sensor_reliability as keyof typeof t.common.reliabilityStatus
    ];

  const observedText =
    t.reports.narrativeKeys[report.narrative.observed_key as keyof typeof t.reports.narrativeKeys] ??
    report.narrative.observed_key;
  const decisionsText =
    t.reports.narrativeKeys[report.narrative.decisions_key as keyof typeof t.reports.narrativeKeys] ??
    report.narrative.decisions_key;
  const impactText =
    t.reports.narrativeKeys[report.narrative.impact_key as keyof typeof t.reports.narrativeKeys] ??
    report.narrative.impact_key;

  return (
    <>
      <SectionTitle title={t.reports.title} subtitle={t.reports.subtitle} />

      <section className="intelligence-strip card">
        <article>
          <p>{t.reports.intelligenceTitle}</p>
          <strong>{report.intelligence.data_confidence}%</strong>
        </article>
        <article>
          <p>{t.common.reliability}</p>
          <strong>{reliabilityLabel}</strong>
        </article>
      </section>

      <section className="report-grid">
        <article className="report-card card">
          <p>{t.reports.avgMoisture}</p>
          <strong>{report.weekly.avg_moisture}%</strong>
        </article>
        <article className="report-card card">
          <p>{t.reports.avgTemp}</p>
          <strong>{report.weekly.avg_temp}°C</strong>
        </article>
        <article className="report-card card">
          <p>{t.reports.totalRain}</p>
          <strong>{report.weekly.total_rain} mm</strong>
        </article>
        <article className="report-card card">
          <p>{t.reports.activeAlerts}</p>
          <strong>{report.weekly.active_alerts}</strong>
        </article>
      </section>

      <section className="narrative-card card">
        <div className="mini-head">
          <h3>{t.reports.narrativeTitle}</h3>
          <p>{t.dashboard.decisionLogSubtitle}</p>
        </div>

        <div className="narrative-grid">
          <article>
            <span>{t.reports.narrativeObserved}</span>
            <p>{observedText}</p>
          </article>
          <article>
            <span>{t.reports.narrativeDecisions}</span>
            <p>{decisionsText}</p>
          </article>
          <article>
            <span>{t.reports.narrativeImpact}</span>
            <p>{impactText}</p>
          </article>
        </div>
      </section>

      <section className="insights-grid">
        <article className="decision-summary-card card">
          <div className="mini-head">
            <h3>{t.reports.decisionSplit}</h3>
            <p>{t.reports.positiveRate}</p>
          </div>

          <div className="decision-positive-rate">{report.decision_summary.positive_rate}%</div>

          <div className="decision-split-line">
            <span>{t.dashboard.actionIrrigate}</span>
            <strong>{report.decision_summary.irrigate_count}</strong>
          </div>
          <div className="decision-split-line">
            <span>{t.dashboard.actionWait}</span>
            <strong>{report.decision_summary.wait_count}</strong>
          </div>
        </article>

        <article className="decision-log-card card">
          <div className="mini-head">
            <h3>{t.dashboard.decisionLogTitle}</h3>
            <p>{t.dashboard.decisionLogSubtitle}</p>
          </div>

          <div className="decision-log-list">
            {report.decision_log.slice(0, 5).map((log) => {
              const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(
                new Date(log.date)
              );
              const actionLabel =
                log.action === "irrigate" ? t.dashboard.actionIrrigate : t.dashboard.actionWait;
              const outcomeLabel =
                t.dashboard.decisionOutcome[
                  log.outcome as keyof typeof t.dashboard.decisionOutcome
                ] ?? log.outcome;

              return (
                <article key={log.id} className="decision-log-item">
                  <div>
                    <p className="decision-date">{date}</p>
                    <strong>{actionLabel}</strong>
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
        </article>
      </section>

      <section className="card table-card">
        <h3>{t.reports.recentHistory}</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.reports.table.date}</th>
                <th>{t.reports.table.soil}</th>
                <th>{t.reports.table.temperature}</th>
                <th>{t.reports.table.rain}</th>
                <th>{t.reports.table.battery}</th>
              </tr>
            </thead>
            <tbody>
              {report.recent_series.map((row) => (
                <tr key={row.date}>
                  <td>
                    {new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(
                      new Date(row.date)
                    )}
                  </td>
                  <td>{row.soil_moisture}</td>
                  <td>{row.air_temperature}</td>
                  <td>{row.rain_mm}</td>
                  <td>{row.battery_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
