// ========================================
// LAET IMPORTS - API (Express + PostgreSQL)
// ========================================

const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// Load env
let dotenv;
try {
  dotenv = require('dotenv');
} catch (_) {
  dotenv = null;
}
if (dotenv) dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const PUBLIC_UPLOAD_DIR = process.env.PUBLIC_UPLOAD_DIR || '/uploads';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use(PUBLIC_UPLOAD_DIR, express.static(UPLOAD_DIR));

// Database abstraction (Postgres or local JSON fallback)
const database = require('./database');

// initializeDatabase durante startup
(async () => {
  try {
    await database.initializeDatabase();
    console.log('[STARTUP] Database inicializada.');
  } catch (e) {
    console.error('[STARTUP] Falha ao inicializar database:', e && e.stack ? e.stack : (e && e.message ? e.message : String(e)));
  }
})();


// Health
app.get('/health', async (req, res) => {
  try {
    await database.initializeDatabase();
    return res.json({ ok: true, mode: 'postgres' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// Helpers
function writeJsonAtomic(filePath, value) {
  const tmp = filePath + '.tmp';
  const json = JSON.stringify(value, null, 2);
  fs.writeFileSync(tmp, json, 'utf8');
  fs.renameSync(tmp, filePath);
}

function toNumberOrNull(v) {

  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeBadge(badge, badgeText) {
  const b = (badge || '').trim();
  const t = (badgeText || '').trim();
  if (!b) return { badge: null, badgeText: null };
  return { badge: b, badgeText: t || null };
}

function requireAdmin(req, res, next) {
  const roleHeader = req.headers['x-admin-role'];
  const tokenHeader = req.headers['x-admin-token'];

  const expectedToken = process.env.ADMIN_TOKEN || 'admin-token';

  const mode = 'postgres';


  // garante estrutura da sessão em local
  if (mode === 'local' && !global.__LAET_SESSIONS) {
    global.__LAET_SESSIONS = new Map();
  }

  // 1) token fixo legado via ADMIN_TOKEN
  if (tokenHeader && tokenHeader === expectedToken) {
    req.adminRole = roleHeader || 'editor';
    return next();
  }


  // 2) modo local: validar sessão via global.__LAET_SESSIONS usando o token do header
  if (mode === 'local') {
    if (tokenHeader && global.__LAET_SESSIONS && global.__LAET_SESSIONS.has(tokenHeader)) {
      const user = global.__LAET_SESSIONS.get(tokenHeader);
      req.adminSession = { user };
      req.adminRole = user && user.role ? user.role : 'editor';
      return next();
    }

    // fallback: se adminSession já foi preenchido pelo /api/admin/login (mesma instância)
    if (req.adminSession && req.adminSession.user) {
      req.adminRole = req.adminSession.user.role || 'editor';
      return next();
    }
  }

  // 3) Postgres/produção (ou qualquer outro modo): aceita token fixo legado
  if (tokenHeader && tokenHeader === expectedToken) {
    req.adminRole = roleHeader || 'editor';
    return next();
  }

  // logs mínimos para debug do problema de login
  try {
    console.warn('[ADMIN AUTH] denied', {
      path: req.originalUrl,
      method: req.method,
      mode,
      hasToken: !!tokenHeader,
      tokenMatchesExpected: !!(tokenHeader && tokenHeader === expectedToken),
      sessionExists: !!(global.__LAET_SESSIONS && tokenHeader && global.__LAET_SESSIONS.has(tokenHeader)),
      roleHeader,
    });
  } catch (_) {}

  return res.status(401).json({ error: 'Unauthorized' });
}







// Simple seeding (public)
app.post('/api/admin/seed', async (req, res) => {
  // Fora do escopo do fallback: users/seed/stats dependem do Postgres no seu projeto original.
  // No modo local, o database.js já inicializa data/*.json com defaults.
  res.status(501).json({ error: 'Seed disponível apenas com PostgreSQL ativo.' });
});


// Auth: login (local JSON ou PostgreSQL)
app.post('/api/admin/login', async (req, res) => {
  const b = req.body || {};
  const username = String(b.username || '').trim();
  const password = String(b.password || '');

  // Modo local (fallback): autentica por data/users.json
  try {
    if (database._getMode && database._getMode() === 'local') {
      const usersPath = path.join(__dirname, 'data', 'users.json');
      const raw = fs.existsSync(usersPath) ? fs.readFileSync(usersPath, 'utf8') : '{"users": []}';
      let parsed = { users: [] };
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        parsed = { users: [] };
      }
      const users = Array.isArray(parsed.users) ? parsed.users : [];
      const user = users.find(u => String(u.username) === username && String(u.password) === password);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // token de sessão (simples): base64 do username + timestamp + segredo do processo
      const sessionToken = Buffer.from(`${username}:${Date.now()}:${process.env.TOKEN_SEED || 'seed'}`).toString('base64');
      if (!global.__LAET_SESSIONS) global.__LAET_SESSIONS = new Map();
      global.__LAET_SESSIONS.set(sessionToken, user);

      // força requireAdmin a usar a sessão
      req.adminSession = { user };

      return res.json({ user: { id: user.id, username: user.username, role: user.role, name: user.name }, token: sessionToken });
    }
  } catch (e) {
    // continua para o fluxo legado/prod
  }

  // Legado/compat: se ADMIN_TOKEN estiver setado, aceita login "dummy" para não quebrar.
  // (O CRUD de usuários continua legado fora do escopo do fallback local.)
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-token';
  if (username === 'admin' && password === '123' && expectedToken) {
    return res.json({
      user: { id: 1, username: 'admin', role: 'admin', name: 'Administrador' },
      token: expectedToken,
    });
  }

  return res.status(501).json({ error: 'Login disponível apenas quando Postgres estiver ativo (ou fallback local).' });
});

// Middleware de sessão local: resolve token -> usuário
app.use((req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (database._getMode && database._getMode() === 'local') {
    if (token && global.__LAET_SESSIONS && global.__LAET_SESSIONS.has(token)) {
      req.adminSession = { user: global.__LAET_SESSIONS.get(token) };
    }
  }
  next();
});


// Public shop endpoints

app.get('/api/products', async (req, res) => {
  try {
    const category = req.query.category;

    // Sempre use a camada database.js (ela já decide entre Postgres e fallback JSON local)
    let products = await database.getProducts();

    if (category && category !== 'todos') {
      products = products.filter(p => String(p.category) === String(category));
    }

    // garantir ordenação por id asc (tanto no fallback local quanto no postgres)
    products = (products || []).slice().sort((a, b) => Number(a.id) - Number(b.id));

    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const products = await database.getProducts();
  const p = products.find(x => Number(x.id) === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const imageUrls = Array.isArray(p.imageUrls) ? p.imageUrls : [];
  res.json({
    product: {
      ...p,
      imageUrl: imageUrls.length ? imageUrls[0] : '',
    },
  });
});

app.get('/api/categories', async (req, res) => {
  const categories = await database.getCategories();
  res.json({ categories });
});

app.get('/api/site-content', async (req, res) => {
  try {
    const siteContent = await database.getSiteContent();
    if (!siteContent) return res.status(404).json({ error: 'Missing content' });
    return res.json({ siteContent });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load site content', details: e && e.message ? e.message : String(e) });
  }
});


app.get('/api/contact', async (req, res) => {
  const contact = await database.getContact();
  res.json({ contact });
});


// Public newsletter (no persistence, just keep UX)
app.post('/api/newsletter', async (req, res) => {
  return res.json({ ok: true });
});

// Admin CRUD
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const productId = req.params.id;
      const dir = path.join(UPLOAD_DIR, 'products', String(productId));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}_${base}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const b = req.body || {};

  // previne admins legados (token fixo) de executar sem sessão local quando DATABASE_MODE=local
  if (database._getMode && database._getMode() === 'local') {
    const expectedToken = process.env.ADMIN_TOKEN || 'admin-token';
    const token = req.headers['x-admin-token'];
    if (token === expectedToken) {
      // ok: mantém compatibilidade
    }
  }

  const id = toNumberOrNull(b.id) || Date.now();

  const category = String(b.category || 'todos');

  const badgeInfo = normalizeBadge(b.badge, b.badgeText);

  const products = await database.getProducts();
  const categoryLabel = String(b.categoryLabel || '');

  const next = {
    id: Number(id),
    name: b.name || '',
    category,
    categoryLabel,
    price: toNumberOrNull(b.price) || 0,
    oldPrice: toNumberOrNull(b.oldPrice),
    installment: b.installment || '',
    badge: badgeInfo.badge,
    badgeText: badgeInfo.badgeText,
    icon: b.icon || '',
    imageUrls: Array.isArray((products.find(p => Number(p.id) === Number(id)) || {}).imageUrls)
      ? (products.find(p => Number(p.id) === Number(id)) || {}).imageUrls
      : [],
    description: b.description || '',
  };

  await database.saveProducts([...products.filter(p => Number(p.id) !== Number(id)), next]);
  res.json({ ok: true, id });
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const b = req.body || {};
  const badgeInfo = normalizeBadge(b.badge, b.badgeText);

  const category = String(b.category || 'todos');

  const products = await database.getProducts();
  const existing = products.find(p => Number(p.id) === id);
  const imageUrls = existing && Array.isArray(existing.imageUrls) ? existing.imageUrls : [];

  const next = {
    id,
    name: b.name || '',
    category,
    categoryLabel: String(b.categoryLabel || ''),
    price: toNumberOrNull(b.price) || 0,
    oldPrice: toNumberOrNull(b.oldPrice),
    installment: b.installment || '',
    badge: badgeInfo.badge,
    badgeText: badgeInfo.badgeText,
    icon: b.icon || '',
    imageUrls,
    description: b.description || '',
  };

  await database.saveProducts([...products.filter(p => Number(p.id) !== id), next]);
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);

  const products = await database.getProducts();
  await database.saveProducts(products.filter(p => Number(p.id) !== id));

  res.json({ ok: true });
});

app.post('/api/admin/products/:id/images', requireAdmin, upload.array('images', 20), async (req, res) => {
  const productId = Number(req.params.id);
  const files = req.files || [];

  const products = await database.getProducts();
  const existing = products.find(p => Number(p.id) === productId);
  const imageUrls = files.map(f => (process.env.PUBLIC_UPLOAD_DIR || '/uploads') + '/' + path.basename(f.path));

  const next = {
    ...(existing || { id: productId }),
    id: productId,
    imageUrls,
  };

  await database.saveProducts([...products.filter(p => Number(p.id) !== productId), next]);
  res.json({ ok: true, count: files.length });
});


app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  // stats não fazem parte da especificação do fallback (users ainda dependem do Postgres)
  // então retornamos apenas produtos/categorias quando no modo local.
  try {
    const mode = database._getMode();
    if (mode === 'local') {
      const products = await database.getProducts();
      const categories = await database.getCategories();
      res.json({
        products: (products || []).length,
        categories: (categories || []).filter(c => String(c.id) !== 'todos').length,
        users: null,
      });
      return;
    }
  } catch (_) {
    // ignore
  }

  res.status(501).json({ error: 'Stats disponível apenas quando Postgres estiver ativo.' });
});


app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const products = await database.getProducts();
    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/categories', requireAdmin, async (req, res) => {
  try {
    const categories = await database.getCategories();
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await database.getUsers();
    return res.json({
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        password: undefined,
        role: u.role,
        name: u.name,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


app.post('/api/admin/categories', requireAdmin, async (req, res) => {

  const b = req.body || {};
  const id = String(b.id || '');
  const label = String(b.label || '');
  const protectedFlag = !!b.protected;

  const categories = await database.getCategories();
  const next = {
    id,
    label,
    protected: protectedFlag,
  };

  const out = categories.filter(c => String(c.id) !== id);
  out.push(next);
  await database.saveCategories(out);

  res.json({ ok: true });
});

app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  const catId = String(req.params.id);
  const b = req.body || {};

  const categories = await database.getCategories();
  const existing = categories.find(c => String(c.id) === catId);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const out = categories.map(c =>
    String(c.id) === catId ? { ...c, label: String(b.label || '') } : c
  );

  await database.saveCategories(out);
  res.json({ ok: true });
});

app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  const catId = String(req.params.id);

  const categories = await database.getCategories();
  const existing = categories.find(c => String(c.id) === catId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.protected) return res.status(400).json({ error: 'Protected' });

  const out = categories.filter(c => String(c.id) !== catId);
  await database.saveCategories(out);
  res.json({ ok: true });
});


