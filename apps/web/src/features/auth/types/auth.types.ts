export interface AuthUser {
  id: string;

  name: string;

  email: string;

  avatar: string | null;

  role: 'user' | 'admin';

  emailVerified: boolean;

  preferences: {
    language: string;

    theme: 'dark' | 'light';

    soundEnabled: boolean;

    hapticEnabled: boolean;

    reminderEnabled: boolean;

    reminderTime: string | null;

    timezone: string;

    defaultTarget: number;
  };

  streak: {
    current: number;

    longest: number;

    lastPracticeDate: string | null;
  };

  totals: {
    chants: number;

    malas: number;

    sessions: number;

    durationSeconds: number;
  };

  createdAt: string;

  updatedAt: string;
}

export interface AuthResponse {
  success: true;

  data: {
    user: AuthUser;
  };
}
