export type RecommendationAction = "irrigate" | "wait";
export type CropType = "olive" | "citrus" | "wheat";
export type SoilType = "clay" | "loam" | "sandy";
export type Season = "winter" | "spring" | "summer" | "autumn";

export type TrendLevel = "low" | "medium" | "high";
export type TrendDirection = "increasing" | "decreasing" | "stable";
export type SoilHealthStatus = "healthy" | "watch" | "degraded";
export type FactorImpact = "low" | "medium" | "high";
export type FactorKey = "moisture_level" | "rain_probability" | "heat_forecast";
export type SimulationScenarioId = "irrigate_today" | "wait_24h";
export type DecisionOutcome = "positive" | "neutral" | "negative";
export type ReliabilityStatus = "reliable" | "watch" | "critical";
export type ConsistencyStatus = "consistent" | "mixed" | "volatile";
export type SensorKey = "soil_moisture" | "air_temperature" | "rain_mm" | "battery_level";

export interface PlotThresholds {
  moisture_min: number;
  moisture_target: number;
  heat_stress_temp: number;
}

export interface PlotInfo {
  id: string;
  name: string;
  crop_type: CropType;
  soil_type: SoilType;
  area_ha: number;
  thresholds: PlotThresholds;
}

export interface RecommendationFactor {
  key: FactorKey;
  impact: FactorImpact;
  value: number;
  unit: string;
}

export interface Recommendation {
  action: RecommendationAction;
  duration: number;
  reason: string;
  confidence: number;
  factors: RecommendationFactor[];
  decision_input_note?: string;
}

export interface FarmInfo {
  id: string;
  name: string;
  location: string;
}

export interface GlobalContext {
  farm: FarmInfo;
  plot: PlotInfo;
  crop: CropType;
  season: Season;
  generatedAt: string;
}

export interface Snapshot {
  soil_moisture: number;
  air_temperature: number;
  rain_mm_next_24h: number;
  battery_level: number;
}

export interface ForecastDay {
  date: string;
  irrigation_need: TrendLevel;
  rain_probability: number;
  temp_stress: TrendLevel;
}

export interface SoilHealth {
  score: number;
  status: SoilHealthStatus;
  explanation: string[];
  components: {
    moisture_stability: number;
    irrigation_balance: number;
    temperature_stress: number;
    decision_consistency: number;
  };
}

export interface SystemIntelligence {
  data_confidence: number;
  sensor_reliability: ReliabilityStatus;
  trend_consistency: ConsistencyStatus;
  freshness_minutes: number;
  sensor_status: Record<SensorKey, ReliabilityStatus>;
}

export interface SensorTrend {
  key: SensorKey;
  direction: TrendDirection;
  magnitude: number;
  abnormal: boolean;
  note_key: string;
}

export interface DecisionLogItem {
  id: string;
  date: string;
  action: RecommendationAction;
  duration: number;
  reason: string;
  outcome: DecisionOutcome;
  moisture_change: number;
  soil_health_delta: number;
}

export interface DecisionSummary {
  irrigate_count: number;
  wait_count: number;
  positive_rate: number;
}

export interface DashboardData {
  context: GlobalContext;
  farm: FarmInfo;
  selectedPlot: PlotInfo;
  generatedAt: string;
  snapshot: Snapshot;
  recommendation: Recommendation;
  forecast: ForecastDay[];
  soilHealth: SoilHealth;
  intelligence: SystemIntelligence;
  decisionLog: DecisionLogItem[];
  nextCheckInHours: number;
}

export interface SensorPoint {
  date: string;
  soil_moisture: number;
  air_temperature: number;
  rain_mm: number;
  battery_level: number;
}

export interface SensorHistoryResponse {
  context: GlobalContext;
  days: number;
  plot: PlotInfo;
  series: SensorPoint[];
  trends: SensorTrend[];
  intelligence: SystemIntelligence;
  decision_input: {
    action: RecommendationAction;
    reason: string;
    note_key: string;
    dashboard_path: string;
  };
}

export interface RecommendationResponse {
  context: GlobalContext;
  plot: PlotInfo;
  updatedAt: string;
  recommendation: Recommendation;
  nextCheckInHours: number;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  titleKey: string;
  messageKey: string;
  source: string;
  createdAt: string;
  plot_id: string;
  plot_name: string;
  sensor_key: SensorKey;
  impacts: {
    decision: TrendLevel;
    soil_health: TrendLevel;
    yield_risk: TrendLevel;
  };
  decision_reference: {
    action: RecommendationAction;
    reason: string;
    dashboard_path: string;
  };
}

export interface AlertsResponse {
  context: GlobalContext;
  plot: PlotInfo;
  intelligence: SystemIntelligence;
  alerts: AlertItem[];
}

export interface FarmPlotsResponse {
  farm: FarmInfo;
  season: Season;
  defaultPlotId: string;
  plots: PlotInfo[];
}

export interface SimulationScenario {
  id: SimulationScenarioId;
  estimated_soil_moisture: number;
  estimated_soil_health: number;
  delta_moisture: number;
  delta_health: number;
  summary: string;
}

export interface SimulationResponse {
  context: GlobalContext;
  plot: PlotInfo;
  baseline: {
    soil_moisture: number;
    soil_health_score: number;
  };
  scenarios: SimulationScenario[];
}

export interface ReportsResponse {
  context: GlobalContext;
  intelligence: SystemIntelligence;
  weekly: {
    avg_moisture: number;
    avg_temp: number;
    total_rain: number;
    active_alerts: number;
  };
  decision_summary: DecisionSummary;
  narrative: {
    observed_key: string;
    decisions_key: string;
    impact_key: string;
    linked_decision_action: RecommendationAction;
  };
  decision_log: DecisionLogItem[];
  recent_series: SensorPoint[];
  alerts: AlertItem[];
}
