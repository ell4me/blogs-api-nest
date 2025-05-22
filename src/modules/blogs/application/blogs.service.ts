import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { BlogsOrmRepository } from '../infrastructure/orm/blogs.orm-repository';

import { BLOGS_INDEX, BLOGS_SCHEMA } from './constants';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsOrmRepository: BlogsOrmRepository,
    private readonly esClient: ElasticsearchService,
  ) {}

  async syncAllBlogsToElastic(): Promise<void> {
    const blogs = await this.blogsOrmRepository.getAll();

    if (!blogs.length) {
      return;
    }

    const exists = await this.esClient.indices.exists({ index: BLOGS_INDEX });

    if (!exists) {
      // Создаем индекс на основе схемы, если он еще не создан
      await this.esClient.indices.create({ ...BLOGS_SCHEMA });
    }

    // Формирует bulk-запрос, где указываются index и document
    const body = blogs.flatMap((blog) => [
      { index: { _index: BLOGS_INDEX, _id: blog.id } },
      blog,
    ]);

    // Отправляет в Elasticsearch пачкой (быстрее, чем по одной)
    // refresh: true делает данные сразу доступными для поиска
    const result = await this.esClient.bulk({ refresh: true, body });

    if (result.errors) {
      console.error('Some documents failed to index:', result);
      throw new Error('Elasticsearch sync failed');
    }

    console.log(`✅ Synced ${blogs.length} posts to Elasticsearch.`);
  }
}
