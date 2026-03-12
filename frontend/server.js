require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_URL =
  process.env.STRAPI_API_URL || "http://localhost:1337/api";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";

// ─── SharePoint Configuration ────────────────────────────────────────
const SHAREPOINT_TENANT_ID = process.env.SHAREPOINT_TENANT_ID || "";
const SHAREPOINT_CLIENT_ID = process.env.SHAREPOINT_CLIENT_ID || "";
const SHAREPOINT_CLIENT_SECRET = process.env.SHAREPOINT_CLIENT_SECRET || "";
const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID || "";
const SHAREPOINT_DRIVE_ID = process.env.SHAREPOINT_DRIVE_ID || "";
const SHAREPOINT_FOLDER = process.env.SHAREPOINT_FOLDER || "CV-Candidature";

/**
 * Ottiene un access token da Azure AD tramite Client Credentials flow.
 * Il token viene usato per autenticarsi con Microsoft Graph API.
 */
async function getSharePointAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("client_id", SHAREPOINT_CLIENT_ID);
  params.append("client_secret", SHAREPOINT_CLIENT_SECRET);
  params.append("scope", "https://graph.microsoft.com/.default");
  params.append("grant_type", "client_credentials");

  const response = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data.access_token;
}

/**
 * Carica un file su SharePoint tramite Microsoft Graph API.
 * @param {string} filePath - Percorso locale del file temporaneo
 * @param {string} fileName - Nome originale del file (es: "CV_Mario_Rossi.pdf")
 * @returns {object} - { webUrl, downloadUrl, fileName } del file caricato
 */
async function uploadToSharePoint(filePath, fileName) {
  const accessToken = await getSharePointAccessToken();

  // Sanitizza il nome file per evitare conflitti (aggiungi timestamp)
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadName = `${timestamp}_${safeName}`;

  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;

  // Per file <= 4MB: upload diretto con PUT
  // Per file > 4MB: serve upload session (non dovrebbe servire per CV)
  if (fileSize > 4 * 1024 * 1024) {
    throw new Error(
      "File troppo grande per upload diretto. Massimo 4MB per SharePoint upload.",
    );
  }

  const uploadUrl =
    `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}` +
    `/drives/${SHAREPOINT_DRIVE_ID}` +
    `/root:/${SHAREPOINT_FOLDER}/${uploadName}:/content`;

  const response = await axios.put(uploadUrl, fileBuffer, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
    },
    maxContentLength: 10 * 1024 * 1024,
    maxBodyLength: 10 * 1024 * 1024,
  });

  return {
    webUrl: response.data.webUrl,
    downloadUrl:
      response.data["@microsoft.graph.downloadUrl"] || response.data.webUrl,
    fileName: uploadName,
    sharePointId: response.data.id,
  };
}
// Lista IP/prefissi consentiti per login:
// - IP singoli: 4.232.71.155
// - Intere reti (prefisso): 192.168.178.*  (tutti i 192.168.178.x)
// In .env usa la virgola, es.:
// ALLOWED_LOGIN_IP=4.232.71.155,192.168.178.*
const ALLOWED_LOGIN_IPS = (process.env.ALLOWED_LOGIN_IP || "4.232.71.155")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const MAINTENANCE_MODE =
  process.env.MAINTENANCE_MODE === "1" ||
  process.env.MAINTENANCE_MODE === "true";
console.log(
  "[BOOT-ENV]",
  "NODE_ENV raw =",
  JSON.stringify(process.env.NODE_ENV),
  "| IS_PRODUCTION =",
  IS_PRODUCTION,
  "| MAINTENANCE_MODE =",
  MAINTENANCE_MODE,
  "| ALLOWED_LOGIN_IPS =",
  ALLOWED_LOGIN_IPS,
);
// Header di autenticazione per tutte le richieste a Strapi
const strapiAuthHeaders = STRAPI_API_TOKEN
  ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  : {};

