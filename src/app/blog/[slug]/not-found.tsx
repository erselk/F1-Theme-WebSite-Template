import Link from 'next/link';

export default function BlogSlugNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold font-titillium-web mb-6">Blog Bulunamadı / Blog Not Found</h1>
      
      <div className="max-w-2xl mx-auto mb-8">
        <p className="mb-4 text-medium-grey dark:text-silver">
          Aradığınız blog yazısı bulunamadı. Lütfen adresi kontrol edin veya blog sayfamıza geri dönün.
        </p>
        <p className="mb-8 text-medium-grey dark:text-silver">
          The blog post you are looking for could not be found. Please check the address or return to our blog page.
        </p>
        
        <Link 
          href="/blog" 
          className="inline-block px-6 py-3 rounded-md bg-f1-red dark:bg-neon-red hover:bg-f1-red/90 dark:hover:bg-neon-red/90 text-white transition-colors"
        >
          Blog Sayfasına Dön / Return to Blog
        </Link>
      </div>
    </div>
  );
}