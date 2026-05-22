import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 99999, pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              backgroundColor: t.type === "error" ? "#c0392b" : t.type === "info" ? "#2d6a9f" : "#2e7d32",
              color: "white",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "Poppins, sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
