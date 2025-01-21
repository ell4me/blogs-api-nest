import { Module } from '@nestjs/common';

import { CommonConfig } from './common.config';

@Module({
  providers: [CommonConfig],
  exports: [CommonConfig],
})
export class CommonConfigModule {}
