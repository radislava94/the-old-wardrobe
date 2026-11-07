import { toggleFavourite } from "@/lib/favourites/actions";

export function FavouriteButton({
  listingId,
  slug,
  country,
  saved,
  save,
  unsave,
  note,
}: {
  listingId: string;
  slug: string;
  country: string;
  saved: boolean;
  save: string;
  unsave: string;
  note: string;
}) {
  return (
    <form className="favourite-form" action={toggleFavourite}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="country" value={country} />
      <button type="submit" className="btn btn-ghost">
        {saved ? unsave : save}
      </button>
      <p className="hint">{note}</p>
    </form>
  );
}
