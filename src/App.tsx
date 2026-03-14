import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import JobConfig from "./pages/JobConfig";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

/**
 * Inisialisasi instance QueryClient dari React Query.
 * Digunakan secara global untuk mengelola state asinkron, seperti 
 * caching data, sinkronisasi, dan background fetching dari API.
 */
const queryClient = new QueryClient();

/**
 * Komponen root (App) dari aplikasi.
 * Bertugas membungkus seluruh aplikasi dengan global provider yang dibutuhkan
 * (React Query, UI Tooltip) serta mendefinisikan sistem routing navigasi.
 *
 * @returns {JSX.Element} Elemen root aplikasi.
 */
const App = () => (
  // Menyediakan context React Query ke seluruh komponen anak (children)
  <QueryClientProvider client={queryClient}>
    
    {/* Menyediakan context global agar komponen UI Tooltip (info tambahan saat hover) dapat berfungsi */}
    <TooltipProvider>
      
      {/* ── Global UI Components ───────────────────────────────────────── */}
      {/* Render komponen notifikasi (Toast/Snackbar) agar pesan pop-up
          bisa dipanggil dari halaman manapun tanpa harus merender ulang */}
      <Toaster />
      <Sonner />

      {/* ── Sistem Routing ─────────────────────────────────────────────── */}
      {/* BrowserRouter mengatur navigasi berbasis URL browser (History API) */}
      <BrowserRouter>
        <Routes>
          {/* Rute Halaman Utama (Landing Page) */}
          <Route path="/" element={<Index />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/train" element={<JobConfig />} />
          <Route path="/project/:id/models" element={<Leaderboard />} />
          
          {/* Rute Wildcard (*) untuk menangani URL yang tidak terdaftar (404 Error) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;