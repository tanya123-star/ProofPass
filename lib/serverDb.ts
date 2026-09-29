import {
  EventItem,
  Registration,
  AttendanceRecord,
  EvaluationForm,
  EvaluationResponse,
  AuditLog,
  User,
  LitsUser,
  StudentRosterRecord,
  SystemNotification,
  Role,
} from "./types";
import {
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_EVALUATIONS,
  INITIAL_EVALUATION_RESPONSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_LITS_USERS,
  INITIAL_STUDENT_ROSTER,
  INITIAL_NOTIFICATIONS,
  BOOTSTRAP_ADMIN_EMAIL,
} from "./store";
import { validatePhotoTimestamp, generateRegId } from "./utils";

declare global {
  // eslint-disable-next-line no-var
  var __QUESTLOG_DB__: {
    users: User[];
    litsUsers: LitsUser[];
    studentRoster: StudentRosterRecord[];
    events: EventItem[];
    registrations: Registration[];
    attendance: AttendanceRecord[];
    evaluations: EvaluationForm[];
    evaluationResponses: EvaluationResponse[];
    auditLogs: AuditLog[];
    notifications: SystemNotification[];
  } | undefined;
}

if (!global.__QUESTLOG_DB__) {
  global.__QUESTLOG_DB__ = {
    users: [...INITIAL_USERS],
    litsUsers: [...INITIAL_LITS_USERS],
    studentRoster: [...INITIAL_STUDENT_ROSTER],
    events: [...INITIAL_EVENTS],
    registrations: [...INITIAL_REGISTRATIONS],
    attendance: [...INITIAL_ATTENDANCE],
    evaluations: [...INITIAL_EVALUATIONS],
    evaluationResponses: [...INITIAL_EVALUATION_RESPONSES],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    notifications: [...INITIAL_NOTIFICATIONS],
  };
}

const db = global.__QUESTLOG_DB__;

