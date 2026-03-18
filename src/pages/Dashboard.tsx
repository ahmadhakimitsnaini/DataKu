import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain, Plus, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Activity, Loader2, RefreshCw, Trash2, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { UploadModal } from "@/components/UploadModal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { authHeaders, clearToken } from "@/lib/auth";

// Interface untuk struktur data project dari backend
interface Project {
  id: string;
  name: string;
  status: "idle" | "profiling" | "training" | "completed" | "error";
  created_at: string;
}

// Interface tambahan untuk menyimpan statistik hasil training
interface ProjectWithStats extends Project {
  bestAccuracy?: number;
  modelCount?: number;
}

// Konfigurasi visual berdasarkan status project
const statusConfig = {
  idle:      { color: "text-muted-foreground", bg: "bg-muted/50",           icon: Clock,         label: "Idle" },
  profiling: { color: "text-blue-400",         bg: "bg-blue-500/10",         icon: Activity,      label: "Profiling" },
  training:  { color: "text-yellow-400",       bg: "bg-yellow-500/10",       icon: Activity,      label: "Training" },
  completed: { color: "text-green-400",        bg: "bg-green-500/10",        icon: CheckCircle2,  label: "Completed" },
  error:     { color: "text-destructive",      bg: "bg-destructive/10",      icon: AlertCircle,   label: "Error" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Mengambil daftar project dan memperkaya data dengan akurasi terbaik jika sudah selesai
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(api.projects.list(), { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data: Project[] = await res.json();

      const enriched = await Promise.all(
        data.map(async (p) => {
          if (p.status === "completed") {
            try {
              const modRes = await fetch(api.jobs.models(p.id), { headers: authHeaders() });
              if (modRes.ok) {
                const models = await modRes.json();
                const best = models.reduce(
                  (acc: number, m: { accuracy_score: number }) =>
                    m.accuracy_score > acc ? m.accuracy_score : acc,
                  0
                );
                return { ...p, bestAccuracy: best, modelCount: models.length };
              }
            } catch { /* Gagal ambil data model */ }
          }
          return p;
        })
      );

      setProjects(enriched);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Menghapus project dengan sistem konfirmasi ganda
  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (deleteConfirm !== projectId) {
      setDeleteConfirm(projectId);
      setTimeout(() => setDeleteConfirm(null), 3000); // Reset konfirmasi setelah 3 detik
      return;
    }
    try {
      const res = await fetch(api.projects.delete(projectId), { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to delete project");
      toast.success("Project deleted successfully");
      setDeleteConfirm(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project");
    }
  };

  // Efek untuk fetch data pertama kali dan menjalankan auto-refresh
  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Header & Navigasi Utama */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">DataKu</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={fetchProjects} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { clearToken(); navigate("/login"); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">U</div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        <UploadModal isOpen={showUpload} onClose={() => { setShowUpload(false); fetchProjects(); }} />

        {/* Tampilan Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Loading your projects...</p>
          </div>
        )}

        {/* Tampilan jika data kosong */}
        {!isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground">Upload a CSV dataset to create your first AutoML project.</p>
            </div>
            <Button onClick={() => setShowUpload(true)} className="gap-2 mt-2">
              <Plus className="w-4 h-4" /> Create First Project
            </Button>
          </div>
        )}

        {/* Daftar Grid Project */}
        {!isLoading && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => {
              const status = statusConfig[project.status] ?? statusConfig.idle;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group cursor-pointer flex flex-col h-full"
                >
                  {/* Status Badge & Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className={`w-3 h-3 ${project.status === "training" || project.status === "profiling" ? "animate-pulse" : ""}`} />
                      {status.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {deleteConfirm === project.id ? (
                        <button onClick={(e) => deleteProject(project.id, e)} className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                          Confirm?
                        </button>
                      ) : (
                        <button onClick={(e) => deleteProject(project.id, e)} className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <h3 className="font-semibold mb-1">{project.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground mb-4 truncate">ID: {project.id.slice(0, 8)}...</p>

                  {/* Statistik jika status completed */}
                  {project.status === "completed" && (
                    <div className="border-t border-border pt-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">Best Accuracy</div>
                          <div className="text-xl font-bold font-mono text-primary">
                            {project.bestAccuracy?.toFixed(2) ?? "—"}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-0.5">Models Trained</div>
                          <div className="text-xl font-bold font-mono">{project.modelCount ?? "—"}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indikator progress jika masih training/profiling */}
                  {(project.status === "training" || project.status === "profiling") && (
                    <div className="border-t border-border pt-4 mt-auto">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: "10%" }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {project.status === "profiling" ? "Profiling dataset..." : "Training models..."}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground mt-3 font-mono">
                    {formatDate(project.created_at)}
                  </div>
                </motion.div>
              );
            })}

            {/* Tombol Tambah Project Baru */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: projects.length * 0.06 }}
              onClick={() => setShowUpload(true)}
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-colors min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">New Project</span>
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
}