# Deployment Guide

This guide covers deploying the FIRST Global Team Kenya website to various hosting platforms.

## Deployment Options

### 1. Vercel (Recommended)

#### Full-Stack Deployment

1. **Connect Repository**
   - Sign up for Vercel account
   - Connect GitHub repository
   - Import project

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables**
   Set in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_NOTIFICATION_EMAILS=admin@example.com
   ```

4. **Database Setup**
   - Use Vercel Postgres or Supabase
   - Run migrations: `npx prisma db push`
   - Seed data: `npm run db:seed`

5. **Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Configure DNS records
   - Enable SSL

#### Static Deployment

For static version (GitHub Pages compatible):

1. **Update next.config.mjs**
   ```javascript
   export default {
     output: 'export',
     trailingSlash: true,
   }
   ```

2. **Build Static Files**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   - Set output directory to `out`
   - Configure as static site

### 2. Railway

1. **Create Project**
   - Connect GitHub repository
   - Choose Node.js template

2. **Database Setup**
   - Add PostgreSQL database
   - Get connection string

3. **Environment Variables**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Deploy**
   - Railway auto-deploys on git push
   - Run database migrations in build command

### 3. Render

#### Web Service Deployment

1. **Create Web Service**
   - Connect GitHub repository
   - Choose Node.js environment

2. **Configure Build**
   ```
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```

3. **Database Setup**
   - Create PostgreSQL instance
   - Add database URL to environment

4. **Environment Variables**
   Same as other platforms

5. **Deploy**
   - Automatic deployments on git push
   - Manual deployments available

#### Static Site Deployment

1. **Create Static Site**
   - Choose Static Site option
   - Set publish directory to `out`

2. **Build Configuration**
   ```
   Build Command: npm run build
   Publish Directory: out
   ```

### 4. DigitalOcean App Platform

1. **Create App**
   - Connect repository
   - Choose Node.js app

2. **Resource Setup**
   - Add database (PostgreSQL)
   - Configure environment variables

3. **Build Configuration**
   ```
   Source Directory: /
   Run Command: npm run build && npm start
   ```

4. **Deploy**
   - Automatic CI/CD
   - Blue-green deployments

### 5. AWS (Advanced)

#### Using Amplify

1. **Connect Repository**
   - Use AWS Amplify console
   - Connect GitHub repo

2. **Configure Build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

3. **Environment Variables**
   - Set in Amplify console

4. **Database**
   - Use RDS PostgreSQL
   - Configure security groups

#### Using EC2 + Docker

1. **Create EC2 Instance**
   - Ubuntu 20.04 LTS
   - t3.medium or larger

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql
   ```

3. **Docker Setup** (Recommended)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

4. **Deploy with Docker**
   ```bash
   docker build -t fgc-kenya .
   docker run -p 3000:3000 fgc-kenya
   ```

### 6. GitHub Pages (Static Only)

For static version only:

1. **Build Static Files**
   ```bash
   npm run build
   ```

2. **Update next.config.mjs**
   ```javascript
   export default {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   }
   ```

3. **GitHub Actions Workflow**
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

4. **Enable GitHub Pages**
   - Go to repository settings
   - Enable Pages
   - Set source to GitHub Actions

## Database Setup

### Supabase (Recommended)

1. **Create Project**
   - Sign up for Supabase
   - Create new project

2. **Database Configuration**
   - Get connection string from settings
   - Enable Row Level Security (RLS)

3. **Migrations**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Backup Strategy**
   - Automatic backups included
   - Point-in-time recovery available

### Other PostgreSQL Providers

- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL alternative
- **ElephantSQL**: Managed PostgreSQL
- **AWS RDS**: Enterprise PostgreSQL

## Environment Configuration

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-this-in-production

# Email (Required for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Notifications
ADMIN_NOTIFICATION_EMAILS=admin@example.com,admin2@example.com

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Security Considerations

- **Never commit secrets** to repository
- Use different secrets for each environment
- Rotate secrets regularly
- Use managed secret services when available

## SSL/TLS Configuration

### Automatic SSL (Recommended)

Most platforms provide automatic SSL:
- Vercel: Automatic SSL certificates
- Netlify: Automatic SSL with Let's Encrypt
- Railway: Automatic SSL certificates
- Render: Automatic SSL certificates

### Custom SSL

For self-hosted deployments:

1. **Get SSL Certificate**
   - Use Let's Encrypt (free)
   - Or purchase from certificate authority

2. **Configure Server**
   ```javascript
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('path/to/private-key.pem'),
     cert: fs.readFileSync('path/to/certificate.pem'),
   };

   https.createServer(options, app).listen(443);
   ```

## Monitoring and Analytics

### Error Tracking

**Sentry Setup:**
1. Create Sentry project
2. Install SDK: `npm install @sentry/nextjs`
3. Configure in `sentry.client.config.js` and `sentry.server.config.js`

### Performance Monitoring

**Vercel Analytics:**
- Automatic with Vercel deployment
- Real user monitoring
- Core Web Vitals tracking

**Google Analytics:**
```javascript
// pages/_app.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

### Database Monitoring

- Enable query logging
- Monitor connection pools
- Set up alerts for slow queries
- Use database-specific monitoring tools

## Backup Strategy

### Database Backups

1. **Automated Backups**
   - Enable daily backups
   - Test restore procedures
   - Store backups in multiple regions

2. **Manual Backups**
   ```bash
   # PostgreSQL dump
   pg_dump -U username -h hostname database > backup.sql

   # Restore
   psql -U username -h hostname database < backup.sql
   ```

### Application Backups

1. **Static Assets**
   - Backup uploaded files
   - Use cloud storage with versioning

2. **Configuration**
   - Backup environment configurations
   - Document infrastructure setup

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**
   - Use platform load balancers
   - Implement session affinity if needed

2. **Database Scaling**
   - Use read replicas
   - Implement connection pooling
   - Optimize queries

### Performance Optimization

1. **Frontend**
   - Enable caching headers
   - Use CDN for static assets
   - Implement lazy loading

2. **Backend**
   - Use caching layers (Redis)
   - Optimize database queries
   - Implement background job processing

## Troubleshooting Deployment

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Check for missing dependencies

2. **Database Connection Issues**
   - Verify connection strings
   - Check firewall settings
   - Test database connectivity

3. **SSL/TLS Issues**
   - Verify certificate installation
   - Check certificate validity
   - Test SSL configuration

4. **Performance Issues**
   - Monitor resource usage
   - Check for memory leaks
   - Optimize database queries

### Logs and Debugging

1. **Application Logs**
   - Check platform logging
   - Implement structured logging
   - Set up log aggregation

2. **Database Logs**
   - Enable query logging
   - Monitor connection issues
   - Track performance metrics

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] Backups tested
- [ ] Monitoring enabled
- [ ] Rate limiting implemented

## Support

For deployment issues:
1. Check platform documentation
2. Review deployment logs
3. Test locally first
4. Contact platform support
5. Check GitHub issues