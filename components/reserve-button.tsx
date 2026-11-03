"use client";

import { useState } from "react";

export function ReserveButton({
  label,
  note,
  clicked,
}: {
  label: string;
  note: string;
  clicked: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reserve">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        {label}
      </button>
      <p className="hint" role={open ? "status" : undefined}>
        {open ? clicked : note}
      </p>
    </div>
  );
}
