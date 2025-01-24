import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  FilteredBlogQueries,
  FilteredPostQueries,
  ItemsPaginationViewDto,
} from '../../types';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query-repository';
import { PostCreateDto, PostViewDto } from '../posts/posts.dto';
import { ROUTERS_PATH } from '../../constants';
import {
  CreatePostCommand,
  TExecuteCreatePost,
} from '../posts/application/use-cases/create-post.useCase';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';

import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import {
  DeleteBlogCommand,
  TExecuteDeleteBlog,
} from './application/use-cases/delete-blog.useCase';
import {
  TExecuteUpdateBlog,
  UpdateBlogCommand,
} from './application/use-cases/update-blog.useCase';
import {
  CreateBlogCommand,
  TExecuteCreateBlog,
} from './application/use-cases/create-blog.useCase';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';

@Controller(ROUTERS_PATH.BLOGS)
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() queries: FilteredBlogQueries,
  ): Promise<ItemsPaginationViewDto<BlogViewDto>> {
    return await this.blogsQueryRepository.getAll(queries);
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() queries: FilteredPostQueries,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<ItemsPaginationViewDto<PostViewDto>> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return await this.postsQueryRepository.getAllPosts(queries, userId, {
      blogId: id,
    });
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(
    @Body() blogCreateDto: BlogCreateDto,
  ): Promise<BlogViewDto | null> {
    const { id } = await this.commandBus.execute<
      CreateBlogCommand,
      TExecuteCreateBlog
    >(new CreateBlogCommand(blogCreateDto));

    return await this.blogsQueryRepository.getById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Body() postCreateDto: PostCreateDto,
    @Param('blogId') blogId: string,
  ): Promise<PostViewDto | null> {
    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    const { id } = await this.commandBus.execute<
      CreatePostCommand,
      TExecuteCreatePost
    >(
      new CreatePostCommand(
        {
          ...postCreateDto,
          blogId,
        },
        blog.name,
      ),
    );

    return await this.postsQueryRepository.getPostById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Body() blogUpdateDto: BlogUpdateDto,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.commandBus.execute<UpdateBlogCommand, TExecuteUpdateBlog>(
      new UpdateBlogCommand(id, blogUpdateDto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    return this.commandBus.execute<DeleteBlogCommand, TExecuteDeleteBlog>(
      new DeleteBlogCommand(id),
    );
  }
}
