import { Metadata } from 'next';
import BlogPageHeader from '@/components/features/blog/BlogPageHeader';
import BlogContent from '@/components/features/blog/BlogContent';

export const metadata: Metadata = {
  title: 'Blog | PadokClub',
  description: 'Motorsport ve F1 ile ilgili son haberler, içerikler ve makaleler',
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogPageHeader />
      <BlogContent />
    </div>
  );
}