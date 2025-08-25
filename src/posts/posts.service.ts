import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostIn, CreatePostOut } from './dto/createPosts.dto';
import { UserMinSchema } from 'src/auth/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'transliteration';
import { Post, User } from 'generated/prisma';
import { PostWithUser } from './dto/getPost.dto';
import { UpdatePostIn } from './dto/updatePosts.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateSlug(title: string): string {
    return slugify(title, { lowercase: true, separator: '-' });
  }

  private async getSlug(
    title: string,
    postToExcludeId?: number,
  ): Promise<string> {
    // create the slug with this article
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Vérifie l'unicité du slug
    while (
      await this.prismaService.post.findFirst({
        where: {
          slug,
          ...(postToExcludeId ? { NOT: { postId: postToExcludeId } } : {}),
        },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  async create(
    postInDto: CreatePostIn,
    creator: UserMinSchema,
  ): Promise<CreatePostOut> {
    const { title, body } = postInDto;
    const slug = await this.getSlug(title);

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

  async update(
    postUpdateDto: UpdatePostIn,
    connecteduser: UserMinSchema,
  ): Promise<PostWithUser> {
    const { id, title, body } = postUpdateDto;

    const existingPost = await this.prismaService.post.findUnique({
      where: { postId: id },
      select: { userId: true },
    });

    if (!existingPost) throw new NotFoundException('Not found Post');

    if (existingPost.userId != connecteduser.userId) {
      throw new ForbiddenException('You are not allow to do this action');
    }

    let slug: string | undefined;
    if (title !== null && title !== undefined) {
      slug = await this.getSlug(title, id);
    }

    // Update du post
    return await this.prismaService.post.update({
      where: { postId: id },
      data: {
        ...(title ? { title } : {}),
        ...(slug ? { slug } : {}),
        ...(body ? { body } : {}),
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async deletePost(
    id: number,
    connectedUser: UserMinSchema,
  ): Promise<(Post & { user: User })[]> {
    const existingPost = await this.prismaService.post.findUnique({
      where: { postId: id },
    });

    if (!existingPost) throw new NotFoundException('Not found post');

    if (existingPost.userId !== connectedUser.userId) {
      throw new ForbiddenException('Not allow deletion');
    }

    await this.prismaService.post.delete({ where: { postId: id } });

    return this.prismaService.post.findMany({
      include: {
        user: true, // inclut les infos du user
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
