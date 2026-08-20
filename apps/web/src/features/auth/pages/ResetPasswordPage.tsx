import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';

import { isApiError } from '@/services/api/client';

import { AUTH_EXPIRED_EVENT } from '../constants/auth.constants';

import { resetPassword } from '../api/auth.api';

import { AuthCard } from '../components/AuthCard';

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
    mutationFn: (password: string) => {
      if (!token) {
        throw new Error('Password reset link is invalid.');
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
      await mutation.mutateAsync(values.password);

      /*
       * Password reset revokes
       * all auth sessions.
       *
       * Keep frontend auth state
       * synchronized as well.
       */
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

      setCompleted(true);
    } catch (error) {
      if (isApiError(error)) {
        form.setError('root', {
          message: error.message,
        });

        return;
      }

      form.setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to reset your password.',
      });
    }
  }

  /*
   * Missing token
   */

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard
          title="Invalid Reset Link"
          description="This password reset link cannot be used"
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border
                border-red-500/20
                bg-red-500/[0.07]
              "
            >
              <KeyRound
                size={25}
                className="
                  text-red-400
                "
              />
            </div>

            <p
              className="
                mx-auto
                mt-5
                max-w-sm
                text-sm
                leading-6
                text-[#919aa8]
              "
            >
              The reset link is missing its security token or is not valid.
            </p>

            <Link
              to="/auth/forgot-password"
              className="
                mt-7
                inline-flex
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
              Request a New Link
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  /*
   * Successfully reset
   */

  if (completed) {
    return (
      <AuthLayout>
        <AuthCard
          title="Password Updated"
          description="Your DevSangam account is secure again"
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-emerald-500/20
                bg-emerald-500/[0.07]
                shadow-[0_0_30px_rgba(16,185,129,0.08)]
              "
            >
              <CheckCircle2
                size={29}
                className="
                  text-emerald-400
                "
              />
            </div>

            <p
              className="
                mx-auto
                mt-5
                max-w-sm
                text-sm
                leading-6
                text-[#919aa8]
              "
            >
              Your password has been changed successfully. Sign in again using
              your new password.
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
              <Sparkles size={16} />
              Continue to Sign In
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create New Password"
        description="Choose a secure new password for your account"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}

          <div>
            <label
              htmlFor="new-password"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[#e4e7ec]
              "
            >
              New Password
            </label>

            <div className="relative">
              <LockKeyhole
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

              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                placeholder="Minimum 10 characters"
                className="pl-11"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register('password')}
              />
            </div>

            {form.formState.errors.password && (
              <p
                className="
                  mt-2
                  text-xs
                  text-red-400
                "
              >
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <label
              htmlFor="confirm-new-password"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[#e4e7ec]
              "
            >
              Confirm Password
            </label>

            <div className="relative">
              <LockKeyhole
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

              <PasswordInput
                id="confirm-new-password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                className="pl-11"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                {...form.register('confirmPassword')}
              />
            </div>

            {form.formState.errors.confirmPassword && (
              <p
                className="
                  mt-2
                  text-xs
                  text-red-400
                "
              >
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API Error */}

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

          {/* Reset button */}

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
                Updating Password...
              </>
            ) : (
              <>
                <KeyRound size={16} />
                Reset Password
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
      </AuthCard>
    </AuthLayout>
  );
}
