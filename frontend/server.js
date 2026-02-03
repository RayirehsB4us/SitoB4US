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

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/storia', async (req, res) => {
  try {
    const storia = await fetchFromStrapi('/storia-b4-uses');
    // Ordina per anno decrescente (più recente prima)
    const storiaOrdinata = storia?.data?.map(s => s.attributes).sort((a, b) => a.Anno - b.Anno) || [];
    res.render('storia', { 
      title: 'La Nostra Storia - B4US srl | Simplify IT',
      storia: storiaOrdinata,
      strapiUrl: STRAPI_URL
    });
  } catch (error) {
    console.error('Error rendering storia:', error);
    res.render('storia', { title: 'La Nostra Storia - B4US srl | Simplify IT', storia: [], strapiUrl: STRAPI_URL });
  }
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

app.get('/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    // Fetch articolo per slug
    const response = await axios.get(`${STRAPI_API_URL}/blog-posts?filters[slug][$eq]=${slug}&populate=*`);
    const post = response.data?.data?.[0]?.attributes || null;
    
    // Fetch altri articoli per la sezione "correlati" (escludendo l'attuale)
    const allPosts = await fetchFromStrapi('/blog-posts');
    const relatedPosts = allPosts?.data
      ?.map(b => b.attributes)
      .filter(p => p.slug !== slug) || [];
    
    res.render('blog-post', { 
      title: post ? `${post.titolo} | B4US Blog` : 'Articolo non trovato | B4US Blog',
      post: post,
      relatedPosts: relatedPosts,
      strapiUrl: STRAPI_URL
    });
  } catch (error) {
    console.error('Error rendering blog post:', error);
    res.render('blog-post', { 
      title: 'Articolo non trovato | B4US Blog', 
      post: null, 
      relatedPosts: [],
      strapiUrl: STRAPI_URL 
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'B4US Portal - Accedi' });
});

// Strapi redirect page
app.get('/strapi-redirect', (req, res) => {
  res.render('strapi-redirect', { title: 'Reindirizzamento...' });
});

// Login API endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e password sono richiesti' 
      });
    }

    console.log('Attempting login to:', `${STRAPI_URL}/admin/login`);
    console.log('With email:', identifier);

    // Authenticate with Strapi admin API
    const response = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: identifier,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Login response status:', response.status);

    if (response.data && response.data.data) {
      // Login successful
      console.log('Login successful for:', identifier);
      return res.json({
        success: true,
        message: 'Login effettuato con successo',
        adminUrl: STRAPI_URL,
        token: response.data.data.token
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message || 
                        'Email o password non corretti. Assicurati di usare l\'email dell\'admin.';
    
    return res.status(error.response?.status || 401).json({
      success: false,
      message: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
