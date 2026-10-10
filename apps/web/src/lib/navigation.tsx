'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import {
  type AnchorHTMLAttributes,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

export const OfflineNavigationContext = createContext<{
  pathname: string;
  params: Record<string, string>;
} | null>(null);

// Preserve existing component props while all navigation uses the native Next router.
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };
export function Link({ to, onClick, ...props }: LinkProps) {
  return (
    <NextLink
      href={to}
      prefetch={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          !navigator.onLine &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          window.location.assign(to);
        }
      }}
    />
  );
}

type NavState = { isActive: boolean; isPending: boolean };
type NavLinkProps = Omit<LinkProps, 'className' | 'children'> & {
  end?: boolean;
  className?: string | ((state: NavState) => string);
  children?: ReactNode | ((state: NavState) => ReactNode);
};
export function NavLink({ to, end, className, children, ...props }: NavLinkProps) {
  const { pathname } = useLocation();
  const path = to.split(/[?#]/)[0];
  const isActive = pathname === path || (!end && path !== '/' && pathname.startsWith(path + '/'));
  const state = { isActive, isPending: false };
  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      {...props}
      className={typeof className === 'function' ? className(state) : className}
    >
      {typeof children === 'function' ? children(state) : children}
    </Link>
  );
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (!navigator.onLine) {
        if (options?.replace) window.location.replace(to);
        else window.location.assign(to);
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

const subscribeLocation = (notify: () => void) => {
  window.addEventListener('hashchange', notify);
  window.addEventListener('popstate', notify);
  return () => {
    window.removeEventListener('hashchange', notify);
    window.removeEventListener('popstate', notify);
  };
};
export function useLocation() {
  const nextPathname = usePathname();
  const offline = useContext(OfflineNavigationContext);
  // Next error/not-found renders can temporarily have no pathname.
  const pathname = offline?.pathname ?? nextPathname ?? '';
  const suffix = useSyncExternalStore(
    subscribeLocation,
    () => window.location.search + window.location.hash,
    () => '',
  );
  const hash = suffix.includes('#') ? suffix.slice(suffix.indexOf('#')) : '';
  return { pathname, hash, search: suffix.split('#')[0], key: pathname + suffix };
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  const params = useNextParams<T>();
  const offline = useContext(OfflineNavigationContext);
  return offline ? (offline.params as T) : params;
}
export function useSearchParams() {
  const params = useNextSearchParams();
  const offline = useContext(OfflineNavigationContext);
  return [offline ? new URLSearchParams(window.location.search) : params] as const;
}
export function Navigate({ to, replace }: { to: string; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
}
export function matchPath(pattern: string, pathname: string) {
  const expression = pattern
    .split('/')
    .map((segment) =>
      segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    )
    .join('/');
  return new RegExp('^' + expression + '/?$').test(pathname);
}
