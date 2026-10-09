import PropTypes from 'prop-types';
import { ChevronsRight, Clock, User } from 'lucide-react';
import Tooltip from './Tooltip';

// Top of the sidebar: avatar, name, conversation-history and collapse buttons.
const SidebarUser = ({ user, isMobile, onToggleHistory, onCollapse }) => (
  <div className="px-4 py-3 border-b border-[#FFE7E5]/50 flex-shrink-0">
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#2B3440] truncate">{user?.displayName || "Welcome"}</h3>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip text="Conversation History" position="top">
          <button
            onClick={onToggleHistory}
            className="p-1.5 hover:bg-[#FFE7E5] rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4 text-gray-500" />
          </button>
        </Tooltip>
        {!isMobile && (
          <Tooltip text="Collapse sidebar" position="top">
            <button
              onClick={onCollapse}
              className="p-1.5 hover:bg-[#FFE7E5] rounded-lg transition-colors"
            >
              <ChevronsRight className="w-4 h-4 text-gray-500 rotate-180" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  </div>
);

SidebarUser.propTypes = {
  user: PropTypes.shape({ displayName: PropTypes.string }),
  isMobile: PropTypes.bool.isRequired,
  onToggleHistory: PropTypes.func.isRequired,
  onCollapse: PropTypes.func.isRequired,
};

export default SidebarUser;
