import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

// Only for a disposable GitHub runner. Never load hosted secrets here.
if (process.env.GITHUB_ACTIONS !== 'true' || !process.env.GITHUB_ENV) {
  throw new Error('This helper requires a GitHub Actions runner.');
}
let status;
try {
  status = JSON.parse(execFileSync('node_modules/.bin/supabase', ['status', '-o', 'json'], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }));
} catch {
  throw new Error('Could not read local Supabase status; credential output was suppressed.');
}
const url = status.API_URL;
const publicKey = status.ANON_KEY || status.PUBLISHABLE_KEY;
const adminKey = status.SERVICE_ROLE_KEY || status.SECRET_KEY;
const mailUrl = status.MAILPIT_URL || status.INBUCKET_URL;
for (const endpoint of [url, mailUrl]) {
  if (!endpoint || !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(endpoint).hostname)) {
    throw new Error('Both API and email endpoints must belong to the disposable local stack.');
  }
}
if (!publicKey || !adminKey) throw new Error('Local status did not provide the required test keys.');
for (const value of Object.values(status)) {
  if (typeof value === 'string' && !/[\r\n]/.test(value)) console.log(`::add-mask::${value}`);
}
const env = {
  SUPABASE_TEST_URL: url,
  SUPABASE_TEST_ANON_KEY: publicKey,
  SUPABASE_TEST_SERVICE_ROLE_KEY: adminKey,
  SUPABASE_TEST_MAIL_URL: mailUrl,
  PUBLIC_SUPABASE_URL: url,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
};
for (const [key, value] of Object.entries(env)) {
  if (/[\r\n]/.test(value)) throw new Error('Unexpected multiline local status value.');
  appendFileSync(process.env.GITHUB_ENV, `${key}=${value}\n`);
}
console.log('Disposable local endpoints and masked test credentials are ready.');
