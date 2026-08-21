export type Mantra = {
  _id: string;
  slug: string;
  title: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  description: string | null;
  benefits: string[];
  categories: string[];
  deity: string | null;
  image: string | null;
  defaultTargets: number[];
  estimatedSecondsPerChant: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MantraListResponse = {
  success: true;
  data: {
    mantras: Mantra[];
  };
};

export type MantraDetailResponse = {
  success: true;
  data: {
    mantra: Mantra;
  };
};
