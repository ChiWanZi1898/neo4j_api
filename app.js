const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const driver = require('./db');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/director/movies', (req, res) => {
  const session = driver.session();
  const name = req.query.name;
  const query = `MATCH ({name: '${name}'}) - [:DIRECTED] -> (m)  Return m`;
  let movies = new Array();
  session.run(query)
    .subscribe({
      onNext: function (record) {
        movies.push(record.get('m').properties.title);
      },
      onCompleted: function () {
        // Completed!
        session.close();
        const moviesSet = new Set(movies);
        movies = [...moviesSet];
        const moviesString = movies.join('\n');
        res.status(200).send(moviesString);
      },
      onError: function (error) {
        console.log(error);
      }
    });
});


app.get('/movie/actors', (req, res) => {
  const session = driver.session();
  const title = req.query.title;
  const query = `MATCH (a) - [:ACTED_IN] -> (m {title: '${title}'})  Return a`;
  let actors = new Array();
  session.run(query)
    .subscribe({
      onNext: function (record) {
        actors.push(record.get('a').properties.name);
      },
      onCompleted: function () {
        // Completed!
        session.close();
        const actorsSet = new Set(actors);
        actor = [...actorsSet];
        const actorsString = actors.join('\n');
        res.status(200).send(actorsString);
      },
      onError: function (error) {
        console.log(error);
      }
    });
});

module.exports = app;
