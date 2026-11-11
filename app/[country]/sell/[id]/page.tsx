import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SellForm } from "@/components/sell-form";
import { commissionConfig } from "@/lib/commission/config";
import { feePreviewCopy } from "@/lib/commission/preview-copy";
import { freeSalesLeftFor } from "@/lib/commission/remaining";
import { profileForAuthUser } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/session";
import { categoryKeys } from "@/lib/categories";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { listOwnedPhotos } from "@/lib/listings/actions";
import { sellCopy } from "@/lib/listings/sell-copy";
import { homePath, sellPath, signInPath } from "@/lib/paths";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Edit listing",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ country: string; id: string }>;
}) {
  const { country: raw, id } = await params;
  if (!isCountry(raw)) notFound();
  if (!process.env.DATABASE_URL?.trim()) {
    const dict = getDictionary(raw);
    return (
      <section className="page-block">
        <div className="wrap sell-layout sell-layout-wide">
          <div className="sell-intro">
            <p className="eyebrow">{dict.nav.sell}</p>
            <h1>{dict.sell.title}</h1>
          </div>
          <SellForm
            signedIn={false}
            returnPath={`${sellPath(raw)}/${id}`}
            blobConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
            countries={countryCodes.map((code) => ({
              code,
              label: countries[code].nativeName,
              currency: countries[code].currency,
              cities: [...countries[code].cities],
            }))}
            categories={categoryKeys.map((key) => ({
              value: key,
              label: dict.categories[key],
            }))}
            initial={{
              id,
              country: raw,
              title: "",
              category: "",
              size: "",
              price: "",
              city: "",
              brand: "",
              condition: dict.sell.conditions.loved,
              story: "",
              photoUrl: "",
              sellerKind: "private",
              freeShipping: false,
              freeShippingOver: "",
            }}
            copy={sellCopy(dict)}
            freeSalesLeft={commissionConfig.welcomeSales}
            fees={feePreviewCopy(dict, commissionConfig.welcomeSales)}
          />
        </div>
      </section>
    );
  }
  const session = await getSession();
  if (!session) redirect(`${signInPath(raw)}?next=${encodeURIComponent(`${sellPath(raw)}/${id}`)}`);
  const profile = await profileForAuthUser(session.user.id);
  const listing = await listingsRepo.getById(id);
  if (!listing || !profile || listing.sellerId !== profile.id) notFound();
  const dict = getDictionary(raw);
  const freeSalesLeft = await freeSalesLeftFor(profile.id);
  const owned = await listOwnedPhotos(listing.id);
  const readyPhotos = owned.filter((photo) => photo.status === "ready");
  const formCopy = sellCopy(dict);
  const knownConditions = new Set(formCopy.conditions.map((item) => item.value));

  return (
    <section className="page-block">
      <div className="wrap sell-layout sell-layout-wide">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(raw) },
            { name: dict.sell.title, path: sellPath(listing.country) },
            { name: listing.title, path: `${sellPath(listing.country)}/${listing.id}` },
          ]}
        />
        <div className="sell-intro">
          <p className="eyebrow">{dict.nav.sell}</p>
          <h1>{listing.title}</h1>
          <p className="hint">{dict.sell.priceDropNote}</p>
        </div>
          <SellForm
          signedIn
          returnPath={`${sellPath(listing.country)}/${listing.id}`}
          blobConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
          countries={countryCodes.map((code) => ({
            code,
            label: countries[code].nativeName,
            currency: countries[code].currency,
            cities: [...countries[code].cities],
          }))}
          categories={categoryKeys.map((key) => ({
            value: key,
            label: dict.categories[key],
          }))}
          initial={{
            id: listing.id,
            country: listing.country,
            title: listing.title,
            category: listing.category,
            size: listing.size,
            price: String(listing.priceAmount),
            city: listing.city,
            brand: listing.brand ?? "",
            condition: listing.condition,
            story: listing.description,
            photoUrl: listing.visibility === "draft" ? "" : (listing.photoUrl ?? ""),
            photoIds: readyPhotos.map((photo) => photo.id),
            photoPreviews: readyPhotos.map((photo) => ({ id: photo.id, url: photo.url })),
            sellerKind: profile.sellerKind === "business" ? "business" : "private",
            freeShipping: Boolean(listing.freeShipping),
            freeShippingOver: listing.freeShippingOver ? String(listing.freeShippingOver) : "",
          }}
          copy={{
            ...formCopy,
            conditions: knownConditions.has(listing.condition)
              ? formCopy.conditions
              : [...formCopy.conditions, { value: listing.condition, label: listing.condition }],
          }}
          freeSalesLeft={freeSalesLeft}
          fees={feePreviewCopy(dict, freeSalesLeft)}
        />
        {listing.visibility === "draft" ? null : (
          <p className="hint">
            <Link href={`/${listing.country}/listing/${listing.slug}`}>{listing.title}</Link>
          </p>
        )}
      </div>
    </section>
  );
}
