import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import {
  getAlertsData,
  getDashboardData,
  getFarmPlotsData,
  getRecommendationData,
  getReportsData,
  getSensorHistory,
  getSimulationData
} from "./mockData.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "irrismart-api", now: new Date().toISOString() });
});

app.get("/api/plots", (_req, res) => {
  res.json(getFarmPlotsData());
});

app.get("/api/dashboard", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  res.json(getDashboardData(plotId));
});

app.get("/api/sensors/history", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  const days = Number(req.query.days ?? 14);
  res.json(getSensorHistory(plotId, days));
});

app.get("/api/recommendations", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  res.json(getRecommendationData(plotId));
});

app.get("/api/alerts", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  res.json(getAlertsData(plotId));
});

app.get("/api/simulations", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  res.json(getSimulationData(plotId));
});

app.get("/api/reports", (req, res) => {
  const plotId = typeof req.query.plotId === "string" ? req.query.plotId : undefined;
  res.json(getReportsData(plotId));
});

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(frontendIndexPath);
  });
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`IrriSmart API running at http://localhost:${PORT}`);
});
