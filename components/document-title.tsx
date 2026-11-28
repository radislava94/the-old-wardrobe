"use client";

import { useEffect } from "react";

/** Keeps the tab title after a not-found page hydrates. */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
