import type {
  AlertsResponse,
  DashboardData,
  FarmPlotsResponse,
  RecommendationResponse,
  ReportsResponse,
  SimulationResponse,
  SensorHistoryResponse
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function withPlot(path: string, plotId?: string) {
  if (!plotId) {
    return path;
  }
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}plotId=${encodeURIComponent(plotId)}`;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export const api = {
  getPlots: () => request<FarmPlotsResponse>("/plots"),
  getDashboard: (plotId?: string) => request<DashboardData>(withPlot("/dashboard", plotId)),
  getSensorHistory: (days = 14, plotId?: string) =>
    request<SensorHistoryResponse>(withPlot(`/sensors/history?days=${days}`, plotId)),
  getRecommendations: (plotId?: string) =>
    request<RecommendationResponse>(withPlot("/recommendations", plotId)),
  getAlerts: (plotId?: string) => request<AlertsResponse>(withPlot("/alerts", plotId)),
  getSimulation: (plotId?: string) =>
    request<SimulationResponse>(withPlot("/simulations", plotId)),
  getReports: (plotId?: string) => request<ReportsResponse>(withPlot("/reports", plotId))
};
