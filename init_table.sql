-- psql -d birding -f init_table.sql 

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS note_behaviours;
DROP TABLE IF EXISTS behaviours;
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

-- ONE behaviour to MANY notes, ONE note to MANY behaviours 
CREATE TABLE behaviours (
  id SERIAL PRIMARY KEY, 
  activity TEXT
);


-- ONE note to only ONE SPECIES, to only ONE USER, but TO MANY BEHAVIOURS
-- behaves like join table?
CREATE TABLE notes (
  id SERIAL PRIMARY KEY, 
  date TEXT, 
  flock_size INTEGER,
  userid INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(userID)
      REFERENCES users(id) /* reference always tagged to Category table */
      ON DELETE CASCADE,
  species_id INTEGER,
  CONSTRAINT fk_species
      FOREIGN KEY(species_id)
      REFERENCES species(id) /* reference always tagged to Category table */
      ON DELETE CASCADE
);

CREATE TABLE note_behaviours (
  id SERIAL PRIMARY KEY,
  note_id INTEGER,
  CONSTRAINT fk_note
     FOREIGN KEY(note_id)
     REFERENCES notes(id)
     ON DELETE CASCADE,
  behaviour_id INTEGER,
    CONSTRAINT fk_behaviour
      FOREIGN KEY(behaviour_id)
      REFERENCES behaviours(id)
      ON DELETE CASCADE
);

-- ONE note can have MANY comments, each comment is only on ONE note
CREATE TABLE comments (
  id SERIAL PRIMARY KEY, 
  commenter TEXT,
  comment_text TEXT,
  c_note_id INTEGER,
     CONSTRAINT fk_note
      FOREIGN KEY(c_note_id)
      REFERENCES notes(id)
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

INSERT INTO behaviours (activity) VALUES 
('Resting'),
('Song: Long'),
('Song: Short'),
('Preening'),
('Perched'),
('Hunting'),
('Foraging'),
('Bathing'),
('Gathering Nesting Materials'),
('Feeding Young'),
('Mating'),
('Flying'),
('Drinking');

INSERT INTO notes (date, flock_size, species_id, userid) VALUES 
('2018-02-22', 8, 11, 1),
('2021-08-19', 9, 4, 2),
('2021-19-24', 5, 6, 3),
('2022-02-15', 3, 10, 1);


--- do not add first. can be added through the webpage app
INSERT INTO note_behaviours (note_id, behaviour_id) VALUES
(1, 12),
(2, 3),
(3, 6),
(4, 8);

--- do not add first. can be added through the webpage app
/* INSERT INTO comments (commenter, comment_text, c_note_id) VALUES


 */

-- connect notes, species names, 
SELECT notes.id, notes.date, species.name AS species_name, notes.flock_size 
FROM notes  
INNER JOIN species 
ON notes.species_id = species.id
ORDER BY notes.id ASC; -- DESC for descending



-- connect user, notes, species names, behaviour tables 
SELECT notes.id AS notes_id, notes.date, species.name AS species_name, species.scientific_name, notes.flock_size, behaviours.activity, users.email FROM notes 
INNER JOIN users 
ON notes.userid = users.id 
INNER JOIN species 
ON notes.species_id = species.id 
INNER JOIN note_behaviours 
ON notes.id = note_behaviours.note_id 
INNER JOIN behaviours 
ON note_behaviours.behaviour_id = behaviours.id 
WHERE notes.id = 1;



-- connect user, notes, species names, behaviour tables and COMMENTs
SELECT notes.id AS notes_id, notes.date, species.name AS species_name, species.scientific_name, notes.flock_size, behaviours.activity, users.email, comments.comment_text, comments.commenter
FROM notes
INNER JOIN users
ON notes.userid = users.id
INNER JOIN species
ON notes.species_id = species.id
INNER JOIN note_behaviours
ON notes.id = note_behaviours.note_id
INNER JOIN behaviours
ON note_behaviours.behaviour_id = behaviours.id
INNER JOIN comments
ON notes.id = comments.c_note_id
WHERE notes.id = 1;


