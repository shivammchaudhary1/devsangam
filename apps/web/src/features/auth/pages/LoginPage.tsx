import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { Loader2, LockKeyhole, Mail } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';

import { useAuth } from '../hooks/useAuth';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';

import { isApiError } from '@/services/api/client';

import { loginUser } from '../api/auth.api';

import { AuthLayout } from '../components/AuthLayout';

import { PasswordInput } from '../components/PasswordInput';

import { loginSchema, type LoginFormData } from '../schemas/login.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
  });

  async function onSubmit(values: LoginFormData) {
    form.clearErrors('root');

    try {
      const response = await loginMutation.mutateAsync(values);

      auth.setUser(response.data.user);

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      if (isApiError(error)) {
        form.setError('root', {
          message: error.message,
        });

        return;
      }

      form.setError('root', {
        message: 'Unable to sign in. Please try again.',
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
          <h1
            className="
              font-display
              text-3xl
              text-foreground
            "
          >
            Welcome Back
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
              text-sm
              text-muted-foreground
            "
          >
            Sign in to continue your practice
          </p>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>

              <div className="relative">
                <Mail
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                  "
                  size={17}
                />

                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="
                    h-12
                    pl-10
                  "
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register('email')}
                />
              </div>

              {form.formState.errors.email && (
                <FieldError errors={[form.formState.errors.email]} />
              )}
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <div
                className="
    flex
    items-center
    justify-between
    gap-4
  "
              >
                <FieldLabel htmlFor="login-password">Password</FieldLabel>

                <Link
                  to="/auth/forgot-password"
                  className="
      text-xs
      font-medium
      text-amber-400
      transition
      hover:text-amber-300
    "
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-muted-foreground
                  "
                  size={17}
                />

                <PasswordInput
                  id="login-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="
                    h-12
                    pl-10
                  "
                  aria-invalid={Boolean(form.formState.errors.password)}
                  {...form.register('password')}
                />
              </div>

              {form.formState.errors.password && (
                <FieldError errors={[form.formState.errors.password]} />
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
            disabled={loginMutation.isPending}
            className="
              mt-7
              h-12
              w-full
              bg-gradient-to-r
              from-amber-500
              to-[#d4af37]
              font-semibold
              text-[#0c0d12]
              shadow-[0_0_25px_rgba(245,158,11,0.2)]
              hover:opacity-95
            "
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p
          className="
            mt-7
            text-center
            text-sm
            text-muted-foreground
          "
        >
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="
              font-medium
              text-amber-400
              hover:text-amber-300
            "
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
