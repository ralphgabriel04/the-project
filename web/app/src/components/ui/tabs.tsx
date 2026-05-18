"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Tabs Root
interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// Tab List
interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className = "" }: TabListProps) {
  return (
    <div
      className={`
        flex gap-1 p-1
        bg-slate-800 rounded-lg
        border border-slate-700
        ${className}
      `}
      role="tablist"
    >
      {children}
    </div>
  );
}

// Tab Trigger
interface TabTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabTrigger({
  value,
  children,
  className = "",
}: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`
        flex-1 px-4 py-2
        text-sm font-medium
        rounded-md
        transition-all duration-200
        ${
          isActive
            ? "bg-emerald-600 text-white shadow-lg"
            : "text-slate-400 hover:text-white hover:bg-slate-700"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Tab Content
interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({
  value,
  children,
  className = "",
}: TabContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={`mt-4 ${className}`}>
      {children}
    </div>
  );
}

