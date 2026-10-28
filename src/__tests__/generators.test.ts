import { describe, it, expect } from 'vitest';
import { generateEventPlanApi, generateVendorInquiryApi, generateCreativeIdeasApi, generateBudgetAdvisorApi } from '../services/api';
import { BENCHMARK_EVENTS, DEFAULT_COLLABORATORS } from '../data/benchmarkEvents';

describe('Event & Fallback Generators Suite', () => {
  it('loads all 3 benchmark events with complete data structures', () => {
    expect(BENCHMARK_EVENTS).toHaveLength(3);

    const [wedding, birthday, gala] = BENCHMARK_EVENTS;
    expect(wedding.type).toBe('wedding');
    expect(birthday.type).toBe('birthday');
    expect(gala.type).toBe('community');

    BENCHMARK_EVENTS.forEach((event) => {
      expect(event.title).toBeTruthy();
      expect(event.guestCount).toBeGreaterThan(0);
      expect(event.budgetTotal).toBeGreaterThan(0);
      expect(event.palette.length).toBeGreaterThanOrEqual(3);
      expect(event.sensoryMotifs.aroma).toBeTruthy();
      expect(event.sensoryMotifs.lighting).toBeTruthy();
      expect(event.sensoryMotifs.tactile).toBeTruthy();
      expect(event.sensoryMotifs.soundscape).toBeTruthy();
      expect(event.menuPairings.length).toBeGreaterThanOrEqual(1);
      expect(event.budgetItems.length).toBeGreaterThanOrEqual(5);
      expect(event.timeline.length).toBeGreaterThanOrEqual(4);
      expect(event.vendors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('generates a full structured plan with budget items and timeline milestones', async () => {
    const plan = await generateEventPlanApi({
      title: 'Tuscan Renaissance Celebration',
      type: 'wedding',
      date: '2027-09-12',
      location: 'Florence, Italy',
      guestCount: 160,
      budgetTotal: 220000,
      vibe: 'Cypress hills, ancient stone, and opera',
      locationType: 'Historical Villa',
    });

    expect(plan.title).toBe('Tuscan Renaissance Celebration');
    expect(plan.guestCount).toBe(160);
    expect(plan.budgetTotal).toBe(220000);
    expect(plan.palette).toBeDefined();
    expect(plan.sensoryMotifs).toBeDefined();
    expect(plan.budgetItems && plan.budgetItems.length).toBeGreaterThan(0);
    expect(plan.timeline && plan.timeline.length).toBeGreaterThan(0);
    expect(plan.vendors && plan.vendors.length).toBeGreaterThan(0);
  });

  it('generates vendor outreach draft with correct tone cadence', async () => {
    // Editorial luxury tone
    const luxuryInquiry = await generateVendorInquiryApi({
      vendorName: 'Maison Flore Atelier',
      vendorCategory: 'Floral & Styling',
      eventTitle: 'The St. Clair Estate Wedding',
      eventDate: '2027-06-18',
      location: 'Napa Valley, CA',
      guestCount: 180,
      budgetEstimate: 39500,
      tone: 'editorial_luxury',
    });

    expect(luxuryInquiry.subject).toContain('The St. Clair Estate Wedding');
    expect(luxuryInquiry.body).toContain('Maison Flore Atelier');
    expect(luxuryInquiry.body).toContain('$39,500');

    // Contract negotiation tone
    const negotiationInquiry = await generateVendorInquiryApi({
      vendorName: 'Epicurean Haute Cuisine',
      vendorCategory: 'Fine Dining & Bar',
      eventTitle: 'The St. Clair Estate Wedding',
      eventDate: '2027-06-18',
      location: 'Napa Valley, CA',
      guestCount: 180,
      budgetEstimate: 64500,
      tone: 'contract_negotiation',
    });

    expect(negotiationInquiry.subject).toContain('Contract Negotiation');
    expect(negotiationInquiry.body).toContain('Procurement & Management Team');
  });

  it('generates creative ideas with palette, sensory motifs, and menu concepts', async () => {
    const creative = await generateCreativeIdeasApi({
      theme: 'Venetian Masquerade Soirée',
      eventType: 'birthday',
      season: 'Autumn',
    });

    expect(creative.conceptTitle).toBeTruthy();
    expect(creative.narrative).toBeTruthy();
    expect(creative.palette).toBeInstanceOf(Array);
    expect(creative.palette.length).toBeGreaterThan(0);
    expect(creative.sensoryMotifs.aroma).toBeTruthy();
  });

  it('generates budget advisor financial analysis with variance alerts and levers', async () => {
    const analysis = await generateBudgetAdvisorApi({
      eventTitle: 'The St. Clair Estate Wedding',
      eventType: 'wedding',
      budgetTotal: 245000,
      guestCount: 180,
      budgetItems: BENCHMARK_EVENTS[0].budgetItems,
    });

    expect(analysis.healthScore).toBeGreaterThanOrEqual(30);
    expect(analysis.healthScore).toBeLessThanOrEqual(100);
    expect(analysis.summary).toBeTruthy();
    expect(analysis.costSavingLevers.length).toBeGreaterThan(0);
    expect(analysis.negotiationPointers.length).toBeGreaterThan(0);
  });

  it('provides 5 active collaborators with valid initial personas', () => {
    expect(DEFAULT_COLLABORATORS).toHaveLength(5);
    const roles = DEFAULT_COLLABORATORS.map(c => c.role);
    expect(roles).toContain('Lead Event Director');
    expect(roles).toContain('Floral & Spatial Architect');
    expect(roles).toContain('Technical & Sound Producer');
    expect(roles).toContain('Hospitality & Sommelier Lead');
    expect(roles).toContain('Host & Creative Principal');
  });
});
