'use client';

import { PublicPageShell } from '../components/PublicPageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/services/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Use at most 80 characters.'),
  email: z
    .email('Enter a valid email address.')
    .max(254, 'Use at most 254 characters.'),
  category: z.enum(['general', 'account', 'practice', 'feedback']),
  message: z
    .string()
    .trim()
    .min(10, 'Enter at least 10 characters.')
    .max(2000, 'Use at most 2000 characters.'),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', category: 'general', message: '' },
  });

  return (
    <PublicPageShell
      title="Contact"
      intro="Questions about DevSangam or feedback on your practice experience? We would like to hear from you."
    >
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <aside className="leading-8 text-muted-foreground">
          <h2 className="text-xl text-foreground">Get in touch</h2>
          <p className="mt-4">
            Email{' '}
            <a
              className="break-all underline underline-offset-4"
              href="mailto:contact@devsangam.me"
            >
              contact@devsangam.me
            </a>
            .
          </p>
          <p className="mt-4" id="contact-availability">
            Send a message below, or use email if the form is unavailable.
          </p>
          <p className="mt-4">
            Please do not include passwords, payment details or other sensitive
            information.
          </p>
        </aside>
        <form
          noValidate
          aria-describedby="contact-availability"
          onSubmit={handleSubmit(async (values) => {
            setSending(true);
            setFeedback('');
            try {
              const website =
                (document.getElementById('contact-website') as HTMLInputElement)
                  ?.value ?? '';
              await apiRequest('/contact', {
                method: 'POST',
                skipAuthRefresh: true,
                body: JSON.stringify({ ...values, website }),
              });
              setFeedback(
                'Your message has been received. Thank you for contacting DevSangam.'
              );
              reset();
            } catch {
              setFeedback(
                'Your message could not be sent. Please try again later or email contact@devsangam.me.'
              );
            } finally {
              setSending(false);
            }
          })}
          className="ds-panel space-y-5 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="contact-name" className="mb-2 block">
              Name
            </label>
            <Input
              id="contact-name"
              autoComplete="name"
              maxLength={80}
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p
                id="contact-name-error"
                className="mt-2 text-destructive"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block">
              Email
            </label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'contact-email-error' : undefined
              }
              {...register('email')}
            />
            {errors.email && (
              <p
                id="contact-email-error"
                className="mt-2 text-destructive"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contact-category" className="mb-2 block">
              Subject / category
            </label>
            <select
              id="contact-category"
              {...register('category')}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? 'contact-category-error' : undefined
              }
              className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground"
            >
              <option value="general">General question</option>
              <option value="account">Account help</option>
              <option value="practice">Practice help</option>
              <option value="feedback">Feedback</option>
            </select>
            {errors.category && (
              <p
                id="contact-category-error"
                className="mt-2 text-destructive"
                role="alert"
              >
                Choose a valid category.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-2 block">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={6}
              maxLength={2000}
              required
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message
                  ? 'contact-message-error'
                  : 'contact-message-hint'
              }
              {...register('message')}
              className="w-full resize-y rounded-lg border border-input bg-background p-3 text-foreground"
            />
            <p
              id="contact-message-hint"
              className="mt-2 text-xs text-muted-foreground"
            >
              10–2,000 characters.
            </p>
            {errors.message && (
              <p
                id="contact-message-error"
                className="mt-2 text-destructive"
                role="alert"
              >
                {errors.message.message}
              </p>
            )}
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" tabIndex={-1} autoComplete="off" />
          </div>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
          {feedback && (
            <p
              role="status"
              className="rounded-lg border border-border p-4 leading-7"
            >
              {feedback}
            </p>
          )}
        </form>
      </div>
    </PublicPageShell>
  );
}
