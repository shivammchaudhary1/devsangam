import { PublicPageShell } from './PublicPageShell';
import { Link } from 'react-router';

type PolicySection = { title: string; text: string };

export function PolicyDraft({
  title,
  sections,
}: {
  title: string;
  sections: PolicySection[];
}) {
  return (
    <PublicPageShell
      title={title}
      intro="Product legal copy — draft pending professional legal review. This text has not been finalized."
    >
      <div className="max-w-3xl space-y-8">
        <p className="rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-5 leading-7">
          Last updated: 3 October 2026. Future payment and digital-purchase
          features described here are not yet available. This draft does not
          claim verified legal compliance or certification.
        </p>
        {sections.map(({ title: sectionTitle, text }) => (
          <section key={sectionTitle}>
            <h2 className="text-xl">{sectionTitle}</h2>
            <p className="mt-3 leading-8 text-muted-foreground">{text}</p>
          </section>
        ))}
        <section>
          <h2 className="text-xl">Contact and requests</h2>
          <p className="mt-3 leading-8 text-muted-foreground">
            For questions or account-data deletion requests, email{' '}
            <a
              className="break-all underline"
              href="mailto:contact@devsangam.me"
            >
              contact@devsangam.me
            </a>
            . We may need to verify account ownership before acting. You can
            also visit our{' '}
            <Link className="underline" to="/contact">
              Contact page
            </Link>
            . The web contact form is not yet connected.
          </p>
        </section>
      </div>
    </PublicPageShell>
  );
}
