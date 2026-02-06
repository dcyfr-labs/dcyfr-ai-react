/**
 * Tests for Card component
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../../src/components/ui/card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<Card title="Title" description="A description">Content</Card>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<Card footer={<span>Footer text</span>}>Content</Card>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should render without title or description', () => {
    render(<Card>Just content</Card>);
    expect(screen.getByText('Just content')).toBeInTheDocument();
  });
});
