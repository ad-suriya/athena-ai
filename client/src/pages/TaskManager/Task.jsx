import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, Calendar, Target, Zap, MoreHorizontal, Star, Share2, 
  Filter, ArrowUpDown, Search, Menu, Plus, ChevronDown, X, Edit, 
  Trash2, Save, AlertCircle, ShoppingCart, Send, Watch, Phone, 
  Book, Users, Briefcase, Heart, DollarSign, Home, Car, Plane,
  Coffee, Music, Camera, Gift
} from 'lucide-react';
import Sidebar from '../../components/SideBar';

export default function TaskManager() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      icon: 'ShoppingCart',
      title: "Go grocery shopping",
      deadline: "2025-09-25T11:00",
      status: "To Do",
      priority: "Low",
      category: ["Personal", "Family"],
      notes: "Make sure you have enough food for the week.",
      completed: false
    },
    {
      id: 2,
      icon: 'Send',
      title: "Send email to Tim Cook",
      deadline: "2025-10-31T14:30",
      status: "In progress",
      priority: "High",
      category: ["Personal"],
      notes: "Draft questions regarding upcoming collaboration opportunities.",
      completed: false
    },
    {
      id: 3,
      icon: 'Target',
      title: "Set goals for next week",
      deadline: "2026-03-21T22:30",
      status: "In progress",
      priority: "Medium",
      category: ["Personal", "Work"],
      notes: "Create a list of tasks and priorities for the upcoming week.",
      completed: false
    },
    {
      id: 4,
      icon: 'Watch',
      title: "Order a new Apple Watch",
      deadline: "2026-09-16T12:30",
      status: "In progress",
      priority: "Medium",
      category: ["Personal"],
      notes: "Compare models, check reviews and place the order.",
      completed: false
    },
    {
      id: 5,
      icon: 'Phone',
      title: "Call Son",
      deadline: "2026-09-17T11:30",
      status: "Done",
      priority: "Low",
      category: ["Family"],
      notes: "Check in on how he's doing and discuss weekend meet up.",
      completed: true
    },
    {
      id: 6,
      icon: 'Book',
      title: "Read a chapter of a book",
      deadline: "2026-09-25T21:30",
      status: "To Do",
      priority: "Low",
      category: ["Personal development"],
      notes: "Read a chapter of a book to improve knowledge.",
      completed: false
    }
  ]);

  const [viewMode, setViewMode] = useState("All Tasks");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    status: 'To Do',
    priority: 'Medium',
    category: [],
    notes: '',
    icon: 'Target'
  });

  const iconMap = {
    ShoppingCart, Send, Target, Watch, Phone, Book, CheckSquare, Calendar, 
    Zap, Star, Users, Briefcase, Heart, DollarSign, Home, Car, Plane,
    Coffee, Music, Camera, Gift
  };

  const availableIcons = Object.keys(iconMap);
  const availableCategories = [
    'Personal', 'Work', 'Family', 'Personal development', 'Health', 
    'Finance', 'Travel', 'Shopping', 'Social', 'Learning', 'Hobbies'
  ];
  const statusOptions = ['To Do', 'In progress', 'Done', 'Cancelled'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  const allCategories = useMemo(() => {
    const categories = new Set();
    tasks.forEach(task => {
      task.category.forEach(cat => categories.add(cat));
    });
    availableCategories.forEach(cat => categories.add(cat));
    return Array.from(categories).sort();
  }, [tasks]);

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

  const priorityDropdownOptions = [
    { value: 'High', label: 'High', color: 'bg-red-100 text-red-600' },
    { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-600' },
    { value: 'Low', label: 'Low', color: 'bg-blue-100 text-blue-600' }
  ];

  const categoryDropdownOptions = allCategories.map(cat => ({
    value: cat,
    label: cat,
    color: 'bg-gray-100 text-gray-700'
  }));

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !filterStatus || task.status === filterStatus;
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      const matchesCategory = !filterCategory || task.category.includes(filterCategory);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'deadline') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory, sortConfig]);

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

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      ...newTask,
      id: Date.now(),
      category: newTask.category.filter(cat => cat.trim() !== ''),
      completed: newTask.status === 'Done'
    };
    
    setTasks(prev => [...prev, task]);
    resetNewTaskForm();
    setShowNewTaskForm(false);
  };

  const resetNewTaskForm = () => {
    setNewTask({
      title: '',
      deadline: '',
      status: 'To Do',
      priority: 'Medium',
      category: [],
      notes: '',
      icon: 'Target'
    });
  };

  const updateTask = (id, updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        ...updatedTask,
        completed: updatedTask.status === 'Done'
      } : task
    ));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
      setSelectedTasks(prev => prev.filter(taskId => taskId !== id));
    }
  };

  const duplicateTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(),
      title: `${task.title} (Copy)`,
      status: 'To Do',
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
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
    setTasks(prev => prev.map(task => 
      selectedTasks.includes(task.id) 
        ? { ...task, status, completed: status === 'Done' }
        : task
    ));
    setSelectedTasks([]);
  };

  const bulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const isOverdue = date < now;
    const formatted = date.toLocaleDateString('en-GB') + ' ' + 
                     date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    return { formatted, isOverdue };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do": return "text-red-600 bg-red-100";
      case "In progress": return "text-blue-600 bg-blue-100";
      case "Done": return "text-green-600 bg-green-100";
      case "Cancelled": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "text-purple-700 bg-purple-100 border-purple-200";
      case "High": return "text-red-700 bg-red-100 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "Low": return "text-blue-700 bg-blue-100 border-blue-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const TaskRow = ({ task, isEditing = false, showCheckbox = false }) => {
    const [editData, setEditData] = useState(task);
    const IconComponent = iconMap[task.icon] || Target;
    const { formatted: deadlineFormatted, isOverdue } = formatDeadline(task.deadline);

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
          
          <div className="col-span-2 flex items-center">
            <input
              type="datetime-local"
              value={editData.deadline}
              onChange={(e) => setEditData(prev => ({...prev, deadline: e.target.value}))}
              className="text-xs text-blue-600 bg-white border rounded px-2 py-1 w-full"
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
          
          <div className="col-span-1 flex items-center">
            <select
              value={editData.priority}
              onChange={(e) => setEditData(prev => ({...prev, priority: e.target.value}))}
              className="text-xs bg-white border rounded px-2 py-1 w-full"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2 flex items-center">
            <input
              type="text"
              value={editData.category.join(', ')}
              onChange={(e) => setEditData(prev => ({...prev, category: e.target.value.split(',').map(s => s.trim())}))}
              placeholder="Personal, Work"
              className="text-xs text-gray-600 bg-white border rounded px-2 py-1 w-full"
            />
          </div>
          
          <div className="col-span-2 flex items-center gap-2">
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
        
        <div className={`${showCheckbox ? 'col-span-3' : 'col-span-3'} flex items-center gap-2`}>
          <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <span className={`text-xs font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </span>
        </div>
        
        <div className="col-span-2 flex items-center">
          <span className={`text-xs ${isOverdue && !task.completed ? 'text-red-600 font-medium' : 'text-blue-600'}`}>
            {deadlineFormatted}
            {isOverdue && !task.completed && <span className="ml-1 text-[10px]">(Overdue)</span>}
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
        
        <div className="col-span-1 flex items-center relative">
          <button
            onClick={() => setShowPriorityDropdown(showPriorityDropdown === task.id ? null : task.id)}
            className={`px-1 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(task.priority)} hover:opacity-80 cursor-pointer flex items-center gap-1`}
          >
            {task.priority}
            <ChevronDown className="w-2 h-2" />
          </button>
          <Dropdown
            isOpen={showPriorityDropdown === task.id}
            onClose={() => setShowPriorityDropdown(null)}
            value={task.priority}
            onChange={(newPriority) => updateTask(task.id, { priority: newPriority })}
            options={priorityDropdownOptions}
            placeholder="Select a priority"
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
                className="inline-flex bg-gray-100 text-gray-700 px-1 py-0.5 rounded-full text-[10px] hover:bg-gray-200 cursor-pointer items-center gap-1"
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
        
        <div className="col-span-2 flex items-center">
          <span className="text-xs text-gray-600 truncate" title={task.notes}>
            {task.notes}
          </span>
        </div>

        <div className="col-span-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingTask(task.id)}
            className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit task"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => duplicateTask(task)}
            className="p-0.5 text-green-600 hover:bg-green-100 rounded"
            title="Duplicate task"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
            title="Delete task"
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
        <h3 className="text-base font-medium">Add New Task</h3>
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
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) addTask();
            }}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) => setNewTask(prev => ({...prev, deadline: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask(prev => ({...prev, priority: e.target.value}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            {priorityOptions.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
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
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Categories</label>
          <input
            type="text"
            value={newTask.category.join(', ')}
            onChange={(e) => setNewTask(prev => ({...prev, category: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Personal, Work, Family"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {availableCategories.slice(0, 6).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const categories = newTask.category.includes(cat) 
                    ? newTask.category.filter(c => c !== cat)
                    : [...newTask.category, cat];
                  setNewTask(prev => ({...prev, category: categories}));
                }}
                className={`text-[10px] px-1 py-0.5 rounded-full border ${
                  newTask.category.includes(cat)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
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
            placeholder="Enter task notes"
          />
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={addTask}
          disabled={!newTask.title.trim()}
          className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Task
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
    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-900">
          {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
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

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 sm:w-48 bg-white border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              <span className="text-xs text-gray-500">Tasks</span>
              <span className="text-xs text-gray-400">Private</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Edited just now</span>
              <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                <Share2 className="w-3 h-3" />
                Share
              </button>
              <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {/* Title and Description */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-6 h-6" />
              <h1 className="text-2xl font-semibold">Tasks</h1>
            </div>
            <p className="text-xs text-gray-600 max-w-xl">
              A simple, intuitive task management system. Focus on what matters most.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 w-full border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded-md border transition-colors ${
                  showFilters ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-100'
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
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Priorities</option>
                      {priorityOptions.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                        setFilterPriority('');
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
                  Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && <BulkActions />}

          {/* View Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "All Tasks" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setViewMode("All Tasks")}
              >
                <Menu className="w-3 h-3" />
                All Tasks ({filteredAndSortedTasks.length})
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
                className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                New Task
              </button>
            </div>
          </div>

          {/* New Task Form */}
          {showNewTaskForm && <NewTaskForm />}

          {/* Task Table - All Tasks View */}
          {viewMode === "All Tasks" ? (
            <div className="bg-white rounded-md border border-gray-200 shadow-sm">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                {showBulkActions && (
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                      onChange={selectAllTasks}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                    />
                  </div>
                )}
                <button 
                  className={`${showBulkActions ? 'col-span-3' : 'col-span-3'} flex items-center gap-1 text-left hover:text-gray-900 transition-colors`}
                  onClick={() => handleSort('title')}
                >
                  <Target className="w-3 h-3" />
                  Tasks
                  {sortConfig.key === 'title' && (
                    <ArrowUpDown className={`w-2 h-2 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <button 
                  className="col-span-2 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('deadline')}
                >
                  <Calendar className="w-3 h-3" />
                  Deadline
                  {sortConfig.key === 'deadline' && (
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
                <button 
                  className="col-span-1 flex items-center gap-1 text-left hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <Star className="w-3 h-3" />
                  Priority
                  {sortConfig.key === 'priority' && (
                    <ArrowUpDown className={`w-2 h-2 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <div className="col-span-2 flex items-center gap-1">
                  <Menu className="w-3 h-3" />
                  Category
                </div>
                <div className="col-span-2 flex items-center gap-1">
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

                {filteredAndSortedTasks.length === 0 && (
                  <div className="px-3 py-8 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <h3 className="text-base font-medium mb-2">No tasks found</h3>
                    <p className="text-xs mb-2">
                      {searchTerm || filterStatus || filterPriority || filterCategory
                        ? "Try adjusting your search or filters"
                        : "Get started by creating your first task"
                      }
                    </p>
                    {!showNewTaskForm && (
                      <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add First Task
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Page Row */}
              {filteredAndSortedTasks.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <button 
                    onClick={() => setShowNewTaskForm(true)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New page</span>
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
                          {status === 'Done' && `${Math.round((statusTasks.length / tasks.length) * 100)}% of all tasks`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                      <div className="col-span-3 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Tasks
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Deadline
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Priority
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Menu className="w-3 h-3" />
                        Category
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
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
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <h3 className="text-base font-medium mb-2">No tasks found</h3>
                  <p className="text-xs">Try adjusting your search or filters to see more tasks</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
