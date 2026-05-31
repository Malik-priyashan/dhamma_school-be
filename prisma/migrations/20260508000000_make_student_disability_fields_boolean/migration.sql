-- Convert Student and StudentRequest disability-related flags from the YesNo enum to booleans.
ALTER TABLE "Student"
  ALTER COLUMN "disabilities" DROP DEFAULT,
  ALTER COLUMN "disabilities" TYPE BOOLEAN USING (CASE WHEN "disabilities" = 'YES' THEN TRUE ELSE FALSE END),
  ALTER COLUMN "disabilities" SET DEFAULT FALSE,
  ALTER COLUMN "medicated" DROP DEFAULT,
  ALTER COLUMN "medicated" TYPE BOOLEAN USING (CASE WHEN "medicated" = 'YES' THEN TRUE ELSE FALSE END),
  ALTER COLUMN "medicated" SET DEFAULT FALSE;

ALTER TABLE "StudentRequest"
  ALTER COLUMN "disabilities" DROP DEFAULT,
  ALTER COLUMN "disabilities" TYPE BOOLEAN USING (CASE WHEN "disabilities" = 'YES' THEN TRUE ELSE FALSE END),
  ALTER COLUMN "disabilities" SET DEFAULT FALSE,
  ALTER COLUMN "medicated" DROP DEFAULT,
  ALTER COLUMN "medicated" TYPE BOOLEAN USING (CASE WHEN "medicated" = 'YES' THEN TRUE ELSE FALSE END),
  ALTER COLUMN "medicated" SET DEFAULT FALSE;