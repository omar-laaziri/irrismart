import { CloudRain, Clock3, Droplets, Flame, ShieldCheck, type LucideIcon } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useI18n } from "../i18n";
import type { FactorKey, Recommendation } from "../types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  generatedAt: string;
  nextCheckInHours?: number;
}

const factorIconByKey: Record<FactorKey, LucideIcon> = {
  moisture_level: Droplets,
  rain_probability: CloudRain,
  heat_forecast: Flame
};

function formatFactorValue(value: number, unit: string) {
  const rounded = Math.round(value * 10) / 10;
  if (unit === "%") {
    return `${Math.round(rounded)}%`;
  }
  if (unit === "days") {
    return `${Math.round(rounded)}d`;
  }
  return `${rounded}${unit}`;
}

export function RecommendationCard({
  recommendation,
  generatedAt,
  nextCheckInHours
}: RecommendationCardProps) {
  const t = useI18n();
  const { locale } = useLanguage();

  const actionLabel =
    recommendation.action === "irrigate" ? t.dashboard.actionIrrigate : t.dashboard.actionWait;
  const reasonLabel =
    t.dashboard.reasons[recommendation.reason as keyof typeof t.dashboard.reasons] ??
    recommendation.reason;
  const confidence = `${Math.round(recommendation.confidence * 100)}%`;
  const generated = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(generatedAt));

  return (
    <section className="recommendation-card card">
      <div className="recommendation-top-row">
        <span className="eyebrow">{t.dashboard.title}</span>
        <span
          className={
            recommendation.action === "irrigate" ? "status-chip status-do" : "status-chip status-wait"
          }
        >
          {actionLabel}
        </span>
      </div>

      <div className="recommendation-main-row">
        <div>
          <p className="recommendation-action">{actionLabel}</p>
          <p className="recommendation-reason">{reasonLabel}</p>
        </div>

        <div className="recommendation-metrics">
          <div>
            <p>{t.dashboard.duration}</p>
            <strong>
              {recommendation.duration} {t.dashboard.minutes}
            </strong>
          </div>
          <div>
            <p>{t.dashboard.confidence}</p>
            <strong>{confidence}</strong>
          </div>
        </div>
      </div>

      <div className="decision-factors">
        <p>{t.dashboard.factorsTitle}</p>
        <div className="factor-chip-list">
          {recommendation.factors.map((factor) => {
            const FactorIcon = factorIconByKey[factor.key];
            const factorLabel =
              t.dashboard.factorLabels[factor.key as keyof typeof t.dashboard.factorLabels] ?? factor.key;

            return (
              <span key={factor.key} className={`factor-chip impact-${factor.impact}`}>
                <FactorIcon size={13} />
                {factorLabel}: {formatFactorValue(factor.value, factor.unit)}
              </span>
            );
          })}
        </div>
      </div>

      <div className="recommendation-foot">
        <span>
          <Clock3 size={14} /> {t.dashboard.generatedLabel}: {generated}
        </span>
        {typeof nextCheckInHours === "number" && (
          <span>
            <ShieldCheck size={14} /> {t.dashboard.nextCheck}: {nextCheckInHours} {t.dashboard.hours}
          </span>
        )}
      </div>
    </section>
  );
}
