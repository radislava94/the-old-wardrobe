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
        <div className="wrap sell-layout">
          <div className="sell-intro">
            <p className="eyebrow">{dict.nav.sell}</p>
            <h1>{dict.sell.title}</h1>
          </div>
          <SellForm
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

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
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
            photoIds: (await listOwnedPhotos(listing.id))
              .filter((photo) => photo.status === "ready")
              .map((photo) => photo.id),
            sellerKind: profile.sellerKind === "business" ? "business" : "private",
            freeShipping: Boolean(listing.freeShipping),
            freeShippingOver: listing.freeShippingOver ? String(listing.freeShippingOver) : "",
          }}
          copy={{
            name: dict.sell.name,
            namePlaceholder: dict.sell.namePlaceholder,
            category: dict.sell.category,
            size: dict.sell.size,
            sizePlaceholder: dict.sell.sizePlaceholder,
            price: dict.sell.price,
            city: dict.sell.city,
            story: dict.sell.story,
            storyPlaceholder: dict.sell.storyPlaceholder,
            photo: dict.sell.photo,
            photoHint: dict.sell.photoHint,
            photoLocal: dict.sell.photoLocal,
            photoBlob: dict.sell.photoBlob,
            photoCount: dict.sell.photoCount,
            signIn: dict.sell.signIn,
            saveDraft: dict.sell.saveDraft,
            aiAsk: dict.sell.aiAsk,
            aiApplyDescription: dict.sell.aiApplyDescription,
            aiApplyWarning: dict.sell.aiApplyWarning,
            aiWarningLabel: dict.sell.aiWarningLabel,
            submit: dict.sell.submit,
            brand: dict.sell.brand,
            condition: dict.sell.condition,
            conditions: [
              { value: dict.sell.conditions.loved, label: dict.sell.conditions.loved },
              { value: dict.sell.conditions.kept, label: dict.sell.conditions.kept },
              { value: dict.sell.conditions.repair, label: dict.sell.conditions.repair },
              ...(listing.condition &&
              ![
                dict.sell.conditions.loved,
                dict.sell.conditions.kept,
                dict.sell.conditions.repair,
              ].includes(listing.condition)
                ? [{ value: listing.condition, label: listing.condition }]
                : []),
            ],
            country: dict.sell.country,
            currency: dict.sell.currency,
            freeShipping: dict.sell.freeShipping,
            freeShippingHint: dict.sell.freeShippingHint,
            freeShippingOver: dict.sell.freeShippingOver,
            freeShippingOverHint: dict.sell.freeShippingOverHint,
            sellerKind: dict.sell.sellerKind,
            sellerPrivate: dict.sell.sellerPrivate,
            sellerBusiness: dict.sell.sellerBusiness,
            errors: {
              fields: dict.sell.photoMissing,
              photo: dict.sell.photoMissing,
              "photo-type": dict.sell.photoType,
              "photo-size": dict.sell.photoSize,
              "photo-blob": dict.sell.photoBlob,
              "photo-count": dict.sell.photoCount,
              "photo-spoofed": dict.sell.photoSpoofed,
              "photo-incomplete": dict.sell.photoIncomplete,
              "photo-foreign": dict.sell.photoForeign,
              "photo-missing": dict.sell.photoMissing,
              database: dict.sell.database,
              "ai-off": dict.sell.aiOff,
              "ai-unavailable": dict.sell.aiUnavailable,
              "ai-timeout": dict.sell.aiTimeout,
              "ai-rate-limited": dict.sell.aiRateLimited,
              "ai-invalid": dict.sell.aiInvalid,
              forbidden: dict.sell.signIn,
            },
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
