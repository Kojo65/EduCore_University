import { createPublicKey, createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual, verify as verifySignature } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const storePath = resolve(process.cwd(), '.local-data', 'users.json');
const sessions = new Map();
const oauthStates = new Map();
const resetTokens = new Map();
const attempts = new Map();
const keyCache = new Map();
const SESSION_AGE = 7 * 24 * 60 * 60;
const REMEMBERED_SESSION_AGE = 30 * 24 * 60 * 60;

function randomToken(bytes = 32) { return randomBytes(bytes).toString('base64url'); }
function cookieOptions(req, maxAge = SESSION_AGE) { const secure = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https'; return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`; }
function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
function redirect(res, url) { res.statusCode = 302; res.setHeader('Location', url); res.setHeader('Cache-Control', 'no-store'); res.end(); }
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key, value]) => key && value));
}
async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 20_000) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  }
  try { return body ? JSON.parse(body) : {}; } catch { throw Object.assign(new Error('Please submit valid form data.'), { status: 400 }); }
}
async function readUsers() {
  try { return JSON.parse(await readFile(storePath, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
async function writeUsers(users) {
  await mkdir(dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(users, null, 2), { mode: 0o600 });
  await rename(temporaryPath, storePath);
}
const personas = new Set(['Student', 'Faculty / Staff', 'Applicant', 'Alumni']);
function cleanUser(user) { return { id: user.id, name: user.fullName, email: user.email, persona: personas.has(user.persona) ? user.persona : user.persona === 'Applicant / Alumni' ? 'Applicant' : 'Student', college: user.college || null, universityId: user.registrationId || user.accessId || null }; }
function rateLimit(req, res) {
  const key = req.socket.remoteAddress || 'local';
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < 10 * 60_000);
  recent.push(now);
  attempts.set(key, recent);
  if (recent.length > 15) { sendJson(res, 429, { message: 'Too many attempts. Wait a few minutes and try again.' }); return false; }
  return true;
}
function getSession(req) {
  const token = parseCookies(req).educore_session;
  const session = token && sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) { sessions.delete(token); return null; }
  return { token, ...session };
}
async function makeSession(res, req, user, remember = false) {
  const token = randomToken();
  const maxAge = remember ? REMEMBERED_SESSION_AGE : SESSION_AGE;
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + maxAge * 1000 });
  res.setHeader('Set-Cookie', `educore_session=${encodeURIComponent(token)}; ${cookieOptions(req, maxAge)}`);
}
async function findUserById(id) { return (await readUsers()).find((user) => user.id === id) || null; }
async function getAuthenticatedUser(req) {
  const session = getSession(req);
  if (!session) return null;
  const user = await findUserById(session.userId);
  return user ? cleanUser(user) : null;
}

async function verifyJwt(jwt, issuer, audience, nonce) {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Provider returned an invalid identity token.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Provider identity token used an unsupported signature.');
  let jwks = keyCache.get(issuer);
  if (!jwks || jwks.expiresAt < Date.now()) {
    let keysUrl = 'https://www.googleapis.com/oauth2/v3/certs';
    if (issuer === 'microsoft') {
      const tenantId = claims.tid || 'common';
      const metadata = await fetch(`https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`).then((r) => r.json());
      keysUrl = metadata.jwks_uri;
    }
    const response = await fetch(keysUrl);
    if (!response.ok) throw new Error('Could not validate the provider identity token.');
    jwks = { keys: (await response.json()).keys, expiresAt: Date.now() + 60 * 60_000 };
    keyCache.set(issuer, jwks);
  }
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) { keyCache.delete(issuer); throw new Error('Provider signing key was not recognized. Please try again.'); }
  const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
  const signed = `${parts[0]}.${parts[1]}`;
  if (!verifySignature('RSA-SHA256', Buffer.from(signed), publicKey, Buffer.from(parts[2], 'base64url'))) throw new Error('Provider identity signature could not be verified.');
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp < now || claims.iat > now + 60 || claims.aud !== audience || claims.nonce !== nonce) throw new Error('Provider identity token did not pass validation.');
  const validIssuer = issuer === 'google'
    ? ['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)
    : claims.iss === `https://login.microsoftonline.com/${claims.tid}/v2.0`;
  if (!validIssuer || !claims.sub) throw new Error('Provider identity issuer was not recognized.');
  return claims;
}

