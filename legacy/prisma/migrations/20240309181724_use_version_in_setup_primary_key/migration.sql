/*
  Warnings:

  - The primary key for the `Setup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Setup" DROP CONSTRAINT "Setup_pkey",
ADD CONSTRAINT "Setup_pkey" PRIMARY KEY ("step", "version");
