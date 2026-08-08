// src/components/notifications/NotificationItem.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkAsRead, onClose }) => {
  const { id, title, message, read, urgency, created_at, link } = notification;

  const getUrgencyColor = () => {
    switch (urgency) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getIcon = () => {
    switch (urgency) {
      case 'urgent': return '🚨';
      case 'warning': return '⚠️';
      default: return '💉';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recientemente';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`border-l-4 p-4 hover:bg-gray-50 transition-colors ${!read ? getUrgencyColor() : 'border-gray-300'}`}>
      <Link to={link || '#'} onClick={onClose} className="block">
        <div className="flex items-start gap-3">
          <span className="text-xl">{getIcon()}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!read ? 'font-semibold' : ''}`}>{title}</p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message}</p>
            <p className="text-xs text-gray-400 mt-1">{getTimeAgo(created_at)}</p>
          </div>
          {!read && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onMarkAsRead(id);
              }}
              className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
            >
              ✓
            </button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default NotificationItem;