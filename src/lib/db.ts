import { neon, NeonQueryFunction } from '@neondatabase/serverless';

declare global {
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

export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, thisArg, argArray) {
      const sqlFn = getSql();
      return Reflect.apply(sqlFn, thisArg, argArray);
    },
    get(_target, prop, receiver) {
      const sqlFn = getSql();
      return Reflect.get(sqlFn, prop, receiver);
    },
  }
);
