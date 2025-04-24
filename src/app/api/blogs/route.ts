import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllBlogs, 
  getFeaturedBlogs, 
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementBlogViews
} from '@/lib/db/blogs';

// GET all blogs or featured blogs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured') === 'true';
    const slug = searchParams.get('slug');
    const incrementViews = searchParams.get('incrementViews') === 'true';
    
    if (slug) {
      const blog = await getBlogBySlug(slug);
      
      if (!blog) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      
      // Increment view count if requested
      if (incrementViews) {
        await incrementBlogViews(slug);
      }
      
      return NextResponse.json(blog);
    }
    
    const blogs = featured ? await getFeaturedBlogs() : await getAllBlogs();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' }, 
      { status: 500 }
    );
  }
}

// POST a new blog
export async function POST(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const blogData = await req.json();
    const blog = await createBlog(blogData);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' }, 
      { status: 500 }
    );
  }
}

// PUT to update a blog
export async function PUT(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Blog slug is required' }, 
        { status: 400 }
      );
    }
    
    const blogData = await req.json();
    const blog = await updateBlog(slug, blogData);
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' }, 
      { status: 500 }
    );
  }
}

// DELETE a blog
export async function DELETE(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Blog slug is required' }, 
        { status: 400 }
      );
    }
    
    await deleteBlog(slug);
    return NextResponse.json(
      { message: 'Blog deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' }, 
      { status: 500 }
    );
  }
}