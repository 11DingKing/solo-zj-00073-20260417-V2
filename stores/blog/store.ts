import {
  type Blog,
  type BlogCreateReq,
  type BlogListReq,
  type BlogListResp,
  type BlogCursorListReq,
  type BlogCursorListResp,
  type RelatedBlogsReq,
} from "@/types/blog";
import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { type IBlogStore } from "./interface";

interface BlogWithHighlight extends Blog {
  _highlight?: {
    title?: string;
    description?: string;
  };
}

export class BlogStore implements IBlogStore {
  async create(data: BlogCreateReq): Promise<Blog> {
    const {
      title,
      slug,
      description,
      content,
      cover,
      published,
      categoryId,
      tags,
    } = data;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        description,
        content,
        cover,
        published: published || false,
        category: {
          connect: { id: categoryId },
        },
        tags: tags
          ? {
              create: tags.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(blog);
  }

  async update(id: string, data: Partial<BlogCreateReq>): Promise<Blog | null> {
    const { tags, categoryId, ...rest } = data;

    const updateData: any = { ...rest };

    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId },
      };
    }

    if (tags) {
      await prisma.blogTag.deleteMany({
        where: { blogId: id },
      });

      updateData.tags = {
        create: tags.map((tagId) => ({
          tag: {
            connect: { id: tagId },
          },
        })),
      };
    }

    const blog = await prisma.blog.update({
      where: { id: id },
      data: updateData,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(blog);
  }

  async delete(id: string): Promise<void> {
    await prisma.blog.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) return null;
    return this.mapToDomain(blog);
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        deletedAt: null,
        published: true,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!blog) return null;
    return this.mapToDomain(blog);
  }

  async findAll(params?: BlogListReq): Promise<BlogListResp> {
    const {
      page = 1,
      pageSize = 10,
      title,
      search,
      categoryId,
      tagId,
      published,
      sortBy = "createdAt",
      order = "desc",
    } = params || {};

    const skip = (page - 1) * pageSize;
    const where: Prisma.BlogWhereInput = { deletedAt: null };

    if (published !== undefined) where.published = published;
    if (categoryId) where.categoryId = categoryId;

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    const searchKeyword = search || title;

    const orderBy = { [sortBy]: order };

    if (searchKeyword) {
      return this.searchWithHighlight({
        where,
        searchKeyword,
        skip,
        take: pageSize,
        orderBy,
      });
    }

    const [total, list] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      lists: list.map(this.mapToDomain),
    };
  }

  async findAllWithCursor(params: BlogCursorListReq): Promise<BlogCursorListResp> {
    const {
      cursor,
      pageSize = 10,
      search,
      categoryId,
      tagId,
      published,
      sortBy = "createdAt",
      order = "desc",
    } = params;

    const where: Prisma.BlogWhereInput = { deletedAt: null };

    if (published !== undefined) where.published = published;
    if (categoryId) where.categoryId = categoryId;

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    const orderBy = { [sortBy]: order };

    if (search) {
      return this.searchWithCursor({
        where,
        searchKeyword: search,
        cursor,
        take: pageSize,
        orderBy,
        sortBy,
        order,
      });
    }

    let cursorCondition: Prisma.BlogWhereInput | undefined;
    if (cursor) {
      const cursorBlog = await prisma.blog.findUnique({
        where: { id: cursor },
        select: { [sortBy]: true, id: true },
      });

      if (cursorBlog) {
        const sortValue = cursorBlog[sortBy as keyof typeof cursorBlog];
        if (order === "desc") {
          cursorCondition = {
            OR: [
              { [sortBy]: { lt: sortValue } },
              { [sortBy]: { equals: sortValue }, id: { lt: cursor } },
            ],
          } as Prisma.BlogWhereInput;
        } else {
          cursorCondition = {
            OR: [
              { [sortBy]: { gt: sortValue } },
              { [sortBy]: { equals: sortValue }, id: { gt: cursor } },
            ],
          } as Prisma.BlogWhereInput;
        }
      }
    }

    const queryWhere = cursorCondition
      ? { ...where, ...cursorCondition }
      : where;

    const [total, list] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where: queryWhere,
        take: pageSize + 1,
        orderBy,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    const hasNext = list.length > pageSize;
    const items = hasNext ? list.slice(0, pageSize) : list;

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (items.length > 0) {
      const lastItem = items[items.length - 1]!;
      nextCursor = hasNext ? lastItem.id : undefined;

      if (cursor) {
        const firstItem = items[0];
        if (firstItem) {
          const prevCount = await prisma.blog.count({
            where: {
              ...where,
              NOT: {
                OR: [
                  { id: cursor },
                  {
                    [sortBy]: order === "desc"
                      ? { lt: firstItem[sortBy as keyof typeof firstItem] }
                      : { gt: firstItem[sortBy as keyof typeof firstItem] },
                  },
                ],
              },
            },
          } as any);
          prevCursor = prevCount > 0 ? cursor : undefined;
        }
      }
    }

    return {
      lists: items.map(this.mapToDomain),
      total,
      hasNext,
      hasPrev: !!prevCursor,
      nextCursor,
      prevCursor,
    };
  }

  async findRelatedBlogs(params: RelatedBlogsReq): Promise<Blog[]> {
    const { blogId, categoryId, limit = 5 } = params;

    const blogs = await prisma.blog.findMany({
      where: {
        deletedAt: null,
        published: true,
        categoryId: categoryId,
        id: { not: blogId },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return blogs.map(this.mapToDomain);
  }

  async togglePublish(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
    });

    if (!blog) return null;

    const updatedBlog = await prisma.blog.update({
      where: { id: id },
      data: {
        published: !blog.published,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToDomain(updatedBlog);
  }

  private async searchWithHighlight({
    where,
    searchKeyword,
    skip,
    take,
    orderBy,
  }: {
    where: Prisma.BlogWhereInput;
    searchKeyword: string;
    skip: number;
    take: number;
    orderBy: Prisma.BlogOrderByWithRelationInput;
  }): Promise<BlogListResp> {
    const tsQuery = this.buildTsQuery(searchKeyword);

    const baseWhere = {
      ...where,
      OR: [
        { title: { contains: searchKeyword } },
        { description: { contains: searchKeyword } },
      ],
    } as Prisma.BlogWhereInput;

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where: baseWhere }),
      prisma.blog.findMany({
        where: baseWhere,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    const highlightedBlogs = blogs.map((blog) => {
      const domainBlog = this.mapToDomain(blog) as BlogWithHighlight;
      domainBlog._highlight = this.highlightSearchTerms(
        blog.title,
        blog.description,
        searchKeyword,
      );
      return domainBlog;
    });

    return {
      total,
      lists: highlightedBlogs,
    };
  }

  private async searchWithCursor({
    where,
    searchKeyword,
    cursor,
    take,
    orderBy,
    sortBy,
    order,
  }: {
    where: Prisma.BlogWhereInput;
    searchKeyword: string;
    cursor?: string;
    take: number;
    orderBy: Prisma.BlogOrderByWithRelationInput;
    sortBy: string;
    order: "asc" | "desc";
  }): Promise<BlogCursorListResp> {
    const baseWhere = {
      ...where,
      OR: [
        { title: { contains: searchKeyword } },
        { description: { contains: searchKeyword } },
      ],
    } as Prisma.BlogWhereInput;

    let cursorCondition: Prisma.BlogWhereInput | undefined;
    if (cursor) {
      const cursorBlog = await prisma.blog.findUnique({
        where: { id: cursor },
        select: { [sortBy]: true, id: true },
      });

      if (cursorBlog) {
        const sortValue = cursorBlog[sortBy as keyof typeof cursorBlog];
        if (order === "desc") {
          cursorCondition = {
            OR: [
              { [sortBy]: { lt: sortValue } },
              { [sortBy]: { equals: sortValue }, id: { lt: cursor } },
            ],
          } as Prisma.BlogWhereInput;
        } else {
          cursorCondition = {
            OR: [
              { [sortBy]: { gt: sortValue } },
              { [sortBy]: { equals: sortValue }, id: { gt: cursor } },
            ],
          } as Prisma.BlogWhereInput;
        }
      }
    }

    const queryWhere = cursorCondition
      ? { ...baseWhere, ...cursorCondition }
      : baseWhere;

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where: baseWhere }),
      prisma.blog.findMany({
        where: queryWhere,
        take: take + 1,
        orderBy,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
    ]);

    const hasNext = blogs.length > take;
    const items = hasNext ? blogs.slice(0, take) : blogs;

    const highlightedBlogs = items.map((blog) => {
      const domainBlog = this.mapToDomain(blog) as BlogWithHighlight;
      domainBlog._highlight = this.highlightSearchTerms(
        blog.title,
        blog.description,
        searchKeyword,
      );
      return domainBlog;
    });

    let nextCursor: string | undefined;
    if (items.length > 0) {
      const lastItem = items[items.length - 1]!;
      nextCursor = hasNext ? lastItem.id : undefined;
    }

    return {
      lists: highlightedBlogs,
      total,
      hasNext,
      hasPrev: !!cursor,
      nextCursor,
      prevCursor: cursor,
    };
  }

  private buildTsQuery(keyword: string): string {
    const terms = keyword.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return "";
    return terms.map((term) => `${term}:*`).join(" & ");
  }

  private highlightSearchTerms(
    title: string,
    description: string,
    keyword: string,
  ): { title?: string; description?: string } {
    const terms = keyword.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return {};
    }

    const pattern = new RegExp(`(${terms.map((t) => this.escapeRegex(t)).join("|")})`, "gi");

    const highlightedTitle = pattern.test(title)
      ? title.replace(pattern, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
      : undefined;

    const highlightedDescription = pattern.test(description)
      ? description.replace(pattern, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
      : undefined;

    return {
      title: highlightedTitle,
      description: highlightedDescription,
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private mapToDomain(prismaModel: any): Blog {
    return {
      ...prismaModel,
      id: prismaModel.id.toString(),
      categoryId: prismaModel.categoryId.toString(),
      createdAt: prismaModel.createdAt.toISOString(),
      updatedAt: prismaModel.updatedAt.toISOString(),
      deletedAt: prismaModel.deletedAt?.toISOString(),
      category: prismaModel.category
        ? {
            ...prismaModel.category,
            id: prismaModel.category.id.toString(),
            createdAt: prismaModel.category.createdAt.toISOString(),
            updatedAt: prismaModel.category.updatedAt.toISOString(),
          }
        : undefined,
      tags: prismaModel.tags?.map((t: any) => ({
        ...t.tag,
        id: t.tag.id.toString(),
        createdAt: t.tag.createdAt.toISOString(),
        updatedAt: t.tag.updatedAt.toISOString(),
      })),
    };
  }
}
