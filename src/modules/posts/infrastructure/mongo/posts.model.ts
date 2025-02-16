import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { PostCreateByBlogIdDto, PostUpdateDto } from '../../posts.dto';

interface PostInstanceMethods {
  updatePost: (post: PostUpdateDto) => void;
}

interface PostStaticMethods {
  createInstance: (
    post: PostCreateByBlogIdDto,
    blogName: string,
    PostModel: TPostModel,
  ) => PostDocument;
}

export type TPostModel = Model<Post, object, PostInstanceMethods> &
  PostStaticMethods;

export type PostDocument = HydratedDocument<Post, PostInstanceMethods>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  updatePost(post: PostUpdateDto) {
    this.content = post.content;
    this.title = post.title;
    this.shortDescription = post.shortDescription;
  }

  static createInstance(
    { title, content, shortDescription, blogId }: PostCreateByBlogIdDto,
    blogName: string,
    PostModel: TPostModel,
  ) {
    return new PostModel({
      id: new Date().getTime().toString(),
      title,
      content,
      shortDescription,
      blogId,
      blogName,
    });
  }
}

export const PostsSchema = SchemaFactory.createForClass(Post);

// Methods
PostsSchema.methods.updatePost = Post.prototype.updatePost;

// Statics
PostsSchema.statics.createInstance = Post.createInstance;
