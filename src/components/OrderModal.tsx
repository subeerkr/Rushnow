"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import OrderMap from "./OrderMap";
import { DeliveryAgent } from "../lib/delivery";
import { getSocket } from "../lib/socketClient";
import { useSession } from "next-auth/react";

type PaymentMethod = "card" | "upi" | "cod";

export default function OrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const { items, subtotal, deliveryFee, grandTotal, clear } = useCart();
  const [payMethod, setPayMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [orderTime, setOrderTime] = useState<number | null>(null);
  const [estimatedMins, setEstimatedMins] = useState(10);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryAgent | null>(
    null,
  );
  const [customerCoords, setCustomerCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [agentPosition, setAgentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const socket = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return getSocket();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setPayMethod(null);
      setProcessing(false);
      setOrderPlaced(false);
      setStatus(null);
      setOrderTime(null);
      setEstimatedMins(10);
      setDeliveryPartner(null);
      setCustomerCoords(null);
      setAgentPosition(null);
    }
  }, [open]);

  // Try to read stored delivery location coordinates if saved by LocationDetector
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("deliveryLocationCoords");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.lat === "number" &&
          typeof parsed.lng === "number"
        ) {
          setCustomerCoords({ lat: parsed.lat, lng: parsed.lng });
          return;
        }
      }
    } catch {
      // ignore parsing errors
    }
  }, [open]);

  // Subscribe to Socket.IO events for this modal session
  useEffect(() => {
    if (!open || !socket) return;

    const handleStatus = (payload: {
      status?: string;
      etaMinutes?: number;
    }) => {
      if (payload.status) setStatus(payload.status);
      if (typeof payload.etaMinutes === "number") {
        setEstimatedMins(payload.etaMinutes);
      }
    };

    const handleAgentAssigned = (payload: { agent: DeliveryAgent }) => {
      if (payload?.agent) setDeliveryPartner(payload.agent);
    };

    const handleLocation = (payload: { lat: number; lng: number }) => {
      if (
        typeof payload?.lat === "number" &&
        typeof payload?.lng === "number"
      ) {
        setAgentPosition({ lat: payload.lat, lng: payload.lng });
      }
    };

    socket.on("status", handleStatus);
    socket.on("agentAssigned", handleAgentAssigned);
    socket.on("location", handleLocation);

    return () => {
      socket.off("status", handleStatus);
      socket.off("agentAssigned", handleAgentAssigned);
      socket.off("location", handleLocation);
    };
  }, [open, socket]);

  const storePurchase = async (method: string) => {
    try {
      await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: grandTotal,
          paymentMethod: method,
          shippingAddress: "Default Address", // You could add a field for this
        }),
      });
    } catch (err) {
      console.error("Failed to store purchase:", err);
    }
  };

  const handlePay = async () => {
    if (!payMethod) return;
    setProcessing(true);
    // simulate short payment processing delay
    await new Promise(r => setTimeout(r, 1200));
    setProcessing(false);

    // Store in MongoDB
    await storePurchase(payMethod);

    // mark order placed immediately
    const now = Date.now();
    setOrderPlaced(true);
    setStatus("Your order will be delivered soon");
    setOrderTime(now);

    // clear cart
    clear();

    // Kick off real-time order flow on the Socket.IO server
    const coords = customerCoords ?? { lat: 28.6139, lng: 77.209 };
    socket?.emit("order:start", { lat: coords.lat, lng: coords.lng });
  };

  const handleCOD = async () => {
    setPayMethod("cod");

    // Store in MongoDB
    await storePurchase("cod");

    // For COD, treat as placed immediately
    setOrderPlaced(true);
    setStatus("Your order will be delivered soon");
    setOrderTime(Date.now());
    clear();

    const coords = customerCoords ?? { lat: 28.6139, lng: 77.209 };
    socket?.emit("order:start", { lat: coords.lat, lng: coords.lng });
  };

  const billItems = useMemo(
    () =>
      items.map((i, idx) => ({
        id: String((i as any).id ?? idx),
        name: String((i as any).name ?? "Item"),
        qty: i.quantity,
        price: Number((i as any).price ?? 0),
      })),
    [items],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Checkout</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!orderPlaced ? (
            <>
              <div>
                <h4 className="font-medium">Order Summary</h4>
                <ul className="text-sm mt-2 space-y-1 max-h-40 overflow-auto">
                  {billItems.map(b => (
                    <li key={b.id} className="flex justify-between">
                      <span>
                        {b.name} × {b.qty}
                      </span>
                      <span>₹{(b.price * b.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-3 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold mt-2">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium">Choose Payment Method</h4>
                {(session?.user as any)?.role === "admin" ? (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      Admins are not allowed to make purchases. Please use a
                      regular customer account for shopping.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => setPayMethod("card")}
                        className={`px-3 py-2 rounded border ${
                          payMethod === "card"
                            ? "border-brand bg-brand/10"
                            : "border-gray-200"
                        }`}
                      >
                        Card
                      </button>
                      <button
                        onClick={() => setPayMethod("upi")}
                        className={`px-3 py-2 rounded border ${
                          payMethod === "upi"
                            ? "border-brand bg-brand/10"
                            : "border-gray-200"
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        onClick={handleCOD}
                        className="px-3 py-2 rounded border border-gray-200"
                      >
                        Cash on Delivery
                      </button>
                    </div>
                    {payMethod && payMethod !== "cod" && (
                      <div className="mt-4">
                        <button
                          onClick={handlePay}
                          disabled={processing}
                          className="px-4 py-2 bg-brand text-white rounded"
                        >
                          {processing
                            ? "Processing..."
                            : `Pay ₹${grandTotal.toFixed(2)}`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* ETA Header */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Arriving in</p>
                <p className="text-6xl font-bold text-purple-600">
                  {estimatedMins} mins
                </p>
              </div>

              {/* Status Card */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {status}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Order placed at{" "}
                      {orderTime
                        ? new Date(orderTime).toLocaleTimeString()
                        : "-"}
                    </p>
                    {status === "Order is getting packed" && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        ⚠️ Expecting delay due to high demand
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delay Message Bubble */}
              {status === "Order is getting packed" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <p className="text-sm text-gray-700">
                      I might be delayed due to high order volume
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery Partner Info */}
              {deliveryPartner && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {deliveryPartner.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-lg">
                        {deliveryPartner.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deliveryPartner.vehicle} •{" "}
                        {deliveryPartner.vehicleNumber}
                      </p>
                    </div>
                    <a
                      href={`tel:${deliveryPartner.phone}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      📞 Call
                    </a>
                  </div>
                </div>
              )}

              {/* Show map when out for delivery */}
              {status === "Out for delivery" && (
                <div className="mt-4 w-full h-64">
                  <OrderMap
                    pickup={
                      deliveryPartner
                        ? { lat: deliveryPartner.lat, lng: deliveryPartner.lng }
                        : undefined
                    }
                    drop={
                      customerCoords
                        ? { lat: customerCoords.lat, lng: customerCoords.lng }
                        : undefined
                    }
                    livePosition={
                      agentPosition
                        ? { lat: agentPosition.lat, lng: agentPosition.lng }
                        : deliveryPartner
                          ? {
                              lat: deliveryPartner.lat,
                              lng: deliveryPartner.lng,
                            }
                          : null
                    }
                  />
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
