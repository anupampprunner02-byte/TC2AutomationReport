import rawData from './testdata.json' with { type: 'json' };

/**
 * Recursively resolves "$ENV_VAR" placeholders in test data with process.env values.
 * Any string value starting with "$" is treated as an env var reference.
 */
function resolveEnvVars(obj: unknown): unknown {
  if (typeof obj === 'string' && obj.startsWith('$')) {
    const envKey = obj.slice(1);
    const value = process.env[envKey];
    if (!value) throw new Error(`Environment variable ${envKey} is not set. Check your .env file.`);
    return value;
  }
  if (Array.isArray(obj)) return obj.map(resolveEnvVars);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, resolveEnvVars(v)])
    );
  }
  return obj;
}

const testData = resolveEnvVars(rawData) as typeof rawData;
export default testData;
