import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    id,
    label,
    error,
    required = false,
    options = [],
    placeholder = 'Select an option',
    className = '',
    labelClassName = '',
    containerClassName = '',
    ...props
  },
  ref,
) {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={id}
          className={`form-label ${labelClassName}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'form-control',
          error ? 'form-control-error' : '',
          className,
        ].join(' ')}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
