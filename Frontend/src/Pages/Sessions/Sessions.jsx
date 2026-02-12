import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dummyUsers } from "../../util/dummyData";
import "./Sessions.css";

// Demo session data
const dummySessions = {
    past: [
        {
            id: "session-1",
            partner: dummyUsers[0], // Akshit Sharma
            date: "2025-12-10",
            time: "14:00",
            duration: "45 mins",
            rating: 4.8,
            status: "completed"
        },
        {
            id: "session-2",
            partner: dummyUsers[1], // Harshit Chetal
            date: "2025-12-12",
            time: "16:30",
            duration: "60 mins",
            rating: 5.0,
            status: "completed"
        },
        {
            id: "session-3",
            partner: dummyUsers[2], // Sudhanshu Mishra
            date: "2025-12-08",
            time: "10:00",
            duration: "30 mins",
            rating: 4.2,
            status: "completed"
        }
    ],
    upcoming: [
        {
            id: "session-4",
            partner: dummyUsers[1], // Harshit Chetal
            date: "2025-12-20",
            time: "16:00",
            topic: "Machine Learning Fundamentals",
            status: "scheduled"
        },
        {
            id: "session-5",
            partner: dummyUsers[3], // Nikshay Verma
            date: "2025-12-22",
            time: "11:00",
            topic: "DevOps Best Practices",
            status: "scheduled"
        },
        {
            id: "session-6",
            partner: dummyUsers[0], // Akshit Sharma
            date: "2025-12-25",
            time: "15:00",
            topic: "Full Stack Development",
            status: "scheduled"
        }
    ]
};

