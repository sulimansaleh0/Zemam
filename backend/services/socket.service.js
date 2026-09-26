const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { mainStatus } = require("../data/status");
const { processTelemetryUpdate } = require("./gpsIngestion.service");
const { allowedOrigins } = require("../data");

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
        transports: ["websocket", "polling"]
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
        console.log(`🟢 [Socket] Client connected: ${socket.id} (User: ${user ? user.email : "guest"})`);
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
            } else if (role === userRoles.DRIVER) {
                if (companyId) {
                    socket.join(`company_${companyId}`);
                }
                if (teamId) {
                    socket.join(`team_${teamId}`);
                }
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

        // Handle driver location update (PWA telemetry pulse)
        socket.on("driver:location_update", async (payload, acknowledge) => {
            const respond = (result) => {
                if (typeof acknowledge === "function") acknowledge(result);
            };
            try {
                if (user.role !== userRoles.DRIVER || !payload || !payload.vehicleId) {
                    respond({ ok: false, message: "A driver and vehicle are required" });
                    return;
                }

                const companyId = user.companyId;
                const teamId = user.teamId;
                const driverId = user._id;

                const result = await processTelemetryUpdate({
                    vehicleId: payload.vehicleId,
                    taskId: payload.taskId,
                    driverId,
                    companyId,
                    teamId,
                    lat: payload.lat,
                    lng: payload.lng,
                    speed: payload.speed,
                    heading: payload.heading,
                    accuracy: payload.accuracy,
                    timestamp: payload.timestamp
                });

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
        });

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
