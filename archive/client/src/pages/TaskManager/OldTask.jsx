import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  List,
  LayoutGrid,
  Plus,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock,
  Flag,
  Tag,
  Check,
  GripVertical,
  CheckCircle,
  Circle,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Download,
  Upload,
  FileText,
  Copy,
  RotateCcw,
  Search,
  User,
  MessageSquare,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Users,
  CheckSquare,
  ChevronsUpDown,
  ArrowLeft
} from 'lucide-react';

// Mock user data
const mockUsers = [
  { id: 'user1', name: 'Alex Johnson', initials: 'AJ', color: 'bg-blue-500' },
  { id: 'user2', name: 'Maria Garcia', initials: 'MG', color: 'bg-green-500' },
  { id: 'user3', name: 'Sam Wilson', initials: 'SW', color: 'bg-purple-500' },
  { id: 'user4', name: 'Taylor Smith', initials: 'TS', color: 'bg-pink-500' },
  { id: 'user5', name: 'Jordan Lee', initials: 'JL', color: 'bg-indigo-500' }
];

// Priority options
const priorityOptions = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' }
];

// Type options
const typeOptions = [
  { value: 'Feature', label: 'Feature', color: 'bg-blue-100 text-blue-800' },
  { value: 'Bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
  { value: 'Review', label: 'Review', color: 'bg-purple-100 text-purple-800' },
  { value: 'Testing', label: 'Testing', color: 'bg-teal-100 text-teal-800' }
];

const TaskManager = () => {
  // State for view type (list or kanban)
  const [viewType, setViewType] = useState('list');
  
  // State for task status sections expansion
  const [expandedStatuses, setExpandedStatuses] = useState({
    todo: true,
    inProgress: true,
    review: true,
    done: true
  });

  // State for dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // State for sorting
  const [sortOption, setSortOption] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // State for filtering
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    tags: [],
    completion: 'all',
    dueDateRange: { start: '', end: '' }
  });
  const [activeFilterChips, setActiveFilterChips] = useState([]);
  
  // State for archived tasks
  const [showArchived, setShowArchived] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState([]);
  
  // State for subtasks
  const [subtasks, setSubtasks] = useState({});
  
  // State for comments
  const [comments, setComments] = useState({});
  
  // State for new task form
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserSelect, setShowUserSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Refs
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const dueDateRef = useRef(null);
  const dueTimeRef = useRef(null);
  const priorityRef = useRef(null);
  const tagsRef = useRef(null);
  const typeRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // Sample initial tasks data
  const initialTasks = {
    todo: [
      {
        id: '1',
        title: 'Implement New Feature',
        description: 'Add a dark mode option for improved UX',
        dueDate: '2024-05-15',
        dueTime: '14:00',
        priority: 'high',
        tags: ['Feature'],
        type: 'Feature',
        people: ['user1', 'user2'],
        timeline: '17 April 2024 - 15 May 2024',
        createdAt: '2023-05-20T09:30:00',
        completed: false,
        archived: false
      },
      {
        id: '2',
        title: 'Fix Payment Bug',
        description: 'The save button is not working on mobile',
        dueDate: '2024-07-18',
        dueTime: '10:00',
        priority: 'urgent',
        tags: ['Bug'],
        type: 'Bug',
        people: ['user4'],
        timeline: '10 May 2024 - 18 July 2024',
        createdAt: '2023-05-18T14:15:00',
        completed: false,
        archived: false
      }
    ],
    inProgress: [
      {
        id: '3',
        title: 'Review Final Design',
        description: 'Provide feedback on the latest UI prototypes',
        dueDate: '2024-07-17',
        dueTime: '16:30',
        priority: 'medium',
        tags: ['Review'],
        type: 'Review',
        people: ['user3'],
        timeline: '11 June 2024 - 17 July 2024',
        createdAt: '2023-05-15T11:20:00',
        completed: false,
        archived: false
      }
    ],
    review: [
      {
        id: '4',
        title: 'Quality Check',
        description: 'Conduct thorough testing of updated software',
        dueDate: '2024-06-11',
        dueTime: '11:00',
        priority: 'low',
        tags: ['Testing'],
        type: 'Testing',
        people: ['user5'],
        timeline: '27 May 2024 - 11 June 2024',
        createdAt: '2023-05-10T13:45:00',
        completed: false,
        archived: false
      }
    ],
    done: [
      {
        id: '5',
        title: 'Optimize Database',
        description: 'Improve database query efficiency & scalability',
        dueDate: '2024-05-15',
        dueTime: '10:30',
        priority: 'low',
        tags: ['Feature'],
        type: 'Feature',
        people: ['user1', 'user5'],
        timeline: '17 April 2024 - 15 May 2024',
        createdAt: '2023-04-25T08:45:00',
        completed: true,
        archived: false
      }
    ]
  };

  const [tasks, setTasks] = useState(initialTasks);

  // Initialize data from localStorage with error handling
  useEffect(() => {
    const loadFromLocalStorage = (key, defaultValue) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error(`Error parsing ${key} from localStorage:`, error);
        return defaultValue;
      }
    };

    setTasks(loadFromLocalStorage('tasks', initialTasks));
    setArchivedTasks(loadFromLocalStorage('archivedTasks', []));
    setSubtasks(loadFromLocalStorage('subtasks', {}));
    setComments(loadFromLocalStorage('comments', {}));
  }, []);

  // Save data to localStorage with debouncing
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
      localStorage.setItem('subtasks', JSON.stringify(subtasks));
      localStorage.setItem('comments', JSON.stringify(comments));
    }, 500);

    return () => clearTimeout(debounceSave);
  }, [tasks, archivedTasks, subtasks, comments]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openNewTaskModal();
      }
      if (e.key === 'Escape') {
        closeModal();
        setDetailModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (showUserSelect && !event.target.closest('.user-select-container')) {
        setShowUserSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserSelect]);

  // Initialize subtasks for new tasks
  useEffect(() => {
    const initialSubtasks = {};
    Object.values(tasks).flat().forEach(task => {
      if (!subtasks[task.id]) {
        initialSubtasks[task.id] = [
          { id: `${task.id}-1`, text: 'First subtask', completed: false },
          { id: `${task.id}-2`, text: 'Second subtask', completed: false }
        ];
      }
    });
    if (Object.keys(initialSubtasks).length > 0) {
      setSubtasks(prev => ({ ...prev, ...initialSubtasks }));
    }
  }, [tasks, subtasks]);

  // Handle sort option change
  const handleSortOption = (option) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Open new task modal
  const openNewTaskModal = () => {
    setEditingTask(null);
    setSelectedUsers([]);
    setIsModalOpen(true);
    setTimeout(() => titleRef.current?.focus(), 100);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setShowUserSelect(false);
  };

  // Handle form submission with null checks
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titleRef.current?.value.trim()) {
      alert('Title is required');
      return;
    }

    const newTask = {
      id: editingTask?.id || `task-${Date.now()}`,
      title: titleRef.current?.value || '',
      description: descriptionRef.current?.value || '',
      dueDate: dueDateRef.current?.value || '',
      dueTime: dueTimeRef.current?.value || '',
      priority: priorityRef.current?.value || 'medium',
      tags: tagsRef.current?.value.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      type: typeRef.current?.value || 'Feature',
      people: selectedUsers,
      timeline: '',
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      completed: editingTask?.completed || false,
      archived: false
    };

    if (editingTask) {
      // Update existing task
      const originalStatus = editingTask.originalStatus || 
        Object.entries(tasks).find(([_, tasks]) => 
          tasks.some(t => t.id === editingTask.id)
        )?.[0];

      setTasks(prev => {
        const newTasks = { ...prev };
        
        // Remove from original status
        if (originalStatus) {
          newTasks[originalStatus] = newTasks[originalStatus].filter(t => t.id !== editingTask.id);
        }
        
        // Add to appropriate status (todo or done)
        const targetStatus = newTask.completed ? 'done' : 'todo';
        newTasks[targetStatus] = [...newTasks[targetStatus], newTask];
        
        return newTasks;
      });
    } else {
      // Add new task
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, newTask]
      }));
    }

    closeModal();
  };

  // Toggle section expansion
  const toggleSection = (status) => {
    setExpandedStatuses(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Filter tasks based on current filters
  const filterTasks = useCallback((taskList) => {
    return taskList.filter(task => {
      // Search query
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by completion state
      if (filters.completion === 'completed' && !task.completed) return false;
      if (filters.completion === 'incomplete' && task.completed) return false;
      
      // Filter by priority
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      
      // Filter by tags
      if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) return false;
      
      // Filter by due date range
      if (filters.dueDateRange.start && new Date(task.dueDate) < new Date(filters.dueDateRange.start)) return false;
      if (filters.dueDateRange.end && new Date(task.dueDate) > new Date(filters.dueDateRange.end)) return false;
      
      return true;
    });
  }, [filters, searchQuery]);

  // Sort tasks based on selected option
  const sortTasks = (taskList) => {
    const sorted = [...taskList];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  // Memoized filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    return Object.fromEntries(
      Object.entries(tasks).map(([status, taskList]) => [
        status,
        sortTasks(filterTasks(taskList))
      ])
    );
  }, [tasks, sortOption, sortDirection, filters, searchQuery]);

  // Toggle task completion
  const toggleTaskCompletion = (taskId, currentStatus) => {
    const newTasks = { ...tasks };
    const taskIndex = newTasks[currentStatus].findIndex(t => t.id === taskId);
    const task = newTasks[currentStatus][taskIndex];
    
    // Remove from current status
    newTasks[currentStatus].splice(taskIndex, 1);
    
    // Add to appropriate status
    const targetStatus = task.completed ? 'todo' : 'done';
    newTasks[targetStatus].push({
      ...task,
      completed: !task.completed
    });
    
    setTasks(newTasks);
  };

  // Toggle subtask completion
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setSubtasks(prev => {
      const newSubtasks = { ...prev };
      const subtaskIndex = newSubtasks[taskId].findIndex(st => st.id === subtaskId);
      newSubtasks[taskId][subtaskIndex].completed = !newSubtasks[taskId][subtaskIndex].completed;
      return newSubtasks;
    });
  };

  // Add subtask
  const addSubtask = (taskId) => {
    if (!newSubtask.trim()) return;
    
    setSubtasks(prev => ({
      ...prev,
      [taskId]: [
        ...(prev[taskId] || []),
        { id: `subtask-${Date.now()}`, text: newSubtask, completed: false }
      ]
    }));
    setNewSubtask('');
  };

  // Add comment
  const addComment = (taskId) => {
    if (!newComment.trim()) return;
    
    setComments(prev => ({
      ...prev,
      [taskId]: [
        ...(prev[taskId] || []),
        {
          id: `comment-${Date.now()}`,
          text: newComment,
          author: 'You',
          timestamp: new Date().toISOString()
        }
      ]
    }));
    setNewComment('');
  };

  // Archive a task
  const archiveTask = (taskId, status) => {
    const taskToArchive = tasks[status].find(t => t.id === taskId);
    if (!taskToArchive) return;
    
    setArchivedTasks(prev => [...prev, { ...taskToArchive, archived: true }]);
    
    setTasks(prev => ({
      ...prev,
      [status]: prev[status].filter(task => task.id !== taskId)
    }));
  };

  // Bulk archive completed tasks
  const bulkArchiveCompleted = () => {
    const completedTasks = Object.entries(tasks).flatMap(([status, tasks]) => 
      tasks.filter(t => t.completed).map(t => ({ ...t, originalStatus: status }))
    );
    
    if (completedTasks.length === 0) {
      alert('No completed tasks to archive');
      return;
    }
    
    if (window.confirm(`Archive ${completedTasks.length} completed tasks?`)) {
      setArchivedTasks(prev => [...prev, ...completedTasks.map(t => ({ ...t, archived: true }))]);
      
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(task => !task.completed);
        });
        return newTasks;
      });
    }
  };

  // Restore a task from archive
  const restoreTask = (taskId) => {
    const taskToRestore = archivedTasks.find(t => t.id === taskId);
    if (!taskToRestore) return;
    
    const targetStatus = taskToRestore.completed ? 'done' : 'todo';
    
    setTasks(prev => ({
      ...prev,
      [targetStatus]: [...prev[targetStatus], { ...taskToRestore, archived: false }]
    }));
    
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Delete a task
  const deleteTask = (taskId, status) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      if (status === 'archived') {
        setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        setTasks(prev => ({
          ...prev,
          [status]: prev[status].filter(task => task.id !== taskId)
        }));
      }
    }
  };

  // Delete archived task permanently
  const deleteArchivedTask = (taskId) => {
    if (window.confirm('Permanently delete this task?')) {
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  // Clone a task
  const cloneTask = (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, newTask]
    }));
  };

  // Open task detail modal
  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  // Open edit task modal
  const openEditTaskModal = (task, status) => {
    setEditingTask({ ...task, originalStatus: status });
    setSelectedUsers(task.people);
    setIsModalOpen(true);
  };

  // Export tasks to JSON
  const exportToJSON = () => {
    const allTasks = [...Object.values(tasks).flat(), ...archivedTasks];
    const dataStr = JSON.stringify(allTasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import tasks from JSON
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        
        // Separate archived and active tasks
        const activeTasks = importedTasks.filter(task => !task.archived);
        const archived = importedTasks.filter(task => task.archived);
        
        // Reorganize active tasks by status
        const reorganizedTasks = {
          todo: activeTasks.filter(task => !task.completed),
          inProgress: [],
          review: [],
          done: activeTasks.filter(task => task.completed)
        };
        
        setTasks(reorganizedTasks);
        setArchivedTasks(archived);
        alert(`${importedTasks.length} tasks imported successfully`);
      } catch (error) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Apply filters and generate filter chips
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    
    // Generate filter chips
    const chips = [];
    if (newFilters.completion !== 'all') {
      chips.push(newFilters.completion === 'completed' ? 'Completed' : 'Incomplete');
    }
    if (newFilters.priority.length > 0) {
      chips.push(...newFilters.priority.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)} Priority`));
    }
    if (newFilters.tags.length > 0) {
      chips.push(...newFilters.tags);
    }
    if (newFilters.dueDateRange.start || newFilters.dueDateRange.end) {
      chips.push('Date Range');
    }
    setActiveFilterChips(chips);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: [],
      priority: [],
      tags: [],
      completion: 'all',
      dueDateRange: { start: '', end: '' }
    });
    setActiveFilterChips([]);
  };

  // Drag and drop handlers
  const handleDragStart = (e, task, status) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ task, status }));
    setDraggedTask({ ...task, originalStatus: status });
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    
    const { task, status: originalStatus } = JSON.parse(data);
    
    // If dropped in the same column, do nothing
    if (originalStatus === targetStatus) {
      setDraggedTask(null);
      setDragOverStatus(null);
      return;
    }

    setTasks(prev => {
      const newTasks = { ...prev };
      
      // Remove from original status
      newTasks[originalStatus] = newTasks[originalStatus].filter(
        t => t.id !== task.id
      );
      
      // Add to target status
      newTasks[targetStatus] = [...newTasks[targetStatus], {
        ...task,
        completed: targetStatus === 'done' ? true : 
                  (targetStatus === 'todo' ? false : task.completed)
      }];
      
      return newTasks;
    });

    setDraggedTask(null);
    setDragOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverStatus(null);
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = priorityOptions.find(p => p.value === priority) || 
      { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.color}`}>
        {priorityConfig.label}
      </span>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }) => {
    const typeConfig = typeOptions.find(t => t.value === type) || 
      { label: 'Task', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
        {typeConfig.label}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status, count }) => {
    const statusConfig = {
      todo: { 
        className: 'bg-orange-50 text-orange-600 border border-orange-200', 
        icon: Circle,
        label: 'To Do'
      },
      inProgress: { 
        className: 'bg-yellow-50 text-yellow-600 border border-yellow-200', 
        icon: Clock,
        label: 'In Progress'
      },
      review: { 
        className: 'bg-blue-50 text-blue-600 border border-blue-200', 
        icon: AlertCircle,
        label: 'Review'
      },
      done: { 
        className: 'bg-green-50 text-green-600 border border-green-200', 
        icon: CheckCircle,
        label: 'Done'
      },
      archived: {
        className: 'bg-gray-100 text-gray-600 border border-gray-200',
        icon: Archive,
        label: 'Archived'
      }
    };

    const config = statusConfig[status] || statusConfig.todo;
    const StatusIcon = config.icon;

    return (
      <div className={`flex items-center px-3 py-1 rounded-md ${config.className}`}>
        <StatusIcon size={16} className="mr-2" />
        <span className="font-medium">{config.label}</span>
        <span className="ml-2 bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs font-semibold">
          {count}
        </span>
      </div>
    );
  };

  // People avatars component
  const PeopleAvatars = ({ people, editable = false, onChange }) => {
    const toggleUser = (userId) => {
      if (editable && onChange) {
        const newUsers = people.includes(userId)
          ? people.filter(id => id !== userId)
          : [...people, userId];
        onChange(newUsers);
      }
    };

    return (
      <div className="flex -space-x-1">
        {people.slice(0, 4).map((person, index) => {
          const user = mockUsers.find(u => u.id === person) || { 
            initials: 'U', 
            color: 'bg-gray-500' 
          };
          
          return (
            <div 
              key={person}
              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white ${user.color} ${editable ? 'cursor-pointer' : ''}`}
              onClick={() => editable && toggleUser(person)}
              title={user.name}
            >
              {user.initials}
            </div>
          );
        })}
        {people.length > 4 && (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
            +{people.length - 4}
          </div>
        )}
      </div>
    );
  };

  // Due date component with overdue indicator
  const DueDateDisplay = ({ dueDate }) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    const isOverdue = taskDueDate < today;
    
    return (
      <div className={`flex items-center text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
        <CalendarIcon size={14} className="mr-1" />
        <span>{new Date(dueDate).toLocaleDateString()}</span>
        {isOverdue && <span className="ml-1">(Overdue)</span>}
      </div>
    );
  };

  // Subtask progress component
  const SubtaskProgress = ({ taskId }) => {
    if (!subtasks[taskId] || subtasks[taskId].length === 0) return null;
    
    const completedCount = subtasks[taskId].filter(st => st.completed).length;
    const totalCount = subtasks[taskId].length;
    const percentage = Math.round((completedCount / totalCount) * 100);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Subtasks ({completedCount}/{totalCount})</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Filter dropdown component
  const FilterDropdown = () => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (filterType, value) => {
      if (filterType === 'completion') {
        setLocalFilters(prev => ({ ...prev, completion: value }));
      } else {
        setLocalFilters(prev => {
          const currentValues = [...prev[filterType]];
          const index = currentValues.indexOf(value);

          if (index === -1) {
            currentValues.push(value);
          } else {
            currentValues.splice(index, 1);
          }

          return { ...prev, [filterType]: currentValues };
        });
      }
    };

    const handleDateRangeChange = (type, value) => {
      setLocalFilters(prev => ({
        ...prev,
        dueDateRange: { ...prev.dueDateRange, [type]: value }
      }));
    };

    return (
      <div
        ref={filterDropdownRef}
        className="absolute left-0 mt-2 w-[600px] bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-xl z-50 border border-gray-100 p-4 transition-all duration-300"
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Completion */}
          <div className="col-span-1">
            <h3 className="text-xs font-semibold text-gray-800 mb-2 tracking-wide">Completion</h3>
            <div className="flex flex-col space-y-2 text-xs">
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors min-w-[80px]">
                  <input
                    type="radio"
                    checked={localFilters.completion === 'all'}
                    onChange={() => handleFilterChange('completion', 'all')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-gray-700 font-medium">All</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors min-w-[80px]">
                  <input
                    type="radio"
                    checked={localFilters.completion === 'completed'}
                    onChange={() => handleFilterChange('completion', 'completed')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-gray-700 font-medium">Completed</span>
                </label>
              </div>
              <label className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors min-w-[80px]">
                <input
                  type="radio"
                  checked={localFilters.completion === 'incomplete'}
                  onChange={() => handleFilterChange('completion', 'incomplete')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full"
                />
                <span className="ml-2 text-gray-700 font-medium">Incomplete</span>
              </label>
            </div>
          </div>

          {/* Priority */}
          <div className="col-span-1">
            <h3 className="text-xs font-semibold text-gray-800 mb-2 tracking-wide">Priority</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {priorityOptions.map(option => (
                <label key={option.value} className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.priority.includes(option.value)}
                    onChange={() => handleFilterChange('priority', option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="col-span-1">
            <h3 className="text-xs font-semibold text-gray-800 mb-2 tracking-wide">Tags</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {typeOptions.map(option => (
                <label key={option.value} className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.tags.includes(option.value)}
                    onChange={() => handleFilterChange('tags', option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date Range */}
          <div className="col-span-3 mt-2">
            <h3 className="text-xs font-semibold text-gray-800 mb-2 tracking-wide">Due Date Range</h3>
            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1 font-medium">From</label>
                <input
                  type="date"
                  value={localFilters.dueDateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1 font-medium">To</label>
                <input
                  type="date"
                  value={localFilters.dueDateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
          <button
            onClick={() => {
              setLocalFilters({
                status: [],
                priority: [],
                tags: [],
                completion: 'all',
                dueDateRange: { start: '', end: '' }
              });
            }}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center"
          >
            <X size={14} className="mr-1 text-gray-500" />
            Reset All
          </button>
          <button
            onClick={() => {
              applyFilters(localFilters);
              setIsFilterOpen(false);
            }}
            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  // Sort dropdown component
  const SortDropdown = () => {
    const sortOptions = [
      { value: 'title', label: 'Title' },
      { value: 'priority', label: 'Priority' },
      { value: 'dueDate', label: 'Due Date' },
      { value: 'createdAt', label: 'Created Date' }
    ];
    
    return (
      <div ref={sortDropdownRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
        <div className="py-1">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortOption(option.value)}
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${sortOption === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {option.label}
              {sortOption === option.value && <Check size={16} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Kanban view component
  const KanbanView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(filteredAndSortedTasks).map(([status, taskList]) => (
          <div
            key={status}
            className={`p-4 rounded-lg border-2 ${
              dragOverStatus === status ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
          >
            <StatusBadge status={status} count={taskList.length} />
            <div className="mt-4 space-y-4">
              {taskList.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, status)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => openTaskDetail(task)}
                    >
                      {task.title}
                    </h4>
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === task.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                openEditTaskModal(task, status);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                cloneTask(task);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Copy size={14} className="mr-2" />
                              Clone
                            </button>
                            <button
                              onClick={() => {
                                archiveTask(task.id, status);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Archive size={14} className="mr-2" />
                              Archive
                            </button>
                            <button
                              onClick={() => {
                                deleteTask(task.id, status);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{task.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <PriorityBadge priority={task.priority} />
                    <PeopleAvatars people={task.people} />
                  </div>
                  <DueDateDisplay dueDate={task.dueDate} />
                  <TypeBadge type={task.type} />
                  <SubtaskProgress taskId={task.id} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Archived view component
  const ArchivedView = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Archived Tasks ({archivedTasks.length})
            </h3>
            <button
              onClick={() => setShowArchived(false)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <X size={16} className="mr-1" />
              Close Archive
            </button>
          </div>
          
          {archivedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-lg font-medium mb-2">No archived tasks</h4>
              <p>Tasks you archive will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortTasks(archivedTasks).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {task.title}
                    </h4>
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === task.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                restoreTask(task.id);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                            >
                              <RotateCcw size={14} className="mr-2" />
                              Restore
                            </button>
                            <button
                              onClick={() => {
                                deleteArchivedTask(task.id);
                                setActiveDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Permanently
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <PriorityBadge priority={task.priority} />
                    <PeopleAvatars people={task.people} />
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <DueDateDisplay dueDate={task.dueDate} />
                    <TypeBadge type={task.type} />
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Status: {task.completed ? 'Done' : 'Todo'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Task list view
  const ListView = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {Object.entries(filteredAndSortedTasks).map(([status, taskList]) => (
          <div key={status} className="border-b border-gray-200 last:border-b-0">
            <div 
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection(status)}
            >
              <StatusBadge status={status} count={taskList.length} />
              <button className="text-gray-500 hover:text-gray-700">
                {expandedStatuses[status] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedStatuses[status] && taskList.length > 0 && (
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[1000px]">
                  <div className="col-span-1 flex items-center">
                    <GripVertical size={16} className="text-gray-400" />
                  </div>
                  <div className="col-span-3">Task Name</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">People</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-1">Priority</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Table Body */}
                <div className="min-w-[1000px]">
                  {taskList.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, status)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="col-span-1 flex items-center">
                        <button 
                          onClick={() => toggleTaskCompletion(task.id, status)}
                          className="mr-2 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                      </div>
                      
                      <div className="col-span-3 flex items-center">
                        <span 
                          className={`text-sm font-medium cursor-pointer hover:text-blue-600 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                          onClick={() => openTaskDetail(task)}
                        >
                          {task.title}
                        </span>
                      </div>
                      
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-600 truncate">
                          {task.description}
                        </span>
                      </div>
                      
                      <div className="col-span-1 flex items-center">
                        <PeopleAvatars people={task.people} />
                      </div>
                      
                      <div className="col-span-1 flex items-center">
                        <TypeBadge type={task.type} />
                      </div>
                      
                      <div className="col-span-2 flex items-center">
                        <DueDateDisplay dueDate={task.dueDate} />
                      </div>
                      
                      <div className="col-span-1 flex items-center">
                        <PriorityBadge priority={task.priority} />
                      </div>
                      
                      {/* Action Dropdown */}
                      <div className="col-span-1 flex items-center justify-end">
                        <div className="relative">
                          <button 
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === `${task.id}-${status}` ? null : `${task.id}-${status}`);
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {activeDropdown === `${task.id}-${status}` && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    openEditTaskModal(task, status);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Pencil size={14} className="mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    cloneTask(task);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Copy size={14} className="mr-2" />
                                  Clone
                                </button>
                                <button
                                  onClick={() => {
                                    archiveTask(task.id, status);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Archive size={14} className="mr-2" />
                                  Archive
                                </button>
                                <button
                                  onClick={() => {
                                    deleteTask(task.id, status);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Task Detail Modal
  const TaskDetailModal = ({ task }) => {
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [isAddingComment, setIsAddingComment] = useState(false);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white w-full max-w-md h-full overflow-y-auto">
          <div className="flex justify-between items-center border-b border-gray-200 p-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Task Details
            </h2>
            <button 
              onClick={() => setDetailModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <CalendarIcon size={14} className="mr-1" />
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  Due: <DueDateDisplay dueDate={task.dueDate} />
                </div>
                <TypeBadge type={task.type} />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h4>
                <div className="text-sm text-gray-600">
                  {task.description || 'No description provided'}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  People
                </h4>
                <PeopleAvatars people={task.people} />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </h4>
                <div className="text-sm text-gray-600">
                  {task.timeline}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Subtasks
                  </h4>
                  <button 
                    onClick={() => setIsAddingSubtask(!isAddingSubtask)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {isAddingSubtask ? 'Cancel' : 'Add Subtask'}
                  </button>
                </div>
                
                {isAddingSubtask && (
                  <div className="flex mb-3">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && addSubtask(task.id)}
                    />
                    <button
                      onClick={() => {
                        addSubtask(task.id);
                        setIsAddingSubtask(false);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}
                
                <SubtaskProgress taskId={task.id} />
                
                <div className="space-y-2">
                  {subtasks[task.id]?.map(subtask => (
                    <div key={subtask.id} className="flex items-center group">
                      <button
                        onClick={() => toggleSubtaskCompletion(task.id, subtask.id)}
                        className="mr-2 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        {subtask.completed ? (
                          <CheckSquare size={18} className="text-green-500" />
                        ) : (
                          <CheckSquare size={18} className="text-gray-300" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => {
                          setSubtasks(prev => ({
                            ...prev,
                            [task.id]: prev[task.id].filter(st => st.id !== subtask.id)
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Comments
                </h4>
                <button 
                  onClick={() => setIsAddingComment(!isAddingComment)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isAddingComment ? 'Cancel' : 'Add Comment'}
                </button>
              </div>
              
              {isAddingComment && (
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addComment(task.id)}
                  />
                  <button
                    onClick={() => {
                      addComment(task.id);
                      setIsAddingComment(false);
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {(comments[task.id] || []).map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {comment.author.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {comment.author}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                    setDetailModalOpen(false);
                  }}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Pencil size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    const status = Object.entries(tasks).find(([_, tasks]) => 
                      tasks.some(t => t.id === task.id)
                    )?.[0];
                    if (status) {
                      archiveTask(task.id, status);
                    }
                    setDetailModalOpen(false);
                  }}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Archive size={14} className="mr-2" />
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
        <div className="max-w-full mx-auto px-4 py-6 w-full flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                {/* Back button */}
                <button
                  onClick={() => window.history.back()}
                  className="p-2 rounded hover:bg-gray-100 text-gray-600"
                  title="Go Back"
                >
                  <ArrowLeft size={20} />
                  <span className="sr-only">Back</span>
                </button>
                
                {/* View toggle buttons */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
                  <button 
                    onClick={() => setViewType('kanban')}
                    className={`p-2 rounded ${viewType === 'kanban' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                  >
                    <LayoutGrid size={20} />
                    <span className="sr-only">Kanban</span>
                  </button>
                  <button 
                    onClick={() => setViewType('list')}
                    className={`p-2 rounded ${viewType === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                  >
                    <List size={20} />
                    <span className="sr-only">List</span>
                  </button>
                </div>
                
                {/* Archive toggle */}
                <button 
                  onClick={() => setShowArchived(!showArchived)}
                  className={`p-2 rounded ${showArchived ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <Archive size={20} />
                  <span className="sr-only">Archived</span>
                </button>
                
                {/* Search input */}
                <div className="relative flex-1 md:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Bulk actions */}
                <button
                  onClick={bulkArchiveCompleted}
                  className="hidden md:flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <Archive size={16} className="mr-2" />
                  Archive Completed
                </button>
                
                {/* Import/Export */}
                <div className="relative">
                  <button 
                    onClick={() => document.getElementById('import-json').click()}
                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    <Upload size={16} className="mr-2" />
                    <span className="hidden md:inline">Import</span>
                  </button>
                  <input 
                    type="file" 
                    id="import-json" 
                    accept=".json" 
                    onChange={importFromJSON}
                    className="hidden"
                  />
                </div>
                <button 
                  onClick={exportToJSON}
                  className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <Download size={16} className="mr-2" />
                  <span className="hidden md:inline">Export</span>
                </button>
                
                {/* New task button */}
                <button 
                  onClick={openNewTaskModal}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  <span className="hidden md:inline">Add Task</span>
                  <span className="md:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Filter chips */}
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilterChips.map((chip, index) => (
                  <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {chip}
                    <button
                      onClick={() => clearAllFilters()}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
            )}
            
            {/* Project Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Back-End Task</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  Developer Team
                </div>
                <div className="flex items-center">
                  <Flag size={16} className="mr-1" />
                  Important
                </div>
                <div className="flex items-center">
                  <List size={16} className="mr-1" />
                  {Object.values(tasks).flat().length} Task
                </div>
              </div>
            </div>
          </div>

          {/* Filter/Sort Bar */}
          <div className="relative mb-4">
            <div className="flex justify-between items-center">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                </button>
                {isFilterOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <FilterDropdown />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="mr-2">Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</span>
                    {isSortOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isSortOpen && <SortDropdown />}
                </div>

                <button
                  onClick={toggleSortDirection}
                  className="p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
                  title={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
                >
                  {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Task List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            {showArchived ? (
              <ArchivedView />
            ) : viewType === 'list' ? (
              <ListView />
            ) : (
              <KanbanView />
            )}
          </div>
        </div>

        {/* New Task/Edit Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    ref={titleRef}
                    defaultValue={editingTask?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    ref={descriptionRef}
                    defaultValue={editingTask?.description || ''}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="dueDate"
                        ref={dueDateRef}
                        defaultValue={editingTask?.dueDate || ''}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="dueTime"
                        ref={dueTimeRef}
                        defaultValue={editingTask?.dueTime || ''}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      ref={priorityRef}
                      defaultValue={editingTask?.priority || 'medium'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      ref={typeRef}
                      defaultValue={editingTask?.type || 'Feature'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    ref={tagsRef}
                    defaultValue={editingTask?.tags?.join(', ') || ''}
                    placeholder="Comma separated tags (Feature, Bug, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <div className="relative user-select-container">
                    <button
                      type="button"
                      onClick={() => setShowUserSelect(!showUserSelect)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <div className="flex -space-x-1">
                        {selectedUsers.length === 0 ? (
                          <span className="text-gray-500">Select team members</span>
                        ) : (
                          selectedUsers.slice(0, 3).map(userId => {
                            const user = mockUsers.find(u => u.id === userId);
                            return (
                              <div 
                                key={userId}
                                className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white ${user?.color || 'bg-gray-500'}`}
                                title={user?.name}
                              >
                                {user?.initials || 'U'}
                              </div>
                            );
                          })
                        )}
                        {selectedUsers.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
                            +{selectedUsers.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>
                    
                    {showUserSelect && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-auto">
                        {mockUsers.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              const newSelection = selectedUsers.includes(user.id)
                                ? selectedUsers.filter(id => id !== user.id)
                                : [...selectedUsers, user.id];
                              setSelectedUsers(newSelection);
                            }}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white ${user.color} mr-2`}>
                              {user.initials}
                            </div>
                            <span className="text-sm text-gray-700">{user.name}</span>
                            {selectedUsers.includes(user.id) && (
                              <Check size={16} className="ml-auto text-blue-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {detailModalOpen && selectedTask && (
          <TaskDetailModal task={selectedTask} />
        )}
      </div>
    </div>
  );
};

export default TaskManager;