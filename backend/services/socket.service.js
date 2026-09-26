const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { userRoles } = require("../data/roles");
const { mainStatus } = require("../data/status");
const { processTelemetryUpdate } = require("./gpsIngestion.service");

let io = null;

/**
 * Extracts JWT token from cookie string or auth payload
 */
function extractToken(socket) {
    if (socket.handshake.auth && socket.handshake.auth.token) {
        return socket.handshake.auth.token;
    }
    if (socket.handshake.headers?.authorization?.startsWith("Bearer ")) {
        return socket.handshake.headers.authorization.split(" ")[1];
    }
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
        const cookies = cookieHeader.split(";").map((c) => c.trim());
        for (const cookie of cookies) {
            if (cookie.startsWith("token=")) {
                return cookie.substring("token=".length);
            }
        }
    }
    return null;
}

/**
 * Initialize Socket.io on the HTTP server
 */
function initSocket(server) {
    const allowedOrigins = [
        "http://localhost:3000",
        process.env.CLIENT_URL,
    ].filter(Boolean);

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
            const token = extractToken(socket);
            if (!token) {
                // If token is missing, we still allow connection if in development, but tag socket as unauthenticated
                socket.user = null;
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findById(decoded._id);
            if (!user || user.status !== mainStatus.ACTIVE) {
                socket.user = null;
                return next();
            }

            socket.user = user;
            return next();
        } catch (err) {
            console.warn("⚠️ [Socket Auth] Token verification warning:", err.message);
            socket.user = null;
            return next();
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;
        // console.log(`🟢 [Socket] Client connected: ${socket.id} (User: ${user ? user.email : "guest"})`);

        // Handle joining scoped fleet tracking room
        socket.on("fleet:join", (data) => {
            const companyId = (user && user.companyId) ? user.companyId.toString() : data?.companyId;
            const teamId = (user && user.teamId) ? user.teamId.toString() : data?.teamId;
            const role = (user && user.role) ? user.role : (data?.role || "admin");

            if (role === userRoles.ADMIN || role === "super_admin") {
                if (companyId) {
                    const room = `company_${companyId}`;
                    socket.join(room);
                    // console.log(`[Socket] Joined room ${room} for admin ${socket.id}`);
                }
            } else if (role === userRoles.FLEET_MANAGER || role === "fleet_manager") {
                if (teamId) {
                    const room = `team_${teamId}`;
                    socket.join(room);
                    // console.log(`[Socket] Joined room ${room} for manager ${socket.id}`);
                }
            } else if (role === userRoles.DRIVER || role === "driver") {
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
        socket.on("driver:location_update", async (payload) => {
            try {
                if (!payload || !payload.vehicleId) {
                    return;
                }

                const companyId = user?.companyId || payload.companyId;
                const teamId = user?.teamId || payload.teamId;
                const driverId = user?._id || payload.driverId;

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
                if (companyId) {
                    io.to(`company_${companyId}`).emit("vehicle:location_changed", result.telemetry);
                }
                if (teamId) {
                    io.to(`team_${teamId}`).emit("vehicle:location_changed", result.telemetry);
                }
            } catch (err) {
                console.error("❌ [Socket] Error processing driver location update:", err.message);
            }
        });

        socket.on("disconnect", (reason) => {
            // console.log(`🔴 [Socket] Client disconnected: ${socket.id} (${reason})`);
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
