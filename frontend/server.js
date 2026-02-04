require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337/api';

// Configurazione Multer per l'upload dei file
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato file non supportato. Usa PDF, DOC o DOCX.'));
    }
  }
});

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
      title: 'B4US | Simplify IT',
      home: homeData?.data?.attributes || {},
      servizi: servizi?.data?.map(s => s.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering home:', error);
    res.render('home', { title: 'B4US | Simplify IT', home: {}, servizi: [] });
  }
});

app.get('/home', async (req, res) => {
  try {
    const homeData = await fetchFromStrapi('/home');
    const servizi = await fetchFromStrapi('/servizi');
    res.render('home', { 
      title: 'B4US | Simplify IT',
      home: homeData?.data?.attributes || {},
      servizi: servizi?.data?.map(s => s.attributes) || []
    });
  } catch (error) {
    console.error('Error rendering home:', error);
    res.render('home', { title: 'B4US | Simplify IT', home: {}, servizi: [] });
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

app.get('/prodotti', (req, res) => {
  res.render('prodotti', { title: 'Prodotti | B4US - Simplify IT' });
});

app.get('/open4us', (req, res) => {
  res.render('open4us', { title: 'Open4US - Accesso Smart | B4US' });
});

app.get('/carfleet', (req, res) => {
  res.render('carfleet', { title: 'CarFleet - Gestione Flotta Intelligente | B4US' });
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
  res.render('struttura', { title: 'Organizzazione - B4US | Simplify IT' });
});

app.get('/storia', async (req, res) => {
  try {
    const storia = await fetchFromStrapi('/storia-b4-uses');
    // Ordina per anno decrescente (più recente prima)
    const storiaOrdinata = storia?.data?.map(s => s.attributes).sort((b, a) => b.Anno - a.Anno) || [];
    res.render('storia', { 
      title: 'La Nostra Storia - B4US | Simplify IT',
      storia: storiaOrdinata,
      strapiUrl: STRAPI_URL
    });
  } catch (error) {
    console.error('Error rendering storia:', error);
    res.render('storia', { title: 'La Nostra Storia - B4US | Simplify IT', storia: [], strapiUrl: STRAPI_URL });
  }
});

app.get('/carriere', async (req, res) => {
  try {
    const jobPositions = await fetchFromStrapi('/job-positions');
    res.render('carriere', { 
      title: 'Lavora Con Noi - B4US Team',
      jobPositions: jobPositions?.data?.map(j => ({ id: j.id, ...j.attributes })) || []
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

// Demo request endpoint
app.post('/api/demo-request', async (req, res) => {
  try {
    const { nome, cognome, azienda, email, softwareProduct } = req.body;

    // Validazione
    if (!nome || !cognome || !azienda || !email || !softwareProduct) {
      return res.status(400).json({
        success: false,
        message: 'Tutti i campi sono obbligatori'
      });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email non valida'
      });
    }

    console.log('Creating demo request for:', { nome, cognome, azienda, email, softwareProduct });

    // Step 1: Trova o crea il software product
    let softwareProductId = null;
    try {
      // Cerca il prodotto per nome
      const productResponse = await axios.get(
        `${STRAPI_API_URL}/software-products?filters[name][$eq]=${softwareProduct}`
      );

      if (productResponse.data?.data?.length > 0) {
        softwareProductId = productResponse.data.data[0].id;
        console.log('Found existing software product:', softwareProductId);
      } else {
        // Se non esiste, crealo
        console.log('Creating new software product:', softwareProduct);
        const createProductResponse = await axios.post(
          `${STRAPI_API_URL}/software-products`,
          {
            data: {
              name: softwareProduct,
              publishedAt: new Date().toISOString()
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        softwareProductId = createProductResponse.data.data.id;
        console.log('Created software product:', softwareProductId);
      }
    } catch (error) {
      console.error('Error handling software product:', error.message);
      // Continua senza il product se c'è un errore
    }

    // Step 2: Crea la demo request
    const demoRequestData = {
      data: {
        nome: nome,
        cognome: cognome,
        azienda: azienda,
        email: email,
        publishedAt: new Date().toISOString()
      }
    };

    // Aggiungi software_product solo se trovato/creato
    if (softwareProductId) {
      demoRequestData.data.software_product = softwareProductId;
    }

    console.log('Creating demo request with data:', JSON.stringify(demoRequestData, null, 2));

    const demoRequestResponse = await axios.post(
      `${STRAPI_API_URL}/demo-requests`,
      demoRequestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Demo request created successfully:', demoRequestResponse.data.data.id);

    res.json({
      success: true,
      message: 'Richiesta demo inviata con successo! Ti contatteremo presto.',
      data: demoRequestResponse.data
    });

  } catch (error) {
    console.error('Demo request error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Errore durante l\'invio della richiesta demo';

    res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Job application endpoint
app.post('/api/job-application', upload.single('cv'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    const { nome, cognome, dataNascita, email, telefono, jobPosition } = req.body;
    const cvFile = req.file;

    // Validazione
    if (!nome || !cognome || !dataNascita || !email || !telefono || !jobPosition) {
      return res.status(400).json({
        success: false,
        message: 'Tutti i campi sono obbligatori'
      });
    }

    if (!cvFile) {
      return res.status(400).json({
        success: false,
        message: 'Il CV è obbligatorio'
      });
    }

    uploadedFilePath = cvFile.path;

    // Step 1: Upload del CV a Strapi
    const formData = new FormData();
    formData.append('files', fs.createReadStream(cvFile.path), cvFile.originalname);

    console.log('Uploading CV to Strapi...');
    const uploadResponse = await axios.post(`${STRAPI_API_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const uploadedCV = uploadResponse.data[0];
    console.log('CV uploaded successfully:', uploadedCV.id);

    // Step 2: Determina il job_position ID
    let jobPositionId = null;
    if (jobPosition !== 'autocandidatura') {
      jobPositionId = parseInt(jobPosition);
    }

    // Step 3: Crea la job-request
    const jobRequestData = {
      data: {
        Nome: nome,
        Cognome: cognome,
        AnnoNascita: dataNascita,
        email: email,
        Telefono: telefono,
        cv: [uploadedCV.id],
        publishedAt: new Date().toISOString()
      }
    };

    // Aggiungi job_position solo se non è autocandidatura
    if (jobPositionId) {
      jobRequestData.data.job_position = jobPositionId;
    }

    console.log('Creating job request with data:', JSON.stringify(jobRequestData, null, 2));

    const jobRequestResponse = await axios.post(
      `${STRAPI_API_URL}/job-requests`,
      jobRequestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Job request created successfully:', jobRequestResponse.data.data.id);

    // Pulisci il file temporaneo
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      message: 'Candidatura inviata con successo! Ti contatteremo presto.',
      data: jobRequestResponse.data
    });

  } catch (error) {
    console.error('Job application error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Pulisci il file temporaneo in caso di errore
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Errore durante l\'invio della candidatura';

    res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
