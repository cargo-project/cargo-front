import { apiClient } from "./apiClient";
import type { ApiIntegrationHealth, ApiSettings } from "@/types/api";

export const settingsService = {
  get: () => apiClient.get<ApiSettings>("/settings"),
  health: () => apiClient.get<ApiIntegrationHealth[]>("/integration-health"),
  update: (settings: ApiSettings) => apiClient.put<ApiSettings>("/settings", settings),
};
