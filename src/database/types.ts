/* eslint-disable import/prefer-default-export */
import { createEnum } from 'drizzle-orm/types/type';

export const permissionsEnum = createEnum({ alias: 'user_permissions', values: ['edit', 'download', ''] });