// Middleware per caricare il mega menu e renderlo disponibile in tutte le view
app.use(async (req, res, next) => {
  try {
    const response = await axios.get(
      `${STRAPI_API_URL}/mega-menu?populate[MegaMenu][populate][barElement][populate]=sottoMenu`,
      {
        headers: { ...strapiAuthHeaders },
      },
    );

    const rawItems =
      response.data?.data?.MegaMenu?.barElement && Array.isArray(response.data.data.MegaMenu.barElement)
        ? response.data.data.MegaMenu.barElement
        : [];

    const isVisible = (value) =>
      value === true || value === "true" || value === 1 || value === "1";

    // Filtra solo gli elementi visibili e normalizza i sotto-menu
    const topMenu = rawItems
      .filter((item) => item && isVisible(item.visible))
      .map((item) => {
        const sottoMenu = Array.isArray(item.sottoMenu)
          ? item.sottoMenu.filter((sub) => sub && isVisible(sub.visible))
          : [];
        return {
          ...item,
          sottoMenu,
        };
      });

    // Log sintetico per verificare i valori che arrivano da Strapi
    console.log(
      "[MEGA-MENU]",
      new Date().toISOString(),
      topMenu.map((item) => ({
        label: item.label,
        path: item.path,
        visible: item.visible,
        sottoMenu: (item.sottoMenu || []).map((sub) => ({
          label: sub.label,
          path: sub.path,
          visible: sub.visible,
        })),
      })),
    );

    res.locals.topMenu = topMenu;
  } catch (error) {
    console.warn("Strapi mega menu fetch error:", error.message);
    res.locals.topMenu = [];
  }

  next();
});

// Middleware per caricare il footer dinamico da Strapi
app.use(async (req, res, next) => {
  try {
    const response = await axios.get(
      `${STRAPI_API_URL}/footer?populate[Footer][populate][logo][fields][0]=url&populate[Footer][populate][logo][fields][1]=name&populate[Footer][populate][Colonna][populate]=link`,
      {
        headers: { ...strapiAuthHeaders },
      },
    );

    const rawFooter = response.data?.data?.Footer || null;

    if (!rawFooter) {
      res.locals.footer = null;
      return next();
    }

    const columns = Array.isArray(rawFooter.Colonna)
      ? rawFooter.Colonna.map((col) => ({
          ...col,
          link: Array.isArray(col.link) ? col.link : [],
        }))
      : [];

    const footer = {
      descrizione: rawFooter.Descrizione || "",
      subTitle: rawFooter.subTitle || "",
      logoUrl:
        rawFooter.logo && rawFooter.logo.url
          ? `${STRAPI_URL}${rawFooter.logo.url}`
          : "/images/logo.png",
      logoName: (rawFooter.logo && rawFooter.logo.name) || "Logo",
      columns,
    };

    console.log(
      "[FOOTER]",
      new Date().toISOString(),
      {
        descrizione: footer.descrizione,
        subTitle: footer.subTitle,
        columns: footer.columns.map((c) => ({
          title: c.Title,
          links: c.link.length,
        })),
      },
    );

    res.locals.footer = footer;
  } catch (error) {
    console.warn("Strapi footer fetch error:", error.message);
    res.locals.footer = null;
  }

  next();
});

// Configurazione Multer per l'upload dei file
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato file non supportato. Usa PDF, DOC o DOCX."));
    }
  },
});

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Trust proxy headers (required on Azure / reverse proxies to get real client IP)
app.set("trust proxy", true);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalizza IP: toglie porta se IPv4:porta (gestisce sia header con che senza porta)
function normalizeIpForCompare(ip) {
  if (!ip || typeof ip !== "string") return ip || "";
  let s = ip.trim();
  if (s.startsWith("::ffff:")) s = s.substring(7);
  if (s.includes("%")) s = s.split("%")[0];
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(s)) s = s.replace(/:(\d+)$/, "");
  return s;
}

