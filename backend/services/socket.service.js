const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { mainStatus } = require("../data/status");
const { processTelemetryUpdate } = require("./gpsIngestion.service");
const { allowedOrigins } = require("../data");
const { zemamGeoCodec } = require("../utils/geoSync");

let io = null;

function socketAuthError(code, message) {
    const error = new Error(message);
    error.data = { code };
    return error;
}

/**
 * Initialize Socket.io on the HTTP server
 */
function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                return callback(null, true); // Permissive in dev/local
            },
            credentials: true
        },
        transports: ["websocket", "polling"],
        pingInterval: 10000,
        pingTimeout: 5000
    });

    // Authentication Middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.ticket;
            if (!token) {
                return next(socketAuthError("AUTH_REQUIRED", "Authentication token is required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (token && decoded.purpose !== "socket") {
                return next(socketAuthError("INVALID_TOKEN", "Invalid socket authentication ticket"));
            }
            const user = await User.findById(decoded._id);

            if (!user) {
                return next(socketAuthError("USER_NOT_FOUND", "User not found"));
            }

            if (user.isDeleted || user.status !== mainStatus.ACTIVE) {
                return next(socketAuthError("USER_INACTIVE", "User is not active"));
            }

            socket.user = user;
            return next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return next(socketAuthError("TOKEN_EXPIRED", "Access token expired"));
            }

            if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
                return next(socketAuthError("INVALID_TOKEN", "Invalid access token"));
            }

            return next(socketAuthError("AUTH_FAILED", "Unable to authenticate socket"));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;
        // Handle joining scoped fleet tracking room
        socket.on("fleet:join", () => {
            const companyId = user.companyId;
            const teamId = user.teamId;
            const role = user.role;
            if (role === userRoles.ADMIN) {
                socket.join(`company_${companyId}`);
            } else if (role === userRoles.FLEET_MANAGER) {
                if (teamId) {
                    const room = `team_${teamId}`;
                    socket.join(room);
                }
            } else if (role === userRoles.DRIVER || role === "driver") {
                // عزل أمني وتشغيلي: السائق ينضم حصراً لغرفته الفردية لتجنب استنزاف باقته وبطاريته ببث باقي الأسطول
                socket.join(`driver_${user._id}`);
            }
        });

        // Handle leaving rooms
        socket.on("fleet:leave", () => {
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }
        });

        // Handle driver location update (PWA telemetry pulse - supports both binary and JSON)
        const handleLocationPayload = async (payload, acknowledge) => {
            const respond = (result) => {
                if (typeof acknowledge === "function") acknowledge(result);
            };
            try {
                if (user.role !== userRoles.DRIVER || !payload) {
                    respond({ ok: false, message: "A driver is required" });
                    return;
                }

                let { lat, lng, speed, heading, accuracy, timestamp } = payload;
                
                // Decode compact binary GPS pulse if present
                if (payload.bin) {
                    const binData = Buffer.isBuffer(payload.bin)
                        ? new Uint8Array(payload.bin)
                        : (payload.bin instanceof Uint8Array ? payload.bin : new Uint8Array(payload.bin));
                    const decoded = zemamGeoCodec.decodePoint(binData);
                    lat = decoded.lat;
                    lng = decoded.lon;
                    if (decoded.speed != null) speed = decoded.speed;
                    if (decoded.heading != null) heading = decoded.heading;
                    timestamp = Date.now() - (decoded.ageSec || 0) * 1000;

                    // ── طباعة النقاط على السيرفر قبل وبعد فك التشفير ──
                    console.log(`\n================== [GPS BINARY PULSE DECODING] ==================`);
                    console.log(`🔒 Before decryption (binary data received from the driver's phone):`);
                    console.log(`   - Packet size: ${binData.length} bytes only`);
                    console.log(`   - Hex representation: ${Buffer.from(binData).toString('hex')}`);
                    console.log(`   - Byte array (Bytes): [${Array.from(binData).join(', ')}]`);
                    console.log(`🔓 After decryption (actual coordinates extracted on the server):`);
                    console.log(`   - Latitude: ${lat}`);
                    console.log(`   - Longitude: ${lng}`);
                    console.log(`   - Speed: ${speed != null ? `${speed} km/h` : '0 km/h'}`);
                    console.log(`   - Heading angle: ${heading != null ? `${heading}°` : '0°'}`);
                    console.log(`=================================================================\n`);
                } else {
                    console.log(`\n[GPS JSON TELEMETRY] Received JSON coordinates: Lat=${lat}, Lng=${lng}, Speed=${speed}`);
                }

                const companyId = user.companyId;
                const teamId = user.teamId;
                const driverId = user._id;

                const result = await processTelemetryUpdate({
                    driverId,
                    companyId,
                    teamId,
                    lat,
                    lng,
                    speed,
                    heading,
                    accuracy,
                    timestamp: timestamp || Date.now()
                });
                console.log(`[GPS TELEMETRY] Using vehicle ${result.telemetry.vehicleId} and active task ${result.telemetry.activeTaskId}`);

                // Broadcast location update to relevant rooms
                io.to(`company_${companyId}`).emit("vehicle:location_changed", result.telemetry);

                if (teamId) {
                    io.to(`team_${teamId}`).emit("vehicle:location_changed", result.telemetry);
                }
                respond({ ok: true });
            } catch (err) {
                console.error("❌ [Socket] Error processing driver location update:", err.message);
                respond({ ok: false, message: err.message });
            }
        };

        socket.on("driver:location_update", handleLocationPayload);
        socket.on("driver:location_bin", handleLocationPayload);

        socket.on("disconnect", (reason) => {
            console.log(`🔴 [Socket] Client disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
}

/**
 * Broadcast trip completion event to company and team rooms
 */
function notifyTripCompleted(companyId, teamId, tripSummary) {
    if (!io) return;
    if (companyId) {
        io.to(`company_${companyId}`).emit("trip:completed", tripSummary);
    }
    if (teamId) {
        io.to(`team_${teamId}`).emit("trip:completed", tripSummary);
    }
}

/**
 * Get active Socket.io instance
 */
function getIO() {
    if (!io) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return io;
}

module.exports = {
    initSocket,
    getIO,
    notifyTripCompleted
};
