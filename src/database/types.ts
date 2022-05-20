/* eslint-disable import/prefer-default-export */
import { createEnum } from 'drizzle-orm/types/type';

export const roleEnum = createEnum({ alias: 'role', values: ['customer', 'user'] });
