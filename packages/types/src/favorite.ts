import type { Mantra } from './mantra.js';

export type FavoriteMantrasResponse = {
  success: true;

  data: {
    mantras: Mantra[];
  };
};

export type FavoriteMutationResponse = {
  success: true;

  data: {
    mantraId: string;
    slug: string;
    isFavorite: boolean;
  };
};