const Sessions = () => {
    const [activeTab, setActiveTab] = useState("history");
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingSession, setRatingSession] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [recordings, setRecordings] = useState([]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // Load recordings from localStorage
    useEffect(() => {
        const savedRecordings = JSON.parse(localStorage.getItem('session-recordings') || '[]');
        setRecordings(savedRecordings);
    }, [activeTab]);

    const handleRateClick = (session) => {
        setRatingSession(session);
        setSelectedRating(0);
        setHoverRating(0);
        setShowRatingModal(true);
    };

    const handleSubmitRating = () => {
        if (selectedRating > 0) {
            console.log(`Rating ${selectedRating} stars for ${ratingSession.partner.name}`);
            // Here you would normally send to backend
            // For demo, just show success message
            alert(`Thank you! You rated ${ratingSession.partner.name} ${selectedRating} stars`);
            setShowRatingModal(false);
        }
    };

    const renderRatingModal = () => {
        if (!showRatingModal || !ratingSession) return null;

        return (
            <div className="rating-modal-overlay" onClick={() => setShowRatingModal(false)}>
                <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Rate Your Session</h2>
                    <div className="rating-modal-user">
                        with {ratingSession.partner.name}
                    </div>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${star <= (hoverRating || selectedRating) ? 'filled' : ''
                                    } ${hoverRating === star ? 'hover' : ''}`}
                                onClick={() => setSelectedRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <div className="rating-modal-buttons">
                        <button
                            className="rating-modal-btn rating-cancel-btn"
                            onClick={() => setShowRatingModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="rating-modal-btn rating-submit-btn"
                            onClick={handleSubmitRating}
                            disabled={selectedRating === 0}
                        >
                            Submit Rating
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHistory = () => {
        if (dummySessions.past.length === 0) {
            return (
                <div className="no-sessions">
                    <div className="no-sessions-icon">📅</div>
                    <p>No past sessions yet</p>
                </div>
            );
        }

        return dummySessions.past.map((session) => (
            <div key={session.id} className="session-card">
                <img
                    src={session.partner.picture}
                    alt={session.partner.name}
                    className="session-avatar"
                />
                <div className="session-info">
                    <div className="session-partner">{session.partner.name}</div>
                    <div className="session-details">
                        {formatDate(session.date)} • {session.time}
                    </div>
                    <div className="session-details">
                        Duration: {session.duration}
                    </div>
                    {session.rating && (
                        <div className="rating-stars">
                            ⭐ {session.rating.toFixed(1)}
                        </div>
                    )}
                </div>
                <div className="session-actions">
                    <Link to={`/profile/${session.partner.username}`}>
                        <button className="session-btn btn-secondary">View Profile</button>
                    </Link>
                    <button
                        className="session-btn btn-primary"
                        onClick={() => handleRateClick(session)}
                    >
                        Rate Session
                    </button>
                </div>
            </div>
        ));
    };

    const renderUpcoming = () => {
        if (dummySessions.upcoming.length === 0) {
            return (
                <div className="no-sessions">
                    <div className="no-sessions-icon">📆</div>
                    <p>No upcoming sessions scheduled</p>
                </div>
            );
        }

        return dummySessions.upcoming.map((session) => (
            <div key={session.id} className="session-card">
                <img
                    src={session.partner.picture}
                    alt={session.partner.name}
                    className="session-avatar"
                />
                <div className="session-info">
                    <div className="session-partner">{session.partner.name}</div>
                    <div className="session-details">
                        {formatDate(session.date)} • {session.time}
                    </div>
                    <div className="session-details">
                        Topic: {session.topic}
                    </div>
                </div>
                <div className="session-actions">
                    <Link to={`/call/session-${session.id}`}>
                        <button className="session-btn btn-primary">Join Call</button>
                    </Link>
                    <button className="session-btn btn-secondary">Reschedule</button>
                    <button className="session-btn btn-danger">Cancel</button>
                </div>
            </div>
        ));
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Get all session dates
        const allSessions = [...dummySessions.past, ...dummySessions.upcoming];
        const sessionDates = allSessions.map(s => s.date);

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Get today's date for comparison
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const days = [];
        const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Render day headers
        dayHeaders.forEach(day => {
            days.push(
                <div key={`header-${day}`} className="calendar-day-header">
                    {day}
                </div>
            );
        });

        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Render each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasSession = sessionDates.includes(dateStr);
            const isToday = dateStr === todayStr;

            let className = "calendar-day";
            if (isToday) {
                className += " today";
            }
            if (hasSession) {
                className += " has-session";
            }

            days.push(
                <div
                    key={day}
                    className={className}
                    onClick={() => handleDateClick(dateStr)}
                >
                    {day}
                </div>
            );
        }

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <button
                        className="calendar-nav-btn"
                        onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    >
                        ← Prev
                    </button>
                    <div className="calendar-month">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </div>
                    <button
                        className="calendar-nav-btn"
                        onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    >
                        Next →
                    </button>
                </div>
                <div className="calendar-grid">
                    {days}
                </div>
                {selectedDate && renderDateDetails()}
            </div>
        );
    };

    const handleDateClick = (dateStr) => {
        setSelectedDate(dateStr);
    };

    const renderDateDetails = () => {
        const allSessions = [...dummySessions.past, ...dummySessions.upcoming];
        const sessionsForDate = allSessions.filter(s => s.date === selectedDate);

        if (sessionsForDate.length === 0) {
            return (
                <div className="session-details-modal">
                    <h4>{formatDate(selectedDate)}</h4>
                    <p>No sessions on this date</p>
                </div>
            );
        }

        return (
            <div className="session-details-modal">
                <h4>Sessions on {formatDate(selectedDate)}</h4>
                {sessionsForDate.map((session) => (
                    <div key={session.id} style={{ marginBottom: "10px" }}>
                        <strong>{session.partner.name}</strong> - {session.time}
                        {session.topic && <div>Topic: {session.topic}</div>}
                        {session.duration && <div>Duration: {session.duration}</div>}
                    </div>
                ))}
            </div>
        );
    };

    const renderRecordings = () => {
        if (recordings.length === 0) {
            return (
                <div className="no-sessions">
                    <div className="no-sessions-icon">🎥</div>
                    <p>No recordings yet</p>
                    <small>Start a video call and click "Record" to save sessions</small>
                </div>
            );
        }

        return recordings.map((recording, index) => (
            <div key={index} className="session-card">
                <div className="session-info">
                    <div className="session-partner">🎥 Session Recording</div>
                    <div className="session-details">
                        {new Date(recording.date).toLocaleString()}
                    </div>
                    <div className="session-details">
                        Room: {recording.roomId}
                    </div>
                    <div className="session-details">
                        Duration: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div className="session-actions">
                    <button
                        className="session-btn btn-secondary"
                        onClick={() => alert('To playback: Open your downloads folder and play ' + recording.filename)}
                    >
                        💾 View File
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className="sessions-container">
            <h1 className="sessions-header">📅 My Sessions</h1>

            <div className="sessions-tabs">
                <button
                    className={`tab-button ${activeTab === "history" ? "active" : ""}`}
                    onClick={() => setActiveTab("history")}
                >
                    Meeting History
                </button>
                <button
                    className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming Sessions
                </button>
                <button
                    className={`tab-button ${activeTab === "recordings" ? "active" : ""}`}
                    onClick={() => setActiveTab("recordings")}
                >
                    Recordings
                </button>
                <button
                    className={`tab-button ${activeTab === "calendar" ? "active" : ""}`}
                    onClick={() => setActiveTab("calendar")}
                >
                    Calendar View
                </button>
            </div>

            <div className="sessions-content">
                {activeTab === "history" && renderHistory()}
                {activeTab === "upcoming" && renderUpcoming()}
                {activeTab === "recordings" && renderRecordings()}
                {activeTab === "calendar" && renderCalendar()}
            </div>
            {renderRatingModal()}
        </div>
    );
};

export default Sessions;
