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

/* specific note */
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


/* ########## OLD CODE ############################ */

app.get('/shapes', (request, response) => {
  read('data.json', (err, data) => {
    const uniqueShapes = new Set();
    data.sightings.forEach((sighting) => {
      if(sighting.shape !== undefined) {
        uniqueShapes.add(sighting.shape);
        console.log(uniqueShapes);
      }
    });
    response.render('shapeDirectory', { shapes: [...uniqueShapes]});
  });
});

app.get('/shapes/:shape', (request, response) => {
  const { shape } = request.params;
  const { sort } = request.query;
  read('data.json', (err, data) => {
    const sighting = data.sightings.filter((sighting) => sighting.shape === shape);
    /*     if (sort === 'asc') {
      sightings.sort(compareState);
    } else if (sort === 'dsc') {
      sightings.sort((s1,s2) => -1 * compareState(s1, s2));
    } */
    response.render('sightingsByShape', { sighting });
  })
});

app.get('/sighting/:index', (request, response) => {
  read('data.json', (_, data) => {
    const { index } = request.params;
    const content = { index: index, sighting: data.sightings[index] };
    // Return HTML to client, merging "index" template with supplied data.
    response.render('sighting', content);
  });
});

app.put('/sighting/:index', (request, response) => {
  const { index } = request.params;
  console.log('requested params = ', request.params);
  console.log('index =', index);
  const { editedContent } = request.body;
  console.log('request.body', request.body);
  console.log('editedContent =', editedContent);
  read('data.json', (err, data) => {
    /* Replace the data in the object at the given index */
    data.sightings[index] = request.body; /* var['key'][index] another way to access object array */
    write('data.json', data, (err) => {
      read('data.json', (err, data) => {
        const content = { index: index, sighting: data.sightings[index] };
        // Return HTML to client, merging "index" template with supplied data.
        response.render('sighting', content);
      });
    });
  });
});

app.get('/sighting', (request, response) => {
  response.render('newSighting');
});

app.post('/sighting', (request, response) => {
  /* console.log('request.body =', request.body); */
  const formSubmitted = request.body;
  const formData = JSON.parse(JSON.stringify(formSubmitted));
  console.log(formData);
  const checkResult = checkNullEntry(formData);
  console.log('checkResult =', checkResult);
  if (checkResult === 1) {
    add('data.json', 'sightings', request.body, (callBack) => {
      if (callBack) {
        read('data.json', (_, data) => {
          const latestIndex = data.sightings.length - 1;
          response.redirect(301, `http://localhost:${port}/sighting/${latestIndex}`);
        });
        return;
      }
      response.status(500).send('DB write error.');
    });
  } else if (checkResult === 2) {
    /* */
    const content = { formData };
    /* */
    console.log(request.url);
    const prevRoute = request.url;
    response.send('Please fill up all fields');
   /*  response.render('newSightingAgain', content); */
  }

});

app.get('/sighting/:index/edit', (request, response) => {
  /* Retrieve current recipe data and render it */
  read('data.json', (err, jsonData) => {
    const { index } = request.params;
    const content = { index: index, sighting: jsonData.sightings[index] };
    /* pass the sighting Index to the edit form for the PUT request URL */
    response.render('edit', content);
  });
});

app.delete('/sighting/:index', (request, response) => {
  /* Remove element from DB at given index */
  const { index } = request.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      response.redirect(301, `http://localhost:${port}/`);
    });
  });
});

app.listen(port, () => console.log('listening on Port:', port));
