import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authHeaders } from "@/lib/auth";

export default function JobConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Fetch project details to get the dataset columns
    const fetchColumns = async () => {
      try {
        const res = await fetch(api.projects.columns(id!), { headers: authHeaders() });
        if (!res.ok) throw new Error("Failed to fetch project columns");
        const data = await res.json();
        if (data.columns) setColumns(data.columns);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project details");
      }
    };
    fetchColumns();
  }, [id]);

  const handleStartTraining = async () => {
    if (!selectedTarget) return;
    setIsStarting(true);
    
    try {
      const response = await fetch(api.jobs.train(id!), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ target_column: selectedTarget })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to start training");
      }

      toast.success("Training job started successfully!");
      navigate(`/project/${id}/models`);
    } catch (error: unknown) {
      console.error("Training error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start training job";
      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">DataKu</span>
        </Link>
        <Link to={`/project/${id}`}>
          <Button variant="ghost">Back to Profiling</Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configure Training Job</h1>
            <p className="text-muted-foreground">
              Select the target column you want to predict.
            </p>
          </div>
        </div>

        <div className="glass rounded-xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Target Variable</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => setSelectedTarget(col)}
                className={`px-4 py-3 rounded-xl text-sm font-mono text-left transition-colors border ${
                  selectedTarget === col
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-secondary border-border hover:border-muted-foreground"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to={`/project/${id}`}>
            <Button variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button 
            size="lg" 
            className="gap-2" 
            disabled={!selectedTarget || isStarting}
            onClick={handleStartTraining}
          >
            <Play className="w-5 h-5" /> {isStarting ? "Starting..." : "Start Auto-Training"}
          </Button>
        </div>
      </main>
    </div>
  );
}
