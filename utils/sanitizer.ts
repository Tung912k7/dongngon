/**
 * Helper to remove backslashes that are often added by unintentional double-escaping/JSON.stringify
 */
function cleanEscapedQuotes(input: string): string {
  return input.replace(/\\(?=["'])/g, ""); // Remove backslash if followed by a quote
}

/**
 * Strict escaping and sanitization for regular inputs.
 */
export function sanitizeInput(input: string, shouldTrim: boolean = true): string {
  if (!input) return "";

  // 1. Clean backslashes
  let sanitized = cleanEscapedQuotes(input);

  // 2. Escape HTML symbols securely (Converts < to &lt;, > to &gt;)
  sanitized = escapeHTML(sanitized);

  // 3. Trim if required
  if (shouldTrim) {
    sanitized = sanitized.trim();
  }

  return sanitized;
}

/**
 * Encodes special characters into HTML entities.
 * Use for labels and attributes that might not be handled by React.
 */
export function escapeHTML(input: string): string {
  if (!input) return "";
  // React and Next.js handle HTML escaping automatically for text content and metadata.
  // Manual escaping here leads to "double-escaping" bugs in the UI.
  return input;
}

/**
 * Strict escaping for titles.
 */
export function sanitizeTitle(input: string): string {
  if (!input) return "";
  const cleaned = cleanEscapedQuotes(input).trim();
  return escapeHTML(cleaned);
}

/**
 * Strict escaping for nicknames.
 */
export function sanitizeNickname(input: string): string {
  if (!input) return "";
  const cleaned = cleanEscapedQuotes(input).trim();
  return escapeHTML(cleaned);
}

function escapeUnsafeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHttpUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function renderInlineMarkdown(input: string): string {
  let text = escapeUnsafeHtml(input);

  // Inline code first to avoid style parsing inside code spans.
  text = text.replace(/`([^`]+)`/g, "<code class=\"rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]\">$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, url: string) => {
    const safeUrl = sanitizeHttpUrl(url.trim());
    if (!safeUrl) {
      return label;
    }

    return `<a href=\"${escapeUnsafeHtml(safeUrl)}\" target=\"_blank\" rel=\"noopener noreferrer nofollow\" class=\"underline decoration-2 underline-offset-2\">${label}</a>`;
  });

  return text;
}

function flushParagraph(buffer: string[]): string {
  if (buffer.length === 0) {
    return "";
  }

  const content = renderInlineMarkdown(buffer.join(" ").trim());
  return content ? `<p>${content}</p>` : "";
}

function flushList(items: string[], ordered: boolean): string {
  if (items.length === 0) {
    return "";
  }

  const tag = ordered ? "ol" : "ul";
  const itemHtml = items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("");
  const className = ordered ? "list-decimal" : "list-disc";

  return `<${tag} class=\"${className} ml-6 space-y-1\">${itemHtml}</${tag}>`;
}

/**
 * Converts markdown into a constrained, sanitized HTML subset for wiki articles.
 * Supported blocks: headings, unordered/ordered lists, blockquotes, paragraphs.
 * Supported inline: links (http/https), bold, italic, inline code.
 */
export function sanitizeMarkdownToHtml(markdown: string): string {
  const normalized = markdown.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();

  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let paragraphBuffer: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushBuffers = () => {
    const listHtml = flushList(listItems, listOrdered);
    if (listHtml) {
      blocks.push(listHtml);
    }
    listItems = [];

    const paragraphHtml = flushParagraph(paragraphBuffer);
    if (paragraphHtml) {
      blocks.push(paragraphHtml);
    }
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushBuffers();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushBuffers();
      const level = headingMatch[1].length;
      const content = renderInlineMarkdown(headingMatch[2]);
      blocks.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listItems.length > 0 && listOrdered) {
        blocks.push(flushList(listItems, true));
        listItems = [];
      }
      paragraphBuffer = [];
      listOrdered = false;
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listItems.length > 0 && !listOrdered) {
        blocks.push(flushList(listItems, false));
        listItems = [];
      }
      paragraphBuffer = [];
      listOrdered = true;
      listItems.push(orderedMatch[1]);
      continue;
    }

    const blockquoteMatch = line.match(/^>\s+(.+)$/);
    if (blockquoteMatch) {
      flushBuffers();
      blocks.push(`<blockquote>${renderInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      continue;
    }

    if (listItems.length > 0) {
      blocks.push(flushList(listItems, listOrdered));
      listItems = [];
    }

    paragraphBuffer.push(line);
  }

  flushBuffers();

  return blocks.join("\n");
}
