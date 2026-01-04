import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Business from "./pages/Business";
import Finance from "./pages/Finance";
import DayPlanner from "./pages/DayPlanner";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with AppLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/businesses" element={
              <ProtectedRoute>
                <AppLayout>
                  <Business />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute>
                <AppLayout>
                  <Finance />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance/ledger" element={
              <ProtectedRoute>
                <AppLayout>
                  <Finance />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance/savings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Finance />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/finance/investments" element={
              <ProtectedRoute>
                <AppLayout>
                  <Finance />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/planner" element={
              <ProtectedRoute>
                <AppLayout>
                  <DayPlanner />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute>
                <AppLayout>
                  <Goals />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
