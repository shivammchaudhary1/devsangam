import type { PracticeSession } from './practice-session.js';

export type InsightsRange = '7d' | '30d' | '90d' | 'all';

export type InsightsSummary = {
  totalChants: number;

  totalCompletedSessions: number;

  totalPracticeSeconds: number;

  totalMalas: number;

  currentStreakDays: number;

  longestStreakDays: number;
};

export type DailyPracticeActivity = {
  /**
   * Calendar date in YYYY-MM-DD format.
   *
   * The backend should calculate this using
   * the user's timezone.
   */
  date: string;

  chants: number;

  activeDurationSeconds: number;

  completedSessions: number;

  completedMalas: number;
};

export type MantraPracticeBreakdown = {
  mantraSlug: string;

  totalChants: number;

  totalCompletedSessions: number;

  totalPracticeSeconds: number;

  totalMalas: number;
};

export type InsightsOverview = {
  summary: InsightsSummary;

  dailyActivity: DailyPracticeActivity[];

  mantraBreakdown: MantraPracticeBreakdown[];
};

export type InsightsOverviewResponse = {
  success: true;

  data: {
    insights: InsightsOverview;
  };
};

export type InsightsOverviewQuery = {
  range?: InsightsRange;

  /**
   * IANA timezone such as:
   *
   * America/Chicago
   * America/New_York
   * Asia/Kolkata
   *
   * The API may fall back to the user's stored
   * timezone when this value is not supplied.
   */
  timezone?: string;
};

export type PracticeHistoryFilters = {
  page?: number;

  limit?: number;

  mantraSlug?: string;

  status?: PracticeSession['status'];

  startDate?: string;

  endDate?: string;

  timezone?: string;
};

export type PracticeHistoryPagination = {
  page: number;

  limit: number;

  totalItems: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
};

export type PracticeHistory = {
  sessions: PracticeSession[];

  pagination: PracticeHistoryPagination;
};

export type PracticeHistoryResponse = {
  success: true;

  data: {
    history: PracticeHistory;
  };
};
