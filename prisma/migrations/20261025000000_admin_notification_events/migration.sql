-- Notify active admin streams when one of the notification sources changes.
-- The event carries no personal data; clients refetch the authorized snapshot.
CREATE OR REPLACE FUNCTION notify_admin_feed_changed()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('admin_notifications', 'changed');
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_request_admin_notification
AFTER INSERT OR UPDATE OR DELETE ON "StudentRequest"
FOR EACH ROW EXECUTE FUNCTION notify_admin_feed_changed();

CREATE TRIGGER prefect_admin_notification
AFTER INSERT OR UPDATE OR DELETE ON "PrefectBoard"
FOR EACH ROW EXECUTE FUNCTION notify_admin_feed_changed();

CREATE TRIGGER announcing_admin_notification
AFTER INSERT OR UPDATE OR DELETE ON "AnnouncingForm"
FOR EACH ROW EXECUTE FUNCTION notify_admin_feed_changed();

CREATE TRIGGER contact_admin_notification
AFTER INSERT OR UPDATE OR DELETE ON "ContactUs"
FOR EACH ROW EXECUTE FUNCTION notify_admin_feed_changed();
