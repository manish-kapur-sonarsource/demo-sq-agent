export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: '24h',
  bcryptRounds: 10,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  database: {
    path: process.env.DB_PATH || './tasks.db',
  },
};
