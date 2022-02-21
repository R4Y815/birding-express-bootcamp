DROP TABLE IF EXISTS notes;

CREATE TABLE notes (
  id SERIAL PRIMARY KEY, 
  date TEXT, 
  behaviour TEXT,
  flock_size INTEGER
);