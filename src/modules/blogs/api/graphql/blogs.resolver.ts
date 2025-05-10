import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Int,
  Mutation,
} from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { BlogsOrmQueryRepository } from '../../infrastructure/orm/blogs.orm-query-repository';
import { BlogViewDto } from '../blogs.dto';
import {
  PostsObjectType,
  SORT_BY_POST,
  SORT_DIRECTION_POST,
} from '../../../posts/api/graphql/posts.model';
import { PostsOrmQueryRepository } from '../../../posts/infrastructure/orm/posts.orm-query-repository';
import {
  CreateBlogCommand,
  TExecuteCreateBlog,
} from '../../application/use-cases/create-blog.useCase';

import { BlogCreateInput, BlogsObjectType } from './blogs.model';

// () => BlogsObjectType нужно для того что бы в Parent был BlogsObjectType
@Resolver(() => BlogsObjectType)
export class BlogsResolver {
  constructor(
    private readonly blogsQueryRepository: BlogsOrmQueryRepository,
    private readonly postsQueryRepository: PostsOrmQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Query(() => BlogsObjectType, { name: 'blog' })
  async getBlogById(@Args('id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      // Нужно написать свой exception filter на GraphQL
      throw new NotFoundException();
    }

    return blog;
  }

  @Mutation(() => BlogsObjectType)
  async createBlog(
    @Args('blogCreateInput') blogCreateInput: BlogCreateInput,
  ): Promise<BlogViewDto | null> {
    const { id } = await this.commandBus.execute<
      CreateBlogCommand,
      TExecuteCreateBlog
    >(new CreateBlogCommand(blogCreateInput));

    return this.blogsQueryRepository.getById(id);
  }

  // () => [PostsObjectType] можно не указывать, но так как добавили 'posts', то нужно
  @ResolveField('posts', () => [PostsObjectType])
  async getPosts(
    @Parent() blog: BlogsObjectType,
    @Args('pageNumber', { type: () => Int, nullable: true }) pageNumber: number,
    @Args('pageSize', { type: () => Int, nullable: true }) pageSize: number,
    @Args('sortBy', { type: () => SORT_BY_POST, nullable: true })
    sortBy: SORT_BY_POST,
    @Args('sortDirection', { type: () => SORT_DIRECTION_POST, nullable: true })
    sortDirection: SORT_DIRECTION_POST,
    @Args('searchNameTerm', { type: () => String, nullable: true })
    searchNameTerm: string,
  ) {
    const { items } = await this.postsQueryRepository.getAll(
      {
        pageNumber: pageNumber ?? 1,
        pageSize: pageSize ?? 10,
        sortBy: sortBy ?? SORT_BY_POST.createdAt,
        sortDirection: sortDirection ?? SORT_DIRECTION_POST.asc,
        searchNameTerm: searchNameTerm ?? '',
      },
      undefined,
      { blogId: blog.id },
    );

    return items;
  }
}
