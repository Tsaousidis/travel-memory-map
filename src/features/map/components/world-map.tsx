"use client";

import { useEffect, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import {
  FullscreenControl,
  Map,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type ErrorEvent,
} from "maplibre-gl";
import { getMapConfig } from "@/lib/config/public-env";
import type { PlacePin, TripPin } from "@/features/map/types";

type MapStatus = "loading" | "ready" | "error";

export function WorldMap({
  visitedCountryCodes,
  tripPins,
  placePins,
}: {
  visitedCountryCodes: string[];
  tripPins: TripPin[];
  placePins: PlacePin[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
    const { center, countriesUrl, styleUrl, zoom } = getMapConfig();
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

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);
    map.addControl(new NavigationControl(), "top-right");
    map.addControl(new FullscreenControl(), "top-right");

    const handleLoad = () => {
      for (const layer of map.getStyle().layers ?? []) {
        if (!("source-layer" in layer) || layer["source-layer"] !== "countries") {
          continue;
        }
        if (layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "#dfe6df");
          map.setPaintProperty(layer.id, "fill-opacity", 0.9);
        } else if (layer.type === "line") {
          map.setPaintProperty(layer.id, "line-color", "#b2c0b7");
          map.setPaintProperty(layer.id, "line-opacity", 0.75);
        }
      }
      map.addSource("countries", {
        type: "geojson",
        data: countriesUrl,
        promoteId: "ISO3166-1-Alpha-2",
      });
      map.addLayer({
        id: "visited-countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#5f9f73",
          "fill-opacity": 0.78,
        },
        filter: ["in", ["get", "ISO3166-1-Alpha-2"], ["literal", visitedCountryCodes]],
      });
      map.addLayer({
        id: "visited-countries-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#245b45",
          "line-width": 1.5,
          "line-opacity": 0.8,
        },
        filter: ["in", ["get", "ISO3166-1-Alpha-2"], ["literal", visitedCountryCodes]],
      });
      const tripPinData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: tripPins.map((tripPin) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [tripPin.longitude, tripPin.latitude],
          },
          properties: tripPin,
        })),
      };
      map.addSource("trip-pins", { type: "geojson", data: tripPinData });
      map.addLayer({
        id: "trip-pins",
        type: "circle",
        source: "trip-pins",
        maxzoom: 4.5,
        paint: {
          "circle-color": "#245b45",
          "circle-radius": 7,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "city-pins",
        type: "circle",
        source: "trip-pins",
        minzoom: 4.5,
        maxzoom: 8,
        paint: {
          "circle-color": "#245b45",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "trip-pins",
        minzoom: 4.5,
        maxzoom: 8,
        layout: {
          "text-field": ["get", "cityName"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#243d35",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });
      const placePinData: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: placePins.map((placePin) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [placePin.longitude, placePin.latitude],
          },
          properties: placePin,
        })),
      };
      map.addSource("place-pins", { type: "geojson", data: placePinData });
      map.addLayer({
        id: "place-pins",
        type: "circle",
        source: "place-pins",
        minzoom: 8,
        paint: {
          "circle-color": "#c76b3f",
          "circle-radius": 5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });
      map.addLayer({
        id: "place-labels",
        type: "symbol",
        source: "place-pins",
        minzoom: 8,
        layout: {
          "text-field": ["get", "placeName"],
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

      map.on("click", "visited-countries-fill", (event) => {
        const feature = event.features?.[0];
        const properties = feature?.properties;
        const countryName =
          typeof properties?.ADMIN === "string"
            ? properties.ADMIN
            : typeof properties?.NAME === "string"
              ? properties.NAME
              : "Visited country";
        new Popup()
          .setLngLat(event.lngLat)
          .setText(`${countryName} · Visited`)
          .addTo(map);
      });
      map.on("mouseenter", "visited-countries-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "visited-countries-fill", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "trip-pins", (event) => {
        const feature = event.features?.[0];
        const properties = feature?.properties;
        if (!properties) {
          return;
        }
        new Popup()
          .setLngLat(event.lngLat)
          .setText(
            `${properties.tripTitle} · ${properties.cityName}, ${properties.countryCode}\n${properties.startDate} – ${properties.endDate}`,
          )
          .addTo(map);
      });
      map.on("mouseenter", "trip-pins", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "trip-pins", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "place-pins", (event) => {
        const properties = event.features?.[0]?.properties;
        if (!properties) {
          return;
        }
        new Popup()
          .setLngLat(event.lngLat)
          .setText(
            `${properties.placeName} · ${properties.cityName}\n${properties.tripTitle} · ${properties.category}`,
          )
          .addTo(map);
      });
      map.on("mouseenter", "place-pins", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "place-pins", () => {
        map.getCanvas().style.cursor = "";
      });
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
      mapRef.current = null;
    };
  }, [placePins, tripPins, visitedCountryCodes]);

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
