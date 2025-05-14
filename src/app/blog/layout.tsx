import { memo } from 'react';

// React.memo kullanarak BlogLayout bileşenini optimize et
const BlogLayout = memo(function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="blog-layout">
      {children}
    </div>
  );
});

export default BlogLayout;