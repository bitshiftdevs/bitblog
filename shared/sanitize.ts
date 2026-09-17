const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
};

const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

const VOID_TAGS = new Set(["br"]);

const escapeText = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const parseAttrs = (raw: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[name] = value;
  }
  return attrs;
};

const renderTag = (tag: string, attrs: Record<string, string>, closing: boolean) => {
  if (closing) return `</${tag}>`;
  const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
  const parts: string[] = [tag];
  for (const [name, value] of Object.entries(attrs)) {
    if (!allowed.has(name)) continue;
    if (name === "href") {
      if (!SAFE_URL.test(value.trim())) continue;
    }
    parts.push(`${name}="${escapeAttr(value)}"`);
  }
  if (tag === "a") {
    parts.push('rel="noopener noreferrer nofollow"');
    parts.push('target="_blank"');
  }
  return `<${parts.join(" ")}${VOID_TAGS.has(tag) ? " /" : ""}>`;
};

/**
 * Allowlist-based HTML sanitizer safe for untrusted comment input.
 * Any tag/attribute not on the allowlist is escaped as text.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Strip null bytes and control chars (except tab/newline/carriage return)
  const cleaned = html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  let out = "";
  let i = 0;
  const len = cleaned.length;
  while (i < len) {
    const lt = cleaned.indexOf("<", i);
    if (lt === -1) {
      out += escapeText(cleaned.slice(i));
      break;
    }
    if (lt > i) out += escapeText(cleaned.slice(i, lt));

    // Strip HTML comments, CDATA, DOCTYPE, processing instructions entirely
    if (cleaned.startsWith("<!--", lt)) {
      const end = cleaned.indexOf("-->", lt + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }
    if (cleaned.startsWith("<!", lt) || cleaned.startsWith("<?", lt)) {
      const end = cleaned.indexOf(">", lt + 1);
      i = end === -1 ? len : end + 1;
      continue;
    }

    const gt = cleaned.indexOf(">", lt + 1);
    if (gt === -1) {
      out += escapeText(cleaned.slice(lt));
      break;
    }

    const raw = cleaned.slice(lt + 1, gt);
    const closing = raw.startsWith("/");
    const body = closing ? raw.slice(1) : raw;
    const nameMatch = body.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
    if (!nameMatch) {
      out += escapeText(cleaned.slice(lt, gt + 1));
      i = gt + 1;
      continue;
    }
    const tag = nameMatch[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      // Skip disallowed tag entirely (drop the tag, keep no content indicator)
      i = gt + 1;
      continue;
    }
    const attrPart = body.slice(nameMatch[0].length).replace(/\/\s*$/, "");
    const attrs = closing ? {} : parseAttrs(attrPart);
    out += renderTag(tag, attrs, closing);
    i = gt + 1;
  }
  return out;
}
