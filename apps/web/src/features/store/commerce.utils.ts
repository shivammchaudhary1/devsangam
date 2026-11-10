import { API_BASE_URL, apiRequest } from '@/services/api/client';

export function priceLabel(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(paise / 100);
}
export function parseRupees(value: string) {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value))
    throw new Error('Enter a valid INR price with up to two decimal places.');
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export async function downloadPdf(id: string) {
  let response = await fetch(
    `${API_BASE_URL}/store/${encodeURIComponent(id)}/file`,
    { credentials: 'include' }
  );
  if (response.status === 401) {
    await apiRequest('/users/me');
    response = await fetch(
      `${API_BASE_URL}/store/${encodeURIComponent(id)}/file`,
      { credentials: 'include' }
    );
  }
  if (!response.ok)
    throw new Error(
      'This PDF could not be downloaded. Check your access or try again later.'
    );
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'devsangam.pdf';
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
