import { createCodec, GAZA } from './codec';

/**
 * Shared Geo Codec instance for Zemam Fleet Tracking.
 * Uses Gaza/Palestine bounding box with 1.1m precision (scale 1e5).
 * Points outside the primary bounding box are encoded seamlessly using zigzag varints.
 */
const south = Number(process.env.NEXT_PUBLIC_GPS_ORIGIN_SOUTH) || GAZA.south;
const west = Number(process.env.NEXT_PUBLIC_GPS_ORIGIN_WEST) || GAZA.west;

export const zemamGeoCodec = createCodec({
  south,
  west,
  scale: 1e5,        // 1e-5° ≈ 1.1 m
  speedStep: 0.25,   // 0.25 m/s (~0.9 km/h) speed resolution
  heading: true,     // 1 byte heading (0-360°)
  profile: 1,        // Version profile
});

export default zemamGeoCodec;
