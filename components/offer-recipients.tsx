"use client";

import { useEffect, useRef, useState } from "react";

/** At least one recipient is required before the private offer can be sent. */
export function OfferRecipients({
  legend,
  people,
  requiredMessage,
}: {
  legend: string;
  people: { userId: string; name: string }[];
  requiredMessage: string;
}) {
  const fieldset = useRef<HTMLFieldSetElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const form = fieldset.current?.closest("form");
    if (!form) return;
    const onSubmit = (event: Event) => {
      const boxes = form.querySelectorAll<HTMLInputElement>('input[name="to"]');
      const any = [...boxes].some((box) => box.checked);
      if (!any) {
        event.preventDefault();
        setMessage(requiredMessage);
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [requiredMessage]);

  return (
    <fieldset className="choice-set" ref={fieldset} onChange={() => setMessage(null)}>
      <legend>{legend}</legend>
      {people.map((person) => (
        <label className="choice" key={person.userId}>
          <input type="checkbox" name="to" value={person.userId} />
          <span>{person.name}</span>
        </label>
      ))}
      {message ? (
        <p className="form-error" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
