import React from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  options?: MultiSelectOption[];
}

export default function MultiSelect({
  label,
  value,
  onChange,
  placeholder = 'Type and press Enter',
  error,
  disabled = false,
  options,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const handleSelectOption = (optionValue: string) => {
    if (disabled) return;
    if (!value.includes(optionValue)) {
      onChange([...value, optionValue]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const removeItem = (item: string) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== item));
  };

  const availableOptions = options?.filter(opt => !value.includes(opt.value)) || [];

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
        </label>
      )}
      <div
        className={`border rounded-lg p-2 ${
          disabled 
            ? 'bg-gray-100 border-gray-300' 
            : 'bg-white/5 border-white/10 focus-within:border-blue-500'
        } ${error ? 'border-red-500' : ''}`}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <span
              key={item}
              className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-500/30"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="text-blue-300 hover:text-blue-100 font-bold"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (options && e.target.value) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => options && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-2 py-1 outline-none text-white bg-transparent placeholder-gray-400 disabled:text-gray-500"
          />
          {options && showDropdown && availableOptions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {availableOptions
                .filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                .map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-500/20 text-gray-200 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
