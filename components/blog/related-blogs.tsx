import Link from "next/link";
import type { Blog } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronRight, FileText } from "lucide-react";

interface RelatedBlogsProps {
  blogs: Blog[];
  title?: string;
}

export function RelatedBlogs({ blogs, title = "相关文章" }: RelatedBlogsProps) {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-accent" />
        {title}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <RelatedBlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}

interface RelatedBlogCardProps {
  blog: Blog;
}

function RelatedBlogCard({ blog }: RelatedBlogCardProps) {
  return (
    <Card
      className={`
        group overflow-hidden rounded-xl p-0 transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      <Link href={`/blog/${blog.slug}`} className="flex flex-col h-full p-4">
        <h3
          className={`
            line-clamp-2 text-base font-semibold text-text transition-colors
            group-hover:text-accent
          `}
        >
          {blog.title}
        </h3>

        <p
          className={`
            line-clamp-2 mt-2 text-sm text-text-secondary
          `}
        >
          {blog.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {blog.category && (
              <Badge variant="secondary" className="text-xs">
                {blog.category.name}
              </Badge>
            )}
            {blog.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-sm text-accent group-hover:gap-2 transition-all">
            <span>阅读</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
