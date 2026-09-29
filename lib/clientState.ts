import { useState, useEffect } from "react";
import {
  User,
  EventItem,
  Registration,
  AttendanceRecord,
  EvaluationForm,
  EvaluationResponse,
  AuditLog,
  SystemNotification,
} from "./types";
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_EVALUATIONS,
  INITIAL_EVALUATION_RESPONSES,
  INITIAL_AUDIT_LOGS,
} from "./store";

export const LOCAL_STORAGE_KEY = "PROOFLY_STATE_V1";

export interface AppState {
  currentUser: User;
  events: EventItem[];
  registrations: Registration[];
  attendance: AttendanceRecord[];
  evaluations: EvaluationForm[];
  evaluationResponses: EvaluationResponse[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
}

export function getInitialState(): AppState {
  return {
    currentUser: INITIAL_USERS[0], // Default Juan Dela Cruz
    events: INITIAL_EVENTS,
    registrations: INITIAL_REGISTRATIONS,
    attendance: INITIAL_ATTENDANCE,
    evaluations: INITIAL_EVALUATIONS,
    evaluationResponses: INITIAL_EVALUATION_RESPONSES,
    auditLogs: INITIAL_AUDIT_LOGS,
    notifications: [
      {
        id: "NOTIF-1",
        userId: "USR-STU-001",
        title: "QR Code Ready",
        message: "Your attendance QR for LITS AI Build 2026 is generated and ready to present.",
        type: "success",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ],
  };
}
