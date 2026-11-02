/** Text sent to WhatsApp and Viber: the piece, its own price, and the page. */
export function listingShareText(title: string, price: string, pageUrl: string): string {
  return `${title} — ${price}\n${pageUrl}`;
}

/** Facebook's public sharer. It pulls the title and image from the page's OG tags. */
export function facebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function viberShareUrl(text: string): string {
  return `viber://forward?text=${encodeURIComponent(text)}`;
}
