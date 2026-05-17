-- Add ADMIN back to the UserRole enum so registration can accept admin users again.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN' BEFORE 'TEACHER';