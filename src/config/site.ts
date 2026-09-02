/**
 * Customize your site here — copy, contact form, proxy behaviour and the
 * catalogues that power the Movies, YouTube, Apps and Games pages.
 */

export const siteConfig = {
  name: "Quantum Services",
  tagline: "Infrastructure at the speed of light",
  description:
    "Quantum Services builds fast, private network infrastructure — secure proxying, edge delivery and hands-on support.",
  email: "quantumservices.devs@gmail.com",
  location: "Remote — worldwide",
  discordInvite: "https://discord.gg/8SAu3EGQB",
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
  /**
   * Privacy-friendly YouTube front-ends. The page tries them in order and uses
   * the first one that answers, so a dead instance never breaks the page.
   * Piped API hosts (pipedapi.*) and Invidious hosts are both supported.
   */
  videoInstances: [
    "https://api.piped.private.coffee",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.drgns.space",
    "https://pipedapi.reallyaweso.me",
    "https://yewtu.be",
    "https://invidious.nerdvpn.de",
  ],
  /** Regions offered on the YouTube page. */
  videoRegions: [
    { id: "US", label: "United States" },
    { id: "GB", label: "United Kingdom" },
    { id: "CA", label: "Canada" },
    { id: "AU", label: "Australia" },
    { id: "DE", label: "Germany" },
    { id: "FR", label: "France" },
    { id: "JP", label: "Japan" },
    { id: "IN", label: "India" },
    { id: "BR", label: "Brazil" },
  ],

  quickLinks: [
    { label: "Quantum AI", url: "", kind: "ai" as const },
    { label: "Discord", url: "https://discord.gg/8SAu3EGQB", kind: "external" as const },
    { label: "YouTube", url: "https://www.youtube.com", kind: "external" as const },
    { label: "Wikipedia", url: "https://en.wikipedia.org" },
    { label: "DuckDuckGo", url: "https://duckduckgo.com/html/?q=quantum+services" },
  ] satisfies { label: string; url: string; kind?: "ai" | "external" }[],
};

/**
 * Movies page. "Watch free" streams public-domain / freely licensed films from
 * the Internet Archive. "Discover" searches film metadata and links out to
 * wherever a title can legally be streamed or rented.
 */
export const moviesConfig = {
  heading: "Quantum Movies",
  subheading:
    "Stream a huge library of public-domain classics right here, or look up any film and jump to a legal stream.",
  /** Internet Archive collections used for the free, in-app library. */
  collections: [
    { id: "feature_films", label: "Feature films" },
    { id: "film_noir", label: "Film noir" },
    { id: "scifi_horror", label: "Sci-fi & horror" },
    { id: "classic_cartoons", label: "Classic cartoons" },
    { id: "silent_films", label: "Silent era" },
    { id: "moviesandfilms", label: "Everything else" },
  ],
  /** Where "find a legal stream" links point. {{query}} is the film title. */
  legalSearch: "https://www.justwatch.com/us/search?q={{query}}",
};

/** Apps page — categorised links, opened inside the Quantum Browser. */
export const appsConfig = {
  heading: "Quantum Apps",
  subheading: "Handy web apps and sites, all launchable straight into the proxy browser.",
  categories: [
    {
      label: "Community",
      apps: [
        { label: "Quantum Discord", url: "https://discord.gg/8SAu3EGQB", note: "Join our server" },
        { label: "Discord Web", url: "https://discord.com/app", note: "Chat in the browser" },
        { label: "Reddit", url: "https://www.reddit.com", note: "Forums & communities" },
        { label: "Lemmy", url: "https://lemmy.world", note: "Open-source Reddit" },
        { label: "Mastodon", url: "https://mastodon.social", note: "Federated social" },
      ],
    },
    {
      label: "Productivity",
      apps: [
        { label: "Google Docs", url: "https://docs.google.com", note: "Documents" },
        { label: "Notion", url: "https://www.notion.so", note: "Notes & wikis" },
        { label: "Excalidraw", url: "https://excalidraw.com", note: "Whiteboarding" },
        { label: "Photopea", url: "https://www.photopea.com", note: "Photoshop in a tab" },
        { label: "Canva", url: "https://www.canva.com", note: "Design" },
        { label: "Cryptpad", url: "https://cryptpad.fr", note: "Private docs" },
      ],
    },
    {
      label: "Learning",
      apps: [
        { label: "Wikipedia", url: "https://en.wikipedia.org", note: "Encyclopedia" },
        { label: "Khan Academy", url: "https://www.khanacademy.org", note: "Courses" },
        { label: "Wolfram Alpha", url: "https://www.wolframalpha.com", note: "Computation" },
        { label: "Desmos", url: "https://www.desmos.com/calculator", note: "Graphing" },
        { label: "Quizlet", url: "https://quizlet.com", note: "Flashcards" },
        { label: "Duolingo", url: "https://www.duolingo.com", note: "Languages" },
      ],
    },
    {
      label: "Music & media",
      apps: [
        { label: "Spotify Web", url: "https://open.spotify.com", note: "Streaming" },
        { label: "SoundCloud", url: "https://soundcloud.com", note: "Indie audio" },
        { label: "Bandcamp", url: "https://bandcamp.com", note: "Buy music" },
        { label: "Internet Archive Audio", url: "https://archive.org/details/audio", note: "Free archive" },
        { label: "Radio Garden", url: "http://radio.garden", note: "World radio" },
      ],
    },
    {
      label: "Developer",
      apps: [
        { label: "GitHub", url: "https://github.com", note: "Code hosting" },
        { label: "CodePen", url: "https://codepen.io", note: "Front-end sandbox" },
        { label: "StackBlitz", url: "https://stackblitz.com", note: "Full IDE" },
        { label: "Regex101", url: "https://regex101.com", note: "Regex tester" },
        { label: "JSON Crack", url: "https://jsoncrack.com", note: "Visualise JSON" },
      ],
    },
    {
      label: "Gaming hubs",
      apps: [
        { label: "itch.io", url: "https://itch.io/games/free/platform-web", note: "Free indie games" },
        { label: "Poki", url: "https://poki.com", note: "Casual games" },
        { label: "Chess.com", url: "https://www.chess.com/play", note: "Chess" },
        { label: "Lichess", url: "https://lichess.org", note: "Free chess" },
        { label: "Krunker", url: "https://krunker.io", note: "Browser FPS" },
        { label: "Skribbl.io", url: "https://skribbl.io", note: "Draw & guess" },
      ],
    },
  ],
};
