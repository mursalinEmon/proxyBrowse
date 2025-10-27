import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

export function getProfiles() {
  return api.get('/profiles');
}

export function createProfile(data) {
  return api.post('/profiles', data);
}

export function launchProfile(profileId) {
  return api.post('/jobs/launch', { profileId });
}

export function getJobs() {
  return api.get('/jobs');
}
