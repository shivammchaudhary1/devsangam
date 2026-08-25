import { PracticeSessionModel } from '../models/practice-session.model.ts';
import type {
  DailyPracticeActivity,
  InsightsOverview,
  InsightsRange,
  MantraPracticeBreakdown,
} from '@devsangam/types';
import { type PipelineStage, Types } from 'mongoose';

const MALA_SIZE = 108;

type InsightsServiceOptions = {
  userId: string;
  range: InsightsRange;
  timezone: string;
};

type SummaryAggregate = {
  _id: null;
  totalChants: number;
  totalCompletedSessions: number;
  totalPracticeSeconds: number;
  totalMalas: number;
};

type DailyActivityAggregate = {
  _id: string;
  chants: number;
  activeDurationSeconds: number;
  completedSessions: number;
  completedMalas: number;
};

type MantraBreakdownAggregate = {
  _id: string;
  totalChants: number;
  totalCompletedSessions: number;
  totalPracticeSeconds: number;
  totalMalas: number;
};

type StreakDateAggregate = {
  _id: string;
};

type InsightsAggregationResult = {
  rangeSummary: SummaryAggregate[];
  dailyActivity: DailyActivityAggregate[];
  mantraBreakdown: MantraBreakdownAggregate[];
  streakDates: StreakDateAggregate[];
};

