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
      'The Mahamrityunjaya Mantra is one of the most revered mantras dedicated to Lord Shiva. It is traditionally chanted for protection, healing, courage, inner strength, and spiritual upliftment.',
    benefits: [
      'Supports inner calm and emotional steadiness',
      'Encourages courage and resilience',
      'Traditionally associated with healing and protection',
      'Supports meditation and devotional practice',
    ],
    categories: ['Healing', 'Protection', 'Devotion'],
    deity: 'Shiva',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788288951/shiva-mahamrityunjaya.webp',
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
      'A prayer for illumination of the intellect and guidance toward wisdom, clarity, and truth.',
    description:
      'The Gayatri Mantra is a highly revered Vedic mantra associated with Savitr, the divine solar principle. It is traditionally recited for wisdom, clarity, spiritual illumination, and refinement of the intellect.',
    benefits: [
      'Supports focus and clarity',
      'Encourages contemplation and self-reflection',
      'Traditionally associated with wisdom and illumination',
      'Supports disciplined daily spiritual practice',
    ],
    categories: ['Focus', 'Wisdom', 'Peace'],
    deity: 'Savitr',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788288722/gayatri.webp',
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
      'A devotional mantra invoking the sacred names of Krishna and Rama through repeated remembrance.',
    description:
      'The Hare Krishna Mahamantra is a devotional mantra centered on remembrance of the divine through repetition of the sacred names of Krishna and Rama. It is commonly practiced through japa and congregational chanting.',
    benefits: [
      'Supports devotional concentration',
      'Encourages remembrance and repetition',
      'Promotes a calm and rhythmic chanting practice',
      'Suitable for regular daily japa',
    ],
    categories: ['Devotion', 'Peace'],
    deity: 'Krishna and Rama',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788288949/krishna-hare-krishna.webp',
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
      'A devotional salutation to Lord Shiva and an inward bow to divine consciousness.',
    description:
      'Om Namah Shivaya is one of the most widely practiced Shiva mantras. Its concise form makes it especially suitable for meditation, japa, inner stillness, and extended chanting sessions.',
    benefits: [
      'Supports calm and concentration',
      'Encourages devotional awareness',
      'Suitable for meditation and japa',
      'Easy to use for longer chanting sessions',
    ],
    categories: ['Devotion', 'Peace', 'Focus'],
    deity: 'Shiva',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788288951/shiva-om-namah-shivaya.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },

  {
    slug: 'shukra-beej-mantra',
    title: 'Shukra Beej Mantra',
    sanskrit: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    transliteration: 'Om Draam Dreem Draum Sah Shukraya Namah',
    meaning:
      'A traditional seed mantra dedicated to Shukra, associated with harmony, refinement, beauty, relationships, creativity, and material well-being.',
    description:
      'The Shukra Beej Mantra is traditionally used in Navagraha worship for Shukra, the planetary deity associated with beauty, refinement, relationships, artistic expression, comforts, and balanced enjoyment of worldly life.',
    benefits: [
      'Encourages harmony and balanced relationships',
      'Supports calm and refined intention',
      'Traditionally associated with creativity and beauty',
      'Supports focused Navagraha devotional practice',
    ],
    categories: ['Peace', 'Focus', 'Devotion'],
    deity: 'Shukra',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289452/shukra-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'kamadeva-mantra',
    title: 'Kamadeva Mantra',
    sanskrit: 'ॐ क्लीं कामदेवाय नमः',
    transliteration: 'Om Kleem Kamadevaya Namah',
    meaning:
      'A devotional mantra dedicated to Kamadeva, traditionally associated with love, affection, attraction, beauty, and harmonious relationships.',
    description:
      'This mantra invokes Kamadeva in a respectful devotional form. Kamadeva is traditionally associated with love, affection, beauty, emotional connection, and harmonious relationships.',
    benefits: [
      'Encourages loving and respectful intention',
      'Supports emotional reflection and harmony',
      'Traditionally associated with affection and attraction',
      'Suitable for focused devotional repetition',
    ],
    categories: ['Peace', 'Devotion', 'Focus'],
    deity: 'Kamadeva',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/kam-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },

  {
    slug: 'budha-beej-mantra',
    title: 'Budha Beej Mantra',
    sanskrit: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    transliteration: 'Om Braam Breem Braum Sah Budhaya Namah',
    meaning:
      'A traditional Navagraha seed mantra dedicated to Budha, associated with intellect, communication, learning, analysis, and discernment.',
    description:
      'The Budha Beej Mantra is traditionally recited in worship of Budha, the planetary deity associated with intelligence, speech, communication, memory, learning, reasoning, and adaptability.',
    benefits: [
      'Supports focus and disciplined study',
      'Encourages clear communication and reflection',
      'Traditionally associated with intellect and learning',
      'Supports concentrated mantra practice',
    ],
    categories: ['Focus', 'Wisdom', 'Devotion'],
    deity: 'Budha',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/budh-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'guru-beej-mantra',
    title: 'Guru Beej Mantra',
    sanskrit: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    transliteration: 'Om Graam Greem Graum Sah Gurave Namah',
    meaning:
      'A traditional seed mantra dedicated to Guru or Brihaspati, associated with wisdom, guidance, learning, spiritual knowledge, and discernment.',
    description:
      'The Guru Beej Mantra is traditionally used in worship of Brihaspati, the planetary teacher and guru. It is associated with wisdom, higher learning, guidance, spiritual understanding, and thoughtful decision-making.',
    benefits: [
      'Supports contemplation and wisdom',
      'Encourages disciplined learning',
      'Traditionally associated with guidance and knowledge',
      'Supports focused spiritual practice',
    ],
    categories: ['Wisdom', 'Focus', 'Devotion'],
    deity: 'Brihaspati',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289452/guru-mantra.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'shani-mantra',
    title: 'Shani Mantra',
    sanskrit: 'ॐ शं शनैश्चराय नमः',
    transliteration: 'Om Sham Shanaishcharaya Namah',
    meaning:
      'A traditional salutation to Shani, associated with discipline, patience, responsibility, endurance, justice, and reflection on karma.',
    description:
      'This concise Shani mantra is traditionally used in worship of Shani Deva. Shani is associated with discipline, patience, responsibility, perseverance, justice, and the consequences of one’s actions.',
    benefits: [
      'Encourages patience and discipline',
      'Supports steadiness and perseverance',
      'Traditionally associated with Shani worship',
      'Encourages responsibility and reflective awareness',
    ],
    categories: ['Focus', 'Protection', 'Devotion'],
    deity: 'Shani',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/shani-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },

  {
    slug: 'rahu-beej-mantra',
    title: 'Rahu Beej Mantra',
    sanskrit: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    transliteration: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
    meaning:
      'A traditional Navagraha seed mantra dedicated to Rahu, associated with awareness, transformation, uncertainty, ambition, and disciplined reflection.',
    description:
      'The Rahu Beej Mantra is traditionally recited in Rahu worship as part of Navagraha practice. Rahu is commonly associated with intense desire, unconventional experiences, change, uncertainty, and transformation.',
    benefits: [
      'Supports focused repetition during uncertainty',
      'Encourages steadiness and self-awareness',
      'Traditionally associated with Rahu worship',
      'Supports reflective and disciplined practice',
    ],
    categories: ['Focus', 'Protection', 'Devotion'],
    deity: 'Rahu',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/rahu.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'mangala-beej-mantra',
    title: 'Mangala Beej Mantra',
    sanskrit: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    transliteration: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
    meaning:
      'A traditional Navagraha seed mantra dedicated to Mangala or Bhauma, associated with courage, vitality, discipline, determination, and purposeful action.',
    description:
      'The Mangala Beej Mantra is traditionally used in worship of Mangala, the planetary deity associated with Mars. Mangala represents courage, energy, determination, strength, discipline, and decisive action.',
    benefits: [
      'Encourages courage and determination',
      'Supports disciplined and purposeful action',
      'Traditionally associated with strength and vitality',
      'Supports focused devotional repetition',
    ],
    categories: ['Focus', 'Protection', 'Devotion'],
    deity: 'Mangala',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/mangal-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'soma-mantra',
    title: 'Soma Beej Mantra',
    sanskrit: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः',
    transliteration: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
    meaning:
      'A traditional Navagraha seed mantra dedicated to Chandra or Soma, associated with calmness, emotional balance, reflection, intuition, and the mind.',
    description:
      'The Soma or Chandra Beej Mantra is traditionally recited in worship of the Moon deity. Chandra is associated with the mind, emotions, reflection, intuition, calmness, and the cooling qualities of lunar energy.',
    benefits: [
      'Supports calm and reflective practice',
      'Encourages emotional steadiness',
      'Traditionally associated with Chandra worship',
      'Suitable for gentle meditative repetition',
    ],
    categories: ['Peace', 'Focus', 'Devotion'],
    deity: 'Chandra',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289453/chandra-dev.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 3,
    isPublished: true,
  },

  {
    slug: 'ganapati-mantra',
    title: 'Ganapati Mantra',
    sanskrit: 'ॐ गं गणपतये नमः',
    transliteration: 'Om Gam Ganapataye Namah',
    meaning:
      'A devotional salutation to Lord Ganesha, traditionally invoked for wisdom, auspicious beginnings, clarity, and the removal of obstacles.',
    description:
      'Om Gam Ganapataye Namah is a widely practiced mantra dedicated to Lord Ganesha. Ganesha is traditionally invoked before beginning important work, spiritual practice, study, travel, or new undertakings.',
    benefits: [
      'Supports focused and auspicious beginnings',
      'Encourages devotional concentration',
      'Traditionally associated with removing obstacles',
      'Suitable for daily japa and meditation',
    ],
    categories: ['Devotion', 'Focus', 'Wisdom'],
    deity: 'Ganesha',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289452/lord-ganesha.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },

  {
    slug: 'mahalakshmi-mantra',
    title: 'Mahalakshmi Mantra',
    sanskrit: 'ॐ श्रीं महालक्ष्म्यै नमः',
    transliteration: 'Om Shreem Mahalakshmyai Namah',
    meaning:
      'A devotional salutation to Goddess Mahalakshmi, traditionally associated with auspiciousness, abundance, prosperity, grace, harmony, and well-being.',
    description:
      'This Mahalakshmi mantra is a concise devotional invocation of Goddess Lakshmi. Mahalakshmi is traditionally associated with prosperity, auspiciousness, abundance, generosity, beauty, harmony, and well-being.',
    benefits: [
      'Encourages gratitude and auspicious intention',
      'Supports devotional concentration',
      'Traditionally associated with abundance and prosperity',
      'Suitable for calm daily repetition',
    ],
    categories: ['Devotion', 'Peace', 'Wisdom'],
    deity: 'Mahalakshmi',
    image:
      'https://res.cloudinary.com/rg2kgsna/image/upload/v1788289452/laxmi-maa.webp',
    defaultTargets: [108, 216, 1008],
    estimatedSecondsPerChant: 2,
    isPublished: true,
  },
];

async function seedMantras() {
  try {
    await connectDatabase();

    console.log(`Seeding ${mantras.length} mantras...`);

    for (const mantra of mantras) {
      await MantraModel.findOneAndUpdate(
        {
          slug: mantra.slug,
        },
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

    console.log('');
    console.log(`✓ Mantra seed completed`);
    console.log(`✓ Total mantras: ${mantras.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed mantras:', error);

    process.exit(1);
  }
}

void seedMantras();
