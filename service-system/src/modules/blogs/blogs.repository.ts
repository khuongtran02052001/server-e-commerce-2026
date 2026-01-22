import { Injectable } from '@nestjs/common';
import { Blog, Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.BlogCreateInput): Promise<Blog> {
    return this.prisma.blog.create({ data });
  }

  findAll(): Promise<Blog[]> {
    return this.prisma.blog.findMany({
      where: { deletedAt: null },
      include: {
        author: { select: { id: true, email: true } },
        categories: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  findLast(limit: number): Promise<Blog[]> {
    return this.prisma.blog.findMany({
      where: {
        deletedAt: null,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { id: true, email: true } },
        categories: true,
      },
    });
  }

  findBySlug(slug: string): Promise<Blog | null> {
    return this.prisma.blog.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        author: { select: { id: true, email: true } },
        categories: true,
      },
    });
  }

  findById(id: string): Promise<Blog | null> {
    return this.prisma.blog.findFirst({
      where: { id, deletedAt: null },
    });
  }

  update(id: string, data: Prisma.BlogUpdateInput): Promise<Blog> {
    return this.prisma.blog.update({
      where: { id },
      data,
    });
  }

  softDelete(id: string): Promise<Blog> {
    return this.prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
