import React, { useState } from 'react';

function ProfileForm({ onCreated }) {
  const [name, setName] = useState('');
  const [proxy, setProxy] = useState('');
  const [userAgent, setUserAgent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, proxy, user_agent: userAgent })
      });
      const json = await resp.json();
      onCreated(json);
      setName('');
      setProxy('');
      setUserAgent('');
    } catch (err) {
      console.error('Error creating profile', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Proxy" value={proxy} onChange={e => setProxy(e.target.value)} required />
      <input placeholder="User Agent" value={userAgent} onChange={e => setUserAgent(e.target.value)} />
      <button type="submit">Create Profile</button>
    </form>
  );
}

export default ProfileForm;
