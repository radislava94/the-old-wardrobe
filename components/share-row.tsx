"use client";

import { useState } from "react";
import {
  facebookShareUrl,
  listingShareText,
  viberShareUrl,
  whatsAppShareUrl,
} from "@/lib/share";

export type ShareLabels = {
  heading: string;
  instagram: string;
  facebook: string;
  viber: string;
  whatsapp: string;
  copy: string;
  copied: string;
  hint: string;
  instagramSheet: string;
  instagramLinkCopied: string;
  instagramSaved: string;
  instagramFailed: string;
  copyFailed: string;
};

/**
 * Instagram Stories has no public HTTPS share for an arbitrary page.
 * The button hands Stories an image the way the phone share sheet does:
 * the system sheet with the Polaroid file when the browser can share files,
 * and a saved photo plus a copied link when it cannot.
 */
export function ShareRow({
  title,
  price,
  pageUrl,
  imagePath,
  fileName,
  labels,
}: {
  title: string;
  price: string;
  pageUrl: string;
  imagePath: string;
  fileName: string;
  labels: ShareLabels;
}) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const text = listingShareText(title, price, pageUrl);

  async function onCopy() {
    const ok = await copyText(pageUrl);
    setCopied(ok);
    setNote(ok ? labels.copied : labels.copyFailed);
  }

  async function onInstagram() {
    setCopied(false);
    setNote("");

    let blob: Blob;
    try {
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error(String(response.status));
      blob = await response.blob();
    } catch {
      const ok = await copyText(pageUrl);
      setCopied(ok);
      setNote(labels.instagramFailed);
      return;
    }

    const file = new File([blob], fileName, { type: blob.type || "image/png" });
    const withText: ShareData = { files: [file], title, text };
    const filesOnly: ShareData = { files: [file] };

    if (canShare(withText)) {
      try {
        await navigator.share(withText);
        setNote(labels.instagramSheet);
        return;
      } catch (error) {
        if (isAbort(error)) return;
      }
    }

    if (canShare(filesOnly)) {
      const linkCopied = await copyText(pageUrl);
      try {
        await navigator.share(filesOnly);
        setCopied(linkCopied);
        setNote(linkCopied ? labels.instagramLinkCopied : labels.instagramSheet);
        return;
      } catch (error) {
        if (isAbort(error)) return;
      }
    }

    const linkCopied = await copyText(pageUrl);
    const saved = downloadBlob(blob, fileName);
    setCopied(linkCopied);
    setNote(saved && linkCopied ? labels.instagramSaved : labels.instagramFailed);
  }

  return (
    <section className="share-row" aria-labelledby="share-heading">
      <h2 id="share-heading">{labels.heading}</h2>
      <div className="share-actions">
        <button type="button" onClick={onInstagram} aria-describedby="share-hint">
          {labels.instagram}
        </button>
        <a href={facebookShareUrl(pageUrl)} target="_blank" rel="noopener noreferrer">
          {labels.facebook}
        </a>
        <a href={viberShareUrl(text)}>{labels.viber}</a>
        <a href={whatsAppShareUrl(text)} target="_blank" rel="noopener noreferrer">
          {labels.whatsapp}
        </a>
        <button type="button" onClick={onCopy} aria-pressed={copied}>
          {copied ? labels.copied : labels.copy}
        </button>
      </div>
      <p className="hint" id="share-hint">
        {labels.hint}
      </p>
      <p className="hint share-status" role="status" aria-live="polite">
        {note}
      </p>
    </section>
  );
}

function canShare(data: ShareData): boolean {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare(data);
  } catch {
    return false;
  }
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function downloadBlob(blob: Blob, filename: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
