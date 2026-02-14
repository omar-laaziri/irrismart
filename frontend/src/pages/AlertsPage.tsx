import { AlertOctagon, AlertTriangle, ArrowRight, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { SectionTitle } from "../components/SectionTitle";
import { useLanguage } from "../context/LanguageContext";
import { usePlot } from "../context/PlotContext";
import { useI18n } from "../i18n";
import type { AlertItem, AlertsResponse } from "../types";

function SeverityIcon({ severity }: { severity: AlertItem["severity"] }) {
  if (severity === "critical") {
    return <AlertOctagon size={16} />;
  }
  if (severity === "warning") {
    return <AlertTriangle size={16} />;
  }
  return <Info size={16} />;
}

function impactClass(level: AlertItem["impacts"]["decision"]) {
  return `impact-chip impact-${level}`;
}

export function AlertsPage() {
  const t = useI18n();
  const { locale } = useLanguage();
  const { activePlotId, loading: plotLoading } = usePlot();
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    if (!activePlotId) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await api.getAlerts(activePlotId);
      setAlerts(response);
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

  if (error || !alerts) {
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
      alerts.intelligence.sensor_reliability as keyof typeof t.common.reliabilityStatus
    ];

  return (
    <>
      <SectionTitle title={t.alerts.title} subtitle={t.alerts.subtitle} />

      <section className="intelligence-strip card">
        <article>
          <p>{t.common.dataConfidence}</p>
          <strong>{alerts.intelligence.data_confidence}%</strong>
        </article>
        <article>
          <p>{t.common.reliability}</p>
          <strong>{reliabilityLabel}</strong>
        </article>
      </section>

      {alerts.alerts.length === 0 ? (
        <p className="state-message">{t.alerts.empty}</p>
      ) : (
        <section className="alerts-list">
          {alerts.alerts.map((alert) => {
            const title = t.alerts.titles[alert.titleKey as keyof typeof t.alerts.titles] || alert.titleKey;
            const message =
              t.alerts.messages[alert.messageKey as keyof typeof t.alerts.messages] || alert.messageKey;
            const sensor =
              t.alerts.sensorKeys[alert.sensor_key as keyof typeof t.alerts.sensorKeys] ?? alert.sensor_key;
            const createdAt = new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short"
            }).format(new Date(alert.createdAt));
            const reasonLabel =
              t.dashboard.reasons[
                alert.decision_reference.reason as keyof typeof t.dashboard.reasons
              ] ?? alert.decision_reference.reason;
            const actionLabel =
              alert.decision_reference.action === "irrigate"
                ? t.dashboard.actionIrrigate
                : t.dashboard.actionWait;

            return (
              <article key={alert.id} className={`alert-card card severity-${alert.severity}`}>
                <header>
                  <span className="severity-pill">
                    <SeverityIcon severity={alert.severity} />
                    {t.alerts.severities[alert.severity]}
                  </span>
                  <span className="alert-time">{createdAt}</span>
                </header>

                <h3>{title}</h3>
                <p>{message}</p>

                <div className="alert-meta-row">
                  <span className="meta-chip">{alert.plot_name}</span>
                  <span className="meta-chip">
                    {t.alerts.sensor}: {sensor}
                  </span>
                  <span className="meta-chip">
                    {t.alerts.source}: {alert.source}
                  </span>
                </div>

                <div className="impact-row">
                  <span className={impactClass(alert.impacts.decision)}>
                    {t.alerts.impacts.decision}: {t.alerts.impactLevel[alert.impacts.decision]}
                  </span>
                  <span className={impactClass(alert.impacts.soil_health)}>
                    {t.alerts.impacts.soil_health}: {t.alerts.impactLevel[alert.impacts.soil_health]}
                  </span>
                  <span className={impactClass(alert.impacts.yield_risk)}>
                    {t.alerts.impacts.yield_risk}: {t.alerts.impactLevel[alert.impacts.yield_risk]}
                  </span>
                </div>

                <div className="alert-decision-row">
                  <span className={alert.decision_reference.action === "irrigate" ? "decision-pill is-do" : "decision-pill is-wait"}>
                    {actionLabel}
                  </span>
                  <small>{reasonLabel}</small>
                  <Link to={alert.decision_reference.dashboard_path} className="inline-link-btn">
                    {t.alerts.openDecision}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
