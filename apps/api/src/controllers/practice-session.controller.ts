import { MantraModel } from '../models/mantra.model.ts';
import { PracticeSessionModel } from '../models/practice-session.model.ts';
import { AppError } from '../utils/app-error.ts';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const MAX_PRACTICE_TARGET = 100000;

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

function getSessionId(request: Request) {
  const sessionId = request.params.sessionId;

  if (typeof sessionId !== 'string') {
    throw new AppError(
      400,
      'INVALID_SESSION_ID',
      'Practice session id is invalid.'
    );
  }

  return sessionId;
}

function validateTargetCount(targetCount: unknown) {
  if (
    typeof targetCount !== 'number' ||
    !Number.isInteger(targetCount) ||
    targetCount < 1 ||
    targetCount > MAX_PRACTICE_TARGET
  ) {
    throw new AppError(
      400,
      'INVALID_TARGET_COUNT',
      `Target count must be an integer between 1 and ${MAX_PRACTICE_TARGET}.`
    );
  }

  return targetCount;
}

function validateCompletedCount(completedCount: unknown) {
  if (
    typeof completedCount !== 'number' ||
    !Number.isInteger(completedCount) ||
    completedCount < 0
  ) {
    throw new AppError(
      400,
      'INVALID_COMPLETED_COUNT',
      'Completed count must be a non-negative integer.'
    );
  }

  return completedCount;
}

function validateActiveDurationSeconds(activeDurationSeconds: unknown) {
  if (
    typeof activeDurationSeconds !== 'number' ||
    !Number.isInteger(activeDurationSeconds) ||
    activeDurationSeconds < 0
  ) {
    throw new AppError(
      400,
      'INVALID_ACTIVE_DURATION',
      'Active duration must be a non-negative integer.'
    );
  }

  return activeDurationSeconds;
}

function validateSessionId(sessionId: string) {
  if (!Types.ObjectId.isValid(sessionId)) {
    throw new AppError(
      400,
      'INVALID_SESSION_ID',
      'Practice session id is invalid.'
    );
  }
}

export async function createPracticeSession(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  /*
   * DevSangam currently allows only one unfinished
   * Sadhana per user.
   *
   * If an in-progress or paused session already exists,
   * return it instead of creating another session.
   */
  const existingSession = await PracticeSessionModel.findOne({
    userId,
    status: {
      $in: ['in_progress', 'paused'],
    },
  })
    .select('-__v')
    .sort({
      updatedAt: -1,
    });

  if (existingSession) {
    response.status(200).json({
      success: true,
      data: {
        session: existingSession,
      },
    });

    return;
  }

  const { mantraSlug, targetCount: rawTargetCount } = request.body as {
    mantraSlug?: unknown;
    targetCount?: unknown;
  };

  if (typeof mantraSlug !== 'string' || !mantraSlug.trim()) {
    throw new AppError(
      400,
      'INVALID_MANTRA_SLUG',
      'A mantra slug is required.'
    );
  }

  const targetCount = validateTargetCount(rawTargetCount);

  const normalizedSlug = mantraSlug.trim().toLowerCase();

  const mantra = await MantraModel.findOne({
    slug: normalizedSlug,
    isPublished: true,
  }).select('_id slug');

  if (!mantra) {
    throw new AppError(404, 'MANTRA_NOT_FOUND', 'Mantra not found.');
  }

  const session = await PracticeSessionModel.create({
    userId,
    mantraId: mantra._id,
    mantraSlug: mantra.slug,
    targetCount,
    completedCount: 0,
    activeDurationSeconds: 0,
    status: 'in_progress',
    startedAt: new Date(),
    completedAt: null,
  });

  response.status(201).json({
    success: true,
    data: {
      session,
    },
  });
}

export async function getPracticeSessions(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const sessions = await PracticeSessionModel.find({
    userId,
  })
    .select('-__v')
    .sort({
      createdAt: -1,
    });

  response.status(200).json({
    success: true,
    data: {
      sessions,
    },
  });
}

export async function getPracticeSession(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const sessionId = getSessionId(request);

  validateSessionId(sessionId);

  const session = await PracticeSessionModel.findOne({
    _id: sessionId,
    userId,
  }).select('-__v');

  if (!session) {
    throw new AppError(
      404,
      'PRACTICE_SESSION_NOT_FOUND',
      'Practice session not found.'
    );
  }

  response.status(200).json({
    success: true,
    data: {
      session,
    },
  });
}

export async function updatePracticeSession(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const sessionId = getSessionId(request);

  validateSessionId(sessionId);

  const session = await PracticeSessionModel.findOne({
    _id: sessionId,
    userId,
  });

  if (!session) {
    throw new AppError(
      404,
      'PRACTICE_SESSION_NOT_FOUND',
      'Practice session not found.'
    );
  }

  if (session.status === 'completed') {
    throw new AppError(
      409,
      'PRACTICE_SESSION_COMPLETED',
      'A completed practice session cannot be changed.'
    );
  }

  const {
    completedCount: rawCompletedCount,
    activeDurationSeconds: rawActiveDurationSeconds,
    status,
  } = request.body as {
    completedCount?: unknown;
    activeDurationSeconds?: unknown;
    status?: unknown;
  };

  if (rawCompletedCount !== undefined) {
    const completedCount = validateCompletedCount(rawCompletedCount);

    if (completedCount > session.targetCount) {
      throw new AppError(
        400,
        'COMPLETED_COUNT_EXCEEDS_TARGET',
        'Completed count cannot exceed the session target.'
      );
    }

    session.completedCount = completedCount;
  }

  if (rawActiveDurationSeconds !== undefined) {
    session.activeDurationSeconds = validateActiveDurationSeconds(
      rawActiveDurationSeconds
    );
  }

  if (status !== undefined) {
    if (
      status !== 'in_progress' &&
      status !== 'paused' &&
      status !== 'abandoned'
    ) {
      throw new AppError(
        400,
        'INVALID_SESSION_STATUS',
        'Session status must be in_progress, paused, or abandoned.'
      );
    }

    session.status = status;
  }

  await session.save();

  response.status(200).json({
    success: true,
    data: {
      session,
    },
  });
}

export async function completePracticeSession(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const sessionId = getSessionId(request);

  validateSessionId(sessionId);

  const session = await PracticeSessionModel.findOne({
    _id: sessionId,
    userId,
  });

  if (!session) {
    throw new AppError(
      404,
      'PRACTICE_SESSION_NOT_FOUND',
      'Practice session not found.'
    );
  }

  if (session.status === 'completed') {
    response.status(200).json({
      success: true,
      data: {
        session,
      },
    });

    return;
  }

  if (session.status === 'abandoned') {
    throw new AppError(
      409,
      'PRACTICE_SESSION_ABANDONED',
      'An abandoned practice session cannot be completed.'
    );
  }

  const {
    completedCount: rawCompletedCount,
    activeDurationSeconds: rawActiveDurationSeconds,
  } = request.body as {
    completedCount?: unknown;
    activeDurationSeconds?: unknown;
  };

  const completedCount = validateCompletedCount(rawCompletedCount);

  const activeDurationSeconds = validateActiveDurationSeconds(
    rawActiveDurationSeconds
  );

  if (completedCount !== session.targetCount) {
    throw new AppError(
      400,
      'PRACTICE_TARGET_NOT_REACHED',
      'The practice target must be reached before completing the session.'
    );
  }

  session.completedCount = completedCount;

  session.activeDurationSeconds = activeDurationSeconds;

  session.status = 'completed';

  session.completedAt = new Date();

  await session.save();

  response.status(200).json({
    success: true,
    data: {
      session,
    },
  });
}