app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};

    const id = await database.createUser({
      id: b.id !== undefined ? Number(b.id) : undefined,
      username: String(b.username || ''),
      password: String(b.password || ''),
      role: String(b.role || 'editor'),
      name: String(b.name || ''),
    });

    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(400).json({ error: e.message || String(e) });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};

    await database.updateUser(id, {
      username: b.username !== undefined ? String(b.username) : undefined,
      password: b.password !== undefined ? String(b.password) : undefined,
      role: b.role !== undefined ? String(b.role) : undefined,
      name: b.name !== undefined ? String(b.name) : undefined,
    }, { adminRole: req.adminRole });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message || String(e) });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await database.deleteUser(id, { adminRole: req.adminRole });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message || String(e) });
  }
});


// Content admin


app.put('/api/admin/site-content', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    await database.saveSiteContent({
      heroBadge: b.heroBadge || '',
      heroTitle: b.heroTitle || '',
      heroDescription: b.heroDescription || '',
      heroBtn1: b.heroBtn1 || '',
      heroBtn2: b.heroBtn2 || '',
      feature1Title: b.feature1Title || '',
      feature1Desc: b.feature1Desc || '',
      feature2Title: b.feature2Title || '',
      feature2Desc: b.feature2Desc || '',
      feature3Title: b.feature3Title || '',
      feature3Desc: b.feature3Desc || '',
      feature4Title: b.feature4Title || '',
      feature4Desc: b.feature4Desc || '',
      productsSectionTitle: b.productsSectionTitle || '',
      productsSectionDesc: b.productsSectionDesc || '',
      offerBadge: b.offerBadge || '',
      offerTitle: b.offerTitle || '',
      offerDescription: b.offerDescription || '',
      offerBtn: b.offerBtn || '',
      newsletterTitle: b.newsletterTitle || '',
      newsletterDesc: b.newsletterDesc || '',
      footerDescription: b.footerDescription || '',
      footerCopyright: b.footerCopyright || '',
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save site content', details: e && e.stack ? e.stack : (e && e.message ? e.message : String(e)) });
  }
});


app.put('/api/admin/contact', requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    await database.saveContact({
      whatsapp: String(b.whatsapp || ''),
      instagram: String(b.instagram || ''),
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save contact', details: e && e.stack ? e.stack : (e && e.message ? e.message : String(e)) });
  }
});



// Serve frontend (full-stack)
// Prevent browser caching for admin assets (fixes loading stale admin.js).
app.use((req, res, next) => {
  if (req.path.startsWith('/admin') || req.path === '/admin.js' || req.path === '/admin.html') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get(['/admin', '/admin/'], (req, res) => {
  // Remove qualquer query string de redirecionamentos antigos mantendo sempre a mesma página
  return res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'product.html'));
});


// Run
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`LAET running on port ${PORT}`);
});


