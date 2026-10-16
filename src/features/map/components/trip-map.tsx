"use client";

import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import {
  LngLatBounds,
  Map,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type ErrorEvent,
} from "maplibre-gl";
import { getMapConfig } from "@/lib/config/public-env";
import type { TripDetails } from "@/features/map/types";

type MapStatus = "loading" | "ready" | "error";

export function TripMap({ trip }: { trip: TripDetails }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
    const { styleUrl } = getMapConfig();
    const map = new Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 20],
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: {},
    });
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);
    map.addControl(new NavigationControl(), "top-right");

    const handleLoad = () => {
      for (const layer of map.getStyle().layers ?? []) {
        if (!("source-layer" in layer) || layer["source-layer"] !== "countries") continue;
        if (layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "#dfe6df");
          map.setPaintProperty(layer.id, "fill-opacity", 0.9);
        } else if (layer.type === "line") {
          map.setPaintProperty(layer.id, "line-color", "#b2c0b7");
          map.setPaintProperty(layer.id, "line-opacity", 0.75);
        }
      }

      const cityData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: trip.cities.map((city) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [city.longitude, city.latitude] },
          properties: city,
        })),
      };
      const placeData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: trip.places.map((place) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [place.longitude, place.latitude] },
          properties: place,
        })),
      };

      map.addSource("trip-cities", { type: "geojson", data: cityData });
      map.addLayer({
        id: "trip-city-pins",
        type: "circle",
        source: "trip-cities",
        paint: {
          "circle-color": "#245b45",
          "circle-radius": 8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "trip-city-labels",
        type: "symbol",
        source: "trip-cities",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 13,
          "text-offset": [0, 1.25],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#243d35",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });
      map.addSource("trip-places", { type: "geojson", data: placeData });
      map.addLayer({
        id: "trip-place-pins",
        type: "circle",
        source: "trip-places",
        paint: {
          "circle-color": "#c76b3f",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });
      map.addLayer({
        id: "trip-place-labels",
        type: "symbol",
        source: "trip-places",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#243d35",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      const points = [...trip.cities, ...trip.places];
      if (points.length === 1) {
        map.setCenter([points[0].longitude, points[0].latitude]);
        map.setZoom(10);
      } else if (points.length > 1) {
        const bounds = new LngLatBounds();
        points.forEach((point) => bounds.extend([point.longitude, point.latitude]));
        map.fitBounds(bounds, { padding: 70, maxZoom: 12, duration: 0 });
      }

      map.on("click", "trip-city-pins", (event) => {
        const properties = event.features?.[0]?.properties;
        if (!properties) return;
        new Popup().setLngLat(event.lngLat).setText(`${properties.name} · ${properties.countryCode}`).addTo(map);
      });
      map.on("click", "trip-place-pins", (event) => {
        const properties = event.features?.[0]?.properties;
        if (!properties) return;
        new Popup().setLngLat(event.lngLat).setText(`${properties.name} · ${properties.category}`).addTo(map);
      });
      for (const layerId of ["trip-city-pins", "trip-place-pins"]) {
        map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
      }
      map.resize();
      setStatus("ready");
    };
    const handleError = (event: ErrorEvent) => {
      setStatus("error");
      setErrorMessage(event.error.message || "The map could not be loaded.");
    };

    map.on("load", handleLoad);
    map.on("error", handleError);
    return () => {
      map.off("load", handleLoad);
      map.off("error", handleError);
      resizeObserver.disconnect();
      map.remove();
    };
  }, [trip]);

  return (
    <div className="trip-map" aria-label={`Map of ${trip.title}`} role="application">
      <div ref={containerRef} className="trip-map__canvas" />
      {status === "loading" && <div className="world-map__status" role="status"><span className="spinner" aria-hidden="true" />Loading map…</div>}
      {status === "error" && <div className="world-map__status world-map__status--error" role="alert"><strong>Map unavailable</strong><span>{errorMessage}</span></div>}
    </div>
  );
}
