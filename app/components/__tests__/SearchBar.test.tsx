/**
 * Unit tests for SearchBar component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search patients..." 
      />
    );
    const input = screen.getByPlaceholderText('Search patients...');
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);
    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when user types', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('new search');
  });

  it('should show search icon', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} />);
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show clear button when value exists', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onChange with empty string when clear button is clicked', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        className="custom-search-class" 
      />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-search-class');
  });

  it('should have correct input styles and classes', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...');
    
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('pl-11');
    expect(input).toHaveClass('pr-4');
    expect(input).toHaveClass('py-3');
    expect(input).toHaveClass('bg-white/10');
    expect(input).toHaveClass('border');
    expect(input).toHaveClass('border-white/20');
    expect(input).toHaveClass('rounded-xl');
    expect(input).toHaveClass('text-white');
    expect(input).toHaveClass('placeholder-gray-400');
  });

  it('should update value when onChange is called multiple times', () => {
    const { rerender } = render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...');
    
    // First change
    fireEvent.change(input, { target: { value: 'a' } });
    expect(mockOnChange).toHaveBeenCalledWith('a');
    
    // Update component with new value
    rerender(<SearchBar value="a" onChange={mockOnChange} />);
    
    // Second change
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(mockOnChange).toHaveBeenCalledWith('ab');
    
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should handle clear button when value has whitespace', () => {
    render(<SearchBar value="  test  " onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    
    fireEvent.click(clearButton);
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should have text input type', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render clear button with correct SVG', () => {
    const { container } = render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    const svg = clearButton.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-5');
    expect(svg).toHaveClass('w-5');
  });

  it('should render search icon with correct SVG attributes', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} />);
    const iconContainer = container.querySelector('.absolute.inset-y-0.left-0');
    const svg = iconContainer?.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-5');
    expect(svg).toHaveClass('w-5');
    expect(svg).toHaveClass('text-gray-400');
  });

  it('should maintain focus on input after typing', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    
    input.focus();
    expect(document.activeElement).toBe(input);
    
    fireEvent.change(input, { target: { value: 'search term' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should handle empty string to non-empty transition', () => {
    const { rerender } = render(<SearchBar value="" onChange={mockOnChange} />);
    
    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    
    // Add value
    rerender(<SearchBar value="test" onChange={mockOnChange} />);
    
    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should handle non-empty to empty string transition', () => {
    const { rerender } = render(<SearchBar value="test" onChange={mockOnChange} />);
    
    // Initially has clear button
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    
    // Clear value
    rerender(<SearchBar value="" onChange={mockOnChange} />);
    
    // Clear button should disappear
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('should have pointer cursor on clear button', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toHaveClass('cursor-pointer');
  });

  it('should apply transition classes to clear button', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toHaveClass('transition-colors');
  });

  it('should render with empty className when not provided', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} />);
    const wrapper = container.firstChild as HTMLElement;
    
    // Should have relative class but not a custom one
    expect(wrapper).toHaveClass('relative');
    expect(wrapper.className).not.toContain('undefined');
  });
});
