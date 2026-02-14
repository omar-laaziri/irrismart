# IrriSmart – Coding Agent Instructions

## Project Goal
Build a clean, modern, UI-first web app (MVP level) for a smart irrigation advisory system
targeting Moroccan farmers.

The app must look like a real SaaS product demo, not an academic prototype.

## Product Scope (STRICT)
- Decision-support only (NO automatic irrigation control)
- Single farm, single user
- Dummy or simulated data allowed
- Focus on visual clarity and UX

## Core Question the App Answers
"Should I irrigate today, and for how long?"

## UI Priorities
- Mobile-first responsive design
- Dashboard-centric UX
- Large cards, icons, color-coded status
- Simple charts (7–14 days max)
- Minimal text, human-readable explanations

## Core Pages
1. Dashboard (hero recommendation card)
2. Sensor / Field details with charts
3. Alerts list
4. Lightweight reports
5. Language toggle (FR / AR, RTL supported)

## Data Model (UI-Level Only)
- soil_moisture (%)
- air_temperature (°C)
- rain_mm_next_24h
- battery_level (%)
- recommendation {action, duration, reason, confidence}

## Tech Constraints
- Lightweight frontend (modern JS framework)
- Simple backend API
- Dummy data allowed where hardware is unavailable
- Code clarity > performance optimization

## Design Tone
- Clean
- Professional
- Agricultural tech
- Moroccan context
