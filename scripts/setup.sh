#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Todogo Application Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker images built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker images${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Services started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}⏳ Waiting for services to be healthy...${NC}"
sleep 10

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Application is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📱 Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "🔧 Backend API: ${YELLOW}http://localhost:8080${NC}"
echo -e "🗄️  PostgreSQL: ${YELLOW}localhost:5432${NC}"
echo ""
echo -e "💡 Tips:"
echo -e "  - View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  - Stop services: ${YELLOW}docker-compose down${NC}"
echo -e "  - Rebuild: ${YELLOW}docker-compose up -d --build${NC}"
echo ""
