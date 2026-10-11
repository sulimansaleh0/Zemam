const { createCodec, GAZA } = require("./codec");

const zemamGeoCodec = createCodec({
  south: GAZA.south, // 31.2000
  west: GAZA.west,   // 34.2000
  scale: 1e5,        // 1e-5° ≈ 1.1 m
  speedStep: 0.25,   // 0.25 m/s (~0.9 km/h) speed resolution
  heading: true,     // 1 byte heading (0-360°)
  profile: 1,        // Version profile
});

module.exports = {
  zemamGeoCodec
};
