import { PolicyDraft } from '../components/PolicyDraft';

const SECTIONS = [
  {
    title: 'Using DevSangam',
    text: 'DevSangam provides tools for personal devotional practice and reflection. It does not promise health, financial or spiritual outcomes. These product terms are a draft for review, not finalized legal text.',
  },
  {
    title: 'Account responsibility',
    text: 'Use accurate account information and keep your sign-in credentials secure. Do not share passwords or use another person’s account without permission. Contact us if you suspect unauthorized access.',
  },
  {
    title: 'Permitted use',
    text: 'Use the service respectfully for its intended purpose. Do not attempt unauthorized access, bypass security or paid-content controls, disrupt the service, automate abuse, or upload content you do not have the right to use.',
  },
  {
    title: 'Digital purchases and payments',
    text: 'Published digital products disclose their price and whether access is free or paid. When purchases are enabled, Razorpay processes payment. Paid access depends on a verified captured payment and server authorization. A pending or failed checkout does not establish access. Contact support about payment or delivery problems.',
  },
  {
    title: 'Access and digital-content license',
    text: 'Purchased items are intended for personal use under the terms shown with the product. Purchase does not transfer ownership of underlying intellectual property. Do not redistribute paid files or bypass access controls. Specific license duration, permitted downloads and product conditions require finalization before sales begin.',
  },
  {
    title: 'Refund policy — pending business policy',
    text: 'The digital-purchase refund and cancellation policy has not been finalized. No refund promise is made here. The approved policy must be published and available before purchases are enabled, subject to applicable requirements.',
  },
  {
    title: 'Intellectual property',
    text: 'Respect rights in application code, branding, artwork and digital materials. The repository’s MIT license governs code covered by it; do not assume every third-party asset or future digital product has the same license. Rights and permissions for product materials must be stated separately.',
  },
  {
    title: 'Availability and local data',
    text: 'Connectivity, browser support, hosting and maintenance can affect availability. Offline continuation depends on prepared sessions and browser storage. Clearing local data before synchronization can lose pending practice updates. DevSangam does not promise uninterrupted access.',
  },
  {
    title: 'Liability disclaimer — pending review',
    text: 'DevSangam is a practice companion and is not a substitute for professional advice. Any final warranty exclusions or limitations of liability must be reviewed for applicable law; this draft does not remove rights that cannot lawfully be excluded.',
  },
  {
    title: 'Account restriction or termination',
    text: 'Abuse, unauthorized access or misuse may require account restriction or termination. The review process, notice terms and handling of future purchased access must be finalized before commerce launches. Contact us about account concerns.',
  },
  {
    title: 'Changes to these terms',
    text: 'As features and business policies develop, these drafts may change. Material changes and final effective terms should be communicated before they govern use or digital purchases.',
  },
];

export function TermsPage() {
  return <PolicyDraft title="Terms & Conditions" sections={SECTIONS} />;
}
