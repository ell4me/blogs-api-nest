import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';

export const BLOGS_INDEX = 'blogs';
export const BLOGS_SCHEMA: IndicesCreateRequest = {
  index: BLOGS_INDEX,
  mappings: {
    properties: {
      id: { type: 'text' },
      name: {
        type: 'text',
        analyzer: 'russian',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      description: { type: 'text', analyzer: 'russian' },
      websiteUrl: { type: 'text', analyzer: 'russian' },
      isMembership: { type: 'boolean' },
    },
  },
};
