export type Role = 'STUDENT' | 'LITS' | 'ADMIN';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export type AttendanceStatus =
  | 'REGISTERED'
  | 'CHECKED_IN'
  | 'PHOTO_PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  course?: string;
  yearLevel?: string;
  avatarUrl?: string;
  department?: string;
  isBootstrap?: boolean;
}

export interface LitsUser {
  id: string;
  email: string;
  name: string;
  department: string;
  notes?: string;
  isActive: boolean;
  authorizedBy: string; // admin email
  authorizedAt: string;
  updatedAt: string;
}

export interface StudentRosterRecord {
  id: string;
  email: string;
  studentId: string;
  name: string;
  course: string;
  yearLevel: string;
  isActive: boolean;
  createdAt: string;
}

export interface EligibilityRules {
  type: 'open' | 'members_only' | 'course_restricted' | 'year_restricted';
  allowedCourses?: string[];
  allowedYears?: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  venue: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  registrationOpens: string; // ISO string
  registrationCloses: string; // ISO string
  attendanceOpens: string; // HH:mm or ISO string
  attendanceCloses: string; // HH:mm or ISO string
  maxParticipants: number;
  currentParticipants: number;
  eligibility: EligibilityRules;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string; // e.g. REG-2026-0145
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  yearLevel: string;
  contactNumber: string;
  qrToken: string; // Opaque server-generated token
  registeredAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

export interface AttendanceRecord {
  id: string;
  registrationId: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  course: string;
  yearLevel: string;
  checkInTimestamp: string; // Server timestamp when QR scanned
  checkedInByOfficerId?: string;
  checkedInByOfficerName?: string;
  photoUrl?: string;
  photoStatus: 'NONE' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  photoTimestamp?: string; // Stated or EXIF timestamp of photo
  photoUploadTimestamp?: string; // Server timestamp when photo uploaded
  photoTimestampValid?: boolean; // Evaluated against attendance window
  photoTimestampValidationNotes?: string;
  verificationStatus: AttendanceStatus;
  verifiedByOfficerId?: string;
  verifiedByOfficerName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  evaluationUnlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'rating' | 'multiple_choice' | 'checkbox' | 'short_answer' | 'long_answer';

export interface EvaluationQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  options?: string[];
}

export interface EvaluationForm {
  id: string;
  eventId: string;
  title: string;
  description: string;
  isPublished: boolean;
  allowEdit?: boolean;
  questions: EvaluationQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResponseAnswer {
  questionId: string;
  questionText: string;
  value: string | number | string[];
}

export interface EvaluationResponse {
  id: string;
  formId: string;
  eventId: string;
  studentId: string;
  studentName: string;
  answers: EvaluationResponseAnswer[];
  submittedAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  who: string;
  whoRole: Role;
  what: string;
  when: string;
  target: string;
  result: 'SUCCESS' | 'FAILURE' | 'REJECTED';
  details?: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  userEmail?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  link?: string;
}
