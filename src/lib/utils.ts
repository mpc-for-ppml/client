import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a duration in seconds to a human-readable format
 * @param seconds - The duration in seconds
 * @param showDecimals - Whether to show decimal places for seconds when under 1 minute
 * @returns A formatted string (e.g., "1h 2m", "2m 15s", "45.5s")
 */
export function formatDuration(seconds: number, showDecimals: boolean = true): string {
  if (seconds < 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  
  // Only show seconds if duration is less than 1 hour
  if (hours === 0) {
    if (secs > 0 || parts.length === 0) {
      if (minutes === 0 && showDecimals) {
        // For durations under 1 minute, show decimal places
        parts.push(`${secs.toFixed(2)}s`);
      } else {
        // For durations under 1 hour but over 1 minute, use whole seconds
        parts.push(`${Math.floor(secs)}s`);
      }
    }
  }
  
  return parts.join(" ");
}
