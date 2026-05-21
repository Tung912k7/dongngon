import { getOGRenderer } from "@/lib/og/renderer";

export const runtime = "nodejs";
export const alt = "Đồng ngôn - Nơi văn chương hội tụ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const renderer = await getOGRenderer();

  const buffer = await renderer.renderToImage(
    "brutalist-work",
    {
      title: "Nhất ngôn xuất, vạn kiếp hồi thanh",
      subtitle: "KHO TÀNG VĂN HỌC VIỆT",
    },
    {
      ...size,
    }
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, IMMUTABLE, no-transform, max-age=31536000",
    },
  });
}
