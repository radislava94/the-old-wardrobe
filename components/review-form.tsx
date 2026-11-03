/**
 * Visible, but not a working review box.
 * The fieldset stays disabled until accounts exist. A live version may
 * accept a review only from the buyer on a completed order, once per order.
 */
export function ReviewForm({
  title,
  rule,
  stars,
  comment,
  commentPlaceholder,
  submit,
}: {
  title: string;
  rule: string;
  stars: string;
  comment: string;
  commentPlaceholder: string;
  submit: string;
}) {
  return (
    <form className="review-form">
      <h2>{title}</h2>
      <p className="review-rule">{rule}</p>
      <fieldset disabled>
        <legend>{stars}</legend>
        <div className="star-pick">
          {[5, 4, 3, 2, 1].map((value) => (
            <label key={value}>
              <input type="radio" name="stars" value={value} />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <label className="review-comment">
          <span>{comment}</span>
          <textarea name="comment" rows={4} placeholder={commentPlaceholder} />
        </label>
        <button type="submit" className="btn btn-primary">
          {submit}
        </button>
      </fieldset>
    </form>
  );
}
