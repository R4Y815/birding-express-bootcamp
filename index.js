import pg from 'pg';
import express from 'express';
import methodOverride from 'method-override';
/* import { add, read, edit, write } from './jsonFileStorage.js'; */
/* import { checkNullEntry } from './validation.js'; */

/* POSTGRESQL STACK BELOW */
/* Connecting database to server */
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'raytor27',
  host: 'localhost',
  database: 'birding',
  port: 5432, // Postgres server always runs on this port
};

const pool = new Pool (pgConnectionConfigs);

const app = express();
const port = 3008;

/* Override POST requests with query param ?_method=PUT to be PUT requests */
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: false }));

/* tells express how to serve static files and from 'public folder' */
app.use(express.static('public'));
// Set view engine
app.set('view engine', 'ejs');

/* query done callback */ 
const whenQueryDone = (error, result) => {
  /* this error is anything that goes wrong with the query */
  if (error) {
    console.log('error', error);
  } else {
    /* rows key has the data */
    console.log(result.rows);
  }

};



/* POSTGRESQL STACK ABOVE */

/* NEW NOTE: RENDER  */
app.get('/note', (_, res) => {
  res.render('newSighting');
});

/* NEW NOTE: POST */
app.post('/note', (req, res) => {
  const formSubmitted = req.body;
  const formData = JSON.parse(JSON.stringify(formSubmitted));
  console.log(req.body);
  console.log(formData);
  const inputData = [formData.date, formData.behaviour, formData.flock_size];
  console.log(inputData);
  const logEntry = 'INSERT INTO notes (date, behaviour, flock_size) VALUES ($1, $2, $3) RETURNING id;';
  pool.query(logEntry, inputData, (error, result) => {
  /* this error is anything that goes wrong with the query */
    if (error) {
      console.log('error', error);
    } 
      /* rows key has the data */
      console.log(result.rows);
      const index = result.rows[0].id;
      console.log('index =', index);

    res.redirect(301, `http://localhost:${port}/note/${index}`);
  });
});

/* SPECIFIC NOTE */
app.get('/note/:index', (req, res) => {
/*   let sighting;
  let resultOut; */
  const { index } = req.params;
  const dataIndex = [index];
  const get1Row = 'SELECT * FROM notes WHERE id = $1;';
  pool.query(get1Row, dataIndex, (err, results) => {
    if (err) {
      console.log('client query error =', err);
      return;
    }
    console.log(results.rows[0]);
    const resultOut = results.rows[0];
    const content = { index:index, date: resultOut.date,  behaviour: resultOut.behaviour, flockSize: resultOut.flock_size };
    res.render('sighting', content);
  });
});

/* HOME PAGE to show list of BIRD peepings */
app.get('/', (_, res) => {
  /* draw out data from postgresSQL */
  const getAllRows = 'SELECT * FROM notes ORDER BY id ASC';
  pool.query(getAllRows, (err, results) => {
    if (err) {
      console.log('client query error =', err);
      return;
    }
    console.log(results.rows);
    const dbObjArr = {results: results.rows};
    console.log(dbObjArr);
/*     response.send('pushed data from DB to front-end, not yet rendered page'); */
    res.render('home', dbObjArr);
  });
});

/* EDIT PAGE - for GET  */
app.get('/note/:index/edit', (req, res) => {
  const { index } = req.params;
  const dataIndex = [index];
  const get1Row = 'SELECT * FROM notes WHERE id = $1;';
  pool.query(get1Row, dataIndex, (err, results) => {
    if (err) {
      console.log('client query error =', err);
      return;
    }
    console.log(results.rows[0]);
    const resultOut = results.rows[0];
    const content = { index:index, date: resultOut.date,  behaviour: resultOut.behaviour, flockSize: resultOut.flock_size };
    res.render('edit', content);
  });
});

/* EDIT PAGE - for POST */
app.put('/note/:index', (req, res) => {
  const { index } = req.params;
  const updateData = req.body;
  const updDate = updateData.date;
  const updBehaviour = updateData.behaviour;
  const updFlockSize = updateData.flock_size;
  console.log(updDate);
  console.log(updBehaviour);
  console.log(updFlockSize);
  const editData = [updDate, updBehaviour, updFlockSize, index];
  const updateQuery = 'UPDATE notes SET date = $1, behaviour = $2, flock_size = $3 WHERE id = $4;';
  pool.query(updateQuery, editData, whenQueryDone);

  res.redirect(301, `http://localhost:${port}/note/${index}`);
});

/* DELETE PAGE from DataBase frm Home */
app.delete('/note/:index', (req, res) => {
  const { index } = req.params;
  const delData = [index];
  const delQuery = 'DELETE FROM notes WHERE id = $1;';
  pool.query(delQuery, delData, (err, result) => {
    if (err) {
      console.log('error at delete query launch', err);
    }
    res.redirect(301, `http://localhost:${port}`);
  });
});




app.listen(port, () => console.log('listening on Port:', port));
