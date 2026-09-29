import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateToken(prefix: string = "TKN"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i !== 15) result += "-";
  }
  return `${prefix}-${result}`;
}

export function generateRegId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REG-2026-${num}`;
}

export function formatDate(dateString: string): string {
  try {
    if (!dateString) return "";
    const raw = dateString.split("T")[0];
    const parts = raw.split("-").map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${monthNames[parts[1] - 1]} ${parts[2]}, ${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatTime(timeOrIso: string): string {
  try {
    if (!timeOrIso) return "";
    if (timeOrIso.includes("T")) {
      const timePart = timeOrIso.split("T")[1]?.replace("Z", "").split(".")[0];
      if (timePart) {
        const [h, m, s] = timePart.split(":");
        const hour = parseInt(h, 10);
        if (!isNaN(hour)) {
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${m || "00"}${s ? `:${s}` : ""} ${ampm}`;
        }
      }
    }
    // "13:30" format
    const [h, m] = timeOrIso.split(":");
    const hour = parseInt(h, 10);
    if (!isNaN(hour)) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${m || "00"} ${ampm}`;
    }
    return timeOrIso;
  } catch {
    return timeOrIso;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    if (!isoString) return "";
    const datePart = formatDate(isoString);
    const timePart = formatTime(isoString);
    return `${datePart} • ${timePart}`;
  } catch {
    return isoString;
  }
}

/**
 * Validates a photo timestamp against the event attendance window and QR check-in time.
 */
export function validatePhotoTimestamp(
  photoTimeIso: string,
  attendanceOpenTime: string,
  attendanceCloseTime: string,
  checkInIso?: string
): { isValid: boolean; flags: string[]; notes: string } {
  const flags: string[] = [];
  const photoDate = new Date(photoTimeIso);

  if (isNaN(photoDate.getTime())) {
    return {
      isValid: false,
      flags: ["MALFORMED_TIMESTAMP"],
      notes: "Photo timestamp could not be parsed as a valid date/time.",
    };
  }

  // Parse attendance window
  let windowStart: Date;
  let windowEnd: Date;

  if (attendanceOpenTime.includes("T")) {
    windowStart = new Date(attendanceOpenTime);
  } else {
    // Relative to photo date
    const [h, m] = attendanceOpenTime.split(":").map(Number);
    windowStart = new Date(photoDate);
    windowStart.setHours(h || 0, m || 0, 0, 0);
  }

  if (attendanceCloseTime.includes("T")) {
    windowEnd = new Date(attendanceCloseTime);
  } else {
    const [h, m] = attendanceCloseTime.split(":").map(Number);
    windowEnd = new Date(photoDate);
    windowEnd.setHours(h || 23, m || 59, 59, 999);
  }

  // 15-minute buffer allowance for pre-event queue or post-event closing
  const bufferMs = 15 * 60 * 1000;
  const earlyLimit = new Date(windowStart.getTime() - bufferMs);
  const lateLimit = new Date(windowEnd.getTime() + bufferMs);

  if (photoDate < earlyLimit) {
    flags.push("BEFORE_ATTENDANCE_WINDOW");
  } else if (photoDate > lateLimit) {
    flags.push("AFTER_ATTENDANCE_WINDOW");
  }

  // Check against QR check-in time
  if (checkInIso) {
    const checkInDate = new Date(checkInIso);
    if (!isNaN(checkInDate.getTime())) {
      // If photo was allegedly taken > 10 minutes BEFORE QR scan, flag it for officer review
      const diffMin = (checkInDate.getTime() - photoDate.getTime()) / (1000 * 60);
      if (diffMin > 10) {
        flags.push("TAKEN_BEFORE_QR_SCAN");
      }
    }
  }

  const isValid = flags.length === 0;
  let notes = isValid
    ? "Photo timestamp is within the official event attendance window."
    : flags
        .map((f) => {
          if (f === "BEFORE_ATTENDANCE_WINDOW") return "Photo taken before attendance opened.";
          if (f === "AFTER_ATTENDANCE_WINDOW") return "Photo taken after attendance closed.";
          if (f === "TAKEN_BEFORE_QR_SCAN") return "Photo timestamp precedes QR check-in by >10 mins.";
          return f;
        })
        .join(" ");

  return { isValid, flags, notes };
}
