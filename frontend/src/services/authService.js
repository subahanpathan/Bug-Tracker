import api from './api';

export const authService = {
  register: (email, password, firstName, lastName) => {
    return api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
  },

  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },
};

export default authService;
