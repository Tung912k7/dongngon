import { getOGRenderer } from '@/lib/og/renderer';
import { createClient } from '@/utils/supabase/server';
import { sanitizeTitle } from '@/utils/sanitizer';

export const runtime = 'nodejs';
export const alt = 'Đồng ngôn - Tác phẩm';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: work } = await supabase
    .from('works')
    .select('title, sub_category, status')
    .eq('id', id)
    .single();

  const title = work ? sanitizeTitle(work.title) : 'Không tìm thấy';
  const subtitle = work ? `${work.sub_category} • ${work.status === 'finished' ? 'HOÀN THÀNH' : 'ĐANG VIẾT'}` : '';

  const renderer = await getOGRenderer();
  
  const buffer = await renderer.renderToImage('brutalist-work', {
    title,
    subtitle,
  }, {
    ...size,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, IMMUTABLE, no-transform, max-age=31536000',
    },
  });
}
