ALTER TABLE admin_credentials ADD COLUMN secret_salt TEXT;
ALTER TABLE admin_credentials ADD COLUMN secret_hash TEXT;
