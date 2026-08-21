import { connectDatabase } from '../config/database.ts';
import { MantraModel } from '../models/mantra.model.ts';

const mantras = [
  {
    slug: 'mahamrityunjaya-mantra',
    title: 'Mahamrityunjaya Mantra',
    sanskrit:
      'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥',
    transliteration:
      'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning:
      'A prayer to Lord Shiva for liberation from fear, suffering, and mortality, seeking spiritual strength and well-being.',
    description:
      'The Mahamrityunjaya Mantra is traditionally associated with Lord Shiva and is commonly chanted for healing, protection, inner strength, and spiritual upliftment.',
    benefits: [
      'Supports inner calm',
      'Encourages courage and resilience',
      'Traditionally associated with healing',
      'Supports devotional practice',
    ],
    categories: ['Healing', 'Protection', 'Devotion'],
    deity: 'Shiva',
    image: null,
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 6,
    isPublished: true,
  },

  {
    slug: 'gayatri-mantra',
    title: 'Gayatri Mantra',
    sanskrit:
      'ॐ भूर् भुवः स्वः । तत्सवितुर्वरेण्यं । भर्गो देवस्य धीमहि । धियो यो नः प्रचोदयात् ॥',
    transliteration:
      'Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat',
    meaning:
      'A prayer for illumination of the intellect and guidance toward wisdom and truth.',
    description:
      'The Gayatri Mantra is a widely revered Vedic mantra traditionally used for contemplation, clarity, wisdom, and spiritual illumination.',
    benefits: [
      'Supports focus and clarity',
      'Encourages contemplation',
      'Traditionally associated with wisdom',
      'Supports disciplined daily practice',
    ],
    categories: ['Focus', 'Wisdom', 'Peace'],
    deity: 'Savitr',
    image: null,
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 5,
    isPublished: true,
  },

  {
    slug: 'hare-krishna-mahamantra',
    title: 'Hare Krishna Mahamantra',
    sanskrit:
      'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥',
    transliteration:
      'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare',
    meaning:
      'A devotional mantra invoking the divine names of Krishna and Rama.',
    description:
      'The Hare Krishna Mahamantra is a devotional mantra centered on remembrance of the divine through repetition of sacred names.',
    benefits: [
      'Supports devotional focus',
      'Encourages repetition and remembrance',
      'Promotes a calm chanting rhythm',
      'Suitable for regular daily practice',
    ],
    categories: ['Devotion', 'Peace'],
    deity: 'Krishna and Rama',
    image: null,
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 4,
    isPublished: true,
  },

  {
    slug: 'om-namah-shivaya',
    title: 'Om Namah Shivaya',
    sanskrit: 'ॐ नमः शिवाय',
    transliteration: 'Om Namah Shivaya',
    meaning:
      'A devotional salutation to Shiva, often understood as an inward bow to the divine consciousness.',
    description:
      'Om Namah Shivaya is a concise Shiva mantra commonly used for meditation, devotion, inner stillness, and disciplined repetition.',
    benefits: [
      'Supports calm and concentration',
      'Encourages devotional awareness',
      'Suitable for meditation',
      'Easy to use for longer chanting sessions',
    ],
    categories: ['Devotion', 'Peace', 'Focus'],
    deity: 'Shiva',
    image: null,
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },
];

async function seedMantras() {
  try {
    await connectDatabase();

    for (const mantra of mantras) {
      await MantraModel.findOneAndUpdate(
        { slug: mantra.slug },
        {
          $set: mantra,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✓ Seeded: ${mantra.title}`);
    }

    console.log('✓ Mantra seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed mantras:', error);
    process.exit(1);
  }
}

void seedMantras();
