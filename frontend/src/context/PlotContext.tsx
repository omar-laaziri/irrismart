import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api";
import { getActivePlotId, setActivePlotId as persistActivePlotId } from "../plotSession";
import type { FarmInfo, PlotInfo, Season } from "../types";

interface PlotContextValue {
  farm?: FarmInfo;
  season?: Season;
  plots: PlotInfo[];
  activePlotId?: string;
  activePlot?: PlotInfo;
  loading: boolean;
  error: boolean;
  setActivePlotId: (plotId: string) => void;
  refreshPlots: () => Promise<void>;
}

const PlotContext = createContext<PlotContextValue | undefined>(undefined);

export function PlotProvider({ children }: { children: ReactNode }) {
  const [farm, setFarm] = useState<FarmInfo | undefined>(undefined);
  const [season, setSeason] = useState<Season | undefined>(undefined);
  const [plots, setPlots] = useState<PlotInfo[]>([]);
  const [activePlotId, setActivePlotIdState] = useState<string | undefined>(getActivePlotId());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const setActivePlotId = useCallback(
    (plotId: string) => {
      if (!plots.some((plot) => plot.id === plotId)) {
        return;
      }

      setActivePlotIdState(plotId);
      persistActivePlotId(plotId);
    },
    [plots]
  );

  const refreshPlots = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.getPlots();
      setFarm(response.farm);
      setSeason(response.season);
      setPlots(response.plots);

      const storedPlotId = getActivePlotId();
      const fallbackPlotId = response.defaultPlotId ?? response.plots[0]?.id;
      const isStoredValid =
        typeof storedPlotId === "string" && response.plots.some((plot) => plot.id === storedPlotId);
      const nextPlotId = isStoredValid ? storedPlotId : fallbackPlotId;

      if (nextPlotId) {
        setActivePlotIdState(nextPlotId);
        persistActivePlotId(nextPlotId);
      }
    } catch (_error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPlots();
  }, [refreshPlots]);

  const value = useMemo(() => {
    const activePlot = plots.find((plot) => plot.id === activePlotId);

    return {
      farm,
      season,
      plots,
      activePlotId,
      activePlot,
      loading,
      error,
      setActivePlotId,
      refreshPlots
    };
  }, [farm, season, activePlotId, loading, plots, error, setActivePlotId, refreshPlots]);

  return <PlotContext.Provider value={value}>{children}</PlotContext.Provider>;
}

export function usePlot() {
  const context = useContext(PlotContext);

  if (!context) {
    throw new Error("usePlot must be used inside PlotProvider");
  }

  return context;
}
