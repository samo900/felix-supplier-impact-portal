# Security Considerations

## Authentication & Authorization

### OTP Security
- ✅ OTP codes are 6 digits (1 million combinations)
- ✅ OTP expires after 10 minutes
- ✅ OTP is single-use (deleted after verification)
- ⚠️ **Production TODO**: Implement rate limiting (max 5 OTP requests per hour per email)
- ⚠️ **Production TODO**: Add attempt limiting (max 3 verification attempts per OTP)
- ⚠️ **Production TODO**: Implement CAPTCHA after multiple failed attempts

### Session Management
- ✅ JWT tokens expire after 8 hours
- ✅ Tokens include email, accountId, and role
- ⚠️ **Production TODO**: Implement token refresh mechanism
- ⚠️ **Production TODO**: Store revoked tokens in Redis/database
- ⚠️ **Production TODO**: Add session monitoring and anomaly detection

### Storage Security
- ❌ **Current**: OTP stored in-memory (Map) - **Not production ready**
- ⚠️ **Production**: Use Redis or Azure Table Storage with expiration
- ⚠️ **Production**: Encrypt sensitive data at rest
- ⚠️ **Production**: Use Azure Key Vault for secrets

## Data Access Security

### Row-Level Security (RLS)
- ✅ All data queries filter by authenticated accountId
- ✅ JWT token verified before data access
- ✅ PowerBI embed tokens include RLS identity
- ✅ No data leakage between suppliers

### API Security
- ✅ Authorization header required for protected endpoints
- ✅ JWT signature verification
- ⚠️ **Production TODO**: Add request signing/validation
- ⚠️ **Production TODO**: Implement API rate limiting
- ⚠️ **Production TODO**: Add request logging and monitoring

## Infrastructure Security

### Azure Static Web Apps
- ✅ HTTPS enforced
- ✅ CSP headers configured
- ⚠️ Review and tighten CSP policy for production
- ⚠️ Enable Azure AD authentication as additional layer

### Azure Functions
- ✅ CORS configured
- ⚠️ **Production TODO**: Restrict CORS to specific domains
- ⚠️ **Production TODO**: Enable Azure Functions authentication
- ⚠️ **Production TODO**: Configure managed identity

### PowerBI Embedding
- ✅ Embed tokens expire after 1 hour
- ✅ RLS enforced at dataset level
- ✅ Service principal used (not personal account)
- ⚠️ **Production TODO**: Monitor embed token usage
- ⚠️ **Production TODO**: Implement token caching to reduce API calls

## Input Validation

### Email Validation
- ✅ Regex validation for email format
- ⚠️ **Production TODO**: Verify email domain against allowlist
- ⚠️ **Production TODO**: Check disposable email services

### OTP Validation
- ✅ Only numeric input accepted
- ✅ Exactly 6 digits required
- ⚠️ **Production TODO**: Implement exponential backoff after failures

### SQL Injection Prevention
- ✅ Use parameterized queries
- ✅ Input sanitization
- ⚠️ Implement prepared statements consistently

## Monitoring & Logging

### Current Logging
- ✅ Basic Azure Functions logging
- ⚠️ **Production TODO**: Implement structured logging
- ⚠️ **Production TODO**: Log all authentication attempts
- ⚠️ **Production TODO**: Track failed OTP verifications
- ⚠️ **Production TODO**: Monitor suspicious patterns

### Recommended Monitoring
- Set up Application Insights
- Configure alerts for:
  - High rate of failed authentications
  - Unusual API usage patterns
  - PowerBI token generation failures
  - Database connection errors
  - High OTP request rate from single IP

## Compliance

### Data Privacy
- ✅ Only supplier's own data accessible
- ✅ No PII exposed in URLs or logs
- ⚠️ **Production TODO**: Implement GDPR data export
- ⚠️ **Production TODO**: Add data retention policies
- ⚠️ **Production TODO**: Implement audit trail

### Access Logging
- ⚠️ **Production TODO**: Log all data access
- ⚠️ **Production TODO**: Implement audit log retention
- ⚠️ **Production TODO**: Enable log export for compliance

## Incident Response

### Security Incident Checklist
1. Rotate SESSION_SECRET immediately
2. Revoke all active sessions
3. Reset service principal credentials
4. Review access logs
5. Notify affected suppliers if data breach
6. Document incident and response

### Regular Security Tasks
- [ ] Monthly: Review access logs
- [ ] Monthly: Check for security updates
- [ ] Quarterly: Rotate secrets and credentials
- [ ] Quarterly: Security audit of RLS configuration
- [ ] Annually: Penetration testing
- [ ] Annually: Security training for team

## Production Deployment Checklist

- [ ] Remove dev_otp from sendOTP response
- [ ] Implement Redis for OTP storage
- [ ] Configure strong SESSION_SECRET
- [ ] Enable Application Insights
- [ ] Set up monitoring alerts
- [ ] Implement rate limiting
- [ ] Add CAPTCHA to login
- [ ] Restrict CORS to production domain
- [ ] Enable Azure AD authentication
- [ ] Configure managed identity
- [ ] Set up Azure Key Vault
- [ ] Implement request logging
- [ ] Configure backup strategy
- [ ] Document security procedures
- [ ] Train staff on security practices
- [ ] Perform security audit
- [ ] Obtain security approval

## Contact

For security concerns or to report vulnerabilities:
- Email: security@yourdomain.com
- Do not disclose vulnerabilities publicly
