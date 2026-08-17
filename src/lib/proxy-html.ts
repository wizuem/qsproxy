/**
 * HTML post-processing for the Quantum Browser.
 * Runs server-side only (imported by proxy.functions.ts).
 */

export function extractTitle(html: string): string {
  const match = /<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Bridge script: forwards link clicks + page title to the parent shell. */
const BRIDGE = `<script>(function(){
  function post(msg){ try { parent.postMessage(Object.assign({__quantum:true}, msg), "*"); } catch (e) {} }
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(javascript|mailto|tel):/i.test(href)) return;
    e.preventDefault();
    post({ type: "navigate", url: a.href });
  }, true);
  document.addEventListener("submit", function(e){ e.preventDefault(); }, true);
  window.addEventListener("load", function(){
    post({ type: "meta", title: document.title, links: document.querySelectorAll("a").length });
  });
  post({ type: "ready", title: document.title });
})();</script>`;

const READER_CSS = `<style>
  html { background: #0f1020; }
  body { max-width: 44rem !important; margin: 0 auto !important; padding: 2.5rem 1.25rem 4rem !important;
    background: #0f1020 !important; color: #e8e6f5 !important;
    font: 17px/1.7 -apple-system, "Segoe UI", system-ui, sans-serif !important; }
  * { background-image: none !important; box-shadow: none !important; float: none !important;
    position: static !important; max-width: 100% !important; }
  header, footer, nav, aside, iframe, video, [role="banner"], [role="navigation"],
  [class*="sidebar"], [class*="advert"], [id*="advert"], [class*="cookie"], [class*="popup"] { display: none !important; }
  img { height: auto !important; border-radius: 10px; }
  a { color: #b598ff !important; }
  h1,h2,h3 { color: #fff !important; line-height: 1.25 !important; }
  pre, code { background: #1b1c33 !important; color: #e8e6f5 !important; }
</style>`;

const SHELL_CSS = `<style>
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: rgba(140,120,255,.45); border-radius: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
</style>`;

export function buildProxyDocument(options: {
  html: string;
  baseUrl: string;
  isHtml: boolean;
  blockScripts: boolean;
  readerMode: boolean;
}) {
  const { baseUrl, isHtml, blockScripts, readerMode } = options;

  if (!isHtml) {
    return `<!doctype html><html><head><meta charset="utf-8">${SHELL_CSS}</head>
<body style="margin:0;background:#0f1020;color:#e8e6f5;font:14px/1.7 ui-monospace,monospace;padding:1.25rem;white-space:pre-wrap;word-break:break-word">${escapeHtml(
      options.html,
    )}</body></html>`;
  }

  let html = options.html;

  // Remove things that break inside a sandboxed frame.
  html = html.replace(/<base[^>]*>/gi, "");
  html = html.replace(/<meta[^>]+http-equiv=["']?(refresh|content-security-policy)[^>]*>/gi, "");
  if (blockScripts) {
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<script\b[^>]*\/?>/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
    html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  }

  const head = `<base href="${escapeHtml(baseUrl)}"><meta name="referrer" content="no-referrer">${SHELL_CSS}${
    readerMode ? READER_CSS : ""
  }${BRIDGE}`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>${head}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, (_m, attrs) => `<html${attrs}><head>${head}</head>`);
  }
  return `<!doctype html><html><head>${head}</head><body>${html}</body></html>`;
}
