declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    NODE_ENV: string;

    // Prisma
    DATABASE_URL: string;

    // Postgres
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_DB: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFESH_TOKEN_SECRET_IN: string;
  }
}
