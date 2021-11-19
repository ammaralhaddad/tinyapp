const cookieSession = require('cookie-session')
const express = require("express");
const getUserByEmail = require('./helpers');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080;

app.set("view engine", "ejs")


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

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)// to hash the password
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)//to hash the password
  }
}



function urlsForUser(userId, urls) {
  const matchedurls = {};
  for (let url in urls) {

    if (urls[url].userID === userId) {

      matchedurls[url] = urls[url]

    }

  }
  return matchedurls
}







function generateRandomString() {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (var i = 0; i < 6; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

}))


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params
  const validShortURL = urlDatabase[shortURL];
  if (!validShortURL) {
    return res.status(404).send("url not found")
  }

  const longURL = validShortURL.longURL;
  if (!longURL) {
    return res.status(404).send("url not found")
  }

  return res.redirect("http://" + longURL);// basic permission feature
});


app.get("/register", (req, res) => {
  const userId = req.session["user_id"]
  if (userId) res.redirect('/urls')
  const templateVars = {
    user: null
  }
  res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  const templateVar = {
    user: ""
  }
  res.render("login", templateVar)
});


app.get("/urls", (req, res) => {
  const userId = req.session["user_id"]
  const email = users[userId] ? users[userId].email : ""
  const urls = urlsForUser(userId, urlDatabase)
  const templateVars = { urls: urls, user: email };// username  cookeie  
  console.log("templatevars", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"]
  if (!userId) res.redirect('/login')
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"]
  if (!userId) {
    const templateVars = { user: null, message: "you are not login " };
    res.render("unauthorized", templateVars)
    return;
  }

  const shortURL = req.params.shortURL;

  if (userId !== urlDatabase[shortURL].userID) {
    const templateVars = { user: null, message: "you donot own the url" };
    res.render("unauthorized", templateVars)
    return;
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL, user: users[userId].email };

  res.render("urls_show", templateVars);
});











app.post("/urls", (req, res) => {
  const userId = req.session["user_id"]
  if (!userId) {
    const templateVars = { user: null };
    res.render("unauthorized", templateVars)
    return;
  }
  const longURL = req.body.longURL
  const shortURL = generateRandomString()

  const email = req.body.email
  const user = getUserByEmail(email, users)

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId
  }
  res.redirect(`/urls/${shortURL}`);
});



app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"]// req.session
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL].userID === userId) {
    delete urlDatabase[shortURL]
    res.redirect("/urls")
  }


})

app.post("/urls/:id", (req, res) => {
  console.log("post")
  const shortURL = req.params.id
  const newLongUrl = req.body.NewURL
  const userId = req.session["user_id"]// cookie session
  if (urlDatabase[shortURL].userID === userId) {
    urlDatabase[shortURL] = {
      longURL: newLongUrl,
      userID: userId //cookoe session

    }

  }

  res.redirect("/urls")
})
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password// ass it new 
  const user = getUserByEmail(email, users)
  if (!user || !bcrypt.compareSync(password, user.password)) {// need to work on itlater 
    return res.status(404).send("user email not in the database")

  }
  req.session.user_id = user.id;
  res.redirect("/urls")
})
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})



app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // new code to fix error 
  if (!email || !password) {
    res.statusCode = 400;
    res.send('Email or password cant be empty');
    return;
  }


  if (getUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send('This email has already been used');
    return;
  }

  const userId = generateRandomString()
  const newUser = {
    id: userId,
    email: req.body.email,
    password: bcrypt.hashSync(password, salt)

  }
  req.session.user_id = userId;
  users[userId] = newUser
  console.log(users);
  res.redirect("/urls")


})





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});