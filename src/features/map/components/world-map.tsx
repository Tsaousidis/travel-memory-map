"use client";

import { useEffect, useRef, useState } from "react";
import {
  FullscreenControl,
  Map,
  NavigationControl,
  type ErrorEvent,
} from "maplibre-gl";
import { getMapConfig } from "@/lib/config/public-env";

type MapStatus = "loading" | "ready" | "error";

export function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const { center, styleUrl, zoom } = getMapConfig();
    const map = new Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: {},
    });
    mapRef.current = map;

    map.addControl(new NavigationControl(), "top-right");
    map.addControl(new FullscreenControl(), "top-right");

    const handleLoad = () => setStatus("ready");
    const handleError = (event: ErrorEvent) => {
      setStatus("error");
      setErrorMessage(event.error.message || "The map could not be loaded.");
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    return () => {
      map.off("load", handleLoad);
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="world-map" aria-label="Interactive world map" role="application">
      <div ref={containerRef} className="world-map__canvas" />
      {status === "loading" && (
        <div className="world-map__status" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading map…
        </div>
      )}
      {status === "error" && (
        <div className="world-map__status world-map__status--error" role="alert">
          <strong>Map unavailable</strong>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
