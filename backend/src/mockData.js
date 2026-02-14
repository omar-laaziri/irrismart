const FARM = {
  id: "farm_atlas",
  name: "Ferme Atlas",
  location: "Meknes, Maroc"
};

const PLOTS = [
  {
    id: "plot_olive_north",
    name: "Parcelle Oliviers Nord",
    crop_type: "olive",
    soil_type: "loam",
    area_ha: 2.4,
    station_name: "Station Nord",
    temp_bias: 0.3,
    thresholds: {
      moisture_min: 34,
      moisture_target: 44,
      heat_stress_temp: 32
    },
    irrigation_profile: {
      base_minutes: 28,
      recovery_rate: 9.6
    }
  },
  {
    id: "plot_citrus_central",
    name: "Parcelle Agrumes Centre",
    crop_type: "citrus",
    soil_type: "clay",
    area_ha: 1.9,
    station_name: "Station Centrale",
    temp_bias: 0.8,
    thresholds: {
      moisture_min: 38,
      moisture_target: 50,
      heat_stress_temp: 31
    },
    irrigation_profile: {
      base_minutes: 34,
      recovery_rate: 8.5
    }
  },
  {
    id: "plot_wheat_south",
    name: "Parcelle Ble Sud",
    crop_type: "wheat",
    soil_type: "sandy",
    area_ha: 3.2,
    station_name: "Station Sud",
    temp_bias: 1.1,
    thresholds: {
      moisture_min: 28,
      moisture_target: 38,
      heat_stress_temp: 30
    },
    irrigation_profile: {
      base_minutes: 21,
      recovery_rate: 10.3
    }
  }
];

const SOIL_RETENTION = {
  clay: 1.17,
  loam: 1,
  sandy: 0.84
};

const CROP_WATER_FACTOR = {
  olive: 0.96,
  citrus: 1.16,
  wheat: 0.87
};

const SEASON_TEMP_SHIFT = {
  winter: -1.4,
  spring: 1.2,
  summer: 4.6,
  autumn: 0.8
};

const PLOT_INDEX = Object.fromEntries(PLOTS.map((plot, index) => [plot.id, index]));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length <= 1) {
    return 0;
  }

  const mean = average(values);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function seededNoise(seed) {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function resolveSeason(date = new Date()) {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return "spring";
  }
  if (month >= 6 && month <= 8) {
    return "summer";
  }
  if (month >= 9 && month <= 11) {
    return "autumn";
  }

  return "winter";
}

function directionFromDelta(delta, threshold = 0.9) {
  if (delta > threshold) {
    return "increasing";
  }
  if (delta < -threshold) {
    return "decreasing";
  }
  return "stable";
}

function toPublicPlot(plot) {
  return {
    id: plot.id,
    name: plot.name,
    crop_type: plot.crop_type,
    soil_type: plot.soil_type,
    area_ha: plot.area_ha,
    thresholds: plot.thresholds
  };
}

function getPlot(plotId) {
  if (!plotId) {
    return PLOTS[0];
  }

  return PLOTS.find((plot) => plot.id === plotId) ?? PLOTS[0];
}

function buildGlobalContext(plot, season) {
  return {
    farm: FARM,
    plot: toPublicPlot(plot),
    crop: plot.crop_type,
    season,
    generatedAt: new Date().toISOString()
  };
}

function buildHistoryForPlot(plot, season, days = 21) {
  const now = new Date();
  const plotIndex = PLOT_INDEX[plot.id] ?? 0;
  const series = [];

  let moisture = plot.thresholds.moisture_target + 3 - plotIndex * 2;
  let battery = 92 - plotIndex * 5;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const dayNumber = days - i;
    const seedBase = dayNumber + plotIndex * 37;
    const seasonalSwing = Math.sin(seedBase / 2.8) * 4.1;
    const tempNoise = (seededNoise(seedBase + 11) - 0.5) * 1.8;
    const airTemperature = round(
      25 + seasonalSwing + plot.temp_bias + tempNoise + SEASON_TEMP_SHIFT[season]
    );

    const rainBase = 2.4 + Math.cos(seedBase / 2.3) * 2.5;
    const rainNoise = seededNoise(seedBase + 29) * 1.8;
    const rain = round(Math.max(0, rainBase - rainNoise));

    const evap = 2 + Math.max(0, airTemperature - 27) * 0.27;
    const rainGain = rain * 1.1 * SOIL_RETENTION[plot.soil_type];
    const moistureDrain =
      evap * CROP_WATER_FACTOR[plot.crop_type] * (plot.soil_type === "sandy" ? 1.06 : 0.94);
    const drift = (seededNoise(seedBase + 51) - 0.5) * 1.2;

    moisture = clamp(moisture + rainGain - moistureDrain + drift, 15, 78);
    battery = clamp(battery - (0.36 + seededNoise(seedBase + 77) * 0.3), 58, 98);

    series.push({
      date: date.toISOString().slice(0, 10),
      soil_moisture: Math.round(moisture),
      air_temperature: airTemperature,
      rain_mm: rain,
      battery_level: Math.round(battery)
    });
  }

  return series;
}

