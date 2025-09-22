import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Charts from "./pages/Charts";
import Reports from "./pages/Reports";
import Records from "./pages/Records";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { DataManagement } from "./components/data/DataManagement";
import { useState } from "react";
import { mockData, SchoolData } from "./utils/mockData";

const queryClient = new QueryClient();

const App = () => {
  const [schoolData, setSchoolData] = useState<SchoolData[]>(mockData);

  const handleDataUpdate = (newData: SchoolData[]) => {
    setSchoolData(newData);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                <Route path="records" element={<Records />} />
                <Route path="data-management" element={<DataManagement onDataUpdate={handleDataUpdate} currentDataCount={schoolData.length} />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
