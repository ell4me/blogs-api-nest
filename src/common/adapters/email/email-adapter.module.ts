import { Module } from '@nestjs/common';

import { EmailConfig } from './email.config';
import { EmailAdapter } from './email.adapter';

@Module({
  providers: [EmailConfig, EmailAdapter],
  exports: [EmailAdapter],
})
export class EmailAdapterModule {}