const ACTIVE_SEASON = resolveSeason();

const HISTORY_CACHE = Object.fromEntries(
  PLOTS.map((plot) => [plot.id, buildHistoryForPlot(plot, ACTIVE_SEASON, 21)])
);

function buildSnapshot(history) {
  const latest = history[history.length - 1];

  return {
    soil_moisture: latest.soil_moisture,
    air_temperature: latest.air_temperature,
    rain_mm_next_24h: latest.rain_mm,
    battery_level: latest.battery_level
  };
}

function buildForecast(plot, snapshot, season, days = 5) {
  const now = new Date();
  const plotIndex = PLOT_INDEX[plot.id] ?? 0;
  const forecast = [];

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + day);

    const seed = day + plotIndex * 19;
    const projectedTemperature = round(
      snapshot.air_temperature +
        Math.sin(seed / 1.5) * 1.7 +
        (seededNoise(seed + 101) - 0.5) * 1.1 +
        (plot.crop_type === "citrus" ? 0.4 : 0) +
        SEASON_TEMP_SHIFT[season] * 0.35
    );

    const rainProbability = Math.round(
      clamp(
        38 +
          Math.cos(seed / 1.6) * 24 +
          (plot.soil_type === "clay" ? 8 : plot.soil_type === "sandy" ? -6 : 2) -
          (plot.crop_type === "wheat" ? 4 : 0),
        8,
        90
      )
    );

    const tempStress =
      projectedTemperature >= plot.thresholds.heat_stress_temp + 2
        ? "high"
        : projectedTemperature >= plot.thresholds.heat_stress_temp
          ? "medium"
          : "low";

    const needScore =
      (plot.thresholds.moisture_target - snapshot.soil_moisture) +
      day * 1.6 +
      (tempStress === "high" ? 8 : tempStress === "medium" ? 4 : 0) -
      rainProbability * 0.12 +
      CROP_WATER_FACTOR[plot.crop_type] * 2.4;

    const irrigationNeed = needScore >= 15 ? "high" : needScore >= 8 ? "medium" : "low";

    forecast.push({
      date: date.toISOString().slice(0, 10),
      irrigation_need: irrigationNeed,
      rain_probability: rainProbability,
      temp_stress: tempStress
    });
  }

  return forecast;
}

function buildMetricTrends(plot, history) {
  const recent = history.slice(-6);
  const previous = recent.slice(0, 3);
  const latest = history[history.length - 1];

  const trends = [
    {
      key: "soil_moisture",
      direction: directionFromDelta(
        average(recent.slice(-3).map((day) => day.soil_moisture)) - average(previous.map((day) => day.soil_moisture)),
        1.4
      ),
      magnitude: round(
        average(recent.slice(-3).map((day) => day.soil_moisture)) - average(previous.map((day) => day.soil_moisture))
      ),
      abnormal:
        latest.soil_moisture < plot.thresholds.moisture_min - 2 ||
        latest.soil_moisture > plot.thresholds.moisture_target + 13,
      note_key:
        latest.soil_moisture < plot.thresholds.moisture_min - 2
          ? "trend_moisture_low"
          : latest.soil_moisture > plot.thresholds.moisture_target + 13
            ? "trend_moisture_high"
            : "trend_moisture_normal"
    },
    {
      key: "air_temperature",
      direction: directionFromDelta(
        average(recent.slice(-3).map((day) => day.air_temperature)) -
          average(previous.map((day) => day.air_temperature)),
        0.8
      ),
      magnitude: round(
        average(recent.slice(-3).map((day) => day.air_temperature)) -
          average(previous.map((day) => day.air_temperature))
      ),
      abnormal: latest.air_temperature >= plot.thresholds.heat_stress_temp + 3,
      note_key:
        latest.air_temperature >= plot.thresholds.heat_stress_temp + 3
          ? "trend_temperature_spike"
          : "trend_temperature_normal"
    },
    {
      key: "rain_mm",
      direction: directionFromDelta(
        average(recent.slice(-3).map((day) => day.rain_mm)) - average(previous.map((day) => day.rain_mm)),
        0.6
      ),
      magnitude: round(
        average(recent.slice(-3).map((day) => day.rain_mm)) - average(previous.map((day) => day.rain_mm))
      ),
      abnormal: latest.rain_mm >= 9,
      note_key: latest.rain_mm >= 9 ? "trend_rain_peak" : "trend_rain_normal"
    },
    {
      key: "battery_level",
      direction: directionFromDelta(
        average(recent.slice(-3).map((day) => day.battery_level)) -
          average(previous.map((day) => day.battery_level)),
        1
      ),
      magnitude: round(
        average(recent.slice(-3).map((day) => day.battery_level)) -
          average(previous.map((day) => day.battery_level))
      ),
      abnormal: latest.battery_level < 68,
      note_key: latest.battery_level < 68 ? "trend_battery_low" : "trend_battery_ok"
    }
  ];

  return {
    list: trends,
    byKey: Object.fromEntries(trends.map((item) => [item.key, item]))
  };
}

