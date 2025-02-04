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
import { PostCreateDto, PostViewDto } from '../posts/posts.dto';
import { ROUTERS_PATH } from '../../constants';
import {
  CreatePostCommand,
  TExecuteCreatePost,
} from '../posts/application/use-cases/create-post.useCase';
import { Public } from '../../common/decorators/public.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { PostsPgQueryRepository } from '../posts/infrastructure/posts.pg-query-repository';

import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';
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
import { BlogsPgQueryRepository } from './infrastructure/blogs.pg-query-repository';

@Controller(ROUTERS_PATH.BLOGS)
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsPgQueryRepository,
    private readonly postsQueryRepository: PostsPgQueryRepository,
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
  @UseGuards(AccessTokenGuard)
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
      new CreatePostCommand({
        ...postCreateDto,
        blogId,
      }),
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
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return this.commandBus.execute<UpdateBlogCommand, TExecuteUpdateBlog>(
      new UpdateBlogCommand(id, blogUpdateDto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return this.commandBus.execute<DeleteBlogCommand, TExecuteDeleteBlog>(
      new DeleteBlogCommand(id),
    );
  }
}
