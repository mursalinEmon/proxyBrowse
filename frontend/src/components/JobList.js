import React from 'react';
import './styles.css';

function JobList({ jobs }) {
  return (
    <div className="job-list">
      <h3>Jobs</h3>
      <ul>
        {jobs.map(j => (
          <li key={j.id} className="job-item">
            <span>Job #{j.id} for Profile #{j.profile_id}: {j.status}</span>
            <span>Result: {j.result}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobList;
