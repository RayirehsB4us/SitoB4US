require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const morgan = require("morgan");
const winston = require("winston");
require("winston-daily-rotate-file");
const {
  normalizeIpForCompare,
  isIpAllowed,
  buildStrapiPopulateQuery,
  sanitizeFileName,
  sanitizeFolderName,
  generateSitemapXml,
  generateRobotsTxt,
} = require("./utils");

// ── Winston Logger ──────────────────────────────────────────────────
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",    // tiene 30 giorni, poi cancella
  zippedArchive: true, // comprime i vecchi in .gz
});

const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  zippedArchive: true,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [errorRotateTransport, combinedRotateTransport],
});

// In sviluppo, logga anche su console
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_URL =
  process.env.STRAPI_API_URL || "http://localhost:1337/api";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";

// SharePoint / Microsoft Graph API config
const SHAREPOINT_TENANT_ID = process.env.SHAREPOINT_TENANT_ID || "";
const SHAREPOINT_CLIENT_ID = process.env.SHAREPOINT_CLIENT_ID || "";
const SHAREPOINT_CLIENT_SECRET = process.env.SHAREPOINT_CLIENT_SECRET || "";
const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID || "";
const SHAREPOINT_DRIVE_ID = process.env.SHAREPOINT_DRIVE_ID || "";
const SHAREPOINT_FOLDER = process.env.SHAREPOINT_FOLDER || "";


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
 * @param {string} folderName - Nome cartella (es: "Candidature_Spontanee" o "Frontend_Developer")
 * @param {string} nome - Nome del candidato
 * @param {string} cognome - Cognome del candidato
 * @returns {object} - { webUrl, downloadUrl, fileName } del file caricato
 */
async function uploadToSharePoint(filePath, fileName, folderName, nome, cognome) {
  const accessToken = await getSharePointAccessToken();

  // Mantieni il nome file originale
  const uploadName = sanitizeFileName(fileName);

  // Cartella: SHAREPOINT_FOLDER/folderName/
  const safeFolder = sanitizeFolderName(folderName);

  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;

  // Per file <= 4MB: upload diretto con PUT
  // Per file > 4MB: serve upload session (non dovrebbe servire per CV)
  if (fileSize > 4 * 1024 * 1024) {
    throw new Error(
      "File troppo grande per upload diretto. Massimo 4MB per SharePoint upload.",
    );
  }

  // Upload dentro SHAREPOINT_FOLDER/Nome_Cognome_YYYY-MM-DD/file.pdf
  // SharePoint crea automaticamente le sottocartelle con PUT
  const uploadUrl =
    `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}` +
    `/drives/${SHAREPOINT_DRIVE_ID}` +
    `/root:/${SHAREPOINT_FOLDER ? SHAREPOINT_FOLDER + "/" : ""}${safeFolder}/${uploadName}:/content`;

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
logger.info("Boot environment", {
  NODE_ENV: process.env.NODE_ENV,
  IS_PRODUCTION,
  MAINTENANCE_MODE,
  ALLOWED_LOGIN_IPS,
});
// Header di autenticazione per tutte le richieste a Strapi
const strapiAuthHeaders = STRAPI_API_TOKEN
  ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
  : {};

// Middleware per caricare le impostazioni del sito (Gestione Sito)
app.use(async (req, res, next) => {
  try {
    const response = await axios.get(
      `${STRAPI_API_URL}/site-settings`,
      { headers: { ...strapiAuthHeaders } },
    );
    res.locals.siteSettings = response.data?.data || {};
    logger.info("Site settings loaded", { siteSettings: res.locals.siteSettings });
  } catch (error) {
    logger.error("Strapi site-settings fetch error", { error: error.message });
    res.locals.siteSettings = {};
  }
  next();
});

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

    logger.info("Mega menu loaded", {
      items: topMenu.map((item) => ({
        label: item.label,
        path: item.path,
        sottoMenu: (item.sottoMenu || []).length,
      })),
    });

    res.locals.topMenu = topMenu;
  } catch (error) {
    logger.error("Strapi mega menu fetch error", { error: error.message });
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

    logger.info("Footer loaded", {
      columns: footer.columns.map((c) => ({ title: c.Title, links: c.link.length })),
    });

    res.locals.footer = footer;
  } catch (error) {
    logger.error("Strapi footer fetch error", { error: error.message });
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

// ── Morgan HTTP Logger (file giornaliero) ───────────────────────────
const accessLogger = winston.createLogger({
  format: winston.format.printf(({ message }) => message),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, "access-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
});
app.use(morgan("combined", { stream: { write: (msg) => accessLogger.info(msg.trim()) } }));
app.use(morgan("short")); // anche su console

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
  const isAllowedIp = isIpAllowed(clientIp, ALLOWED_LOGIN_IPS);

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
  logger.info("Request IP", {
    method: req.method,
    url: req.originalUrl,
    clientIp: clientIp || "N/A",
    source: ipSource,
    allowedIp: isAllowedIp,
    showLoginButton: res.locals.showLoginButton,
  });

  next();
});

