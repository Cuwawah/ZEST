-- DropIndex
DROP INDEX "EventType_slug_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "EventType_slug_key" ON "EventType"("slug");
