import { InjectionToken } from "@angular/core";
export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL");
declare global {
  interface Window {
    ARCANA_CONFIG?: { apiBaseUrl?: string };
  }
}
export function apiBaseUrl() {
  const value = window.ARCANA_CONFIG?.apiBaseUrl || "/api/v1";
  if (!value.startsWith("/") && !/^https?:\/\//.test(value))
    throw new Error("Invalid Arcana API URL");
  return value.replace(/\/$/, "");
}
