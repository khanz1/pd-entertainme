# 35 - Fix Real IP Logging with Nginx Proxy

## What changed

### Updated Express app to log real client IPs:

- Added `trust proxy` setting to Express app
- Created custom Morgan token to extract real IP from nginx headers
- Updated logging format to show actual client IPs instead of nginx container IPs
- Implemented fallback chain for IP detection

### Enhanced IP resolution strategy:

- Primary: `X-Real-IP` header from nginx
- Secondary: First IP from `X-Forwarded-For` header
- Fallback: Express `req.ip` or connection remote address

## Pros

### Better Monitoring & Analytics:

- **Real Client IPs**: See actual user IP addresses in logs
- **Accurate Analytics**: Proper IP-based analytics and monitoring
- **Security Insights**: Real IPs for security analysis and threat detection
- **Geolocation**: Accurate location-based insights

### Improved Debugging:

- **User Tracking**: Trace requests back to actual users
- **Network Issues**: Identify client-side network problems
- **Rate Limiting**: Proper IP-based rate limiting capabilities
- **Audit Trails**: Accurate security and compliance logging

### Operational Benefits:

- **Load Balancing**: Better understanding of traffic patterns
- **CDN Integration**: Proper IP handling through multiple proxy layers
- **Compliance**: Meet regulatory requirements for IP logging
- **Performance**: Identify geographical performance patterns

## Cons

### Complexity:

- **Header Dependency**: Relies on nginx setting correct headers
- **Proxy Trust**: Must trust proxy infrastructure
- **Configuration Coupling**: App behavior depends on nginx config

### Security Considerations:

- **Header Spoofing**: Potential for header manipulation
- **Privacy**: Logging real IPs may have privacy implications
- **Trust Boundaries**: Need to carefully define trusted proxies

## Known issues / follow-ups

### Security Hardening:

- Consider implementing IP header validation
- Monitor for suspicious header patterns
- Implement proper privacy controls for IP logging

### Enhanced Logging:

- Add structured logging for better analysis
- Consider adding more context like user agent analysis
- Implement log aggregation for better monitoring

## Technical details

### Express Configuration Changes:

#### Trust Proxy Setting:

```javascript
// Trust proxy headers from nginx
app.set("trust proxy", true);
```

#### Custom Morgan Token:

```javascript
morgan.token("real-ip", (req) => {
  return (
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.connection.remoteAddress
  );
});
```

#### Custom Log Format:

```javascript
const logFormat =
  ':real-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(morgan(logFormat));
```

### IP Resolution Priority:

1. **X-Real-IP Header**: `req.headers['x-real-ip']`

   - Set by nginx with `proxy_set_header X-Real-IP $remote_addr;`
   - Contains the original client IP

2. **X-Forwarded-For Header**: `req.headers['x-forwarded-for']?.split(',')[0]?.trim()`

   - Set by nginx with `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
   - May contain chain of IPs, we take the first (original client)

3. **Express req.ip**: `req.ip`

   - Express's built-in IP detection (uses proxy headers when trust proxy is enabled)

4. **Connection Address**: `req.connection.remoteAddress`
   - Direct connection IP (fallback, likely nginx container IP)

### Nginx Configuration (Already Correct):

Your nginx config generator already sets the proper headers:

```nginx
location / {
    proxy_pass http://localhost:$port;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;           # Real client IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # IP chain
    proxy_set_header X-Forwarded-Proto $scheme;
    # ... other headers
}
```

### Log Format Comparison:

#### Before (Container IP):

```
::ffff:172.21.0.1 - - [20/Sep/2025:22:28:08 +0000] "POST /api/favorites HTTP/1.1" 200 977
```

#### After (Real Client IP):

```
203.0.113.1 - - [20/Sep/2025:22:28:08 +0000] "POST /api/favorites HTTP/1.1" 200 977
```

### Header Analysis:

When a request comes through nginx, the headers look like:

```
X-Real-IP: 203.0.113.1
X-Forwarded-For: 203.0.113.1, 172.21.0.1
X-Forwarded-Proto: https
Host: entertainme.khanz1.dev
```

Our token extracts `203.0.113.1` from `X-Real-IP` header.

### Trust Proxy Security:

Setting `trust proxy: true` tells Express to:

- Trust `X-Forwarded-*` headers
- Use these headers for `req.ip`, `req.protocol`, etc.
- Important: Only enable when behind a trusted proxy (nginx)

### Alternative Configurations:

#### More Restrictive (Specific Proxy IPs):

```javascript
app.set("trust proxy", ["172.21.0.0/16"]); // Only trust docker network
```

#### Most Secure (Specific IP):

```javascript
app.set("trust proxy", "172.21.0.1"); // Only trust nginx container
```

## Testing & Validation

### Test IP Resolution:

1. **Direct Request**: Should show your real IP
2. **Through Nginx**: Should show same real IP (not container IP)
3. **Multiple Proxies**: Should show original client IP

### Verify Headers:

```bash
# Test with curl to see headers
curl -H "X-Real-IP: 203.0.113.1" https://entertainme.khanz1.dev/api
```

### Monitor Logs:

```bash
# Watch logs for real IPs
docker logs pd-entertainme-server-prod -f | grep -E '\d+\.\d+\.\d+\.\d+'
```

## Security Best Practices

### Header Validation:

```javascript
// Optional: Validate IP format
const isValidIP = (ip) => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
```

### Rate Limiting by Real IP:

```javascript
// Use real IP for rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  keyGenerator: (req) => req.headers["x-real-ip"] || req.ip,
  // ... other options
});
```

### Privacy Compliance:

- Consider IP anonymization for GDPR compliance
- Implement log retention policies
- Document IP usage in privacy policy

## Deployment Checklist

### Pre-deployment:

- [ ] Verify nginx headers are set correctly
- [ ] Test trust proxy configuration
- [ ] Validate IP extraction logic

### Post-deployment:

- [ ] Monitor logs for real IP addresses
- [ ] Verify rate limiting works with real IPs
- [ ] Check analytics show proper geographical distribution

### Troubleshooting:

- If still seeing container IPs, check nginx config deployment
- Verify docker network configuration
- Test headers with browser dev tools

## Commit message

```
fix(logging): configure real IP logging through nginx proxy

• add trust proxy setting to Express app
• create custom Morgan token to extract real IP from nginx headers
• implement IP resolution fallback chain (X-Real-IP → X-Forwarded-For → req.ip)
• update log format to show actual client IPs instead of container IPs
• enable proper IP-based analytics and security monitoring

BREAKING CHANGE: logs now show real client IPs instead of nginx container IPs,
may affect log parsing and analytics systems
```
