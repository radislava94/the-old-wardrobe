import { reportListing } from "@/lib/reports/actions";

/** The control on a listing. Submitting stores one report for the signed-in person. */
export function ListingReport({
  listingId,
  slug,
  country,
  signedIn,
  status,
  copy,
}: {
  listingId: string;
  slug: string;
  country: string;
  signedIn: boolean;
  status: "stored" | "already" | "fields" | null;
  copy: {
    title: string;
    reason: string;
    notAsDescribed: string;
    prohibited: string;
    other: string;
    note: string;
    notePlaceholder: string;
    submit: string;
    stored: string;
    already: string;
    signIn: string;
  };
}) {
  return (
    <form className="sell-form report-form" action={reportListing}>
      <h2>{copy.title}</h2>
      {status === "stored" ? <p className="hint">{copy.stored}</p> : null}
      {status === "already" ? <p className="hint">{copy.already}</p> : null}
      {!signedIn ? <p className="hint">{copy.signIn}</p> : null}
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="country" value={country} />
      <label>
        <span>{copy.reason}</span>
        <select name="reason" required defaultValue="not_as_described">
          <option value="not_as_described">{copy.notAsDescribed}</option>
          <option value="prohibited">{copy.prohibited}</option>
          <option value="other">{copy.other}</option>
        </select>
      </label>
      <label>
        <span>{copy.note}</span>
        <textarea name="note" rows={3} maxLength={600} placeholder={copy.notePlaceholder} />
      </label>
      <button type="submit" className="btn btn-ghost">
        {copy.submit}
      </button>
    </form>
  );
}
