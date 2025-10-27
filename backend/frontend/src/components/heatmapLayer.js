import { useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet.heat";

const HeatmapLayer = ({ points, ...options }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    const heatLayer = window.L.heatLayer(points, options).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
