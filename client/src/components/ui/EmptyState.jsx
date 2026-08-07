import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📦', title, description, actionLabel, onAction, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-xl font-bold font-heading text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6 max-w-xs">{description}</p>}
      
      {actionLink ? (
        <Link to={actionLink} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <button onClick={onAction} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
