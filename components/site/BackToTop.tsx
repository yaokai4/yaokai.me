"use client";

import { ArrowUp } from "lucide-react";
import * as React from "react";
import { useLocale } from "@/components/site/LocaleProvider";
import { applyCopyOverrides } from "@/lib/copy-overrides";
import { siteCopy } from "@/lib/public-copy";

export function BackToTop() {
  const { locale, copyOverrides } = useLocale();
  const t = React.useMemo(() => applyCopyOverrides(siteCopy[locale], copyOverrides, `site.${locale}`).common, [copyOverrides, locale]);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const next = window.scrollY > 640;
      setVisible((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={t.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-indigo-200 bg-white text-indigo-800 shadow-[0_6px_20px_rgba(15,45,78,0.12)] transition hover:border-indigo-400 focus-ring"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
