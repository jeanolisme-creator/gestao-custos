import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { SystemProvider } from "./contexts/SystemContext";
import ConsolidatedReport from "./pages/ConsolidatedReport";
import ConsolidatedCosts from "./pages/ConsolidatedCosts";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HRDashboard";
import SuppliesDashboard from "./pages/SuppliesDashboard";
import SchoolDemandDashboard from "./pages/SchoolDemandDashboard";
import SchoolDemandRegistration from "./pages/SchoolDemandRegistration";
import SchoolDemandIntegrations from "./pages/SchoolDemandIntegrations";
import SchoolDemandImport from "./pages/SchoolDemandImport";
import SchoolsRegistration from "./pages/SchoolsRegistration";
import OutsourcedDashboard from "./pages/OutsourcedDashboard";
import ContractsDashboard from "./pages/ContractsDashboard";
import Charts from "./pages/Charts";
import Reports from "./pages/Reports";
import Records from "./pages/Records";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { DataManagement } from "./components/data/DataManagement";
import UserManagement from "./pages/UserManagement";
import { useState } from "react";
import { mockData, SchoolData } from "./utils/mockData";
import { generateMockSystemData, UnifiedRecord } from "./utils/systemData";

const queryClient = new QueryClient();

const App = () => {
  const [schoolData, setSchoolData] = useState<SchoolData[]>(mockData);
  const [systemData, setSystemData] = useState<UnifiedRecord[]>(() => {
    // Generate mock data for all systems
    const waterData = generateMockSystemData('water', 50);
    const energyData = generateMockSystemData('energy', 50);
    const fixedLineData = generateMockSystemData('fixed-line', 50);
    return [...waterData, ...energyData, ...fixedLineData];
  });

  const handleDataUpdate = (newData: SchoolData[]) => {
    setSchoolData(newData);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SystemProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard data={schoolData} />} />
                  <Route path="charts" element={<Charts data={schoolData} />} />
                  <Route path="reports" element={<Reports data={schoolData} />} />
                  <Route path="consolidated-report" element={<ConsolidatedReport />} />
                  <Route path="consolidated-costs" element={<ConsolidatedCosts data={schoolData} />} />
                  <Route path="hr-dashboard" element={<HRDashboard />} />
                  <Route path="supplies-dashboard" element={<SuppliesDashboard />} />
                  <Route path="school-demand-dashboard" element={<SchoolDemandDashboard />} />
                  <Route path="school-demand/cadastro" element={<SchoolDemandRegistration />} />
                  <Route path="school-demand/integracoes" element={<SchoolDemandIntegrations />} />
                  <Route path="school-demand/importar" element={<SchoolDemandImport />} />
                  <Route path="outsourced-dashboard" element={<OutsourcedDashboard />} />
                  <Route path="contracts-dashboard" element={<ContractsDashboard />} />
                  <Route path="records" element={<Records />} />
                  <Route path="data-management" element={<DataManagement onDataUpdate={handleDataUpdate} currentDataCount={schoolData.length} />} />
                  <Route path="user-management" element={<UserManagement />} />
                  <Route path="schools-registration" element={<SchoolsRegistration />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SystemProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
