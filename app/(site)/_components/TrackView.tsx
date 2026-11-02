"use client";

import { useEffect } from "react";
import { track, type EventName } from "@/lib/track";

/** Counts a page as read, once each time it is opened (lib/track.ts). */
export function TrackView({ event, params }: { event: EventName; params: Record<string, string> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key));
  }, [event, key]);
  return null;
}
