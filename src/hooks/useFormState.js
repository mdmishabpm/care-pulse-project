import { useState, useCallback } from 'react';

/**
 * Controlled form state hook with field updates, validation, and reset.
 */
export function useFormState(initialValues, validateFn = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type } = event.target;
    const parsed = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setField(name, parsed);
  }, [setField]);

  const validate = useCallback(() => {
    if (!validateFn) return true;
    const validationErrors = validateFn(values) || {};
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validateFn]);

  const reset = useCallback((nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    setValues,
    setErrors,
    setField,
    handleChange,
    validate,
    reset
  };
}
