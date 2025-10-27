import React from 'react';

function JobList({ jobs }) {
  return (
    <div>
      <h3>Jobs</h3>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>
            Job #{j.id} for Profile #{j.profile_id}: {j.status}
            <br />
            Result: {j.result}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobList;
