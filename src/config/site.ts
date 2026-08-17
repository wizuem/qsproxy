/**
 * Customize your site here — copy, contact form and proxy behaviour.
 */

export const siteConfig = {
  name: "Quantum Services",
  tagline: "Infrastructure at the speed of light",
  description:
    "Quantum Services builds fast, private network infrastructure — secure proxying, edge delivery and hands-on support.",
  email: "quantumservices.devs@gmail.com",
  location: "Remote — worldwide",
};

/** Contact form — add, remove or reorder fields freely. */
export type ContactField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  maxLength?: number;
};

export const contactConfig = {
  heading: "Contact us",
  subheading: "Tell us what you need and we'll reply within one business day.",
  submitLabel: "Send message",
  successMessage: "Thanks! Your message is on its way — we'll be in touch shortly.",
  fields: [
    { name: "name", label: "Full name", type: "text", placeholder: "Ada Lovelace", required: true, maxLength: 100 },
    { name: "email", label: "Email", type: "email", placeholder: "you@company.com", required: true, maxLength: 255 },
    { name: "company", label: "Company", type: "text", placeholder: "Optional", maxLength: 120 },
    {
      name: "topic",
      label: "How can we help?",
      type: "select",
      required: true,
      options: ["Proxy & networking", "Custom development", "Support", "Something else"],
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "A few details about your project…",
      required: true,
      maxLength: 2000,
    },
  ] satisfies ContactField[],
};

/**
 * Quantum Browser configuration. Proxy presets use {{target}} as the
 * placeholder for the encoded destination URL; the built-in option fetches
 * directly through this site's own server.
 */
export const proxyConfig = {
  heading: "Quantum Browser",
  subheading: "A private, themeable browser that renders the web through your chosen proxy.",
  homepage: "https://example.com",
  presets: [
    { id: "internal", label: "Quantum Proxy (built-in)", url: "" },
    { id: "jina", label: "Reader (text-only)", url: "https://r.jina.ai/{{target}}" },
    { id: "allorigins", label: "AllOrigins", url: "https://api.allorigins.win/raw?url={{target}}" },
    { id: "corsproxy", label: "CorsProxy.io", url: "https://corsproxy.io/?{{target}}" },
  ],
  searchEngines: [
    { id: "duckduckgo", label: "DuckDuckGo", url: "https://duckduckgo.com/html/?q={{query}}" },
    { id: "bing", label: "Bing", url: "https://www.bing.com/search?q={{query}}" },
    { id: "wikipedia", label: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search={{query}}" },
  ],
  quickLinks: [
    { label: "Wikipedia", url: "https://en.wikipedia.org" },
    { label: "Hacker News", url: "https://news.ycombinator.com" },
    { label: "DuckDuckGo", url: "https://duckduckgo.com/html/?q=quantum+services" },
    { label: "MDN Web Docs", url: "https://developer.mozilla.org" },
    { label: "Example.com", url: "https://example.com" },
    { label: "Project Gutenberg", url: "https://www.gutenberg.org" },
  ],
};
