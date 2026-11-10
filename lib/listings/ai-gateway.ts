import { DraftModelError, type DraftPhoto } from "./ai-draft";

/**
 * Public AI Gateway model list (https://vercel.com/ai-gateway/models):
 * google/gemini-2.5-flash — chat, vision, structured-output.
 * Named here so a configured server knows which id to send.
 * This module does not call the model unless `callDescriptionModel` is invoked.
 */
export const DESCRIPTION_MODEL = "google/gemini-2.5-flash";

const PROMPT = [
  "Look at these listing photos and return JSON only.",
  "Keys: description (string or null), wearVisible (boolean), comparable (boolean).",
  "Do not invent brand, fabric, authenticity, age, condition, or defects.",
  "A photo does not prove vintage or a fair price.",
  "Do not include a price, a number, contact details, or any other key.",
  "wearVisible is true only when wear can be seen. comparable is true only when a real comparable is known. Otherwise false.",
].join(" ");

/**
 * Reads a configured gateway. Callers must already have checked the server config.
 * Tests and the unconfigured form do not call this.
 */
export async function callDescriptionModel(photos: DraftPhoto[], apiKey: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DESCRIPTION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              ...photos.map((photo) => ({
                type: "image_url",
                image_url: {
                  url: `data:${photo.contentType};base64,${Buffer.from(photo.bytes).toString("base64")}`,
                },
              })),
            ],
          },
        ],
      }),
    });
    if (response.status === 429) throw new DraftModelError("ai-rate-limited");
    if (!response.ok) throw new DraftModelError("ai-unavailable");
    const payload = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new DraftModelError("ai-unavailable");
    const json = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(json) as unknown;
  } catch (error) {
    if (error instanceof DraftModelError || error instanceof SyntaxError) throw error;
    if (controller.signal.aborted) throw new DraftModelError("ai-timeout");
    throw new DraftModelError("ai-unavailable");
  } finally {
    clearTimeout(timer);
  }
}
