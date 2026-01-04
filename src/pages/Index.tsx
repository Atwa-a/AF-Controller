import { useState } from 'react';
import { Link } from 'react-router-dom';
import TronBackground from '@/components/3d/TronBackground';
import Navigation3D from '@/components/3d/Navigation3D';
import FloatingCard from '@/components/3d/FloatingCard';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Target, CheckCircle2, ArrowUpRight, ArrowDownRight, Rocket, LogIn } from 'lucide-react';

const Index = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Animated Background */}
      <TronBackground />

      {/* 3D Navigation - Hidden on mobile */}
      <div className="hidden lg:block">
        <Navigation3D activeItem={activeNav} onItemClick={setActiveNav} />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 lg:ml-64 p-4 md:p-8 min-h-screen">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
            Welcome to <span className="text-primary glow-text-primary">ATWA'S FIELD</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mb-6">
            Your futuristic command center for business & life management
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto glow-primary text-lg font-semibold">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Cash Flow Card */}
          <FloatingCard glowColor="primary">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <span className="flex items-center gap-1 text-accent text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +12.5%
              </span>
            </div>
            <h3 className="font-body text-muted-foreground text-sm mb-1">Cash Flow</h3>
            <p className="font-display text-2xl font-bold text-foreground">$24,580</p>
          </FloatingCard>

          {/* Savings Card */}
          <FloatingCard glowColor="accent">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <span className="flex items-center gap-1 text-accent text-sm font-medium">
                <ArrowUpRight className="w-4 h-4" />
                +8.3%
              </span>
            </div>
            <h3 className="font-body text-muted-foreground text-sm mb-1">Total Savings</h3>
            <p className="font-display text-2xl font-bold text-foreground">$156,200</p>
          </FloatingCard>

          {/* Goals Card */}
          <FloatingCard glowColor="primary">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <span className="flex items-center gap-1 text-destructive text-sm font-medium">
                <ArrowDownRight className="w-4 h-4" />
                -2.1%
              </span>
            </div>
            <h3 className="font-body text-muted-foreground text-sm mb-1">Goals Progress</h3>
            <p className="font-display text-2xl font-bold text-foreground">68%</p>
          </FloatingCard>

          {/* Tasks Card */}
          <FloatingCard glowColor="accent">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <span className="text-muted-foreground text-sm font-medium">
                Today
              </span>
            </div>
            <h3 className="font-body text-muted-foreground text-sm mb-1">Tasks Done</h3>
            <p className="font-display text-2xl font-bold text-foreground">12/15</p>
          </FloatingCard>
        </div>

        {/* Feature Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Large Chart Card */}
          <FloatingCard className="col-span-1" glowColor="primary">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              Monthly Cash Flow
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 px-4">
              {[65, 45, 78, 52, 89, 67, 94, 72, 85, 60, 92, 78].map((height, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm transition-all duration-300 hover:from-primary hover:to-primary/40"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground font-body">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </FloatingCard>

          {/* Goals Progress Card */}
          <FloatingCard glowColor="accent">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">
              2026 Goals Progress
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Revenue Target', progress: 78, color: 'primary' },
                { name: 'Savings Goal', progress: 92, color: 'accent' },
                { name: 'New Clients', progress: 45, color: 'primary' },
                { name: 'Projects Completed', progress: 67, color: 'accent' },
              ].map((goal) => (
                <div key={goal.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-body text-sm text-foreground">{goal.name}</span>
                    <span className="font-display text-sm font-semibold text-primary">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.color === 'primary' 
                          ? 'bg-gradient-to-r from-primary/60 to-primary' 
                          : 'bg-gradient-to-r from-accent/60 to-accent'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </FloatingCard>
        </div>

        
      </main>
    </div>
  );
};

export default Index;
