import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock dataset metadata
  const metadata = {
    filename: "customer_churn.csv",
    rows: 7043,
    columns: 19,
    missingValues: 11,
    size: "1.2 MB"
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
        <Link to="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dataset Profiling</h1>
            <p className="text-muted-foreground">
              Project ID: {id}
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate(`/project/${id}/train`)}>
            Configure Job <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Rows</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.rows.toLocaleString()}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Columns</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.columns}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Missing Values</p>
            <p className="text-2xl font-bold font-mono text-warning text-yellow-500">{metadata.missingValues}</p>
          </div>
          <div className="glass p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">File Size</p>
            <p className="text-2xl font-bold font-mono text-primary">{metadata.size}</p>
          </div>
        </div>

        {/* Dummy Chart Area */}
        <div className="glass rounded-xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Data Distribution</h3>
          <p className="text-muted-foreground">
            Distribution charts and pairwise plots will be generated here.
          </p>
        </div>
      </main>
    </div>
  );
}
