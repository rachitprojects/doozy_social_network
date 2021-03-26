
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require("express")
const bcrypt = require("bcrypt")
const app = express()
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://doozypro:hackoonamatata@cluster0.lclqc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const initializePassport = require('./passport-config')
const users = []

const getEmailUser = (email) => {

    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("doozyData");
        var query = { "email": email };
        var ans = dbo.collection("user").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result)
          this.data = result[0];
        //   console.log(data.username)
        });
        db.close()
        return ans[0]
        // console.log(data)
        // return data
      }); 

}

const getIdUser = (id) => {

    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        var dbo = db.db("doozyData");
        var query = { "_id": id };
        var data ;
        var ans = dbo.collection("user").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log("not here")
          console.log(result)
          data = result[0];
          db.close();
        });

        return ans[0]
      }); 

}


initializePassport(passport, getEmailUser, getIdUser)
    // (email) => {
    //     q = users.find(user => user.email == email)
    //     console.log(q)
    //     return q
    // },
    // id => {
    //     p = users.find(user => user.id === id)
    //     console.log(p)
    //     return p
    // }


app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
// app.use(session({
//     secret: process
// }))
app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
    res.render("index.ejs", {"name": req.user.name })
})

app.get("/login", (req, res) => {
    res.render("login.ejs", )
})

app.get("/register", (req, res) => {
    res.render("register.ejs")
})

app.post("/register", async (req, res) => {
    try{
        console.log(req.body.password)
        const hashpass = await bcrypt.hash(req.body.password, 10)
        console.log(hashpass)
        MongoClient.connect(uri, function(err, db){
            if(err) throw err ;
            var dbo = db.db("doozyData")
            var userObj = {
                username: req.body.name,
                password: hashpass,
                email: req.body.email,
                time: Date.now.toString(),
                userClubId: "[]",
                points:"0"
            }

            dbo.collection("user").insertOne(userObj, function(err, res){
                if(err) throw err
                console.log("1 document uploaded")
                db.close()
            })

        })
        res.redirect('/login')
    } catch(e) {
        console.log(e)
        res.redirect('/register')
    }
    console.log(users)
})

app.post("/login", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.listen(3000)

