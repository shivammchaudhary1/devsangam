import { PublicLayout } from '@/features/public-site/components/PublicLayout';
import { PublicPageShell } from '@/features/public-site/components/PublicPageShell';
import { Link } from '@/lib/navigation';
export default function NotFound() {
  return (
    <PublicLayout>
      <PublicPageShell title="Page unavailable" intro="The requested page could not be found.">
        <Link to="/" className="ds-gold-button inline-flex px-5 py-3">
          Return to DevSangam
        </Link>
      </PublicPageShell>
    </PublicLayout>
  );
}
