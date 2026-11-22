export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api/v1",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") ?? "",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;
