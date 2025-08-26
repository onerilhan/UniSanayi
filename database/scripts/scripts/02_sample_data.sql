-- Test verisi ekleyelim
INSERT INTO users (email, password_hash, user_type) 
VALUES ('student@test.com', 'hash123', 'student'),
       ('company@test.com', 'hash456', 'company');

-- Tabloları kontrol edelim  
SELECT * FROM users;
SELECT * FROM students;
SELECT * FROM companies;