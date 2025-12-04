import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, UserCircle, Smartphone, LogOut, Settings as SettingsIcon, Home, Mail, Lightbulb, BookOpen, Plus, Search, X, Trash2, Edit2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.js';
import QR from '../assets/DemoQR.png';

// KnowledgeModal component remains unchanged
const KnowledgeModal = ({ isOpen, onClose, setShowSidebarOverlay = () => {}, setIsSidebarVisible = () => {} }) => {
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', content: '' });
  const [editEntry, setEditEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const storedEntries = JSON.parse(localStorage.getItem('knowledgeEntries') || '[]');
      setKnowledgeEntries(storedEntries);
      setLoading(false);
    }
  }, [isOpen, setShowSidebarOverlay, setIsSidebarVisible]);

  useEffect(() => {
    if (knowledgeEntries.length > 0) {
      localStorage.setItem('knowledgeEntries', JSON.stringify(knowledgeEntries));
    } else {
      localStorage.removeItem('knowledgeEntries');
    }
  }, [knowledgeEntries]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAddKnowledge = () => {
    if (!newEntry.name.trim() || !newEntry.content.trim()) {
      setError('Name and content are required.');
      return;
    }
    if (knowledgeEntries.length >= 20) {
      setError('Maximum knowledge entries (20) reached. Delete some entries to add new ones.');
      return;
    }

    setLoading(true);
    const entry = {
      id: Date.now().toString(),
      name: newEntry.name.trim(),
      content: newEntry.content.trim(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Active',
    };

    setKnowledgeEntries((prev) => [...prev, entry]);
    setNewEntry({ name: '', content: '' });
    setShowAddForm(false);
    setError(null);
    setLoading(false);
  };

  const handleUpdateKnowledge = () => {
    if (!newEntry.name.trim() || !newEntry.content.trim()) {
      setError('Name and content are required.');
      return;
    }

    setLoading(true);
    setKnowledgeEntries((prev) =>
      prev.map((entry) =>
        entry.id === editEntry.id
          ? {
              ...entry,
              name: newEntry.name.trim(),
              content: newEntry.content.trim(),
            }
          : entry
      )
    );
    setNewEntry({ name: '', content: '' });
    setEditEntry(null);
    setShowAddForm(false);
    setError(null);
    setLoading(false);
  };

  const handleDeleteEntry = (id) => {
    setLoading(true);
    setKnowledgeEntries((prev) => prev.filter((entry) => entry.id !== id));
    setError(null);
    setLoading(false);
  };

  const handleEditEntry = (entry) => {
    setEditEntry(entry);
    setNewEntry({ name: entry.name, content: entry.content });
    setShowAddForm(true);
    setError(null);
  };

  const filteredEntries = knowledgeEntries.filter(
    (entry) =>
      entry?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    console.log('KnowledgeModal not open');
    return null;
  }
  console.log('Rendering KnowledgeModal');

  const modalContent = (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
    >
      <div className="bg-[#FCF4F1] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-[#FCF4F1]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Knowledge</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditEntry(null);
                setNewEntry({ name: '', content: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
              disabled={knowledgeEntries.length >= 20 || showAddForm || loading}
            >
              <Plus className="w-4 h-4" />
              Add knowledge
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-[#FCF4F1] border-b border-gray-300">
          <p className="text-sm text-gray-600 leading-relaxed">
            Store personalized knowledge entries to enhance task assistance.
          </p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="text-sm text-gray-500">
            {knowledgeEntries.length} / 20 entries
          </div>
        </div>
        <div className="px-6 py-3 bg-[#FCF4F1] border-b border-gray-300">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Content</div>
            <div className="col-span-2">Created at</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : showAddForm ? (
            <div className="px-6 py-4 border-b border-gray-300 bg-[#FCF4F1]">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Knowledge name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-sm"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, name: e.target.value }))}
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="col-span-4">
                  <textarea
                    placeholder="Knowledge content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-sm"
                    rows={3}
                    value={newEntry.content}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, content: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div className="col-span-2"></div>
                <div className="col-span-2"></div>
                <div className="col-span-1 flex gap-2">
                  <button
                    onClick={editEntry ? handleUpdateKnowledge : handleAddKnowledge}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    disabled={loading || !newEntry.name.trim() || !newEntry.content.trim()}
                  >
                    {editEntry ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntry({ name: '', content: '' });
                      setEditEntry(null);
                      setError(null);
                    }}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#FCF4F1] rounded-full flex items-center justify-center mb-4 border border-gray-300">
                <Lightbulb className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first knowledge entry to get started
              </p>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditEntry(null);
                  setNewEntry({ name: '', content: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add knowledge
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="px-6 py-4 border-b border-gray-300 hover:bg-gray-200"
              >
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {entry.name || 'Unnamed'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {entry.content || 'No content'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">{entry.createdAt || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {entry.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="col-span-1 flex gap-2">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      disabled={loading}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 hover:text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-300 bg-[#FCF4F1]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Enhance task assistance with personalized knowledge
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
export default KnowledgeModal;