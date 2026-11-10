const CYRILLIC: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  ѓ: "gj",
  ђ: "dj",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  ѕ: "dz",
  и: "i",
  ј: "j",
  к: "k",
  л: "l",
  љ: "lj",
  м: "m",
  н: "n",
  њ: "nj",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  ќ: "kj",
  ћ: "c",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  џ: "dzh",
  ш: "sh",
  щ: "sht",
  ъ: "a",
  ы: "y",
  ь: "",
  ю: "yu",
  я: "ya",
};

/** Latin slug for a profile handle. Cyrillic is transliterated; accents are stripped. */
export function slugifyName(name: string): string {
  const lower = name.trim().toLowerCase();
  let out = "";
  for (const char of lower) out += CYRILLIC[char] ?? char;
  out = out.normalize("NFD").replace(/\p{M}/gu, "");
  out = out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return out || "member";
}
