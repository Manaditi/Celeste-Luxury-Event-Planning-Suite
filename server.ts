import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// 1. IN-MEMORY CACHE FOR HIGH EFFICIENCY
// ==========================================
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  constructor(private maxSize = 200, private ttlMs = 15 * 60 * 1000) {}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.cache.clear();
  }
}

const responseCache = new MemoryCache<Record<string, unknown>>(150, 10 * 60 * 1000);

// ==========================================
// 2. SECURITY HEADERS & PERFORMANCE MIDDLEWARE
// ==========================================

// HTTP Response Compression (gzip / deflate) for maximum network transfer efficiency
app.use(compression());

// Helmet with content security policy suited for SPA & fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Restrict CORS safely
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-gemini-key', 'Authorization'],
  })
);

// Payload size limit to prevent memory exhaustion & buffer abuse
app.use(express.json({ limit: '250kb' }));

// Rate limiting on GenAI proxy endpoints to prevent quota draining / DoS
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // max 120 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many event generation requests. Please allow a brief cooldown before submitting further prompts.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api/events/', apiRateLimiter);

// Serve static frontend files with high-performance caching if built in dist/
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );
}

// ==========================================
// 3. INPUT SANITIZATION & TYPE DEFINITIONS
// ==========================================
interface BudgetItemInput {
  id?: string;
  category?: string;
  name?: string;
  plannedAmount?: number;
  committedAmount?: number;
  paidAmount?: number;
  status?: string;
  notes?: string;
  assignedTo?: string;
}

interface FallbackPlanParams {
  title: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  budgetTotal: number;
  vibe: string;
  locationType: string;
  specialRequests?: string;
}

interface FallbackVendorInquiryParams {
  vendorName: string;
  vendorCategory: string;
  eventTitle: string;
  eventDate: string;
  location: string;
  guestCount: number;
  budgetEstimate: number;
  tone: string;
  specificRequirements?: string;
}

function sanitizeString(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .slice(0, maxLen)
    .trim();
}

function validateNumber(input: unknown, min: number, max: number, fallback: number): number {
  const num = Number(input);
  if (isNaN(num) || num < min || num > max) return fallback;
  return Math.round(num);
}

// Helper to get GoogleGenAI client securely
function getGenAIClient(customKey?: string): GoogleGenAI | null {
  const apiKey = (customKey && typeof customKey === 'string' && customKey.trim().length > 10)
    ? customKey.trim()
    : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ==========================================
// 4. API ENDPOINTS
// ==========================================

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({
    status: 'healthy',
    service: 'Céleste Haute Event Orchestration AI Proxy',
    model: 'gemini-3.8-flash',
    hasApiKey: hasKey,
    security: {
      rateLimiter: 'active',
      helmet: 'active',
      compression: 'active',
      csp: 'active',
    },
    timestamp: new Date().toISOString(),
  });
});

