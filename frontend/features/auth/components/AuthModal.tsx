// Modal wrapper for login and registration forms.
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useAuthStore } from "@/store/auth-store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const user = useAuthStore(useShallow((state) => state.user));
  const isAuthenticated = !!user;

  // Close modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-modal-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] min-h-[500px] flex flex-col animate-modal-slide-up z-10"
        onClick={(e) => {
          // Prevent closing when clicking inside the modal
          e.stopPropagation();
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
          {/* Mobile Tab Headers */}
          <div className="flex md:hidden border-b border-gray-200 bg-gray-50 shrink-0">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "login"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "register"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Desktop Tab Headers */}
          <div className="hidden md:flex absolute top-0 left-0 right-0 border-b border-gray-200 bg-white shrink-0">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "login"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "register"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Login Section */}
          <div
            className={`flex-1 flex flex-col justify-center p-6 md:p-8 lg:p-10 pt-14 md:pt-12 ${
              activeTab === "login" ? "flex" : "hidden md:flex"
            }`}
          >
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                LOGIN
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mb-6">
                Sign in to your account to continue shopping
              </p>
              <LoginForm onSuccess={onClose} />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200 shrink-0 my-4" />

          {/* Register Section */}
          <div
            className={`flex-1 flex flex-col justify-center p-6 md:p-8 lg:p-10 pt-14 md:pt-12 ${
              activeTab === "register" ? "flex" : "hidden md:flex"
            }`}
          >
            <div className="w-full max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                REGISTER
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mb-6">
                Create a new account to start shopping
              </p>
              <RegisterForm onSuccess={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

