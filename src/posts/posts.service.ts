import { Injectable } from '@nestjs/common';
import { CreatePostIn, CreatePostOut } from './dto/createPosts.dto';
import { UserMinSchema } from 'src/auth/dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { slugify } from 'transliteration';

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
}
