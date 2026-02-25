import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env file.");
}

const createMissingConfigError = () =>
  new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
  );

const createNoopQueryBuilder = () => {
  const result = { data: [], error: createMissingConfigError(), count: 0 };
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    order: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    in: () => builder,
    is: () => builder,
    not: () => builder,
    limit: () => builder,
    range: () => builder,
    single: async () => ({ data: null, error: createMissingConfigError() }),
    maybeSingle: async () => ({ data: null, error: createMissingConfigError() }),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    catch: (reject) => Promise.resolve(result).catch(reject),
    finally: (onFinally) => Promise.resolve(result).finally(onFinally),
  };
  return builder;
};

const createNoopAuth = () => ({
  signInWithOAuth: async () => ({ data: null, error: createMissingConfigError() }),
  signInWithPassword: async () => ({ data: null, error: createMissingConfigError() }),
  signOut: async () => ({ error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
});

const createNoopChannel = () => ({
  on: () => createNoopChannel(),
  subscribe: () => createNoopChannel(),
  unsubscribe: () => {},
});

const createNoopSupabaseClient = () => ({
  from: () => createNoopQueryBuilder(),
  auth: createNoopAuth(),
  channel: () => createNoopChannel(),
  removeChannel: () => {},
  rpc: async () => ({ data: null, error: createMissingConfigError() }),
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopSupabaseClient();
