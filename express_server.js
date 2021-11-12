
const express = require("express");
const  help  = require('./helpers');
const bcrypt = require('bcryptjs');
const  salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
app.set("view engine", "ejs")

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  },
  
};

function urlsForUser(userId, urls){
  const matchedurls = {};
  for (let url in urls){
  
  if(urls[url].userID === userId){
  
    matchedurls[url] = urls[url]
  
  }
  
  }
   return matchedurls
  }



let users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password:bcrypt.hashSync("purple-monkey-dinosaur",salt)// to hash the password
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password:bcrypt.hashSync("dishwasher-funk",salt)//to hash the password
  }
}





function generateRandomString() {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let  result = '';
  for ( var i = 0; i < 6; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  console.log("prams",req.body)
  // const longURL = urlDatabase[req.params.shortURL].longURL;// it will help to access the shorturl 
  // console.log("longurl",longURL)
  for (let key in urlDatabase){
   if(key === req.params.shortURL){
    const longURL = urlDatabase[req.params.shortURL].longURL; 
   return res.redirect(longURL);// basic permission feature
   }
  }
    return res.status(404).send("user name not defined")
 
  
  // any time i need to access a variable should use req.params
}); 




app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  // urlDatabase[shortURL] = longURL  
    urlDatabase[shortURL] = {// NEW DATABASE
    longURL:longURL,
    userID:req.cookies.user_id


    }
    console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:shortURL/delete",(req, res)=>{
const shortURL = req.params.shortURL
if(urlDatabase[shortURL].userID === req.cookies.user_id){
  delete urlDatabase[shortURL]
  res.redirect("/urls")
}


})

app.post("/urls/:id",(req, res)=>{
  console.log("post")
  const shortURL = req.params.id
  const newLongUrl = req.body.NewURL
  if(urlDatabase[shortURL].userID === req.cookies.user_id){

    urlDatabase[shortURL] = {// NEW DATABASE
      longURL:newLongUrl,
      userID:req.cookies.user_id
  
    }

  }
  
  res.redirect("/urls")
  })
app.post("/login",(req,res)=> {
  const email = req.body.email
  const password= req.body.password// ass it new 
  const user = getUserByEmail(email)// used to be finduserUserby email
  if(!user || user.password !== password)  {// need to work on it later 
    return res.status(404).send("user email not in the database")
    // res.redirect("/urls")
  }
  res.cookie("user_id",user.id)
  res.redirect("/urls") 
})

app.get("/logout",(req,res)=> {
res.clearCookie("user_id")
  res.redirect("/urls")
})

// get the register page 
app.get("/register",(req,res)=>{
  // if user logged in redirect to /urls
  if(req.cookies.user_id) res.redirect('/urls')// check later 
  res.render("register")
})

app.post("/register",(req,res)=>{
  const userId = generateRandomString()
  const userName = req.body.email
  const password = req.body.password
  const newUser = {
      id: userId,
      email: userName,
      password: password
   
  }
  res.cookie("user_id",userId)
  users[userId] = newUser
  console.log(users);
  res.redirect("/urls")

  
})
// login page 
  app.get("/login", (req, res) => {
    const templateVar = {
      user: ""
    }
    res.render("login", templateVar)
  });

   
app.get("/urls", (req, res) => {
  console.log("req.cookies",req.cookies)
  const userId = req.cookies.user_id
  const email = users[userId]? users[userId].email : ""
  const urls = urlsForUser(userId,urlDatabase)
  const templateVars = { urls: urls,user:email };// username  cookeie
  //const templateVars = { urls: urlDatabase,user:users[userId] };// username  cookeie 
  console.log("templatevars",templateVars)
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  console.log("USERNAME",req.cookies.username)
  const userId = req.cookies.user_id
  if(!userId) res.redirect('/logi')
  const templateVars = { urls: urlDatabase,user:users[userId]};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const username = req.cookies.user_id
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(shortURL,longURL,username);
  // res.redirect(longURL)
  const userId = username
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[userId].email};
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});