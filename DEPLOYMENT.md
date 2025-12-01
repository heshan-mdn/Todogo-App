# Todogo - Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)
- Cloud provider account (AWS, GCP, Azure, DigitalOcean, etc.)

## Deployment Options

### 1. Docker Compose (Simple)

Best for: Small to medium traffic, single server deployments

#### Setup

1. **Clone repository on server:**
```bash
git clone <your-repo-url>
cd todogo
```

2. **Create production environment file:**
```bash
cp .env.example .env.production
```

3. **Update environment variables:**
```env
# Database
DB_PASSWORD=<strong-random-password>

# JWT
JWT_SECRET=<strong-random-secret>

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

4. **Build and start services:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **Setup reverse proxy (Nginx):**

`/etc/nginx/sites-available/todogo`:
```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

6. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 2. Kubernetes (Scalable)

Best for: High traffic, multiple servers, auto-scaling

#### Prerequisites
- Kubernetes cluster
- kubectl configured
- Docker registry

#### Deployment Steps

1. **Build and push images:**
```bash
# Tag images
docker tag todogo-backend:latest registry.yourdomain.com/todogo-backend:v1.0.0
docker tag todogo-frontend:latest registry.yourdomain.com/todogo-frontend:v1.0.0

# Push to registry
docker push registry.yourdomain.com/todogo-backend:v1.0.0
docker push registry.yourdomain.com/todogo-frontend:v1.0.0
```

2. **Create Kubernetes manifests:**

`k8s/database.yaml`:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  ports:
    - port: 5432
  selector:
    app: postgres
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_DB
              value: todogo
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

`k8s/backend.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  ports:
    - port: 8080
  selector:
    app: backend
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: registry.yourdomain.com/todogo-backend:v1.0.0
          env:
            - name: DB_HOST
              value: postgres
            - name: DB_PORT
              value: "5432"
            - name: DB_NAME
              value: todogo
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: password
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: secret
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
```

`k8s/frontend.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  ports:
    - port: 3000
  selector:
    app: frontend
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: registry.yourdomain.com/todogo-frontend:v1.0.0
          env:
            - name: NEXT_PUBLIC_API_URL
              value: https://api.yourdomain.com/api/v1
          ports:
            - containerPort: 3000
```

`k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todogo-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - yourdomain.com
        - api.yourdomain.com
      secretName: todogo-tls
  rules:
    - host: yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 3000
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8080
```

3. **Create secrets:**
```bash
kubectl create secret generic db-secrets \
  --from-literal=username=postgres \
  --from-literal=password=<strong-password>

kubectl create secret generic jwt-secret \
  --from-literal=secret=<strong-jwt-secret>
```

4. **Deploy:**
```bash
kubectl apply -f k8s/
```

### 3. AWS (Managed Services)

Best for: Enterprise deployments, managed services

#### Architecture
- **Frontend**: AWS Amplify or S3 + CloudFront
- **Backend**: ECS/Fargate or EKS
- **Database**: RDS PostgreSQL
- **Load Balancer**: ALB
- **DNS**: Route 53
- **SSL**: ACM (AWS Certificate Manager)

#### Steps

1. **Setup RDS:**
```bash
aws rds create-db-instance \
  --db-instance-identifier todogo-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username postgres \
  --master-user-password <password> \
  --allocated-storage 20
```

2. **Deploy backend to ECS:**
- Create ECR repository
- Push Docker image
- Create ECS task definition
- Create ECS service with ALB

3. **Deploy frontend:**
- Build Next.js app
- Upload to S3
- Setup CloudFront distribution

### 4. DigitalOcean App Platform

Best for: Quick deployments, managed platform

1. **Connect repository to DigitalOcean**
2. **Configure services:**
   - Database: Managed PostgreSQL
   - Backend: Docker container
   - Frontend: Node.js app
3. **Set environment variables**
4. **Deploy**

## Database Migrations

### Before Deployment

```bash
# Run migrations
cd backend
make migrate-up
```

### In Production

```bash
# Connect to production database
docker exec -it todogo-backend /bin/sh

# Run migrations
migrate -path /app/migrations -database "${DB_DSN}" up
```

## Monitoring

### Health Checks

- Backend: `GET /health`
- Frontend: `GET /` should return 200

### Logging

#### Docker Compose
```bash
docker-compose logs -f
docker-compose logs -f backend
```

#### Kubernetes
```bash
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend
```

### Monitoring Tools

- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Centralized logging
- **Sentry**: Error tracking
- **Uptime Robot**: Uptime monitoring

## Backup Strategy

### Database Backups

#### Automated Daily Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

docker exec todogo-db pg_dump -U postgres todogo > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### Restore from Backup
```bash
docker exec -i todogo-db psql -U postgres todogo < backup_20240115_020000.sql
```

## Security Checklist

- [ ] Use strong passwords
- [ ] Enable SSL/TLS
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Secure API endpoints
- [ ] Regular backups

## Performance Optimization

### Frontend
- Enable Next.js image optimization
- Use CDN for static assets
- Enable caching headers
- Compress responses (gzip/brotli)

### Backend
- Connection pooling (already configured)
- Database indexes (already configured)
- Response caching for read-heavy endpoints
- Load balancing across multiple instances

### Database
- Regular VACUUM and ANALYZE
- Index optimization
- Query optimization
- Connection pooling

## CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push backend
        run: |
          docker build -t registry/todogo-backend:${{ github.sha }} ./backend
          docker push registry/todogo-backend:${{ github.sha }}
      
      - name: Build and push frontend
        run: |
          docker build -t registry/todogo-frontend:${{ github.sha }} ./frontend
          docker push registry/todogo-frontend:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=registry/todogo-backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=registry/todogo-frontend:${{ github.sha }}
```

## Rollback

### Docker Compose
```bash
# Pull previous version
git checkout <previous-commit>
docker-compose up -d --build
```

### Kubernetes
```bash
# Rollback deployment
kubectl rollout undo deployment/backend
kubectl rollout undo deployment/frontend
```

## Troubleshooting

### Application won't start
- Check logs: `docker-compose logs`
- Verify environment variables
- Check database connectivity

### Database connection errors
- Verify credentials
- Check network connectivity
- Verify database is running

### High memory usage
- Check for memory leaks
- Adjust container limits
- Optimize queries

## Support

For deployment assistance:
- Documentation: https://docs.todogo.com
- Issues: GitHub Issues
- Email: support@todogo.com
