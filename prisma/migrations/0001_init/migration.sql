-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Vertical" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "Vertical_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Vertical_slug_key" ON "Vertical"("slug");

CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rnc" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Domain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "domainFull" TEXT NOT NULL,
    "verticalId" INTEGER,
    "countryId" INTEGER,
    "subtype" TEXT,
    "status" TEXT NOT NULL DEFAULT 'parked',
    "priority" TEXT NOT NULL DEFAULT 'low',
    "registrar" TEXT,
    "entityId" INTEGER,
    "registeredAt" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "annualCostUsd" DOUBLE PRECISION,
    "cfZoneId" TEXT,
    "cfNameserver1" TEXT,
    "cfNameserver2" TEXT,
    "cfSslMode" TEXT,
    "cfEmailRouting" BOOLEAN NOT NULL DEFAULT false,
    "cfEmailDest" TEXT,
    "hostingProvider" TEXT,
    "serverIp" TEXT,
    "coolifyResource" TEXT,
    "containerName" TEXT,
    "port" INTEGER,
    "framework" TEXT,
    "hasLanding" BOOLEAN NOT NULL DEFAULT false,
    "hasLeadCapture" BOOLEAN NOT NULL DEFAULT false,
    "redirectTo" TEXT,
    "redirectType" TEXT,
    "workerRule" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Domain_domainFull_key" ON "Domain"("domainFull");

CREATE TABLE "DomainWatchlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "domainFull" TEXT NOT NULL,
    "currentOwner" TEXT,
    "registrar" TEXT,
    "expiryDate" TIMESTAMP(3),
    "estimatedPrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'monitoring',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "vertical" TEXT,
    "lastWhoisCheck" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DomainWatchlist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DomainWatchlist_domainFull_key" ON "DomainWatchlist"("domainFull");

CREATE TABLE "WhoisCheck" (
    "id" SERIAL NOT NULL,
    "domainId" INTEGER,
    "watchlistId" INTEGER,
    "domainFull" TEXT NOT NULL,
    "registrar" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT,
    "rawData" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhoisCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Trademark" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'marca',
    "niceClass" TEXT,
    "expediente" TEXT,
    "certificate" TEXT,
    "entityId" INTEGER,
    "verticalId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "registeredAt" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "renewalCost" DOUBLE PRECISION,
    "logoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Trademark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TradeName" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "expediente" TEXT,
    "certificate" TEXT,
    "entityId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "registeredAt" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "renewalCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradeName_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MercantileRecord" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "rnc" TEXT,
    "companyType" TEXT,
    "chamber" TEXT,
    "registryNumber" TEXT,
    "entityId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "registeredAt" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "renewalCost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MercantileRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "trademarkId" INTEGER,
    "tradeNameId" INTEGER,
    "mercantileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertConfig" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "daysBeforeAlert" INTEGER NOT NULL DEFAULT 30,
    "telegramChatId" TEXT,
    "emailTo" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AlertLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "assetId" INTEGER NOT NULL,
    "assetName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentVia" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WhoisCheck" ADD CONSTRAINT "WhoisCheck_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WhoisCheck" ADD CONSTRAINT "WhoisCheck_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "DomainWatchlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Trademark" ADD CONSTRAINT "Trademark_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Trademark" ADD CONSTRAINT "Trademark_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TradeName" ADD CONSTRAINT "TradeName_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MercantileRecord" ADD CONSTRAINT "MercantileRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_trademarkId_fkey" FOREIGN KEY ("trademarkId") REFERENCES "Trademark"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_tradeNameId_fkey" FOREIGN KEY ("tradeNameId") REFERENCES "TradeName"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_mercantileId_fkey" FOREIGN KEY ("mercantileId") REFERENCES "MercantileRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
