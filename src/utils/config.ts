export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: '24h',
  databasePath: process.env.DATABASE_PATH || './tasks.db',
  bcryptSaltRounds: 10,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