function buildDecisionLog(plot, history) {
  const recent = history.slice(-8);
  const logs = [];

  for (let index = 0; index < recent.length - 1; index += 1) {
    const current = recent[index];
    const next = recent[index + 1];

    const moistureGap = plot.thresholds.moisture_target - current.soil_moisture;
    const severeDryness = current.soil_moisture < plot.thresholds.moisture_min;
    const heatPressure = current.air_temperature >= plot.thresholds.heat_stress_temp;
    const rainSupport = current.rain_mm >= 2.4;

    const action = severeDryness || (heatPressure && moistureGap > 2) ? "irrigate" : "wait";

    const duration =
      action === "irrigate"
        ? Math.round(clamp(plot.irrigation_profile.base_minutes + moistureGap * 1.2, 10, 55))
        : 0;

    let reason = "decision_monitor";
    if (action === "irrigate" && severeDryness) {
      reason = "decision_recover_moisture";
    } else if (action === "irrigate") {
      reason = "decision_heat_preventive";
    } else if (rainSupport) {
      reason = "decision_hold_for_rain";
    }

    const moistureChange = round(next.soil_moisture - current.soil_moisture);

    let outcome = "neutral";
    if (action === "irrigate") {
      if (moistureChange >= 1 && next.soil_moisture <= plot.thresholds.moisture_target + 9) {
        outcome = "positive";
      } else if (moistureChange < -1 || next.soil_moisture > plot.thresholds.moisture_target + 14) {
        outcome = "negative";
      }
    } else if (rainSupport && moistureChange >= -1) {
      outcome = "positive";
    } else if (!rainSupport && moistureChange <= -4) {
      outcome = "negative";
    }

    const soilHealthDelta = outcome === "positive" ? 2 : outcome === "negative" ? -3 : 0;

    logs.push({
      id: `${plot.id}-decision-${current.date}`,
      date: current.date,
      action,
      duration,
      reason,
      outcome,
      moisture_change: moistureChange,
      soil_health_delta: soilHealthDelta
    });
  }

  return logs.reverse();
}

function summarizeDecisionLog(logs) {
  const irrigateCount = logs.filter((log) => log.action === "irrigate").length;
  const waitCount = logs.filter((log) => log.action === "wait").length;
  const positiveCount = logs.filter((log) => log.outcome === "positive").length;

  return {
    irrigate_count: irrigateCount,
    wait_count: waitCount,
    positive_rate: logs.length === 0 ? 0 : Math.round((positiveCount / logs.length) * 100)
  };
}

