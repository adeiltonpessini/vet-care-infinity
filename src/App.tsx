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
import EmpresaBonificacoes from '@/pages/empresa/EmpresaBonificacoes';
import EmpresaTeam from '@/pages/empresa/EmpresaTeam';
import EmpresaMetrics from '@/pages/empresa/EmpresaMetrics';
import VetIndicacoes from '@/pages/vet/VetIndicacoes';

// Fazenda module
import FazendaDashboard from '@/pages/fazenda/FazendaDashboard';
import FazendaLotes from '@/pages/fazenda/FazendaLotes';
import FazendaAnimais from '@/pages/fazenda/FazendaAnimais';
import FazendaVacinacao from '@/pages/fazenda/FazendaVacinacao';
import NovaVacinacao from '@/pages/fazenda/NovaVacinacao';
import FazendaEventos from '@/pages/fazenda/FazendaEventos';
import NovoEvento from '@/pages/fazenda/NovoEvento';
import FazendaEstoque from '@/pages/fazenda/FazendaEstoque';
import FazendaTeam from '@/pages/fazenda/FazendaTeam';
import FazendaCadastroAnimal from '@/pages/fazenda/FazendaCadastroAnimal';
import CartaoVacinacao from '@/pages/fazenda/CartaoVacinacao';

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

function RoleBasedRedirect() {
  const { userProfile, organization, loading } = useAuth();
  
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

  // Redirect to appropriate dashboard based on organization type
  if (organization) {
    switch (organization.type) {
      case 'clinica_veterinaria':
        return <Navigate to="/vet" replace />;
      case 'empresa_alimentos':
      case 'empresa_medicamentos':
        return <Navigate to="/empresa" replace />;
      case 'fazenda':
        return <Navigate to="/fazenda" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <Navigate to="/dashboard" replace />;
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
              
              {/* SuperAdmin Routes */}
              <Route path="/superadmin/*" element={<SuperAdmin />} />
              
              {/* Auto-redirect to role-based dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
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
              <Route path="/fazenda/animais" element={<ProtectedRoute><FazendaAnimais /></ProtectedRoute>} />
              <Route path="/fazenda/animais/new" element={<ProtectedRoute><FazendaCadastroAnimal /></ProtectedRoute>} />
              <Route path="/fazenda/vacinacao" element={<ProtectedRoute><FazendaVacinacao /></ProtectedRoute>} />
              <Route path="/fazenda/vacinacao/new" element={<ProtectedRoute><NovaVacinacao /></ProtectedRoute>} />
              <Route path="/fazenda/vacinacao/cartao/:animalId" element={<ProtectedRoute><CartaoVacinacao /></ProtectedRoute>} />
              <Route path="/fazenda/eventos" element={<ProtectedRoute><FazendaEventos /></ProtectedRoute>} />
              <Route path="/fazenda/eventos/new" element={<ProtectedRoute><NovoEvento /></ProtectedRoute>} />
              <Route path="/fazenda/estoque" element={<ProtectedRoute><FazendaEstoque /></ProtectedRoute>} />
              <Route path="/fazenda/team" element={<ProtectedRoute><FazendaTeam /></ProtectedRoute>} />

              {/* General Routes */}
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalConfigProvider>
);

export default App;