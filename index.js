import pg from 'pg';
import express, { request } from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
/* ##### NEED TO INSTALL COOKIE PARSER #### */
/* import { add, read, edit, write } from './jsonFileStorage.js'; */
/* import { checkNullEntry } from './validation.js'; */

/* POSTGRESQL STACK BELOW */
/* Connecting database to server */
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'raytor27',
  host: 'localhost',
  database: 'raytor27',
  port: 5432, // Postgres server always runs on this port
};

const pool = new Pool (pgConnectionConfigs);

const app = express();
const port = 3010;

/* cookie functinality within js */
app.use(cookieParser());

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

/* NEW ROUTE TO SHOW BEHAVIOUR CHECKBOXES */
app.get('/note/:index/behaviours/add', (req, res) => {
  const { index } = req.params;
  pool.query('select * from behaviours ORDER BY activity ASC ', (error, result) => {
    const data = { noteId: index,
      behaviours: result.rows,
    };
    console.log(result.rows);
    res.render('behaviours', data);
  });
});

/* POST ROUTE TEST FOR BEHAVIOUR CATEGORIES */
/* app.post('/note/:index/behaviours', (req, res) => {
  const { index } = req.params;
  console.log('behaviour table IDs =', req.body.behaviour_ids);  */
   /* will be an array of numbers */
/*   res.send('works');
});
 */


/* LOOP OVER THE ARRAY of selected categories and insert the relevant entries to join table */
/* join table = note_behaviours */
app.post('/note/:noteId/behaviours', (req, res) => {
  console.log('req.body.behaviour_ids =', req.body.behaviour_ids);
  /* get the note id url param */
  const { noteId } = req.params;
  console.log('noteId =', noteId);
  const queryString =
    'INSERT INTO note_behaviours (note_id, behaviour_id) VALUES ($1, $2);';
  let queryDoneCounter = 0;
  /* for each behaviour category we have in the request, make an insert query */
  req.body.behaviour_ids.forEach((behaviourId, index) => {
    /* construct the set of values we are inserting */
    const values = [noteId, behaviourId];
    console.log('values =', values);
    pool.query(queryString, values, (error, result) => {
      /* query is done */
      /* console.log(result); */
      /* increment the counter, another query is done */
      queryDoneCounter += 1;

      /* check to see if all the queries are done */
      if (queryDoneCounter === req.body.behaviour_ids.length) {
        /* TODO: check if any of the queries had errors. */

        /* all the queries are done, send a response. */
        res.send('done!');
      }
    });
  });
});

/* NEW NOTE: RENDER  */
function newNoteEntry(_, res) {
  pool.query('SELECT * from species ORDER BY name ASC ;', (errorSpecies, resultSpecies) => {
    if (errorSpecies) {
      console.log('Error at Species Query =', errorSpecies);
      return;
    }
    pool.query('select * from behaviours ORDER BY activity ASC ', (errorBehaviours, resultBehaviours) => {
      if (errorBehaviours) {
        console.log('Error at Behaviours Query =', errorBehaviours);
        return;
      }
      const data = { species: resultSpecies.rows, behaviours: resultBehaviours.rows};
      res.render('newSighting', data);
    });
  });
}

app.get('/note', newNoteEntry);

/* CREATE NEW NOTE: POST */
app.post('/note', (req, res) => {
  console.dir(req.cookies.loggedIn);
  console.dir(req.cookies.user_id);
  const userId = req.cookies.user_id;
  const formSubmitted = req.body;
  const formData = JSON.parse(JSON.stringify(formSubmitted));
  /* console.log(req.body); */
  console.log(formData);
  const notesInput = [formData.date, formData.flock_size, formData.species_id, userId];
/*   console.log(notesInput); */
  const notesEntry = 'INSERT INTO notes (date, flock_size, species_id, userID) VALUES ($1, $2, $3, $4) RETURNING id;';
  const noteBehavInput = formData.behaviour_ids;
  console.log('noteBehavInput =', noteBehavInput);
  pool.query(notesEntry, notesInput, (error, insertResult) => {
  /* this error is anything that goes wrong with the query */
    if (error) {
      console.log('error', error);
    }
    /* rows key has the data */
    console.log(insertResult.rows);
    const noteId = insertResult.rows[0].id;
    console.log('noteId =', noteId);

    const noteQueryString = 'INSERT INTO note_behaviours (note_id, behaviour_id) VALUES ($1, $2);';
    let queryDoneCounter = 0;
    console.log('noteBehavInput.length =', noteBehavInput.length);
    noteBehavInput.forEach((behaviourId, index) => {
      const values = [noteId, behaviourId];
      pool.query(noteQueryString, values, (errorNote, resultNote) => {
        queryDoneCounter += 1;
        if (queryDoneCounter === noteBehavInput.length) {
          /* res.send('new log successfully created'); */
          res.redirect(301, `http://localhost:${port}/note/${noteId}`);
        }
      });
    });
  });
});

