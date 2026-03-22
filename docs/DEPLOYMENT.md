# DEPLOYMENT GUIDE

## Table of Contents
- [Deployment Options](#deployment-options)
- [Firebase Hosting](#firebase-hosting)
- [Traditional Server](#traditional-server)
- [GitHub Pages](#github-pages)
- [Environment Setup](#environment-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Deployment Options

### 1. Firebase Hosting (Recommended)
**Pros:**
- Easy integration with Firebase backend
- Built-in SSL/TLS
- Global CDN
- Automatic scaling
- Zero configuration

**Cons:**
- Limited to Firebase ecosystem
- Higher pricing at scale

### 2. Traditional Server (Self-Hosted)
**Pros:**
- Full control
- Custom configurations
- Multi-platform deployment

**Cons:**
- Requires server maintenance
- Security responsibility
- Manual scaling

### 3. GitHub Pages
**Pros:**
- Free hosting
- Easy setup
- GitHub integration

**Cons:**
- Static sites only
- Limited customization

---

## Firebase Hosting

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Step 1: Initialize Firebase Project
```bash
cd Student-Teacher-Booking-Appointment
firebase init hosting
```

### Step 2: Configure firebase.json
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/pages/index.html"
      }
    ]
  }
}
```

### Step 3: Deploy
```bash
# Deploy all
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy with message
firebase deploy -m "Deployment message"
```

### Step 4: Verify Deployment
```bash
firebase hosting:list
```

### Monitor Deployment
```bash
# View logs
firebase hosting:logs

# Monitor real-time
firebase functions:log --follow
```

---

## Traditional Server

### Prerequisites
- Linux server (Ubuntu 20.04 LTS recommended)
- Apache/Nginx web server
- Node.js installed
- SSL certificate (Let's Encrypt)

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/yourusername/Student-Teacher-Booking-Appointment.git
cd Student-Teacher-Booking-Appointment
sudo chown -R www-data:www-data .
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/appointment-system`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/Student-Teacher-Booking-Appointment;
    index index.html;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://www.gstatic.com https://www.googleadservices.com;";
    
    # Serve files
    location / {
        try_files $uri $uri/ /pages/index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ~$ {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/appointment-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Set Up SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Enable Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 6: Verify SSL

```bash
sudo certbot certificates
```

---

## GitHub Pages

### Step 1: Create gh-pages Branch

```bash
git checkout --orphan gh-pages
git rm -rf .
echo "# Student-Teacher Booking Appointment System" > README.md
git add README.md
git commit -m "Initial gh-pages commit"
git push origin gh-pages
```

### Step 2: Configure Repository

1. Go to GitHub repository Settings
2. Navigate to Pages
3. Set source to `gh-pages` branch

### Step 3: Update package.json

```json
{
  "homepage": "https://yourusername.github.io/Student-Teacher-Booking-Appointment",
  "scripts": {
    "deploy": "npm run build && gh-pages -d .",
    "build": "echo 'Build complete'"
  }
}
```

### Step 4: Deploy

```bash
npm run deploy
```

---

## Environment Setup

### Production Configuration

Create `.env.production`:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NODE_ENV=production
```

### Development Configuration

Create `.env.development`:
```
FIREBASE_API_KEY=your_dev_api_key
FIREBASE_AUTH_DOMAIN=your-dev.firebaseapp.com
FIREBASE_PROJECT_ID=your-dev-project-id
FIREBASE_STORAGE_BUCKET=your-dev-bucket.appspot.com
NODE_ENV=development
```

---

## Monitoring and Maintenance

### Firebase Monitoring

```bash
# View real-time metrics
firebase hosting:channel:list

# Check deployment history
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

### Server Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# Monitor CPU/Memory
htop
```

### Backup Strategy

```bash
# Backup Firestore
gcloud firestore export gs://your-bucket/backups/2024-01-01

# Backup application files
tar -czf backup-2024-01-01.tar.gz /var/www/Student-Teacher-Booking-Appointment

# Upload to S3/GCS
gsutil cp backup-2024-01-01.tar.gz gs://your-backup-bucket/
```

---

## Performance Optimization

### For Firebase Hosting

1. Enable gzip compression (automatic)
2. Set cache headers
3. Minify CSS/JS

### For Nginx

```nginx
# Enable gzip
gzip on;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/atom+xml application/rss+xml application/javascript;
gzip_min_length 1000;

# Buffer optimization
client_body_buffer_size 128k;
client_max_body_size 10m;

# Timeouts
proxy_connect_timeout 90;
proxy_send_timeout 90;
proxy_read_timeout 90;
```

### Database Optimization

1. Create indexes for common queries
2. Implement pagination
3. Use caching strategies

---

## Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Configure security headers
- [ ] Set up firewall rules
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Update dependencies
- [ ] Implement rate limiting
- [ ] Set up DDoS protection
- [ ] Regular backups
- [ ] Monitor access logs

---

## Continuous Deployment (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Deploy to Firebase
        run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## Troubleshooting

### Issue: Firebase Deploy Fails
**Solution:**
```bash
# Clear cache
firebase logout
firebase login

# Reinstall CLI
npm install -g firebase-tools@latest

# Check configuration
firebase list
```

### Issue: CORS Errors
**Solution:**
Configure Firestore security rules to allow proper CORS headers.

### Issue: Static Files Not Loading
**Solution:**
```bash
# Check file paths
firebase serve

# Verify public directory in firebase.json
```

### Issue: Performance Issues
**Solution:**
1. Enable caching
2. Compress assets
3. Implement pagination
4. Monitor database queries

---

## Rollback Procedure

### Firebase Hosting Rollback

```bash
# List available versions
firebase hosting:releases:list

# Rollback to specific version
firebase hosting:rollback

# Or delete current and redeploy previous
firebase hosting:channel:delete live
firebase hosting:channel:deploy previous
```

### Server Rollback

```bash
# Stop service
sudo systemctl stop nginx

# Restore from backup
tar -xzf backup-2024-01-01.tar.gz -C /var/www/

# Restart service
sudo systemctl start nginx
```

---

## Scheduled Maintenance

### Daily Tasks
- Monitor error logs
- Check backups
- Verify uptime

### Weekly Tasks
- Update dependencies
- Review security logs
- Performance analysis

### Monthly Tasks
- Full backup
- Security audit
- Capacity planning

---

## Contact and Support

For deployment support:
- Email: devops@example.com
- Slack: #deployment-help
- GitHub Issues: [Create an issue](https://github.com/yourusername/Student-Teacher-Booking-Appointment/issues)

---

**Last Updated:** March 22, 2026
