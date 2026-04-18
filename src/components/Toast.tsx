"use client";
import React from "react";
import { useToast } from "../context/ToastContext";

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-[320px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3 rounded-lg shadow-md border transition transform duration-200 ease-out ${
            t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 text-sm">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
