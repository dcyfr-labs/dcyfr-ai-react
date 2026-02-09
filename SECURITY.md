# Security Policy — @dcyfr/ai-react

**Production-ready React SPA security guidelines and best practices.**

Version: 1.0.0  
Last Updated: February 8, 2026

---

## Table of Contents

1. [Reporting Vulnerabilities](#reporting-vulnerabilities)
2. [Supported Versions](#supported-versions)
3. [Security Features](#security-features)
4. [Best Practices](#best-practices)
5. [Common Vulnerabilities](#common-vulnerabilities)
6. [Dependency Security](#dependency-security)
7. [Compliance](#compliance)

---

## Reporting Vulnerabilities

**We take security seriously.** If you discover a security vulnerability, please report it responsibly.

### How to Report

**Email:** security@dcyfr.ai  
**Subject:** [SECURITY] @dcyfr/ai-react - Brief description

**Include:**
- Vulnerability description
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Response Time:** We aim to respond within **48 hours** and provide a fix within **7 days** for critical vulnerabilities.

### What to Expect

1. **Acknowledgment** within 48 hours
2. **Assessment** and severity classification
3. **Fix development** and testing
4. **Coordinated disclosure** (you'll be credited unless you prefer anonymity)
5. **Patch release** with security advisory

---

## Supported Versions

| Version | Supported | End of Life |
|---------|-----------|-------------|
| 1.x.x   | ✅ Yes    | TBD         |
| 0.x.x   | ❌ No     | Feb 2026    |

**Recommendation:** Always use the latest v1.x release for security patches and updates.

---

## Security Features

### Built-in Protections

1. **XSS Protection**
   - React's automatic escaping prevents injection attacks
   - Avoid `dangerouslySetInnerHTML` unless absolutely necessary
   - Sanitize user content with libraries like DOMPurify

2. **Type Safety**
   - TypeScript strict mode enabled
   - Runtime validation with Zod schemas
   - Type-safe API clients prevent data corruption

3. **Secure Dependencies**
   - Vetted dependencies from trusted sources
   - Regular security audits with `npm audit`
   - Automated updates via Dependabot

4. **Content Security Policy (CSP)**
   - Configure in `vite.config.ts` for production builds
   - Restrict script sources to prevent XSS

---

## Best Practices

### Authentication & Authorization

#### Secure Token Storage

**❌ AVOID:** Storing tokens in localStorage (vulnerable to XSS)

```typescript
// DON'T DO THIS
localStorage.setItem('token', authToken);
```

**✅ RECOMMENDED:** Use HttpOnly cookies

```typescript
// Set via server response with HttpOnly flag
// Client-side: No direct access to token (safer)
```

**Alternative (if cookies not feasible):** Use sessionStorage with short TTL

```typescript
// Acceptable for short-lived sessions
sessionStorage.setItem('token', authToken);
```

#### Authentication Example

```typescript
import { apiClient } from '@/services';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function login(credentials: unknown) {
  // 1. Validate input
  const validated = loginSchema.parse(credentials);

  // 2. Send to server (use HTTPS in production)
  const response = await apiClient.post('/auth/login', validated);

  // 3. Server sets HttpOnly cookie
  // Client doesn't handle token directly
  return response;
}
```

---

### Input Validation

**Always validate user inputs** with Zod schemas:

```typescript
import { z } from 'zod';

const userInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

function handleFormSubmit(data: unknown) {
  try {
    const validated = userInputSchema.parse(data);
    // Safe to use validated data
  } catch (error) {
    // Handle validation errors
    console.error('Invalid input:', error);
  }
}
```

**Rule:** Never trust client-side data. Validate on both client AND server.

---

### API Security

#### HTTPS Only

**Production requirement:** All API calls must use HTTPS.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    https: true, // Enable for local testing
  },
});
```

#### CSRF Protection

Include CSRF tokens for state-changing requests:

```typescript
async function updateProfile(data: ProfileData) {
  const csrfToken = getCsrfToken(); // From cookie or meta tag

  await apiClient.put('/api/profile', data, {
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}
```

#### Rate Limiting

Implement client-side rate limiting for sensitive operations:

```typescript
import { useDebounce } from '@/hooks';

function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500); // Limit API calls

  useEffect(() => {
    if (debouncedQuery) {
      apiClient.get(`/search?q=${debouncedQuery}`);
    }
  }, [debouncedQuery]);
}
```

---

### Content Security

#### Sanitize HTML

If rendering user-generated HTML (e.g., rich text), sanitize it:

```typescript
import DOMPurify from 'dompurify';

function UserContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**WARNING:** Only use `dangerouslySetInnerHTML` with sanitized content.

#### File Uploads

Validate file types and sizes:

```typescript
const fileUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be ≤ 5MB')
    .refine((file) => ['image/png', 'image/jpeg'].includes(file.type), 'Only PNG/JPEG allowed'),
});

function FileUpload() {
  const handleUpload = (file: File) => {
    try {
      fileUploadSchema.parse({ file });
      // Safe to upload
    } catch (error) {
      alert('Invalid file');
    }
  };
}
```

---

### Dependency Security

#### Regular Audits

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# Fix all (may include breaking changes)
npm audit fix --force
```

#### Dependency Updates

Keep dependencies up-to-date:

```bash
# Check for outdated packages
npm outdated

# Update to latest (within semver range)
npm update

# Update major versions (review breaking changes)
npx npm-check-updates -u
npm install
```

#### Automated Scanning

Enable Dependabot in GitHub:

1. Go to **Settings > Security > Dependabot**
2. Enable **Dependency alerts**
3. Enable **Security updates**

---

## Common Vulnerabilities

### XSS (Cross-Site Scripting)

**Risk:** Injecting malicious scripts via user input.

**Mitigation:**

```typescript
// ✅ SAFE: React escapes by default
function UserName({ name }: { name: string }) {
  return <div>{name}</div>; // Automatically escaped
}

// ❌ DANGER: Direct HTML injection
function UnsafeName({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // Vulnerable!
}

// ✅ SAFE: Sanitize first
import DOMPurify from 'dompurify';

function SafeName({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
```

---

### CSRF (Cross-Site Request Forgery)

**Risk:** Unauthorized actions via forged requests.

**Mitigation:**

1. Use SameSite cookies
2. Validate CSRF tokens
3. Require authentication for sensitive actions

```typescript
// Server sets SameSite cookie
res.cookie('sessionId', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
});

// Client includes CSRF token
await apiClient.post('/api/transfer', data, {
  headers: {
    'X-CSRF-Token': csrfToken,
  },
});
```

---

### Clickjacking

**Risk:** Embedding site in malicious iframe.

**Mitigation:** Add X-Frame-Options header (configured server-side).

```typescript
// Prevent iframe embedding
res.setHeader('X-Frame-Options', 'DENY');
// Or allow same origin only
res.setHeader('X-Frame-Options', 'SAMEORIGIN');
```

---

### Open Redirect

**Risk:** Redirecting users to malicious sites.

**Mitigation:** Validate redirect URLs.

```typescript
function SafeRedirect({ to }: { to: string }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    // Validate internal URLs only
    if (to.startsWith('/') && !to.startsWith('//')) {
      navigate({ to });
    } else {
      console.error('Invalid redirect URL');
    }
  };

  return <button onClick={handleRedirect}>Continue</button>;
}
```

---

## Compliance

### GDPR (EU)

**Requirements:**
- Obtain consent for cookies/tracking
- Provide data export/deletion mechanisms
- Include privacy policy link

**Implementation:**

```typescript
function CookieConsent() {
  const [accepted, setAccepted] = useLocalStorage('cookieConsent', false);

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 w-full bg-gray-800 text-white p-4">
      <p>We use cookies to improve your experience.</p>
      <button onClick={() => setAccepted(true)}>Accept</button>
    </div>
  );
}
```

---

### OWASP Top 10 Coverage

| Vulnerability | Status | Mitigation |
|---------------|--------|------------|
| **A01: Broken Access Control** | ✅ | Client-side route guards + server-side validation |
| **A02: Cryptographic Failures** | ✅ | HTTPS enforced, secure token storage |
| **A03: Injection** | ✅ | Zod validation, prepared statements (server) |
| **A04: Insecure Design** | ✅ | Security-first architecture |
| **A05: Security Misconfiguration** | ✅ | Secure defaults, CSP headers |
| **A06: Vulnerable Components** | ✅ | Automated dependency scanning |
| **A07: Identity Failures** | ✅ | HttpOnly cookies, MFA support ready |
| **A08: Software/Data Integrity** | ✅ | SRI for CDN resources |
| **A09: Logging Failures** | ⚠️ | Implement server-side logging |
| **A10: SSRF** | N/A | Not applicable (client-side only) |

---

## Security Checklist

Before deploying to production:

- [ ] Enable HTTPS for all API requests
- [ ] Configure Content Security Policy (CSP)
- [ ] Use HttpOnly cookies for authentication
- [ ] Validate all user inputs with Zod
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Enable rate limiting on API endpoints
- [ ] Implement CSRF protection
- [ ] Add X-Frame-Options header
- [ ] Sanitize user-generated content
- [ ] Review third-party integrations
- [ ] Enable Dependabot alerts
- [ ] Add privacy policy and cookie consent
- [ ] Configure secure session timeouts
- [ ] Test with OWASP ZAP or similar scanner

---

## Incident Response

In case of a security breach:

1. **Isolate:** Immediately revoke compromised credentials
2. **Assess:** Determine scope and impact
3. **Notify:** Alert affected users within 72 hours (GDPR requirement)
4. **Fix:** Deploy patches and security updates
5. **Review:** Conduct post-mortem and improve processes

---

## Resources

- **OWASP React Security Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html
- **npm Security Best Practices:** https://docs.npmjs.com/security-best-practices
- **Vite Security:** https://vitejs.dev/guide/security.html
- **MDN Web Security:** https://developer.mozilla.org/en-US/docs/Web/Security

---

## Contact

**Security Team:** security@dcyfr.ai  
**Bug Reports:** https://github.com/dcyfr/dcyfr-ai-react/security/advisories  
**General Support:** hello@dcyfr.ai

---

**Last Updated:** February 8, 2026  
**License:** MIT  
**Maintained By:** DCYFR Security Team
