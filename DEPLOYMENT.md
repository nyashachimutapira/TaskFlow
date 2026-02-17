# TaskFlow API - Deployment Guide

## Deployed Application

- **Production URL**: https://taskflow-8gph.onrender.com
- **API Base URL**: https://taskflow-8gph.onrender.com/api
- **Swagger Documentation**: https://taskflow-8gph.onrender.com/api-docs

## Deployment on Render

This application is deployed on Render.com, a modern cloud platform for web services.

### Deployment Steps

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Connect GitHub Repository**
   - Link your GitHub repository to Render
   - Repository: https://github.com/nyashachimutapira/taskflow

3. **Create Web Service**
   - New → Web Service
   - Connect your TaskFlow repository
   - Runtime: Node.js
   - Build command: `npm install`
   - Start command: `npm start`

4. **Set Environment Variables**
   - Go to Environment in service settings
   - Add all required variables:

   ```env
   # Server Configuration
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://taskflow-8gph.onrender.com
   
   # Database
   MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/taskflow
   
   # Authentication
   JWT_SECRET=[strong-random-secret-key]
   JWT_EXPIRE=24h
   SESSION_SECRET=[strong-random-secret-key]
   
   # OAuth - Google
   GOOGLE_CLIENT_ID=[your-google-client-id]
   GOOGLE_CLIENT_SECRET=[your-google-client-secret]
   GOOGLE_CALLBACK_URL=https://taskflow-8gph.onrender.com/api/auth/google/callback
   
   # OAuth - GitHub
   GITHUB_CLIENT_ID=[your-github-client-id]
   GITHUB_CLIENT_SECRET=[your-github-client-secret]
   GITHUB_CALLBACK_URL=https://taskflow-8gph.onrender.com/api/auth/github/callback
   
   # Frontend
   FRONTEND_URL=https://taskflow-8gph.onrender.com
   ```

5. **Deploy**
   - Render automatically deploys on push to main branch
   - Monitor deployment in Render dashboard

## Environment Variables

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection | `mongodb+srv://user:pass@cluster.mongodb.net/taskflow` |
| `JWT_SECRET` | Secret for JWT signing | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SESSION_SECRET` | Secret for session encryption | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `[your-id].apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `[your-secret]` |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App | `[your-client-id]` |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App | `[your-client-secret]` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://taskflow-8gph.onrender.com` |
| `FRONTEND_URL` | Frontend application URL | `https://taskflow-8gph.onrender.com` |

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URI:
   - `https://taskflow-8gph.onrender.com/api/auth/google/callback`
6. Copy Client ID and Client Secret to environment variables

### GitHub OAuth

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://taskflow-8gph.onrender.com/api/auth/github/callback`
4. Copy Client ID and generate Client Secret
5. Add to environment variables

## MongoDB Atlas Setup

1. Create [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a cluster
3. Create a database user with username/password
4. Whitelist IP addresses (or allow all for testing: 0.0.0.0/0)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/taskflow`
6. Add to environment variables as `MONGODB_URI`

## Health Check

The application includes a health check endpoint:

```
GET https://taskflow-8gph.onrender.com/health
```

Response:
```json
{
  "message": "TaskFlow API is running"
}
```

## Testing Deployed Application

### Register New User
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Create Project (Protected)
```bash
curl -X POST https://taskflow-8gph.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'
```

## Monitoring

### Render Dashboard
- View logs in real-time
- Monitor CPU and memory usage
- Check deployment history
- Manage environment variables

### Application Monitoring
- Access Swagger UI: `/api-docs`
- Test all endpoints interactively
- View API documentation

## Security Considerations

✓ **HTTPS**: All traffic encrypted (Render provides free SSL)
✓ **Rate Limiting**: 100 requests per 15 minutes per IP
✓ **JWT Tokens**: Stateless authentication with secure secret
✓ **Password Hashing**: Bcryptjs with 10+ salt rounds
✓ **CORS**: Restricted to configured origins
✓ **Session Security**: Secure, HttpOnly cookies
✓ **MongoDB**: Credentials stored in environment variables
✓ **OAuth**: Secure token exchange with Google and GitHub

## Troubleshooting

### Application Not Starting
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `npm install` completes successfully
- Check Node.js version (14+)

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas whitelist includes Render IP
- Test connection with MongoDB Compass

### OAuth Redirect Errors
- Ensure callback URLs match exactly in:
  - OAuth provider settings
  - Application environment variables
- Check CORS_ORIGIN is set correctly

### Performance Issues
- Check database query performance
- Monitor rate limiting settings
- Review logs for slow requests
- Consider upgrading Render plan

## Maintenance

### Database Backups
- MongoDB Atlas provides automated backups
- Configure backup retention in Atlas dashboard

### Logs
- Render stores logs for 24 hours
- Download logs for long-term storage
- Monitor error rates and patterns

### Updates
- Push changes to GitHub main branch
- Render automatically redeploys
- No downtime during deployment
- Check Render status page for incidents

## Contact & Support

For issues or questions:
- GitHub Issues: https://github.com/nyashachimutapira/taskflow/issues
- Render Support: https://render.com/support
- MongoDB Support: https://www.mongodb.com/support
