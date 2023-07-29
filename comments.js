// Create web server application using express
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Use body parser to parse JSON body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all HTTP methods
app.use(cors());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
// mongodb://localhost:27017/mean
MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mean", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();

  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// API routes
app.get('/api/comments', function (req, res) {
  db.collection(COMMENTS_COLLECTION).find({}).toArray(function (err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get comments.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post('/api/comments', function (req, res) {
  var newComment = req.body;
  newComment.createDate = new Date();

  if (!req.body.name) {
    handleError(res, "Invalid user input", "Must provide a name.", 400);
  } else {
    db.collection(COMMENTS_COLLECTION).insertOne(newComment, function (err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new comment.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});

app.get('/api/comments/:id', function (req, res) {
  db.collection(COMMENTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function (err, doc) {
    if (err) {
      handleError(res, err