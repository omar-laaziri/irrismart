/**
 * Vercel serverless API entrypoint.
 * Keeps the same /api contract used locally by the Express backend.
 */
module.exports = async function handler(req, res) {
  const {
    getAlertsData,
    getDashboardData,
    getFarmPlotsData,
    getRecommendationData,
    getReportsData,
    getSensorHistory,
    getSimulationData
  } = await import("../backend/src/mockData.js");

  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const rawPath = requestUrl.pathname;
  const path = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

  const sendJson = (statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };

  if (req.method !== "GET") {
    sendJson(405, { message: "Method not allowed" });
    return;
  }

  try {
    const plotId = requestUrl.searchParams.get("plotId") || undefined;

    if (path === "/api/health") {
      sendJson(200, { status: "ok", service: "irrismart-api", now: new Date().toISOString() });
      return;
    }

    if (path === "/api/plots") {
      sendJson(200, getFarmPlotsData());
      return;
    }

    if (path === "/api/dashboard") {
      sendJson(200, getDashboardData(plotId));
      return;
    }

    if (path === "/api/sensors/history") {
      const days = Number(requestUrl.searchParams.get("days") ?? "14");
      sendJson(200, getSensorHistory(plotId, days));
      return;
    }

    if (path === "/api/recommendations") {
      sendJson(200, getRecommendationData(plotId));
      return;
    }

    if (path === "/api/alerts") {
      sendJson(200, getAlertsData(plotId));
      return;
    }

    if (path === "/api/simulations") {
      sendJson(200, getSimulationData(plotId));
      return;
    }

    if (path === "/api/reports") {
      sendJson(200, getReportsData(plotId));
      return;
    }

    sendJson(404, { message: "Not found" });
  } catch (error) {
    sendJson(500, {
      message: "Failed to process API request",
      detail: error instanceof Error ? error.message : "unknown_error"
    });
  }
};
