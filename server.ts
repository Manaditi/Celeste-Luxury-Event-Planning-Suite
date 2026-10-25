import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend files if built in dist/
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Helper to get GoogleGenAI client
function getGenAIClient(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({
    status: 'healthy',
    service: 'Céleste Event Orchestration API',
    hasApiKey: hasKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 1. POST /api/events/generate-plan
app.post('/api/events/generate-plan', async (req: Request, res: Response) => {
  try {
    const {
      title,
      type = 'wedding',
      date,
      location,
      guestCount = 150,
      budgetTotal = 150000,
      vibe = 'Editorial Haute Luxury',
      locationType = 'Estate Grounds',
      specialRequests = '',
    } = req.body;

    const customKey = req.headers['x-gemini-key'] as string;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Céleste, an editorial luxury event planning intelligence.
Generate a comprehensive, structured JSON event plan for a high-end celebration with these details:
- Title: "${title}"
- Type: ${type}
- Target Date: ${date}
- Location: ${location} (${locationType})
- Guest Count: ${guestCount}
- Total Budget: $${budgetTotal} USD
- Aesthetic Vibe: "${vibe}"
- Special Client Requests: "${specialRequests}"

Return ONLY a valid JSON object (no markdown code fences, no extra text) with this exact schema:
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
}

Provide 6-8 comprehensive budget items spanning Venue, Catering, Floral, Photo, Sound, Transport, and Contingency summing close to the budget total. Provide 4 planning milestones and 6 day-of schedule items. Provide 4-5 luxury vendors.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
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
    return res.json(plan);
  } catch (error: any) {
    console.error('Error generating event plan:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. POST /api/events/vendor-inquiry
app.post('/api/events/vendor-inquiry', async (req: Request, res: Response) => {
  try {
    const {
      vendorName,
      vendorCategory,
      eventTitle,
      eventDate,
      location,
      guestCount,
      budgetEstimate,
      tone = 'editorial_luxury',
      specificRequirements = '',
    } = req.body;

    const customKey = req.headers['x-gemini-key'] as string;
    const ai = getGenAIClient(customKey);

    const toneGuides = {
      editorial_luxury: 'Impeccably polished, poetic yet decisive haute couture event director tone. Conveys prestige and refined taste.',
      polite_inquiry: 'Gracious, collaborative, professional, and warmly welcoming initial inquiry.',
      contract_negotiation: 'Firm, highly experienced fiduciary tone emphasizing date exclusivity, deliverable milestones, and budget discipline.',
    };

    const prompt = `You are Céleste's Senior Procurement Director drafting an outreach correspondence to a high-end event vendor.
Parameters:
- Vendor: ${vendorName} (${vendorCategory})
- Event: "${eventTitle}"
- Date: ${eventDate}
- Venue/Location: ${location}
- Expected Guest Count: ${guestCount}
- Target Budget Allocation: $${budgetEstimate} USD
- Tone: ${toneGuides[tone as keyof typeof toneGuides] || toneGuides.editorial_luxury}
- Specific Requirements: "${specificRequirements}"

Generate:
1. A striking Subject Line
2. The complete Email Body, including salutation, event context, creative vision, specific scope questions, requested date holds, and next steps for proposal review.

Return ONLY a JSON object:
{
  "subject": "Subject Line Here",
  "body": "Formatted email body with line breaks..."
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const text = response.text || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return res.json(JSON.parse(cleaned));
      } catch (err) {
        console.warn('Gemini call failed for vendor inquiry, using fallback:', err);
      }
    }

    // Fallback response
    const fallback = generateFallbackVendorInquiry({
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
    return res.json(fallback);
  } catch (error: any) {
    console.error('Error generating vendor inquiry:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. POST /api/events/creative-ideas
app.post('/api/events/creative-ideas', async (req: Request, res: Response) => {
  try {
    const { theme, eventType, season = 'Autumn', venueType = 'Historical Estate', notes = '' } = req.body;
    const customKey = req.headers['x-gemini-key'] as string;
    const ai = getGenAIClient(customKey);

    const prompt = `You are Céleste's Artistic Creative Director. Brainstorm an exquisite, editorial creative concept package for:
Theme: "${theme}"
Type: ${eventType}
Season: ${season}
Venue: ${venueType}
Client Notes: "${notes}"

Return ONLY a JSON object:
{
  "conceptTitle": "Evocative Title",
  "narrative": "Poetic 3-sentence editorial vision statement",
  "palette": [
    { "name": "Name", "hex": "#HEX", "role": "Canvas" },
    { "name": "Name", "hex": "#HEX", "role": "Metallic" },
    { "name": "Name", "hex": "#HEX", "role": "Accent" },
    { "name": "Name", "hex": "#HEX", "role": "Floral" },
    { "name": "Name", "hex": "#HEX", "role": "Drape" }
  ],
  "sensoryMotifs": {
    "aroma": "Botanical scents, resins, and candle notes",
    "lighting": "Architectural lighting, kelvin warmth, and shadow interplay",
    "tactile": "Linens, paper grain, stone, metallics",
    "soundscape": "Acoustic orchestration and sonic ambiance"
  },
  "menuConcepts": [
    { "course": "Arrival", "dish": "Dish concept", "wine": "Wine pairing", "notes": "Table styling" },
    { "course": "Plat Principal", "dish": "Dish concept", "wine": "Wine pairing", "notes": "Presentation" },
    { "course": "Dessert & Finale", "dish": "Dish concept", "wine": "Pairing", "notes": "Sensory note" }
  ],
  "spatialInstallations": [
    "Sculptural suspended ceiling floral cloud",
    "Mirrored reflection table runways",
    "Monolithic stone escort card plinth"
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
        return res.json(JSON.parse(cleaned));
      } catch (err) {
        console.warn('Gemini creative ideas failed, using fallback:', err);
      }
    }

    // Fallback creative ideas
    return res.json({
      conceptTitle: `${theme} — Haute Editorial Edition`,
      narrative: `A bespoke intersection of classical architectural harmony and contemporary sensory theatre. Designed specifically for ${venueType} during ${season}, the ambiance balances muted natural textures with reflective bronze accents and an unhurried, ceremonial tempo.`,
      palette: [
        { name: 'Alabaster Silk', hex: '#FAF7F2', role: 'Canvas' },
        { name: 'Burnished Antique Bronze', hex: '#B4863A', role: 'Metallic' },
        { name: 'Smoked Fig Wine', hex: '#632B3B', role: 'Accent' },
        { name: 'Cypress Garland', hex: '#3B4836', role: 'Floral' },
        { name: 'Charcoal Linen', hex: '#23201E', role: 'Drape' },
      ],
      sensoryMotifs: {
        aroma: 'Crushed cedar needle, bitter Seville orange peel, and warm French taper beeswax',
        lighting: 'Soft 2100K incandescent amber illumination paired with directional pin-spots on floral centers',
        tactile: 'Heavy washed raw silk, honed Carrara marble chargers, and 600gsm deckle stationery',
        soundscape: 'Fingerstyle nylon classical guitar opening into intimate live jazz quartet and acoustic bass',
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
        {
          course: 'Midnight Reverie',
          dish: 'Dark Chocolate Ganache Tartlet with Smoked Sea Salt and Espresso Crema',
          wine: 'Taylor Fladgate 20 Year Old Tawny Port',
          notes: 'Served in the lounge alongside single-origin pour-overs',
        },
      ],
      spatialInstallations: [
        'Suspended cloud of bleached ruscus, wild garden roses, and pendant amber globes',
        'Floor-to-ceiling smoked antique mirror backdrops framing the ceremonial alter',
        'Hand-carved limestone pedestals anchoring the bespoke guest escort installation',
      ],
    });
  } catch (error: any) {
    console.error('Error generating creative ideas:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 4. POST /api/events/budget-advisor
app.post('/api/events/budget-advisor', async (req: Request, res: Response) => {
  try {
    const { eventTitle, eventType, budgetTotal, guestCount, budgetItems = [] } = req.body;
    const customKey = req.headers['x-gemini-key'] as string;
    const ai = getGenAIClient(customKey);

    const totalCommitted = budgetItems.reduce((sum: number, item: any) => sum + (item.committedAmount || 0), 0);
    const variance = totalCommitted - budgetTotal;

    const prompt = `You are Céleste's Chief Financial Officer & Senior Event Fiduciary.
Analyze this luxury event budget:
- Event: "${eventTitle}" (${eventType})
- Total Planned Budget: $${budgetTotal}
- Total Committed so far: $${totalCommitted}
- Variance: $${variance} (${variance > 0 ? 'Over budget' : 'Under budget'})
- Guest Count: ${guestCount}
- Line Items:
${JSON.stringify(budgetItems, null, 2)}

Provide an intelligent, fiduciary analysis with actionable cost-saving levers and vendor negotiation strategies.
Return ONLY a valid JSON object:
{
  "summary": "Executive 2-3 sentence overview of budget health, risk exposure, and per-guest variance",
  "healthScore": 85,
  "varianceAlerts": [
    {
      "category": "Catering & Spirits",
      "planned": 50000,
      "committed": 55000,
      "risk": "medium",
      "advice": "Specific negotiation or scope recalibration lever"
    }
  ],
  "costSavingLevers": [
    {
      "title": "Strategy Name",
      "potentialSaving": 4500,
      "description": "How to execute",
      "tradeOff": "Aesthetic or experiential implication"
    }
  ],
  "negotiationPointers": [
    "Specific contract clause or payment schedule tactic",
    "In-kind corkage waiver or overtime fee cap negotiation"
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
        return res.json(JSON.parse(cleaned));
      } catch (err) {
        console.warn('Gemini budget advisor failed, using fallback:', err);
      }
    }

    // Fallback budget advisor analysis
    const isOver = variance > 0;
    const healthScore = Math.max(30, Math.min(98, Math.round(100 - (Math.abs(variance) / budgetTotal) * 100)));

    return res.json({
      summary: `The budget portfolio for "${eventTitle}" currently stands at ${isOver ? 'a $' + variance.toLocaleString() + ' variance over target' : 'a prudent $' + Math.abs(variance).toLocaleString() + ' surplus reserve'}. With ${guestCount} guests, your current commitment translates to $${Math.round(totalCommitted / (guestCount || 1))} per guest. Fiduciary exposure is concentrated in Catering and Floral installations.`,
      healthScore,
      varianceAlerts: [
        {
          category: 'Catering & Spirits',
          planned: Math.round(budgetTotal * 0.28),
          committed: Math.round(totalCommitted * 0.32),
          risk: isOver ? 'high' : 'medium',
          advice: 'Transition midnight dessert courses to family-style passed platters to reduce plate rentals and dedicated service staff hours by 15%.',
        },
        {
          category: 'Floral & Spatial Decor',
          planned: Math.round(budgetTotal * 0.18),
          committed: Math.round(totalCommitted * 0.2),
          risk: 'medium',
          advice: 'Repurpose the ceremony floral arch and entrance urns into head table backdrops during the cocktail hour transition.',
        },
      ],
      costSavingLevers: [
        {
          title: 'Ceremony-to-Reception Floral Repurposing Protocol',
          potentialSaving: 3800,
          description: 'Instruct floral crew to transfer ceremony ground installations to the courtyard perimeter during guest cocktails.',
          tradeOff: 'Requires a 30-minute coordinated strike window while guests are on the terrace.',
        },
        {
          title: 'Direct Sommelier Wine Procurement & Corkage Cap',
          potentialSaving: 5200,
          description: 'Purchase allocated Grand Cru vintages through licensed wholesale distributors and negotiate a flat $25/bottle corkage cap.',
          tradeOff: 'Requires upfront payment and insurance on transport logistics.',
        },
        {
          title: 'Audio/Visual Shared Backline Rider',
          potentialSaving: 2400,
          description: 'Share acoustic PA and sound console between the cocktail jazz quartet and the evening dance band.',
          tradeOff: 'Requires tight soundcheck synchronization before guest arrival at 15:00.',
        },
      ],
      negotiationPointers: [
        'Request a 5% prompt-pay discount for settling vendor balances via wire transfer 30 days ahead of schedule.',
        'Cap after-hours venue overtime rates at 1.25x standard hourly rate rather than standard 2.0x penalties.',
        'Request complimentary bridal salon suite day-of amenities as a contract signing incentive.',
      ],
    });
  } catch (error: any) {
    console.error('Error analyzing budget:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper Fallback Functions
function generateFallbackEventPlan(params: any) {
  const { title, type, date, location, guestCount, budgetTotal, vibe, locationType } = params;
  const isWedding = type === 'wedding';
  const isBirthday = type === 'birthday';

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
      {
        course: 'Main Entrée',
        dish: 'Prime Dry-Aged Beef Tenderloin with Morel Reduction & Pomme Purée',
        wine: '2019 Silver Oak Cabernet Sauvignon, Napa Valley',
        notes: 'Carved table-side with rosemary sea salt',
      },
      {
        course: 'Confection & Finale',
        dish: 'Madagascan Vanilla Bean & Wild Blackberry Mille-Feuille',
        wine: 'Château d’Yquem Sauternes',
        notes: 'Paired with handcrafted espresso bar and digestive cocktails',
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
        notes: `${guestCount} guests inclusive of cocktail reception, sommelier pairings, and midnight bites.`,
        assignedTo: 'Siobhan Roy',
      },
      {
        id: `b-${Date.now()}-3`,
        category: 'Floral & Spatial Decor',
        name: 'Suspended Ceiling Canopy & Bespoke Table Installations',
        plannedAmount: Math.round(budgetTotal * 0.17),
        committedAmount: Math.round(budgetTotal * 0.17),
        paidAmount: Math.round(budgetTotal * 0.08),
        status: 'deposit_paid',
        notes: 'Imported garden blooms, botanical garlands, and 300 taper candles.',
        assignedTo: 'Julian Ross',
      },
      {
        id: `b-${Date.now()}-4`,
        category: 'Photography & Cinema',
        name: 'Editorial Dual-Format (35mm Film + 4K Cinema) Directors',
        plannedAmount: Math.round(budgetTotal * 0.1),
        committedAmount: Math.round(budgetTotal * 0.1),
        paidAmount: Math.round(budgetTotal * 0.05),
        status: 'contracted',
        notes: 'Full weekend coverage, drone cinematography, and leather archival albums.',
        assignedTo: 'Elena Vance',
      },
      {
        id: `b-${Date.now()}-5`,
        category: 'Entertainment & Sound',
        name: 'Ceremony Acoustic Ensemble & 8-Piece Evening Brass Collective',
        plannedAmount: Math.round(budgetTotal * 0.09),
        committedAmount: Math.round(budgetTotal * 0.085),
        paidAmount: Math.round(budgetTotal * 0.04),
        status: 'contracted',
        notes: 'Complete sound engineering, acoustic tuning, and evening DJ afterparty.',
        assignedTo: 'Marcus Croft',
      },
      {
        id: `b-${Date.now()}-6`,
        category: 'Contingency & Fees',
        name: 'Municipal Permits, Weather Reserve & Fiduciary Contingency',
        plannedAmount: Math.round(budgetTotal * 0.06),
        committedAmount: Math.round(budgetTotal * 0.02),
        paidAmount: 0,
        status: 'budgeted',
        notes: 'Reserve fund for unforeseen logistical adjustments or weather cover.',
        assignedTo: 'Elena Vance',
      },
    ],
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        phase: 'planning',
        time: '6 Months Out',
        title: 'Venue Buyout & Exclusive Permits Executed',
        description: 'Secured master venue agreement, noise curfew permits, and vendor insurance policies.',
        ownerRole: 'Lead Director',
        status: 'completed',
        location: 'Estate Office',
      },
      {
        id: `t-${Date.now()}-2`,
        phase: 'planning',
        time: '3 Months Out',
        title: 'Gastronomy Tasting & Floral Mockup Review',
        description: 'Tasting of 4-course menu with wine pairings and centerpiece lighting check.',
        ownerRole: 'Hospitality & Bar',
        status: 'in_progress',
        location: 'Tasting Studio',
      },
      {
        id: `t-${Date.now()}-3`,
        phase: 'day_of',
        time: '14:00',
        title: 'Vendor Load-In & Audio Array Calibration',
        description: 'Sound engineering check, acoustic speaker delay sync, and floral rigging.',
        ownerRole: 'A/V & Sound',
        status: 'pending',
        location: 'Courtyard & Pavilion',
        duration: '120 min',
      },
      {
        id: `t-${Date.now()}-4`,
        phase: 'day_of',
        time: '17:00',
        title: 'Guest Arrival & Champagne Prelude',
        description: 'Guests welcomed with vintage champagne and live acoustic strings.',
        ownerRole: 'Hospitality & Bar',
        status: 'pending',
        location: 'Terrace Fountain Lawn',
        duration: '45 min',
      },
      {
        id: `t-${Date.now()}-5`,
        phase: 'day_of',
        time: '18:00',
        title: 'Main Ceremony / Grand Toast Presentation',
        description: 'Centerpiece ceremony followed by celebratory remarks under candlelight.',
        ownerRole: 'Host & VIP',
        status: 'pending',
        location: 'Grand Lawn',
        duration: '40 min',
      },
      {
        id: `t-${Date.now()}-6`,
        phase: 'day_of',
        time: '19:30',
        title: 'Plated 4-Course Dinner Service & Wine Flow',
        description: 'Sommelier pours reserve vintages as courses are plated with synchronized service.',
        ownerRole: 'Hospitality & Bar',
        status: 'pending',
        location: 'Dining Pavilion',
        duration: '100 min',
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
          { id: 'vt-2', text: 'Finalize generator tie-in location', done: false },
        ],
      },
      {
        id: `v-${Date.now()}-2`,
        category: 'Haute Gastronomy',
        companyName: 'Epicurean Reserve Catering',
        contactName: 'Executive Chef Antoine Mercier',
        email: 'antoine@epicureanreserve.com',
        phone: '+1 (555) 774-1290',
        costEstimate: Math.round(budgetTotal * 0.28),
        depositPaid: Math.round(budgetTotal * 0.1),
        contractStatus: 'contract_signed',
        notes: 'Menu tasting approved. Sommelier pairing selection finalized.',
        tasks: [
          { id: 'vt-3', text: 'Submit final guest allergy count', done: false },
          { id: 'vt-4', text: 'Approve custom printed menu design', done: true },
        ],
      },
      {
        id: `v-${Date.now()}-3`,
        category: 'Floral & Spatial Design',
        companyName: 'Maison Flore Atelier',
        contactName: 'Camille Monet',
        email: 'camille@maisonflore.com',
        phone: '+1 (555) 912-3301',
        costEstimate: Math.round(budgetTotal * 0.17),
        depositPaid: Math.round(budgetTotal * 0.08),
        contractStatus: 'deposit_paid',
        notes: 'Refrigerated flower shipment scheduled to arrive day before event.',
        tasks: [
          { id: 'vt-5', text: 'Review table mock-up photos with client', done: true },
          { id: 'vt-6', text: 'Verify ceiling truss weight capacities', done: true },
        ],
      },
    ],
  };
}

function generateFallbackVendorInquiry(params: any) {
  const {
    vendorName,
    vendorCategory,
    eventTitle,
    eventDate,
    location,
    guestCount,
    budgetEstimate,
    tone,
    specificRequirements,
  } = params;

  const toneSalutation = tone === 'contract_negotiation'
    ? `Dear ${vendorName} Procurement & Management Team,`
    : `Dear ${vendorName} Atelier,`;

  const toneClosing = tone === 'contract_negotiation'
    ? 'Respectfully,\nCéleste Executive Event Directorate\nOn behalf of the Host Committee'
    : 'Warmest regards,\nElena Vance · Lead Event Director\nCéleste Haute Event Orchestration';

  const subject = tone === 'contract_negotiation'
    ? `Contract Negotiation & Availability: ${eventTitle} (${eventDate}) · ${vendorName}`
    : `Inquiry: Private Celebration Orchestration — ${eventTitle} · ${eventDate}`;

  const body = `${toneSalutation}

I hope this correspondence finds you well.

On behalf of our clients, we are curating an intimate celebration, "${eventTitle}", scheduled for ${eventDate} at ${location}. We have long admired your distinguished portfolio in ${vendorCategory.toLowerCase()} and would be honored to explore your participation in this bespoke orchestration.

Event Key Metrics:
· Date: ${eventDate}
· Location: ${location}
· Guest Count: ${guestCount} attendees
· Dedicated Allocation: Approximately $${Number(budgetEstimate).toLocaleString()} USD

${specificRequirements ? `Specific Creative & Logistical Directives:\n${specificRequirements}\n\n` : ''}Given the meticulous nature of our run-of-show, we would appreciate confirming your team's availability for this date, along with your current lookbook and preliminary pricing schedule for this tier. If your schedule permits, we would welcome a 15-minute introductory video conference next Tuesday or Wednesday.

Thank you for your time and artistry. We look forward to creating something unforgettable together.

${toneClosing}`;

  return { subject, body };
}

// SPA Fallback for client-side routing
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Céleste Proxy] Server running on http://localhost:${PORT}`);
  console.log(`[Céleste Proxy] Gemini proxy endpoints active on /api/events/*`);
});
