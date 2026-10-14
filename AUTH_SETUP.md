# EduCore authentication

`npm run dev` starts a local development identity API through the Vite middleware. It creates accounts in `.local-data/users.json`, hashes passwords with scrypt, and issues HttpOnly session cookies. Student, Faculty / Staff, Applicant, and Alumni accounts each keep a university ID, profile name, email, college or faculty, and account type. Sign in with the email or that ID to open the corresponding portal. The student role opens the academic records portal; the other roles open their role-specific account landing page. The JSON database is created automatically on the first account registration and stays on this machine. It is excluded from Git. These local accounts do not verify university enrollment or email ownership, and the local file and in-memory sessions are for development; use a managed identity provider and persistent database for a public production deployment.

## Local email and password

Open `/signup`, choose an account type, and create an account using a unique student, employee, application, or alumni ID and email. Sign in at `/login` with either identifier and the chosen password. Passwords must contain at least 12 characters. Password recovery uses Resend: set `RESEND_API_KEY`, `AUTH_EMAIL_FROM` to a verified sender, and `AUTH_PUBLIC_URL`; reset links are single use and expire after 30 minutes.

## Google and Microsoft sign-in

Create OAuth 2.0 web application credentials with these exact local callback URLs:

- Google: `http://localhost:5173/api/auth/google/callback`
- Microsoft: `http://localhost:5173/api/auth/microsoft/callback`

Copy `.env.example` to `.env`, then set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, and `MICROSOFT_CLIENT_SECRET`. Set `MICROSOFT_TENANT_ID` to `common` for work/school and personal accounts, or to the university tenant ID to restrict access. Keep secrets server-side and never use a `VITE_` prefix. Restart Vite after editing `.env`.

The provider flow uses authorization code, PKCE, state, nonce, and signed ID-token verification. See the [Google web-server OAuth guide](https://developers.google.com/identity/protocols/oauth2/web-server) and [Microsoft authorization-code flow guide](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow).

For an external production identity API, set `VITE_AUTH_API_BASE` to its origin and implement `/auth/login`, `/auth/signup`, `/auth/password-reset`, `/auth/password-reset/confirm`, `/auth/providers`, `/auth/google`, `/auth/microsoft`, `/auth/session`, and `/auth/logout`. Production authentication should use HTTPS, a database, email verification, rate limiting, and account recovery delivery.
