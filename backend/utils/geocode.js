const NodeGeocoder = require("node-geocoder");

const provider = process.env.GEOCODER_PROVIDER || "openstreetmap"; // "google" | "mapbox" | "openstreetmap"
const apiKey =
  process.env.GEOCODER_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.MAPBOX_TOKEN;

const geocoder = NodeGeocoder({
  provider,
  apiKey, // não é necessário para openstreetmap
  formatter: null,
  // user-agent recomendado para OSM
  httpAdapter: "https",
});

async function geocodeAddress(address) {
  if (!address) return null;
  const res = await geocoder.geocode(address);
  if (!res || !res.length) return null;
  const { latitude, longitude } = res[0];
  if (typeof latitude !== "number" || typeof longitude !== "number")
    return null;
  return { lat: latitude, lng: longitude };
}

module.exports = { geocodeAddress };
