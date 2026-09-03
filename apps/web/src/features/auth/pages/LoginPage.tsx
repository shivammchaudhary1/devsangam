import { loginUser } from '../api/auth.api';
import { AuthCard } from '../components/AuthCard';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { type LoginFormData,loginSchema } from '../schemas/login.schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { isApiError } from '@/services/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
 Apple, Loader2, LockKeyhole, Mail, Sparkles 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

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
      {/* =====================================
          MOBILE LOGIN / SIGN UP SWITCH
          ===================================== */}

      <div
        className="
          mb-7
          grid
          grid-cols-2
          rounded-lg
          border
          border-[var(--ds-border-soft)]
          bg-[var(--ds-elevated)]
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
            border
            border-[#d0a347]/60
            bg-gradient-to-b
            from-[#9a672a]/70
            to-[#604018]/80
            text-xs
            font-semibold
            text-[var(--ds-soft-gold)]
            shadow-[0_0_15px_rgba(245,158,11,0.14)]
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
            text-xs
            font-medium
            text-[var(--ds-muted)]
          "
        >
          Sign Up
        </Link>
      </div>

      <AuthCard
        title="Welcome Back"
        description="Sign in to continue your practice"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* ==============================
              EMAIL
              ============================== */}

          <div>
            <label
              htmlFor="login-email"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[var(--ds-cream)]
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
                  text-[var(--ds-muted)]
                "
              />

              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                aria-invalid={Boolean(form.formState.errors.email)}
                className="
                  h-[50px]
                  rounded-lg
                  border-[var(--ds-border-soft)]
                  bg-[var(--ds-night)]
                  pl-11
                  text-[var(--ds-cream)]
                  placeholder:text-[var(--ds-muted)]
                  hover:border-[var(--ds-border-gold)]
                  focus-visible:border-[var(--ds-border-gold)]
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

          {/* ==============================
              PASSWORD
              ============================== */}

          <div>
            <label
              htmlFor="login-password"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-[var(--ds-cream)]
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
                  text-[var(--ds-muted)]
                "
              />

              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
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

          {/* ==============================
              REMEMBER + FORGOT
              ============================== */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-2
                text-xs
                text-[var(--ds-muted)]
              "
            >
              <Checkbox
                defaultChecked
                className="
                  border-[var(--ds-border-soft)]
                  data-[state=checked]:border-[#f0a928]
                  data-[state=checked]:bg-[#f0a928]
                  data-[state=checked]:text-black
                "
              />
              Remember me
            </label>

            <Link
              to="/auth/forgot-password"
              className="
                text-xs
                font-medium
                text-[var(--ds-gold)]
                transition
                hover:text-[#ffd16c]
              "
            >
              Forgot password?
            </Link>
          </div>

          {/* ==============================
              API ERROR
              ============================== */}

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

          {/* ==============================
              SIGN IN
              ============================== */}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
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
            {loginMutation.isPending ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Sign In
              </>
            )}
          </Button>

          {/* ==============================
              SOCIAL DIVIDER
              ============================== */}

          <div
            className="
              flex
              items-center
              gap-4
              pt-1
            "
          >
            <div
              className="
                h-px
                flex-1
                bg-[var(--ds-white-03)]
              "
            />

            <span
              className="
                text-[11px]
                text-[var(--ds-muted)]
              "
            >
              or continue with
            </span>

            <div
              className="
                h-px
                flex-1
                bg-[var(--ds-white-03)]
              "
            />
          </div>

          {/* ==============================
              SOCIAL BUTTONS
              ============================== */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            <Button
              type="button"
              variant="outline"
              disabled
              title="Google sign-in coming later"
              className="
                h-[46px]
                rounded-lg
                border-[var(--ds-border-soft)]
                bg-[var(--ds-night)]
                text-[var(--ds-cream)]
                opacity-80
              "
            >
              <span
                className="
                  text-base
                  font-bold
                  text-[var(--ds-gold)]
                "
              >
                G
              </span>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled
              title="Apple sign-in coming later"
              className="
                h-[46px]
                rounded-lg
                border-[var(--ds-border-soft)]
                bg-[var(--ds-night)]
                text-[var(--ds-cream)]
                opacity-80
              "
            >
              <Apple size={17} />
              Apple
            </Button>
          </div>
        </form>

        {/* ==============================
            REGISTER
            ============================== */}

        <p
          className="
            mt-7
            text-center
            text-xs
            text-[var(--ds-muted)]
            sm:text-sm
          "
        >
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="
              font-medium
              text-[var(--ds-gold)]
              transition
              hover:text-[#ffd16c]
            "
          >
            Create account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
