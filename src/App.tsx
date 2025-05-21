
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Receipt from "./pages/Receipt";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/Layout/DashboardLayout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  element, 
  adminRequired = false,
}: { 
  element: React.ReactNode; 
  adminRequired?: boolean;
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (adminRequired && !isAdmin) {
    return <Navigate to="/pos" replace />;
  }
  
  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            
            {/* Protected routes within dashboard layout */}
            <Route path="/" element={<ProtectedRoute element={<DashboardLayout />} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="receipt/:id" element={<Receipt />} />
              <Route path="products" element={<ProtectedRoute element={<Products />} adminRequired />} />
              <Route path="reports" element={<ProtectedRoute element={<Reports />} adminRequired />} />
              <Route path="users" element={<ProtectedRoute element={<Users />} adminRequired />} />
              <Route path="settings" element={<ProtectedRoute element={<Settings />} adminRequired />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
