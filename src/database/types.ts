/* eslint-disable import/prefer-default-export */
import { createEnum } from 'drizzle-orm/types/type';

export const rolesEnum = createEnum({ alias: 'user_role', values: ['customer', 'developer', 'editor'] });
