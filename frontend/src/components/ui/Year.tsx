"use client";

import { useEffect, useRef } from "react";

/** Renders the current year without using a changing value during prerendering. */
export default function Year() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);

  return <span ref={ref}>2026</span>;
}