// 1. POST /api/events/generate-plan
app.post('/api/events/generate-plan', async (req: Request, res: Response) => {
  try {
    const raw = req.body || {};
    const title = sanitizeString(raw.title || 'Haute Private Celebration', 150);
    const type = ['wedding', 'birthday', 'community', 'corporate'].includes(raw.type) ? raw.type : 'wedding';
    const date = sanitizeString(raw.date || '2027-06-18', 20);
    const location = sanitizeString(raw.location || 'Private Villa Estate', 150);
    const guestCount = validateNumber(raw.guestCount, 5, 20000, 150);
    const budgetTotal = validateNumber(raw.budgetTotal, 1000, 50000000, 150000);
    const vibe = sanitizeString(raw.vibe || 'Editorial Haute Luxury', 300);
    const locationType = sanitizeString(raw.locationType || 'Estate Grounds', 100);
    const specialRequests = sanitizeString(raw.specialRequests || '', 400);

    const cacheKey = `plan:${title}:${type}:${budgetTotal}:${guestCount}:${vibe}:${locationType}`;
    const cachedPlan = responseCache.get(cacheKey);
    if (cachedPlan) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedPlan);
    }

    const customKey = req.headers['x-gemini-key'] as string | undefined;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Céleste, an editorial luxury event planning intelligence.
Generate a comprehensive, structured JSON event plan for a high-end celebration:
- Title: "${title}"
- Type: ${type}
- Target Date: ${date}
- Location: ${location} (${locationType})
- Guest Count: ${guestCount}
- Total Budget: $${budgetTotal} USD
- Aesthetic Vibe: "${vibe}"
- Special Client Requests: "${specialRequests}"

Return ONLY a valid JSON object matching this schema:
{
  "title": "${title}",
  "subtitle": "Editorial narrative description in 1 sentence",
  "type": "${type}",
  "date": "${date}",
  "location": "${location}",
  "guestCount": ${guestCount},
  "budgetTotal": ${budgetTotal},
  "currency": "USD",
  "themeDescription": "Deeply evocative 2-3 sentence description of the artistic and spatial theme",
  "palette": [
    { "name": "Color Name", "hex": "#HEX", "role": "Canvas" },
    { "name": "Color Name", "hex": "#HEX", "role": "Metallic" },
    { "name": "Color Name", "hex": "#HEX", "role": "Accent" },
    { "name": "Color Name", "hex": "#HEX", "role": "Floral" },
    { "name": "Color Name", "hex": "#HEX", "role": "Drape" }
  ],
  "sensoryMotifs": {
    "aroma": "Fragrance notes and botanicals",
    "lighting": "Kelvin temperature, candle illumination, architectural fixtures",
    "tactile": "Fabrics, paper stocks, tableware materials",
    "soundscape": "Acoustic musical pacing and live instrumentation"
  },
  "menuPairings": [
    { "course": "Course Title", "dish": "Dish Description", "wine": "Sommelier Wine Pairing", "notes": "Plating style" }
  ],
  "budgetItems": [
    {
      "id": "b-gen-1",
      "category": "Venue & Structure",
      "name": "Line item name",
      "plannedAmount": 40000,
      "committedAmount": 38000,
      "paidAmount": 19000,
      "status": "deposit_paid",
      "notes": "Contract details",
      "assignedTo": "Elena Vance"
    }
  ],
  "timeline": [
    {
      "id": "t-gen-1",
      "phase": "planning",
      "time": "6 Months Out",
      "title": "Milestone Title",
      "description": "Details",
      "ownerRole": "Lead Director",
      "status": "completed",
      "location": "Location"
    },
    {
      "id": "t-gen-2",
      "phase": "day_of",
      "time": "16:00",
      "title": "Day-of Schedule Item",
      "description": "Details",
      "ownerRole": "Host & VIP",
      "status": "pending",
      "location": "Location",
      "duration": "45 min"
    }
  ],
  "vendors": [
    {
      "id": "v-gen-1",
      "category": "Category",
      "companyName": "Atelier Name",
      "contactName": "Contact Person",
      "email": "contact@domain.com",
      "phone": "+1 (555) 000-0000",
      "costEstimate": 25000,
      "depositPaid": 12500,
      "contractStatus": "contract_signed",
      "notes": "Vendor deliverables summary",
      "tasks": [
        { "id": "vt-gen-1", "text": "Task description", "done": true }
      ]
    }
  ]
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as Record<string, unknown>;
        responseCache.set(cacheKey, parsed);
        res.setHeader('X-Cache', 'MISS');
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to intelligent generator:', geminiError);
      }
    }

    // Intelligent Fallback Generator if offline or no key
    const plan = generateFallbackEventPlan({
      title,
      type,
      date,
      location,
      guestCount,
      budgetTotal,
      vibe,
      locationType,
      specialRequests,
    });
    responseCache.set(cacheKey, plan);
    res.setHeader('X-Cache', 'MISS');
    return res.json(plan);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating event plan:', errorMsg);
    res.status(500).json({ error: 'Failed to generate event plan safely.' });
  }
});

