import React from 'react';
import './styles.css';

function ProfileList({ profiles, onLaunch, onEdit, onDelete }) {
  return (
    <div className="profile-list">
      <h3>Profiles</h3>
      <ul>
        {profiles.map(p => (
          <li key={p.id}>
            <div className="profile-details">
              <strong>{p.name}</strong><br />
              Proxy: {p.proxy_type} {p.proxy_host}:{p.proxy_port}<br />
              Platform: {p.platform || 'none'} | IP Checker: {p.ip_checker}
            </div>
            <div className="button-group">
              <button onClick={() => onLaunch(p.id)}>Launch</button>
              <button className="secondary" onClick={() => onEdit?.(p)}>Edit</button>
              <button className="danger" onClick={() => onDelete?.(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfileList;