// Base URL del sito (per sitemap e canonical)
const SITE_URL = process.env.SITE_URL || "https://www.b4us.it";

// robots.txt e sitemap.xml (route prima di static per essere sempre raggiungibili)
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(generateRobotsTxt(SITE_URL));
});

const SITEMAP_PAGES = [
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

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml").send(generateSitemapXml(SITE_URL, SITEMAP_PAGES));
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Pagina di manutenzione:
// - MAINTENANCE_MODE=1 → manutenzione forzata per tutti (tranne IP autorizzati)
// - Strapi non raggiungibile → manutenzione automatica per IP non autorizzati
let strapiAvailable = true;
let lastStrapiCheck = 0;
const STRAPI_CHECK_INTERVAL = 30000; // Controlla ogni 30 secondi

async function checkStrapiHealth() {
  const now = Date.now();
  if (now - lastStrapiCheck < STRAPI_CHECK_INTERVAL) return strapiAvailable;
  lastStrapiCheck = now;
  try {
    await axios.get(`${STRAPI_URL}/admin`, { timeout: 5000, headers: { ...strapiAuthHeaders } });
    if (!strapiAvailable) logger.info("Strapi is back online");
    strapiAvailable = true;
  } catch (err) {
    if (strapiAvailable) logger.warn("Strapi is unreachable", { error: err.message });
    strapiAvailable = false;
  }
  return strapiAvailable;
}

app.use(async (req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/api/") || req.path.startsWith("/public")) return next();

  // Se l'IP è autorizzato, passa sempre (vede il sito anche in manutenzione)
  if (req.isAllowedLoginIp) return next();

  // Manutenzione forzata (da .env o da Gestione Sito in Strapi)
  const strapiMaintenance = res.locals.siteSettings && res.locals.siteSettings.maintenanceMode === true;
  if (MAINTENANCE_MODE || strapiMaintenance) {
    return res.status(503).render("manutenzione", {
      title: "Manutenzione in corso | B4US",
    });
  }

  // Manutenzione automatica: Strapi non raggiungibile
  const isUp = await checkStrapiHealth();
  if (!isUp) {
    logger.warn("Showing maintenance page (Strapi down)", { clientIp: req.clientIp, path: req.path });
    return res.status(503).render("manutenzione", {
      title: "Manutenzione in corso | B4US",
    });
  }

  next();
});

// Helper function to fetch from Strapi with error handling
async function fetchFromStrapi(endpoint, fallbackData = null, deepPopulate = null) {
  try {
    const query = buildStrapiPopulateQuery(deepPopulate);
    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await axios.get(
      `${STRAPI_API_URL}${endpoint}${separator}${query}`,
      {
        headers: { ...strapiAuthHeaders },
      },
    );
    return response.data;
  } catch (error) {
    logger.error("Strapi fetch error", { endpoint, error: error.message });
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
    logger.error("Error rendering home", { error: error.message });
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
    logger.error("Error rendering home", { error: error.message });
    res.render("home", { title: "B4US | Simplify IT", home: {}, servizi: [] });
  }
});

