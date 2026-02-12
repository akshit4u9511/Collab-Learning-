import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Discover.css";
import { dummyUsers } from "../../util/dummyData";
import FilterSidebar from "../../Components/FilterSidebar/FilterSidebar";
import SortDropdown from "../../Components/SortDropdown/SortDropdown";

// --- UserCard Component ---
const UserCard = ({ user, viewMode }) => {
  const testRoomId = `test-room-${user.username}`;

  return (
    <div className={`user-card ${viewMode}`}>
      <div className="card-header">
        <img src={user.picture} alt={user.name} className="card-picture" />
        <div className="card-header-info">
          <h3 className="card-name">{user.name}</h3>
          <div className="card-meta">
            <span className="card-rating">⭐ {user.rating}</span>
            <span className="card-sessions">{user.sessionsCompleted} sessions</span>
            <span className="card-level">{user.experienceLevel}</span>
          </div>
          <p className="card-description">{user.description}</p>
        </div>
      </div>

      <div className="card-skills">
        <div className="skills-tags">
          {user.skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
          {user.skills.length > 4 && <span className="skill-tag">+{user.skills.length - 4} more</span>}
        </div>
      </div>

      <div className="card-footer">
        <div className="card-price">
          ₹{user.price}/session
        </div>
        <div className="card-buttons">
          <Link to={`/profile/${user.username}`} className="card-btn profile-btn">
            View Profile
          </Link>
          <Link to={`/call/${testRoomId}`} className="card-btn call-btn">
            Call
          </Link>
        </div>
      </div>
    </div>
  );
};

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortOption, setSortOption] = useState("Most Relevant");
  const [showFilters, setShowFilters] = useState(false); // For mobile
  const [searchMode, setSearchMode] = useState("classic"); // classic or ai
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAISearch = () => {
    if (!searchTerm.trim()) return;
    setAiAnalysis(null);
    setIsAnalyzing(true);

    setTimeout(() => {
      setAiAnalysis(`SkillBot found high-quality matches for your goal: "${searchTerm}"`);
      setIsAnalyzing(false);
    }, 1200);
  };

  const aiKeywords = {
    "web": ["React", "Node.js", "HTML", "CSS", "Javascript", "Express", "MongoDB"],
    "website": ["React", "Node.js", "HTML", "CSS", "Javascript", "Express", "MongoDB"],
    "app": ["React", "Node.js", "React Native", "Firebase"],
    "backend": ["Node.js", "Express", "Python", "Django", "Flask", "SQL", "Kubernetes", "AWS"],
    "frontend": ["React", "HTML", "CSS", "Javascript", "Figma"],
    "mobile": ["React Native", "Firebase"],
    "data science": ["Python", "TensorFlow", "PyTorch", "NLP", "Pandas", "SQL", "Tableau"],
    "machine learning": ["Python", "TensorFlow", "PyTorch", "NLP", "Machine Learning"],
    "ml": ["Python", "TensorFlow", "PyTorch", "NLP", "Machine Learning"],
    "ai": ["Python", "TensorFlow", "PyTorch", "NLP"],
    "design": ["Figma", "Sketch", "Prototyping", "User Research"],
    "devops": ["AWS", "Docker", "Terraform", "CI/CD", "Kubernetes"]
  };

  const initialFilters = {
    skills: [],
    minRating: 0,
    availability: "Anytime",
    experienceLevels: [],
    languages: [],
    maxPrice: 100
  };

  const [filters, setFilters] = useState(initialFilters);

  // Derived data for filters
  const allSkills = useMemo(() => {
    const skills = new Set();
    dummyUsers.forEach(u => u.skills.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, []);

  const allLanguages = useMemo(() => {
    const langs = new Set();
    dummyUsers.forEach(u => u.languages.forEach(l => langs.add(l)));
    return Array.from(langs).sort();
  }, []);

  const allExperienceLevels = ["Beginner", "Intermediate", "Expert"];

  // Load recent searches
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(saved);
  }, []);

  const handleSearch = (term) => {
    const query = term || searchTerm;
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  const clearAllFilters = () => setFilters(initialFilters);

  const removeFilterChip = (category, value) => {
    setFilters(prev => {
      if (typeof prev[category] === 'string' || typeof prev[category] === 'number') {
        return { ...prev, [category]: initialFilters[category] };
      }
      return { ...prev, [category]: prev[category].filter(v => v !== value) };
    });
  };

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedUsers = useMemo(() => {
    return dummyUsers
      .filter(user => {
        // 1. Search Term Filtering
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();

          if (searchMode === 'ai') {
            const words = lowerSearch.split(/[\s,.'"]+/).filter(w => w.length > 2);

            // Check if name is mentioned
            const nameMatch = user.name.toLowerCase().split(' ').some(nw => words.includes(nw.toLowerCase()));

            // Check if any Skill keywords are in the search sentence
            const skillMatch = user.skills.some(s =>
              lowerSearch.includes(s.toLowerCase()) ||
              words.some(w => s.toLowerCase() === w)
            );

            // Check for indirect semantic matches (e.g. "web dev")
            let semanticMatch = false;
            Object.keys(aiKeywords).forEach(key => {
              if (lowerSearch.includes(key) && aiKeywords[key].some(s => user.skills.includes(s))) {
                semanticMatch = true;
              }
            });

            if (!nameMatch && !skillMatch && !semanticMatch) return false;
          } else {
            // Classic Search (Literal)
            const nameMatch = user.name.toLowerCase().includes(lowerSearch);
            const skillMatch = user.skills.some(s => s.toLowerCase().includes(lowerSearch));
            if (!nameMatch && !skillMatch) return false;
          }
        }

        // 2. Skills
        if (filters.skills.length > 0) {
          if (!filters.skills.some(s => user.skills.includes(s))) return false;
        }

        // 3. Rating
        if (user.rating < filters.minRating) return false;

        // 4. Availability
        if (filters.availability !== "Anytime") {
          if (user.availability !== filters.availability) return false;
        }

        // 5. Experience Levels
        if (filters.experienceLevels.length > 0) {
          if (!filters.experienceLevels.includes(user.experienceLevel)) return false;
        }

        // 6. Languages
        if (filters.languages.length > 0) {
          if (!filters.languages.some(l => user.languages.includes(l))) return false;
        }

        // 7. Price
        if (user.price > filters.maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "Highest Rated":
            return b.rating - a.rating;
          case "Most Sessions":
            return b.sessionsCompleted - a.sessionsCompleted;
          case "Newest First":
            return new Date(b.joinedDate) - new Date(a.joinedDate);
          case "Alphabetical":
            return a.name.localeCompare(b.name);
          default: // Most Relevant (can be combined with search weighting)
            return 0;
        }
      });
  }, [searchTerm, filters, sortOption]);

  return (
    <div className="discover-layout">
      {/* Mobile Sidebar Toggle */}
      <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? "Close Filters" : "Show Filters"}
      </button>

      <div className={`discover-filters-container ${showFilters ? 'show' : ''}`}>
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          allSkills={allSkills}
          allLanguages={allLanguages}
          allExperienceLevels={allExperienceLevels}
          onClearAll={clearAllFilters}
        />
      </div>

      <div className="discover-main-content">
        <div className="discover-top-section">
          <div className="search-group">
            <div className="search-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #333' }}>
              <span
                onClick={() => { setSearchMode('classic'); setAiAnalysis(null); }}
                style={{ cursor: 'pointer', padding: '10px', color: searchMode === 'classic' ? '#3bb4a1' : '#888', borderBottom: searchMode === 'classic' ? '2px solid #3bb4a1' : 'none' }}>
                Standard Search
              </span>
              <span
                onClick={() => { setSearchMode('ai'); setAiAnalysis(null); }}
                style={{ cursor: 'pointer', padding: '10px', color: searchMode === 'ai' ? '#3bb4a1' : '#888', borderBottom: searchMode === 'ai' ? '2px solid #3bb4a1' : 'none' }}>
                ✨ AI Magic Search
              </span>
            </div>

            {searchMode === 'classic' ? (
              <div className="search-bar-wrapper">
                <input
                  type="text"
                  placeholder="Search by name or skills..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-submit-btn" onClick={() => handleSearch()}>🔍</button>
              </div>
            ) : (
              <div className="search-bar-wrapper" style={{ borderColor: '#3bb4a1' }}>
                <input
                  type="text"
                  placeholder="Describe what you want to learn (e.g. 'I want to build a React app with Node backend')"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                />
                <button className="search-submit-btn" style={{ background: '#3bb4a1' }} onClick={handleAISearch}>✨ Analyze</button>
              </div>
            )}

            {searchMode === 'ai' && aiAnalysis && (
              <div style={{ fontSize: '0.85rem', color: '#3bb4a1', marginTop: '10px', fontStyle: 'italic' }}>
                {aiAnalysis}
              </div>
            )}

            {searchMode === 'classic' && recentSearches.length > 0 && (
              <div className="recent-searches">
                <span className="recent-label">Recent:</span>
                {recentSearches.map(s => (
                  <span key={s} className="recent-item" onClick={() => { setSearchTerm(s); handleSearch(s); }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="results-controls">
            <div className="results-info">
              <span className="results-count">{filteredAndSortedUsers.length} mentors found</span>
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  田
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  ☰
                </button>
              </div>
            </div>
            <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
          </div>

          {/* Active Filter Chips */}
          <div className="active-filters">
            {filters.skills.map(skill => (
              <div key={skill} className="filter-chip">
                {skill} <span onClick={() => removeFilterChip('skills', skill)}>×</span>
              </div>
            ))}
            {filters.experienceLevels.map(level => (
              <div key={level} className="filter-chip">
                {level} <span onClick={() => removeFilterChip('experienceLevels', level)}>×</span>
              </div>
            ))}
            {filters.languages.map(lang => (
              <div key={lang} className="filter-chip">
                {lang} <span onClick={() => removeFilterChip('languages', lang)}>×</span>
              </div>
            ))}
            {filters.minRating > 0 && (
              <div className="filter-chip">
                Rating: {filters.minRating}+ ⭐ <span onClick={() => removeFilterChip('minRating')}>×</span>
              </div>
            )}
            {filters.availability !== "Anytime" && (
              <div className="filter-chip">
                {filters.availability} <span onClick={() => removeFilterChip('availability')}>×</span>
              </div>
            )}
            {filters.maxPrice < 100 && (
              <div className="filter-chip">
                Max: ₹{filters.maxPrice} <span onClick={() => removeFilterChip('maxPrice')}>×</span>
              </div>
            )}
          </div>
        </div>

        <h1 className="discover-title">Explore Mentors</h1>

        <div className={`user-gallery ${viewMode}`}>
          {isAnalyzing ? (
            <div className="no-results-state" style={{ minHeight: '300px' }}>
              <div className="ai-loader" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>✨</div>
              <h3>SkillBot is deeply analyzing your request...</h3>
              <p>Scanning 150+ mentor profiles to find your perfect match.</p>
            </div>
          ) : searchMode === 'ai' && !aiAnalysis && searchTerm ? (
            <div className="no-results-state" style={{ minHeight: '300px' }}>
              <h3>Ready to find your match?</h3>
              <p>Click **Analyze** to let SkillBot find the best mentors for your goals.</p>
              <button className="btn-ai-sm" style={{ padding: '10px 20px', marginTop: '10px', background: '#3bb4a1', color: 'white', borderRadius: '8px' }} onClick={handleAISearch}>✨ Analyze Now</button>
            </div>
          ) : filteredAndSortedUsers.length > 0 ? (
            filteredAndSortedUsers.map((user) => (
              <UserCard key={user.username} user={user} viewMode={viewMode} />
            ))
          ) : (
            <div className="no-results-state">
              <h3>No mentors match your criteria.</h3>
              <p>Try adjusting your keywords or switching to Standard Search.</p>
              <button className="btn-secondary" onClick={clearAllFilters}>Clear All Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
