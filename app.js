const express = require('express');
const path = require('path');
const session = require('express-session')
const multer = require('multer')
const fs = require('fs')
const port = process.env.PORT || 3000
const app = module.exports = express();
// config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'views')))
// middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, req.session.username)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
const upload = multer({storage: storage})
app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
  }));
// Dummy Database
users = [{username:'a', password:'b'}]
// Get
app.get('/', function(req, res){
    res.render('index.ejs');
});
app.get('/login', (req, res)=>{
    res.render('login.ejs')
})
app.get('/signup', (req, res)=>{
    res.render('signup.ejs')
})
app.get('/user', (req, res) =>{
    res.render('rep.ejs', {username: req.session.username, filelist: fs.readdirSync(req.session.username)})
})
// Post
app.post('/user/view', (req, res) =>{
    // console.log(req.body)
    res.sendFile(path.join(__dirname, path.join(req.session.username, req.body.file)))
})
app.post('/user/download', (req, res)=>{
    res.download(path.join(req.session.username,req.body.file))
})
app.post('/user/delete', (req, res)=>{
    fs.unlinkSync(path.join(req.session.username,req.body.file))
    res.redirect('/user')
})
app.post('/logout', (req, res)=>{
    req.session.destroy()
    res.redirect('/')
})
app.post('/login', (req, res) =>{
    res.redirect('/login')
})
app.post('/signup', (req, res) => {
    res.redirect('/signup')
})
app.post('/signupconfirm', (req, res) =>{
    username = req.body.username
    password = req.body.password
    if(username != '' && password != '' && users.find(ele => ele.username == username) == undefined){
    users.push({username, password})
    console.log(`New User Signup`) 
    console.log(`${username}: ${password}`)
    if (!fs.existsSync(username)){
        fs.mkdirSync(username);
    }
    res.send('Signup Successful <br/> <a href= "/">Home</a>')}
    else res.send('Failure. Please enter proper username and password <br/> <a href= "/signup">Try Again</a>')
})
app.post('/loginconfirm', (req, res) =>{
    username = req.body.username
    password = req.body.password
    obj = users.find(ele => ele.username == username)
    if( obj == undefined) res.send('No such username registered <br/> <a href= "/login">Try Again</a><br/> <a href= "/signup">Sign Up?</a>')
    else if(obj.password != password) res.send('Wrong Password <br/> <a href= "/login">Try Again</a>')
    else {
        req.session.username = username
        res.redirect('/user')
    }
})
app.post('/uploadProfilePicture', upload.single('fileupload'),(req, res) =>{
    res.redirect('/user')
})
app.listen(port, function() {
    console.log(`Server running on  localhost:${port}`)
});