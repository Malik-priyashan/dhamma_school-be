-- Convert legacy YesNo enum columns to booleans.
ALTER TABLE "Student"
  ALTER COLUMN "earlierSchool" DROP DEFAULT,
  ALTER COLUMN "earlierSchool" TYPE BOOLEAN USING ("earlierSchool"::text = 'YES'),
  ALTER COLUMN "earlierSchool" SET DEFAULT false;

ALTER TABLE "StudentRequest"
  ALTER COLUMN "earlierSchool" DROP DEFAULT,
  ALTER COLUMN "earlierSchool" TYPE BOOLEAN USING ("earlierSchool"::text = 'YES'),
  ALTER COLUMN "earlierSchool" SET DEFAULT false;

ALTER TABLE "PrefectBoard"
  ALTER COLUMN "isPrefect" DROP DEFAULT,
  ALTER COLUMN "isPrefect" TYPE BOOLEAN USING ("isPrefect"::text = 'YES'),
  ALTER COLUMN "isPrefect" SET DEFAULT false,
  ALTER COLUMN "isClassLeader" DROP DEFAULT,
  ALTER COLUMN "isClassLeader" TYPE BOOLEAN USING ("isClassLeader"::text = 'YES'),
  ALTER COLUMN "isClassLeader" SET DEFAULT false,
  ALTER COLUMN "participateForCompetitions" DROP DEFAULT,
  ALTER COLUMN "participateForCompetitions" TYPE BOOLEAN USING ("participateForCompetitions"::text = 'YES'),
  ALTER COLUMN "participateForCompetitions" SET DEFAULT false,
  ALTER COLUMN "isInAnnouncingClub" DROP DEFAULT,
  ALTER COLUMN "isInAnnouncingClub" TYPE BOOLEAN USING ("isInAnnouncingClub"::text = 'YES'),
  ALTER COLUMN "isInAnnouncingClub" SET DEFAULT false,
  ALTER COLUMN "isOnStage" DROP DEFAULT,
  ALTER COLUMN "isOnStage" TYPE BOOLEAN USING ("isOnStage"::text = 'YES'),
  ALTER COLUMN "isOnStage" SET DEFAULT false,
  ALTER COLUMN "participateToKatina" DROP DEFAULT,
  ALTER COLUMN "participateToKatina" TYPE BOOLEAN USING ("participateToKatina"::text = 'YES'),
  ALTER COLUMN "participateToKatina" SET DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'YesNo'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE t.typname = 'YesNo'
      AND c.relkind IN ('r', 'p')
      AND a.attnum > 0
      AND NOT a.attisdropped
  ) THEN
    DROP TYPE "YesNo";
  END IF;
END $$;
