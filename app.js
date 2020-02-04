const express = require('express');
const app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
const router = express.Router();
var sessionStorage = require("sessionstorage");

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false});

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded());

app.set('views' , __dirname+'/public');
app.engine('html' , require('ejs').renderFile);
app.set('view engine' , 'html');



var sess;

//ananya: showing unverified users on admins page
/*
var str = "";
app.route('/Employeeid').get(function(req, res)

    {
        MongoClient.connect(url, function(err, db) {
            var db = db.db("AlumDB");
            var cursor = db.collection('Users').find();
            //noinspection JSDeprecatedSymbols
            cursor.each(function(err, item) {

                if (item != null) {
                    if(item.flag==0)
                   // str = str + "    Employee id  " + item.Employeeid + "</br>";
                }
            });
            res.send(str);
            db.close();
        });
    });
*/
//yaha tak


app.post("/login" , (req , res)=>{
    var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("AlumDB");
  dbo.collection("Users").findOne({email : req.body.email} , (err , result)=>{
      if (result.flag == 1){
          if(result.password == req.body.password){
            sess = req.session;
            sess.email = req.body.email;
            return res.redirect('/welcome');
      }
      else{
          res.sendfile('public/index.html');
      }
  }
})

});
    //res.sendfile("public/index.html");
})

app.get('/requestPending' , (req , res)=>{
    sess=req.session;
    console.log(sess.InstituteName);
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("AlumDB");
    dbo.collection("Users").find({college : sess.InstituteName , flag : 0},{projection:{password: 0 , email: 0, college: 0}}).toArray((err , result)=>{
        if (err) throw err;
        console.log(result);
        //res.render('pendingRequest' , {data : result});
        result.forEach(element => {
            var n1= element.Name ;
            var en1= element.enrollment ;
            res.write(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Document</title>
            </head>
            <body>
                <h3>
                    <TABLE>
                        <tr>
                            <td> ${n1} </td>
                            <td> ${en1} </td>
                            <td> <button style="height:50px;width:100px"  onclick="/flagset" value="approve">Approve</button></td>
                        </tr>
                         </TABLE>
            
                </h3>
            </body>
            </html>`)
        });
    })

})
})


app.get('/' , (req , res )=>{
    res.sendfile('public/index.html');
})

/* app.get('/registration' , (req , res)=>{
    res.sendfile('registration.html');
}) */
app.get('/logout' , (req, res)=>{
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
})
})

//ananya
app.post("/adminlogin" , (req , res)=>{
    var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("AlumDB");
  dbo.collection("Admins").findOne({College : req.body.InstituteName} , (err , result)=>{
      if (result.Password == req.body.Password){
          
            sess = req.session;
            sess.InstituteName = req.body.InstituteName;
            console.log('login successful');
            return res.redirect('/adminPage');
      }
      else{
          res.sendfile('public/admin.html');
      }
  
})

});
    //res.sendfile("public/index.html");
})
//end
/* app.get('/flagset' , (err , res)=>{
    var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("AlumDB");
  dbo.collection("Admins").findOne({College : req.body.InstituteName} , (err , result)=>{
      if (result.Password == req.body.Password){
          
            sess = req.session;
            sess.InstituteName = req.body.InstituteName;
            console.log('login successful');
            return res.redirect('/adminPage');
      }
      else{
          res.sendfile('public/admin.html');
      }
  
})

});  
}) */


app.get('/adminPage' ,urlencodedParser , (req , res)=>{
    console.log("hi")
    sess = req.session;
    if(sess.InstituteName){
        res.render('adminPage' , {msg : sess.InstituteName});
    }
    else{
        return res.redirect('/');
    }
})

app.get('/welcome' , (req , res)=>{
    sess = req.session;
    if(sess.email){
      var MongoClient = require('mongodb').MongoClient;
      var url = "mongodb://localhost:27017/";

      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("AlumDB");
      dbo.collection("Users").findOne({email : sess.email} , (err , result)=>{
      res.render('welcome' , {Name : result.Name , email : result.email , college : result.college , course : result.course , enrollment : result.enrollment});
      })
    })
  }
  else{
      return res.redirect('/')
 }
  })
   // return res.redirect('public/welcome.html')


app.post('/insert' , (req , res)=>{
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("AlumDB");
  var myobj = { Name: req.body.nameSignup , email: req.body.emailSignup , password : req.body.passwordSignup , college : req.body.college_name, course : req.body.course_type , enrollment : req.body.enrollmentSignup,  flag : 0};
  dbo.collection("Users").insertOne(myobj, function(err, result) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
 res.sendfile('public/requestSend.html');
})

/*
app.get('/admin' , (req , res)=>{
    res.sendfile('admin.html');
})

app.post('/adminVerify' , (req , res)=>{
    var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("AlumDB");
  dbo.collection("Institutions").findOne({}, function(err, result) {
    if (err) throw err;
    if(result.Password == req.body.Password){
        console.log(result);
        res.sendfile('adminPage.html');
    }
    else{
        res.sendfile('admin.html');
    }
    
    db.close();
  });
});
})
*/
app.listen(3010 , ()=>{
    console.log('hi your server started on 3010')
})