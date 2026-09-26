import type { AnchorHTMLAttributes } from 'react';

/** Astro owns routes. Islands use ordinary links and full-page navigation. */
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}
const router = {
  push(href: string) { window.location.assign(href); },
  replace(href: string) { window.location.replace(href); },
};
export function useRouter() { return router; }
