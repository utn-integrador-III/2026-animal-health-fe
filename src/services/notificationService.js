// src/services/notificationService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const getHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const getUserNotifications = async (onlyUnread = false, limit = 50, offset = 0) => {
  try {
    const headers = await getHeaders();
    const url = `${API_BASE_URL}/api/notifications/?only_unread=${onlyUnread}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, { headers });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.unread_count || 0;
  } catch (error) {
    console.error('Error al obtener conteo de no leídas:', error);
    return 0;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};