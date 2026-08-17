import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const fetchSchema = z.object({
  target: z.string().trim().url().max(2000),
  template: z.string().trim().max(500).optional(),
  mode: z.enum(["text", "html"]).default("html"),
});

export const fetchThroughProxy = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => fetchSchema.parse(data))
  .handler(async ({ data }) => {
    const target = new URL(data.target);
    if (!["http:", "https:"].includes(target.protocol)) {
      throw new Error("Only http and https URLs are supported.");
    }

    const requestUrl = data.template
      ? data.template.replace("{{target}}", encodeURIComponent(target.toString()))
      : target.toString();

    const res = await fetch(requestUrl, {
      headers: { "user-agent": "QuantumServicesProxy/1.0", accept: "text/html,*/*" },
      redirect: "follow",
    });

    const raw = await res.text();
    const body = raw.slice(0, 400_000);

    return {
      status: res.status,
      contentType: res.headers.get("content-type") ?? "unknown",
      requestUrl,
      finalUrl: res.url || requestUrl,
      bytes: raw.length,
      body,
    };
  });
