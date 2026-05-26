export function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type ParsedMetadata = Record<string, string | boolean>;

export function parseTemplateHeader(
  rawText: string
): { metadata: ParsedMetadata; content: string } {
  const text = rawText.trimStart();

  let headerBlock = "";
  let content = rawText;

  if (text.startsWith("---")) {
    const lines = text.split(/\r?\n/);
    if (lines[0].trim() === "---") {
      let endIndex = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          endIndex = i;
          break;
        }
      }

      if (endIndex > 0) {
        headerBlock = lines.slice(1, endIndex).join("\n");
        content = lines
          .slice(endIndex + 1)
          .join("\n")
          .trimStart();
      }
    }
  }

  if (!headerBlock && text.startsWith("<!--")) {
    const endComment = text.indexOf("-->");
    if (endComment > -1) {
      headerBlock = text.slice(4, endComment).trim();
      content = text.slice(endComment + 3).trimStart();
    }
  }

  const metadata: ParsedMetadata = {};
  if (headerBlock) {
    const lines = headerBlock.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) continue;

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['\"]|['\"]$/g, "");

      if (key === "slug") metadata.slug = value;
      if (key === "section_slug") metadata.section_slug = value;
      if (key === "section_title") metadata.section_title = value;
      if (key === "title") metadata.title = value;
      if (key === "summary") metadata.summary = value;
      if (key === "sort_order") metadata.sort_order = value;
      if (key === "is_published") metadata.is_published = value.toLowerCase() === "true";
    }
  }

  return { metadata, content };
}
