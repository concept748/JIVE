import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Home from './page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Home Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the JIVE Dashboard heading', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        version: '0.1.2',
        timestamp: '2025-10-15T14:30:00.000Z',
      }),
    });

    render(<Home />);
    expect(screen.getByText('JIVE Dashboard')).toBeInTheDocument();
  });

  it('renders the Health Status section', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        version: '0.1.2',
        timestamp: '2025-10-15T14:30:00.000Z',
      }),
    });

    render(<Home />);
    expect(screen.getByText('Health Status')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep loading state
        }),
    );

    render(<Home />);
    expect(screen.getByText('Loading health status...')).toBeInTheDocument();
  });

  it('displays health data when fetch succeeds', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        version: '0.1.2',
        timestamp: '2025-10-15T14:30:00.000Z',
      }),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.getByText('0.1.2')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    render(<Home />);

    await waitFor(() => {
      const errorElements = screen.getAllByText('Health check failed');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('renders the Welcome to JIVE section', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        version: '0.1.2',
        timestamp: '2025-10-15T14:30:00.000Z',
      }),
    });

    render(<Home />);
    expect(screen.getByText('Welcome to JIVE')).toBeInTheDocument();
    expect(
      screen.getByText(/multi-agent development monitoring platform/i),
    ).toBeInTheDocument();
  });
});
