import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogBySlug, getAllBlogs } from '@/services/mongo-service';
import BlogDetail from '@/components/features/blog/BlogDetail';

type Props = {
  params: { slug: string }
}

// Generate metadata for each blog page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  
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
  const blogs = await getAllBlogs();
  
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogDetail blog={blog} />
    </div>
  );
}