import { usePlot } from "../context/PlotContext";
import { useI18n } from "../i18n";

export function PlotSwitcher() {
  const t = useI18n();
  const { farm, season, plots, activePlotId, activePlot, setActivePlotId, loading } = usePlot();

  if (loading || plots.length === 0 || !activePlotId) {
    return null;
  }

  const activeCropLabel = activePlot
    ? t.dashboard.crops[activePlot.crop_type as keyof typeof t.dashboard.crops] ?? activePlot.crop_type
    : "";
  const seasonLabel = season
    ? t.common.seasons[season as keyof typeof t.common.seasons]
    : t.common.seasons.winter;

  return (
    <section className="farm-context-bar card">
      <div className="farm-context-head">
        <p className="farm-context-label">{t.dashboard.farmLabel}</p>
        <strong className="farm-context-name">
          {farm ? `${farm.name} • ${farm.location}` : "IrriSmart"}
        </strong>
        <div className="farm-context-meta">
          <span className="context-pill">
            {t.common.season}: {seasonLabel}
          </span>
          <span className="context-pill context-pill-active">
            {t.common.crop}: {activeCropLabel}
          </span>
        </div>
      </div>

      <div className="parcel-chip-row">
        {plots.map((plot) => {
          const isActive = plot.id === activePlotId;

          return (
            <button
              key={plot.id}
              type="button"
              aria-pressed={isActive}
              className={isActive ? "parcel-chip is-active" : "parcel-chip"}
              onClick={() => {
                if (!isActive) {
                  setActivePlotId(plot.id);
                }
              }}
            >
              <span className="parcel-chip-name">{plot.name}</span>
              <span className="parcel-chip-meta">{plot.area_ha} ha</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
