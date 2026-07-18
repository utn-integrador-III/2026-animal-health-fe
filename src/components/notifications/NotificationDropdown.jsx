// src/components/notifications/NotificationDropdown.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClose 
}) => {
  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Notificaciones</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">🎉</span>
            <p>No tienes notificaciones nuevas</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onClose={onClose}
            />
          ))
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-2 text-center">
        <Link
          to="/notificaciones"
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Ver todas las notificaciones →
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;