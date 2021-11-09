
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let  result = '';
  for ( var i = 0; i < 6; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  console.log("prams",req.body)
  const longURL = urlDatabase[req.params.shortURL]; 
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL
    console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(`urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
//http://localhost:8080/urls/b2xVn2/delete
app.post("/urls/:shortURL/delete",(req, res)=>{
const shortURL = req.params.shortURL
delete urlDatabase[shortURL]
res.redirect("/urls")
})

app.post("/urls/:id",(req, res)=>{
  console.log("post")
  const shortURL = req.params.id
  const newLongUrl = req.body.NewURL
  urlDatabase[shortURL] = newLongUrl
  res.redirect("/urls")
  })


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(shortURL,longURL);
  // res.redirect(longURL)

  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});