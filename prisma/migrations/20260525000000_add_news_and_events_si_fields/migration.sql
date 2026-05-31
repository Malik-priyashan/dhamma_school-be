-- Add Sinhala content fields to news and events
ALTER TABLE "News"
ADD COLUMN "topicSi" TEXT,
ADD COLUMN "descriptionSi" TEXT;

ALTER TABLE "Event"
ADD COLUMN "topicSi" TEXT,
ADD COLUMN "descriptionSi" TEXT;