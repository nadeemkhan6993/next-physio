/**
 * Unit tests for Select component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from '../Select';

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render with label', () => {
    render(<Select label="Choose" value="" onChange={() => {}} options={options} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('should display all options', () => {
    render(<Select label="Select" value="" onChange={() => {}} options={options} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should show selected value', () => {
    render(
      <Select 
        label="Select" 
        value="option2" 
        onChange={() => {}} 
        options={options} 
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('option2');
  });

  it('should call onChange when selection changes', () => {
    const handleChange = jest.fn();
    render(
      <Select 
        label="Select" 
        value="option1" 
        onChange={handleChange} 
        options={options} 
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option3' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should show error message when error prop is provided', () => {
    render(
      <Select 
        label="Select" 
        value="" 
        onChange={() => {}} 
        options={options}
        error="Selection is required" 
      />
    );
    expect(screen.getByText('Selection is required')).toBeInTheDocument();
  });

  it('should have required attribute when required prop is true', () => {
    render(
      <Select 
        label="Required Select" 
        value="" 
        onChange={() => {}} 
        options={options}
        required 
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeRequired();
  });

  it('should render all options', () => {
    render(
      <Select 
        label="Select" 
        value="" 
        onChange={() => {}} 
        options={options}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Select 
        label="Select" 
        value="" 
        onChange={() => {}} 
        options={options}
        disabled 
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});
