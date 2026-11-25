export enum UserRole {
  FOUNDER = "founder",
  FACILITATOR = "facilitator",
  ADMIN = "admin",
  INVESTOR = "investor",
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  slug?: string;
  cohort?: string | ICohort;
  isVerified?: boolean;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  company?: string;
  companyOneLiner?: string;
  website?: string;
  location?: string;
  sector?: string;
  stage?: string;
  fundraising?: boolean;
  raiseAmount?: string;
  linkedin?: string;
  twitter?: string;
  isProfilePublic?: boolean;
  watchlist?: string[];
  createdAt?: string;
}

export interface ICohort {
  _id: string;
  name: string;
  facilitator: string | IUser;
  startDate: string;
  endDate?: string;
  inviteCode?: string;
  members: IUser[];
  createdAt: string;
}
