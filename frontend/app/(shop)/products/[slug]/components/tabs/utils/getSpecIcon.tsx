/**
 * getSpecIcon Utility
 *
 * Returns appropriate icon for product specification labels.
 */

import {
  Monitor,
  Cpu,
  Database,
  Battery,
  Weight,
  Maximize2,
  Zap,
  Package,
} from "lucide-react";

/**
 * Get icon for spec label based on keyword matching
 */
export function getSpecIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("screen") || l.includes("display"))
    return <Monitor className="h-4 w-4" />;
  if (l.includes("processor") || l.includes("cpu") || l.includes("chip"))
    return <Cpu className="h-4 w-4" />;
  if (l.includes("storage") || l.includes("ssd") || l.includes("memory"))
    return <Database className="h-4 w-4" />;
  if (l.includes("battery") || l.includes("power"))
    return <Battery className="h-4 w-4" />;
  if (l.includes("weight") || l.includes("mass"))
    return <Weight className="h-4 w-4" />;
  if (l.includes("dimension") || l.includes("size") || l.includes("width"))
    return <Maximize2 className="h-4 w-4" />;
  if (l.includes("performance") || l.includes("speed"))
    return <Zap className="h-4 w-4" />;
  return <Package className="h-4 w-4" />;
}
