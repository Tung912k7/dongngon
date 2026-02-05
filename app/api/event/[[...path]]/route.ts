import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  const pathString = path ? path.join('/') : ''
  const isStatic = pathString.startsWith('static')
  const posthogHost = isStatic ? 'https://us-assets.i.posthog.com' : 'https://us.i.posthog.com'
  
  const searchParams = request.nextUrl.searchParams.toString()
  const targetUrl = `${posthogHost}/${pathString}${searchParams ? `?${searchParams}` : ''}`

  const headers = new Headers(request.headers)
  headers.set('host', posthogHost.replace('https://', ''))
  // Disable compression for forwarded requests to avoid encoding issues
  headers.delete('accept-encoding')
  
  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    });
  } catch (error) {
    console.error('PostHog proxy error (POST):', error);
    return new NextResponse('Bad Gateway', { status: 502 });
  }

  // Create a new response to sanitize headers and prevent decoding errors
  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  const pathString = path ? path.join('/') : ''
  const isStatic = pathString.startsWith('static')
  const posthogHost = isStatic ? 'https://us-assets.i.posthog.com' : 'https://us.i.posthog.com'
  
  const searchParams = request.nextUrl.searchParams.toString()
  const targetUrl = `${posthogHost}/${pathString}${searchParams ? `?${searchParams}` : ''}`

  const headers = new Headers(request.headers)
  headers.set('host', posthogHost.replace('https://', ''))
  // Disable compression for forwarded requests
  headers.delete('accept-encoding')

  let response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
    });
  } catch (error) {
    console.error('PostHog proxy error (GET):', error);
    return new NextResponse('Bad Gateway', { status: 502 });
  }

  // Sanitize headers for the response
  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}
