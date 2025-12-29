// Secure Checkout Badge - Elegant plain design with website ambiance
import { Shield, Lock, CreditCard } from "lucide-react";

export function SecureCheckoutBadge() {
  return (
    <div className="group relative bg-linear-to-br from-warm-gray-50/80 via-white/90 to-primary-50/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-warm-gray-200/60 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500 overflow-hidden w-full max-w-md mx-auto">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-50/20 via-transparent to-primary-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      {/* Content - Horizontal Layout */}
      <div className="relative flex items-center gap-4">
        {/* Icon Section */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 bg-linear-to-br from-primary-100 via-primary-50 to-primary-100 rounded-lg shadow-md border border-primary-200/40 flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-500">
            <Shield className="h-5 w-5 text-primary-600" />
          </div>
          {/* Subtle shine */}
          <div className="absolute inset-0 rounded-lg bg-linear-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-warm-gray-900 group-hover:text-primary-700 transition-colors duration-300 mb-1">
            Secure Checkout
          </h3>

          <p className="text-xs text-warm-gray-600 leading-tight mb-2">
            Protected payments with bank-level security and SSL encryption
          </p>

          {/* Security indicators - horizontal layout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-warm-gray-500 group-hover:text-warm-gray-700 transition-colors duration-300">
              <Lock className="h-3 w-3 text-success" />
              <span className="font-medium">SSL</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-warm-gray-500 group-hover:text-warm-gray-700 transition-colors duration-300">
              <CreditCard className="h-3 w-3 text-primary-500" />
              <span className="font-medium">All Cards</span>
            </div>
          </div>
        </div>

        {/* Elegant accent line */}
        <div className="w-0.5 h-8 bg-linear-to-b from-primary-300 via-primary-400 to-primary-300 rounded-full opacity-70 group-hover:opacity-100 group-hover:h-10 transition-all duration-500" />
      </div>
    </div>
  );
}
