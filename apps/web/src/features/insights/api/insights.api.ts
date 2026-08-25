import { apiRequest } from '@/services/api/client';
import type {
  InsightsOverview,
  InsightsOverviewQuery,
  InsightsOverviewResponse,
  PracticeHistory,
  PracticeHistoryFilters,
  PracticeHistoryResponse,
} from '@devsangam/types';

export async function getInsightsOverview(
  params: InsightsOverviewQuery = {}
): Promise<InsightsOverview> {
  const searchParams = new URLSearchParams();

  if (params.range) {
    searchParams.set('range', params.range);
  }

  if (params.timezone) {
    searchParams.set('timezone', params.timezone);
  }

  const response = await apiRequest<InsightsOverviewResponse>(
    createInsightsPath('/insights/overview', searchParams)
  );

  return response.data.insights;
}

export async function getPracticeHistory(
  filters: PracticeHistoryFilters = {}
): Promise<PracticeHistory> {
  const searchParams = new URLSearchParams();

  if (filters.page !== undefined) {
    searchParams.set('page', String(filters.page));
  }

  if (filters.limit !== undefined) {
    searchParams.set('limit', String(filters.limit));
  }

  if (filters.mantraSlug) {
    searchParams.set('mantraSlug', filters.mantraSlug);
  }

  if (filters.status) {
    searchParams.set('status', filters.status);
  }

  if (filters.startDate) {
    searchParams.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set('endDate', filters.endDate);
  }

  if (filters.timezone) {
    searchParams.set('timezone', filters.timezone);
  }

  const response = await apiRequest<PracticeHistoryResponse>(
    createInsightsPath('/insights/history', searchParams)
  );

  return response.data.history;
}

function createInsightsPath(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