function computeSoilHealth(plot, history, decisionSummary) {
  const recent = history.slice(-7);
  const moistures = recent.map((day) => day.soil_moisture);
  const temperatures = recent.map((day) => day.air_temperature);

  const moistureAverage = average(moistures);
  const moistureStd = standardDeviation(moistures);

  const stabilityScore = Math.round(
    clamp(
      100 - Math.abs(moistureAverage - plot.thresholds.moisture_target) * 4.4 - moistureStd * 6.8,
      15,
      99
    )
  );

  const outOfBandDays = recent.filter(
    (day) =>
      day.soil_moisture < plot.thresholds.moisture_min ||
      day.soil_moisture > plot.thresholds.moisture_target + 11
  ).length;
  const irrigationBalanceScore = Math.round(
    clamp(100 - (outOfBandDays / recent.length) * 82, 12, 99)
  );

  const heatStressDays = temperatures.filter(
    (temperature) => temperature >= plot.thresholds.heat_stress_temp
  ).length;
  const temperatureStressScore = Math.round(
    clamp(100 - (heatStressDays / recent.length) * 74, 15, 99)
  );

  const decisionConsistencyScore = Math.round(
    clamp(35 + decisionSummary.positive_rate * 0.62, 22, 98)
  );

  const score = Math.round(
    stabilityScore * 0.3 +
      irrigationBalanceScore * 0.24 +
      temperatureStressScore * 0.2 +
      decisionConsistencyScore * 0.26
  );

  const status = score >= 74 ? "healthy" : score >= 50 ? "watch" : "degraded";

  const explanation = [];
  if (stabilityScore < 62) {
    explanation.push("moisture_variability_high");
  }
  if (irrigationBalanceScore < 62) {
    explanation.push("irrigation_balance_off");
  }
  if (temperatureStressScore < 62) {
    explanation.push("temperature_stress_frequent");
  }
  if (decisionConsistencyScore < 62) {
    explanation.push("decision_timing_inconsistent");
  }
  if (explanation.length === 0) {
    explanation.push("soil_health_stable");
  }

  return {
    score,
    status,
    explanation,
    components: {
      moisture_stability: stabilityScore,
      irrigation_balance: irrigationBalanceScore,
      temperature_stress: temperatureStressScore,
      decision_consistency: decisionConsistencyScore
    }
  };
}

function buildSystemIntelligence(plot, history, trends) {
  const latest = history[history.length - 1];
  const abnormalCount = trends.filter((trend) => trend.abnormal).length;

  const moistureSeries = history.slice(-7).map((day) => day.soil_moisture);
  const moistureDiffs = moistureSeries.slice(1).map((value, index) => Math.sign(value - moistureSeries[index]));
  const directionChanges = moistureDiffs.reduce((count, value, index) => {
    if (index === 0 || value === 0 || moistureDiffs[index - 1] === 0) {
      return count;
    }
    return value !== moistureDiffs[index - 1] ? count + 1 : count;
  }, 0);

  const trendConsistencyScore = Math.round(clamp(100 - directionChanges * 12 - abnormalCount * 15, 28, 99));

  const freshnessMinutes = 14 + (PLOT_INDEX[plot.id] ?? 0) * 6;

  const dataConfidence = Math.round(
    clamp(88 - abnormalCount * 8 - (100 - latest.battery_level) * 0.45 - directionChanges * 3, 48, 98)
  );

  const sensorReliability =
    dataConfidence >= 78 ? "reliable" : dataConfidence >= 60 ? "watch" : "critical";
  const trendConsistency =
    trendConsistencyScore >= 74
      ? "consistent"
      : trendConsistencyScore >= 55
        ? "mixed"
        : "volatile";

  const trendByKey = Object.fromEntries(trends.map((trend) => [trend.key, trend]));

  return {
    data_confidence: dataConfidence,
    sensor_reliability: sensorReliability,
    trend_consistency: trendConsistency,
    freshness_minutes: freshnessMinutes,
    sensor_status: {
      soil_moisture: trendByKey.soil_moisture?.abnormal ? "watch" : "reliable",
      air_temperature: trendByKey.air_temperature?.abnormal ? "watch" : "reliable",
      rain_mm: trendByKey.rain_mm?.abnormal ? "watch" : "reliable",
      battery_level:
        latest.battery_level < 68 ? "critical" : latest.battery_level < 76 ? "watch" : "reliable"
    }
  };
}

