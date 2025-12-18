# Fix Prisma Permission Error on Windows

## Problem

```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp' -> 'query_engine-windows.dll.node'
```

This happens when the Prisma query engine file is locked by a running process (usually your backend server).

## Solution

### Step 1: Stop the Backend Server

Stop any running backend processes:

- If running in terminal: Press `Ctrl+C`
- If running in background: Find and kill the process

### Step 2: Retry Prisma Generate

```bash
cd backend
npx prisma generate
```

### Alternative: If Still Locked

1. **Close all terminals/IDEs** that might have the backend running
2. **Kill Node processes manually** (if needed):

   ```powershell
   taskkill /F /IM node.exe
   ```

   ⚠️ Warning: This kills ALL Node.js processes on your system!

3. **Try again**:
   ```bash
   npx prisma generate
   ```

### Alternative: Use PowerShell as Administrator

Sometimes running PowerShell as Administrator helps:

1. Right-click PowerShell/Command Prompt
2. Select "Run as Administrator"
3. Navigate to backend folder and run `npx prisma generate`

## Prevention

Always stop your backend server before running:

- `npx prisma generate`
- `npx prisma migrate dev`
- `npx prisma db push`

## After Success

Once Prisma generates successfully, restart your backend server:

```bash
npm run start:dev
```


