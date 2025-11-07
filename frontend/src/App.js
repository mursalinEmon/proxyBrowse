import React, { useState, useEffect } from 'react';
import ProfileForm from './components/ProfileForm';
import ProfileList from './components/ProfileList';
import JobList from './components/JobList';
import { Tabs, Tab } from './components/Tabs';
import {
  getProfiles,
  launchProfile,
  getJobs,
  updateProfile,
  deleteProfile
} from './services/api';
import './components/styles.css';

const TAB_LABELS = {
  FORM: 'Create / Edit Profile',
  PROFILES: 'Profiles',
  JOBS: 'Jobs'
};

function App() {
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_LABELS.FORM);

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

  const upsertProfile = (profile) => {
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === profile.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = profile;
        return next;
      }
      return [...prev, profile];
    });
  };

  const handleProfileSaved = (profile) => {
    upsertProfile(profile);
    setEditingProfile(null);
    setActiveTab(TAB_LABELS.PROFILES);
  };

  const handleProfileUpdate = async (id, payload) => {
    const resp = await updateProfile(id, payload);
    upsertProfile(resp.data);
    return resp.data;
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setActiveTab(TAB_LABELS.PROFILES);
  };

  const handleStartEdit = (profile) => {
    setEditingProfile(profile);
    setActiveTab(TAB_LABELS.FORM);
  };

  const handleDelete = async (profileId) => {
    await deleteProfile(profileId);
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (editingProfile && editingProfile.id === profileId) {
      setEditingProfile(null);
    }
  };

  const handleLaunch = async (profileId) => {
    await launchProfile(profileId);
    fetchJobs();
  };

  const handleTabChange = (label) => {
    setActiveTab(label);
    if (label !== TAB_LABELS.FORM) {
      setEditingProfile(null);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#6a5acd', margin: '20px 0' }}>ProxyBrowse Dashboard</h1>
      <Tabs activeLabel={activeTab} onTabChange={handleTabChange}>
        <Tab label={TAB_LABELS.FORM}>
          <ProfileForm
            onCreated={handleProfileSaved}
            onUpdated={handleProfileUpdate}
            editingProfile={editingProfile}
            onCancelEdit={handleCancelEdit}
          />
        </Tab>
        <Tab label={TAB_LABELS.PROFILES}>
          <ProfileList
            profiles={profiles}
            onLaunch={handleLaunch}
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />
        </Tab>
        <Tab label={TAB_LABELS.JOBS}>
          <JobList jobs={jobs} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default App;
