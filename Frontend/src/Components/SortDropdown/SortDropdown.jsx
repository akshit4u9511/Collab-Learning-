import React from 'react';
import './SortDropdown.css';

const SortDropdown = ({ sortOption, setSortOption }) => {
    return (
        <div className="sort-container">
            <span className="sort-label">Sort by:</span>
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
            >
                <option value="Most Relevant">Most Relevant</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Most Sessions">Most Sessions</option>
                <option value="Newest First">Newest First</option>
                <option value="Alphabetical">Alphabetical</option>
            </select>
        </div>
    );
};

export default SortDropdown;
