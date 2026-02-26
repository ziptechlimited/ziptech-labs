export enum UserRole {
  FOUNDER = "founder",
  FACILITATOR = "facilitator",
  ADMIN = "admin",
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  bio?: string;
  avatarUrl?: string;
  company?: string;
  website?: string;
  location?: string;
  cohort?: string | ICohort;
  goals?: string[] | IGoal[];
  isVerified?: boolean;
  verifiedAt?: Date;
  verificationTokenHash?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICohort {
  _id: string;
  name: string;
  facilitator: string | IUser;
  startDate: Date;
  endDate: Date;
  inviteCode?: string;
  members: string[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal {
  _id: string;
  user: string | IUser;
  cohort: string | ICohort;
  type: "public" | "private";
  description: string;
  status: "pending" | "done" | "partial" | "not_done";
  weekNumber: number;
  subTasks: { description: string; completed: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICheckIn {
  _id: string;
  user: string | IUser;
  goal: string | IGoal;
  weekNumber: number;
  date: Date;
  status: "done" | "partial" | "not_done";
  blockerNote?: string;
  report?: string; // Was this in schema?
  // Schema had blockerNote.
  createdAt: Date;
  updatedAt: Date;
}
