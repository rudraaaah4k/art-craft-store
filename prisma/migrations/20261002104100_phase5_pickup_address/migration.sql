-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "pickupAddressLine1" TEXT,
ADD COLUMN     "pickupAddressLine2" TEXT,
ADD COLUMN     "pickupCity" TEXT,
ADD COLUMN     "pickupCountry" TEXT NOT NULL DEFAULT 'India',
ADD COLUMN     "pickupEmail" TEXT,
ADD COLUMN     "pickupName" TEXT,
ADD COLUMN     "pickupPhone" TEXT,
ADD COLUMN     "pickupPostalCode" TEXT,
ADD COLUMN     "pickupState" TEXT;
