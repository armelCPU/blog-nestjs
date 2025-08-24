import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostIn, CreatePostOut } from './dto/createPosts.dto';
import { UserMinSchema } from 'src/auth/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'transliteration';
import { Post, User } from 'generated/prisma';
import { PostWithUser } from './dto/getPost.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateSlug(title: string): string {
    return slugify(title, { lowercase: true, separator: '-' });
  }

  async create(
    postInDto: CreatePostIn,
    creator: UserMinSchema,
  ): Promise<CreatePostOut> {
    const { title, body } = postInDto;
    // create the slug with this article
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Vérifie l'unicité du slug
    while (await this.prismaService.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create the post
    const newPost = await this.prismaService.post.create({
      data: {
        title,
        body,
        slug,
        userId: creator.userId,
      },
    });

    return {
      title: newPost.title,
      body: newPost.body,
      slug: newPost.slug,
      id: newPost.postId,
    };
  }

  async findAllPosts(): Promise<(Post & { user: User })[]> {
    return this.prismaService.post.findMany({
      include: {
        user: true, // inclut les infos du user
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPostBySlug(slug: string): Promise<PostWithUser | null> {
    const post = await this.prismaService.post.findUnique({
      select: {
        postId: true,
        title: true,
        slug: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
      where: { slug },
    });

    if (post == null) throw new NotFoundException('Post not found');

    return post as unknown as Promise<PostWithUser | null>;
  }
}
