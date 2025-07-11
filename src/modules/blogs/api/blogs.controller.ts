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

import { BlogQueries, PostQueries } from '../../../types';
import {
  PostCreateDto,
  PostUpdateDto,
  PostViewDto,
} from '../../posts/api/posts.dto';
import { ROUTERS_PATH } from '../../../constants';
import {
  CreatePostCommand,
  TExecuteCreatePost,
} from '../../posts/application/use-cases/create-post.useCase';
import { Public } from '../../../common/decorators/public.decorator';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import {
  TExecuteUpdatePostById,
  UpdatePostByIdCommand,
} from '../../posts/application/use-cases/update-post.useCase';
import {
  DeletePostCommand,
  TExecuteDeletePost,
} from '../../posts/application/use-cases/delete-post.useCase';
import { PostsOrmQueryRepository } from '../../posts/infrastructure/orm/posts.orm-query-repository';
import { PaginationViewDto } from '../../../common/dto/pagination-view.dto';
import {
  DeleteBlogCommand,
  TExecuteDeleteBlog,
} from '../application/use-cases/delete-blog.useCase';
import {
  TExecuteUpdateBlog,
  UpdateBlogCommand,
} from '../application/use-cases/update-blog.useCase';
import {
  CreateBlogCommand,
  TExecuteCreateBlog,
} from '../application/use-cases/create-blog.useCase';
import { BlogsOrmQueryRepository } from '../infrastructure/orm/blogs.orm-query-repository';
import { BlogsService } from '../application/blogs.service';

import { BlogCreateDto, BlogUpdateDto, BlogViewDto } from './blogs.dto';

@UseGuards(BasicAuthGuard)
@Controller()
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsOrmQueryRepository,
    private readonly postsQueryRepository: PostsOrmQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get([ROUTERS_PATH.BLOGS, ROUTERS_PATH.SA_BLOGS])
  async getAllBlogs(
    @Query() queries: BlogQueries,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    await new Promise((res) => setTimeout(res, 3000));
    return await this.blogsQueryRepository.getAll(queries);
  }

  @Get(`${ROUTERS_PATH.BLOGS}/:id`)
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Public()
  @UseGuards(AccessTokenGuard)
  @Get([
    `${ROUTERS_PATH.BLOGS}/:id/posts`,
    `${ROUTERS_PATH.SA_BLOGS}/:id/posts`,
  ])
  async getPostsByBlogId(
    @Query() queries: PostQueries,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<PaginationViewDto<PostViewDto>> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException();
    }

    return await this.postsQueryRepository.getAll(queries, userId, {
      blogId: id,
    });
  }

  @Post(ROUTERS_PATH.SA_BLOGS)
  async createBlog(
    @Body() blogCreateDto: BlogCreateDto,
  ): Promise<BlogViewDto | null> {
    const { id } = await this.commandBus.execute<
      CreateBlogCommand,
      TExecuteCreateBlog
    >(new CreateBlogCommand(blogCreateDto));

    return this.blogsQueryRepository.getById(id);
  }

  @Post(`${ROUTERS_PATH.SA_BLOGS}/:blogId/posts`)
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

    return await this.postsQueryRepository.getById({ postId: id });
  }

  @Put(`${ROUTERS_PATH.SA_BLOGS}/:id`)
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

  @Delete(`${ROUTERS_PATH.SA_BLOGS}/:id`)
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

  @Put(`${ROUTERS_PATH.SA_BLOGS}/:blogId/posts/:postId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogId(
    @Body() postUpdateDto: PostUpdateDto,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute<
      UpdatePostByIdCommand,
      TExecuteUpdatePostById
    >(new UpdatePostByIdCommand(postId, blogId, postUpdateDto));
  }

  @Delete(`${ROUTERS_PATH.SA_BLOGS}/:blogId/posts/:postId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute<DeletePostCommand, TExecuteDeletePost>(
      new DeletePostCommand(postId, blogId),
    );
  }

  @Get(`${ROUTERS_PATH.SA_BLOGS}/sync`)
  async syncElastic(): Promise<void> {
    return this.blogsService.syncAllBlogsToElastic();
  }
}
