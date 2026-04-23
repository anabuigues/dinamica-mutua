'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-semantic-error font-body">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-600 font-body">{hint}</p>
      )}
    </div>
  )
}

export function Select({ label, error, hint, id, options, className = '', ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-input ${error ? 'error' : ''} ${className}`}
        {...props}
      >
        <option value="">Selecciona un área…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-semantic-error font-body">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-neutral-600 font-body">{hint}</p>
      )}
    </div>
  )
}
