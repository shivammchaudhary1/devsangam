import { PracticeSessionModel } from '../models/practice-session.model.ts';
import type {
  PracticeHistory,
  PracticeSession,
  PracticeSessionStatus,
} from '@devsangam/types';
import { type PipelineStage, Types } from 'mongoose';

type BuildPracticeHistoryOptions = {
  userId: string;

  page: number;

  limit: number;

  mantraSlug: string | null;

  status: PracticeSessionStatus | null;

  startDate: string | null;

  endDate: string | null;

  timezone: string;
};

type PracticeHistoryAggregateSession = {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  mantraId: Types.ObjectId;

  mantraSlug: string;

  targetCount: number;

  completedCount: number;

  activeDurationSeconds: number;

  status: PracticeSessionStatus;

  startedAt: Date;

  completedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
};

type PracticeHistoryCount = {
  count: number;
};

type PracticeHistoryAggregateResult = {
  sessions: PracticeHistoryAggregateSession[];

  total: PracticeHistoryCount[];
};

export async function buildPracticeHistory({
  userId,
  page,
  limit,
  mantraSlug,
  status,
  startDate,
  endDate,
  timezone,
}: BuildPracticeHistoryOptions): Promise<PracticeHistory> {
  const match: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };

  if (mantraSlug) {
    match.mantraSlug = mantraSlug;
  }

  if (status) {
    match.status = status;
  }

  const pipeline: PipelineStage[] = [
    {
      $match: match,
    },
  ];

  /*
   * startDate / endDate represent calendar
   * dates in the user's timezone.
   *
   * We convert startedAt into YYYY-MM-DD
   * using MongoDB's timezone-aware
   * $dateToString operator.
   */
  if (startDate || endDate) {
    pipeline.push({
      $addFields: {
        localHistoryDate: {
          $dateToString: {
            date: '$startedAt',

            format: '%Y-%m-%d',

            timezone,
          },
        },
      },
    });

    const dateFilter: {
      $gte?: string;
      $lte?: string;
    } = {};

    if (startDate) {
      dateFilter.$gte = startDate;
    }

    if (endDate) {
      dateFilter.$lte = endDate;
    }

    pipeline.push({
      $match: {
        localHistoryDate: dateFilter,
      },
    });
  }

  const skip = (page - 1) * limit;

  pipeline.push(
    {
      $sort: {
        startedAt: -1,
        _id: -1,
      },
    },
    {
      $facet: {
        sessions: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              __v: 0,

              localHistoryDate: 0,
            },
          },
        ],

        total: [
          {
            $count: 'count',
          },
        ],
      },
    }
  );

  const [aggregationResult] =
    await PracticeSessionModel.aggregate<PracticeHistoryAggregateResult>(
      pipeline
    );

  const sessions = (aggregationResult?.sessions ?? []).map(
    serializePracticeSession
  );

  const totalItems = aggregationResult?.total[0]?.count ?? 0;

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    sessions,

    pagination: {
      page,

      limit,

      totalItems,

      totalPages,

      hasNextPage: page < totalPages,

      hasPreviousPage: page > 1 && totalPages > 0,
    },
  };
}

function serializePracticeSession(
  session: PracticeHistoryAggregateSession
): PracticeSession {
  return {
    _id: session._id.toString(),

    userId: session.userId.toString(),

    mantraId: session.mantraId.toString(),

    mantraSlug: session.mantraSlug,

    targetCount: session.targetCount,

    completedCount: session.completedCount,

    activeDurationSeconds: session.activeDurationSeconds,

    status: session.status,

    startedAt: session.startedAt.toISOString(),

    completedAt: session.completedAt ? session.completedAt.toISOString() : null,

    createdAt: session.createdAt.toISOString(),

    updatedAt: session.updatedAt.toISOString(),
  };
}