function computeRecommendation(plot, snapshot, forecast, intelligence, trends) {
  const tomorrow = forecast[0];
  const moistureDeficit = plot.thresholds.moisture_target - snapshot.soil_moisture;
  const criticalGap = plot.thresholds.moisture_min - snapshot.soil_moisture;
  const rainProbability = tomorrow?.rain_probability ?? 30;
  const heatDays = forecast.filter((day) => day.temp_stress !== "low").length;

  let action = "wait";
  let duration = 0;
  let reason = "moisture_optimal";
  let confidence = 0.9;

  if (criticalGap >= 4 && rainProbability < 55) {
    action = "irrigate";
    duration = plot.irrigation_profile.base_minutes + criticalGap * 3.2 + heatDays * 1.8;
    reason = "severe_dryness";
    confidence = 0.88;
  } else if (moistureDeficit >= 6 && rainProbability < 42) {
    action = "irrigate";
    duration = plot.irrigation_profile.base_minutes - 5 + moistureDeficit * 2.1 + heatDays * 1.4;
    reason = "moderate_deficit";
    confidence = 0.79;
  } else if (rainProbability >= 62 && snapshot.soil_moisture >= plot.thresholds.moisture_min - 1) {
    action = "wait";
    duration = 0;
    reason = "rain_incoming";
    confidence = 0.74;
  } else if (heatDays >= 3 && moistureDeficit >= 2) {
    action = "irrigate";
    duration = plot.irrigation_profile.base_minutes - 8 + heatDays * 2.3;
    reason = "heat_pressure";
    confidence = 0.71;
  }

  confidence = round(clamp(confidence * (intelligence.data_confidence / 100 + 0.08), 0.52, 0.95));

  const factors = [
    {
      key: "moisture_level",
      impact:
        snapshot.soil_moisture < plot.thresholds.moisture_min
          ? "high"
          : moistureDeficit >= 3
            ? "medium"
            : "low",
      value: snapshot.soil_moisture,
      unit: "%"
    },
    {
      key: "rain_probability",
      impact: rainProbability >= 62 ? "high" : rainProbability >= 38 ? "medium" : "low",
      value: rainProbability,
      unit: "%"
    },
    {
      key: "heat_forecast",
      impact: heatDays >= 3 ? "high" : heatDays >= 2 ? "medium" : "low",
      value: heatDays,
      unit: "days"
    }
  ];

  const decisionInputNote =
    trends.soil_moisture.direction === "decreasing"
      ? "decision_input_moisture_drop"
      : intelligence.trend_consistency === "volatile"
        ? "decision_input_inconsistent"
        : "decision_input_stable_signal";

  return {
    action,
    duration: Math.round(clamp(duration, 0, 55)),
    reason,
    confidence,
    factors,
    decision_input_note: decisionInputNote
  };
}

function buildSimulation(plot, snapshot, forecast, soilHealth) {
  const nextDay = forecast[0];
  const rainEffect = (nextDay?.rain_probability ?? 35) * 0.035;
  const heatPenalty =
    nextDay?.temp_stress === "high" ? 4.8 : nextDay?.temp_stress === "medium" ? 3.1 : 2;

  const irrigationGain =
    plot.irrigation_profile.recovery_rate + (plot.soil_type === "sandy" ? 1.8 : 0.8);

  const irrigateMoisture = round(
    clamp(snapshot.soil_moisture + irrigationGain + rainEffect - heatPenalty * 0.45, 10, 92)
  );
  const waitMoisture = round(clamp(snapshot.soil_moisture + rainEffect - heatPenalty, 10, 92));

  let irrigateHealthDelta = 3;
  if (snapshot.soil_moisture < plot.thresholds.moisture_min) {
    irrigateHealthDelta += 3;
  }
  if (soilHealth.status === "degraded") {
    irrigateHealthDelta += 1;
  }

  const waitHealthDelta =
    waitMoisture < plot.thresholds.moisture_min
      ? -6
      : (nextDay?.rain_probability ?? 0) > 65
        ? 2
        : -2;

  const irrigateHealth = Math.round(clamp(soilHealth.score + irrigateHealthDelta, 0, 100));
  const waitHealth = Math.round(clamp(soilHealth.score + waitHealthDelta, 0, 100));

  return {
    baseline: {
      soil_moisture: snapshot.soil_moisture,
      soil_health_score: soilHealth.score
    },
    scenarios: [
      {
        id: "irrigate_today",
        estimated_soil_moisture: irrigateMoisture,
        estimated_soil_health: irrigateHealth,
        delta_moisture: round(irrigateMoisture - snapshot.soil_moisture),
        delta_health: irrigateHealth - soilHealth.score,
        summary: "sim_stabilize_moisture"
      },
      {
        id: "wait_24h",
        estimated_soil_moisture: waitMoisture,
        estimated_soil_health: waitHealth,
        delta_moisture: round(waitMoisture - snapshot.soil_moisture),
        delta_health: waitHealth - soilHealth.score,
        summary: (nextDay?.rain_probability ?? 0) >= 65 ? "sim_rain_could_cover" : "sim_dryness_risk"
      }
    ]
  };
}

