import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'accent';
}

export default function FloatingCard({ 
  children, 
  className,
  glowColor = 'primary' 
}: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation (max 10 degrees)
    const maxRotation = 10;
    const rotationY = (mouseX / (rect.width / 2)) * maxRotation;
    const rotationX = -(mouseY / (rect.height / 2)) * maxRotation;

    setRotateX(rotationX);
    setRotateY(rotationY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative glass rounded-xl p-6 transition-all duration-300 ease-out",
        isHovered && glowColor === 'primary' && "glow-primary",
        isHovered && glowColor === 'accent' && "glow-accent",
        className
      )}
      style={{
        transform: `
          perspective(1000px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg)
          translateZ(${isHovered ? 20 : 0}px)
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Neon border effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}
        style={{
          background: glowColor === 'primary' 
            ? 'linear-gradient(135deg, hsl(var(--primary) / 0.2), transparent, hsl(var(--primary) / 0.2))'
            : 'linear-gradient(135deg, hsl(var(--accent) / 0.2), transparent, hsl(var(--accent) / 0.2))',
          transform: 'translateZ(-1px)',
        }}
      />

      {/* Content */}
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
    </div>
  );
}
