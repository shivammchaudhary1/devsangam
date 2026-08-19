import { zodResolver } from '@hookform/resolvers/zod';

import { useMutation } from '@tanstack/react-query';

import { Loader2, Mail, User } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';

import { isApiError } from '@/services/api/client';

import { registerUser } from '../api/auth.api';

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
        message: 'Unable to create account. Please try again.',
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
        <header className="mb-8 text-center">
          <h1
            className="
              font-display
              text-3xl
            "
          >
            Begin Your Journey
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
            Create your DevSangam account
          </p>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.name)}>
              <FieldLabel htmlFor="register-name">Name</FieldLabel>

              <div className="relative">
                <User
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
                  id="register-name"
                  autoComplete="name"
                  placeholder="Enter your name"
                  className="h-12 pl-10"
                  {...form.register('name')}
                />
              </div>

              {form.formState.errors.name && (
                <FieldError errors={[form.formState.errors.name]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>

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
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="h-12 pl-10"
                  {...form.register('email')}
                />
              </div>

              {form.formState.errors.email && (
                <FieldError errors={[form.formState.errors.email]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>

              <PasswordInput
                id="register-password"
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
              <FieldLabel htmlFor="register-confirm-password">
                Confirm Password
              </FieldLabel>

              <PasswordInput
                id="register-confirm-password"
                autoComplete="new-password"
                placeholder="Confirm your password"
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
            disabled={registerMutation.isPending}
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
            {registerMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
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
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="
              font-medium
              text-amber-400
            "
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
