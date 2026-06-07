import { logger } from "@/lib/logger";
import { getOGRenderer } from "@/lib/og/renderer";
import { NextRequest } from "next/server";
import { escapeUnsafeHtml } from "@/utils/sanitizer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = escapeUnsafeHtml(searchParams.get("title") || "Đồng ngôn");
    const author = escapeUnsafeHtml(searchParams.get("author") || "Nghiên bút");
    const text = escapeUnsafeHtml(searchParams.get("text") || "");
    const category = escapeUnsafeHtml(searchParams.get("category") || "Văn chương");
    const status = escapeUnsafeHtml(searchParams.get("status") || "");
    const type = searchParams.get("type") || "work";
    const description = escapeUnsafeHtml(searchParams.get("description") || "");

    const renderer = await getOGRenderer();

    let buffer: Buffer;

    if (type === "profile") {
      const truncatedDesc =
        description.length > 60 ? description.substring(0, 57) + "..." : description;
      buffer = await renderer.renderToImage(
        "brutalist-work",
        {
          title: author,
          subtitle: truncatedDesc,
        },
        {
          width: 1200,
          height: 630,
        }
      );
    } else if (type === "contribution" && text) {
      buffer = await renderer.renderToImage(
        "brutalist-quote",
        {
          text: text,
          author: author,
        },
        {
          width: 1200,
          height: 630,
        }
      );
    } else {
      buffer = await renderer.renderToImage(
        "brutalist-work",
        {
          title: title,
          subtitle: `${category}${status ? ` • ${status}` : ""}`,
        },
        {
          width: 1200,
          height: 630,
        }
      );
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, IMMUTABLE, no-transform, max-age=31536000",
      },
    });
  } catch (error: unknown) {
    logger.error("Failed to generate OG image", error);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
