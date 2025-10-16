-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('PRD', 'ARCHITECTURE', 'STORY', 'QA', 'OTHER');

-- CreateEnum
CREATE TYPE "WebhookSource" AS ENUM ('GITHUB', 'GITLAB', 'BITBUCKET');

-- CreateEnum
CREATE TYPE "MCPResult" AS ENUM ('SUCCESS', 'FAILURE', 'UNAUTHORIZED', 'RATE_LIMITED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "version" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dependencies" JSONB NOT NULL,
    "content" TEXT,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" "WebhookSource" NOT NULL,
    "projectId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MCPAuditLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "argsHash" TEXT NOT NULL,
    "result" "MCPResult" NOT NULL,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,

    CONSTRAINT "MCPAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_repoUrl_key" ON "Project"("repoUrl");

-- CreateIndex
CREATE INDEX "Project_repoUrl_idx" ON "Project"("repoUrl");

-- CreateIndex
CREATE INDEX "Artifact_projectId_type_idx" ON "Artifact"("projectId", "type");

-- CreateIndex
CREATE INDEX "Artifact_projectId_updatedAt_idx" ON "Artifact"("projectId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_projectId_path_key" ON "Artifact"("projectId", "path");

-- CreateIndex
CREATE INDEX "WebhookEvent_projectId_processed_idx" ON "WebhookEvent"("projectId", "processed");

-- CreateIndex
CREATE INDEX "WebhookEvent_payloadHash_idx" ON "WebhookEvent"("payloadHash");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_id_source_key" ON "WebhookEvent"("id", "source");

-- CreateIndex
CREATE INDEX "MCPAuditLog_projectId_timestamp_idx" ON "MCPAuditLog"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "MCPAuditLog_actorId_timestamp_idx" ON "MCPAuditLog"("actorId", "timestamp");

-- CreateIndex
CREATE INDEX "MCPAuditLog_tool_timestamp_idx" ON "MCPAuditLog"("tool", "timestamp");

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCPAuditLog" ADD CONSTRAINT "MCPAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
