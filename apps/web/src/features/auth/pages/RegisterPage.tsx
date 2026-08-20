import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { Loader2, LockKeyhole, Mail, Sparkles, User } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { isApiError } from '@/services/api/client';

import { registerUser } from '../api/auth.api';

import { AuthCard } from '../components/AuthCard';

import { AuthLayout } from '../components/AuthLayout';

import { PasswordInput } from '../components/PasswordInput';

import { useAuth } from '../hooks/useAuth';

import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/register.schema';

export function RegisterPage() {
  const navigate = useNavigate();

  const auth = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
  });

  async function onSubmit(values: RegisterFormData) {
    form.clearErrors('root');

    try {
      const response = await registerMutation.mutateAsync({
        name: values.name,

        email: values.email,

        password: values.password,
      });

      auth.setUser(response.data.user);

      navigate('/', {
        replace: true,
      });
    } catch (error) {
      if (isApiError(error)) {
        if (error.code === 'EMAIL_IN_USE') {
          form.setError('email', {
            message: error.message,
          });

          return;
        }

        form.setError('root', {
          message: error.message,
        });

        return;
      }

      form.setError('root', {
        message: 'Unable to create your account. Please try again.',
      });
    }
  }

  return (
    <AuthLayout>
      {/* Mobile Login / Sign Up switch */}

      <div
        className="
          mb-7
          grid
          grid-cols-2
          rounded-lg
          border
          border-white/[0.07]
          bg-[#11151d]
          p-1
          lg:hidden
        "
      >
        <Link
          to="/auth/login"
          className="
            flex
            h-10
            items-center
            justify-center
            rounded-md
            text-xs
            font-medium
            text-[#afb6c1]
          "
        >
          Login
        </Link>

        <Link
          to="/auth/register"
          className="
            flex
            h-10
            items-center
            justify-center
            rounded-md
            border
            border-[#d0a347]/60
            bg-gradient-to-b
            from-[#9a672a]/70
            to-[#604018]/80
            text-xs
            font-semibold
            text-[#f7d891]
            shadow-[0_0_15px_rgba(245,158,11,0.14)]
          "
        >
          Sign Up
        </Link>
      </div>

      <AuthCard
        title="Begin Your Journey"
        description="Create your DevSangam account"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}

          <div>
            <label
              htmlFor="register-name"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[#e4e7ec]
              "
            >
              Name
            </label>

            <div className="relative">
              <User
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
                id="register-name"
                autoComplete="name"
                placeholder="Enter your name"
                aria-invalid={Boolean(form.formState.errors.name)}
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
                {...form.register('name')}
              />
            </div>

            {form.formState.errors.name && (
              <p
                className="
                  mt-2
                  text-xs
                  text-red-400
                "
              >
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="register-email"
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
                id="register-email"
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

          {/* Password */}

          <div>
            <label
              htmlFor="register-password"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[#e4e7ec]
              "
            >
              Password
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
                id="register-password"
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
              htmlFor="register-confirm-password"
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
                id="register-confirm-password"
                autoComplete="new-password"
                placeholder="Confirm your password"
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

          {/* Create Account */}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
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
            {registerMutation.isPending ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Create Account
              </>
            )}
          </Button>
        </form>

        <p
          className="
            mt-7
            text-center
            text-xs
            text-[#8d95a2]
            sm:text-sm
          "
        >
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="
              font-medium
              text-[#e8b647]
              transition
              hover:text-[#ffd16c]
            "
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