/* COMMENT COMPOSER */
app.post('/note/:index/comment', (req, res) => {
  const { index } = req.params;
  console.log('noteId = ', index);
  const commentData = JSON.parse(JSON.stringify(req.body));
  console.log('commentData = ', commentData);
  const commentInput = [index, commentData.comments, commentData.commenter_name];
  const commentQuery = 'INSERT INTO comments (c_note_id, comment_text, commenter ) VALUES ($1, $2, $3);';
  pool.query(commentQuery, commentInput, (err, results) => {
    if (err) {
      console.log('Comment Query Submit Error =', err);
      return;
    }
    res.send('comment sent out via POST successful');
  });
});

/* SPECIFIC NOTE */
app.get('/note/:index', (req, res) => {
  console.dir(req.cookies.userEmail);
  const loggedInUserEmail = req.cookies.userEmail;
  console.dir(loggedInUserEmail);
  const { index } = req.params;
  const dataIndex = [index];
  /* const get1Row = 'SELECT * FROM notes WHERE id = $1;'; */
  /* break up into separate queries, too many joins */
  const get1Row = 'SELECT notes.id AS notes_id, notes.date, species.name AS species_name, species.scientific_name, notes.flock_size, behaviours.activity, users.email, comments.comment_text, comments.commenter FROM notes INNER JOIN users ON notes.userid = users.id INNER JOIN species ON notes.species_id = species.id INNER JOIN note_behaviours ON notes.id = note_behaviours.note_id INNER JOIN behaviours ON note_behaviours.behaviour_id = behaviours.id INNER JOIN comments ON notes.id = comments.c_note_id WHERE notes.id = $1;';

  pool.query(get1Row, dataIndex, (err, results) => {
    if (err) {
      console.log('client query error =', err);
      return;
    }
    /* behaviour ids after 1st ones output in rows after row[0] */
    const activityArr = [];
    results.rows.forEach((row) => {
      activityArr.push(row.activity);
    });
    console.log('activityArr=', activityArr);
    const resultOut = results.rows[0];
    console.log(resultOut);
    const content = {
      index: index, date: resultOut?.date, speciesName: resultOut.species_name, scienName: resultOut.scientific_name, behaviours: activityArr, flockSize: resultOut.flock_size, logger: resultOut.email, userId:loggedInUserEmail, comment: resultOut?.comment_text, commentWriter: resultOut?.commenter
    };
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
    /* console.log(results.rows); */
    const dbObjArr = { results: results.rows };
    /* console.log(dbObjArr); */
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


/* ########## USER AUTH BELOW  ############################ */
/* Render SIGN UP FORM */
app.get('/signup', (req, res) => {
  res.render('signUp');
});

/* Accept POST req to create new user. */
app.post('/signup', (req,res) => {
  const userInfoSent = req.body;
  const userInfo = JSON.parse(JSON.stringify(userInfoSent));
  const userInfoData = [userInfo.email, userInfo.password];
  const userInfoToDb = 'INSERT INTO users (email, password) VALUES ($1, $2)';
  pool.query(userInfoToDb, userInfoData, (error, result) => {
  /* this error is anything that goes wrong with the query */
    if (error) {
      console.log('error', error);
    }
    /* rows key has the data */
/*     console.log(result.rows);
    const index = result.rows[0].id; */
   /*  console.log('index =', index); */
    res.redirect(301, `http://localhost:${port}/`);
  });
});

/* Render form to Log In user */
app.get('/login', (req, res) => {
  res.render('login');
});

/* Accept POST req  to Log In user */
app.post('/login', (req, res) => {
  console.log('request came in');

  const values = [req.body.email];

  pool.query('SELECT * FROM users WHERE email = $1', values, (error, result) => {
    if (error) {
      console.log('Error executing query', error.stack);
      res.status(503).send(result.rows);
      return;
    }

    if (result.rows.length === 0) {
      /* we didn't find a user with that email */
      /* the error for pw and user email are the same */
      /* Don't tell the user which error they got for */
      /* security reasons, otherwise people can guess */
      /* if a person is a user of a given service. */
      res.status(403).send('sorry');
      return;
    }

    const user = result.rows[0];
    console.log('user logging in =', req.body);
    console.log('Matched Details from Database, user = ', user);
    if (user.password === req.body.password) {
      res.cookie('loggedIn', true);
      res.cookie('user_id', user.id);
      res.cookie('userEmail', user.email);
      res.send('logged in');
     } else{
      /* password didn't match */
      /* the error for the pw and email are the same */
      /* Don't tell the user which error they got for */
      /* security reasons, otherwise people can guess */
      /* if a person is a user of a given service. */
      res.cookie('loggedIn', undefined);
      res.status(403).send("sorry!");
    }
  });
});

/* Ficticious Route Path to represent a path that requires authentication to visit */
app.get('/user-dashboard', (req, res) => {
  console.log(req.cookies);
  if (req.cookies.loggedIn === undefined) {
    res.status(403).send('sorry, Please Log In....');
    return;
  }
  res.send('logged into user-dashboard');
});

/* Log User out, delete their cookie */
app.delete('/logout', (req, res) => {
  res.clearCookie('loggedIn');
  res.clearCookie('user_id');
  res.send('cookies cleared');
});

/* ########## USER AUTH ABOVE  ############################ */

app.listen(port, () => console.log('listening on Port:', port));
