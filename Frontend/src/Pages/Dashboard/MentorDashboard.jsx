import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dummyUsers } from '../../util/dummyData';
import './Dashboard.css';

const MentorDashboard = () => {
    const { user } = useAuth();

    const [stats] = useState({
        totalSessions: 45,
        averageRating: 4.7,
        hoursTeaching: 67.5,
        activeStudents: 12
    });

    const [upcomingSchedule] = useState([
        {
            id: 1,
            student: { name: 'Anmol', picture: dummyUsers[0].picture },
            date: '2025-12-18',
            time: '14:00',
            topic: 'React Advanced Patterns',
            roomId: 'react-adv-001'
        },
        {
            id: 2,
            student: { name: 'Satwik', picture: dummyUsers[1].picture },
            date: '2025-12-18',
            time: '16:30',
            topic: 'Node.js Microservices',
            roomId: 'node-micro-002'
        },
        {
            id: 3,
            student: { name: 'Bhanu Pratap', picture: dummyUsers[2].picture },
            date: '2025-12-19',
            time: '10:00',
            topic: 'Python Data Science',
            roomId: 'python-ds-003'
        }
    ]);

    const [studentProgress] = useState([
        {
            id: 1,
            student: { name: 'Anmol', picture: dummyUsers[0].picture },
            skill: 'React',
            sessionsCompleted: 8,
            progress: 75,
            lastSession: '2025-12-15'
        },
        {
            id: 2,
            student: { name: 'Satwik', picture: dummyUsers[1].picture },
            skill: 'Node.js',
            sessionsCompleted: 6,
            progress: 60,
            lastSession: '2025-12-14'
        },
        {
            id: 3,
            student: { name: 'Bhanu Pratap', picture: dummyUsers[2].picture },
            skill: 'Python',
            sessionsCompleted: 5,
            progress: 45,
            lastSession: '2025-12-13'
        },
        {
            id: 4,
            student: { name: 'Sukrant', picture: dummyUsers[3].picture },
            skill: 'Machine Learning',
            sessionsCompleted: 3,
            progress: 30,
            lastSession: '2025-12-12'
        }
    ]);

    const [topicsRequested] = useState([
        { topic: 'React Hooks', count: 12, percentage: 30 },
        { topic: 'Node.js APIs', count: 10, percentage: 25 },
        { topic: 'Python Basics', count: 8, percentage: 20 },
        { topic: 'DevOps', count: 6, percentage: 15 },
        { topic: 'Other', count: 4, percentage: 10 }
    ]);

    const getTimeUntil = (dateStr, timeStr) => {
        const sessionDate = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diff = sessionDate - now;

        if (diff < 0) return 'Started';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `in ${days}d`;
        }
        if (hours > 0) return `in ${hours}h`;
        if (minutes > 0) return `in ${minutes}m`;
        return 'Now';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>👨‍🏫 Mentor Dashboard</h1>
                <p className="dashboard-subtitle">Welcome back, {user?.name || 'Mentor'}!</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalSessions}</div>
                        <div className="stat-label">Sessions Taught</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.averageRating}</div>
                        <div className="stat-label">Average Rating</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.hoursTeaching}h</div>
                        <div className="stat-label">Hours Teaching</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeStudents}</div>
                        <div className="stat-label">Active Students</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Today's Schedule */}
                <div className="dashboard-section">
                    <h2>📅 Upcoming Schedule</h2>
                    <div className="session-list">
                        {upcomingSchedule.map((session) => (
                            <div key={session.id} className="session-card-compact">
                                <img
                                    src={session.student.picture}
                                    alt={session.student.name}
                                    className="session-avatar-small"
                                />
                                <div className="session-info-compact">
                                    <div className="session-mentor-name">{session.student.name}</div>
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
                                        <button className="btn-join">Start</button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most Requested Topics */}
                <div className="dashboard-section">
                    <h2>📊 Most Requested Topics</h2>
                    <div className="topics-list">
                        {topicsRequested.map((item, index) => (
                            <div key={index} className="topic-item">
                                <div className="topic-header">
                                    <span className="topic-name">{item.topic}</span>
                                    <span className="topic-count">{item.count} requests</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill topic-bar"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Student Progress */}
                <div className="dashboard-section">
                    <h2>👥 Student Progress</h2>
                    <div className="students-grid">
                        {studentProgress.map((student) => (
                            <div key={student.id} className="student-card">
                                <img
                                    src={student.student.picture}
                                    alt={student.student.name}
                                    className="student-avatar"
                                />
                                <div className="student-info">
                                    <div className="student-name">{student.student.name}</div>
                                    <div className="student-skill">Learning: {student.skill}</div>
                                    <div className="student-progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${student.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="student-meta">
                                        <span>{student.sessionsCompleted} sessions</span>
                                        <span>{student.progress}% complete</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
