-- psql -d birding -f init_table.sql 

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY, 
  email TEXT, 
  password TEXT
  );

CREATE TABLE notes (
  id SERIAL PRIMARY KEY, 
  date TEXT, 
  behaviour TEXT,
  flock_size INTEGER,
  userid INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(userID)
      REFERENCES users(id) /* reference always tagged to Category table */
);

INSERT INTO users (email, password) VALUES ('Faiz@NHK.com','555StandingBy');
INSERT INTO users (email, password) VALUES ('Tony@StarkTowers.com','987654321');
INSERT INTO users (email, password) VALUES ('thanos@hellsgate.com','plantMyTrees');

INSERT INTO notes (date, behaviour, flock_size, userid) VALUES 
('2018-02-22', 'flappy flappy flappy', 8, 1),
('2021-08-19', 'jumpy jump hatch egg', 9, 2),
('2021-19-24', 'Younglings were about to jump', 5, 3),
('2022-02-15','The red birds spotted a grey car over by the carpark. Bombs away!', 3, 1);

-- JOIN notes to users
SELECT notes.id AS notes_id, notes.date, notes.userid AS notes_userID, users.id AS users_id, users.email 
FROM notes
INNER JOIN users
ON notes.userid = users.id
WHERE notes.userid = 3;

-- based on userid, return email

SELECT users.email 
FROM notes
INNER JOIN users
ON notes.userid = users.id
WHERE notes.userid = 3; -- or user id variable

-- show users' notes based on user email 
SELECT notes.id AS notes_id, notes.date, notes.behaviour, notes.flock_size, users.email
FROM notes
INNER JOIN users
ON notes.userid = users.id
WHERE notes.userid = 1;