app.get("/chi-siamo", async (req, res) => {
  try {
    const chiSiamoData = await fetchFromStrapi(
      "/chi-siamo",
      null,
      ["ValueCards", "HeroImage", "Team"],
    );
    const teamMembers = await fetchFromStrapi("/team-members?sort=ordine:asc");
    res.render("chi-siamo", {
      title: "Chi Siamo - B4US Simplify IT",
      chiSiamoData: chiSiamoData?.data || {},
      teamMembers: teamMembers?.data || [],
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    logger.error("Error rendering chi-siamo", { error: error.message });
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
    logger.error("Error rendering prodotti", { error: error.message });
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
    logger.error("Error rendering open4us", { error: error.message });
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
    logger.error("Error rendering carfleet", { error: error.message });
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
    logger.error("Error rendering servizi", { error: error.message });
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
    logger.error("Error rendering struttura", { error: error.message });
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
    logger.error("Error rendering storia", { error: error.message });
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
    logger.error("Error rendering carriere", { error: error.message });
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
    logger.error("Error rendering contatti", { error: error.message });
    res.render("contatti", {
      title: "Contatti - B4US Simplify IT",
      contattiData: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/blog", async (req, res) => {
  if (!req.isAllowedLoginIp && res.locals.siteSettings && res.locals.siteSettings.showBlogPage === false) {
    return res.redirect("/");
  }
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
    logger.error("Error rendering blog", { error: error.message });
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
    logger.error("Error rendering blog post", { error: error.message });
    res.render("blog-post", {
      title: "Articolo non trovato | B4US Blog",
      post: null,
      relatedPosts: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/bear", async (req, res) => {
  if (!req.isAllowedLoginIp && res.locals.siteSettings && res.locals.siteSettings.showBearPage === false) {
    return res.redirect("/");
  }
  try {
    const bearData = await fetchFromStrapi("/bear", null, ["FeatureCards", "FeatureSections", "HeroImage", "HeroHighlights"]);
    res.render("bear", {
      title: "BEAR - Billing Expenses & Activity Reporting",
      bear: bearData?.data || {},
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    logger.error("Error rendering bear", { error: error.message });
    res.render("bear", {
      title: "BEAR - Billing Expenses & Activity Reporting",
      bear: {},
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/team", async (req, res) => {
  try {
    const selectedTeam = req.query.team || "all";

    // 1) Dati di layout pagina Team
    const teamPageResp = await fetchFromStrapi("/team", null, [
      "MainTitleSection",
    ]);

    const mainSections = teamPageResp?.data?.MainTitleSection || [];
    const headerSection =
      mainSections.find((c) => c.__component === "shared.title") || null;
    const pageTitle =
      (headerSection && headerSection.Title) || "Il Nostro Team - B4US";

    // 2) Employes con deep populate (pic, certificate, project, teams)
    const employeesResp = await fetchFromStrapi("/employes", null, [
      "pic",
      "certificate",
      "project",
      "teams",
    ]);
    const rawEmployees = Array.isArray(employeesResp?.data)
      ? employeesResp.data
      : [];

    // 3) Team roles per i filtri
    const teamRolesResp = await fetchFromStrapi("/team-roles");
    const rawRoles = (Array.isArray(teamRolesResp?.data)
      ? teamRolesResp.data
      : []).filter((r) => r.Team !== "CEO & Founder");

    const teamRolesParsed = rawRoles.map((r) => ({
      id: r.id,
      documentId: r.documentId,
      name: r.Team,
      description: r.DescrizioneTeam || "",
    }));

    // 4) Job positions per il modale "Lavora con noi"
    const jobPositionsResp = await fetchFromStrapi("/job-positions");
    const jobPositions = Array.isArray(jobPositionsResp?.data)
      ? jobPositionsResp.data
      : [];

    function buildImageUrl(member) {
      const pics = Array.isArray(member.pic) ? member.pic : [];
      const pic = pics[0];
      if (!pic) {
        return "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg";
      }
      const formats = pic.formats || {};
      const img = formats.medium || formats.small || formats.thumbnail || pic;
      if (img.url)
        return img.url.startsWith("http") ? img.url : STRAPI_URL + img.url;
      if (pic.url)
        return pic.url.startsWith("http") ? pic.url : STRAPI_URL + pic.url;
      return "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg";
    }

    let employeesParsed = rawEmployees.map((m) => {
      const teams = Array.isArray(m.teams) ? m.teams : [];
      const parsedTeams = teams.map((t) => ({
        id: t.id,
        documentId: t.documentId,
        name: t.Team,
      }));

      return {
        id: m.id,
        documentId: m.documentId,
        fullName: `${m.nome || ""} ${m.cognome || ""}`.trim(),
        firstName: m.nome || "",
        lastName: m.cognome || "",
        jobTitle: m.jobTitle || "",
        jobDescription:
          m.JobDescription ||
          "Professionista del team B4US, impegnato nella trasformazione digitale dei nostri clienti.",
        year: (m.AnnoAssunzione || "").toString().trim(),
        consulente: !!m.Consulente,
        jobCategory: m.jobCategory || "",
        imageUrl: buildImageUrl(m),
        teams: parsedTeams,
      };
    });

    // Metti il General Manager (Riccardo) in prima posizione nella lista "Tutti"
    employeesParsed.sort((a, b) => {
      const aIsGM =
        (a.jobTitle || "").startsWith(
          "General Manager and Digital Transformation and Smart Working Architect",
        ) || a.fullName === "Riccardo Germinario";
      const bIsGM =
        (b.jobTitle || "").startsWith(
          "General Manager and Digital Transformation and Smart Working Architect",
        ) || b.fullName === "Riccardo Germinario";
      if (aIsGM && !bIsGM) return -1;
      if (!aIsGM && bIsGM) return 1;
      return 0;
    });

    const employeesFiltered =
      selectedTeam === "all"
        ? employeesParsed
        : employeesParsed.filter((e) =>
            e.teams.some((t) => t.documentId === selectedTeam),
          );

    res.render("team", {
      title: pageTitle,
      teamData: teamPageResp?.data || {},
      employees: employeesFiltered,
      allEmployeesCount: employeesParsed.length,
      teamRoles: teamRolesParsed,
      selectedTeam,
      jobPositions,
      strapiUrl: STRAPI_URL,
    });
  } catch (error) {
    logger.error("Error rendering team", { error: error.message });
    res.render("team", {
      title: "Il Nostro Team - B4US",
      teamData: {},
      employees: [],
      allEmployeesCount: 0,
      teamRoles: [],
      selectedTeam: "all",
      jobPositions: [],
      strapiUrl: STRAPI_URL,
    });
  }
});

app.get("/login", (req, res) => {
  if (!res.locals.showLoginButton) {
    logger.warn("Login blocked", { clientIp: req.clientIp || req.ip, allowedIp: req.isAllowedLoginIp });
    return res.status(403).send("Accesso non autorizzato");
  }

  logger.info("Login allowed", { clientIp: req.clientIp || req.ip });

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
    logger.warn("API login blocked", { clientIp: req.clientIp || req.ip });
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

    logger.info("Login attempt", { email: identifier });

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

    if (response.data && response.data.data) {
      logger.info("Login successful", { email: identifier });
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
    logger.error("Login error", { error: error.message, status: error.response?.status });

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

    logger.info("Demo request", { nome, cognome, azienda, email, softwareProduct });

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
        logger.info("Found existing software product", { id: softwareProductId });
      } else {
        // Se non esiste, crealo
        logger.info("Creating new software product", { name: softwareProduct });
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
        logger.info("Created software product", { id: softwareProductId });
      }
    } catch (error) {
      logger.error("Error handling software product", { error: error.message });
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

    logger.info("Creating demo request in Strapi");

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

    logger.info("Demo request created", { id: demoRequestResponse.data.data.id });

    res.json({
      success: true,
      message: "Richiesta demo inviata con successo! Ti contatteremo presto.",
      data: demoRequestResponse.data,
    });
  } catch (error) {
    logger.error("Demo request error", { error: error.message, status: error.response?.status });

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

    // Step 1: Determina la cartella SharePoint
    let jobPositionDocId = null;
    let folderName = "Candidature_Spontanee";

    if (jobPosition !== "autocandidatura") {
      jobPositionDocId = jobPosition; // documentId (stringa)
      // Fetch il titolo della posizione da Strapi
      try {
        const jobResp = await axios.get(
          `${STRAPI_API_URL}/job-positions/${jobPositionDocId}`,
          { headers: { ...strapiAuthHeaders } },
        );
        const jobTitle = jobResp.data?.data?.titolo || jobResp.data?.data?.Titolo || "";
        if (jobTitle) {
          folderName = jobTitle;
        }
        logger.info("Job position found", { documentId: jobPositionDocId, title: jobTitle });
      } catch (err) {
        logger.warn("Could not fetch job position title", { jobPosition, error: err.message });
        folderName = `Posizione_${jobPosition}`;
      }
    }

    // Step 2: Upload del CV su SharePoint
    logger.info("Uploading CV to SharePoint", { folder: folderName });
    const sharePointResult = await uploadToSharePoint(
      cvFile.path,
      cvFile.originalname,
      folderName,
      nome,
      cognome,
    );
    logger.info("CV uploaded to SharePoint", { url: sharePointResult.webUrl });

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

    // Aggiungi job_position solo se non è autocandidatura (usa documentId per Strapi 5)
    if (jobPositionDocId) {
      jobRequestData.data.job_position = { connect: [{ documentId: jobPositionDocId }] };
    }

    logger.info("Creating job request in Strapi");

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

    logger.info("Job request created", { id: jobRequestResponse.data.data.id });

    // Pulisci il file temporaneo
    fs.unlinkSync(uploadedFilePath);

    res.json({
      success: true,
      message: "Candidatura inviata con successo! Ti contatteremo presto.",
      data: jobRequestResponse.data,
    });
  } catch (error) {
    logger.error("Job application error", { error: error.message, status: error.response?.status });

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
    logger.info("Proxy Strapi request", { url });
    const response = await axios.get(url, {
      headers: { ...strapiAuthHeaders },
    });
    res.json(response.data);
  } catch (error) {
    logger.error("Proxy Strapi error", { error: error.message });
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
  logger.info(`Server running on port ${PORT}`);
});
