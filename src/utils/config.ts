export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: '24h',
  dbPath: process.env.DB_PATH || './tasks.db',
  bcryptRounds: 10,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
