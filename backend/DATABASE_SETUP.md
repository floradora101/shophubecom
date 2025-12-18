# Database Setup Guide - Docker

## Quick Start with Docker

### Step 1: Start PostgreSQL with Docker

From the project root directory:

```bash
docker-compose up -d
```

This will:

- Download PostgreSQL 15 image (if not already downloaded)
- Create a container named `shopub-postgres`
- Create database `shopub`
- Expose PostgreSQL on port 5432
- Persist data in a Docker volume

### Step 2: Verify Database is Running

```bash
docker-compose ps
```

You should see `shopub-postgres` running.

### Step 3: Create .env File

Create `backend/.env` file with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shopub?schema=public"
JWT_ACCESS_SECRET="your-super-secret-access-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Note:** Default credentials are:

- Username: `postgres`
- Password: `postgres`
- Database: `shopub`
- Port: `5432`

**Change the password in production!**

### Step 4: Test Connection

```bash
cd backend
npx prisma db pull
```

If this works without errors, your connection is good!

### Step 5: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create all tables in the database
- Generate Prisma Client
- Set up the complete database schema

### Step 6: Verify Database Schema

```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

## Docker Commands

**Start database:**

```bash
docker-compose up -d
```

**Stop database:**

```bash
docker-compose down
```

**Stop and remove volumes (⚠️ deletes all data):**

```bash
docker-compose down -v
```

**View logs:**

```bash
docker-compose logs postgres
```

**Access PostgreSQL CLI:**

```bash
docker exec -it shopub-postgres psql -U postgres -d shopub
```

## Troubleshooting

**Port 5432 already in use:**

- Change port in `docker-compose.yml`: `'5433:5432'`
- Update DATABASE_URL: `postgresql://postgres:postgres@localhost:5433/shopub`

**Container won't start:**

```bash
docker-compose logs postgres
```

**Reset database:**

```bash
docker-compose down -v
docker-compose up -d
cd backend
npx prisma migrate dev --name init
```
