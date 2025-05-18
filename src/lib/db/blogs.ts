import { prisma } from './prisma';
import type { Blog } from '@prisma/client';

type LocalizedText = {
  tr: string;
  en: string;
};

export async function getAllBlogs() {
  return prisma.blog.findMany({
    orderBy: { publishDate: 'desc' }
  });
}

export async function getFeaturedBlogs() {
  return prisma.blog.findMany({
    where: { isFeatured: true },
    orderBy: { publishDate: 'desc' }
  });
}

export async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({
    where: { slug }
  });
}

export async function incrementBlogViews(slug: string) {
  return prisma.blog.update({
    where: { slug },
    data: {
      views: {
        increment: 1
      }
    }
  });
}

export async function createBlog(blogData: {
  slug: string;
  coverImage?: string;
  author: string;
  isFeatured?: boolean;
  publishDate: Date | string;
  title: LocalizedText;
  summary: LocalizedText;
  content: LocalizedText;
  tags: string[];
  category: string;
}) {
  return prisma.blog.create({
    data: {
      ...blogData,
      publishDate: typeof blogData.publishDate === 'string' 
        ? new Date(blogData.publishDate) 
        : blogData.publishDate,
      comments: [],
      views: 0
    }
  });
}

export async function updateBlog(slug: string, blogData: Partial<Blog>) {
  return prisma.blog.update({
    where: { slug },
    data: blogData
  });
}

export async function deleteBlog(slug: string) {
  return prisma.blog.delete({
    where: { slug }
  });
}

export async function addCommentToBlog(
  slug: string, 
  comment: { id: string; userId: string; text: string; createdAt: Date }
) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    select: { comments: true }
  });
  
  if (!blog) throw new Error('Blog not found');
  
  const comments = [...blog.comments, comment];
  
  return prisma.blog.update({
    where: { slug },
    data: { comments }
  });
}

export async function importBlogsFromFiles(blogs: any[]) {
  await prisma.blog.deleteMany();
  
  const importPromises = blogs.map(blogData => {
    return prisma.blog.create({
      data: {
        slug: blogData.slug,
        coverImage: blogData.coverImage,
        author: blogData.author,
        isFeatured: blogData.isFeatured || false,
        publishDate: new Date(blogData.publishDate),
        title: blogData.title,
        summary: blogData.summary,
        content: blogData.content,
        tags: blogData.tags || [],
        category: blogData.category,
        comments: [],
        views: 0
      }
    });
  });
  
  return Promise.all(importPromises);
}