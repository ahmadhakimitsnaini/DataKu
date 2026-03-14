import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockColumns = ["customer_id", "age", "income", "gender", "subscription_type", "monthly_charges", "is_churned"];

export default function JobConfig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  const handleStartTraining = () => {
    // In a real app, send API request, then redirect to leaderboard/training status
    navigate(`/project/${id}/models`);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-border max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-tight">AutoML</span>
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
            {mockColumns.map((col) => (
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
            disabled={!selectedTarget}
            onClick={handleStartTraining}
          >
            <Play className="w-5 h-5" /> Start Auto-Training
          </Button>
        </div>
      </main>
    </div>
  );
}
