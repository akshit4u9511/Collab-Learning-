import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({
    filters,
    setFilters,
    allSkills,
    allLanguages,
    allExperienceLevels,
    onClearAll
}) => {
    const handleCheckboxChange = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const handleRatingChange = (e) => {
        setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }));
    };

    const handlePriceChange = (e) => {
        setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }));
    };

    const handleAvailabilityChange = (e) => {
        setFilters(prev => ({ ...prev, availability: e.target.value }));
    };

    return (
        <div className="filter-sidebar">
            <div className="filter-header">
                <h3>Filters</h3>
                <button className="clear-all-btn" onClick={onClearAll}>Clear All</button>
            </div>

            {/* Skills */}
            <div className="filter-section">
                <h4>Skills</h4>
                <div className="checkbox-group">
                    {allSkills.map(skill => (
                        <label key={skill} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filters.skills.includes(skill)}
                                onChange={() => handleCheckboxChange('skills', skill)}
                            />
                            {skill}
                        </label>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div className="filter-section">
                <h4>Minimum Rating ({filters.minRating} ⭐)</h4>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={handleRatingChange}
                    className="filter-slider"
                />
            </div>

            {/* Availability */}
            <div className="filter-section">
                <h4>Availability</h4>
                <select
                    value={filters.availability}
                    onChange={handleAvailabilityChange}
                    className="filter-select"
                >
                    <option value="Anytime">Anytime</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                </select>
            </div>

            {/* Experience Level */}
            <div className="filter-section">
                <h4>Experience Level</h4>
                <div className="checkbox-group">
                    {allExperienceLevels.map(level => (
                        <label key={level} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filters.experienceLevels.includes(level)}
                                onChange={() => handleCheckboxChange('experienceLevels', level)}
                            />
                            {level}
                        </label>
                    ))}
                </div>
            </div>

            {/* Languages */}
            <div className="filter-section">
                <h4>Languages</h4>
                <div className="checkbox-group">
                    {allLanguages.map(lang => (
                        <label key={lang} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filters.languages.includes(lang)}
                                onChange={() => handleCheckboxChange('languages', lang)}
                            />
                            {lang}
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
                <h4>Max Price (₹{filters.maxPrice})</h4>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.maxPrice}
                    onChange={handlePriceChange}
                    className="filter-slider"
                />
            </div>
        </div>
    );
};

export default FilterSidebar;
