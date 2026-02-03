/**
 * Unit tests for Card component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with children even without title prop', () => {
    render(
      <Card>
        <div>Content</div>
      </Card>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Content</div>
      </Card>
    );
    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('should render multiple children', () => {
    render(
      <Card>
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('should render without title', () => {
    render(
      <Card>
        <div>Content only</div>
      </Card>
    );
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });
});
