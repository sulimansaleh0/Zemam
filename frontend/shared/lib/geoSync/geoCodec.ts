import { createCodec, GAZA } from './codec';

/**
 * Shared Geo Codec instance for Zemam Fleet Tracking.
 * Uses Gaza/Palestine bounding box with 1.1m precision (scale 1e5).
 * Points outside the primary bounding box are encoded seamlessly using zigzag varints.
 */
export const zemamGeoCodec = createCodec({
  south: GAZA.south, // 31.2000
  west: GAZA.west,   // 34.2000
  scale: 1e5,        // 1e-5° ≈ 1.1 m
  speedStep: 0.25,   // 0.25 m/s (~0.9 km/h) speed resolution
  heading: true,     // 1 byte heading (0-360°)
  profile: 1,        // Version profile
});

export default zemamGeoCodec;
