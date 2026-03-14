import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Plus, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Activity, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { UploadModal } from "@/components/UploadModal";

// 1. Tipe data dan Data Palsu (Mock Data) untuk preview UI
interface Project {
  id: string;
  name: string;
  status: "idle" | "training" | "completed" | "failed";
  accuracy?: number;
  taskType?: "classification" | "regression";
  algorithm?: string;
  createdAt: string;
  rows?: number;
  features?: number;
  targetColumn?: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Customer Churn Prediction",
    status: "completed",
    accuracy: 94.2,
    taskType: "classification",
    algorithm: "Random Forest",
    createdAt: "2026-02-27",
    rows: 7043,
    features: 19,
    targetColumn: "Churn",
  },
  {
    id: "2",
    name: "House Price Estimation",
    status: "completed",
    accuracy: 87.6,
    taskType: "regression",
    algorithm: "Random Forest",
    createdAt: "2026-02-26",
    rows: 1460,
    features: 36,
    targetColumn: "SalePrice",
  },
  {
    id: "3",
    name: "Fraud Detection",
    status: "training",
    createdAt: "2026-02-28",
    rows: 28481,
    features: 30,
    targetColumn: "Class",
  },
];

// 2. Konfigurasi tema untuk masing-masing status proyek (Warna & Ikon)
const statusConfig = {
  idle: { color: "text-muted-foreground", bg: "bg-muted", icon: Clock, label: "Idle" },
  training: { color: "text-warning", bg: "bg-warning/10", icon: Activity, label: "Training" },
  completed: { color: "text-success", bg: "bg-success/10", icon: CheckCircle2, label: "Completed" },
  failed: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle, label: "Failed" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  // 3. State Management untuk menyimpan data UI
  const [projects] = useState<Project[]>(mockProjects);
  const [showUpload, setShowUpload] = useState(false); // Menampilkan modal upload

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* --- BAGIAN NAVIGASI ATAS --- */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">AutoML</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Avatar User */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            U
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {/* --- BAGIAN HEADER & TOMBOL TAMBAH PROYEK --- */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />

        {/* --- DAFTAR PROYEK (GRID) --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            // Ambil konfigurasi UI berdasarkan status proyek saat ini
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/project/${project.id}`)}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group cursor-pointer flex flex-col h-full"
              >
                {/* Header Kartu: Status & Ikon Arrow */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <StatusIcon className={`w-3 h-3 ${project.status === "training" ? "animate-pulse" : ""}`} />
                    {status.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-semibold mb-1">{project.name}</h3>

                {project.targetColumn && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Target: <span className="font-mono text-primary">{project.targetColumn}</span>
                  </p>
                )}

                {/* Info Baris & Fitur CSV */}
                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                  {project.rows && <span>{project.rows.toLocaleString()} rows</span>}
                  {project.features && <span>{project.features} features</span>}
                </div>

                {/* Tampilan Khusus Jika Proyek "Completed" */}
                {project.status === "completed" && (
                  <div className="border-t border-border pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {project.taskType === "regression" ? "R² Score" : "Accuracy"}
                        </div>
                        <div className="text-xl font-bold font-mono text-primary">
                          {project.accuracy}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-0.5">Algorithm</div>
                        <div className="text-sm font-medium">{project.algorithm}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4 gap-1.5 text-xs">
                      <ExternalLink className="w-3 h-3" /> Prediction API
                    </Button>
                  </div>
                )}

                {/* Tampilan Khusus Jika Proyek "Training" (Progress Bar) */}
                {project.status === "training" && (
                  <div className="border-t border-border pt-4">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "65%" }} // Simulasi progress berhenti di 65%
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Training in progress...
                    </p>
                  </div>
                )}

                {/* Tanggal Pembuatan */}
                <div className="text-[10px] text-muted-foreground mt-3 font-mono">
                  {project.createdAt}
                </div>
              </motion.div>
            );
          })}

          {/* Kartu Khusus untuk Membuat Proyek Baru (Ditaruh di akhir list) */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: projects.length * 0.08 }}
            onClick={() => setShowUpload(true)}
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-colors min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              New Project
            </span>
          </motion.button>
        </div>
      </main>
    </div>
  );
}