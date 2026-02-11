import { Map, User, Battery } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwner: boolean;
}

export function BottomNav({ activeTab, onTabChange, isOwner }: BottomNavProps) {
  const tabs = isOwner
    ? [
        { id: 'map', label: '发现', icon: Map },
        { id: 'owner', label: '管理', icon: Battery },
        { id: 'profile', label: '我的', icon: User },
      ]
    : [
        { id: 'map', label: '发现', icon: Map },
        { id: 'profile', label: '我的', icon: User },
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className={`grid ${isOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
