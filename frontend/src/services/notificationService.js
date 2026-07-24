// Frontend notification service API client
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  async getUserNotifications(limit = 20, offset = 0) {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  }

  async getUnreadCount() {
    const response = await axios.get(`${API_URL}/notifications/unread/count`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data.count;
  }

  async markAsRead(notificationId) {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  }

  async markAllAsRead() {
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  }

  async deleteNotification(notificationId) {
    await axios.delete(`${API_URL}/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }

  async deleteAllNotifications() {
    await axios.delete(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }

  async getNotificationsByType(type, limit = 20) {
    const response = await axios.get(`${API_URL}/notifications/type/${type}`, {
      params: { limit },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  }
}

export default new NotificationService();