// 2. POST /api/events/vendor-inquiry
app.post('/api/events/vendor-inquiry', async (req: Request, res: Response) => {
  try {
    const raw = req.body || {};
    const vendorName = sanitizeString(raw.vendorName || 'Esteemed Atelier', 100);
    const vendorCategory = sanitizeString(raw.vendorCategory || 'Spatial Floral Design', 80);
    const eventTitle = sanitizeString(raw.eventTitle || 'Private Celebration', 150);
    const eventDate = sanitizeString(raw.eventDate || 'Summer 2027', 40);
    const location = sanitizeString(raw.location || 'Private Villa', 100);
    const guestCount = validateNumber(raw.guestCount, 5, 20000, 150);
    const budgetEstimate = validateNumber(raw.budgetEstimate, 500, 10000000, 25000);
    const tone = ['editorial_luxury', 'polite_inquiry', 'contract_negotiation'].includes(raw.tone)
      ? raw.tone
      : 'editorial_luxury';
    const specificRequirements = sanitizeString(raw.specificRequirements || '', 500);

    const cacheKey = `inquiry:${vendorName}:${vendorCategory}:${tone}:${budgetEstimate}`;
    const cachedInquiry = responseCache.get(cacheKey);
    if (cachedInquiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedInquiry);
    }

    const customKey = req.headers['x-gemini-key'] as string | undefined;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Elena Vance, Lead Director at Céleste, composing a vendor inquiry.
Draft an inquiry with tone: "${tone}".
- Vendor: "${vendorName}" (${vendorCategory})
- Event: "${eventTitle}" on ${eventDate} at ${location}
- Guests: ${guestCount}
- Budget Allocation: $${budgetEstimate} USD
- Specific Needs: "${specificRequirements}"

Return ONLY a JSON object:
{
  "subject": "Email Subject Line",
  "body": "Formatted email body text"
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as Record<string, unknown>;
        responseCache.set(cacheKey, parsed);
        res.setHeader('X-Cache', 'MISS');
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini vendor inquiry failed, using fallback:', geminiError);
      }
    }

    const inquiry = generateFallbackVendorInquiry({
      vendorName,
      vendorCategory,
      eventTitle,
      eventDate,
      location,
      guestCount,
      budgetEstimate,
      tone,
      specificRequirements,
    });
    responseCache.set(cacheKey, inquiry);
    res.setHeader('X-Cache', 'MISS');
    return res.json(inquiry);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error drafting vendor inquiry:', errorMsg);
    res.status(500).json({ error: 'Failed to draft inquiry safely.' });
  }
});

// 3. POST /api/events/creative-ideas
app.post('/api/events/creative-ideas', async (req: Request, res: Response) => {
  try {
    const raw = req.body || {};
    const theme = sanitizeString(raw.theme || 'Architectural Minimalism', 100);
    const eventType = sanitizeString(raw.eventType || 'wedding', 50);
    const season = sanitizeString(raw.season || 'Autumn', 30);
    const venueType = sanitizeString(raw.venueType || 'Tuscan Stone Villa', 100);

    const cacheKey = `creative:${theme}:${eventType}:${venueType}:${season}`;
    const cachedIdeas = responseCache.get(cacheKey);
    if (cachedIdeas) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedIdeas);
    }

    const customKey = req.headers['x-gemini-key'] as string | undefined;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Creative Director Julian Ross at Céleste.
Brainstorm editorial luxury concepts:
- Theme: "${theme}" (${eventType})
- Season: ${season}
- Venue Type: ${venueType}

Return ONLY a JSON object:
{
  "conceptTitle": "${theme} — Haute Editorial Edition",
  "narrative": "A 2-sentence poetic description",
  "palette": [
    { "name": "Color 1", "hex": "#FAF8F5", "role": "Canvas" },
    { "name": "Color 2", "hex": "#B4863A", "role": "Metallic" },
    { "name": "Color 3", "hex": "#632B3B", "role": "Accent" },
    { "name": "Color 4", "hex": "#4A533C", "role": "Floral" },
    { "name": "Color 5", "hex": "#1C1917", "role": "Drape" }
  ],
  "sensoryMotifs": {
    "aroma": "Botanical notes",
    "lighting": "Atmospheric lighting spec",
    "tactile": "Linen, porcelain, stationery spec",
    "soundscape": "Acoustic and live score spec"
  },
  "menuConcepts": [
    { "course": "Twilight Arrival", "dish": "Dish name & components", "wine": "Sommelier pairing", "notes": "Plating" },
    { "course": "Plat Principal", "dish": "Dish name & components", "wine": "Sommelier pairing", "notes": "Plating" }
  ],
  "spatialInstallations": [
    "Floral or lighting installation 1",
    "Floral or lighting installation 2"
  ]
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as Record<string, unknown>;
        responseCache.set(cacheKey, parsed);
        res.setHeader('X-Cache', 'MISS');
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini creative ideas failed, using fallback:', err);
      }
    }

    const fallbackIdeas = {
      conceptTitle: `${theme} — Haute Editorial Edition`,
      narrative: `A bespoke intersection of classical architectural harmony and contemporary sensory theatre designed specifically for ${venueType} during ${season}.`,
      palette: [
        { name: 'Alabaster Silk', hex: '#FAF7F2', role: 'Canvas' },
        { name: 'Burnished Antique Bronze', hex: '#B4863A', role: 'Metallic' },
        { name: 'Smoked Fig Wine', hex: '#632B3B', role: 'Accent' },
        { name: 'Cypress Garland', hex: '#3B4836', role: 'Floral' },
        { name: 'Charcoal Linen', hex: '#23201E', role: 'Drape' },
      ],
      sensoryMotifs: {
        aroma: 'Crushed cedar needle, bitter Seville orange peel, and warm French taper beeswax',
        lighting: 'Soft 2100K incandescent amber illumination paired with directional pin-spots',
        tactile: 'Heavy washed raw silk, honed Carrara marble chargers, and 600gsm deckle stationery',
        soundscape: 'Fingerstyle nylon classical guitar opening into intimate live jazz quartet',
      },
      menuConcepts: [
        {
          course: 'Twilight Arrival',
          dish: 'Brioche Feuilletée with Duck Liver Mousse, Quince Gelée & Fleur de Sel',
          wine: 'Billecart-Salmon Brut Rosé Champagne',
          notes: 'Passed on antiqued bronze trays alongside herbal aperitifs',
        },
        {
          course: 'Plat Principal',
          dish: 'Slow-Poached Wild Turbot with Champagne Beurre Blanc, Sea Beans & Osetra Caviar',
          wine: '2020 Domaine Leflaive Puligny-Montrachet',
          notes: 'Plated on custom ceramic coupe plates with micro herbs',
        },
      ],
      spatialInstallations: [
        'Suspended cloud of bleached ruscus, wild garden roses, and pendant amber globes',
        'Floor-to-ceiling smoked antique mirror backdrops framing the ceremonial alter',
      ],
    };
    responseCache.set(cacheKey, fallbackIdeas);
    res.setHeader('X-Cache', 'MISS');
    return res.json(fallbackIdeas);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating creative ideas:', errorMsg);
    res.status(500).json({ error: 'Failed to generate creative concepts.' });
  }
});

