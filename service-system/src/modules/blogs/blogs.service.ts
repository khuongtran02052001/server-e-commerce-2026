import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepo: BlogsRepository) {}

  async create(authorId: string, dto: CreateBlogDto) {
    return this.blogsRepo.create({
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      body: dto.body,
      mainImageUrl: dto.mainImageUrl,
      isLatest: dto.isLatest ?? false,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      author: {
        connect: { id: authorId },
      },
      categories: dto.categoryIds
        ? {
            connect: dto.categoryIds.map((id) => ({ id })),
          }
        : undefined,
    });
  }

  findAll() {
    return this.blogsRepo.findAll();
  }

  getLastBlogs(limit = 4) {
    return this.blogsRepo.findLast(limit);
  }

  async findBySlug(slug: string) {
    const blog = await this.blogsRepo.findBySlug(slug);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    await this.ensureExists(id);

    return this.blogsRepo.update(id, {
      ...dto,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      categories: dto.categoryIds
        ? {
            set: dto.categoryIds.map((id) => ({ id })),
          }
        : undefined,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.blogsRepo.softDelete(id);
  }

  private async ensureExists(id: string) {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }
}
