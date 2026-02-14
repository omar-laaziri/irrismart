const PLOT_SESSION_KEY = "irrismart_active_plot";

export function getActivePlotId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem(PLOT_SESSION_KEY) ?? undefined;
}

export function setActivePlotId(plotId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLOT_SESSION_KEY, plotId);
}
