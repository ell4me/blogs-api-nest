import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BlogUpdateDto } from '../../api/blogs.dto';
import { BlogCreate } from '../../blogs.types';
import { NotFoundDomainException } from '../../../../common/exception/domain-exception';

@Injectable()
export class BlogsPgRepository {
  constructor(private readonly dataSource: DataSource) {}

  async updateOrNotFoundFail(
    id: string,
    { name, websiteUrl, description }: BlogUpdateDto,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "Blogs" SET 
        "name"=$1, 
        "websiteUrl"=$2,
        "description"=$3, 
        "updatedAt"=DEFAULT
       WHERE "id"=$4
    `,
      [name, websiteUrl, description, id],
    );

    return;
  }

  async create({
    id,
    name,
    websiteUrl,
    isMembership,
    description,
  }: BlogCreate): Promise<string> {
    await this.dataSource.query(
      `
      INSERT INTO "Blogs" ("id", "name", "description", "websiteUrl", "isMembership")
      VALUES($1, $2, $3, $4, $5)
    `,
      [id, name, description, websiteUrl, isMembership],
    );

    return id;
  }

  async deleteOrNotFoundFail(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Blogs" WHERE "id"=$1`,
      [id],
    );

    if (!result[1]) {
      throw NotFoundDomainException.create();
    }

    return true;
  }

  deleteAll(): Promise<any> {
    return this.dataSource.query(`DELETE FROM "Blogs"`);
  }
}
