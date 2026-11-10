import { submitReview } from "@/lib/reviews/actions";

/**
 * A paid order unlocks one review of the seller. Refused and cancelled
 * orders leave the form closed. Sample profiles keep it closed too.
 */
export function ReviewForm({
  title,
  rule,
  stars,
  comment,
  commentPlaceholder,
  submit,
  pieceLabel,
  country,
  next,
  order,
}: {
  title: string;
  rule: string;
  stars: string;
  comment: string;
  commentPlaceholder: string;
  submit: string;
  pieceLabel: string;
  country?: string;
  next?: string;
  order?: { id: string; items: { listingId: string; title: string }[] } | null;
}) {
  const open = Boolean(order && order.items.length > 0 && country && next);
  return (
    <form className="review-form" action={open ? submitReview : undefined}>
      <h2>{title}</h2>
      <p className="review-rule">{rule}</p>
      {open && order && country && next ? (
        <>
          <input type="hidden" name="country" value={country} />
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="orderId" value={order.id} />
          {order.items.length === 1 ? (
            <input type="hidden" name="listingId" value={order.items[0]?.listingId} />
          ) : (
            <label>
              <span>{pieceLabel}</span>
              <select name="listingId" required defaultValue={order.items[0]?.listingId}>
                {order.items.map((item) => (
                  <option key={item.listingId} value={item.listingId}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      ) : null}
      <fieldset disabled={!open}>
        <legend>{stars}</legend>
        <div className="star-pick">
          {[5, 4, 3, 2, 1].map((value) => (
            <label key={value}>
              <input type="radio" name="stars" value={value} required={open} />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <label className="review-comment">
          <span>{comment}</span>
          <textarea name="comment" rows={4} maxLength={600} required={open} placeholder={commentPlaceholder} />
        </label>
        <button type="submit" className="btn btn-primary">
          {submit}
        </button>
      </fieldset>
    </form>
  );
}
