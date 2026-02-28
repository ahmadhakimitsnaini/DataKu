import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Upload, Plus, BarChart3, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Cpu, FileSpreadsheet, Trash2,
  Play, ExternalLink, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data
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

const statusConfig = {
  idle: { color: "text-muted-foreground", bg: "bg-muted", icon: Clock, label: "Idle" },
  training: { color: "text-warning", bg: "bg-warning/10", icon: Activity, label: "Training" },
  completed: { color: "text-success", bg: "bg-success/10", icon: CheckCircle2, label: "Completed" },
  failed: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle, label: "Failed" },
};

export default function Dashboard() {
  const [projects] = useState<Project[]>(mockProjects);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) {
      simulateUpload(file.name);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".csv")) {
      simulateUpload(file.name);
    }
  }, []);

  const simulateUpload = (name: string) => {
    setUploadedFile(name);
    // Simulate parsing CSV headers
    setColumns(["age", "income", "gender", "region", "purchase_amount", "is_churned"]);
    setSelectedTarget("");
  };

  const resetUpload = () => {
    setShowUpload(false);
    setUploadedFile(null);
    setColumns([]);
    setSelectedTarget("");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">AutoML</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            U
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
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

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={(e) => e.target === e.currentTarget && resetUpload()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass rounded-2xl p-8 w-full max-w-lg"
              >
                <h2 className="text-xl font-bold mb-1">New Project</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a CSV dataset to get started
                </p>

                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => document.getElementById("csv-input")?.click()}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium mb-1">
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>
                    <input
                      id="csv-input"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* File info */}
                    <div className="flex items-center gap-3 bg-secondary rounded-lg p-4">
                      <FileSpreadsheet className="w-8 h-8 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile}</p>
                        <p className="text-xs text-muted-foreground">
                          {columns.length} columns detected
                        </p>
                      </div>
                      <button onClick={() => { setUploadedFile(null); setColumns([]); }} className="text-muted-foreground hover:text-foreground">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Target selector */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Target Column
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {columns.map((col) => (
                          <button
                            key={col}
                            onClick={() => setSelectedTarget(col)}
                            className={`px-3 py-2 rounded-lg text-sm font-mono text-left transition-colors ${
                              selectedTarget === col
                                ? "bg-primary/20 border border-primary text-primary"
                                : "bg-secondary border border-transparent hover:border-border"
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={resetUpload}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        disabled={!selectedTarget}
                        onClick={resetUpload}
                      >
                        <Play className="w-4 h-4" /> Train Model
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const status = statusConfig[project.status];
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group cursor-pointer"
              >
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

                {/* Stats row */}
                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                  {project.rows && (
                    <span>{project.rows.toLocaleString()} rows</span>
                  )}
                  {project.features && (
                    <span>{project.features} features</span>
                  )}
                </div>

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

                {project.status === "training" && (
                  <div className="border-t border-border pt-4">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Training in progress...
                    </p>
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground mt-3 font-mono">
                  {project.createdAt}
                </div>
              </motion.div>
            );
          })}

          {/* New project card */}
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
