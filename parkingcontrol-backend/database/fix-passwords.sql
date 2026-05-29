-- Ejecutar si ya importaste schema.sql con el hash incorrecto
USE parking_db;

UPDATE usuarios SET password = '$2a$12$x.RV2O1Ze6xwCwqwaduQWeomhvTl4eB6Xy3l3W2DcFTL2FwVv/oea'
WHERE email IN ('admin@parking.com', 'operador@parking.com');
