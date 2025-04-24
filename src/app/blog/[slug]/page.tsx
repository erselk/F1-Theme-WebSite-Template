import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogBySlug, getBlogs } from '@/data/blogs';
import BlogDetail from '@/components/features/blog/BlogDetail';

// Generate metadata for each blog page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = getBlogBySlug(params.slug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found | PadokClub',
    };
  }
  
  return {
    title: `${blog.title.en} | PadokClub Blog`,
    description: blog.excerpt.en,
    openGraph: {
      title: blog.title.en,
      description: blog.excerpt.en,
      images: [{ url: blog.coverImage }],
    },
  };
}

// Generate static paths for all blogs
export async function generateStaticParams() {
  const blogs = getBlogs();
  
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogDetail blog={blog} />
    </div>
  );
}