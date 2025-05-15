import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to /home
  if (pathname === '/' || pathname === '') {
    const newUrl = new URL('/home', request.url);
    return NextResponse.redirect(newUrl, 307); // 307 temporary redirect to preserve HTTP method
  }

  // Handle /en path to redirect to /home with English language
  if (pathname === '/en' || pathname === '/en/') {
    // Redirect to /home
    const newUrl = new URL('/home', request.url);
    
    // Create the response with redirect
    const response = NextResponse.redirect(newUrl, 301); // Use 301 permanent redirect
    
    // Set the language cookie to English
    response.cookies.set('NEXT_LOCALE', 'en', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
    
    return response;
  }

  // Handle /tr path to redirect to /home with Turkish language
  if (pathname === '/tr' || pathname === '/tr/') {
    // Redirect to /home
    const newUrl = new URL('/home', request.url);
    
    // Create the response with redirect
    const response = NextResponse.redirect(newUrl, 301); // Use 301 permanent redirect
    
    // Set the language cookie to Turkish
    response.cookies.set('NEXT_LOCALE', 'tr', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
    
    return response;
  }
  
  // Handle other language paths - redirect to /home/{path} with appropriate language cookie
  if (pathname.startsWith('/en/') || pathname.startsWith('/tr/')) {
    const language = pathname.startsWith('/en/') ? 'en' : 'tr';
    const newPath = '/home' + pathname.replace(/^\/(en|tr)/, '');
    
    // Create a new URL with the updated path
    const newUrl = new URL(newPath, request.url);
    
    // Create the response with redirect
    const response = NextResponse.redirect(newUrl, 301);
    
    // Set the language cookie
    response.cookies.set('NEXT_LOCALE', language, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
    
    return response;
  }

  // Handle 404 pages - catch all non-existent paths and redirect to /home
  // This will match any path that's not in the allowed list
  const allowedPaths = [
    '/home', 
    '/about', 
    '/events', 
    '/services', 
    '/blog', 
    '/contact', 
    '/book',
    '/payment', // Added payment path to allowed paths
    '/confirmation', // Yeni eklendi: Onay sayfalarına izin ver
    '/privacy',
    '/terms',
    '/admin'
  ];
  
  // Check if the current path starts with any of the allowed paths
  const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));
  
  // If it's not an allowed path and not a system path, redirect to /home
  if (!isAllowedPath && 
      !pathname.startsWith('/api') && 
      !pathname.startsWith('/_next') && 
      !pathname.includes('favicon.ico') && 
      !pathname.startsWith('/images') && 
      !pathname.startsWith('/locales')) {
    const newUrl = new URL('/home', request.url);
    return NextResponse.redirect(newUrl, 302); // 302 Found redirect
  }

  return NextResponse.next();
}

// Configure the matcher to catch all paths
export const config = {
  matcher: [
    '/',
    '/en', 
    '/en/', 
    '/tr',
    '/tr/',
    '/en/:path*', 
    '/tr/:path*',
    // Catch-all for 404 pages - match everything except static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};