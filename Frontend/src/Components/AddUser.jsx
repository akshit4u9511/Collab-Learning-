import React, { useState } from 'react';

// This component receives the function 'onAddSkill' from its parent
function AddUser({ onAddSkill }) {
  // 1. Local state for the skill input field
  const [skill, setSkill] = useState('');

  // 2. Handler for the button click
  const handleAddSkill = () => {
    // Basic validation: check if the skill is not empty after trimming
    if (skill.trim() !== '') {
      // Call the function passed from the parent component
      onAddSkill(skill.trim());
      // Clear the input field after adding
      setSkill('');
    } else {
      alert('Please enter a skill to add!');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #333', margin: '20px 0', borderRadius: '5px', backgroundColor: '#2e2e2e' }}>
      <h2>Add Your Skill</h2>
      <input
        type="text"
        placeholder="Enter a skill (e.g., React, Python)"
        value={skill}
        // 3. Update the local state on change
        onChange={(e) => setSkill(e.target.value)}
        style={{ padding: '10px', marginRight: '10px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: 'white' }}
      />
      <button 
        onClick={handleAddSkill}
        style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
      >
        Add Skill
      </button>
    </div>
  );
}

export default AddUser;