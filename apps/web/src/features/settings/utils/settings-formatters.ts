export { getErrorMessage as getSettingsErrorMessage } from '@/lib/errors';

export function formatSettingNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