// Middleware to compute client IP and decide if login button should be shown
app.use((req, res, next) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  const xRealIp = req.headers["x-real-ip"];
  const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare
  const socketIp = req.socket?.remoteAddress;

  // Senza reverse proxy: usare l'IP della connessione diretta (req.socket.remoteAddress)
  // Con reverse proxy: di solito x-forwarded-for o x-real-ip. Prima voce = client reale.
  let rawClientIp =
    (Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : typeof xForwardedFor === "string"
        ? xForwardedFor.split(",")[0].trim()
        : null) ||
    (typeof xRealIp === "string" ? xRealIp.trim() : null) ||
    (typeof cfConnectingIp === "string" ? cfConnectingIp.trim() : null) ||
    req.ip ||
    socketIp ||
    "";
  const clientIp = normalizeIpForCompare(rawClientIp);

  const isAllowedIp = ALLOWED_LOGIN_IPS.some((rule) => {
    const normRule = normalizeIpForCompare(rule);
    // Prefisso di rete, es. 192.168.178.* → match su 192.168.178.x
    if (rule.endsWith(".*")) {
      const prefix = normRule.slice(0, -1); // togli l'asterisco finale
      return clientIp.startsWith(prefix);
    }
    // IP singolo (confronto dopo normalizzazione: funziona con e senza porta)
    return clientIp === normRule;
  });

  // Rendi disponibili IP e flag anche alle route successive
  req.clientIp = clientIp;
  req.isAllowedLoginIp = isAllowedIp;

  if (IS_PRODUCTION) {
    res.locals.showLoginButton = isAllowedIp;
  } else {
    // In non-production environments, always show the login button to simplify testing
    res.locals.showLoginButton = true;
  }

  const ipSource = xForwardedFor
    ? "x-forwarded-for"
    : xRealIp
      ? "x-real-ip"
      : cfConnectingIp
        ? "cf-connecting-ip"
        : req.ip
          ? "req.ip"
          : socketIp
            ? "socket.remoteAddress"
            : "none";
  console.log(
    "[IP-LOG]",
    new Date().toISOString(),
    `${req.method} ${req.originalUrl}`,
    "| clientIp=",
    clientIp || "N/A",
    "| source=",
    ipSource,
    "| allowedIp=",
    isAllowedIp,
    "| showLoginButton=",
    res.locals.showLoginButton,
    "| NODE_ENV=",
    process.env.NODE_ENV || "undefined",
  );

  next();
});

// Base URL del sito (per sitemap e canonical)
const SITE_URL = process.env.SITE_URL || "https://www.b4us.it";

// robots.txt e sitemap.xml (route prima di static per essere sempre raggiungibili)
app.get("/robots.txt", (req, res) => {
  const base = SITE_URL.replace(/\/$/, "");
  const body = `# ${base}
User-agent: *
Allow: /

# Sitemap
Sitemap: ${base}/sitemap.xml
`;
  res.type("text/plain").send(body);
});

