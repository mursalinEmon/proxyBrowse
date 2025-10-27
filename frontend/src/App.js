import React, { useState, useEffect } from 'react';
import ProfileForm from './components/ProfileForm';
import ProfileList from './components/ProfileList';
import JobList from './components/JobList';
import { getProfiles, createProfile, launchProfile, getJobs } from './services/api';

function App() {
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);

  const fetchProfiles = async () => {
    const resp = await getProfiles();
    setProfiles(resp.data);
  };
  const fetchJobs = async () => {
    const resp = await getJobs();
    setJobs(resp.data);
  };

  useEffect(() => {
    fetchProfiles();
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = (newProf) => {
    setProfiles(prev => [...prev, newProf]);
  };

  const handleLaunch = async (profileId) => {
    await launchProfile(profileId);
    fetchJobs();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Proxy Browse MVP Dashboard</h1>
      <ProfileForm onCreated={handleCreate} />
      <ProfileList profiles={profiles} onLaunch={handleLaunch} />
      <JobList jobs={jobs} />
    </div>
  );
}

export default App;
