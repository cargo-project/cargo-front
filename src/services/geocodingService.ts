import { apiClient } from "./apiClient";
import type { ApiGeocodingResult, Coordinates } from "@/types/api";

export const geocodingService = {
  search: (query: string) => apiClient.get<ApiGeocodingResult[]>(
    `/geocoding/search?query=${encodeURIComponent(query)}&limit=5`,
  ),
  reverse: (point: Coordinates) => apiClient.get<ApiGeocodingResult>(
    `/geocoding/reverse?latitude=${point.latitude}&longitude=${point.longitude}`,
  ),
};
