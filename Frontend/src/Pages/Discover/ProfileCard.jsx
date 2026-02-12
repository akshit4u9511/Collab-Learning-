import React from 'react';
import { Link } from 'react-router-dom';
// We don't need to import Discover.css here because Discover.jsx already does.
// The styles will automatically apply.

const ProfileCard = ({ profileImageUrl, name, rating, bio, skills, username }) => {
  
  // Create a unique room ID for testing
  const testRoomId = `test-room-${username}`;

  return (
    <div className="profile-card">
      {/* Top Section: Photo, Name, Rating, Bio */}
      <div className="card-header-section">
        <img src={profileImageUrl} alt={name} className="profile-card-img" />
        <h3 className="profile-card-name">{name}</h3>
        <span className="profile-card-rating">RATING: {rating} ⭐</span>
        <p className="profile-card-bio">{bio}</p>
      </div>

      {/* Button Section: View Profile and Call */}
      <div className="card-buttons-section">
        <Link to={`/profile/${username}`} className="card-button profile-button">
          View Profile
        </Link>
        
        {/* --- THIS IS THE NEW CALL BUTTON --- */}
        <Link to={`/call/${testRoomId}`} className="card-button call-button">
          Call
        </Link>
        {/* ---------------------------------- */}

      </div>

      {/* Bottom Section: Skills */}
      <div className="card-skills-section">
        <span className="skills-title">SKILLS</span>
        <div className="skills-tags-container">
          {skills?.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;