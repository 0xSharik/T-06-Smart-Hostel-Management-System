-- AlterTable
ALTER TABLE "visitors" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "visitors" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "visitors" ALTER COLUMN "inTime" DROP NOT NULL;

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "returnConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_qrToken_key" ON "visitors"("qrToken");

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
