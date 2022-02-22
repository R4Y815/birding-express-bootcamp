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
  user_id INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(user_id)
      REFERENCES users(id) /* reference always tagged to Category table */
);

INSERT INTO users (email, password) VALUES ('Faiz@NHK.com','555StandingBy');
INSERT INTO users (email, password) VALUES ('Tony@StarkTowers.com','987654321');
INSERT INTO users (email, password) VALUES ('thanos@hellsgate.com','plantMyTrees');

INSERT INTO notes (date, behaviour, flock_size) VALUES ('2018-02-22', '| flappy flappy flappy',8 );
INSERT INTO notes (date, behaviour, flock_size) VALUES ('2021-08-19', 'jumpy jump hatch egg', 9);
INSERT INTO notes (date, behaviour, flock_size) VALUES ('2021-19-24', 'Younglings were about to jump', 5 );
INSERT INTO notes (date, behaviour, flock_size) VALUES ('2022-02-15','The red birds spotted a grey ca;r over by the carpark. \n Bombs away!', 3 )

