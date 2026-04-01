import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get parameters from URL
    const title = searchParams.get('title') || 'Đồng ngôn';
    const author = searchParams.get('author') || 'Nghiên bút';
    const category = searchParams.get('category') || 'Văn chương';
    const status = searchParams.get('status') || 'Đang viết';
    const type = searchParams.get('type') || 'work'; // 'work' or 'profile'

    // Branding colors
    const bgColor = '#FFFFFF';
    const accentColor = '#D4A155'; // Manuscript Gold
    const borderColor = '#000000';

    if (type === 'profile') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor,
              padding: '80px',
              border: `20px solid ${borderColor}`,
            }}
          >
            {/* Logo placeholder / background pattern */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 40,
                fontSize: 24,
                fontWeight: 'bold',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Đồng ngôn
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 'black',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  maxWidth: '800px',
                }}
              >
                {author}
              </div>
              <div
                style={{
                  padding: '10px 24px',
                  backgroundColor: accentColor,
                  color: 'black',
                  fontSize: 24,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  border: `4px solid ${borderColor}`,
                  boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                }}
              >
                Tác gia đồng ngôn
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 80,
                left: 80,
                fontSize: 20,
                color: 'rgba(0,0,0,0.4)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Nhất ngôn xuất, vạn kiếp hồi thanh
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Default Work OG
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor,
            padding: '80px',
            border: `20px solid ${borderColor}`,
          }}
        >
          {/* Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              fontSize: 24,
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Đồng ngôn
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
              maxWidth: '1000px',
            }}
          >
            {/* Category Tag */}
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'black',
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              {category}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 96,
                fontWeight: 'black',
                lineHeight: 1.1,
                color: 'black',
                textAlign: 'center',
                textTransform: 'capitalize',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Quote */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              fontSize: 18,
              color: 'rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
            }}
          >
            NHẤT NGÔN XUẤT, VẠN KIẾP HỒI THANH
          </div>

          {/* Decorative Brutalist Elements */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              width: '100px',
              height: '100px',
              border: '4px solid black',
              zIndex: -1,
              transform: 'rotate(10deg) translate(20px, -20px)',
              opacity: 0.1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              width: '150px',
              height: '150px',
              border: '4px solid black',
              borderRadius: '100%',
              zIndex: -1,
              transform: 'translate(-50px, 50px)',
              opacity: 0.1,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
