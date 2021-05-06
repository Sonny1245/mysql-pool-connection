require('dotenv').config();
const express = require('express');
const pool = require('./config/connection');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

//Welcome Route:
app.get('/', (req, res) => {
    res.json({
        Message: 'Welcome to MySql Connection Home Page!'
    });
});

//Let CHECK CONNECTION if it works:
app.get('/getMySqlConnected', (req, res)=> {
    pool.getConnection((err) => {
        if (err) {
            console.error('Something went wrong here ======> ' + err.message);
            res.sendStatus(500);
            return;
        } else {
            console.log('Successfully Connected...');
            res.json({
                Message: 'MySql Connected Successfully...'
            });
        };  
    });   
});

//Let RETRIEVE ALL records from MySql Database with the table: users
//To access to this route, we must create a valid token...
app.get('/getMySqlRecords', verifyToken, (req,res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
        let sql = 'SELECT * FROM users';
    pool.query(sql, (err, rows, fields) => {
        if(err) throw err;
        console.table(rows);
        res.json(rows);
    });
        }
        console.log(authData);
    });   
});

//Let RETRIEVE a single record by using: student_id
app.get('/getMySqlRecords/:id', (req,res) => {
    let userId = req.params.id;
    let sql = 'SELECT * FROM users WHERE student_id = ?';
    pool.query(sql, [userId], (err, rows, fields) => {
        if(err) throw err;
        console.table(rows);
        res.json(rows);
    });
});

//DELETE a single record by using: make sure to test on Postman must have an id to delete: like: 1, 2, 3, 4, 5, 6...
app.delete('/deleteMySqlRecord/:id', (req,res) => {
    let userId = req.params.id;
    let sql = 'DELETE FROM users WHERE student_id = ?';
    pool.query(sql, [userId], (err, rows, fields) => {
        if(err) throw err;
        console.table(rows);
        res.json({
            Message: 'Delete a single record Successully...'
        });
    });
});

//INSERT a single record:
app.get('/addRecord', (req, res) => {
    let newRecord = {first_name: 'Jenifer', last_name: 'Lopel', email: 'jlopel@aol.com', sex: 'F' };
    let sql = 'INSERT INTO users SET ?';
    pool.query(sql, newRecord, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.json({
            Message: 'New Record  Added Successfully...'
        });
    });
});

//UPDATE a record: make sure to test on Postman must have an id: here 6
app.get('/updatedMySqlRecord/:id', (req,res) => {
    let updatedRecord = ["Elizabeth","Garcia","egarcia@gmail.com", "F", 6 ];
    let sql = 'UPDATE users SET first_name =?, last_name =?, email =?, sex =? WHERE student_id = ?';
    pool.query(sql,updatedRecord,(error, results, fields) => {
        if (error){
            return console.error(error.message);
          }
        console.log('Rows affected: ', results.affectedRows);
        res.json({
            Message: 'Updated Record Successfully...'
        });
    });
});

//Create a valid Token 
app.post("/createdToken", (request, response) => {
  
    const test = {
      UUUID: 'Secrete',
      Author: "Sonny Nguyen",
      Email: "son.nguyen@dmv.ca.gov"
    };
    jwt.sign({ test }, "secretkey", { expiresIn: "45 days" }, (err, token) => {
      response.json({
        token
      });
    });
  });

//Middleware Function:
function verifyToken(request, response, next) {
    //Get header value:
    const bearerHeader = request.headers["authorization"];
    //Check if bearer is undefined:
    if (typeof bearerHeader !== "undefined") {
      //Split at the space:
      const bearer = bearerHeader.split(" ");
      //Get Token from the array:
      const bearerToken = bearer[1];
      //Set the Token
      request.token = bearerToken;
      //Call next Middleware:
      next();
    } else {
      //Forbidden
      response.sendStatus(403);
    }
  }  

//ENVIREMENT VARIABLE:
const port = process.env.APP_PORT;
app.listen(port, () => {
    console.log(`Server started running on ${port}...`)
});
