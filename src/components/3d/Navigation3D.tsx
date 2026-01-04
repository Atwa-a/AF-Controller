import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Calendar, 
  Target, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'business', label: 'Business', icon: <Building2 className="w-5 h-5" /> },
  { id: 'finance', label: 'Finance Hub', icon: <Wallet className="w-5 h-5" /> },
  { id: 'planner', label: 'Day Planner', icon: <Calendar className="w-5 h-5" /> },
  { id: 'goals', label: 'Year Goals', icon: <Target className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface Navigation3DProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export default function Navigation3D({ activeItem = 'dashboard', onItemClick }: Navigation3DProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav 
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
      style={{ perspective: '1000px' }}
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-primary glow-text-primary tracking-wider">
          AF
        </h1>
        <h2 className="font-display text-lg font-semibold text-accent glow-text-accent tracking-widest">
          Controler
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2">
        {navItems.map((item, index) => {
          const isActive = activeItem === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-lg",
                "glass transition-all duration-300 ease-out",
                "hover:scale-105",
                isActive && "glow-primary bg-primary/10 border-primary/50",
                !isActive && "hover:bg-primary/5"
              )}
              style={{
                transform: `
                  perspective(1000px) 
                  rotateY(${isHovered ? -5 : 0}deg) 
                  rotateX(${isHovered ? 2 : 0}deg)
                  translateZ(${isActive ? 20 : isHovered ? 15 : 0}px)
                  translateX(${isHovered ? 8 : 0}px)
                `,
                transformStyle: 'preserve-3d',
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon */}
              <span 
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span 
                className={cn(
                  "font-body font-medium transition-colors duration-300",
                  isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary ml-auto animate-pulse" />
              )}

              {/* Glow effect on hover */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
                  "bg-gradient-to-r from-primary/20 to-transparent",
                  (isHovered || isActive) && "opacity-100"
                )}
                style={{ transform: 'translateZ(-1px)' }}
              />
            </button>
          );
        })}
      </div>

      {/* Decorative line */}
      <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </nav>
  );
}
