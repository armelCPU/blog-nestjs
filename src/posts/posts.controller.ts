import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostIn, CreatePostOut } from './dto/createPosts.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Post as PostModel } from 'generated/prisma';

import express from 'express';
import { PostWithUser } from './dto/getPost.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('create')
  creatpost(
    @Body() postInDto: CreatePostIn,
    @Req() request: express.Request,
  ): Promise<CreatePostOut> {
    if (!request.user)
      throw new UnauthorizedException('You are not authenticated');

    const user = request.user as { userId: number; username: string };

    return this.postsService.create(postInDto, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  getPosts(): Promise<PostModel[]> {
    return this.postsService.findAllPosts();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('show/:slug')
  getPostBySlug(@Param('slug') slug: string): Promise<PostWithUser | null> {
    return this.postsService.findPostBySlug(slug);
  }
}
