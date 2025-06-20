import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],
  exports: [ElasticsearchModule],
})
export class ElasticModule {}
