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

export function checkProxy(data) {
  return api.post('/profiles/check-proxy', data);
}

export function updateProfile(id, data) {
  return api.put(`/profiles/${id}`, data);
}

export function deleteProfile(id) {
  return api.delete(`/profiles/${id}`);
}

export function launchProfile(profileId) {
  return api.post('/jobs/launch', { profileId });
}

export function getJobs() {
  return api.get('/jobs');
}
