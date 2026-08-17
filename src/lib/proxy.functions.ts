import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { buildProxyDocument, extractTitle } from "./proxy-html";

const fetchSchema = z.object({
  target: z.string().trim().url().max(2000),
  template: z.string().trim().max(500).optional(),
  blockScripts: z.boolean().default(true),
  readerMode: z.boolean().default(false),
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

    const started = Date.now();
    const res = await fetch(requestUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; QuantumBrowser/2.0; +https://quantum.services)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const raw = await res.text();
    const truncated = raw.length > 900_000;
    const source = raw.slice(0, 900_000);
    const finalUrl = res.url || requestUrl;
    const contentType = res.headers.get("content-type") ?? "unknown";
    const isHtml = contentType.includes("html") || /<html[\s>]/i.test(source);

    return {
      status: res.status,
      contentType,
      requestUrl,
      finalUrl,
      bytes: raw.length,
      truncated,
      elapsedMs: Date.now() - started,
      title: extractTitle(source) || target.hostname,
      source,
      document: buildProxyDocument({
        html: source,
        baseUrl: data.template ? target.toString() : finalUrl,
        isHtml,
        blockScripts: data.blockScripts,
        readerMode: data.readerMode,
      }),
    };
  });
