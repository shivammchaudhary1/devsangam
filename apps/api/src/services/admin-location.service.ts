import { UserModel } from '../models/user.model.ts';

function regionForTimezone(timezone: string) {
  try {
    const canonical = new Intl.DateTimeFormat('en', { timeZone: timezone }).resolvedOptions().timeZone;
    const prefix = canonical.split('/')[0];
    if (['Africa', 'America', 'Asia', 'Europe'].includes(prefix)) return prefix;
    if (['Australia', 'Pacific'].includes(prefix)) return 'Oceania';
  } catch { /* Old/default timezones remain visible as unspecified. */ }
  return 'Unspecified';
}

export async function getAdminLocationMetrics() {
  const groups = await UserModel.aggregate<{ _id: string; users: number; sessions: number; chants: number }>([
    { $group: { _id: { $ifNull: ['$preferences.timezone', 'UTC'] }, users: { $sum: 1 }, sessions: { $sum: '$totals.sessions' }, chants: { $sum: '$totals.chants' } } },
    { $sort: { users: -1, _id: 1 } },
  ]);
  return { source: 'account_timezone', groups: groups.map(group => ({ timezone: group._id || 'UTC', region: regionForTimezone(group._id || 'UTC'), users: group.users, sessions: group.sessions, chants: group.chants })) };
}
