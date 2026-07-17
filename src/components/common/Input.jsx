import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    required = false,
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
      <input
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
      />
      {error && (
        <p id={`${id}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
