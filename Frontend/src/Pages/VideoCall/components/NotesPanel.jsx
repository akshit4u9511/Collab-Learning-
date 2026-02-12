import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import './NotesPanel.css';

const NotesPanel = ({ roomId, isOpen, onClose }) => {
    const [notes, setNotes] = useState('');
    const [lastSaved, setLastSaved] = useState(null);

    // Load notes from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem(`notes-${roomId}`);
        if (savedNotes) {
            setNotes(savedNotes);
        }
    }, [roomId]);

    // Auto-save every 30 seconds
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (notes) {
                saveNotes();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [notes]);

    const saveNotes = () => {
        localStorage.setItem(`notes-${roomId}`, notes);
        localStorage.setItem(`notes-${roomId}-timestamp`, new Date().toISOString());
        setLastSaved(new Date());
        toast.success('Notes saved!', { autoClose: 2000 });
    };

    const downloadNotes = () => {
        const element = document.createElement('a');
        const file = new Blob([notes.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `session-notes-${roomId}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Notes downloaded!');
    };

    const clearNotes = () => {
        if (window.confirm('Are you sure you want to clear all notes?')) {
            setNotes('');
            localStorage.removeItem(`notes-${roomId}`);
            toast.info('Notes cleared');
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline',
        'list', 'bullet',
        'link'
    ];

    if (!isOpen) return null;

    return (
        <div className="notes-panel">
            <div className="notes-header">
                <h3>📝 Session Notes</h3>
                <button className="notes-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="notes-toolbar">
                <button className="notes-btn notes-save-btn" onClick={saveNotes}>
                    💾 Save
                </button>
                <button className="notes-btn notes-download-btn" onClick={downloadNotes}>
                    ⬇️ Download
                </button>
                <button className="notes-btn notes-clear-btn" onClick={clearNotes}>
                    🗑️ Clear
                </button>
            </div>

            {lastSaved && (
                <div className="notes-last-saved">
                    Last saved: {lastSaved.toLocaleTimeString()}
                </div>
            )}

            <div className="notes-editor-container">
                <ReactQuill
                    theme="snow"
                    value={notes}
                    onChange={setNotes}
                    modules={modules}
                    formats={formats}
                    placeholder="Take notes during your session..."
                    className="notes-editor"
                />
            </div>

            <div className="notes-footer">
                <small>Auto-saves every 30 seconds</small>
            </div>
        </div>
    );
};

export default NotesPanel;