function buildAlerts(state) {
  const { plot, context, snapshot, forecast, soilHealth, intelligence, recommendation, trends } = state;
  const alerts = [];

  if (snapshot.soil_moisture < plot.thresholds.moisture_min - 3) {
    alerts.push({
      id: `${plot.id}-A1`,
      severity: "critical",
      titleKey: "soil_too_dry",
      messageKey: "soil_too_dry_msg",
      source: plot.station_name,
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "soil_moisture",
      impacts: {
        decision: "high",
        soil_health: "high",
        yield_risk: "high"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  if (snapshot.battery_level < 70 || intelligence.sensor_status.battery_level !== "reliable") {
    alerts.push({
      id: `${plot.id}-A2`,
      severity: "warning",
      titleKey: "battery_drop",
      messageKey: "battery_drop_msg",
      source: plot.station_name,
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "battery_level",
      impacts: {
        decision: "medium",
        soil_health: "low",
        yield_risk: "low"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  if ((forecast[0]?.temp_stress ?? "low") === "high" && recommendation.action === "wait") {
    alerts.push({
      id: `${plot.id}-A3`,
      severity: "warning",
      titleKey: "heat_risk_window",
      messageKey: "heat_risk_window_msg",
      source: "Prevision meteo",
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "air_temperature",
      impacts: {
        decision: "high",
        soil_health: "medium",
        yield_risk: "medium"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  if (soilHealth.status === "degraded") {
    alerts.push({
      id: `${plot.id}-A4`,
      severity: "warning",
      titleKey: "soil_health_dip",
      messageKey: "soil_health_dip_msg",
      source: plot.name,
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "soil_moisture",
      impacts: {
        decision: "medium",
        soil_health: "high",
        yield_risk: "medium"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  if (intelligence.trend_consistency === "volatile" || trends.soil_moisture.direction === "decreasing") {
    alerts.push({
      id: `${plot.id}-A5`,
      severity: "info",
      titleKey: "trend_shift",
      messageKey: "trend_shift_msg",
      source: context.plot.name,
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "soil_moisture",
      impacts: {
        decision: "medium",
        soil_health: "medium",
        yield_risk: "low"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: `${plot.id}-A0`,
      severity: "info",
      titleKey: "all_stable",
      messageKey: "all_stable_msg",
      source: plot.name,
      plot_id: plot.id,
      plot_name: plot.name,
      sensor_key: "soil_moisture",
      impacts: {
        decision: "low",
        soil_health: "low",
        yield_risk: "low"
      },
      decision_reference: {
        action: recommendation.action,
        reason: recommendation.reason,
        dashboard_path: "/"
      }
    });
  }

  return alerts.map((alert, index) => ({
    ...alert,
    createdAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 6).toISOString()
  }));
}

function buildReportNarrative(state, alerts) {
  const { trends, soilHealth, decisionSummary, recommendation } = state;

  let observedKey = "report_observed_stable";
  if (trends.soil_moisture.direction === "decreasing" && trends.soil_moisture.abnormal) {
    observedKey = "report_observed_dry_trend";
  } else if (trends.air_temperature.direction === "increasing" && trends.air_temperature.abnormal) {
    observedKey = "report_observed_heat_rise";
  }

  let decisionsKey = "report_decisions_balanced";
  if (decisionSummary.irrigate_count >= decisionSummary.wait_count + 2) {
    decisionsKey = "report_decisions_proactive";
  } else if (decisionSummary.wait_count >= decisionSummary.irrigate_count + 2) {
    decisionsKey = "report_decisions_conservative";
  }

  let impactKey = "report_impact_watch";
  if (soilHealth.status === "healthy" && decisionSummary.positive_rate >= 60) {
    impactKey = "report_impact_positive";
  } else if (soilHealth.status === "degraded" || alerts.some((alert) => alert.severity === "critical")) {
    impactKey = "report_impact_risk";
  }

  return {
    observed_key: observedKey,
    decisions_key: decisionsKey,
    impact_key: impactKey,
    linked_decision_action: recommendation.action
  };
}

function buildPlotState(plotId) {
  const plot = getPlot(plotId);
  const season = ACTIVE_SEASON;
  const context = buildGlobalContext(plot, season);
  const history = HISTORY_CACHE[plot.id] ?? HISTORY_CACHE[PLOTS[0].id];

  const snapshot = buildSnapshot(history);
  const forecast = buildForecast(plot, snapshot, season, 5);
  const trendsBundle = buildMetricTrends(plot, history);
  const decisionLog = buildDecisionLog(plot, history);
  const decisionSummary = summarizeDecisionLog(decisionLog);
  const soilHealth = computeSoilHealth(plot, history, decisionSummary);
  const intelligence = buildSystemIntelligence(plot, history, trendsBundle.list);
  const recommendation = computeRecommendation(plot, snapshot, forecast, intelligence, trendsBundle.byKey);
  const simulation = buildSimulation(plot, snapshot, forecast, soilHealth);

  const nextCheckInHours =
    recommendation.action === "irrigate"
      ? 4
      : intelligence.sensor_reliability === "critical"
        ? 3
        : soilHealth.status === "degraded"
          ? 5
          : 8;

  const alerts = buildAlerts({
    plot,
    context,
    snapshot,
    forecast,
    soilHealth,
    intelligence,
    recommendation,
    trends: trendsBundle.byKey
  });

  const narrative = buildReportNarrative(
    {
      trends: trendsBundle.byKey,
      soilHealth,
      decisionSummary,
      recommendation
    },
    alerts
  );

  const weeklySeries = history.slice(-7);

  return {
    plot,
    context,
    history,
    weeklySeries,
    snapshot,
    forecast,
    trends: trendsBundle,
    intelligence,
    recommendation,
    decisionLog,
    decisionSummary,
    soilHealth,
    simulation,
    alerts,
    narrative,
    nextCheckInHours
  };
}

export function getFarmPlotsData() {
  return {
    farm: FARM,
    season: ACTIVE_SEASON,
    defaultPlotId: PLOTS[0].id,
    plots: PLOTS.map((plot) => toPublicPlot(plot))
  };
}

export function getDashboardData(plotId) {
  const state = buildPlotState(plotId);

  return {
    context: state.context,
    farm: state.context.farm,
    selectedPlot: state.context.plot,
    generatedAt: state.context.generatedAt,
    snapshot: state.snapshot,
    recommendation: state.recommendation,
    forecast: state.forecast,
    soilHealth: state.soilHealth,
    intelligence: state.intelligence,
    decisionLog: state.decisionLog,
    nextCheckInHours: state.nextCheckInHours
  };
}

export function getSensorHistory(plotId, days = 14) {
  const state = buildPlotState(plotId);
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(14, days)) : 14;

  return {
    context: state.context,
    days: safeDays,
    plot: state.context.plot,
    series: state.history.slice(-safeDays),
    trends: state.trends.list,
    intelligence: state.intelligence,
    decision_input: {
      action: state.recommendation.action,
      reason: state.recommendation.reason,
      note_key: state.recommendation.decision_input_note,
      dashboard_path: "/"
    }
  };
}

export function getRecommendationData(plotId) {
  const state = buildPlotState(plotId);

  return {
    context: state.context,
    plot: state.context.plot,
    updatedAt: state.context.generatedAt,
    recommendation: state.recommendation,
    nextCheckInHours: state.nextCheckInHours
  };
}

export function getAlertsData(plotId) {
  const state = buildPlotState(plotId);

  return {
    context: state.context,
    plot: state.context.plot,
    intelligence: state.intelligence,
    alerts: state.alerts
  };
}

export function getSimulationData(plotId) {
  const state = buildPlotState(plotId);

  return {
    context: state.context,
    plot: state.context.plot,
    ...state.simulation
  };
}

export function getReportsData(plotId) {
  const state = buildPlotState(plotId);

  return {
    context: state.context,
    intelligence: state.intelligence,
    weekly: {
      avg_moisture: Math.round(average(state.weeklySeries.map((row) => row.soil_moisture))),
      avg_temp: round(average(state.weeklySeries.map((row) => row.air_temperature))),
      total_rain: round(state.weeklySeries.reduce((sum, row) => sum + row.rain_mm, 0)),
      active_alerts: state.alerts.length
    },
    decision_summary: state.decisionSummary,
    narrative: state.narrative,
    decision_log: state.decisionLog,
    recent_series: state.weeklySeries,
    alerts: state.alerts.slice(0, 3)
  };
}
