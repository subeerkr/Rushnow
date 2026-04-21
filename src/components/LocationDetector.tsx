"use client";
import { useState, useEffect } from "react";

type ReverseGeocodeItem = {
  latitude?: number;
  longitude?: number;
  label?: string;
  name?: string;
  locality?: string;
  city?: string;
  region?: string;
  country?: string;
};

export default function LocationDetector({ apiUrl }: { apiUrl?: string }) {
  const [location, setLocation] = useState<string>("Select location");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLocation = localStorage.getItem("deliveryLocation");
    if (savedLocation) {
      setLocation(savedLocation);
      setLoading(false);
      return;
    }

    // initialize with no geolocation call here — we'll request on demand
    setLoading(false);
  }, [apiUrl]);

  // helper to request current position (used by Enable button)
  const requestCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocation("Select location");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        // Save coords for tracking
        localStorage.setItem(
          "deliveryLocationCoords",
          JSON.stringify({ lat: latitude, lng: longitude }),
        );
        try {
          const customApi =
            apiUrl ||
            (process.env.NEXT_PUBLIC_REVERSE_GEOCODE_API as string | undefined);

          if (customApi) {
            const sep = customApi.includes("?") ? "&" : "?";
            const url = `${customApi}${sep}latitude=${latitude}&longitude=${longitude}`;
            const resp = await fetch(url);
            const body = await resp.json();
            const item: ReverseGeocodeItem | undefined = Array.isArray(
              body?.data,
            )
              ? body.data[0]
              : body?.data || body;
            const label =
              item?.label ||
              item?.name ||
              item?.city ||
              item?.locality ||
              item?.region ||
              item?.country ||
              `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            setLocation(label);
            localStorage.setItem("deliveryLocation", label);
            setLoading(false);
            return;
          }

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name ||
            `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocation(city);
          localStorage.setItem("deliveryLocation", city);
        } catch (err) {
          console.error("Reverse geocode error:", err);
          const fallback = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocation(fallback);
          localStorage.setItem("deliveryLocation", fallback);
        }
        setLoading(false);
      },
      error => {
        console.error("Geolocation error:", error);
        setLocation("Select location");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 7000 },
    );
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    localStorage.setItem("deliveryLocation", newLocation);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium border border-gray-200"
        title="Select delivery location"
      >
        <svg
          className="w-4 h-4 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">
          {loading ? "Detecting…" : location}
        </span>
        <svg
          className="w-3 h-3 ml-1 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Location Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold">Your Location</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-auto">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search a new address"
                    aria-label="Search address"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-pink-600">
                    Use My Current Location
                  </h4>
                  <p className="text-xs text-gray-500">
                    Enable your current location for better services
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => requestCurrentLocation()}
                    className="px-3 py-1.5 rounded-md border border-pink-200 text-pink-600 font-medium hover:bg-pink-50"
                  >
                    Enable
                  </button>
                </div>
              </div>

              <div className="w-full h-56 bg-[url('https://res.cloudinary.com/dehccrol4/image/upload/v1764603501/21-03-2024-1711018043_am0ctu.webp')] bg-center bg-contain bg-no-repeat rounded-lg opacity-90" />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const toSave = search.trim() || location;
                    localStorage.setItem("deliveryLocation", toSave);
                    setLocation(toSave);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
