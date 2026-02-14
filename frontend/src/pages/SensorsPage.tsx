import { ArrowRight, Clock3, Gauge, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link } from "react-router-dom";
import { api } from "../api";
import { SectionTitle } from "../components/SectionTitle";
import { useLanguage } from "../context/LanguageContext";
import { usePlot } from "../context/PlotContext";
import { useI18n } from "../i18n";
import type { SensorHistoryResponse, SensorTrend, TrendDirection } from "../types";

function trendTone(direction: TrendDirection) {
  return `trend-badge trend-${direction}`;
}

function trendIcon(direction: TrendDirection) {
  if (direction === "increasing") {
    return <TrendingUp size={13} />;
  }
  if (direction === "decreasing") {
    return <TrendingDown size={13} />;
  }
  return <Gauge size={13} />;
}

function formatMagnitude(value: number, unit: string) {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}${unit}`;
}

function noteLabel(key: string, record: Record<string, string>) {
  return record[key as keyof typeof record] ?? key;
}

interface TrendHeaderProps {
  title: string;
  unit: string;
  trend: SensorTrend;
  t: ReturnType<typeof useI18n>;
}

function TrendHeader({ title, unit, trend, t }: TrendHeaderProps) {
  const directionLabel =
    t.common.trendDirection[trend.direction as keyof typeof t.common.trendDirection] ?? trend.direction;

  const note = noteLabel(trend.note_key, t.sensors.trendNotes);

  return (
    <div className="chart-header-block">
      <div className="chart-header-top">
        <h3>{title}</h3>
        <span className={trendTone(trend.direction)}>
          {trendIcon(trend.direction)}
          {directionLabel}
          <strong>{formatMagnitude(trend.magnitude, unit)}</strong>
        </span>
      </div>
      <p className={trend.abnormal ? "chart-note chart-note-alert" : "chart-note"}>
        {note} • {trend.abnormal ? t.sensors.abnormal : t.sensors.normal}
      </p>
    </div>
  );
}

export function SensorsPage() {
  const t = useI18n();
  const { locale } = useLanguage();
  const { activePlotId, loading: plotLoading } = usePlot();
  const [history, setHistory] = useState<SensorHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    if (!activePlotId) {
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const data = await api.getSensorHistory(14, activePlotId);
      setHistory(data);
    } catch (_error) {
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

  const chartData = useMemo(() => {
    if (!history) {
      return [];
    }

    return history.series.map((point) => ({
      ...point,
      label: new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" }).format(
        new Date(point.date)
      )
    }));
  }, [history, locale]);

  const trendByKey = useMemo(() => {
    if (!history) {
      return null;
    }

    return Object.fromEntries(history.trends.map((trend) => [trend.key, trend])) as Record<
      SensorTrend["key"],
      SensorTrend
    >;
  }, [history]);

  if (loading || plotLoading || !activePlotId) {
    return <p className="state-message">{t.common.loading}</p>;
  }

  if (error || !history || !trendByKey) {
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
      history.intelligence.sensor_reliability as keyof typeof t.common.reliabilityStatus
    ];
  const consistencyLabel =
    t.common.consistencyStatus[
      history.intelligence.trend_consistency as keyof typeof t.common.consistencyStatus
    ];
  const decisionActionLabel =
    history.decision_input.action === "irrigate"
      ? t.dashboard.actionIrrigate
      : t.dashboard.actionWait;
  const decisionReason =
    t.dashboard.reasons[history.decision_input.reason as keyof typeof t.dashboard.reasons] ??
    history.decision_input.reason;
  const decisionInputNote =
    t.sensors.decisionInputNotes[
      history.decision_input.note_key as keyof typeof t.sensors.decisionInputNotes
    ] ?? history.decision_input.note_key;

  return (
    <>
      <SectionTitle title={t.sensors.title} subtitle={t.sensors.subtitle} />

      <section className="intelligence-strip card">
        <article>
          <p>{t.common.dataConfidence}</p>
          <strong>{history.intelligence.data_confidence}%</strong>
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
            <Clock3 size={14} /> {history.intelligence.freshness_minutes} {t.common.minutes}
          </strong>
        </article>
      </section>

      <section className="chart-grid">
        <article className="chart-card card">
          <TrendHeader title={t.sensors.soilChart} unit="%" trend={trendByKey.soil_moisture} t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#278f4f" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#278f4f" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={[15, 75]} />
              <Tooltip />
              <Area type="monotone" dataKey="soil_moisture" stroke="#278f4f" fill="url(#soilGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card card">
          <TrendHeader title={t.sensors.tempChart} unit="°C" trend={trendByKey.air_temperature} t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={[15, 40]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="air_temperature"
                stroke="#d9822b"
                strokeWidth={2.6}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card card">
          <TrendHeader title={t.sensors.rainChart} unit="mm" trend={trendByKey.rain_mm} t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="rain_mm" fill="#2f80c8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-card card">
          <TrendHeader title={t.sensors.batteryChart} unit="%" trend={trendByKey.battery_level} t={t} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis domain={[55, 95]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="battery_level"
                stroke="#4f5d75"
                strokeWidth={2.4}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="decision-feed-card card">
        <div className="mini-head">
          <h3>{t.sensors.decisionFeedTitle}</h3>
          <p>{t.sensors.decisionFeedPrefix}</p>
        </div>

        <p className="decision-feed-note">{decisionInputNote}</p>

        <div className="decision-feed-row">
          <span className={history.decision_input.action === "irrigate" ? "decision-pill is-do" : "decision-pill is-wait"}>
            {decisionActionLabel}
          </span>
          <span className="decision-feed-reason">{decisionReason}</span>
          <Link to={history.decision_input.dashboard_path} className="inline-link-btn">
            {t.alerts.openDecision}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
