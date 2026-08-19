import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

const SYSTEM_PROMPT = `You are Quantum AI, the built-in assistant of the Quantum Browser by Quantum Services.
You help users search the web, understand pages, write code, and use the browser
(tabs, bookmarks, history, reader mode, script blocking, themes, fullscreen).
Be concise, friendly, and practical. Use short paragraphs or bullet points.`;

export const askQuantumAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Quantum AI is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Quantum AI is busy right now — try again in a moment.");
    if (res.status === 402) throw new Error("Quantum AI credits are exhausted.");
    if (!res.ok) throw new Error(`Quantum AI error (${res.status}).`);

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Quantum AI returned an empty response.");
    return { reply };
  });