// 4. POST /api/events/budget-advisor
app.post('/api/events/budget-advisor', async (req: Request, res: Response) => {
  try {
    const raw = req.body || {};
    const eventTitle = sanitizeString(raw.eventTitle || 'Event', 150);
    const eventType = sanitizeString(raw.eventType || 'wedding', 50);
    const budgetTotal = validateNumber(raw.budgetTotal, 1000, 50000000, 150000);
    const guestCount = validateNumber(raw.guestCount, 1, 20000, 150);
    const budgetItems: BudgetItemInput[] = Array.isArray(raw.budgetItems) ? raw.budgetItems : [];

    const totalCommitted = budgetItems.reduce((sum: number, item: BudgetItemInput) => sum + (Number(item.committedAmount) || 0), 0);
    const variance = totalCommitted - budgetTotal;

    const cacheKey = `advisor:${eventTitle}:${budgetTotal}:${totalCommitted}:${guestCount}`;
    const cachedAdvice = responseCache.get(cacheKey);
    if (cachedAdvice) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedAdvice);
    }

    const customKey = req.headers['x-gemini-key'] as string | undefined;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Céleste's Chief Financial Officer & Senior Event Fiduciary.
Analyze this luxury event budget:
- Event: "${eventTitle}" (${eventType})
- Total Planned Budget: $${budgetTotal}
- Total Committed so far: $${totalCommitted}
- Variance: $${variance}
- Guest Count: ${guestCount}
- Line Items:
${JSON.stringify(budgetItems.slice(0, 15), null, 2)}

Return ONLY a valid JSON object with summary, healthScore (0-100), varianceAlerts, costSavingLevers, negotiationPointers.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as Record<string, unknown>;
        responseCache.set(cacheKey, parsed);
        res.setHeader('X-Cache', 'MISS');
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini budget advisor failed, using fallback:', err);
      }
    }

    const isOver = variance > 0;
    const healthScore = Math.max(35, Math.min(98, Math.round(100 - (Math.abs(variance) / (budgetTotal || 1)) * 100)));

    const fallbackAnalysis = {
      summary: `The budget portfolio for "${eventTitle}" currently stands at ${isOver ? 'a $' + variance.toLocaleString() + ' variance over target' : 'a prudent $' + Math.abs(variance).toLocaleString() + ' surplus reserve'}. With ${guestCount} guests, commitments average $${Math.round(totalCommitted / (guestCount || 1))} per guest.`,
      healthScore,
      varianceAlerts: [
        {
          category: 'Catering & Spirits',
          planned: Math.round(budgetTotal * 0.28),
          committed: Math.round(totalCommitted * 0.32),
          risk: isOver ? 'high' : 'medium',
          advice: 'Transition late-night dessert courses to family-style passed platters to reduce plate rentals and dedicated service staff hours by 15%.',
        },
      ],
      costSavingLevers: [
        {
          title: 'Ceremony-to-Reception Floral Repurposing Protocol',
          potentialSaving: 3800,
          description: 'Instruct floral crew to transfer ceremony ground installations to the courtyard perimeter during cocktails.',
          tradeOff: 'Requires a 30-minute coordinated strike window while guests are on the terrace.',
        },
      ],
      negotiationPointers: [
        'Request a 5% prompt-pay discount for settling vendor balances via wire transfer 30 days ahead of schedule.',
        'Cap after-hours venue overtime rates at 1.25x standard hourly rate rather than standard 2.0x penalties.',
      ],
    };
    responseCache.set(cacheKey, fallbackAnalysis);
    res.setHeader('X-Cache', 'MISS');
    return res.json(fallbackAnalysis);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error analyzing budget:', errorMsg);
    res.status(500).json({ error: 'Failed to analyze budget safely.' });
  }
});

