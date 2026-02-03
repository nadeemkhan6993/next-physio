/**
 * Unit tests for Input component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('should render with label', () => {
    render(<Input label="Username" value="" onChange={() => {}} />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should display value', () => {
    render(<Input label="Email" value="test@example.com" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test@example.com');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Name" value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'John' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show error message when error prop is provided', () => {
    render(
      <Input 
        label="Email" 
        value="" 
        onChange={() => {}} 
        error="Email is required" 
      />
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should have required attribute when required prop is true', () => {
    render(<Input label="Password" value="" onChange={() => {}} required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should apply different input types', () => {
    const { rerender } = render(
      <Input label="Email" type="email" value="" onChange={() => {}} />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    
    rerender(<Input label="Password" type="password" value="" onChange={() => {}} />);
    const inputs = document.querySelectorAll('input');
    const passwordInput = Array.from(inputs).find(input => input.type === 'password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show placeholder', () => {
    render(
      <Input 
        label="Username" 
        value="" 
        onChange={() => {}} 
        placeholder="Enter username" 
      />
    );
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input label="Field" value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