export async function buildInsightsOverview({
  userId,
  range,
  timezone,
}: InsightsServiceOptions): Promise<InsightsOverview> {
  const todayDateKey = getDateKeyInTimezone(new Date(), timezone);

  const rangeStartDateKey = getRangeStartDateKey(todayDateKey, range);

  /*
   * "all" uses an intentionally minimal date key so
   * the same aggregation stages can be reused without
   * dynamically changing the pipeline shape.
   */
  const effectiveStartDateKey = rangeStartDateKey ?? '0000-01-01';

  const pipeline: PipelineStage[] = [
    /*
     * Use the indexed fields first.
     *
     * Only completed sessions contribute to
     * Insights analytics.
     */
    {
      $match: {
        userId: new Types.ObjectId(userId),
        status: 'completed',
        completedAt: {
          $ne: null,
        },
      },
    },

    /*
     * Convert each completion timestamp into the
     * user's local calendar date.
     *
     * This is critical for correct streaks.
     */
    {
      $addFields: {
        localPracticeDate: {
          $dateToString: {
            date: '$completedAt',
            format: '%Y-%m-%d',
            timezone,
          },
        },

        completedMalas: {
          $floor: {
            $divide: ['$completedCount', MALA_SIZE],
          },
        },
      },
    },

    {
      $facet: {
        /*
         * Selected-range totals.
         */
        rangeSummary: [
          {
            $match: {
              localPracticeDate: {
                $gte: effectiveStartDateKey,

                $lte: todayDateKey,
              },
            },
          },

          {
            $group: {
              _id: null,

              totalChants: {
                $sum: '$completedCount',
              },

              totalCompletedSessions: {
                $sum: 1,
              },

              totalPracticeSeconds: {
                $sum: '$activeDurationSeconds',
              },

              totalMalas: {
                $sum: '$completedMalas',
              },
            },
          },
        ],

        /*
         * Selected-range activity grouped by
         * the user's local calendar day.
         */
        dailyActivity: [
          {
            $match: {
              localPracticeDate: {
                $gte: effectiveStartDateKey,

                $lte: todayDateKey,
              },
            },
          },

          {
            $group: {
              _id: '$localPracticeDate',

              chants: {
                $sum: '$completedCount',
              },

              activeDurationSeconds: {
                $sum: '$activeDurationSeconds',
              },

              completedSessions: {
                $sum: 1,
              },

              completedMalas: {
                $sum: '$completedMalas',
              },
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ],

        /*
         * Selected-range totals grouped by mantra.
         */
        mantraBreakdown: [
          {
            $match: {
              localPracticeDate: {
                $gte: effectiveStartDateKey,

                $lte: todayDateKey,
              },
            },
          },

          {
            $group: {
              _id: '$mantraSlug',

              totalChants: {
                $sum: '$completedCount',
              },

              totalCompletedSessions: {
                $sum: 1,
              },

              totalPracticeSeconds: {
                $sum: '$activeDurationSeconds',
              },

              totalMalas: {
                $sum: '$completedMalas',
              },
            },
          },

          {
            $sort: {
              totalChants: -1,
              _id: 1,
            },
          },
        ],

        /*
         * Streak dates intentionally use ALL completed
         * history instead of the selected range.
         */
        streakDates: [
          {
            $match: {
              localPracticeDate: {
                $lte: todayDateKey,
              },
            },
          },

          {
            $group: {
              _id: '$localPracticeDate',
            },
          },

          {
            $sort: {
              _id: 1,
            },
          },
        ],
      },
    },
  ];

  const [aggregationResult] =
    await PracticeSessionModel.aggregate<InsightsAggregationResult>(pipeline);

  const result = aggregationResult ?? {
    rangeSummary: [],
    dailyActivity: [],
    mantraBreakdown: [],
    streakDates: [],
  };

  const aggregatedSummary = result.rangeSummary[0];

  const streaks = calculateStreaks(
    result.streakDates.map((entry) => entry._id),
    todayDateKey
  );

  const dailyActivity = buildDailyActivity({
    aggregatedActivity: result.dailyActivity,

    range,

    startDateKey: rangeStartDateKey,

    todayDateKey,
  });

  const mantraBreakdown = result.mantraBreakdown.map(
    (item): MantraPracticeBreakdown => ({
      mantraSlug: item._id,

      totalChants: item.totalChants,

      totalCompletedSessions: item.totalCompletedSessions,

      totalPracticeSeconds: item.totalPracticeSeconds,

      totalMalas: item.totalMalas,
    })
  );

  return {
    summary: {
      totalChants: aggregatedSummary?.totalChants ?? 0,

      totalCompletedSessions: aggregatedSummary?.totalCompletedSessions ?? 0,

      totalPracticeSeconds: aggregatedSummary?.totalPracticeSeconds ?? 0,

      totalMalas: aggregatedSummary?.totalMalas ?? 0,

      currentStreakDays: streaks.current,

      longestStreakDays: streaks.longest,
    },

    dailyActivity,

    mantraBreakdown,
  };
}

type BuildDailyActivityOptions = {
  aggregatedActivity: DailyActivityAggregate[];

  range: InsightsRange;

  startDateKey: string | null;

  todayDateKey: string;
};

function buildDailyActivity({
  aggregatedActivity,
  range,
  startDateKey,
  todayDateKey,
}: BuildDailyActivityOptions): DailyPracticeActivity[] {
  /*
   * For "all" we only return dates that actually
   * contain activity. Filling every empty day across
   * several years would be wasteful.
   */
  if (range === 'all' || !startDateKey) {
    return aggregatedActivity.map(
      (item): DailyPracticeActivity => ({
        date: item._id,

        chants: item.chants,

        activeDurationSeconds: item.activeDurationSeconds,

        completedSessions: item.completedSessions,

        completedMalas: item.completedMalas,
      })
    );
  }

  /*
   * For 7d / 30d / 90d we include empty dates.
   *
   * This makes frontend charts dramatically simpler
   * because React does not need to invent missing days.
   */
  const activityByDate = new Map(
    aggregatedActivity.map((item) => [item._id, item])
  );

  const dateKeys = enumerateDateKeys(startDateKey, todayDateKey);

  return dateKeys.map((date): DailyPracticeActivity => {
    const activity = activityByDate.get(date);

    return {
      date,

      chants: activity?.chants ?? 0,

      activeDurationSeconds: activity?.activeDurationSeconds ?? 0,

      completedSessions: activity?.completedSessions ?? 0,

      completedMalas: activity?.completedMalas ?? 0,
    };
  });
}

function calculateStreaks(rawDateKeys: string[], todayDateKey: string) {
  const dateKeys = [...new Set(rawDateKeys)]
    .filter((dateKey) => dateKey <= todayDateKey)
    .sort();

  if (dateKeys.length === 0) {
    return {
      current: 0,
      longest: 0,
    };
  }

  let longest = 1;

  let running = 1;

  for (let index = 1; index < dateKeys.length; index += 1) {
    const previous = dateKeys[index - 1];

    const current = dateKeys[index];

    if (!previous || !current) {
      continue;
    }

    const expectedNext = addDaysToDateKey(previous, 1);

    if (current === expectedNext) {
      running += 1;
    } else {
      running = 1;
    }

    longest = Math.max(longest, running);
  }

  const latestDateKey = dateKeys[dateKeys.length - 1];

  if (!latestDateKey) {
    return {
      current: 0,
      longest,
    };
  }

  const yesterdayDateKey = addDaysToDateKey(todayDateKey, -1);

  /*
   * The current streak remains active when the user
   * practiced yesterday but has not yet practiced today.
   *
   * It becomes zero only after a full calendar day
   * has been missed.
   */
  if (latestDateKey !== todayDateKey && latestDateKey !== yesterdayDateKey) {
    return {
      current: 0,
      longest,
    };
  }

  let currentStreak = 1;

  for (let index = dateKeys.length - 2; index >= 0; index -= 1) {
    const current = dateKeys[index];

    const next = dateKeys[index + 1];

    if (!current || !next) {
      break;
    }

    const expectedPrevious = addDaysToDateKey(next, -1);

    if (current !== expectedPrevious) {
      break;
    }

    currentStreak += 1;
  }

  return {
    current: currentStreak,

    longest,
  };
}

function getRangeStartDateKey(todayDateKey: string, range: InsightsRange) {
  switch (range) {
    case '7d':
      return addDaysToDateKey(todayDateKey, -6);

    case '30d':
      return addDaysToDateKey(todayDateKey, -29);

    case '90d':
      return addDaysToDateKey(todayDateKey, -89);

    case 'all':
      return null;
  }
}

function enumerateDateKeys(startDateKey: string, endDateKey: string) {
  const dateKeys: string[] = [];

  let current = startDateKey;

  while (current <= endDateKey) {
    dateKeys.push(current);

    current = addDaysToDateKey(current, 1);
  }

  return dateKeys;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const year = Number(dateKey.slice(0, 4));

  const month = Number(dateKey.slice(5, 7));

  const day = Number(dateKey.slice(8, 10));

  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + days);

  return formatUtcDateKey(date);
}

function formatUtcDateKey(date: Date) {
  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateKeyInTimezone(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,

    year: 'numeric',

    month: '2-digit',

    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;

  const month = parts.find((part) => part.type === 'month')?.value;

  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Unable to determine local calendar date.');
  }

  return `${year}-${month}-${day}`;
}
