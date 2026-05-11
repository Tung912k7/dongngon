import { getOGRenderer } from '@/lib/og/renderer';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Đồng ngôn';
    const author = searchParams.get('author') || 'Nghiên bút';
    const text = searchParams.get('text') || '';
    const category = searchParams.get('category') || 'Văn chương';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || 'work';
    const description = searchParams.get('description') || '';

    const renderer = await getOGRenderer();

    let buffer: Buffer;

    if (type === 'profile') {
      const truncatedDesc = description.length > 60 ? description.substring(0, 57) + '...' : description;
      buffer = await renderer.renderToImage('brutalist-work', {
        title: author,
        subtitle: truncatedDesc,
      }, {
        width: 1200,
        height: 630,
      });
    } else if (type === 'contribution' && text) {
      buffer = await renderer.renderToImage('brutalist-quote', {
        text: text,
        author: author,
      }, {
        width: 1200,
        height: 630,
      });
    } else {
      buffer = await renderer.renderToImage('brutalist-work', {
        title: title,
        subtitle: `${category}${status ? ` • ${status}` : ''}`,
      }, {
        width: 1200,
        height: 630,
      });
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, IMMUTABLE, no-transform, max-age=31536000',
      },
    });
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
