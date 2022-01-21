declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development';
    PORT?: string;
    MONGO_URL: string;
    ADMIN_TL_ID: string;
    STAGE: 'PROD' | 'DEV';
    ACCESS_TOKEN_SECRET: string;
    BOT_TOKEN: string;
    BOT_GROUP_ID: string;
    WEBHOOK_TL: string;
    LOG_BOT_TOKEN: string;
    OTP_API: string;
  }
}
