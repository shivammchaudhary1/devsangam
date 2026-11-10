export type DigitalProduct = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string | null;
  assetType: 'pdf';
  accessType: 'free' | 'paid';
  pricePaise: number;
  currency: 'INR';
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CommerceOrder = {
  _id: string;
  title: string;
  userId: string;
  itemType: 'mantra' | 'digital_product';
  itemId: string;
  amountPaise: number;
  currency: 'INR';
  status: 'created' | 'payment_pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  paidAt: string | null;
  refundedPaise: number;
};
export type OwnedItem = {
  id: string;
  type: 'mantra' | 'digital_product';
  title: string;
  slug: string | null;
  purchasedAt: string;
  available: boolean;
};
export type ApiResult<T> = { success: true; data: T };
export type PagedItems<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
