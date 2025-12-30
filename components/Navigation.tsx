import React from 'react';
import { NavLink } from 'react-router-dom';
import { TreePine, PartyPopper, Flame } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `p-3 backdrop-blur-md rounded-full transition-all duration-300 group flex items-center gap-2 overflow-hidden w-12 hover:w-32 ${isActive ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`
        }
        title="Christmas"
      >
        <TreePine size={20} className="shrink-0" />
        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-serif text-sm">Christmas</span>
      </NavLink>
      
      <NavLink 
        to="/new-year" 
        className={({ isActive }) => 
          `p-3 backdrop-blur-md rounded-full transition-all duration-300 group flex items-center gap-2 overflow-hidden w-12 hover:w-32 ${isActive ? 'bg-[#00BFFF]/20 text-[#00BFFF] border border-[#00BFFF]/50' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`
        }
        title="New Year"
      >
        <PartyPopper size={20} className="shrink-0" />
        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-serif text-sm">New Year</span>
      </NavLink>
      
      <NavLink 
        to="/cny" 
        className={({ isActive }) => 
          `p-3 backdrop-blur-md rounded-full transition-all duration-300 group flex items-center gap-2 overflow-hidden w-12 hover:w-40 ${isActive ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/50' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`
        }
        title="Chinese New Year"
      >
        <Flame size={20} className="shrink-0" />
        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-serif text-sm">Lunar New Year</span>
      </NavLink>
    </div>
  );
};
