import { useCallback, useRef, useState } from 'react';
import { submitForm, ApiError } from '../lib/api.js';

/**
 * Shared form logic: values, client validation, a single in-flight submission,
 * server field errors, and honest success/error states.
 */
export function useFormSubmit({ initial, validate, endpoint }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');
  const [reference, setReference] = useState('');
  const startedAt = useRef(Date.now());
  const inFlight = useRef(false);
  const formRef = useRef(null);

  const setField = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (e) => setField(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value),
  });

  const focusFirstError = (errs) => {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (first) formRef.current?.querySelector(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return; // prevent duplicate submissions
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStatus('idle');
      focusFirstError(errs);
      return;
    }
    inFlight.current = true;
    setStatus('submitting');
    setServerError('');
    try {
      const honeypot = formRef.current?.querySelector('[name="website"]')?.value || '';
      const data = await submitForm(endpoint, { ...values, website: honeypot, formStartedAt: startedAt.current });
      setReference(data.reference);
      setStatus('success');
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {};
      if (fields && Object.keys(fields).length) {
        setErrors(fields);
        focusFirstError(fields);
      }
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  function reset() {
    setValues(initial);
    setErrors({});
    setStatus('idle');
    setServerError('');
    setReference('');
    startedAt.current = Date.now();
  }

  return { values, errors, status, serverError, reference, bind, setField, onSubmit, reset, formRef };
}
