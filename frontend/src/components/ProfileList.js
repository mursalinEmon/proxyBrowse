import React from 'react';

function ProfileList({ profiles, onLaunch }) {
  return (
    <div>
      <h3>Profiles</h3>
      <ul>
        {profiles.map(p => (
          <li key={p.id}>
            {p.name} — {p.proxy}
            <button onClick={() => onLaunch(p.id)}>Launch</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfileList;