// SPA Fallback for client-side routing
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Centralized error handling
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  console.error('Unhandled server error:', errorMsg);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Helper Fallback Functions
function generateFallbackEventPlan(params: FallbackPlanParams) {
  const { title, type, date, location, guestCount, budgetTotal, vibe, locationType } = params;
  const isWedding = type === 'wedding';

  return {
    title: title || (isWedding ? 'The Grand Chateau Nuptials' : 'An Editorial Milestone Soirée'),
    subtitle: `An impeccably orchestrated celebration for ${guestCount} distinguished guests at ${location}`,
    type,
    date: date || '2027-09-18',
    location: location || 'Private Villa Estate & Gardens',
    guestCount: Number(guestCount) || 150,
    budgetTotal: Number(budgetTotal) || 160000,
    currency: 'USD',
    themeDescription: `Conceived with an aesthetic of "${vibe}". Natural limestone terraces, hand-pleated champagne silk drapery, and candlelit courtyard salons curated specifically for ${locationType || 'estate grounds'}.`,
    palette: [
      { name: 'Warm Alabaster', hex: '#FAF8F5', role: 'Canvas' },
      { name: 'Burnished Bronze Gold', hex: '#B4863A', role: 'Metallic' },
      { name: 'Dusky Rosewood', hex: '#9E6A65', role: 'Accent' },
      { name: 'Imperial Olive', hex: '#4A533C', role: 'Floral' },
      { name: 'Charcoal Silk', hex: '#1C1917', role: 'Drape' },
    ],
    sensoryMotifs: {
      aroma: 'Crushed cedar, Mediterranean neroli, and French hand-poured beeswax tapers',
      lighting: 'Low-kelvin (2200K) amber candlelight reflected through crystal flutes and dim brass sconces',
      tactile: 'Heavy washed raw silk runners, deckled handmade paper, and cool honed marble',
      soundscape: 'Acoustic cello and violin arrangements opening into a live Parisian jazz septet',
    },
    menuPairings: [
      {
        course: 'Cocktail Prelude',
        dish: 'Osetra Caviar Tartlets with Crème Fraîche and Chive Flowers',
        wine: 'Billecart-Salmon Brut Rosé Champagne',
        notes: 'Passed on antiqued silver trays',
      },
      {
        course: 'First Plated Course',
        dish: 'Heirloom Burrata with Roasted Mission Figs, Saba Glaze & Micro Basil',
        wine: '2021 Kistler Chardonnay, Sonoma Coast',
        notes: 'Served on custom hand-turned ceramic plates',
      },
    ],
    budgetItems: [
      {
        id: `b-${Date.now()}-1`,
        category: 'Venue & Structure',
        name: `${locationType || 'Estate'} Buyout, Grounds & Bridal Suites`,
        plannedAmount: Math.round(budgetTotal * 0.3),
        committedAmount: Math.round(budgetTotal * 0.3),
        paidAmount: Math.round(budgetTotal * 0.15),
        status: 'deposit_paid',
        notes: 'Includes 3-day access, private security, and overnight suites.',
        assignedTo: 'Elena Vance',
      },
      {
        id: `b-${Date.now()}-2`,
        category: 'Catering & Spirits',
        name: 'Plated 4-Course Gastronomy & Reserve Cellar Pouring',
        plannedAmount: Math.round(budgetTotal * 0.28),
        committedAmount: Math.round(budgetTotal * 0.29),
        paidAmount: Math.round(budgetTotal * 0.1),
        status: 'contracted',
        notes: `${guestCount} guests inclusive of cocktail reception and sommelier pairings.`,
        assignedTo: 'Siobhan Roy',
      },
    ],
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        phase: 'planning',
        time: '6 Months Out',
        title: 'Venue Buyout & Exclusive Permits Executed',
        description: 'Secured master venue agreement and vendor insurance policies.',
        ownerRole: 'Lead Director',
        status: 'completed',
        location: 'Estate Office',
      },
      {
        id: `t-${Date.now()}-2`,
        phase: 'day_of',
        time: '17:00',
        title: 'Guest Arrival & Champagne Prelude',
        description: 'Guests welcomed with vintage champagne and live acoustic strings.',
        ownerRole: 'Hospitality & Bar',
        status: 'pending',
        location: 'Terrace Fountain Lawn',
        duration: '45 min',
      },
    ],
    vendors: [
      {
        id: `v-${Date.now()}-1`,
        category: 'Estate Venue',
        companyName: `${location.split(',')[0]} Estate & Grounds`,
        contactName: 'Mathieu DeLaRue',
        email: 'concierge@estate-events.com',
        phone: '+1 (555) 392-8810',
        costEstimate: Math.round(budgetTotal * 0.3),
        depositPaid: Math.round(budgetTotal * 0.15),
        contractStatus: 'deposit_paid',
        notes: 'Load-in permitted 8 hours prior. Valet parking clearance secured.',
        tasks: [
          { id: 'vt-1', text: 'Confirm municipal sound curfew waiver', done: true },
        ],
      },
    ],
  };
}

