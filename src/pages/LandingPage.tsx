// MENGIMPOR DEPENDENSI

// framer-motion: Digunakan untuk membuat animasi transisi yang halus (smooth UI animations).
import { motion } from "framer-motion";

// lucide-react: Pustaka ikon ringan untuk mempercantik antarmuka.
import { Brain, Upload, Zap, BarChart3, ArrowRight, Sparkles, Database, Cpu } from "lucide-react";

// Komponen UI kustom (biasanya dari Shadcn UI) dan routing.
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// DATA STATIS: FITUR
// Memisahkan data teks dan ikon dari struktur komponen (HTML/JSX) 
// agar kode lebih rapi, mudah dibaca, dan mudah diperbarui di kemudian hari.
const features = [
  {
    icon: Upload,
    title: "Upload CSV",
    description: "Drag & drop your dataset. We handle the rest — cleaning, encoding, and preprocessing.",
  },
  {
    icon: Cpu,
    title: "Auto-Train Models",
    description: "Our engine tests multiple algorithms and picks the best performing model automatically.",
  },
  {
    icon: BarChart3,
    title: "Evaluate & Compare",
    description: "Get accuracy scores, confusion matrices, and feature importance — no code required.",
  },
  {
    icon: Zap,
    title: "Deploy Instantly",
    description: "Every trained model gets a live REST API endpoint for real-time predictions.",
  },
];

// DATA STATIS: STATISTIK
// Data metrik pendukung untuk meyakinkan pengguna (social proof/performance metrics).
const stats = [
  { value: "3", label: "Algorithms Tested" },
  { value: "< 60s", label: "Avg Training Time" },
  { value: "99.9%", label: "API Uptime" },
  { value: "0", label: "Lines of Code" },
];

// KOMPONEN UTAMA: LANDING PAGE
export default function LandingPage() {
  return (
    // Wadah utama (Wrapper) halaman, mencakup seluruh layar (min-h-screen)
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* 1. ELEMEN LATAR BELAKANG (BACKGROUND) */}
      {/* Pola grid transparan untuk memberikan kesan modern/teknologi */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      
      {/* Efek cahaya berpendar (Gradient Orbs) di bagian atas dan bawah layar */}
      {/* pointer-events-none memastikan elemen ini tidak mengganggu klik pengguna */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. BAGIAN NAVIGASI (HEADER) */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        {/* Logo dan Nama Aplikasi */}
        <div className="flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">DataKu</span>
        </div>
        
        {/* Tombol Aksi (Call to Action / CTA) di kanan atas */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* 3. BAGIAN HERO (SAMBUTAN UTAMA) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        {/* Konten teks utama dengan animasi meluncur dari bawah (y: 30 ke y: 0) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Badge/Label kecil di atas judul */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">No-Code Machine Learning</span>
          </div>

          {/* Judul Utama (Headline) */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Train ML models
            <br />
            <span className="text-gradient">without code.</span>
          </h1>

          {/* Sub-judul (Deskripsi singkat) */}
          <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Upload a CSV, pick a target column, and let our AutoML engine handle
            data cleaning, model selection, and deployment — in under a minute.
          </p>

          {/* Tombol Aksi Utama (Primary CTA) */}
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8 glow">
                <Upload className="w-4 h-4" /> Start Training
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-base px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 4. BAGIAN STATISTIK (MUNCUL SETELAH HERO) */}
        {/* Animasi ini ditunda (delay: 0.3) agar muncul setelah teks utama */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24"
        >
          {/* Mapping array 'stats' ke dalam bentuk kartu antarmuka */}
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-xl px-6 py-5 text-center">
              <div className="text-2xl font-bold font-mono text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 5. BAGIAN FITUR (HOW IT WORKS) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-32">
        {/* Judul Bagian Fitur. viewport={{ once: true }} memastikan animasi 
            hanya berjalan sekali saat di-scroll ke area ini */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground mb-12 max-w-lg">
            Four steps from raw data to production-ready predictions.
          </p>
        </motion.div>

        {/* Grid Kartu Fitur */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            // Animasi bertahap (staggered) menggunakan kalkulasi delay: i * 0.1
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-6 group hover:border-primary/40 transition-colors"
            >
              {/* Ikon Fitur */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow transition-shadow">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              {/* Nomor urut otomatis */}
              <div className="font-mono text-xs text-muted-foreground mb-2">
                0{i + 1}
              </div>
              {/* Teks Fitur */}
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. BAGIAN CALL TO ACTION (BOTTOM CTA) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-12 text-center glow-strong"
        >
          <Database className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Ready to automate ML?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            No Python. No notebooks. Just results.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2 px-10">
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* 7. BAGIAN FOOTER */}
      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span>DataKu SaaS — Automated Machine Learning for Everyone</span>
        </div>
      </footer>
      
    </div>
  );
}