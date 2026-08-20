import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { forgotPassword } from '../api/auth.api';

import { AuthCard } from '../components/AuthCard';

import { AuthLayout } from '../components/AuthLayout';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgot-password.schema';

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),

    defaultValues: {
      email: '',
    },
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    form.clearErrors('root');

    setSuccessMessage(null);

    try {
      const response = await mutation.mutateAsync(values.email);

      setSuccessMessage(response.data.message);
    } catch {
      form.setError('root', {
        message: 'Unable to process your request. Please try again.',
      });
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        description="Enter your email and we'll help you return to your practice"
      >
        {successMessage ? (
          <div>
            <div
              className="
                rounded-xl
                border
                border-emerald-500/25
                bg-emerald-500/[0.07]
                px-5
                py-5
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                "
              >
                <CheckCircle2
                  size={22}
                  className="
                    text-emerald-400
                  "
                />
              </div>

              <h2
                className="
                  text-sm
                  font-semibold
                  text-emerald-200
                "
              >
                Check your email
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#9ca5b2]
                "
              >
                {successMessage}
              </p>
            </div>

            {import.meta.env.DEV && (
              <p
                className="
                  mt-4
                  text-center
                  text-[11px]
                  leading-5
                  text-[#697280]
                "
              >
                Development mode: check the API terminal for the generated reset
                URL.
              </p>
            )}

            <Link
              to="/auth/login"
              className="
                mt-7
                flex
                h-[48px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-[#343b49]
                bg-[#0d1118]
                text-sm
                font-medium
                text-[#d2d7df]
                transition
                hover:border-[#4b5565]
                hover:bg-[#121721]
              "
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="
                    mb-2
                    block
                    text-[13px]
                    font-medium
                    text-[#e4e7ec]
                  "
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      z-10
                      -translate-y-1/2
                      text-[#788396]
                    "
                  />

                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    className="
                      h-[50px]
                      rounded-lg
                      border-[#343b49]
                      bg-[#0d1118]
                      pl-11
                      text-[#f8fafc]
                      placeholder:text-[#657080]
                      hover:border-[#454e5d]
                      focus-visible:border-[#c99836]/80
                      focus-visible:ring-[3px]
                      focus-visible:ring-amber-500/[0.08]
                    "
                    {...form.register('email')}
                  />
                </div>

                {form.formState.errors.email && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-red-400
                    "
                  >
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {form.formState.errors.root && (
                <div
                  role="alert"
                  className="
                    rounded-lg
                    border
                    border-red-500/25
                    bg-red-500/[0.07]
                    px-4
                    py-3
                    text-xs
                    text-red-300
                  "
                >
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="
                  h-[52px]
                  w-full
                  rounded-lg
                  border
                  border-[#ffd06b]
                  bg-gradient-to-b
                  from-[#fac360]
                  via-[#efa83a]
                  to-[#db8d1c]
                  text-[15px]
                  font-semibold
                  text-[#211504]
                  shadow-[0_0_26px_rgba(245,158,11,0.34)]
                  transition-all
                  duration-200
                  hover:brightness-105
                  hover:shadow-[0_0_36px_rgba(245,158,11,0.46)]
                "
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Reset Instructions
                  </>
                )}
              </Button>
            </form>

            <Link
              to="/auth/login"
              className="
                mt-7
                flex
                items-center
                justify-center
                gap-2
                text-xs
                font-medium
                text-[#8d95a2]
                transition
                hover:text-[#e8b647]
              "
            >
              <ArrowLeft size={15} />
              Back to Sign In
            </Link>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
