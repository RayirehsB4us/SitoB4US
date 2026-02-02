const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes with clean URLs
app.get('/', (req, res) => {
  res.render('home', { title: 'B4US srl | Simplify IT' });
});

app.get('/home', (req, res) => {
  res.render('home', { title: 'B4US srl | Simplify IT' });
});

app.get('/chi-siamo', (req, res) => {
  res.render('chi-siamo', { title: 'Chi Siamo - B4US Simplify IT' });
});

app.get('/servizi', (req, res) => {
  res.render('servizi', { title: 'Servizi | B4US - Simplify IT' });
});

app.get('/struttura', (req, res) => {
  res.render('struttura', { title: 'Organizzazione - B4US srl | Simplify IT' });
});

app.get('/carriere', (req, res) => {
  res.render('carriere', { title: 'Lavora Con Noi - B4US Team' });
});

app.get('/contatti', (req, res) => {
  res.render('contatti', { title: 'Contatti - B4US Simplify IT' });
});

app.get('/blog', (req, res) => {
  res.render('blog', { title: 'B4US Tech Blog | IT News & Insights' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'B4US Portal - Accedi' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
