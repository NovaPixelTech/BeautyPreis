import React from 'react';

export interface InputProps = {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export function Input({ placeholder = '', value, onChange, disabled = false }: InputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    />
  );
}

export interface ButtonProps = {
  variant?: 'default' | 'outline' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function Button({ variant = 'default', onClick, disabled = false, children }: ButtonProps) {
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 {variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      {children}
    </button>
  }
}

export interface AvatarProps = {
  className?: string;
  children: React.ReactNode;
};

export function Avatar({ className, children }: AvatarProps) {
  return (
    <div className={`h-10 w-10 rounded-full ${className}`}>
      {children}
    </div>
  }
}

export interface CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {children}
    </div>
  );
}

export interface ListProps = {
  className?: string;
  children: React.ReactNode;
};

export function List({ className, children }: ListProps) {
  return (
    <ul className={className || "divide-y divide-gray-100"}
  </ul>
);
}

export interface ListItemProps = {
  className?: string;
  children: React.ReactNode;
};

export function ListItem({ className, children }: ListItemProps) {
  return (
    <li className={className || "flex items-start py-2"}
  </li>
);
}