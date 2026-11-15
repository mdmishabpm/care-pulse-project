import React, { useId } from 'react';

const baseInputClass =
  'w-full mt-1 p-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error = null,
  required = false,
  placeholder = '',
  inputClassName = '',
  ...rest
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const borderClass = error ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300';

  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-bold text-slate-600">
        {label}
        {required && <span className="text-rose-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${borderClass} ${inputClassName}`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  error = null,
  className = ''
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const borderClass = error ? 'border-rose-500' : 'border-slate-300';

  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-bold text-slate-600">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${borderClass} ${className}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  name,
  value,
  onChange,
  rows = 2,
  error = null,
  placeholder = '',
  className = ''
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const borderClass = error ? 'border-rose-500' : 'border-slate-300';

  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-bold text-slate-600">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${borderClass} ${className}`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
