import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { GlobalConfigProvider } from '@/hooks/useGlobalConfig';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import NewAnimal from "./pages/NewAnimal";
import SuperAdmin from "./pages/SuperAdmin";

// Admin pages
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Organization specific pages
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Lotes from "./pages/Lotes";
import Vaccinations from "./pages/Vaccinations";
import Events from "./pages/Events";
import Diagnostics from "./pages/Diagnostics";
import Prescriptions from "./pages/Prescriptions";
import Formulas from "./pages/Formulas";
import Indicators from "./pages/Indicators";
import Metrics from "./pages/Metrics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Vet module
import VetDashboard from '@/pages/vet/VetDashboard';
import VetAnimals from '@/pages/vet/VetAnimals';
import VetDiagnostics from '@/pages/vet/VetDiagnostics';
import VetPrescriptions from '@/pages/vet/VetPrescriptions';
import VetIndicators from '@/pages/vet/VetIndicators';
import VetFormulas from '@/pages/vet/VetFormulas';
import VetInventory from '@/pages/vet/VetInventory';
import VetTeam from '@/pages/vet/VetTeam';

// Empresa module
import EmpresaDashboard from '@/pages/empresa/EmpresaDashboard';
import EmpresaProducts from '@/pages/empresa/EmpresaProducts';
import EmpresaTeam from '@/pages/empresa/EmpresaTeam';
import EmpresaMetrics from '@/pages/empresa/EmpresaMetrics';

// Fazenda module
import FazendaDashboard from '@/pages/fazenda/FazendaDashboard';
import FazendaLotes from '@/pages/fazenda/FazendaLotes';
import FazendaAnimais from '@/pages/fazenda/FazendaAnimais';
import FazendaVacinacao from '@/pages/fazenda/FazendaVacinacao';
import FazendaEventos from '@/pages/fazenda/FazendaEventos';
import FazendaEstoque from '@/pages/fazenda/FazendaEstoque';
import FazendaTeam from '@/pages/fazenda/FazendaTeam';

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <GlobalConfigProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } />
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              <Route path="/onboarding" element={
                <PublicRoute>
                  <Onboarding />
                </PublicRoute>
              } />
              <Route path="/superadmin" element={<SuperAdmin />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/animals" element={
                <ProtectedRoute>
                  <Animals />
                </ProtectedRoute>
              } />
              <Route path="/animals/new" element={
                <ProtectedRoute>
                  <NewAnimal />
                </ProtectedRoute>
              } />
              <Route path="/admin/organizations" element={
                <ProtectedRoute>
                  <AdminOrganizations />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/lotes" element={
                <ProtectedRoute>
                  <Lotes />
                </ProtectedRoute>
              } />
              <Route path="/vaccinations" element={
                <ProtectedRoute>
                  <Vaccinations />
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              } />
              <Route path="/diagnostics" element={
                <ProtectedRoute>
                  <Diagnostics />
                </ProtectedRoute>
              } />
              <Route path="/prescriptions" element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              } />
              <Route path="/formulas" element={
                <ProtectedRoute>
                  <Formulas />
                </ProtectedRoute>
              } />
              <Route path="/indicators" element={
                <ProtectedRoute>
                  <Indicators />
                </ProtectedRoute>
              } />
              <Route path="/metrics" element={
                <ProtectedRoute>
                  <Metrics />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } />

              {/* Vet Routes */}
              <Route path="/vet" element={<ProtectedRoute><VetDashboard /></ProtectedRoute>} />
              <Route path="/vet/animals" element={<ProtectedRoute><VetAnimals /></ProtectedRoute>} />
              <Route path="/vet/diagnostics" element={<ProtectedRoute><VetDiagnostics /></ProtectedRoute>} />
              <Route path="/vet/prescriptions" element={<ProtectedRoute><VetPrescriptions /></ProtectedRoute>} />
              <Route path="/vet/indicators" element={<ProtectedRoute><VetIndicators /></ProtectedRoute>} />
              <Route path="/vet/formulas" element={<ProtectedRoute><VetFormulas /></ProtectedRoute>} />
              <Route path="/vet/inventory" element={<ProtectedRoute><VetInventory /></ProtectedRoute>} />
              <Route path="/vet/team" element={<ProtectedRoute><VetTeam /></ProtectedRoute>} />

              {/* Empresa Routes */}
              <Route path="/empresa" element={<ProtectedRoute><EmpresaDashboard /></ProtectedRoute>} />
              <Route path="/empresa/products" element={<ProtectedRoute><EmpresaProducts /></ProtectedRoute>} />
              <Route path="/empresa/team" element={<ProtectedRoute><EmpresaTeam /></ProtectedRoute>} />
              <Route path="/empresa/metrics" element={<ProtectedRoute><EmpresaMetrics /></ProtectedRoute>} />

              {/* Fazenda Routes */}
              <Route path="/fazenda" element={<ProtectedRoute><FazendaDashboard /></ProtectedRoute>} />
              <Route path="/fazenda/lotes" element={<ProtectedRoute><FazendaLotes /></ProtectedRoute>} />
              <Route path="/fazenda/animals" element={<ProtectedRoute><FazendaAnimais /></ProtectedRoute>} />
              <Route path="/fazenda/vacinacao" element={<ProtectedRoute><FazendaVacinacao /></ProtectedRoute>} />
              <Route path="/fazenda/eventos" element={<ProtectedRoute><FazendaEventos /></ProtectedRoute>} />
              <Route path="/fazenda/estoque" element={<ProtectedRoute><FazendaEstoque /></ProtectedRoute>} />
              <Route path="/fazenda/team" element={<ProtectedRoute><FazendaTeam /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalConfigProvider>
);

export default App;