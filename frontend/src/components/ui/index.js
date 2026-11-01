import React from 'react';

export const Button = ({ children, onClick, disabled, variant = 'primary', className = '', style = {} }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '14px',
  };

  const variants = {
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      '&:hover': { backgroundColor: '#2563eb' },
      '&:disabled': { backgroundColor: '#93c5fd', cursor: 'not-allowed' },
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #e5e7eb',
      '&:hover': { backgroundColor: '#e5e7eb' },
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1px solid #3b82f6',
      '&:hover': { backgroundColor: '#eff6ff' },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      '&:hover': { backgroundColor: '#f3f4f6' },
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      '&:hover': { backgroundColor: '#dc2626' },
    },
  };

  const mergedStyle = { ...baseStyles, ...variants[variant], ...style };

  return React.createElement(
    'button',
    {
      onClick,
      disabled,
      style: mergedStyle,
      className,
    },
    children
  );
};

export const Input = ({ value, onChange, placeholder, type = 'text', disabled, className = '', style = {} }) => {
  const baseStyles = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '&:disabled': {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
    },
  };

  return React.createElement('input', {
    type,
    value,
    onChange,
    placeholder,
    disabled,
    style: { ...baseStyles, ...style },
    className,
  });
};

export const Card = ({ children, style = {}, className = '' }) => {
  return React.createElement('div', {
    style: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
      ...style,
    },
    className,
  }, children);
};

export const List = ({ children, style = {} }) => {
  return React.createElement('div', {
    style: { ...style },
  }, children);
};

export const ListItem = ({ children, style = {} }) => {
  return React.createElement('div', {
    style: {
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      ...style,
    },
  }, children);
};

export const Avatar = ({ src, alt, size = '40px', style = {} }) => {
  return React.createElement('div', {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '600',
      flexShrink: 0,
      overflow: 'hidden',
      ...style,
    },
  }, src ? React.createElement('img', { src, alt, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : alt ? alt.substring(0, 2).toUpperCase() : '?');
};
