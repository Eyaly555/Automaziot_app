/**
 * Authentication Instructions Template Library
 * 
 * Generates detailed authentication setup instructions based on requirements
 */

export interface AuthenticationInstructionParams {
  system: string;
  authMethod: 'oauth' | 'api_key' | 'basic_auth' | 'jwt';
  apiEndpoint?: string;
  rateLimits?: string;
  testAccountAvailable?: boolean;
}

export function generateAuthenticationInstructions(params: AuthenticationInstructionParams): string {
  const { system, authMethod, apiEndpoint, rateLimits, testAccountAvailable } = params;

  let instructions = `## Authentication Setup: ${system}\n\n`;

  switch (authMethod) {
    case 'oauth':
      instructions += `
### OAuth 2.0 Authentication

**Method:** OAuth 2.0 (Industry standard for secure API access)

**Implementation Steps:**
1. **Register OAuth Application**
   - Log into ${system} developer portal
   - Create new OAuth app/integration
   - Note Client ID and Client Secret
   - Set redirect URI to: \`https://your-app.com/oauth/callback\`

2. **Configure OAuth Flow**
   - Use Authorization Code grant type (most secure)
   - Scopes needed: [Determine from ${system} API docs]
   - Request authorization: \`GET ${apiEndpoint}/oauth/authorize\`
   - Exchange code for tokens: \`POST ${apiEndpoint}/oauth/token\`

3. **Token Management**
   - Access tokens typically expire in 1 hour
   - Implement automatic refresh using refresh token
   - Store tokens securely (encrypted database or secret manager)
   - Never commit tokens to version control

4. **Test Authentication**
   - Use ${testAccountAvailable ? 'provided test account' : 'create test account'}
   - Verify token generation and refresh works
   - Test token expiration handling

**Security Considerations:**
- Use PKCE (Proof Key for Code Exchange) if available
- Validate redirect URI to prevent open redirect attacks
- Store Client Secret server-side only (never in frontend)
- Implement CSRF protection for OAuth callback

**Error Handling:**
- Handle token expiration gracefully (auto-refresh)
- Handle rate limit errors (429) - ${rateLimits || 'Unknown rate limits'}
- Log failed authentication attempts
- Alert if refresh token becomes invalid
      `;
      break;

    case 'api_key':
      instructions += `
### API Key Authentication

**Method:** API Key (Simple but requires secure storage)

**Implementation Steps:**
1. **Obtain API Key**
   - Log into ${system}
   - Navigate to API settings or developer section
   - Generate new API key
   - ${testAccountAvailable ? '✓ Test account available for testing' : 'Create test account first'}

2. **Secure Storage**
   - Store API key as environment variable: \`${system.toUpperCase().replace(/\s+/g, '_')}_API_KEY\`
   - Never hardcode in source code
   - Use secret manager (AWS Secrets Manager, Azure Key Vault, etc.) for production
   - Rotate keys quarterly for security

3. **API Request Configuration**
   - Add API key to request headers: \`Authorization: Bearer YOUR_API_KEY\`
   - Or query parameter (less secure): \`?api_key=YOUR_API_KEY\`
   - Base URL: ${apiEndpoint || 'Check API documentation'}

4. **Rate Limiting**
   - Rate limits: ${rateLimits || 'Unknown - check API docs'}
   - Implement request throttling
   - Cache responses where appropriate
   - Handle 429 (Too Many Requests) errors

**Security Considerations:**
- Never log API key in plain text
- Use HTTPS only (never HTTP)
- Implement IP whitelisting if supported
- Monitor for unauthorized usage

**Error Handling:**
- Invalid API key → 401 Unauthorized (alert admin)
- Rate limit exceeded → 429 (wait and retry)
- API key expired → Regenerate and update
      `;
      break;

    case 'basic_auth':
      instructions += `
### Basic Authentication

**Method:** HTTP Basic Authentication (Username/Password)

**Implementation Steps:**
1. **Credentials**
   - Username: [Collect from client]
   - Password: [Collect from client]
   - ${testAccountAvailable ? '✓ Test credentials available' : 'Request test credentials'}

2. **Authentication Header**
   - Encode credentials: \`Base64(username:password)\`
   - Add to request: \`Authorization: Basic BASE64_ENCODED_STRING\`

3. **Security**
   - HTTPS is MANDATORY (Basic Auth sends base64, not encrypted)
   - Store credentials in environment variables
   - Use application passwords if available (better than main password)

**Warning:** Basic Auth is less secure than OAuth or API keys. Recommend upgrading to OAuth if possible.
      `;
      break;

    case 'jwt':
      instructions += `
### JWT (JSON Web Token) Authentication

**Method:** JWT-based authentication

**Implementation Steps:**
1. **Obtain JWT**
   - Login endpoint: \`POST ${apiEndpoint}/auth/login\`
   - Credentials: username + password
   - Response contains JWT token

2. **Use JWT in Requests**
   - Add to header: \`Authorization: Bearer JWT_TOKEN\`
   - Token typically expires in 1-24 hours

3. **Token Refresh**
   - Implement token refresh before expiration
   - Use refresh token if provided
   - Re-authenticate if refresh fails

**Security:**
- Validate JWT signature
- Check expiration time
- Store securely (httpOnly cookies recommended)
      `;
      break;
  }

  instructions += `\n\n**API Endpoint:** ${apiEndpoint || 'Not provided - collect from client'}\n`;
  instructions += `**Rate Limits:** ${rateLimits || 'Unknown - check with client or API documentation'}\n`;

  return instructions.trim();
}

