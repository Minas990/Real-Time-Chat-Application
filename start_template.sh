#!/bin/bash

# ==================================================================================================
# 🚀 Automated Deployment Script for NestJS Chat App on AWS EC2
# ==================================================================================================
# This script:
# ✅ Clones a private GitHub repo using HTTPS authentication
# ✅ Installs Node.js and dependencies
# ✅ Builds the NestJS application
# ✅ Starts the app using PM2 for process management
# ✅ Configures Nginx as a reverse proxy with WebSocket support
# ==================================================================================================

set -e  # Exit script immediately if any command fails (useful for debugging)

# ==================================================================================================
# ⚙️ CONFIGURATION - UPDATE THESE VALUES
# ==================================================================================================
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"          # Your GitHub username
GITHUB_REPO="Real-Time-Chat-Application"        # Your repository name
GITHUB_TOKEN="YOUR_GITHUB_PAT"                  # GitHub Personal Access Token (with repo access)
APP_DIR="/var/www/chat-app"                     # Directory where the app will be cloned
NODE_VERSION="20"                               # Node.js version (20 recommended for NestJS)
PORT=8000                                       # Port where your app runs
DOMAIN="_"                                      # Your domain (use "_" for IP-only access)

# ========================================================================================
# 1️⃣ UPDATE SYSTEM & INSTALL REQUIRED DEPENDENCIES
# ========================================================================================
echo "Updating system packages..."
sudo dnf update -y  # Updates all system packages to their latest versions

echo "Installing required dependencies..."
sudo dnf install -y git curl nginx  # Installs Git (for repo cloning), Curl (for fetching URLs), and Nginx

# ========================================================================================
# 2️⃣ INSTALL NODE.JS
# ========================================================================================
echo "Installing Node.js $NODE_VERSION..."
# Remove any existing Node.js versions
sudo dnf remove -y nodejs || true

# Add NodeSource repo for Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -

# Install Node.js
sudo dnf install -y nodejs

# ========================================================================================
# 3️⃣ CLONE OR UPDATE THE REPOSITORY
# ========================================================================================
if [ -d "$APP_DIR" ]; then
    echo "Repository already exists. Pulling latest changes..."
    cd "$APP_DIR"
    echo "Resetting local changes and pulling latest updates..."
    git reset --hard HEAD
    git pull origin main  # Pull latest changes from the remote repository
else
    echo "Cloning repository..."
    git clone https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$GITHUB_REPO.git "$APP_DIR"
    cd "$APP_DIR"
fi

# ========================================================================================
# 4️⃣ INSTALL NODE.JS DEPENDENCIES & BUILD
# ========================================================================================
echo "Installing Node.js dependencies..."
npm install  # Installs all required npm packages from package.json

echo "Building NestJS application..."
npm run build  # Compiles TypeScript to JavaScript in dist/ folder

# ========================================================================================
# 5️⃣ SET UP ENVIRONMENT VARIABLES
# ========================================================================================
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creating .env file - UPDATE THESE VALUES!"
    cat <<EOT > "$APP_DIR/.env"
NODE_ENV=production
PORT=$PORT

# Database (RDS PostgreSQL)
DB_HOST=YOUR_RDS_ENDPOINT.rds.amazonaws.com
DB_NAME=chatter
DB_USERNAME=chatter
DB_PASS=YOUR_RDS_PASSWORD
DB_PORT=5432

# JWT
JWT_SECRET=YOUR_JWT_SECRET_HERE

# AWS S3 (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_S3_BUCKET=YOUR_BUCKET_NAME

# Email (nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=YOUR_EMAIL
EMAIL_PASSWORD=YOUR_EMAIL_PASSWORD
EMAIL_ADMIN=admin@example.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_PASSWORD=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URL=http://YOUR_EC2_IP/auth/oauth/google
EOT
    echo "⚠️  IMPORTANT: Edit $APP_DIR/.env with your actual values!"
fi

# ========================================================================================
# 6️⃣ CONFIGURE NGINX AS A REVERSE PROXY (WITH WEBSOCKET SUPPORT)
# ========================================================================================
# WHY USE A REVERSE PROXY?
# ✅ Security - Hides the backend server’s IP & reduces exposure
# ✅ Performance - Can serve cached static content, reducing server load
# ✅ WebSocket Support - Handles upgrade headers for Socket.io

echo "Configuring Nginx with WebSocket support..."

sudo tee /etc/nginx/conf.d/chat-app.conf > /dev/null <<EOT
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;

        # WebSocket support (required for Socket.io)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Standard proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket timeout settings
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

# Remove default nginx config if exists
sudo rm -f /etc/nginx/conf.d/default.conf || true

# ========================================================================================
# 7️⃣ RESTART NGINX TO APPLY CHANGES
# ========================================================================================
echo "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# ========================================================================================
# 8️⃣ START THE APPLICATION USING PM2
# ========================================================================================
echo "Installing PM2 and starting the application..."
sudo npm install -g pm2

# Stop existing instances if any
pm2 stop chat-app 2>/dev/null || true
pm2 delete chat-app 2>/dev/null || true

# Start the NestJS application (compiled output in dist/)
cd "$APP_DIR"
pm2 start dist/main.js --name chat-app

# Save PM2 config and setup auto-start on reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# ========================================================================================
# ✅ DEPLOYMENT COMPLETE
# ========================================================================================
echo ""
echo "=============================================="
echo "✅ Deployment completed successfully!"
echo "=============================================="
echo ""
echo "Your NestJS Chat App is now running!"
echo ""
echo "📍 Access your app at:"
echo "   http://YOUR_EC2_PUBLIC_IP"
echo ""
echo "📋 Useful commands:"
echo "   pm2 logs chat-app     - View application logs"
echo "   pm2 restart chat-app  - Restart the application"
echo "   pm2 status            - Check app status"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update $APP_DIR/.env with your actual values"
echo "   2. Configure RDS security group to allow EC2 access"
echo "   3. Run 'pm2 restart chat-app' after editing .env"
echo "=============================================="