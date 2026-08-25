import { UserModel } from '../models/user.model.ts';
import { buildInsightsOverview } from '../services/insights.service.ts';
import { buildPracticeHistory } from '../services/practice-history.service.ts';
import { AppError } from '../utils/app-error.ts';
import type {
  InsightsOverviewResponse,
  InsightsRange,
  PracticeHistoryResponse,
  PracticeSessionStatus,
} from '@devsangam/types';
import type { Request, Response } from 'express';

const DEFAULT_INSIGHTS_RANGE: InsightsRange = '7d';

const DEFAULT_HISTORY_PAGE = 1;

const DEFAULT_HISTORY_LIMIT = 20;

const MAX_HISTORY_LIMIT = 50;

const SUPPORTED_INSIGHTS_RANGES = new Set<InsightsRange>([
  '7d',
  '30d',
  '90d',
  'all',
]);

const SUPPORTED_SESSION_STATUSES = new Set<PracticeSessionStatus>([
  'in_progress',
  'paused',
  'completed',
  'abandoned',
]);

export async function getInsightsOverview(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const range = parseInsightsRange(request.query.range);

  const requestedTimezone = parseOptionalTimezone(request.query.timezone);

  const timezone = await resolveUserTimezone(userId, requestedTimezone);

  const insights = await buildInsightsOverview({
    userId,
    range,
    timezone,
  });

  const payload: InsightsOverviewResponse = {
    success: true,

    data: {
      insights,
    },
  };

  response.status(200).json(payload);
}

export async function getPracticeHistory(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const page = parseHistoryPage(request.query.page);

  const limit = parseHistoryLimit(request.query.limit);

  const mantraSlug = parseOptionalMantraSlug(request.query.mantraSlug);

  const status = parseOptionalStatus(request.query.status);

  const startDate = parseOptionalDateKey(request.query.startDate, 'startDate');

  const endDate = parseOptionalDateKey(request.query.endDate, 'endDate');

  if (startDate && endDate && startDate > endDate) {
    throw new AppError(
      400,
      'INVALID_HISTORY_DATE_RANGE',
      'startDate cannot be after endDate.'
    );
  }

  const requestedTimezone = parseOptionalTimezone(request.query.timezone);

  const timezone = await resolveUserTimezone(userId, requestedTimezone);

  const history = await buildPracticeHistory({
    userId,

    page,

    limit,

    mantraSlug,

    status,

    startDate,

    endDate,

    timezone,
  });

  const payload: PracticeHistoryResponse = {
    success: true,

    data: {
      history,
    },
  };

  response.status(200).json(payload);
}

function getAuthenticatedUserId(request: Request) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  return userId;
}

async function resolveUserTimezone(
  userId: string,
  requestedTimezone: string | null
) {
  const user = await UserModel.findById(userId)
    .select('preferences.timezone')
    .lean();

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
  }

  const timezone = requestedTimezone ?? user.preferences?.timezone ?? 'UTC';

  validateTimezone(timezone);

  return timezone;
}

function parseInsightsRange(value: unknown): InsightsRange {
  if (value === undefined) {
    return DEFAULT_INSIGHTS_RANGE;
  }

  if (
    typeof value !== 'string' ||
    !SUPPORTED_INSIGHTS_RANGES.has(value as InsightsRange)
  ) {
    throw new AppError(
      400,
      'INVALID_INSIGHTS_RANGE',
      'Insights range must be 7d, 30d, 90d, or all.'
    );
  }

  return value as InsightsRange;
}

function parseHistoryPage(value: unknown) {
  if (value === undefined) {
    return DEFAULT_HISTORY_PAGE;
  }

  const page = parseIntegerQueryValue(value);

  if (page === null || page < 1) {
    throw new AppError(
      400,
      'INVALID_HISTORY_PAGE',
      'History page must be a positive integer.'
    );
  }

  return page;
}

function parseHistoryLimit(value: unknown) {
  if (value === undefined) {
    return DEFAULT_HISTORY_LIMIT;
  }

  const limit = parseIntegerQueryValue(value);

  if (limit === null || limit < 1 || limit > MAX_HISTORY_LIMIT) {
    throw new AppError(
      400,
      'INVALID_HISTORY_LIMIT',
      `History limit must be an integer between 1 and ${MAX_HISTORY_LIMIT}.`
    );
  }

  return limit;
}

function parseIntegerQueryValue(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    return null;
  }

  return parsed;
}

function parseOptionalMantraSlug(value: unknown) {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(
      400,
      'INVALID_MANTRA_SLUG',
      'mantraSlug must be a non-empty string.'
    );
  }

  return value.trim().toLowerCase();
}

function parseOptionalStatus(value: unknown): PracticeSessionStatus | null {
  if (value === undefined) {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !SUPPORTED_SESSION_STATUSES.has(value as PracticeSessionStatus)
  ) {
    throw new AppError(
      400,
      'INVALID_HISTORY_STATUS',
      'History status must be in_progress, paused, completed, or abandoned.'
    );
  }

  return value as PracticeSessionStatus;
}

function parseOptionalDateKey(value: unknown, fieldName: string) {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string' || !isValidDateKey(value)) {
    throw new AppError(
      400,
      'INVALID_HISTORY_DATE',
      `${fieldName} must use YYYY-MM-DD format.`
    );
  }

  return value;
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const year = Number(value.slice(0, 4));

  const month = Number(value.slice(5, 7));

  const day = Number(value.slice(8, 10));

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseOptionalTimezone(value: unknown) {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(
      400,
      'INVALID_TIMEZONE',
      'Timezone must be a valid IANA timezone.'
    );
  }

  return value.trim();
}

function validateTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).format();
  } catch {
    throw new AppError(
      400,
      'INVALID_TIMEZONE',
      'Timezone must be a valid IANA timezone.'
    );
  }
}
