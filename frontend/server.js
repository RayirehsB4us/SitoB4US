require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337/api';

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to fetch from Strapi with error handling
async function fetchFromStrapi(endpoint, fallbackData = null) {
  try {
    const response = await axios.get(`${STRAPI_API_URL}${endpoint}?populate=*`);
    return response.data;
  } catch (error) {
    console.warn(`Strapi fetch error for ${endpoint}:`, error.message);
    return fallbackData;
  }
}

// Routes with clean URLs
app.get('/', async (req, res) => {
  try {
    const homeData = await fetchFromStrapi('/home');
    const servizi = await fetchFromStrapi('/servizi');
    res.render('home', { 
      title: 'B4US srl | Simplify IT',
      home: homeData?.data?.attributes || {},
      servizi: servizi?.data?.map(s => s.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering home:', error);
    res.render('home', { title: 'B4US srl | Simplify IT', home: {}, servizi: [] });
  }
});

app.get('/home', async (req, res) => {
  try {
    const homeData = await fetchFromStrapi('/home');
    const servizi = await fetchFromStrapi('/servizi');
    res.render('home', { 
      title: 'B4US srl | Simplify IT',
      home: homeData?.data?.attributes || {},
      servizi: servizi?.data?.map(s => s.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering home:', error);
    res.render('home', { title: 'B4US srl | Simplify IT', home: {}, servizi: [] });
  }
});

app.get('/chi-siamo', async (req, res) => {
  try {
    const teamMembers = await fetchFromStrapi('/team-members');
    res.render('chi-siamo', { 
      title: 'Chi Siamo - B4US Simplify IT',
      teamMembers: teamMembers?.data?.map(t => t.attributes) || [],
      strapiUrl: STRAPI_URL
    });
  } catch (error) {
    console.error('Error rendering chi-siamo:', error);
    res.render('chi-siamo', { title: 'Chi Siamo - B4US Simplify IT', teamMembers: [], strapiUrl: STRAPI_URL });
  }
});

app.get('/servizi', async (req, res) => {
  try {
    const servizi = await fetchFromStrapi('/servizi');
    res.render('servizi', { 
      title: 'Servizi | B4US - Simplify IT',
      servizi: servizi?.data?.map(s => s.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering servizi:', error);
    res.render('servizi', { title: 'Servizi | B4US - Simplify IT', servizi: [] });
  }
});

app.get('/struttura', (req, res) => {
  res.render('struttura', { title: 'Organizzazione - B4US srl | Simplify IT' });
});

app.get('/carriere', async (req, res) => {
  try {
    const jobPositions = await fetchFromStrapi('/job-positions');
    res.render('carriere', { 
      title: 'Lavora Con Noi - B4US Team',
      jobPositions: jobPositions?.data?.map(j => j.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering carriere:', error);
    res.render('carriere', { title: 'Lavora Con Noi - B4US Team', jobPositions: [] });
  }
});

app.get('/contatti', (req, res) => {
  res.render('contatti', { title: 'Contatti - B4US Simplify IT' });
});

app.get('/blog', async (req, res) => {
  try {
    const blogPosts = await fetchFromStrapi('/blog-posts');
    res.render('blog', { 
      title: 'B4US Tech Blog | IT News & Insights',
      blogPosts: blogPosts?.data?.map(b => b.attributes) || [],
      strapiUrl: STRAPI_URL
    });
  } catch (error) {
    console.error('Error rendering blog:', error);
    res.render('blog', { title: 'B4US Tech Blog | IT News & Insights', blogPosts: [], strapiUrl: STRAPI_URL });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'B4US Portal - Accedi' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
