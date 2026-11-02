import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteAccount, updateProfile } from "@/lib/account/actions";
import { authReady } from "@/lib/auth/config";
import { ensureProfile } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/session";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { listingsRepo } from "@/lib/data";
import { savedListings } from "@/lib/favourites/queries";
import { offersForProfile } from "@/lib/offers/queries";
import { respondToOffer } from "@/lib/offers/actions";
import { bundlesForBuyer } from "@/lib/bundles/queries";
import { removeFromBundle } from "@/lib/bundles/actions";
import { placeOrder } from "@/lib/orders/actions";
import { courierChoices } from "@/lib/couriers";
import { formatMoney } from "@/lib/money";
import { toggleFavourite } from "@/lib/favourites/actions";
import { privacyPath, sellPath, signInPath } from "@/lib/paths";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Account",
};

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const query = await searchParams;

  if (!authReady()) {
    return (
      <section className="page-block">
        <div className="wrap sell-layout">
          <h1>{dict.account.title}</h1>
          <p className="lead">{dict.account.needAuth}</p>
        </div>
      </section>
    );
  }

  const session = await getSession();
  if (!session) redirect(signInPath(raw));
  const profile = await ensureProfile(session.user, raw);
  const saved = await savedListings(profile.id);
  const mine = await offersForProfile(profile.id);
  const groups = await bundlesForBuyer(profile.id);

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
        <p className="eyebrow">{dict.account.nav}</p>
        <h1>{dict.account.title}</h1>
        <p className="lead">{dict.account.intro}</p>
        {query.saved ? (
          <p className="hint" role="status">
            {dict.account.saved}
          </p>
        ) : null}
        {query.error === "confirm" ? (
          <p className="form-error" role="alert">
            {dict.account.confirmError}
          </p>
        ) : null}
        {query.error && query.error !== "confirm" ? (
          <p className="form-error" role="alert">
            {dict.auth.error}
          </p>
        ) : null}

        <form className="sell-form" action={updateProfile}>
          <input type="hidden" name="currentCountry" value={raw} />
          <label>
            <span>{dict.account.name}</span>
            <input name="name" required maxLength={80} defaultValue={profile.name} />
          </label>
          <label>
            <span>{dict.account.email}</span>
            <input value={session.user.email} readOnly />
          </label>
          <div className="sell-row">
            <label>
              <span>{dict.account.city}</span>
              <input name="city" maxLength={80} defaultValue={profile.city} />
              <small>{dict.account.cityHint}</small>
            </label>
            <label>
              <span>{dict.account.country}</span>
              <select name="country" defaultValue={profile.country}>
                {countryCodes.map((code) => (
                  <option key={code} value={code}>
                    {countries[code].nativeName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>{dict.account.bio}</span>
            <textarea name="bio" rows={4} maxLength={600} defaultValue={profile.bio} />
          </label>
          <fieldset className="choice-set">
            <legend>{dict.account.sellerKind}</legend>
            <label className="choice">
              <input
                type="radio"
                name="sellerKind"
                value="private"
                defaultChecked={profile.sellerKind !== "business"}
              />
              <span>{dict.account.sellerPrivate}</span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="sellerKind"
                value="business"
                defaultChecked={profile.sellerKind === "business"}
              />
              <span>{dict.account.sellerBusiness}</span>
            </label>
          </fieldset>
          <label className="choice">
            <input type="checkbox" name="phoneVerified" defaultChecked={Boolean(profile.phoneVerified)} />
            <span>{dict.account.phone}</span>
            <small>{dict.account.phoneHint}</small>
          </label>
          <button type="submit" className="btn btn-primary">
            {dict.account.save}
          </button>
        </form>

        <section className="account-block">
          <h2>{dict.account.savedTitle}</h2>
          <p className="hint">{dict.account.savedNote}</p>
          <ul className="own-listings">
            {saved.map((item) => (
              <li key={item.id}>
                <Link href={`/${item.country}/listing/${item.slug}`}>{item.title}</Link>
                <form action={toggleFavourite}>
                  <input type="hidden" name="listingId" value={item.listingId} />
                  <input type="hidden" name="slug" value={item.slug} />
                  <input type="hidden" name="country" value={item.country} />
                  <button type="submit" className="btn btn-ghost">
                    {dict.account.unfavourite}
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {saved.length === 0 ? <p>{dict.account.savedEmpty}</p> : null}
        </section>

        <section className="account-block">
          <h2>{dict.listing.bundleTitle}</h2>
          <p className="hint">{dict.listing.bundleHint}</p>
          {groups.map((group) => {
            const currencies = new Set(group.items.map((item) => item.currency));
            const total =
              currencies.size === 1
                ? group.items.reduce((sum, item) => sum + item.priceAmount, 0)
                : null;
            return (
              <div key={group.id}>
                <h3>{group.sellerName}</h3>
                <ul className="own-listings">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        <Link href={`/${item.country}/listing/${item.slug}`}>{item.title}</Link>
                        {total != null && item.freeShippingOver != null ? (
                          <p className="hint">
                            {total >= item.freeShippingOver
                              ? dict.listing.bundleMet(
                                  item.title,
                                  formatMoney(total, item.country),
                                  formatMoney(item.freeShippingOver, item.country),
                                )
                              : dict.listing.bundleShort(
                                  item.title,
                                  formatMoney(total, item.country),
                                  formatMoney(item.freeShippingOver, item.country),
                                )}
                          </p>
                        ) : null}
                      </span>
                      <form action={removeFromBundle}>
                        <input type="hidden" name="bundleId" value={group.id} />
                        <input type="hidden" name="listingId" value={item.id} />
                        <input type="hidden" name="country" value={raw} />
                        <button type="submit" className="btn btn-ghost">
                          {dict.listing.bundleRemove}
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
                {group.items.length > 0 ? (
                  <form className="sell-form" action={placeOrder}>
                    <input type="hidden" name="country" value={raw} />
                    {group.items.map((item) => (
                      <input key={item.id} type="hidden" name="listingId" value={item.id} />
                    ))}
                    <label>
                      <span>{dict.order.courier}</span>
                      <select name="courier" required defaultValue="">
                        <option value="" disabled>
                          —
                        </option>
                        {courierChoices[raw].map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <small>{dict.order.courierHint}</small>
                    </label>
                    <p className="hint">{dict.order.noFee}</p>
                    <button type="submit" className="btn btn-primary">
                      {dict.order.bundlePlace}
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })}
        </section>

        <section className="account-block">
          <h2>{dict.listing.offersTitle}</h2>
          <p className="hint">{dict.listing.offerHint}</p>
          <ul className="own-listings">
            {mine.map((offer) => (
              <li key={offer.id}>
                <span>
                  <Link href={`/${offer.country}/listing/${offer.slug}`}>
                    {offer.title} · {offer.amount} {offer.currency}
                  </Link>
                  <p className="hint">
                    {offer.status === "accepted"
                      ? dict.listing.offerAccepted
                      : offer.status === "declined"
                        ? dict.listing.offerDeclined
                        : offer.kind === "seller"
                          ? dict.listing.offerPrivate
                          : dict.listing.offerTitle}
                  </p>
                </span>
                {offer.kind === "buyer" && offer.toUserId === profile.id && offer.status === "pending" ? (
                  <span className="offer-actions">
                    <form action={respondToOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <input type="hidden" name="country" value={raw} />
                      <input type="hidden" name="decision" value="accepted" />
                      <button type="submit" className="btn btn-ghost">
                        {dict.listing.offerAccept}
                      </button>
                    </form>
                    <form action={respondToOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <input type="hidden" name="country" value={raw} />
                      <input type="hidden" name="decision" value="declined" />
                      <button type="submit" className="btn btn-ghost">
                        {dict.listing.offerDecline}
                      </button>
                    </form>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="account-block">
          <h2>{dict.rating.listings}</h2>
          <ul className="own-listings">
            {(await listingsRepo.listBySeller(profile.id)).map((listing) => (
              <li key={listing.id}>
                {listing.visibility === "draft" ? (
                  <span>{listing.title}</span>
                ) : (
                  <Link href={`/${listing.country}/listing/${listing.slug}`}>{listing.title}</Link>
                )}
                <Link href={`${sellPath(listing.country)}/${listing.id}`}>{dict.sell.submit}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="account-block">
          <h2>{dict.account.exportTitle}</h2>
          <p>{dict.account.exportBody}</p>
          {/* Full navigation so the browser saves the JSON attachment. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-ghost" href="/api/account/export">
            {dict.account.export}
          </a>
        </section>

        <section className="account-block">
          <h2>{dict.account.deleteTitle}</h2>
          <p>{dict.account.deleteBody}</p>
          <form className="sell-form" action={deleteAccount}>
            <input type="hidden" name="country" value={raw} />
            <label>
              <span>{dict.account.deleteConfirm}</span>
              <input name="confirm" type="email" required autoComplete="off" />
            </label>
            <label>
              <span>{dict.account.deletePassword}</span>
              <input name="password" type="password" autoComplete="current-password" />
            </label>
            <button type="submit" className="btn btn-ghost">
              {dict.account.deleteButton}
            </button>
          </form>
        </section>

        <p className="hint">
          <Link href={privacyPath(raw)}>{dict.footer.privacy}</Link>
        </p>
      </div>
    </section>
  );
}
