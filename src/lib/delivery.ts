export type AgentStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  status: AgentStatus;
  // Simple lat/lng to simulate "nearest" lookup
  lat: number;
  lng: number;
}

// Demo agent pool – in a real app this would live in a database / location service
const agents: DeliveryAgent[] = [
  {
    id: "agent_1",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicle: "Bike",
    vehicleNumber: "DL 3S AB 1234",
    status: "AVAILABLE",
    lat: 28.6145,
    lng: 77.215,
  },
  {
    id: "agent_2",
    name: "Priya Sharma",
    phone: "+91 98765 67890",
    vehicle: "Scooter",
    vehicleNumber: "DL 8C CD 5678",
    status: "AVAILABLE",
    lat: 28.62,
    lng: 77.225,
  },
  {
    id: "agent_3",
    name: "Amit Verma",
    phone: "+91 98765 11223",
    vehicle: "Bike",
    vehicleNumber: "DL 5B EF 9012",
    status: "OFFLINE",
    lat: 28.61,
    lng: 77.205,
  },
];

// Haversine distance in km
function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
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

export function assignNearestAvailableAgent(
  customerLat: number,
  customerLng: number
): DeliveryAgent | null {
  const available = agents.filter((a) => a.status === "AVAILABLE");
  if (!available.length) return null;

  let best: DeliveryAgent | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const agent of available) {
    const d = distanceKm(
      { lat: customerLat, lng: customerLng },
      { lat: agent.lat, lng: agent.lng }
    );
    if (d < bestDist) {
      bestDist = d;
      best = agent;
    }
  }

  if (best) {
    best.status = "BUSY";
  }

  return best;
}


