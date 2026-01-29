export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: '24h',
  databasePath: process.env.DATABASE_PATH || './tasks.db',
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  bcryptSaltRounds: 10,
};
