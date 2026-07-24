import axios from 'axios';

async function test() {
  const email = 'user_test_2346@example.com';
  const password = 'Password123!';
  const baseUrl = 'http://localhost:5000/api';

  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password });
    console.log('Login successful!');
    const token = loginRes.data.data.token;
    console.log('Token:', token);

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n--- Fetching Projects ---');
    try {
      const projRes = await axios.get(`${baseUrl}/projects`, { headers });
      console.log('Projects success:', projRes.data);
    } catch (err) {
      console.error('Projects failed with status:', err.response?.status);
      console.error('Projects error response:', err.response?.data);
    }

    console.log('\n--- Fetching Notifications ---');
    try {
      const notifRes = await axios.get(`${baseUrl}/notifications?limit=5&offset=0`, { headers });
      console.log('Notifications success:', notifRes.data);
    } catch (err) {
      console.error('Notifications failed with status:', err.response?.status);
      console.error('Notifications error response:', err.response?.data);
    }

    console.log('\n--- Creating Project (POST /api/projects) ---');
    try {
      const createRes = await axios.post(`${baseUrl}/projects`, {
        name: 'Test Project',
        key: 'TST',
        description: 'Test description'
      }, { headers });
      console.log('Create Project success:', createRes.data);
    } catch (err) {
      console.error('Create Project failed with status:', err.response?.status);
      console.error('Create Project error response:', err.response?.data);
    }

  } catch (err) {
    console.error('Login or General error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

test();
