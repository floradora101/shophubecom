// Background gradients utility for consistent gradient usage
export const gradients = {
  // Primary brand gradient
  primary: "bg-gradient-to-r from-primary-500 to-primary-600",

  // Warm gradients
  warm: "bg-gradient-to-br from-cream-100 to-warm-gray-100",

  // Cool gradients
  cool: "bg-gradient-to-br from-blue-50 to-indigo-50",

  // Accent gradients
  accent: "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600",

  // Text gradients (use with text-transparent bg-clip-text)
  textPrimary: "bg-gradient-to-r from-primary-600 to-primary-700",

  // Card gradients
  cardWarm: "bg-gradient-to-br from-white to-cream-50",

  // Button gradients
  buttonPrimary:
    "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",

  // Discount badge gradient
  discount: "bg-gradient-to-br from-red-500 to-red-600",
} as const;

export type GradientType = keyof typeof gradients;

// Helper function to get gradient class
export const getGradientClass = (type: GradientType) => gradients[type];

