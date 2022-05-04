declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development';
    PORT?: string;
    DB: string;
    ACCESS_TOKEN_SECRET: string;
  }
}
