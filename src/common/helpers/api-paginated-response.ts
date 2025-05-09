import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginationViewDto } from '../dto/pagination-view.dto';

// Для работы с дженериками, без этого хелпера swagger не сможет понять ItemsPaginationViewDto<PostViewDto>
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: PaginationViewDto.name,
        allOf: [
          {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              pagesCount: { type: 'number' },
              page: { type: 'number' },
              pageSize: { type: 'number' },
              totalCount: { type: 'number' },
            },
          },
        ],
      },
    }),
  );
};
