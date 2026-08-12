-- Kristallball Military Asset Management System Database Schema Dump (SQLite / PostgreSQL Relational Definition)

-- 1. Bases Table
CREATE TABLE IF NOT EXISTS "Base" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "baseId" INTEGER,
    FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE SET NULL
);

-- 3. EquipmentTypes Table
CREATE TABLE IF NOT EXISTS "EquipmentType" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL
);

-- 4. Assets (Current Stock levels) Table
CREATE TABLE IF NOT EXISTS "Asset" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "baseId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType" ("id") ON DELETE CASCADE,
    UNIQUE("baseId", "equipmentTypeId")
);

-- 5. Purchases Table
CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "baseId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType" ("id") ON DELETE CASCADE
);

-- 6. Transfers Table
CREATE TABLE IF NOT EXISTS "Transfer" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceBaseId" INTEGER NOT NULL,
    "destinationBaseId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatedById" INTEGER NOT NULL,
    FOREIGN KEY ("sourceBaseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("destinationBaseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("initiatedById") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- 7. Assignments Table
CREATE TABLE IF NOT EXISTS "Assignment" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "baseId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType" ("id") ON DELETE CASCADE
);

-- 8. Expenditures Table
CREATE TABLE IF NOT EXISTS "Expenditure" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "baseId" INTEGER NOT NULL,
    "equipmentTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("baseId") REFERENCES "Base" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType" ("id") ON DELETE CASCADE
);

-- 9. AuditLogs Table
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Indexes for performance on high-query filters
CREATE INDEX IF NOT EXISTS "idx_asset_base_equipment" ON "Asset" ("baseId", "equipmentTypeId");
CREATE INDEX IF NOT EXISTS "idx_purchase_created_at" ON "Purchase" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_transfer_bases" ON "Transfer" ("sourceBaseId", "destinationBaseId");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "AuditLog" ("createdAt");
