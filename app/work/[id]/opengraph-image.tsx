import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export const alt = 'Đồng ngôn - Tác phẩm';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: work } = await supabase
    .from('works')
    .select('title, author_nickname, sub_category')
    .eq('id', params.id)
    .single();

  if (!work) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          Đồng ngôn
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          border: '20px solid black',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#666',
              marginBottom: '20px',
            }}
          >
            {work.sub_category || 'Tác phẩm'}
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: 'black',
              lineHeight: 1.1,
              maxWidth: '900px',
              fontStyle: 'italic',
            }}
          >
            {work.title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, color: '#999', marginBottom: '8px', fontWeight: 'bold' }}>TÁC GIẢ</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: 'black' }}>{work.author_nickname}</div>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              background: 'black',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
            }}
          >
            Đồng ngôn
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
