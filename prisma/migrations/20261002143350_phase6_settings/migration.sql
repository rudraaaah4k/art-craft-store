-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "sellerGstin" TEXT,
ADD COLUMN     "storeEmail" TEXT,
ADD COLUMN     "storeName" TEXT NOT NULL DEFAULT 'ArtCraft Store',
ADD COLUMN     "storePhone" TEXT;
