// Simple Socket.IO demo server to drive order status + live tracking
// Run separately with: `node socket-server.js` or `npm run socket`
// and point NEXT_PUBLIC_SOCKET_URL to its URL (e.g. http://localhost:4000)

/* eslint-disable @typescript-eslint/no-var-requires */
const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Demo delivery agents (mirrors src/lib/delivery.ts in a simplified way)
const agents = [
  {
    id: "agent_1",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicle: "Bike",
    vehicleNumber: "DL 3S AB 1234",
    lat: 28.6145,
    lng: 77.215,
  },
  {
    id: "agent_2",
    name: "Mohan Sharma",
    phone: "+91 98765 67890",
    vehicle: "Scooter",
    vehicleNumber: "DL 8C CD 5678",
    lat: 28.62,
    lng: 77.225,
  },
];

function distanceKm(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function pickNearestAgent(customerLat, customerLng) {
  let best = null;
  let bestDist = Infinity;
  for (const a of agents) {
    const d = distanceKm(
      { lat: customerLat, lng: customerLng },
      { lat: a.lat, lng: a.lng }
    );
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}

io.on("connection", (socket) => {
  console.log("Socket client connected:", socket.id);

  let locationInterval = null;
  const timeouts = [];

  socket.on("order:start", (payload) => {
    const customerLat = payload?.lat ?? 28.6139;
    const customerLng = payload?.lng ?? 77.209;

    console.log("Order start from client", socket.id, payload);

    // Immediately: PACKING
    socket.emit("status", {
      status: "PACKING",
      etaMinutes: 5,
    });

    // After 5s: ASSIGNING
    const t1 = setTimeout(() => {
      const agent = pickNearestAgent(customerLat, customerLng);
      socket.emit("status", {
        status: "ASSIGNING",
        etaMinutes: 5,
      });
      if (agent) {
        socket.emit("agentAssigned", { agent });
      }
    }, 5000);
    timeouts.push(t1);

    // After another 5s: OUT_FOR_DELIVERY
    const t2 = setTimeout(() => {
      socket.emit("status", {
        status: "OUT_FOR_DELIVERY",
        etaMinutes: 2, // 2 mins total movement time
      });

      const agent = pickNearestAgent(customerLat, customerLng);
      if (!agent) return;

      const path = [];
      const steps = 120; // 120 steps as requested in user logic
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        path.push({
          lat: agent.lat + (customerLat - agent.lat) * ratio,
          lng: agent.lng + (customerLng - agent.lng) * ratio,
          progress: Math.round(ratio * 100),
        });
      }

      let step = 0;
      locationInterval = setInterval(() => {
        if (step >= path.length) {
          clearInterval(locationInterval);
          locationInterval = null;
          
          socket.emit("status", {
            status: "ARRIVING",
            etaMinutes: 5,
          });

          // After 5s: DELIVERED
          const t3 = setTimeout(() => {
            socket.emit("status", {
              status: "DELIVERED",
              etaMinutes: 0,
            });
          }, 5000);
          timeouts.push(t3);
          return;
        }
        const point = path[step++];
        socket.emit("location", point);
        socket.emit("progress", { value: point.progress });
      }, 1000); // 1 step per second
    }, 10000);
    timeouts.push(t2);
  });

  socket.on("disconnect", () => {
    console.log("Socket client disconnected:", socket.id);
    if (locationInterval) clearInterval(locationInterval);
    timeouts.forEach(clearTimeout);
  });
});

console.log("Socket.IO server listening on http://localhost:4000");


