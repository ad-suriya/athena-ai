import React from 'react';
import { 
  List, 
  LayoutGrid, 
  Plus, 
  Calendar as CalendarIcon,
  Flag,
  Archive,
  Download,
  Upload
} from 'lucide-react';

const TaskManager = ({ 
  viewType, 
  setViewType,
  openNewTaskModal,
  exportToJSON,
  importFromJSON,
  showArchived,
  setShowArchived
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
      </div>
      
      {/* View Options */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">View</h2>
        <div className="space-y-1">
          <button
            onClick={() => setViewType('list')}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${viewType === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <List size={16} className="mr-3" />
            List View
          </button>
          <button
            onClick={() => setViewType('kanban')}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${viewType === 'kanban' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <LayoutGrid size={16} className="mr-3" />
            Kanban View
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Quick Actions</h2>
        <div className="space-y-1">
          <button
            onClick={openNewTaskModal}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Plus size={16} className="mr-3" />
            Add Task
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100">
            <CalendarIcon size={16} className="mr-3" />
            Calendar
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100">
            <Flag size={16} className="mr-3" />
            Priorities
          </button>
        </div>
      </div>
      
      {/* Import/Export */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Data</h2>
        <div className="space-y-1">
          <button
            onClick={exportToJSON}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Download size={16} className="mr-3" />
            Export Tasks
          </button>
          <label className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
            <Upload size={16} className="mr-3" />
            Import Tasks
            <input type="file" className="hidden" onChange={importFromJSON} />
          </label>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Archive size={16} className="mr-3" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;