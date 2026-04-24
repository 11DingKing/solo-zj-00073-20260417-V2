import { notFound } from "next/navigation";
import { getBlogBySlugAction, getRelatedBlogsAction } from "@/app/actions/blog";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { RelatedBlogs } from "@/components/blog/related-blogs";
import { Badge } from "@/components/ui/badge";
import { Title } from "@/components/ui/typography/title";
import { formatSimpleDate } from "@/lib/time";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: "博客未找到",
    };
  }

  const blog = result.data;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      images: blog.cover ? [blog.cover] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const blog = result.data;

  const readingTime = Math.max(1, Math.ceil(blog.content.length / 300));

  const relatedBlogsResult = await getRelatedBlogsAction({
    blogId: blog.id,
    categoryId: blog.categoryId,
    limit: 5,
  });

  const relatedBlogs = relatedBlogsResult.success ? relatedBlogsResult.data || [] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/blog"
        className={`
          mb-8 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors
          hover:text-accent
        `}
      >
        ← 返回博客列表
      </Link>

      <div className="flex gap-8">
        <article className="min-w-0 flex-1">
          {blog.cover && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={blog.cover}
                alt={blog.title}
                width={1200}
                height={630}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}

          <header className="mb-8">
            <Title level={1} className="mb-4">
              {blog.title}
            </Title>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <time>{formatSimpleDate(new Date(blog.createdAt))}</time>
              <span>·</span>
              {blog.category && (
                <>
                  <Badge variant="secondary">{blog.category.name}</Badge>
                  <span>·</span>
                </>
              )}
              <span>{readingTime} 分钟阅读</span>
            </div>
          </header>

          <div className="mb-8 h-px bg-border" />

          <BlogContent content={blog.content} />

          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <RelatedBlogs blogs={relatedBlogs} />
        </article>

        <aside className={`
          hidden w-64 shrink-0
          lg:block
        `}>
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
