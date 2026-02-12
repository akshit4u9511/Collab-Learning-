import React from 'react';

// Simple search bar component that matches the styles
const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <input
        type="text"
        placeholder="Search users by name or skill..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          flex: 1,
          padding: '12px 15px',
          fontSize: '1rem',
          borderRadius: '20px 0 0 20px',
          border: 'none',
          outline: 'none',
        }}
      />
      <button style={{
        padding: '0 20px',
        borderRadius: '0 20px 20px 0',
        border: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
      }}>
        🔍
      </button>
    </div>
  );
};

export default Search;