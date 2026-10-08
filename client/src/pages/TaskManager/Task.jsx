import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CheckSquare, Target, MoreHorizontal, Star, Share2, 
  Filter, ArrowUpDown, Search, Menu, Plus, ChevronDown, X, Edit, 
  Trash2, Save, AlertCircle, Heart, Users, Book, Music, Camera,
  Coffee, Zap, Home, Gift, Sun, Moon, Brain, Activity, Headphones,
  Sprout, Droplets, Wind, Leaf, ArrowDown, ArrowUp
} from 'lucide-react';
import Sidebar from '../../components/SideBar';
import { useTasks } from './hooks/useTasks';

export default function WellnessTracker() {
  const { tasks, isLoading, error, clearError, createTask, updateTasks, deleteTasks } = useTasks();

  const [viewMode, setViewMode] = useState("All Activities");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const mainContentRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [newTask, setNewTask] = useState({
    title: '',
    status: 'To Do',
    category: [],
    notes: '',
    icon: 'Heart'
  });

  const iconMap = {
    Heart, Brain, Activity, Users, Leaf, Music, Book, Coffee, 
    Sun, Moon, Headphones, Sprout, Droplets, Wind, Camera, Gift,
    CheckSquare, Target, Star, Home, Zap
  };

  const availableIcons = Object.keys(iconMap);
  const availableCategories = [
    'Dopamine Activities',
    'Fitness & Movement',
    'Social Care & Connection',
    'Mindfulness / Meditation',
    'Self-Care Routines'
  ];
  const statusOptions = ['To Do', 'In progress', 'Done'];

  const allCategories = useMemo(() => {
    const categories = new Set();
    tasks.forEach(task => {
      task.category.forEach(cat => categories.add(cat));
    });
    availableCategories.forEach(cat => categories.add(cat));
    return Array.from(categories).sort();
  }, [tasks]);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainContentRef.current;
        setShowScrollButton(scrollTop > clientHeight * 0.5);
      }
    };

    const currentRef = mainContentRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: mainContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const Dropdown = ({ 
    isOpen, 
    onClose, 
    value, 
    onChange, 
    options, 
    placeholder = 'Select an option'
  }) => {
    const dropdownRef = React.useRef(null);
    
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          onClose();
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="absolute top-1 left-0 w-48 bg-white border border-gray-200 rounded-md shadow-md z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2">{placeholder}</div>
            <div className="space-y-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
                  <span className={`text-xs ${
                    option.color ? `px-1 py-0.5 rounded ${option.color}` : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const statusDropdownOptions = [
    { value: 'To Do', label: 'To Do', color: 'bg-red-100 text-red-600' },
    { value: 'In progress', label: 'In progress', color: 'bg-blue-100 text-blue-600' },
    { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-600' }
  ];

  const categoryDropdownOptions = allCategories.map(cat => ({
    value: cat,
    label: cat,
    color: 'bg-purple-100 text-purple-700'
  }));

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !filterStatus || task.status === filterStatus;
      const matchesCategory = !filterCategory || task.category.includes(filterCategory);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterCategory, sortConfig]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    statusOptions.forEach(status => {
      groups[status] = filteredAndSortedTasks.filter(task => task.status === status);
    });
    return groups;
  }, [filteredAndSortedTasks]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    
    const created = await createTask({
      ...newTask,
      category: newTask.category.filter(cat => cat.trim() !== '')
    });
    if (!created) return;

    resetNewTaskForm();
    setShowNewTaskForm(false);
    
    setTimeout(() => scrollToTop(), 100);
  };

  const resetNewTaskForm = () => {
    setNewTask({
      title: '',
      status: 'To Do',
      category: [],
      notes: '',
      icon: 'Heart'
    });
  };

  const updateTask = (id, updatedTask) => {
    updateTasks([id], updatedTask);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this wellness activity?')) {
      deleteTasks([id]);
      setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
    }
  };

  const duplicateTask = async (task) => {
    const created = await createTask({
      ...task,
      title: `${task.title} (Copy)`,
      status: 'To Do'
    });
    if (!created) return;
    
    setTimeout(() => scrollToTop(), 100);
  };

  const toggleTaskSelection = (id) => {
    setSelectedTasks(prev => 
      prev.includes(id) 
        ? prev.filter(taskId => taskId !== id)
        : [...prev, id]
    );
  };

  const selectAllTasks = () => {
    const allTaskIds = filteredAndSortedTasks.map(task => task.id);
    setSelectedTasks(
      selectedTasks.length === allTaskIds.length ? [] : allTaskIds
    );
  };

  const bulkUpdateStatus = (status) => {
    updateTasks(selectedTasks, { status });
    setSelectedTasks([]);
  };

  const bulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} wellness activities?`)) {
      deleteTasks(selectedTasks);
      setSelectedTasks([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do": return "text-red-600 bg-red-100";
      case "In progress": return "text-blue-600 bg-blue-100";
      case "Done": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const TaskRow = ({ task, isEditing = false, showCheckbox = false }) => {
    const [editData, setEditData] = useState(task);
    const IconComponent = iconMap[task.icon] || Heart;

    if (isEditing) {
      return (
        <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50">
          {showCheckbox && <div className="col-span-1"></div>}
          <div className="col-span-3 flex items-center gap-2">
            <select 
              value={editData.icon} 
              onChange={(e) => setEditData(prev => ({...prev, icon: e.target.value}))}
              className="w-6 h-6 text-xs border rounded"
            >
              {availableIcons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({...prev, title: e.target.value}))}
              className="font-medium text-gray-900 bg-white border rounded px-2 py-1 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateTask(task.id, editData);
                if (e.key === 'Escape') setEditingTask(null);
              }}
            />
          </div>
          
          <div className="col-span-1 flex items-center">
            <select
              value={editData.status}
              onChange={(e) => setEditData(prev => ({...prev, status: e.target.value}))}
              className="text-xs bg-white border rounded px-2 py-1 w-full"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2 flex items-center">
            <input
              type="text"
              value={editData.category.join(', ')}
              onChange={(e) => setEditData(prev => ({...prev, category: e.target.value.split(',').map(s => s.trim())}))}
              placeholder="Mindfulness, Self-Care"
              className="text-xs text-gray-600 bg-white border rounded px-2 py-1 w-full"
            />
          </div>
          
          <div className="col-span-5 flex items-center gap-2">
            <input
              type="text"
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({...prev, notes: e.target.value}))}
              className="text-xs text-gray-600 bg-white border rounded px-2 py-1 flex-1"
            />
          </div>

          <div className="col-span-1 flex items-center gap-1">
            <button
              onClick={() => updateTask(task.id, editData)}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Save changes"
            >
              <Save className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEditingTask(null)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-12 gap-2 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 group transition-colors ${
        task.completed ? 'opacity-75' : ''
      }`}>
        {showCheckbox && (
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={() => toggleTaskSelection(task.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
            />
          </div>
        )}
        
        <div className={`${showCheckbox ? 'col-span-4' : 'col-span-4'} flex items-center gap-2`}>
          <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <span className={`text-xs font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </span>
        </div>
        
        <div className="col-span-1 flex items-center relative">
          <button
            onClick={() => setShowStatusDropdown(showStatusDropdown === task.id ? null : task.id)}
            className={`px-1 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(task.status)} hover:opacity-80 cursor-pointer flex items-center gap-1`}
          >
            {task.status}
            <ChevronDown className="w-2 h-2" />
          </button>
          <Dropdown
            isOpen={showStatusDropdown === task.id}
            onClose={() => setShowStatusDropdown(null)}
            value={task.status}
            onChange={(newStatus) => updateTask(task.id, { status: newStatus })}
            options={statusDropdownOptions}
            placeholder="Select a status"
          />
        </div>
        
        <div className="col-span-2 flex items-center gap-1 relative">
          <div className="flex flex-wrap gap-1 flex-1">
            {task.category.map((cat, index) => (
              <button
                key={index}
                onClick={() => {
                  const newCategories = task.category.filter((_, i) => i !== index);
                  updateTask(task.id, { category: newCategories });
                }}
                className="inline-flex bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full text-[10px] hover:bg-purple-200 cursor-pointer items-center gap-1"
              >
                {cat}
                <X className="w-2 h-2" />
              </button>
            ))}
            <button
              onClick={() => setShowCategoryDropdown(showCategoryDropdown === `${task.id}-add` ? null : `${task.id}-add`)}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-1 py-0.5 rounded-full text-[10px] hover:bg-gray-200 cursor-pointer"
            >
              <Plus className="w-2 h-2" />
              Add
            </button>
          </div>
          <Dropdown
            isOpen={showCategoryDropdown && showCategoryDropdown.startsWith(task.id.toString())}
            onClose={() => setShowCategoryDropdown(null)}
            value=""
            onChange={(newCategory) => {
              if (!task.category.includes(newCategory)) {
                updateTask(task.id, { category: [...task.category, newCategory] });
              }
            }}
            options={categoryDropdownOptions.filter(opt => !task.category.includes(opt.value))}
            placeholder="Select a category"
          />
        </div>
        
        <div className="col-span-4 flex items-center">
          <span className="text-xs text-gray-600 truncate" title={task.notes}>
            {task.notes}
          </span>
        </div>

        <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingTask(task.id)}
            className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit activity"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => duplicateTask(task)}
            className="p-0.5 text-green-600 hover:bg-green-100 rounded"
            title="Duplicate activity"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
            title="Delete activity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const NewTaskForm = () => (
    <div className="bg-white border border-blue-200 rounded-md p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-medium">Add New Wellness Activity</h3>
        <button
          onClick={() => setShowNewTaskForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Activity <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="What wellness activity would you like to add?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) addTask();
            }}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={newTask.status}
            onChange={(e) => setNewTask(prev => ({...prev, status: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
          <select
            value={newTask.icon}
            onChange={(e) => setNewTask(prev => ({...prev, icon: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            {availableIcons.map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>
        
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Wellness Category</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {availableCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const categories = newTask.category.includes(cat) 
                    ? newTask.category.filter(c => c !== cat)
                    : [...newTask.category, cat];
                  setNewTask(prev => ({...prev, category: categories}));
                }}
                className={`text-[10px] px-2 py-1 rounded-full border ${
                  newTask.category.includes(cat)
                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={newTask.notes}
            onChange={(e) => setNewTask(prev => ({...prev, notes: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="How does this activity support your mental wellness?"
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={addTask}
          disabled={!newTask.title.trim()}
          className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Wellness Activity
        </button>
        <button
          onClick={resetNewTaskForm}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        <div className="flex-1"></div>
        <div className="text-[10px] text-gray-500 flex items-center">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd>
          <span className="ml-1">to save</span>
        </div>
      </div>
    </div>
  );

  const BulkActions = () => (
    <div className="bg-purple-50 border border-purple-200 rounded-md p-2 mb-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-purple-900">
          {selectedTasks.length} activit{selectedTasks.length !== 1 ? 'ies' : 'y'} selected
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => bulkUpdateStatus('To Do')}
            className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            Mark To Do
          </button>
          <button
            onClick={() => bulkUpdateStatus('In progress')}
            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => bulkUpdateStatus('Done')}
            className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
          >
            Mark Done
          </button>
          <button
            onClick={bulkDelete}
            className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedTasks([])}
            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AthenaSuggestions = () => {
    const suggestions = [
      { id: 's1', title: "Take a 10-minute walk", category: ["Fitness & Movement"], icon: 'Activity', notes: "Fresh air can boost your mood instantly" },
      { id: 's2', title: "5-minute breathing exercise", category: ["Mindfulness / Meditation"], icon: 'Wind', notes: "Focus on deep, calming breaths" },
      { id: 's3', title: "Text a friend you care about", category: ["Social Care & Connection"], icon: 'Users', notes: "Strengthen your social connections" },
      { id: 's4', title: "Listen to your favorite song", category: ["Dopamine Activities"], icon: 'Music', notes: "Music can elevate your mood" },
      { id: 's5', title: "Drink a glass of water", category: ["Self-Care Routines"], icon: 'Droplets', notes: "Stay hydrated for better mental clarity" },
      { id: 's6', title: "Write down 3 positive things", category: ["Mindfulness / Meditation"], icon: 'Book', notes: "Practice positive thinking" },
      { id: 's7', title: "Stretch for 5 minutes", category: ["Fitness & Movement"], icon: 'Activity', notes: "Release tension from your body" },
      { id: 's8', title: "Plan a small treat for yourself", category: ["Dopamine Activities"], icon: 'Gift', notes: "Reward yourself for small victories" }
    ];

    const addSuggestion = async (suggestion) => {
      const created = await createTask({
        ...suggestion,
        status: 'To Do'
      });
      if (!created) return;
      setAddedSuggestions(prev => [...prev, suggestion.id]);
      
      setTimeout(() => {
        scrollToTop();
      }, 300);
    };

    const isSuggestionAdded = (suggestionId) => {
      return addedSuggestions.includes(suggestionId);
    };

    return (
      <div ref={suggestionsRef} className="mt-8 bg-white rounded-md border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Athena AI Suggestions</h2>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          Based on your wellness journey, here are some gentle suggestions to support your mental health today. 
          Click "Add Activity" to add any suggestion to your wellness tracker above.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestions.map((suggestion) => {
            const Icon = iconMap[suggestion.icon] || Heart;
            const isAdded = isSuggestionAdded(suggestion.id);
            
            return (
              <div key={suggestion.id} className={`bg-gray-50 border ${isAdded ? 'border-green-200' : 'border-gray-200'} rounded-lg p-3 hover:bg-gray-100 transition-colors`}>
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {suggestion.category[0]}
                    </span>
                    {isAdded && (
                      <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Added
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{suggestion.notes}</p>
                <button
                  onClick={() => addSuggestion(suggestion)}
                  disabled={isAdded}
                  className={`w-full px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    isAdded 
                      ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' 
                      : 'bg-white border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {isAdded ? '✓ Added to Tracker' : 'Add Activity'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ScrollButton = () => {
    if (!showScrollButton) return null;

    return (
      <button
        onClick={scrollToBottom}
        className="fixed right-8 bottom-8 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 hover:scale-110"
        title="Scroll to Athena AI Suggestions"
      >
        <ArrowDown className="w-5 h-5" />
      </button>
    );
  };

  return (
    <div className="flex bg-[#FCF4F1] h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed position */}
      <div className={`${isSidebarVisible ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar 
          isSidebarVisible={isSidebarVisible}
          setIsSidebarVisible={setIsSidebarVisible}
        />
      </div>
      
      {/* Main Content - Dynamic width */}
      <div 
        ref={mainContentRef}
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'ml-0' : 'ml-0'
        }`}
        style={{
          width: isSidebarVisible ? 'calc(100% - 256px)' : '100%'
        }}
      >
        

        {/* Main Content Area - Proper padding and responsive width */}
        <div className="px-4 py-4 max-w-7xl mx-auto">
          {/* Title and Description */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-semibold">Wellness Tracker</h1>
            </div>
            <p className="text-xs text-gray-600 max-w-xl">
              A gentle, intuitive system for tracking mental wellness activities. Nourish your mind, one activity at a time.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wellness activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 w-full border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded-md border transition-colors ${
                  showFilters ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-300 hover:bg-gray-100'
                }`}
                title="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`p-1 rounded-md border transition-colors ${
                  showBulkActions ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-300 hover:bg-gray-100'
                }`}
                title="Bulk actions"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>
            
            {showFilters && (
              <div className="bg-white p-2 rounded-md border border-gray-200 mb-2 shadow-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Wellness Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {allCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setFilterStatus('');
                        setFilterCategory('');
                        setSearchTerm('');
                      }}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Showing {filteredAndSortedTasks.length} of {tasks.length} wellness activities
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 mb-2 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="p-0.5 hover:bg-red-100 rounded" title="Dismiss">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && <BulkActions />}

          {/* View Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "All Activities" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setViewMode("All Activities")}
              >
                <Menu className="w-3 h-3" />
                All Activities ({filteredAndSortedTasks.length})
              </button>
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "Grouped by status" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setViewMode("Grouped by status")}
              >
                <Target className="w-3 h-3" />
                Grouped by status
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Wellness Activity
              </button>
              <button
                onClick={scrollToBottom}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
                title="Go to Athena AI Suggestions"
              >
                <Brain className="w-3 h-3" />
                AI Suggestions
              </button>
            </div>
          </div>

          {/* New Task Form */}
          {showNewTaskForm && <NewTaskForm />}

          {/* Task Table - All Activities View */}
          {viewMode === "All Activities" ? (
            <div className="bg-white rounded-md border border-gray-200 shadow-sm">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                {showBulkActions && (
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                      onChange={selectAllTasks}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-3 h-3"
                    />
                  </div>
                )}
                <button 
                  className={`${showBulkActions ? 'col-span-4' : 'col-span-4'} flex items-center gap-1 text-left hover:text-gray-900 transition-colors`}
                  onClick={() => handleSort('title')}
                >
                  <Target className="w-3 h-3" />
                  Wellness Activities
                  {sortConfig.key === 'title' && (
                    <ArrowUpDown className={`w-2 h-2 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <button 
                  className="col-span-1 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <Zap className="w-3 h-3" />
                  Status
                  {sortConfig.key === 'status' && (
                    <ArrowUpDown className={`w-2 h-2 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <div className="col-span-2 flex items-center gap-1">
                  <Menu className="w-3 h-3" />
                  Wellness Category
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <Menu className="w-3 h-3" />
                  Notes
                </div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              <div>
                {filteredAndSortedTasks.map((task) => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    isEditing={editingTask === task.id}
                    showCheckbox={showBulkActions}
                  />
                ))}

                {isLoading && (
                  <div className="px-3 py-8 text-center text-xs text-gray-500">Loading wellness activities...</div>
                )}

                {!isLoading && filteredAndSortedTasks.length === 0 && (
                  <div className="px-3 py-8 text-center text-gray-500">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="text-base font-medium mb-2">No wellness activities found</h3>
                    <p className="text-xs mb-2">
                      {searchTerm || filterStatus || filterCategory
                        ? "Try adjusting your search or filters"
                        : "Start your wellness journey by adding your first self-care activity"
                      }
                    </p>
                    {!showNewTaskForm && (
                      <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="inline-flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-md text-xs hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add First Activity
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Activity Row */}
              {filteredAndSortedTasks.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <button 
                    onClick={() => setShowNewTaskForm(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New wellness activity</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Grouped View */
            <div className="space-y-4">
              {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                statusTasks.length > 0 && (
                  <div key={status} className="bg-white rounded-md border border-gray-200 shadow-sm">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[1]}`}></span>
                          {status} ({statusTasks.length})
                        </h3>
                        <div className="text-xs text-gray-500">
                          {status === 'Done' && `${Math.round((statusTasks.length / tasks.length) * 100)}% of all activities completed`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                      <div className="col-span-4 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Wellness Activities
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Menu className="w-3 h-3" />
                        Wellness Category
                      </div>
                      <div className="col-span-5 flex items-center gap-1">
                        <Menu className="w-3 h-3" />
                        Notes
                      </div>
                      <div className="col-span-1 text-center">Actions</div>
                    </div>
                    
                    {statusTasks.map((task) => (
                      <TaskRow 
                        key={task.id} 
                        task={task} 
                        isEditing={editingTask === task.id}
                        showCheckbox={false}
                      />
                    ))}
                  </div>
                )
              ))}
              
              {Object.values(groupedTasks).every(arr => arr.length === 0) && (
                <div className="bg-white rounded-md border border-gray-200 px-3 py-8 text-center text-gray-500 shadow-sm">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <h3 className="text-base font-medium mb-2">No wellness activities found</h3>
                  <p className="text-xs">Try adjusting your search or filters to see more activities</p>
                </div>
              )}
            </div>
          )}

          {/* Athena AI Suggestions Section */}
          <AthenaSuggestions />
        </div>

        {/* Scroll to Bottom Button */}
        <ScrollButton />
      </div>
    </div>
  );
}