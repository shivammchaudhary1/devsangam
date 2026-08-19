import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { resetPassword } from '../api/auth.api';

import { AuthLayout } from '../components/AuthLayout';

import { PasswordInput } from '../components/PasswordInput';

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/reset-password.schema';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [completed, setCompleted] = useState(false);

  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      password: '',

      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: ({ password }: { password: string }) => {
      if (!token) {
        throw new Error('Missing reset token.');
      }

      return resetPassword(token, password);
    },
  });

  async function onSubmit(values: ResetPasswordFormData) {
    form.clearErrors('root');

    if (!token) {
      form.setError('root', {
        message: 'This password reset link is invalid.',
      });

      return;
    }

    try {
      await mutation.mutateAsync({
        password: values.password,
      });

      setCompleted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to reset password.';

      form.setError('root', {
        message,
      });
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div
          className="
            rounded-3xl
            border
            border-border
            bg-card/85
            p-8
            text-center
          "
        >
          <KeyRound
            className="
              mx-auto
              mb-5
              text-red-400
            "
            size={32}
          />

          <h1
            className="
              font-display
              text-2xl
            "
          >
            Invalid Reset Link
          </h1>

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            This password reset link is missing its security token.
          </p>

          <Link
            to="/auth/forgot-password"
            className="
              mt-6
              inline-block
              text-sm
              text-amber-400
            "
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (completed) {
    return (
      <AuthLayout>
        <div
          className="
            rounded-3xl
            border
            border-border
            bg-card/85
            p-8
            text-center
          "
        >
          <CheckCircle2
            className="
              mx-auto
              mb-5
              text-emerald-400
            "
            size={38}
          />

          <h1
            className="
              font-display
              text-2xl
            "
          >
            Password Updated
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Your password has been changed successfully.
          </p>

          <Button
            type="button"
            onClick={() =>
              navigate('/auth/login', {
                replace: true,
              })
            }
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
            Continue to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
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
            <KeyRound size={24} />
          </div>

          <h1
            className="
              font-display
              text-3xl
            "
          >
            Create New Password
          </h1>

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
            "
          >
            Choose a secure new password for your DevSangam account.
          </p>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>

              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                placeholder="Minimum 10 characters"
                className="h-12"
                {...form.register('password')}
              />

              {form.formState.errors.password && (
                <FieldError errors={[form.formState.errors.password]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-new-password">
                Confirm Password
              </FieldLabel>

              <PasswordInput
                id="confirm-new-password"
                autoComplete="new-password"
                placeholder="Repeat your new password"
                className="h-12"
                {...form.register('confirmPassword')}
              />

              {form.formState.errors.confirmPassword && (
                <FieldError errors={[form.formState.errors.confirmPassword]} />
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
                Updating...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
