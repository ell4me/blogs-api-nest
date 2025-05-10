import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { STATUSES_LIKE } from '../../../../constants';

@ObjectType()
export class NewestLikeInfoObjectType {
  @Field()
  addedAt: string;

  @Field()
  userId: string;

  @Field()
  login: string;
}

@ObjectType()
export class ExtendedLikesInfoObjectType {
  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  dislikesCount: number;

  @Field(() => STATUSES_LIKE)
  myStatus: STATUSES_LIKE;

  @Field(() => [NewestLikeInfoObjectType])
  newestLikes: NewestLikeInfoObjectType[];
}

@ObjectType()
export class PostsObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  shortDescription: string;

  @Field()
  content: string;

  @Field()
  blogId: string;

  @Field()
  blogName: string;

  @Field()
  createdAt: string;

  @Field(() => ExtendedLikesInfoObjectType)
  extendedLikesInfo: ExtendedLikesInfoObjectType;
}

export enum SORT_BY_POST {
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  title = 'title',
  blogName = 'blogName',
}

export enum SORT_DIRECTION_POST {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(SORT_BY_POST, {
  name: 'SORT_BY_POST',
  description: 'Sorting for post: createdAt, updatedAt, title or blogName',
});

registerEnumType(SORT_DIRECTION_POST, {
  name: 'SORT_DIRECTION_POST',
  description: 'Sort direction for post: asc or desc',
});
