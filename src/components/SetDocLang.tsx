'use client';
import { useEffect } from 'react';

// The root layout renders <html lang="en">; Tamil routes correct it client-side.
// Search engines primarily detect language from visible content, so this is a
// progressive enhancement for screen readers and browser translation prompts.
export default function SetDocLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);
  return null;
}
