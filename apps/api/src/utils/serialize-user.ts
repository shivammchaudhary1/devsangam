import type { User } from '../models/user.model.ts';
import type { HydratedDocument } from 'mongoose';

export function serializeUser(user: HydratedDocument<User>) {
  return {
    id: user._id.toString(),

    name: user.name,

    email: user.email,

    avatar: user.avatar,

    role: user.role,

    emailVerified: user.emailVerified,

    preferences: user.preferences,

    streak: user.streak,

    totals: user.totals,

    createdAt: user.createdAt,

    updatedAt: user.updatedAt,
  };
}
