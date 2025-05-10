import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsUrl, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

import { PostsObjectType } from '../../../posts/api/graphql/posts.model';

@ObjectType()
export class BlogsObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  websiteUrl: string;

  @Field()
  createdAt: Date;

  @Field()
  isMembership: boolean;

  @Field(() => [PostsObjectType])
  posts: PostsObjectType[];
}

@InputType()
export class BlogCreateInput {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  @Field()
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 500)
  @Field()
  description: string;

  @IsUrl()
  @MaxLength(100)
  @Field()
  websiteUrl: string;
}
