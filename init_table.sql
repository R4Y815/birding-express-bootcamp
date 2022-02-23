-- psql -d birding -f init_table.sql 

DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS species;

-- ONE user to MANY notes, ONE note to ONE user
CREATE TABLE users (
  id SERIAL PRIMARY KEY, 
  email TEXT, 
  password TEXT
  );

-- ONE NOTE to ONE SPECIES, ONE SPECIES TO MANY NOTES ( which is the JOIN TABLE? )
CREATE TABLE species (
  id SERIAL PRIMARY KEY, 
  name TEXT,
  scientific_name TEXT
);

-- MANY
CREATE TABLE notes (
  id SERIAL PRIMARY KEY, 
  date TEXT, 
  behaviour TEXT,
  flock_size INTEGER,
  userid INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(userID)
      REFERENCES users(id), /* reference always tagged to Category table */
  species_id INTEGER,
  CONSTRAINT fk_species
      FOREIGN KEY(species_id)
      REFERENCES species(id) /* reference always tagged to Category table */
);


INSERT INTO users (email, password) VALUES ('Faiz@NHK.com','555StandingBy');
INSERT INTO users (email, password) VALUES ('Tony@StarkTowers.com','987654321');
INSERT INTO users (email, password) VALUES ('thanos@hellsgate.com','plantMyTrees');

INSERT into species (name, scientific_name) VALUES
('King Quail', 'Excalfactoria chinensis'),
('Red Junglefowl', 'Gallus gallus'),
('Wandering Whistling Duck', 'Dendrocygna arcuata'),
('Lesser Whistling Duck', 'Dendrocygna javanica'),
('Cotton Pygmy Goose', ' Nettapus coromandelianus'),
('Garganey', 'Spatula querquedula'),
('Northern Shoveler', 'Spatula clypeata'),
('Gadwall', 'Mareca strepera'),
('Eurasian Wigeon', 'Mareca penelope'),
('Northern Pintail', 'Anas acuta'),
('Tufted Duck', 'Aythya fuligula'),
('Plume-toed Swiftlet', 'Collocalia affinis'),
('Little Green Pigeon', 'Treron fulvicollis');

INSERT INTO notes (date, behaviour, flock_size, species_id, userid) VALUES 
('2018-02-22', 'flappy flappy flappy', 8, 11, 1),
('2021-08-19', 'jumpy jump hatch egg', 9, 4, 2),
('2021-19-24', 'Younglings were about to jump', 5, 6, 3),
('2022-02-15','The red birds spotted a grey car', 3, 10, 1);

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

-- show name of bird with notes, user,

SELECT notes.id AS notes_id, notes.date, users.email, species.name AS species_name, notes.flock_size
FROM users
INNER JOIN notes
ON notes.userid = users.id
INNER JOIN species 
ON notes.species_id = species.id;

SELECT notes.id, notes.date, notes.behaviour, notes.flock_size, users.email,  species.name, species.scientific_name
FROM notes 
INNER JOIN users 
ON notes.userid = users.id 
INNER JOIN species 
ON notes.species_id = species.id 
WHERE notes.userid = 1;

--it commit -m "3.POCE.7:BASICS done. Species Drop-Down when writing new log and shown on new Note."