export const ogSize = { width: 1200, height: 630 };

const ink = "#3b2f24";
const inkSoft = "#6b5a48";
const cream = "#f4ecd8";
const paper = "#fbf6ea";
const mustard = "#c9a14a";
const mustardSoft = "#e3c983";
const rose = "#c99a94";
const forest = "#2f4a3a";
const soldInk = "#a2423a";

function titleSize(title: string): number {
  const length = [...title].length;
  if (length > 40) return 36;
  if (length > 26) return 42;
  return 48;
}

/**
 * One Polaroid for a listing. Title, price in the listing's currency,
 * and the photo when there is one. Nothing about watchers or stock pressure.
 */
export function ListingOgCard({
  title,
  price,
  city,
  photo,
  soldLabel,
}: {
  title: string;
  price: string | null;
  city: string | null;
  photo: string | null;
  soldLabel: string | null;
}) {
  return (
    <div
      style={{
        width: ogSize.width,
        height: ogSize.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cream,
      }}
    >
      <div
        style={{
          width: 1120,
          height: 560,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: paper,
          padding: "22px 32px 26px 22px",
          transform: "rotate(-1.4deg)",
          boxShadow: "0 18px 36px rgba(59, 47, 36, 0.28)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 500,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 118,
              height: 24,
              backgroundColor: mustardSoft,
              transform: "rotate(-3deg)",
              marginBottom: -12,
            }}
          />
          {photo ? (
            <img
              src={photo}
              width={500}
              height={470}
              alt=""
              style={{
                objectFit: "cover",
                backgroundColor: "#d9ccb0",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 500,
                height: 470,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#e8cbc4",
                color: forest,
                fontFamily: "Playfair Display",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 32,
              }}
            >
              The Old Wardrobe
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 530,
            height: 500,
            paddingLeft: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 42,
                height: 2,
                backgroundColor: rose,
                marginRight: 12,
              }}
            />
            <div
              style={{
                fontFamily: "Playfair Display",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 24,
                color: forest,
              }}
            >
              The Old Wardrobe
            </div>
          </div>
          {soldLabel ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 16,
                fontFamily: "Playfair Display",
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1.4,
                color: soldInk,
                border: "3px solid #a2423a",
                padding: "4px 12px",
              }}
            >
              {soldLabel}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: titleSize(title),
              lineHeight: 1.08,
              color: ink,
            }}
          >
            {title}
          </div>
          {price ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 20,
                backgroundColor: mustardSoft,
                color: forest,
                fontFamily: "Playfair Display",
                fontWeight: 700,
                fontSize: 40,
                lineHeight: 1,
                padding: "10px 16px 8px",
              }}
            >
              {price}
            </div>
          ) : null}
          {city ? (
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontFamily: "Playfair Display",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 26,
                color: inkSoft,
              }}
            >
              {city}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 22,
              width: 72,
              height: 3,
              backgroundColor: mustard,
            }}
          />
        </div>
      </div>
    </div>
  );
}
