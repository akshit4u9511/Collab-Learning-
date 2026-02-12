import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dummyUsers } from '../../util/dummyData';
import AIRoadmap from '../../Components/AIRoadmap/AIRoadmap';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [showRoadmap, setShowRoadmap] = useState(false);

    const handleGenerateRoadmap = (skill) => {
        setSelectedSkill(skill);
        setShowRoadmap(true);
    };

    const [newSkillName, setNewSkillName] = useState('');
    const [isAddingSkill, setIsAddingSkill] = useState(false);

    const [stats, setStats] = useState({
        totalSessions: 12,
        hoursLearned: 18.5,
        currentStreak: 5,
        skillsLearning: 4
    });

    const [learningProgress, setLearningProgress] = useState([
        { skill: 'React', progress: 75, sessions: 8 },
        { skill: 'Node.js', progress: 60, sessions: 6 },
        { skill: 'Python', progress: 45, sessions: 5 },
        { skill: 'Machine Learning', progress: 30, sessions: 3 }
    ]);

    const handleRemoveSkill = (skillToRemove) => {
        setLearningProgress(prev => prev.filter(item => item.skill !== skillToRemove));
    };

    const handleAddSkill = () => {
        if (!newSkillName.trim()) return;
        setLearningProgress(prev => [
            ...prev,
            { skill: newSkillName, progress: 0, sessions: 0 }
        ]);
        setNewSkillName('');
        setIsAddingSkill(false);
    };

    const [upcomingSessions] = useState([
        {
            id: 1,
            mentor: dummyUsers[1],
            date: '2025-12-20',
            time: '16:00',
            topic: 'Machine Learning Fundamentals',
            roomId: 'ml-basics-001'
        },
        {
            id: 2,
            mentor: dummyUsers[3],
            date: '2025-12-22',
            time: '11:00',
            topic: 'DevOps Best Practices',
            roomId: 'devops-101'
        }
    ]);

    const [recentActivity] = useState([
        {
            id: 1,
            mentor: dummyUsers[0],
            date: '2025-12-10',
            rating: 4.8,
            topic: 'React Hooks Deep Dive'
        },
        {
            id: 2,
            mentor: dummyUsers[1],
            date: '2025-12-12',
            rating: 5.0,
            topic: 'Express.js Best Practices'
        },
        {
            id: 3,
            mentor: dummyUsers[2],
            date: '2025-12-08',
            rating: 4.2,
            topic: 'Python Data Structures'
        }
    ]);

    const getTimeUntil = (dateStr, timeStr) => {
        const sessionDate = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diff = sessionDate - now;

        if (diff < 0) return 'Started';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `in ${days}d ${hours}h`;
        if (hours > 0) return `in ${hours}h`;
        return 'Starting soon';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>👨‍🎓 Student Dashboard</h1>
                <p className="dashboard-subtitle">Welcome back, {user?.name || 'Student'}!</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalSessions}</div>
                        <div className="stat-label">Total Sessions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.hoursLearned}h</div>
                        <div className="stat-label">Hours Learned</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.currentStreak} days</div>
                        <div className="stat-label">Current Streak</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.skillsLearning}</div>
                        <div className="stat-label">Skills Learning</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Learning Progress */}
                <div className="dashboard-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2>📈 Learning Progress</h2>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {isAddingSkill ? (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter skill name..."
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '2px 8px', color: 'white', fontSize: '0.8rem' }}
                                    />
                                    <button className="btn-ai-sm" onClick={handleAddSkill}>Add</button>
                                    <button className="btn-ai-sm" style={{ borderColor: '#ff4444', color: '#ff4444' }} onClick={() => setIsAddingSkill(false)}>✕</button>
                                </div>
                            ) : (
                                <button className="btn-ai-sm" onClick={() => setIsAddingSkill(true)}>+ Add Skill</button>
                            )}
                            <span style={{ fontSize: '0.8rem', color: '#3bb4a1', cursor: 'help' }}>✨ AI Powered</span>
                        </div>
                    </div>
                    <div className="progress-list">
                        {learningProgress.map((item, index) => (
                            <div key={index} className="progress-item">
                                <div className="progress-header">
                                    <span className="progress-skill">{item.skill}</span>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            className="btn-ai-sm"
                                            onClick={() => handleGenerateRoadmap(item.skill)}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: 'rgba(59, 180, 161, 0.1)',
                                                border: '1px solid #3bb4a1',
                                                color: '#3bb4a1',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ✨ Roadmap
                                        </button>
                                        <button
                                            title="Remove Skill"
                                            onClick={() => handleRemoveSkill(item.skill)}
                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px', display: 'flex', alignItems: 'center' }}
                                        >
                                            ✕
                                        </button>
                                        <span className="progress-percentage">{item.progress}%</span>
                                    </div>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${item.progress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-sessions">{item.sessions} sessions completed</div>
                            </div>
                        ))}
                    </div>
                </div>

                {showRoadmap && (
                    <AIRoadmap
                        skill={selectedSkill}
                        onClose={() => setShowRoadmap(false)}
                    />
                )}

                {/* Upcoming Sessions */}
                <div className="dashboard-section">
                    <h2>📅 Upcoming Sessions</h2>
                    {upcomingSessions.length === 0 ? (
                        <div className="empty-state">
                            <p>No upcoming sessions</p>
                            <Link to="/discover">
                                <button className="btn-primary">Find a Mentor</button>
                            </Link>
                        </div>
                    ) : (
                        <div className="session-list">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="session-card-compact">
                                    <img
                                        src={session.mentor.picture}
                                        alt={session.mentor.name}
                                        className="session-avatar-small"
                                    />
                                    <div className="session-info-compact">
                                        <div className="session-mentor-name">{session.mentor.name}</div>
                                        <div className="session-topic">{session.topic}</div>
                                        <div className="session-time">
                                            {new Date(session.date).toLocaleDateString()} • {session.time}
                                        </div>
                                    </div>
                                    <div className="session-actions-compact">
                                        <div className="session-countdown">
                                            {getTimeUntil(session.date, session.time)}
                                        </div>
                                        <Link to={`/call/${session.roomId}`}>
                                            <button className="btn-join">Join</button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="dashboard-section">
                    <h2>⏮️ Recent Activity</h2>
                    <div className="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <img
                                    src={activity.mentor.picture}
                                    alt={activity.mentor.name}
                                    className="activity-avatar"
                                />
                                <div className="activity-content">
                                    <div className="activity-title">{activity.topic}</div>
                                    <div className="activity-meta">
                                        with {activity.mentor.name} • {new Date(activity.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="activity-rating">
                                    ⭐ {activity.rating}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/sessions">
                        <button className="btn-secondary">View All Sessions</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
