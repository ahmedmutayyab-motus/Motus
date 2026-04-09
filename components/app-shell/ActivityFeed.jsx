"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, User, Layers, Mail, Activity as ActivityIcon } from "lucide-react";
import { getActivityFeed } from "@/app/actions/activity";

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load feed once on mount to get real unread count
  useEffect(() => {
    async function initialLoad() {
      try {
        const data = await getActivityFeed();
        setFeed(data);
      } catch (err) {
        // Silent fail on initial load
      } finally {
        setHasLoaded(true);
      }
    }
    initialLoad();
  }, []);

  async function loadFeed() {
    setLoading(true);
    try {
      const data = await getActivityFeed();
      setFeed(data);
    } catch (err) {
      console.error("Failed to load activity feed", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleOpen() {
    if (!isOpen) {
      loadFeed();
    }
    setIsOpen(!isOpen);
  }

  const ICONS = {
    user: <User className="h-4 w-4 text-brand-amber" />,
    layers: <Layers className="h-4 w-4 text-brand-amber" />,
    mail: <Mail className="h-4 w-4 text-brand-amber" />
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={toggleOpen}
        className="text-brand-muted hover:text-brand-amber transition-colors p-2 rounded-full hover:bg-brand-amber/10 relative"
      >
        <Bell className="h-5 w-5" />
        {/* Show dot only when there are real activity items */}
        {!isOpen && hasLoaded && feed.length > 0 && <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-brand-amber"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-brand-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-obsidian-900 flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-brand-amber" />
            <h3 className="text-sm font-medium text-brand-light">Recent Activity</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-brand-muted text-sm flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-amber border-t-transparent"></div>
                Loading feed...
              </div>
            ) : feed.length === 0 ? (
              <div className="p-8 text-center text-brand-muted text-sm">
                No recent activity.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {feed.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-white/5 transition-colors flex gap-3">
                    <div className="flex-shrink-0 mt-0.5 bg-brand-background/50 p-1.5 rounded-full border border-white/5 h-8 w-8 flex items-center justify-center">
                      {ICONS[item.iconType]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-light">{item.title}</p>
                      <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{item.description}</p>
                      <p className="text-[10px] text-brand-muted/70 mt-1">
                        {new Date(item.timestamp).toLocaleDateString()} &bull; {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
