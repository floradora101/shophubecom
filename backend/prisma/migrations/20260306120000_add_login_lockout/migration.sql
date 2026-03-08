-- CreateTable: Account lockout after repeated failed logins
CREATE TABLE "public"."LoginLockout" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginLockout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoginLockout_email_key" ON "public"."LoginLockout"("email");
CREATE INDEX "LoginLockout_email_idx" ON "public"."LoginLockout"("email");
CREATE INDEX "LoginLockout_lockedUntil_idx" ON "public"."LoginLockout"("lockedUntil");
