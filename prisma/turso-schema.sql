-- Apply once to Turso: turso db shell glucocontrol-ips < prisma/turso-schema.sql

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "diabetesType" TEXT NOT NULL DEFAULT 'tipo2',
    "targetMin" INTEGER NOT NULL DEFAULT 70,
    "targetMax" INTEGER NOT NULL DEFAULT 140,
    "doctorName" TEXT,
    "medications" TEXT,
    "mealTimes" TEXT,
    "glucoseIntervalHours" INTEGER NOT NULL DEFAULT 4,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlucoseReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'comida',
    "carbs" REAL NOT NULL DEFAULT 0,
    "sugar" REAL,
    "fat" REAL,
    "saturatedFat" REAL,
    "protein" REAL,
    "fiber" REAL,
    "sodium" REAL,
    "calories" REAL,
    "servingSize" TEXT,
    "autoAnalyzed" BOOLEAN NOT NULL DEFAULT true,
    "nutritionSource" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NutritionCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionCache_query_key" ON "NutritionCache"("query");
