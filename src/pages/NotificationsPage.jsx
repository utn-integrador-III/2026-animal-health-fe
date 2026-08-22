// src/pages/NotificationsPage.jsx

import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const {
    notifications,
    unreadCount,
    loading,
    total,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    loadNotifications(newFilter === 'unread');
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando notificaciones...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔔 Notificaciones</h1>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones no leídas` : 'Todas las notificaciones están leídas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="unread">No leídas</option>
          </select>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <span className="text-6xl block mb-4">🎉</span>
          <h3 className="text-xl font-medium text-gray-700">No hay notificaciones</h3>
          <p className="text-gray-400 mt-2">Todo está al día con tus mascotas</p>
        </div>
      ) : (
        <div className="space-y-2 bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}

      {total > 0 && (
        <p className="text-sm text-gray-400 mt-4 text-center">
          Mostrando {notifications.length} de {total} notificaciones
        </p>
      )}
    </div>
  );
};

export default NotificationsPage;