function createAuthPlugin(env) {
  const providerConfig = {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    microsoft: { clientId: env.MICROSOFT_CLIENT_ID, clientSecret: env.MICROSOFT_CLIENT_SECRET, tenant: env.MICROSOFT_TENANT_ID || 'common' },
  };

  async function providerStart(provider, req, res) {
    const config = providerConfig[provider];
    if (!config?.clientId || !config?.clientSecret) {
      redirect(res, `/login?authError=${provider}_unconfigured`);
      return;
    }
    const origin = `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`;
    const callback = env[`${provider.toUpperCase()}_REDIRECT_URI`] || `${origin}/api/auth/${provider}/callback`;
    const state = randomToken(24);
    const nonce = randomToken(24);
    const verifier = randomToken(48);
    oauthStates.set(state, { provider, nonce, verifier, callback, expiresAt: Date.now() + 8 * 60_000 });
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const authorize = provider === 'google'
      ? 'https://accounts.google.com/o/oauth2/v2/auth'
      : `https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/authorize`;
    const url = new URL(authorize);
    url.search = new URLSearchParams({ client_id: config.clientId, response_type: 'code', redirect_uri: callback, response_mode: 'query', scope: 'openid email profile', state, nonce, code_challenge: challenge, code_challenge_method: 'S256' }).toString();
    redirect(res, url.toString());
  }

  async function providerCallback(provider, req, res, url) {
    const state = oauthStates.get(url.searchParams.get('state'));
    if (!state || state.provider !== provider || state.expiresAt < Date.now()) { redirect(res, '/login?authError=provider_cancelled'); return; }
    oauthStates.delete(url.searchParams.get('state'));
    const code = url.searchParams.get('code');
    if (!code || url.searchParams.has('error')) { redirect(res, '/login?authError=provider_cancelled'); return; }
    const config = providerConfig[provider];
    const tokenUrl = provider === 'google' ? 'https://oauth2.googleapis.com/token' : `https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/token`;
    const tokenResponse = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, code, code_verifier: state.verifier, grant_type: 'authorization_code', redirect_uri: state.callback }) });
    const tokenResult = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenResult.id_token) throw new Error('Could not finish provider sign-in. Please try again.');
    const claims = await verifyJwt(tokenResult.id_token, provider, config.clientId, state.nonce);
    const email = String(claims.email || claims.preferred_username || '').toLowerCase();
    if (!email || (provider === 'google' && claims.email_verified !== true)) throw new Error('The provider did not return a verified email address.');
    const users = await readUsers();
    let user = users.find((entry) => entry.email.toLowerCase() === email);
    if (!user) {
      user = { id: randomToken(12), fullName: claims.name || email.split('@')[0], email, persona: 'Student', provider, providerSubject: claims.sub, createdAt: new Date().toISOString() };
      users.push(user);
      await writeUsers(users);
    }
    await makeSession(res, req, user);
    redirect(res, '/dashboard');
  }

  async function middleware(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/auth/')) return next();
    try {
      if (req.method === 'GET' && url.pathname === '/api/auth/providers') return sendJson(res, 200, { google: !!(providerConfig.google.clientId && providerConfig.google.clientSecret), microsoft: !!(providerConfig.microsoft.clientId && providerConfig.microsoft.clientSecret) });
      if (req.method === 'GET' && url.pathname === '/api/auth/google') return await providerStart('google', req, res);
      if (req.method === 'GET' && url.pathname === '/api/auth/microsoft') return await providerStart('microsoft', req, res);
      if (req.method === 'GET' && url.pathname === '/api/auth/google/callback') return await providerCallback('google', req, res, url);
      if (req.method === 'GET' && url.pathname === '/api/auth/microsoft/callback') return await providerCallback('microsoft', req, res, url);
      if (req.method === 'GET' && url.pathname === '/api/auth/session') {
        const session = getSession(req);
        if (!session) return sendJson(res, 401, { user: null });
        const user = await findUserById(session.userId);
        return user ? sendJson(res, 200, { user: cleanUser(user) }) : sendJson(res, 401, { user: null });
      }
      if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
        const token = parseCookies(req).educore_session;
        if (token) sessions.delete(token);
        res.setHeader('Set-Cookie', `educore_session=; ${cookieOptions(req, 0)}`);
        return sendJson(res, 200, { message: 'You have been signed out.' });
      }
      if (req.method !== 'POST') return sendJson(res, 405, { message: 'This action is not supported.' });
      if (!rateLimit(req, res)) return;
      const body = await readBody(req);
      if (url.pathname === '/api/auth/signup') {
        const registrationId = String(body.registrationId || body.accessId || '').trim().toUpperCase();
        const fullName = String(body.fullName || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const persona = String(body.persona || 'Student');
        const college = String(body.college || '').trim();
        if (!personas.has(persona)) return sendJson(res, 400, { message: 'Choose Student, Faculty / Staff, Applicant, or Alumni as your account type.' });
        if (persona === 'Faculty / Staff') return sendJson(res, 403, { message: 'Faculty and staff accounts must be provisioned by an authorized university administrator.' });
        if (!registrationId || registrationId.length > 40) return sendJson(res, 400, { message: 'Enter a university ID of 1 to 40 characters.' });
        if (fullName.length < 2 || fullName.length > 100) return sendJson(res, 400, { message: 'Enter your full name (2 to 100 characters).'});
        if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return sendJson(res, 400, { message: 'Enter a valid email address.' });
        if (!college) return sendJson(res, 400, { message: 'Choose your college or faculty.' });
        if (password.length < 12) return sendJson(res, 400, { message: 'Your password must contain at least 12 characters.' });
        const users = await readUsers();
        if (users.some((user) => user.email.toLowerCase() === email || (user.registrationId || user.accessId) === registrationId)) return sendJson(res, 409, { message: 'An account already exists for that email or university ID. Sign in or contact the help desk.' });
        const salt = randomBytes(16).toString('hex');
        const passwordHash = (await scrypt(password, salt, 64)).toString('hex');
        const user = { id: randomToken(12), registrationId, accessId: registrationId, fullName, email, college, persona, passwordHash, salt, createdAt: new Date().toISOString() };
        users.push(user);
        await writeUsers(users);
        return sendJson(res, 201, { message: `Your ${persona} account was created. Sign in with your university ID or email to open your portal.` });
      }
      if (url.pathname === '/api/auth/login') {
        const identifier = String(body.identifier || '').trim().toLowerCase();
        const password = String(body.password || '');
        const requestedPersona = String(body.persona || 'Student');
        if (!personas.has(requestedPersona)) return sendJson(res, 400, { message: 'Choose a valid account type before signing in.' });
        const user = (await readUsers()).find((entry) => entry.email.toLowerCase() === identifier || (entry.registrationId || entry.accessId)?.toLowerCase() === identifier);
        if (!user?.passwordHash) return sendJson(res, 401, { message: 'We could not match those sign-in details. Check your ID or password and try again.' });
        const storedPersona = personas.has(user.persona) ? user.persona : user.persona === 'Applicant / Alumni' ? 'Applicant' : 'Student';
        if (requestedPersona !== storedPersona) return sendJson(res, 403, { message: `This account is registered as ${storedPersona}. Choose that account type and try again.` });
        const actual = await scrypt(password, user.salt, 64);
        const expected = Buffer.from(user.passwordHash, 'hex');
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return sendJson(res, 401, { message: 'We could not match those sign-in details. Check your ID or password and try again.' });
        await makeSession(res, req, user, body.rememberMe === 'on' || body.rememberMe === true);
        return sendJson(res, 200, { message: 'Signed in successfully.', user: cleanUser(user), redirectTo: '/dashboard' });
      }
      if (url.pathname === '/api/auth/password-reset') {
        if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) return sendJson(res, 503, { message: 'Password recovery email is not configured on this server. Contact the IT Help Desk for assistance.' });
        const identifier = String(body.identifier || '').trim().toLowerCase();
        const user = (await readUsers()).find((entry) => entry.email.toLowerCase() === identifier || (entry.registrationId || entry.accessId)?.toLowerCase() === identifier);
        if (user?.passwordHash) {
          const token = randomToken(32);
          const tokenHash = createHash('sha256').update(token).digest('hex');
          resetTokens.set(tokenHash, { userId: user.id, expiresAt: Date.now() + 30 * 60_000 });
          const base = env.AUTH_PUBLIC_URL || `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`;
          const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;
          const emailResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.AUTH_EMAIL_FROM, to: [user.email], subject: 'Reset your EduCore password', html: `<p>We received a request to reset your EduCore password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in 30 minutes. If you did not request a reset, you can ignore this email.</p>` }) });
          if (!emailResponse.ok) { resetTokens.delete(tokenHash); throw new Error('We could not send the recovery email. Please try again later.'); }
        }
        return sendJson(res, 200, { message: 'If an account matches those details, password reset instructions have been sent.' });
      }
      if (url.pathname === '/api/auth/password-reset/confirm') {
        const token = String(body.token || '');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const reset = resetTokens.get(tokenHash);
        const password = String(body.password || '');
        if (!reset || reset.expiresAt < Date.now() || password.length < 12) return sendJson(res, 400, { message: 'That reset link is invalid or expired. Request a new password reset and try again.' });
        const users = await readUsers();
        const user = users.find((entry) => entry.id === reset.userId);
        if (!user) return sendJson(res, 400, { message: 'The account for this reset link could not be found.' });
        user.salt = randomBytes(16).toString('hex');
        user.passwordHash = (await scrypt(password, user.salt, 64)).toString('hex');
        await writeUsers(users);
        resetTokens.delete(tokenHash);
        for (const [sessionToken, session] of sessions) if (session.userId === user.id) sessions.delete(sessionToken);
        return sendJson(res, 200, { message: 'Your password has been updated. Sign in with your new password.' });
      }
      return sendJson(res, 404, { message: 'Authentication endpoint not found.' });
    } catch (error) {
      if (url.pathname.endsWith('/callback')) return redirect(res, '/login?authError=provider_error');
      return sendJson(res, error.status || 500, { message: error.status ? error.message : 'The identity service hit an unexpected error. Please try again.' });
    }
  }

  return {
    name: 'educore-local-auth',
    getAuthenticatedUser,
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

export default createAuthPlugin;