export const serverDb = {
  // --- AUTH & ROSTER RESOLUTION ---
  resolveUserByEmail: (email: string): User | null => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Bootstrap Admin or Admin
    if (cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      let admin = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!admin) {
        admin = {
          id: `USR-ADM-${Date.now()}`,
          name: "Tanya Fontanilla",
          email: cleanEmail,
          role: "ADMIN",
          isBootstrap: true,
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
        };
        db.users.push(admin);
      }
      return { ...admin, role: "ADMIN" };
    }

    // 2. Check LITS Authorization Table
    const litsAuth = db.litsUsers.find(
      (l) => l.email.toLowerCase() === cleanEmail && l.isActive
    );
    if (litsAuth) {
      let litsUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!litsUser) {
        litsUser = {
          id: `USR-LITS-${Date.now()}`,
          name: litsAuth.name,
          email: cleanEmail,
          role: "LITS",
          department: litsAuth.department,
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        };
        db.users.push(litsUser);
      }
      return { ...litsUser, role: "LITS" };
    }

    // 3. Check Student Roster Table
    const studentAuth = db.studentRoster.find(
      (s) => s.email.toLowerCase() === cleanEmail && s.isActive
    );
    if (studentAuth) {
      let stuUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!stuUser) {
        stuUser = {
          id: `USR-STU-${Date.now()}`,
          name: studentAuth.name,
          email: cleanEmail,
          role: "STUDENT",
          studentId: studentAuth.studentId,
          course: studentAuth.course,
          yearLevel: studentAuth.yearLevel,
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        };
        db.users.push(stuUser);
      }
      return { ...stuUser, role: "STUDENT" };
    }

    // 4. Student Domain Rule: Google authentication for students using @acdeducation.com
    if (cleanEmail.endsWith("@acdeducation.com")) {
      const localPart = cleanEmail.split("@")[0];
      const derivedName = localPart
        .split(/[._-]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentId = `2024-BSIT-${randomSuffix}`;

      const newRecord: StudentRosterRecord = {
        id: `ROSTER-${Date.now()}`,
        email: cleanEmail,
        studentId,
        name: derivedName || "ACD Student",
        course: "BSIT",
        yearLevel: "1st Year",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      db.studentRoster.push(newRecord);

      const stuUser: User = {
        id: `USR-STU-${Date.now()}`,
        name: derivedName || "ACD Student",
        email: cleanEmail,
        role: "STUDENT",
        studentId,
        course: "BSIT",
        yearLevel: "1st Year",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      };
      db.users.push(stuUser);

      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: cleanEmail,
        whoRole: "STUDENT",
        what: "GOOGLE_STUDENT_AUTH",
        when: new Date().toISOString(),
        target: cleanEmail,
        result: "SUCCESS",
        details: `Student authenticated via Google domain (@acdeducation.com): ${derivedName} (${studentId})`,
      });

      return stuUser;
    }

    // Check existing registered users
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Re-verify against LITS or Admin rules
      if (existing.role === "LITS") {
        const stillActive = db.litsUsers.find(
          (l) => l.email.toLowerCase() === cleanEmail && l.isActive
        );
        if (!stillActive) return null; // LITS access revoked!
      }
      return existing;
    }

    // Not in authorized database -> Unauthorized!
    return null;
  },

  getUsers: () => db.users,
  getUserById: (id: string) => db.users.find((u) => u.id === id),

  // --- LITS AUTHORIZATION MANAGEMENT (ADMIN ONLY) ---
  getLitsUsers: () => db.litsUsers,
  
  addLitsUser: (payload: {
    email: string;
    name: string;
    department: string;
    notes?: string;
    authorizedBy: string;
  }) => {
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = db.litsUsers.find((l) => l.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.isActive) {
        throw new Error("This Google account is already authorized as a LITS user.");
      }
      existing.isActive = true;
      existing.name = payload.name;
      existing.department = payload.department;
      existing.notes = payload.notes;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const newLits: LitsUser = {
      id: `LITS-${Date.now()}`,
      email: cleanEmail,
      name: payload.name,
      department: payload.department,
      notes: payload.notes,
      isActive: true,
      authorizedBy: payload.authorizedBy,
      authorizedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.litsUsers.push(newLits);

    // Update user profile if exists
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.role = "LITS";
      user.department = payload.department;
    }

    // Audit log
    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: payload.authorizedBy,
      whoRole: "ADMIN",
      what: "AUTHORIZE_LITS_USER",
      when: new Date().toISOString(),
      target: cleanEmail,
      result: "SUCCESS",
      details: `Authorized Google email ${cleanEmail} for LITS access (Department: ${payload.department})`,
    });

    return newLits;
  },

  deactivateLitsUser: (id: string, deauthorizedBy: string) => {
    const lits = db.litsUsers.find((l) => l.id === id);
    if (!lits) throw new Error("LITS user not found");

    lits.isActive = false;
    lits.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: deauthorizedBy,
      whoRole: "ADMIN",
      what: "DEACTIVATE_LITS_USER",
      when: new Date().toISOString(),
      target: lits.email,
      result: "SUCCESS",
      details: `Deactivated LITS user access for ${lits.email}`,
    });

    return lits;
  },

  // --- STUDENT ROSTER (ADMIN & STUDENT LOOKUP) ---
  getStudentRoster: () => db.studentRoster,

  addStudentToRoster: (payload: {
    email: string;
    studentId: string;
    name: string;
    course: string;
    yearLevel: string;
    authorizedBy: string;
  }) => {
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@acdeducation.com")) {
      throw new Error("Student email must end with official institutional Google domain (@acdeducation.com).");
    }

    const existing = db.studentRoster.find(
      (s) => s.email.toLowerCase() === cleanEmail || s.studentId === payload.studentId
    );
    if (existing) {
      throw new Error("Student with this email or Student ID already exists in roster.");
    }

    const newRecord: StudentRosterRecord = {
      id: `ROSTER-${Date.now()}`,
      email: cleanEmail,
      studentId: payload.studentId,
      name: payload.name,
      course: payload.course,
      yearLevel: payload.yearLevel,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.studentRoster.push(newRecord);

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: payload.authorizedBy,
      whoRole: "ADMIN",
      what: "ENROLL_STUDENT",
      when: new Date().toISOString(),
      target: `${payload.studentId} (${cleanEmail})`,
      result: "SUCCESS",
      details: `Enrolled student in roster: ${payload.name} (${payload.course})`,
    });

    return newRecord;
  },

  // --- EVENTS ---
  getEvents: () => db.events,
  getEventById: (id: string) => db.events.find((e) => e.id === id),
  saveEvent: (event: EventItem, officerEmail: string) => {
    const idx = db.events.findIndex((e) => e.id === event.id);
    if (idx >= 0) {
      db.events[idx] = { ...event, updatedAt: new Date().toISOString() };
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: officerEmail,
        whoRole: "LITS",
        what: "UPDATE_EVENT",
        when: new Date().toISOString(),
        target: event.id,
        result: "SUCCESS",
        details: `Updated event ${event.title}`,
      });
      return db.events[idx];
    } else {
      const newEvent: EventItem = {
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.events.unshift(newEvent);
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: officerEmail,
        whoRole: "LITS",
        what: "CREATE_EVENT",
        when: new Date().toISOString(),
        target: event.id,
        result: "SUCCESS",
        details: `Created new event ${event.title}`,
      });
      return newEvent;
    }
  },

  // --- REGISTRATIONS ---
  getRegistrations: (eventId?: string, studentEmail?: string) => {
    let result = db.registrations;
    if (eventId) {
      result = result.filter((r) => r.eventId === eventId);
    }
    if (studentEmail) {
      result = result.filter(
        (r) => r.studentEmail.toLowerCase() === studentEmail.toLowerCase()
      );
    }
    return result;
  },

  getRegistrationById: (id: string) => db.registrations.find((r) => r.id === id),

  registerStudentAtomic: (payload: {
    eventId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    course: string;
    yearLevel: string;
    contactNumber: string;
  }) => {
    const event = db.events.find((e) => e.id === payload.eventId);
    if (!event) throw new Error("Event not found");

    if (event.status !== "PUBLISHED" && event.status !== "ONGOING") {
      throw new Error("Registration is not available for this event.");
    }

    // Atomic Capacity Check
    if (event.currentParticipants >= event.maxParticipants) {
      throw new Error("Event capacity has been reached. No slots remaining.");
    }

    // Duplicate Check
    const existing = db.registrations.find(
      (r) =>
        r.eventId === payload.eventId &&
        (r.studentEmail.toLowerCase() === payload.studentEmail.toLowerCase() ||
          r.studentId === payload.studentId) &&
        r.status === "CONFIRMED"
    );
    if (existing) {
      throw new Error("Student is already registered for this event.");
    }

    const regId = generateRegId();
    // Opaque server-verifiable token with cryptographic-like entropy
    const randomHex = Math.random().toString(36).substring(2, 8);
    const qrToken = `QUESTLOG:REG:${regId}:${payload.eventId}:${randomHex}`;

    const newReg: Registration = {
      id: regId,
      eventId: payload.eventId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      studentEmail: payload.studentEmail,
      course: payload.course,
      yearLevel: payload.yearLevel,
      contactNumber: payload.contactNumber,
      qrToken,
      registeredAt: new Date().toISOString(),
      status: "CONFIRMED",
    };

    db.registrations.push(newReg);
    event.currentParticipants += 1;

    // Send notification
    db.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      userId: payload.studentId,
      userEmail: payload.studentEmail,
      title: "Registration Confirmed",
      message: `You are confirmed for ${event.title}. Your entrance QR token is ready.`,
      type: "success",
      timestamp: new Date().toISOString(),
      read: false,
      link: `/student/registrations/${regId}/qr`,
    });

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: payload.studentName,
      whoRole: "STUDENT",
      what: "REGISTER_EVENT",
      when: new Date().toISOString(),
      target: `${payload.eventId} / ${regId}`,
      result: "SUCCESS",
      details: `Student registered for ${event.title}`,
    });

    return newReg;
  },

  // --- ATTENDANCE ---
  getAttendance: (eventId?: string, studentEmail?: string) => {
    let result = db.attendance;
    if (eventId) {
      result = result.filter((a) => a.eventId === eventId);
    }
    if (studentEmail) {
      result = result.filter(
        (a) => a.studentEmail?.toLowerCase() === studentEmail.toLowerCase()
      );
    }
    return result;
  },

  getAttendanceById: (id: string) => db.attendance.find((a) => a.id === id),

  scanQrToken: (qrToken: string, officerId: string, officerName: string) => {
    const serverTimestamp = new Date().toISOString();

    const registration = db.registrations.find((r) => r.qrToken === qrToken);
    if (!registration) {
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: officerName,
        whoRole: "LITS",
        what: "SCAN_QR",
        when: serverTimestamp,
        target: qrToken,
        result: "REJECTED",
        details: "Invalid or unrecognized QR token",
      });
      throw new Error("Invalid QR token. Registration not recognized.");
    }

    if (registration.status === "CANCELLED") {
      throw new Error("This registration has been cancelled.");
    }

    const event = db.events.find((e) => e.id === registration.eventId);
    if (!event) throw new Error("Associated event not found.");

    // Check duplicate check-in
    const existingAttendance = db.attendance.find(
      (a) => a.registrationId === registration.id
    );
    if (existingAttendance && existingAttendance.verificationStatus !== "REJECTED") {
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: officerName,
        whoRole: "LITS",
        what: "SCAN_QR",
        when: serverTimestamp,
        target: `${registration.id} (${registration.studentName})`,
        result: "REJECTED",
        details: "Duplicate attendance scan rejected",
      });
      throw new Error(
        `Student ${registration.studentName} is already checked in (Status: ${existingAttendance.verificationStatus}).`
      );
    }

    const attendanceId = existingAttendance?.id || `ATT-${registration.id.replace("REG-", "")}`;
    const record: AttendanceRecord = {
      id: attendanceId,
      registrationId: registration.id,
      eventId: registration.eventId,
      studentId: registration.studentId,
      studentName: registration.studentName,
      studentEmail: registration.studentEmail,
      course: registration.course,
      yearLevel: registration.yearLevel,
      checkInTimestamp: serverTimestamp,
      checkedInByOfficerId: officerId,
      checkedInByOfficerName: officerName,
      photoStatus: "NONE",
      verificationStatus: "CHECKED_IN",
      evaluationUnlocked: false,
      createdAt: existingAttendance?.createdAt || serverTimestamp,
      updatedAt: serverTimestamp,
    };

    if (existingAttendance) {
      const idx = db.attendance.findIndex((a) => a.id === existingAttendance.id);
      db.attendance[idx] = record;
    } else {
      db.attendance.unshift(record);
    }

    // Notify student to upload photo
    db.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      userId: registration.studentId,
      userEmail: registration.studentEmail,
      title: "QR Scanned — Photo Required",
      message: `Your entrance QR was scanned. Please upload your mandatory attendance photo taken in the hall.`,
      type: "warning",
      timestamp: serverTimestamp,
      read: false,
      link: `/student/attendance/${record.id}/photo`,
    });

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: officerName,
      whoRole: "LITS",
      what: "SCAN_QR",
      when: serverTimestamp,
      target: `${registration.id} (${registration.studentName})`,
      result: "SUCCESS",
      details: `QR verified for event ${event.title}. Server check-in recorded.`,
    });

    return record;
  },

  submitAttendancePhoto: (payload: {
    attendanceId: string;
    photoUrl: string;
    photoTimestamp: string;
    studentName: string;
    studentEmail?: string;
  }) => {
    const serverUploadTimestamp = new Date().toISOString();
    const record = db.attendance.find((a) => a.id === payload.attendanceId);
    if (!record) {
      throw new Error("Attendance record not found. Please scan entrance QR first.");
    }

    const event = db.events.find((e) => e.id === record.eventId);
    if (!event) throw new Error("Event not found");

    const validation = validatePhotoTimestamp(
      payload.photoTimestamp,
      event.attendanceOpens,
      event.attendanceCloses,
      record.checkInTimestamp
    );

    record.photoUrl = payload.photoUrl;
    record.photoTimestamp = payload.photoTimestamp;
    record.photoUploadTimestamp = serverUploadTimestamp;
    record.photoStatus = "SUBMITTED";
    record.photoTimestampValid = validation.isValid;
    record.photoTimestampValidationNotes = validation.notes;
    record.verificationStatus = "UNDER_REVIEW";
    record.updatedAt = serverUploadTimestamp;

    // Notify LITS officers
    db.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      userId: "LITS_QUEUE",
      title: "New Attendance Photo for Verification",
      message: `${payload.studentName} uploaded an attendance photo for ${event.title}.`,
      type: "info",
      timestamp: serverUploadTimestamp,
      read: false,
      link: "/lits/verification",
    });

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: payload.studentName,
      whoRole: "STUDENT",
      what: "UPLOAD_PHOTO",
      when: serverUploadTimestamp,
      target: record.id,
      result: "SUCCESS",
      details: `Photo uploaded. Timestamp validation: ${validation.isValid ? "VALID" : "FLAGGED"}. Notes: ${validation.notes}`,
    });

    return record;
  },

  verifyAttendancePhoto: (payload: {
    attendanceId: string;
    officerId: string;
    officerName: string;
    decision: "APPROVE" | "REJECT";
    rejectionReason?: string;
  }) => {
    const serverTimestamp = new Date().toISOString();
    const record = db.attendance.find((a) => a.id === payload.attendanceId);
    if (!record) throw new Error("Attendance record not found");

    const event = db.events.find((e) => e.id === record.eventId);

    if (payload.decision === "APPROVE") {
      record.verificationStatus = "VERIFIED";
      record.photoStatus = "VERIFIED";
      record.verifiedByOfficerId = payload.officerId;
      record.verifiedByOfficerName = payload.officerName;
      record.verifiedAt = serverTimestamp;
      record.evaluationUnlocked = true;
      record.rejectionReason = undefined;
      record.updatedAt = serverTimestamp;

      // Notify student evaluation is now unlocked!
      if (record.studentEmail) {
        db.notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          userId: record.studentId,
          userEmail: record.studentEmail,
          title: "Attendance Verified — Evaluation Unlocked!",
          message: `Your photo was approved by ${payload.officerName}. You may now complete the evaluation form.`,
          type: "success",
          timestamp: serverTimestamp,
          read: false,
          link: `/student/evaluations/${record.eventId}`,
        });
      }

      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: payload.officerName,
        whoRole: "LITS",
        what: "VERIFY_ATTENDANCE",
        when: serverTimestamp,
        target: `${record.id} (${record.studentName})`,
        result: "SUCCESS",
        details: "Photo approved. Attendance confirmed. Evaluation automatically unlocked.",
      });
    } else {
      record.verificationStatus = "REJECTED";
      record.photoStatus = "REJECTED";
      record.verifiedByOfficerId = payload.officerId;
      record.verifiedByOfficerName = payload.officerName;
      record.verifiedAt = serverTimestamp;
      record.evaluationUnlocked = false;
      record.rejectionReason = payload.rejectionReason || "Photo did not meet verification criteria.";
      record.updatedAt = serverTimestamp;

      if (record.studentEmail) {
        db.notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          userId: record.studentId,
          userEmail: record.studentEmail,
          title: "Attendance Photo Rejected",
          message: `Your photo verification was rejected: ${record.rejectionReason}. Please resubmit a valid photo.`,
          type: "error",
          timestamp: serverTimestamp,
          read: false,
          link: `/student/attendance/${record.id}/photo`,
        });
      }

      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        who: payload.officerName,
        whoRole: "LITS",
        what: "REJECT_ATTENDANCE",
        when: serverTimestamp,
        target: `${record.id} (${record.studentName})`,
        result: "REJECTED",
        details: `Photo rejected. Reason: ${record.rejectionReason}`,
      });
    }

    return record;
  },

  // --- EVALUATIONS ---
  getEvaluations: () => db.evaluations,
  getEvaluationByEventId: (eventId: string) =>
    db.evaluations.find((e) => e.eventId === eventId),

  saveEvaluation: (form: EvaluationForm, officerEmail: string) => {
    const idx = db.evaluations.findIndex((e) => e.id === form.id);
    if (idx >= 0) {
      db.evaluations[idx] = { ...form, updatedAt: new Date().toISOString() };
    } else {
      db.evaluations.push({
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: officerEmail,
      whoRole: "LITS",
      what: "SAVE_EVALUATION",
      when: new Date().toISOString(),
      target: form.id,
      result: "SUCCESS",
      details: `Saved evaluation questionnaire with ${form.questions.length} questions`,
    });

    return form;
  },

  getEvaluationResponses: (eventId?: string, studentId?: string) => {
    let result = db.evaluationResponses;
    if (eventId) {
      result = result.filter((r) => r.eventId === eventId);
    }
    if (studentId) {
      result = result.filter((r) => r.studentId === studentId);
    }
    return result;
  },

  submitEvaluation: (payload: {
    formId: string;
    eventId: string;
    studentId: string;
    studentName: string;
    answers: { questionId: string; questionText: string; value: string | number | string[] }[];
  }) => {
    // ENFORCE MANDATORY SERVER-SIDE RULE: Attendance must be VERIFIED
    const attendance = db.attendance.find(
      (a) => a.eventId === payload.eventId && a.studentId === payload.studentId
    );

    if (!attendance || attendance.verificationStatus !== "VERIFIED") {
      throw new Error(
        "Evaluation locked! Your attendance must be officially verified by a LITS Officer before completing the evaluation."
      );
    }

    // Check duplicate
    const existing = db.evaluationResponses.find(
      (r) => r.eventId === payload.eventId && r.studentId === payload.studentId
    );
    if (existing) {
      // Check allowEdit
      const form = db.evaluations.find((f) => f.id === payload.formId);
      if (form?.allowEdit) {
        existing.answers = payload.answers;
        existing.updatedAt = new Date().toISOString();
        return existing;
      }
      throw new Error("You have already submitted an evaluation for this event.");
    }

    const response: EvaluationResponse = {
      id: `RESP-${Date.now()}`,
      formId: payload.formId,
      eventId: payload.eventId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      answers: payload.answers,
      submittedAt: new Date().toISOString(),
    };

    db.evaluationResponses.unshift(response);

    db.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      who: payload.studentName,
      whoRole: "STUDENT",
      what: "SUBMIT_EVALUATION",
      when: response.submittedAt,
      target: `${payload.eventId} / ${payload.formId}`,
      result: "SUCCESS",
      details: "Completed and submitted event participant evaluation.",
    });

    return response;
  },

  // --- NOTIFICATIONS ---
  getNotifications: (userEmail?: string) => {
    if (!userEmail) return db.notifications;
    return db.notifications.filter(
      (n) =>
        !n.userEmail ||
        n.userEmail.toLowerCase() === userEmail.toLowerCase() ||
        n.userId === "LITS_QUEUE"
    );
  },

  markNotificationRead: (id: string) => {
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    return notif;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: () => db.auditLogs,

  // --- RESET ---
  resetToDefaults: () => {
    db.users = [...INITIAL_USERS];
    db.litsUsers = [...INITIAL_LITS_USERS];
    db.studentRoster = [...INITIAL_STUDENT_ROSTER];
    db.events = [...INITIAL_EVENTS];
    db.registrations = [...INITIAL_REGISTRATIONS];
    db.attendance = [...INITIAL_ATTENDANCE];
    db.evaluations = [...INITIAL_EVALUATIONS];
    db.evaluationResponses = [...INITIAL_EVALUATION_RESPONSES];
    db.auditLogs = [...INITIAL_AUDIT_LOGS];
    db.notifications = [...INITIAL_NOTIFICATIONS];
  },
};
