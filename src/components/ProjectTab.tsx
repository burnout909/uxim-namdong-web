interface ProjectTabProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

export default function ProjectTab({
  tabs,
  activeTab,
  onTabClick,
}: ProjectTabProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-md text-xs md:text-sm border transition
            ${
              activeTab === tab
                ? "font-bold !text-blue-700 border-blue-500"
                : "font-medium text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          onClick={() => onTabClick(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
