import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  payload: z.record(z.string(), z.string().trim().max(2000)),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const webhook = process.env["CONTACT_WEBHOOK_URL"];
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data.payload),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`Contact webhook failed [${res.status}]: ${body}`);
        throw new Error("Could not deliver your message. Please try again.");
      }
    } else {
      console.log("Contact submission:", JSON.stringify(data.payload));
    }
    return { ok: true as const };
  });