function generateFallbackVendorInquiry(params: FallbackVendorInquiryParams) {
  const { vendorName, vendorCategory, eventTitle, eventDate, location, guestCount, budgetEstimate, tone, specificRequirements } = params;
  const salutation = tone === 'contract_negotiation'
    ? `Dear ${vendorName} Procurement & Management Team,`
    : `Dear ${vendorName} Atelier,`;

  const closing = tone === 'contract_negotiation'
    ? 'Respectfully,\nCéleste Executive Event Directorate\nOn behalf of the Host Committee'
    : 'Warmest regards,\nElena Vance · Lead Event Director\nCéleste Haute Event Orchestration';

  const subject = tone === 'contract_negotiation'
    ? `Contract Negotiation & Availability: ${eventTitle} (${eventDate}) · ${vendorName}`
    : `Inquiry: Private Celebration Orchestration — ${eventTitle} · ${eventDate}`;

  const body = `${salutation}

I hope this correspondence finds you well.

On behalf of our clients, we are curating an intimate celebration, "${eventTitle}", scheduled for ${eventDate} at ${location}. We have long admired your distinguished portfolio in ${vendorCategory.toLowerCase()} and would be honored to explore your participation in this bespoke orchestration.

Event Key Metrics:
· Date: ${eventDate}
· Location: ${location}
· Guest Count: ${guestCount} attendees
· Dedicated Allocation: Approximately $${Number(budgetEstimate).toLocaleString()} USD

${specificRequirements ? `Specific Creative & Logistical Directives:\n${specificRequirements}\n\n` : ''}Given the meticulous nature of our run-of-show, we would appreciate confirming your team's availability for this date. If your schedule permits, we would welcome a 15-minute introductory video conference next Tuesday or Wednesday.

Thank you for your time and artistry. We look forward to creating something unforgettable together.

${closing}`;

  return { subject, body };
}

// Start Server
app.listen(PORT, () => {
  console.log(`[Céleste Proxy] Secure high-efficiency server running on http://localhost:${PORT}`);
  console.log(`[Céleste Proxy] Security: Helmet CSP, Rate Limiting, Input Sanitization`);
  console.log(`[Céleste Proxy] Efficiency: Gzip Compression, In-Memory Response Caching, Asset Caching`);
});
