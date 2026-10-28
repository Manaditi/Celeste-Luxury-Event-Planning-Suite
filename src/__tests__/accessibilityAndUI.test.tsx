import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';
import { EventProvider } from '../context/EventContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { TopBar } from '../components/layout/TopBar';
import { EventBanner } from '../components/layout/EventBanner';

describe('Accessibility & UI Structure Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders skip to main content link for keyboard accessibility', () => {
    render(<App />);
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('renders live screen reader announcer region', () => {
    render(<App />);
    const announcer = document.getElementById('a11y-announcer');
    expect(announcer).toBeInTheDocument();
    expect(announcer?.getAttribute('aria-live')).toBe('polite');
    expect(announcer?.getAttribute('aria-atomic')).toBe('true');
  });

  it('renders navigation tabs with accessible tablist role and aria-selected', () => {
    render(
      <EventProvider>
        <TopBar />
      </EventProvider>
    );

    const tablists = screen.getAllByRole('tablist');
    expect(tablists.length).toBeGreaterThan(0);

    const overviewTabs = screen.getAllByRole('tab', { name: /overview/i });
    expect(overviewTabs.length).toBeGreaterThan(0);
    expect(overviewTabs[0]).toBeInTheDocument();
    expect(overviewTabs[0].getAttribute('aria-selected')).toBe('true');

    const budgetTabs = screen.getAllByRole('tab', { name: /budget ledger/i });
    expect(budgetTabs.length).toBeGreaterThan(0);
    expect(budgetTabs[0].getAttribute('aria-selected')).toBe('false');
  });

  it('renders EventBanner with key performance metrics and unboxed metadata', () => {
    render(
      <EventProvider>
        <EventBanner />
      </EventProvider>
    );

    // Checks title heading
    const titleHeading = screen.getByRole('heading', { level: 1 });
    expect(titleHeading).toBeInTheDocument();
    expect(titleHeading.textContent).toContain('The St. Clair Estate Wedding');

    // Checks metric cards
    expect(screen.getByText(/budget portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/run-of-show milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/procurement & vendors/i)).toBeInTheDocument();
    expect(screen.getByText(/collaborative team/i)).toBeInTheDocument();
  });

  it('renders ErrorBoundary with recovery CTA when a component crashes', () => {
    const ProblemChild: React.FC = () => {
      throw new Error('Simulated testing crash');
    };

    // Suppress console error output for this expected test
    const consoleError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/workspace interruption/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recover and reload workspace/i })).toBeInTheDocument();

    console.error = consoleError;
  });
});
