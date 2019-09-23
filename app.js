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
        const moviesJson = JSON.stringify(movies);
        res.status(200).send(moviesJson);
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
        const actorsJson = JSON.stringify(actors);
        res.status(200).send(actorsJson);
      },
      onError: function (error) {
        console.log(error);
      }
    });
});

module.exports = app;
