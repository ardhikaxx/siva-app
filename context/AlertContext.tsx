"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "confirm";

interface AlertOptions {
  title: string;
  text: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  confirm: (options: Omit<AlertOptions, "type">) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => setAlert(options);
  
  const confirm = (options: Omit<AlertOptions, "type">) => {
    setAlert({ ...options, type: "confirm" });
  };

  const closeAlert = () => setAlert(null);

  const handleConfirm = () => {
    if (alert?.onConfirm) alert.onConfirm();
    closeAlert();
  };

  const handleCancel = () => {
    if (alert?.onCancel) alert.onCancel();
    closeAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, confirm }}>
      {children}
      <AnimatePresence>
        {alert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={alert.type === "confirm" ? handleCancel : closeAlert}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {alert.type === "success" && <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div>}
                  {alert.type === "error" && <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center"><AlertCircle size={32} /></div>}
                  {alert.type === "warning" && <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center"><AlertTriangle size={32} /></div>}
                  {alert.type === "confirm" && <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center"><AlertCircle size={32} /></div>}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{alert.text}</p>
                
                <div className="flex gap-3 w-full">
                  {alert.type === "confirm" ? (
                    <>
                      <button 
                        onClick={handleCancel}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                      >
                        {alert.cancelText || "Batal"}
                      </button>
                      <button 
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
                      >
                        {alert.confirmText || "Ya"}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={closeAlert}
                      className={`w-full py-3 font-semibold rounded-xl transition-colors text-white ${
                        alert.type === "success" ? "bg-green-500 hover:bg-green-600" :
                        alert.type === "error" ? "bg-red-500 hover:bg-red-600" :
                        alert.type === "warning" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-brand-500"
                      }`}
                    >
                      Oke, Mengerti
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider");
  return context;
}
