import { PolicyDraft } from '../components/PolicyDraft';

const SECTIONS = [
  {
    title: 'Account and profile data',
    text: 'DevSangam uses your name, email, hashed password, optional biography, spiritual intention, avatar and preferences to provide your account and personalize your experience. Profile images use Cloudinary storage. We do not need your password in a contact message.',
  },
  {
    title: 'Authentication and sessions',
    text: 'HTTP-only cookies carry authentication tokens. Server session records include expiry, activity and, when available, user-agent and IP information. Password-reset requests use expiring tokens and email delivery. These support sign-in, session refresh, logout and account security.',
  },
  {
    title: 'Practice and history',
    text: 'Your mantra favorites, practice sessions, counts, duration, completion states, history and streak-related information support dashboard and insights features. These records are associated with your account.',
  },
  {
    title: 'Device notifications',
    text: 'When you choose to enable push notifications, browser subscription information is stored to deliver notifications. Reminder preferences, local time and timezone support daily reminders. You can disable notifications through Settings and browser controls.',
  },
  {
    title: 'Cookies and local browser storage',
    text: 'Authentication uses cookies. Browser storage keeps theme preferences and a last-known account snapshot for offline continuity. IndexedDB through Dexie stores local practice sessions for later synchronization. Service-worker caches support PWA assets, images and previously loaded mantra content. Clearing local storage can remove unsynced practice data.',
  },
  {
    title: 'Contact messages',
    text: 'The contact form collects your name, email, category and message. After server validation, messages are stored for authorized administrators to review. Emailing us also provides the details and message you send. Do not include passwords or sensitive payment information.',
  },
  {
    title: 'Payments and purchases',
    text: 'When payments are enabled, Razorpay processes checkout. DevSangam stores order identifiers, prices, verified payment status and purchased-access records to fulfill digital orders. Card details are handled by Razorpay rather than stored by DevSangam. Private PDF storage uses Azure Blob Storage; download access is checked by the server. Paid files are not stored in the PWA offline cache.',
  },
  {
    title: 'Service providers',
    text: 'The platform uses or is intended to deploy through Cloudflare Pages, Azure App Service, Azure Blob Storage and MongoDB, with Zoho email, Cloudinary profile media storage, Razorpay payments and browser push services. These providers may process information needed to operate their part of the service. Provider-specific practices and deployment details require review before this policy is finalized.',
  },
  {
    title: 'Data handling and your choices',
    text: 'Account and practice information is used to operate and support DevSangam. You can update profile preferences, control device notification permission and request account-data deletion by email. Retention periods, deletion handling, processor details and applicable rights must be finalized through professional review; this draft does not promise a specific deletion timeframe.',
  },
];

export function PrivacyPolicyPage() {
  return <PolicyDraft title="Privacy Policy" sections={SECTIONS} />;
}
