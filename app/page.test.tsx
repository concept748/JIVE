import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the greeting message', () => {
    render(<Home />);
    expect(screen.getByText(/Hi Chris!/i)).toBeInTheDocument();
  });

  it('renders the welcome description', () => {
    render(<Home />);
    expect(
      screen.getByText(/Welcome to the JIVE Dashboard/i),
    ).toBeInTheDocument();
  });

  it('renders the Next.js logo', () => {
    render(<Home />);
    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders the getting started instructions', () => {
    render(<Home />);
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
    expect(screen.getByText(/app\/page.tsx/i)).toBeInTheDocument();
  });
});
