/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import AbstractTable from 'drizzle-orm/tables/abstractTable';
import { ExtractModel } from 'drizzle-orm/tables/inferTypes';
import { z } from 'zod';

export type ProjectModel = ExtractModel<ProjectTable>;

export default class ProjectTable extends AbstractTable<ProjectTable> {
  public id = this.serial('id').primaryKey();
  public name = this.varchar('name').notNull();
  public pathToDictionary = this.varchar('path_to_dictionary');

  public tableName(): string {
    return 'projects';
  }
}

const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  pathToDictionary: z?.string(),

});

export const partialProject = projectSchema.partial({ pathToDictionary: true, id: true });
