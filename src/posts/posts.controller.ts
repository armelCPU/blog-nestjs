import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostIn, CreatePostOut } from './dto/createPosts.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import express from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('create')
  signin(
    @Body() postInDto: CreatePostIn,
    @Req() request: express.Request,
  ): Promise<CreatePostOut> {
    if (!request.user)
      throw new UnauthorizedException('You are not authenticated');

    const user = request.user as { userId: number; username: string };

    return this.postsService.create(postInDto, user);
  }
}
