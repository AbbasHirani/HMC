import { neon } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var _neonSql: ReturnType<typeof neon> | undefined;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');

  if (process.env.NODE_ENV !== 'production') {
    if (!global._neonSql) global._neonSql = neon(url);
    return global._neonSql;
  }

  return neon(url);
}

export const sql = getSql();
