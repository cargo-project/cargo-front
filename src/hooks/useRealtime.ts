"use client";

import { useEffect, useRef } from "react";
import { realtimeUrl } from "@/services/apiClient";

export interface RealtimeMessage { type: string; tripId?: string; vehicleId?: string; eventId?: string }

export function useRealtime(onMessage: (message: RealtimeMessage) => void) {
  const handler = useRef(onMessage);
  handler.current = onMessage;
  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: number | undefined;
    let stopped = false;
    const connect = () => {
      socket = new WebSocket(realtimeUrl());
      socket.onmessage = (event) => {
        try { handler.current(JSON.parse(event.data) as RealtimeMessage); } catch { /* ignore malformed frames */ }
      };
      socket.onclose = () => { if (!stopped) timer = window.setTimeout(connect, 2000); };
    };
    connect();
    return () => { stopped = true; if (timer) clearTimeout(timer); socket?.close(); };
  }, []);
}

