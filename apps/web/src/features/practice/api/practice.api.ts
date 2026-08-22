import { apiRequest } from '@/services/api/client';
import type {
  CompletePracticeSessionRequest,
  CompletePracticeSessionResponse,
  CreatePracticeSessionRequest,
  CreatePracticeSessionResponse,
  PracticeSession,
  PracticeSessionDetailResponse,
  PracticeSessionListResponse,
  UpdatePracticeSessionRequest,
  UpdatePracticeSessionResponse,
} from '@devsangam/types';

export async function getPracticeSessions(): Promise<PracticeSession[]> {
  const response =
    await apiRequest<PracticeSessionListResponse>('/practice/sessions');

  return response.data.sessions;
}

export async function getPracticeSession(
  sessionId: string
): Promise<PracticeSession> {
  const response = await apiRequest<PracticeSessionDetailResponse>(
    `/practice/sessions/${encodeURIComponent(sessionId)}`
  );

  return response.data.session;
}

export async function createPracticeSession(
  payload: CreatePracticeSessionRequest
): Promise<PracticeSession> {
  const response = await apiRequest<CreatePracticeSessionResponse>(
    '/practice/sessions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return response.data.session;
}

export async function updatePracticeSession(
  sessionId: string,
  payload: UpdatePracticeSessionRequest
): Promise<PracticeSession> {
  const response = await apiRequest<UpdatePracticeSessionResponse>(
    `/practice/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );

  return response.data.session;
}

export async function completePracticeSession(
  sessionId: string,
  payload: CompletePracticeSessionRequest
): Promise<PracticeSession> {
  const response = await apiRequest<CompletePracticeSessionResponse>(
    `/practice/sessions/${encodeURIComponent(sessionId)}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

  return response.data.session;
}
