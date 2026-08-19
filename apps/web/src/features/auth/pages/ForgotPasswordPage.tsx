import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';

import { forgotPassword } from '../api/auth.api';

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
      <div
        className="
          rounded-3xl
          border
          border-border
          bg-card/85
          p-6
          shadow-2xl
          shadow-black/30
          backdrop-blur
          sm:p-8
        "
      >
        <header
          className="
            mb-8
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-amber-500/30
              bg-amber-500/10
              text-amber-400
            "
          >
            <Mail size={24} />
          </div>

          <h1
            className="
              font-display
              text-3xl
            "
          >
            Reset Password
          </h1>

          <div
            className="
              mx-auto
              my-4
              h-px
              w-20
              bg-gradient-to-r
              from-transparent
              via-amber-500
              to-transparent
            "
          />

          <p
            className="
              mx-auto
              max-w-sm
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </header>

        {successMessage ? (
          <div>
            <div
              className="
                rounded-2xl
                border
                border-emerald-500/30
                bg-emerald-500/10
                p-5
              "
            >
              <CheckCircle2
                className="
                  mb-3
                  text-emerald-400
                "
              />

              <p
                className="
                  text-sm
                  leading-6
                  text-emerald-200
                "
              >
                {successMessage}
              </p>
            </div>

            <p
              className="
                mt-4
                text-center
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              Development mode: check the API terminal for the password reset
              URL if this account exists.
            </p>

            <Link
              to="/auth/login"
              className="
                mt-7
                flex
                items-center
                justify-center
                gap-2
                text-sm
                text-amber-400
                hover:text-amber-300
              "
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="forgot-email">Email</FieldLabel>

                  <div
                    className="
                      relative
                    "
                  >
                    <Mail
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-muted-foreground
                      "
                    />

                    <Input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="
                        h-12
                        pl-10
                      "
                      {...form.register('email')}
                    />
                  </div>

                  {form.formState.errors.email && (
                    <FieldError errors={[form.formState.errors.email]} />
                  )}
                </Field>
              </FieldGroup>

              {form.formState.errors.root && (
                <div
                  role="alert"
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-red-500/30
                    bg-red-500/10
                    px-4
                    py-3
                    text-sm
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
                  mt-7
                  h-12
                  w-full
                  bg-gradient-to-r
                  from-amber-500
                  to-[#d4af37]
                  font-semibold
                  text-[#0c0d12]
                "
              >
                {mutation.isPending ? (
                  <>
                    <Loader2
                      className="
                        animate-spin
                      "
                    />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
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
                text-sm
                text-muted-foreground
                hover:text-amber-400
              "
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
