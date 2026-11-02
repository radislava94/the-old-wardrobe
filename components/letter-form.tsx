"use client";

import { useState } from "react";

export function LetterForm({
  label,
  placeholder,
  join,
  soon,
}: {
  label: string;
  placeholder: string;
  join: string;
  soon: string;
}) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="letter"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="news">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          aria-label={label}
        />
        <button type="submit">{join}</button>
      </div>
      {sent ? (
        <p className="letter-soon" role="status">
          {soon}
        </p>
      ) : null}
    </form>
  );
}