app.get("/sitemap.xml", (req, res) => {
  const base = SITE_URL.replace(/\/$/, "");
  const staticPages = [
    { path: "", changefreq: "weekly", priority: "1.0" },
    { path: "home", changefreq: "weekly", priority: "0.9" },
    { path: "chi-siamo", changefreq: "monthly", priority: "0.8" },
    { path: "prodotti", changefreq: "monthly", priority: "0.8" },
    { path: "open4us", changefreq: "monthly", priority: "0.8" },
    { path: "carfleet", changefreq: "monthly", priority: "0.8" },
    { path: "servizi", changefreq: "monthly", priority: "0.8" },
    { path: "struttura", changefreq: "monthly", priority: "0.7" },
    { path: "storia", changefreq: "monthly", priority: "0.7" },
    { path: "carriere", changefreq: "weekly", priority: "0.8" },
    { path: "contatti", changefreq: "monthly", priority: "0.8" },
    { path: "privacy-policy", changefreq: "yearly", priority: "0.3" },
  ];
  const urls = staticPages.map(({ path, changefreq, priority }) => {
    const loc = path ? `${base}/${path}` : base;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join("\n") +
    "\n</urlset>";
  res.type("application/xml").send(xml);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Pagina di manutenzione: se MAINTENANCE_MODE=1, tutte le richieste (tranne /health e API) vedono la pagina manutenzione
app.use((req, res, next) => {
  if (!MAINTENANCE_MODE) return next();
  if (req.path === "/health" || req.path.startsWith("/api/")) return next();
  res.status(503).render("manutenzione", {
    title: "Manutenzione in corso | B4US",
  });
});

// Helper function to fetch from Strapi with error handling
async function fetchFromStrapi(endpoint, fallbackData = null, deepPopulate = null) {
  try {
    var query = "populate=*";
    if (deepPopulate && deepPopulate.length > 0) {
      query = deepPopulate
        .map(function (c) {
          return "populate[" + c + "][populate]=*";
        })
        .join("&");
    }
    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await axios.get(
      `${STRAPI_API_URL}${endpoint}${separator}${query}`,
      {
        headers: { ...strapiAuthHeaders },
      },
    );
    return response.data;
  } catch (error) {
    console.warn(`Strapi fetch error for ${endpoint}:`, error.message);
    return fallbackData;
  }
}

// Routes with clean URLs
app.get("/", async (req, res) => {
  try {
    const homeData = await fetchFromStrapi("/home");
    const servizi = await fetchFromStrapi("/servizi");
    res.render("home", {
      title: "B4US | Simplify IT",
      home: homeData?.data || {},
      servizi: servizi?.data || [],
      home: homeData?.data || {},
      servizi: servizi?.data || [],
    });
  } catch (error) {
    console.error("Error rendering home:", error);
    res.render("home", { title: "B4US | Simplify IT", home: {}, servizi: [] });
  }
});

app.get("/home", async (req, res) => {
  try {
    const homeData = await fetchFromStrapi("/home");
    const servizi = await fetchFromStrapi("/servizi");
    res.render("home", {
      title: "B4US | Simplify IT",
      home: homeData?.data || {},
      servizi: servizi?.data || [],
      home: homeData?.data || {},
      servizi: servizi?.data || [],
    });
  } catch (error) {
    console.error("Error rendering home:", error);
    res.render("home", { title: "B4US | Simplify IT", home: {}, servizi: [] });
  }
});

app.get("/chi-siamo", async (req, res) => {
  try {
    const chiSiamoData = await fetchFromStrapi("/chi-siamo", null, ["ValueCards", "HeroImage"]);
    const teamMembers = await fetchFromStrapi("/team-members?sort=ordine:asc");
    res.render("chi-siamo", {
      title: "Chi Siamo - B4US Simplify IT",
      chiSiamoData: chiSiamoData?.data || {},
      teamMembers: teamMembers?.data || [],
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering chi-siamo:", error);
    res.render("chi-siamo", {
      title: "Chi Siamo - B4US Simplify IT",
      chiSiamoData: {},
      teamMembers: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/prodotti", async (req, res) => {
  try {
    var prodottiPage = await fetchFromStrapi("/prodotti");
    var prodottiItems = await fetchFromStrapi(
      "/prodotti-items",
      null,
      ['Features', 'ImmaginePrincipale', 'ImmagineSecondaria']
    );
    var prodottiList = (prodottiItems?.data || []);
    prodottiList.sort(function(a, b) { return (a.Ordine || 0) - (b.Ordine || 0); });
    res.render("prodotti", {
      title: "Prodotti | B4US - Simplify IT",
      prodottiData: prodottiPage?.data || {},
      prodotti: prodottiList,
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering prodotti:", error);
    res.render("prodotti", {
      title: "Prodotti | B4US - Simplify IT",
      prodottiData: {},
      prodotti: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/open4us", async (req, res) => {
  try {
    var open4usData = await fetchFromStrapi("/open4-us");
    res.render("open4us", {
      title: "Open4US - Accesso Smart | B4US",
      o4u: open4usData?.data || {},
      o4u: open4usData?.data || {},
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering open4us:", error);
    res.render("open4us", {
      title: "Open4US - Accesso Smart | B4US",
      o4u: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/carfleet", async (req, res) => {
  try {
    var carfleetData = await fetchFromStrapi("/car-fleet");
    res.render("carfleet", {
      title: "CarFleet - Gestione Flotta Intelligente | B4US",
      cf: carfleetData?.data || {},
      cf: carfleetData?.data || {},
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering carfleet:", error);
    res.render("carfleet", {
      title: "CarFleet - Gestione Flotta Intelligente | B4US",
      cf: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/servizi", async (req, res) => {
  try {
    const servizi = await fetchFromStrapi("/servizi");
    const serviceData = await fetchFromStrapi("/service");
    res.render("servizi", {
      title: "Servizi | B4US - Simplify IT",
      servizi: servizi?.data || [],
      serviziPage: serviceData?.data || {},
    });
  } catch (error) {
    console.error("Error rendering servizi:", error);
    res.render("servizi", {
      title: "Servizi | B4US - Simplify IT",
      servizi: [],
      serviziPage: {},
    });
  }
});

app.get("/struttura", async (req, res) => {
  try {
    const strutturaData = await fetchFromStrapi(
      "/organizzazione", null, ['HeroSection', 'techArea', 'knowledgeArea', 'CoverImage']
    );
    res.render("struttura", {
      title: "Organizzazione - B4US | Simplify IT",
      strutturaData: strutturaData?.data || {},
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering struttura:", error);
    res.render("struttura", {
      title: "Organizzazione - B4US | Simplify IT",
      strutturaData: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/storia", async (req, res) => {
  try {
    const storiaData = await fetchFromStrapi("/storia");
    const storiaEvents = await fetchFromStrapi("/storia-b4-uses");
    res.render("storia", {
      title: "La Nostra Storia - B4US | Simplify IT",
      storiaData: storiaData?.data || {},
      storia: storiaEvents?.data || [],
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering storia:", error);
    res.render("storia", {
      title: "La Nostra Storia - B4US | Simplify IT",
      storiaData: {},
      storia: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy", {
    title: "Privacy Policy - B4US srl | Simplify IT",
  });
});

app.get("/carriere", async (req, res) => {
  try {
    const carriereData = await fetchFromStrapi(
      "/carriere", null, ['HeroImage', 'CultureCards']
    );
    const jobPositions = await fetchFromStrapi("/job-positions");
    res.render("carriere", {
      title: "Lavora Con Noi - B4US Team",
      carriereData: carriereData?.data || {},
      jobPositions: jobPositions?.data || [],
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering carriere:", error);
    res.render("carriere", {
      title: "Lavora Con Noi - B4US Team",
      carriereData: {},
      jobPositions: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/contatti", async (req, res) => {
  try {
    const contattiData = await fetchFromStrapi(
      "/contatti", null, ['ContactDetails']
    );
    res.render("contatti", {
      title: "Contatti - B4US Simplify IT",
      contattiData: contattiData?.data || {},
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering contatti:", error);
    res.render("contatti", {
      title: "Contatti - B4US Simplify IT",
      contattiData: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/blog", async (req, res) => {
  try {
    const blogPageData = await fetchFromStrapi("/blog-page");
    const dipendenti = await fetchFromStrapi("/team-members");
    const progetti = await fetchFromStrapi("/blog-posts");

    res.render("blog", {
      title: "Diario di Bordo - B4US Simplify IT",
      blogPageData: blogPageData?.data || {},
      counts: {
        dipendenti: dipendenti?.data?.length || 0,
        progetti: progetti?.data?.length || 0,
        // Altri conteggi fissi o dinamici
        certificazioni: 15 // Placeholder o fetch se disponibile
      },
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering blog:", error);
    res.render("blog", {
      title: "Diario di Bordo - B4US Simplify IT",
      blogPageData: {},
      counts: { dipendenti: 0, progetti: 0, certificazioni: 0 },
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    // Fetch articolo per slug
    const response = await axios.get(
      `${STRAPI_API_URL}/blog-posts?filters[slug][$eq]=${slug}&populate=*`,
      {
        headers: { ...strapiAuthHeaders },
      },
    );
    const post = response.data?.data?.[0] || null;

    // Fetch altri articoli per la sezione "correlati" (escludendo l'attuale)
    const allPosts = await fetchFromStrapi("/blog-posts");
    const relatedPosts =
      allPosts?.data?.filter((p) => p.slug !== slug) ||
      [];

    res.render("blog-post", {
      title: post
        ? `${post.titolo} | B4US Blog`
        : "Articolo non trovato | B4US Blog",
      post: post,
      relatedPosts: relatedPosts,
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    console.error("Error rendering blog post:", error);
    res.render("blog-post", {
      title: "Articolo non trovato | B4US Blog",
      post: null,
      relatedPosts: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/bear", (req, res) => {
  res.render("bear", {
    title: "BEAR - Billing Expenses & Activity Reporting",
  });
});

app.get("/team", (req, res) => {
  res.render("team", {
    title: "Il Nostro Team - B4US",
  });
});

app.get("/login", (req, res) => {
  if (!res.locals.showLoginButton) {
    console.warn(
      "[LOGIN-BLOCKED]",
      new Date().toISOString(),
      `${req.method} ${req.originalUrl}`,
      "| clientIp=",
      req.clientIp || req.ip,
      "| allowedIp=",
      req.isAllowedLoginIp,
    );
    return res.status(403).send("Accesso non autorizzato");
  }

  console.log(
    "[LOGIN-ALLOWED]",
    new Date().toISOString(),
    `${req.method} ${req.originalUrl}`,
    "| clientIp=",
    req.clientIp || req.ip,
    "| allowedIp=",
    req.isAllowedLoginIp,
  );

  res.render("login", { title: "B4US Portal - Accedi" });
});

// Strapi redirect page
app.get("/strapi-redirect", (req, res) => {
  res.render("strapi-redirect", { title: "Reindirizzamento..." });
});

// Login API endpoint
app.post("/api/login", async (req, res) => {
  // Controllo IP: solo IP consentiti possono chiamare l'API di login
  if (IS_PRODUCTION && !req.isAllowedLoginIp) {
    console.warn(
      "[API-LOGIN-BLOCKED]",
      new Date().toISOString(),
      `${req.method} ${req.originalUrl}`,
      "| clientIp=",
      req.clientIp || req.ip,
      "| allowedIp=",
      req.isAllowedLoginIp,
    );
    return res.status(403).json({
      success: false,
      message: "Accesso non autorizzato",
    });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e password sono richiesti",
      });
    }

    console.log("Attempting login to:", `${STRAPI_URL}/admin/login`);
    console.log("With email:", identifier);

    // Authenticate with Strapi admin API
    const response = await axios.post(
      `${STRAPI_URL}/admin/login`,
      {
        email: identifier,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Login response status:", response.status);

    if (response.data && response.data.data) {
      // Login successful
      console.log("Login successful for:", identifier);
      return res.json({
        success: true,
        message: "Login effettuato con successo",
        adminUrl: STRAPI_URL,
        token: response.data.data.token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Credenziali non valide",
      });
    }
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      "Email o password non corretti. Assicurati di usare l'email dell'admin.";

    return res.status(error.response?.status || 401).json({
      success: false,
      message: errorMessage,
    });
  }
});

// Demo request endpoint
app.post("/api/demo-request", async (req, res) => {
  try {
    const { nome, cognome, azienda, email, softwareProduct, messaggio } =
      req.body;

    // Validazione
    if (!nome || !cognome || !azienda || !email || !softwareProduct) {
      return res.status(400).json({
        success: false,
        message: "Tutti i campi sono obbligatori",
      });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email non valida",
      });
    }

    console.log("Creating demo request for:", {
      nome,
      cognome,
      azienda,
      email,
      softwareProduct,
    });

    // Step 1: Trova o crea il software product
    let softwareProductId = null;
    try {
      // Cerca il prodotto per nome
      const productResponse = await axios.get(
        `${STRAPI_API_URL}/software-products?filters[name][$eq]=${softwareProduct}`,
        { headers: { ...strapiAuthHeaders } },
      );

      if (productResponse.data?.data?.length > 0) {
        softwareProductId = productResponse.data.data[0].id;
        console.log("Found existing software product:", softwareProductId);
      } else {
        // Se non esiste, crealo
        console.log("Creating new software product:", softwareProduct);
        const createProductResponse = await axios.post(
          `${STRAPI_API_URL}/software-products`,
          {
            data: {
              name: softwareProduct,
              publishedAt: new Date().toISOString(),
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...strapiAuthHeaders,
            },
          },
        );
        softwareProductId = createProductResponse.data.data.id;
        console.log("Created software product:", softwareProductId);
      }
    } catch (error) {
      console.error("Error handling software product:", error.message);
      // Continua senza il product se c'è un errore
    }

    // Step 2: Crea la demo request
    const demoRequestData = {
      data: {
        nome: nome,
        cognome: cognome,
        azienda: azienda,
        email: email,
        publishedAt: new Date().toISOString(),
      },
    };

    // Aggiungi messaggio se fornito
    if (messaggio) {
      demoRequestData.data.messaggio = messaggio;
    }

    // Aggiungi software_product solo se trovato/creato
    if (softwareProductId) {
      demoRequestData.data.software_product = softwareProductId;
    }

    console.log(
      "Creating demo request with data:",
      JSON.stringify(demoRequestData, null, 2),
    );

    const demoRequestResponse = await axios.post(
      `${STRAPI_API_URL}/demo-requests`,
      demoRequestData,
      {
        headers: {
          "Content-Type": "application/json",
          ...strapiAuthHeaders,
        },
      },
    );

    console.log(
      "Demo request created successfully:",
      demoRequestResponse.data.data.id,
    );

    res.json({
      success: true,
      message: "Richiesta demo inviata con successo! Ti contatteremo presto.",
      data: demoRequestResponse.data,
    });
  } catch (error) {
    console.error("Demo request error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Errore durante l'invio della richiesta demo";

    res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// Job application endpoint
app.post("/api/job-application", upload.single("cv"), async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { nome, cognome, dataNascita, email, telefono, jobPosition } =
      req.body;
    const cvFile = req.file;

    // Validazione
    if (
      !nome ||
      !cognome ||
      !dataNascita ||
      !email ||
      !telefono ||
      !jobPosition
    ) {
      return res.status(400).json({
        success: false,
        message: "Tutti i campi sono obbligatori",
      });
    }

    if (!cvFile) {
      return res.status(400).json({
        success: false,
        message: "Il CV è obbligatorio",
      });
    }

    uploadedFilePath = cvFile.path;

    // Step 1: Upload del CV su SharePoint
    console.log("Uploading CV to SharePoint...");
    const sharePointResult = await uploadToSharePoint(
      cvFile.path,
      cvFile.originalname,
    );
    console.log("CV uploaded to SharePoint:", sharePointResult.webUrl);
    console.log("CV uploaded to SharePoint:", sharePointResult.webUrl);

    // Step 2: Determina il job_position ID
    let jobPositionId = null;
    if (jobPosition !== "autocandidatura") {
      jobPositionId = parseInt(jobPosition);
    }

    // Step 3: Crea la job-request con link SharePoint
    // Step 3: Crea la job-request con link SharePoint
    const jobRequestData = {
      data: {
        Nome: nome,
        Cognome: cognome,
        AnnoNascita: dataNascita,
        email: email,
        Telefono: telefono,
        cvUrl: sharePointResult.webUrl,
        cvFileName: sharePointResult.fileName,
        publishedAt: new Date().toISOString(),
      },
    };

    // Aggiungi job_position solo se non è autocandidatura
    if (jobPositionId) {
      jobRequestData.data.job_position = jobPositionId;
    }

    console.log(
      "Creating job request with data:",
      JSON.stringify(jobRequestData, null, 2),
    );

    const jobRequestResponse = await axios.post(
      `${STRAPI_API_URL}/job-requests`,
      jobRequestData,
      {
        headers: {
          "Content-Type": "application/json",
          ...strapiAuthHeaders,
        },
      },
    );

    console.log(
      "Job request created successfully:",
      jobRequestResponse.data.data.id,
    );

    // Pulisci il file temporaneo
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      message: "Candidatura inviata con successo! Ti contatteremo presto.",
      data: jobRequestResponse.data,
    });
  } catch (error) {
    console.error("Job application error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Pulisci il file temporaneo in caso di errore
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Errore durante l'invio della candidatura";

    res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// Proxy generico per le chiamate client-side a Strapi (evita CORS e mixed content)
app.get("/api/strapi/:endpoint", async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    // Ricostruisci la query string originale
    const queryString =
      Object.keys(req.query).length > 0
        ? "?" + new URLSearchParams(req.query).toString()
        : "";
    const url = `${STRAPI_API_URL}/${endpoint}${queryString}`;
    console.log("Proxy Strapi request:", url);
    const response = await axios.get(url, {
      headers: { ...strapiAuthHeaders },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Proxy Strapi error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: "Errore nel proxy Strapi" },
    });
  }
});
app.get("/health", function (req, res) {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
// Avvia il server HTTP (HTTPS/redirect gestito da Azure App Service)
app.listen(PORT, () => {
  console.log(`✅ HTTP Server running on port ${PORT}`);
});
