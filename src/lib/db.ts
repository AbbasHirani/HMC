import { neon, NeonQueryFunction } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var _neonSql: NeonQueryFunction<false, false> | undefined;
}

function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');

  if (process.env.NODE_ENV !== 'production') {
    if (!global._neonSql) global._neonSql = neon(url);
    return global._neonSql;
  }

  return neon(url);
}

export const sql = getSql();
