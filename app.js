var express = require ('express');
var expressSession = require('express-session');
var app = express();
var mysql = require("mysql");
var http = require('http');
var url = require('url');
var fs = require("fs");
var qs = require("querystring");
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

var con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'email-proj'
});

con.connect(function(err) {
    if (err) {
        res.write("nope");
        console.log(err);
    }
    console.log("connected");
});

var server = http.createServer(function(req, res) {res.writeHead(200, {'Content-Type': 'text/plain'})});
app.set("view engine", "ejs");

app.get("/", function(req,res){
    res.render("home.ejs");
    
});

app.use("/login", function(req, res, next){
    if (req.session.userId===undefined) {
        res.render("login.ejs");
    } else {
        next();
    }
});

app.get("/inbox", function(req,res) {
    res.render("inbox.ejs", {'Name': req.session.name, 'emails':req.session.emailData, 'emailAd':req.session.email});
});

app.post("/inbox", function(req, res) {
    var emailLog = req.body.email;
    var passwLog = req.body.password;

    var loginQuery = `SELECT  * FROM users WHERE email = '${emailLog}'`;
    con.query(loginQuery, function(err, loginData) {
        if (err) {
            console.log(err);
        } else {
            loginData.forEach(function(logData) {
            if (logData.password===passwLog) {
                req.session.userId = logData.id;
                req.session.email = logData.email;
                req.session.name = logData.name;

                var inboxQuery = `SELECT * FROM emails WHERE recipid = ${req.session.userId}`;
                con.query(inboxQuery, function(err, inboxData) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.session.emailData = inboxData;
                        res.render("inbox.ejs", {'Name': req.session.name, 'emails':req.session.emailData, 'emailAd':req.session.email});
                    }
                })
            } else {
                res.render("login.ejs");
            }});
    }});
});

app.get("/compose/:email", function(req, res) {
    var senderEmail = req.params.email;
    res.render("compose.ejs",{"sender":senderEmail});
})

app.post("/inbox/sent", function(req,res) {
    var recipEmail = req.body.recipient;
    var senderEmail = req.body.sender;
    var emailSubject = req.body.subject;
    var emailContent = req.body.content;
    var recipId;
    var sendId;

    var findRecipQuery = `SELECT * FROM users WHERE email = '${recipEmail}'`;
    con.query(findRecipQuery, function(err, recipientId) {
        recipientId.forEach(function(recipData) {
            recipId = recipData.id;
        })
        var findSendQuery = `SELECT * FROM users WHERE email = '${senderEmail}'`;
        con.query(findSendQuery, function(err, senderId){
            senderId.forEach(function(sendData) {
                sendId = sendData.id;
            })
            var sendQuery = `INSERT INTO emails (recipid, recipient, sendid, sender, subject, content)VALUES (${recipId}, '${recipEmail}', ${sendId}, '${senderEmail}', '${emailSubject}', '${emailContent}')`
            con.query(sendQuery, function(err, sentData){
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/inbox");
                }
            })
        })
    })
})

app.post("/inbox/delete", function(req, res) {
    var deleteQuery = `DELETE FROM emails WHERE id = `
})

app.get("/inbox/:E", function(req, res) {
    var emailId = parseInt(req.params.E);
    var showQuery = `SELECT * FROM emails WHERE id = ${emailId}`;
    con.query(showQuery, function(err, showData) {
        if (err) {
            console.log(err);
        } else {
            showData.forEach(function(emailData) {
                console.log("content");
                res.render("email.ejs", {'sender':emailData.sender, 'recipient':emailData.recipient, 'subject':emailData.subject, 'content':emailData.content});
            })
        }
    })
});

app.get("/compose", function(req, res) {
    res.render("compose.ejs");
});

app.get("/signup", function(req, res) {
    res.render("signup.ejs");
});

app.post("/login", function(req, res) {
    var nameSu = req.body.name;
    var emailSu = req.body.email;
    var passwSu = req.body.password;

    var signupQuery = `INSERT INTO users VALUES (null, '${nameSu}', '${emailSu}', '${passwSu}')`;
    con.query(signupQuery, function(err, signupData) {
        if (err) {
            console.log(err);
        } else {
            res.render("login.ejs");
        };
    })
});

app.get("/logout", function(req,res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });

});

app.post

app.listen(8000);
