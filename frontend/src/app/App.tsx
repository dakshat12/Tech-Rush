import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Calendar, MapPin, Users, Star, Zap, Award, Bell, Search, ChevronRight, Plus, ArrowRight, Check, X,
  Clock, QrCode, Download, Share2, TrendingUp, BarChart2, Settings, LogOut, Moon, Sun, Menu, Heart,
  Ticket, MessageCircle, Trophy, Target, Shield, Globe, Sparkles, ChevronDown, Play, Filter,
  Upload, Eye, Send, Hash, Layers, Activity, Grid, List, ArrowUp, Mic, Camera, Map, ChevronLeft,
  MoreHorizontal, Bookmark, Tag, CheckCircle2, AlertCircle, Edit3, Trash2, RefreshCw,
} from "lucide-react";
import { api, setToken } from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type View =
  | "landing" | "auth"
  | "organizer" | "org-create" | "org-analytics"
  | "volunteer" | "vol-kanban" | "vol-leaderboard"
  | "attendee" | "event-detail" | "my-ticket";

type Role = "organizer" | "volunteer" | "attendee";

// ─── Data ────────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: 1, title: "Global AI Summit 2025", category: "Tech", date: "Aug 15, 2025", location: "San Francisco, CA", image: "photo-1540575467063-178a50c2df87", attendees: 2400, capacity: 3000, price: "Free", trending: true, tags: ["AI", "ML", "Innovation"], color: "#7c3aed" },
  { id: 2, title: "Design Systems Conference", category: "Design", date: "Sep 3, 2025", location: "New York, NY", image: "photo-1558618666-fcd25c85cd64", attendees: 890, capacity: 1200, price: "$149", trending: true, tags: ["Design", "Systems", "UI"], color: "#06b6d4" },
  { id: 3, title: "Climate Action Hackathon", category: "Social", date: "Aug 28, 2025", location: "Austin, TX", image: "photo-1497366216548-37526070297c", attendees: 320, capacity: 500, price: "Free", trending: false, tags: ["Climate", "Hack", "SDGs"], color: "#10b981" },
  { id: 4, title: "Startup Founders Retreat", category: "Business", date: "Sep 12, 2025", location: "Miami, FL", image: "photo-1559136555-9303baea8ebd", attendees: 180, capacity: 250, price: "$299", trending: false, tags: ["Founders", "VC", "Networking"], color: "#f59e0b" },
  { id: 5, title: "Community Clean-Up Drive", category: "Volunteer", date: "Aug 20, 2025", location: "Chicago, IL", image: "photo-1593113598332-cd288d649433", attendees: 145, capacity: 300, price: "Free", trending: false, tags: ["Community", "Environment"], color: "#ef4444" },
  { id: 6, title: "Web3 & DeFi Expo", category: "Tech", date: "Oct 5, 2025", location: "Los Angeles, CA", image: "photo-1639762681485-074b7f938ba0", attendees: 1560, capacity: 2000, price: "$79", trending: true, tags: ["Web3", "DeFi", "Crypto"], color: "#8b5cf6" },
];

const VOLUNTEERS = [
  { id: 1, name: "Alex Chen", role: "Team Lead", xp: 4820, level: 12, badges: 8, tasks: 34, avatar: "photo-1507003211169-0a1dd7228f2d", streak: 14 },
  { id: 2, name: "Priya Sharma", role: "Logistics", xp: 3940, level: 10, badges: 6, tasks: 28, avatar: "photo-1494790108377-be9c29b29330", streak: 9 },
  { id: 3, name: "Marcus Jones", role: "Tech Support", xp: 3620, level: 9, badges: 5, tasks: 22, avatar: "photo-1472099645785-5658abf4ff4e", streak: 7 },
  { id: 4, name: "Sofia Reyes", role: "Registration", xp: 2980, level: 8, badges: 4, tasks: 19, avatar: "photo-1438761681033-6461ffad8d80", streak: 5 },
  { id: 5, name: "You (Jamie)", role: "Media", xp: 2650, level: 7, badges: 3, tasks: 16, avatar: "photo-1535713875002-d1d0cf377fde", streak: 3, isMe: true },
];

const TASKS = {
  todo: [
    { id: "t1", title: "Set up registration booth", priority: "high", due: "Aug 15", assignee: "Jamie" },
    { id: "t2", title: "Print volunteer badges", priority: "medium", due: "Aug 14", assignee: "Jamie" },
  ],
  inProgress: [
    { id: "t3", title: "Coordinate speaker transport", priority: "high", due: "Aug 15", assignee: "Jamie" },
    { id: "t4", title: "Test A/V equipment", priority: "medium", due: "Aug 15", assignee: "Jamie" },
  ],
  done: [
    { id: "t5", title: "Create event program PDF", priority: "low", due: "Aug 10", assignee: "Jamie" },
    { id: "t6", title: "Confirm catering order", priority: "medium", due: "Aug 12", assignee: "Jamie" },
  ],
};

const analyticsData = [
  { month: "Mar", registrations: 320, volunteers: 45, revenue: 12400 },
  { month: "Apr", registrations: 480, volunteers: 62, revenue: 18200 },
  { month: "May", registrations: 590, volunteers: 78, revenue: 22100 },
  { month: "Jun", registrations: 720, volunteers: 95, revenue: 31500 },
  { month: "Jul", registrations: 960, volunteers: 112, revenue: 41200 },
  { month: "Aug", registrations: 1240, volunteers: 134, revenue: 56800 },
];

const categoryData = [
  { name: "Tech", value: 42, color: "#7c3aed" },
  { name: "Design", value: 24, color: "#06b6d4" },
  { name: "Social", value: 18, color: "#10b981" },
  { name: "Business", value: 16, color: "#f59e0b" },
];

const BADGES = [
  { icon: "🏆", name: "Event Hero", desc: "50+ events organized", earned: true },
  { icon: "⚡", name: "Speed Demon", desc: "First to complete tasks", earned: true },
  { icon: "🤝", name: "Team Player", desc: "100+ collaborations", earned: true },
  { icon: "🌟", name: "Rising Star", desc: "Top 10% volunteer", earned: false },
  { icon: "🎯", name: "Precision", desc: "0 missed deadlines", earned: false },
  { icon: "🔥", name: "On Fire", desc: "30-day streak", earned: false },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "Venue update for AI Summit", body: "The main hall has been upgraded to accommodate 500 more attendees.", time: "2h ago", urgent: true },
  { id: 2, title: "Volunteer training session", body: "Mandatory briefing scheduled for Aug 14 at 9 AM in Room B.", time: "5h ago", urgent: false },
  { id: 3, title: "New sponsor confirmed", body: "TechCorp joining as Diamond Sponsor — branded booths incoming.", time: "1d ago", urgent: false },
];

// ─── Utilities ───────────────────────────────────────────────────────────────

const cx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

const unsplash = (id: string | undefined, w = 800, h = 500) => {
  const cleanId = (id || "1540575467063-178a50c2df87").replace(/^photo-/, "");
  return `https://images.unsplash.com/photo-${cleanId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
};

const priorityColor = (p: string) =>
  p === "high" ? "text-red-400 bg-red-400/10" : p === "medium" ? "text-amber-400 bg-amber-400/10" : "text-green-400 bg-green-400/10";

// ─── Shared Components ───────────────────────────────────────────────────────

function Avatar({ src, name, size = 8 }: { src: string; name: string; size?: number }) {
  return (
    <img
      src={unsplash(src, 80, 80)}
      alt={name}
      className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-primary/20`}
    />
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "violet" }) {
  const styles = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    danger: "bg-red-500/10 text-red-500",
    violet: "bg-violet-500/10 text-violet-400",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
}

function Btn({
  children, onClick, variant = "primary", size = "md", className = "", disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "text-foreground hover:bg-muted",
    outline: "border border-border text-foreground hover:bg-muted",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={cx(base, sizes[size], variants[variant], className)}>
      {children}
    </button>
  );
}

function StatCard({ label, value, delta, icon: Icon, color = "violet" }: {
  label: string; value: string; delta?: string; icon: React.ElementType; color?: string;
}) {
  const colors: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
    green: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <div className={cx("p-2 rounded-xl", colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {delta && (
          <span className="text-xs text-emerald-500 font-medium mb-0.5 flex items-center gap-0.5">
            <ArrowUp className="w-3 h-3" />{delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── TopNav ──────────────────────────────────────────────────────────────────

function TopNav({ view, setView, dark, setDark, role, setRole, user, onLogout }: {
  view: View; setView: (v: View) => void; dark: boolean; setDark: (d: boolean) => void;
  role: Role; setRole: (r: Role) => void; user?: any; onLogout?: () => void;
}) {
  const navItems: Record<Role, { label: string; view: View }[]> = {
    organizer: [
      { label: "Dashboard", view: "organizer" },
      { label: "Create Event", view: "org-create" },
      { label: "Analytics", view: "org-analytics" },
    ],
    volunteer: [
      { label: "Dashboard", view: "volunteer" },
      { label: "Task Board", view: "vol-kanban" },
      { label: "Leaderboard", view: "vol-leaderboard" },
    ],
    attendee: [
      { label: "Discover", view: "attendee" },
      { label: "Event Detail", view: "event-detail" },
      { label: "My Ticket", view: "my-ticket" },
    ],
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-4 bg-background/80 backdrop-blur-xl border-b border-border">
      <button onClick={() => setView("landing")} className="flex items-center gap-2 font-bold text-foreground text-sm">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold tracking-tight">Evently</span>
      </button>
      <div className="flex items-center gap-1 ml-4 flex-1">
        {navItems[role]?.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={cx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              view === item.view ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value as Role); setView(e.target.value === "organizer" ? "organizer" : e.target.value === "volunteer" ? "volunteer" : "attendee"); }}
          className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground cursor-pointer"
        >
          <option value="organizer">Organizer</option>
          <option value="volunteer">Volunteer</option>
          <option value="attendee">Attendee</option>
        </select>
        <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <div
          onClick={onLogout}
          title={user ? `Sign out ${user.name}` : "Sign out"}
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold cursor-pointer"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : "J"}
        </div>
      </div>
    </nav>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ setView, dark, setDark }: { setView: (v: View) => void; dark: boolean; setDark: (d: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<Role>("organizer");
  const features = [
    { icon: Calendar, title: "Smart Event Creation", desc: "AI-powered wizard with smart defaults, auto-save, and live preview.", color: "violet" },
    { icon: Users, title: "Volunteer Matching", desc: "ML-driven matching pairs volunteers with events based on skills.", color: "cyan" },
    { icon: Ticket, title: "Digital Tickets", desc: "Instant QR tickets with one-click registration and calendar sync.", color: "green" },
    { icon: BarChart2, title: "Real-time Analytics", desc: "Live dashboards tracking registrations, revenue, and engagement.", color: "amber" },
    { icon: Trophy, title: "Gamification", desc: "XP, badges, and leaderboards to keep volunteers motivated.", color: "violet" },
    { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with SSO, 2FA, and audit logs.", color: "cyan" },
  ];
  const iconColors: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-500",
    cyan: "bg-cyan-500/10 text-cyan-500",
    green: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  };
  const roleCards = {
    organizer: { title: "For Organizers", desc: "Create, manage, and scale events with AI-powered tools. Multi-step wizard, drag-and-drop uploads, real-time analytics, and one-click publishing.", cta: "Start Organizing", view: "organizer" as View, img: "photo-1540575467063-178a50c2df87" },
    volunteer: { title: "For Volunteers", desc: "Track your impact, earn badges, climb the leaderboard. A beautiful dashboard with tasks, shifts, certificates, and a gamified experience.", cta: "Join as Volunteer", view: "volunteer" as View, img: "photo-1593113598332-cd288d649433" },
    attendee: { title: "For Attendees", desc: "Discover events you'll love. Netflix-style browsing, one-click registration, digital tickets with QR codes, and smart recommendations.", cta: "Explore Events", view: "attendee" as View, img: "photo-1497366216548-37526070297c" },
  };
  const active = roleCards[activeTab];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground">Evently</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Product</a>
          <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">Blog</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Btn variant="ghost" onClick={() => setView("auth")} size="sm">Sign in</Btn>
          <Btn onClick={() => setView("auth")} size="sm">Get started free</Btn>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Now with AI-powered event matching
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08] mb-6">
            Events that bring{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">
              people together
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for organizers, volunteers, and attendees. Create memorable experiences with AI, manage teams effortlessly, and discover events you love.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Btn size="lg" onClick={() => setView("auth")}>
              Start for free <ArrowRight className="w-4 h-4" />
            </Btn>
            <Btn size="lg" variant="outline" onClick={() => setView("attendee")}>
              <Play className="w-4 h-4" /> Explore events
            </Btn>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Free forever · No credit card required</p>
        </div>

        {/* Hero Preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/20">
            <img
              src={unsplash("1540575467063-178a50c2df87", 1200, 600)}
              alt="Evently platform preview"
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          {[
            { value: "2.4M+", label: "Events hosted" },
            { value: "18M+", label: "Attendees served" },
            { value: "340K+", label: "Volunteers engaged" },
            { value: "98%", label: "Satisfaction rate" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Built for every role</h2>
            <p className="text-muted-foreground">One platform, three tailored experiences.</p>
          </div>
          <div className="flex gap-2 justify-center mb-8">
            {(["organizer", "volunteer", "attendee"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveTab(r)}
                className={cx(
                  "px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize",
                  activeTab === r ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden grid md:grid-cols-2">
            <div className="p-10 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-foreground mb-3">{active.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{active.desc}</p>
              <Btn onClick={() => setView(active.view)}>
                {active.cta} <ChevronRight className="w-4 h-4" />
              </Btn>
            </div>
            <div className="bg-muted/40 min-h-56 relative overflow-hidden">
              <img src={unsplash(active.img, 600, 400)} alt={active.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground">Powerful features that scale with your events.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                <div className={cx("w-10 h-10 rounded-xl flex items-center justify-center mb-4", iconColors[f.color])}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary/10 to-violet-500/5 border border-primary/20 rounded-3xl p-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to create something unforgettable?</h2>
            <p className="text-muted-foreground mb-8">Join 50,000+ event organizers already using Evently. Always free.</p>
            <Btn size="lg" onClick={() => setView("auth")}>
              Get started free <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-foreground">Evently</span>
          </div>
          <span>© 2025 Evently, Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ setView, onAuthSuccess }: { setView: (v: View) => void; onAuthSuccess?: (user: any) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>("attendee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleMap: Record<Role, View> = { organizer: "organizer", volunteer: "volunteer", attendee: "attendee" };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Please provide your name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await api.login(email, password);
        if (onAuthSuccess) onAuthSuccess(res.user);
        const userRole = (res.user.role || role).toLowerCase() as Role;
        setView(roleMap[userRole] || "organizer");
      } else {
        const res = await api.signup(name, email, password, role);
        if (onAuthSuccess) onAuthSuccess(res.user);
        setView(roleMap[role]);
      }
    } catch (err: any) {
      console.error("API Auth Error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary to-violet-800 relative overflow-hidden flex-col justify-end p-12">
        <div className="absolute inset-0">
          <img src={unsplash("1540575467063-178a50c2df87", 800, 1000)} alt="" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-lg">Evently</span>
          </div>
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-4">
            "Evently transformed how we manage our annual conference. 10x faster setup, 3x more volunteer retention."
          </blockquote>
          <div className="flex items-center gap-3">
            <img src={unsplash("1494790108377-be9c29b29330", 48, 48)} alt="Priya" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-white font-semibold text-sm">Priya Sharma</p>
              <p className="text-white/60 text-xs">Head of Events, TechCorp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <button onClick={() => setView("landing")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </button>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === "signin" ? "Sign in to your Evently account." : "Create your free account in seconds."}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {(["attendee", "volunteer", "organizer"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cx(
                      "py-2 rounded-xl text-xs font-semibold border transition-all capitalize",
                      role === r ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Jamie Rivera" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="alex@evently.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="••••••••" type="password" />
            </div>
          </div>

          <Btn className="w-full justify-center" onClick={handleSubmit} disabled={loading}>
            {loading ? "Connecting..." : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="w-4 h-4" />
          </Btn>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Google", "GitHub"].map((p) => (
              <button key={p} onClick={() => p === "Google" ? window.location.href = "http://localhost:5000/api/auth/google" : undefined} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Globe className="w-4 h-4" /> {p}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-semibold hover:underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Organizer Dashboard ──────────────────────────────────────────────────────

function OrganizerDashboard({ setView }: { setView: (v: View) => void }) {
  const [events, setEvents] = useState<any[]>(EVENTS);
  const [announcements, setAnnouncements] = useState<any[]>(ANNOUNCEMENTS);
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>(analyticsData);

  useEffect(() => {
    api.getEvents().then((r) => setEvents(r.events)).catch(() => {});
    api.getAnnouncements().then((r) => setAnnouncements(r.announcements)).catch(() => {});
    api.getAnalyticsOverview()
      .then((r) => { setOverview(r.overview); setTrend(r.analyticsData); })
      .catch(() => {});
  }, []);

  const myEvents = events.slice(0, 4);
  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Good morning 👋</p>
            <h1 className="text-2xl font-extrabold text-foreground">Jamie Rivera</h1>
          </div>
          <Btn onClick={() => setView("org-create")}>
            <Plus className="w-4 h-4" /> New Event
          </Btn>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Events" value={overview ? String(overview.totalEvents) : "24"} delta="12%" icon={Calendar} color="violet" />
          <StatCard label="Total Attendees" value={overview ? overview.totalAttendees.toLocaleString() : "8,342"} delta="18%" icon={Users} color="cyan" />
          <StatCard label="Volunteers" value={overview ? String(overview.totalVolunteers) : "186"} delta="9%" icon={Heart} color="green" />
          <StatCard label="Registrations" value={overview ? overview.totalRegistrations.toLocaleString() : "8,342"} delta="24%" icon={TrendingUp} color="amber" />
        </div>

        {/* Mini chart + announcements */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Registration trend</h3>
              <Badge variant="violet">Last 6 months</Badge>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="registrations" stroke="#7c3aed" strokeWidth={2} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Announcements</h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <div className={cx("w-2 h-2 mt-1.5 rounded-full flex-shrink-0", a.urgent ? "bg-red-500" : "bg-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="ghost" size="sm" className="mt-3 text-xs w-full justify-center">
              View all <ChevronRight className="w-3 h-3" />
            </Btn>
          </div>
        </div>

        {/* My Events */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">My Events</h3>
            <Btn variant="ghost" size="sm">View all <ChevronRight className="w-4 h-4" /></Btn>
          </div>
          <div className="divide-y divide-border">
            {myEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img src={unsplash(ev.image || ev.imageUrl, 96, 96)} alt={ev.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">{ev.date} · {ev.location}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-foreground">{ev.attendees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">attendees</p>
                </div>
                <div className="w-20 hidden md:block">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(ev.attendees / ev.capacity) * 100}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((ev.attendees / ev.capacity) * 100)}% full</p>
                </div>
                <Badge variant={ev.trending ? "violet" : "default"}>{ev.trending ? "Trending" : "Active"}</Badge>
                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Creation Wizard ────────────────────────────────────────────────────

function EventCreationWizard({ setView, onEventCreated }: { setView: (v: View) => void; onEventCreated?: (newEvent: any) => void }) {
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(false);
  const [category, setCategory] = useState("Tech");
  const [capacity, setCapacity] = useState(500);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceType, setPriceType] = useState("Free");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Details" },
    { n: 3, label: "Volunteers" },
    { n: 4, label: "Publish" },
  ];

  const triggerAI = () => {
    setAiSuggestion(true);
    setTimeout(() => {
      setTitle("Global Innovation Summit 2025");
      setDesc("A premier gathering of innovators, entrepreneurs, and thought leaders exploring the frontiers of technology and human potential. Three days of keynotes, workshops, and networking that will reshape your perspective.");
    }, 800);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError("");
    try {
      const res = await api.createEvent({
        title: title || "Global Innovation Summit 2025",
        description: desc || "Event description coming soon.",
        category,
        capacity,
        price: priceType,
        trending: false,
        tags: [category],
        startTime: startDate ? new Date(startDate).toISOString() : undefined,
        endTime: endDate ? new Date(endDate).toISOString() : undefined,
      });
      if (onEventCreated) onEventCreated(res.event);
      setView("organizer");
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish event");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("organizer")} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Create New Event</h1>
            <p className="text-sm text-muted-foreground">Step {step} of {steps.length}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Auto-saved</Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((s) => (
            <div key={s.n} className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > s.n ? "bg-emerald-500 text-white" : step === s.n ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {step > s.n ? <Check className="w-3 h-3" /> : s.n}
                </div>
                <span className={cx("text-xs font-medium", step >= s.n ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className={cx("h-full rounded-full bg-primary transition-all duration-500", step > s.n ? "w-full" : step === s.n ? "w-1/2" : "w-0")} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="md:col-span-2 space-y-5">
            {step === 1 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-foreground">Event basics</h2>
                  <button onClick={triggerAI} className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-3 h-3" /> AI Suggestions
                  </button>
                </div>
                {aiSuggestion && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-primary flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>AI has pre-filled suggested content based on trending events. Feel free to edit!</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Event title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Annual Design Conference 2025" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" placeholder="Tell attendees what your event is about..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="Tech">Technology</option>
                      <option value="Design">Design</option>
                      <option value="Business">Business</option>
                      <option value="Social">Social</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Capacity</label>
                    <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>

                {/* Poster upload */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Event poster</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                    className={cx(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                      dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Drop your poster here</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP · Max 10MB</p>
                      <Btn variant="outline" size="sm">Browse files</Btn>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold text-foreground">Date, time & location</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Start date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">End date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Venue</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Moscone Center, San Francisco, CA" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Ticketing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Free", "Paid", "Donation"].map((t) => (
                      <button key={t} onClick={() => setPriceType(t)} className={cx("py-2.5 rounded-xl border text-sm font-medium transition-all", priceType === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-2xl overflow-hidden h-40 relative">
                  <img src={unsplash("1569336415962-a4bd9f69cd83", 700, 300)} alt="Map" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground flex items-center gap-1">
                      <Map className="w-3.5 h-3.5 text-primary" /> Moscone Center
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold text-foreground">Volunteer requirements</h2>
                <div className="space-y-3">
                  {[
                    { role: "Registration Desk", count: 4, skills: ["Communication", "Organization"] },
                    { role: "Tech Support", count: 2, skills: ["A/V", "Networking"] },
                    { role: "Photography", count: 2, skills: ["Camera", "Editing"] },
                  ].map((r) => (
                    <div key={r.role} className="flex items-center gap-4 bg-muted/40 rounded-xl p-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{r.role}</p>
                        <div className="flex gap-1 mt-1">
                          {r.skills.map((s) => <Badge key={s}>{s}</Badge>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm hover:bg-border transition-colors">-</button>
                        <span className="text-sm font-semibold text-foreground w-6 text-center">{r.count}</span>
                        <button className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground text-sm hover:bg-border transition-colors">+</button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full border-2 border-dashed border-border rounded-xl py-3 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add role
                  </button>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-primary">AI Matching enabled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Evently will automatically suggest qualified volunteers based on your requirements.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold text-foreground">Review & publish</h2>
                <div className="space-y-3">
                  {[
                    { label: "Event title", value: title || "Global Innovation Summit 2025", ok: true },
                    { label: "Date", value: "Aug 15 – 17, 2025", ok: true },
                    { label: "Capacity", value: "500 attendees", ok: true },
                    { label: "Volunteers needed", value: "8 volunteers, 3 roles", ok: true },
                    { label: "Ticketing", value: "Free registration", ok: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ready to publish</p>
                    <p className="text-xs text-muted-foreground">Your event will be live immediately after publishing.</p>
                  </div>
                </div>
              </div>
            )}

            {publishError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
                {publishError}
              </div>
            )}
            <div className="flex gap-3">
              {step > 1 && <Btn variant="outline" onClick={() => setStep(s => s - 1)}>Back</Btn>}
              {step < 4 ? (
                <Btn onClick={() => setStep(s => s + 1)} className="flex-1 justify-center">
                  Continue <ArrowRight className="w-4 h-4" />
                </Btn>
              ) : (
                <Btn onClick={handlePublish} disabled={publishing} className="flex-1 justify-center">
                  <Zap className="w-4 h-4" /> {publishing ? "Publishing..." : "Publish Event"}
                </Btn>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="hidden md:block">
            <div className="sticky top-20 bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Live preview</span>
              </div>
              <div>
                <div className="h-32 bg-muted relative overflow-hidden">
                  <img src={unsplash("1540575467063-178a50c2df87", 400, 200)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 space-y-2">
                  <Badge variant="violet">Technology</Badge>
                  <h4 className="font-bold text-foreground text-sm">{title || "Your Event Title"}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{desc || "Event description will appear here..."}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" /> Aug 15, 2025
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> San Francisco, CA
                  </div>
                  <Btn size="sm" className="w-full justify-center mt-2">Register Free</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function Analytics({ setView }: { setView: (v: View) => void }) {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>(analyticsData);
  const [catData, setCatData] = useState<any[]>(categoryData);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then((r) => { setOverview(r.overview); setTrend(r.analyticsData); setCatData(r.categoryData); })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm">Performance across all your events</p>
          </div>
          <div className="flex gap-2">
            <select className="text-sm bg-muted border border-border rounded-xl px-3 py-2 text-foreground">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
            <Btn variant="outline" size="sm"><Download className="w-4 h-4" /> Export</Btn>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Registrations" value={overview ? overview.totalRegistrations.toLocaleString() : "8,342"} delta="18%" icon={Users} color="violet" />
          <StatCard label="Total Events" value={overview ? String(overview.totalEvents) : "24"} delta="24%" icon={Calendar} color="green" />
          <StatCard label="Volunteers" value={overview ? String(overview.totalVolunteers) : "186"} delta="0.3" icon={Star} color="amber" />
          <StatCard label="Attendees" value={overview ? overview.totalAttendees.toLocaleString() : "2,140"} delta="31%" icon={Clock} color="cyan" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Registrations & Revenue</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="registrations" fill="#7c3aed" radius={[6, 6, 0, 0]} opacity={0.9} />
                <Bar yAxisId="right" dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Category breakdown</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                  {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {catData.map((c) => {
                const total = catData.reduce((sum, x) => sum + x.value, 0) || 1;
                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{Math.round((c.value / total) * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Volunteer engagement</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="volunteers" stroke="#10b981" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Volunteer Dashboard ──────────────────────────────────────────────────────

function VolunteerDashboard({ setView, user }: { setView: (v: View) => void; user?: any }) {
  const [leaderboard, setLeaderboard] = useState<any[]>(VOLUNTEERS);
  const [tasks, setTasks] = useState<{ todo: any[]; inProgress: any[]; done: any[] }>(TASKS);
  const [announcements, setAnnouncements] = useState<any[]>(ANNOUNCEMENTS);

  useEffect(() => {
    api.getLeaderboard().then((r) => setLeaderboard(r.leaderboard)).catch(() => {});
    api.getTasks().then((r) => setTasks(r.tasks)).catch(() => {});
    api.getAnnouncements().then((r) => setAnnouncements(r.announcements)).catch(() => {});
  }, []);

  const me = leaderboard.find((v) => v.isMe) || leaderboard.find((v) => user && v.id === user.id) || {
    name: user?.name || "You", role: user?.roleTitle || "Volunteer", xp: 0, level: 1, badges: 0, tasks: 0,
    avatar: "photo-1535713875002-d1d0cf377fde", streak: 0,
  };
  const myRank = leaderboard.findIndex((v) => v === me) + 1 || 5;
  const xpToNextLevel = 3000;
  const xpProgress = (me.xp % xpToNextLevel) / xpToNextLevel;
  const myTasks = [...tasks.todo, ...tasks.inProgress];

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Hero */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar src={me.avatar} name={me.name} size={16} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                {me.level}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-extrabold text-foreground">{me.name}</h1>
                  <p className="text-muted-foreground text-sm">{me.role} · Level {me.level}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">🔥 {me.streak}-day streak</Badge>
                  <Btn variant="outline" size="sm"><Edit3 className="w-3 h-3" /> Edit profile</Btn>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">XP Progress</span>
                  <span className="text-xs font-bold text-primary font-mono">{me.xp.toLocaleString()} XP</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-violet-400 rounded-full transition-all duration-1000" style={{ width: `${xpProgress * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.round((1 - xpProgress) * xpToNextLevel)} XP to Level {me.level + 1}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">{me.tasks}</p>
              <p className="text-xs text-muted-foreground">Tasks done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">{me.badges}</p>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">#{myRank}</p>
              <p className="text-xs text-muted-foreground">Leaderboard</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Left: Tasks + Shifts */}
          <div className="md:col-span-2 space-y-5">
            {/* Current tasks */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">My Tasks</h3>
                <Btn variant="ghost" size="sm" onClick={() => setView("vol-kanban")}>
                  View board <ChevronRight className="w-4 h-4" />
                </Btn>
              </div>
              <div className="space-y-2">
                {myTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 cursor-pointer hover:border-primary transition-colors" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Due {t.due}</p>
                    </div>
                    <span className={cx("text-xs font-semibold px-2 py-0.5 rounded-full", priorityColor(t.priority))}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming shifts */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Shifts</h3>
              <div className="space-y-3">
                {[
                  { event: "Global AI Summit", date: "Aug 15", time: "8:00 – 12:00 AM", role: "Registration Desk", status: "confirmed" },
                  { event: "Climate Hackathon", date: "Aug 28", time: "9:00 – 5:00 PM", role: "Photography", status: "pending" },
                ].map((s) => (
                  <div key={s.event} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{s.event}</p>
                      <p className="text-xs text-muted-foreground">{s.role} · {s.date} · {s.time}</p>
                    </div>
                    <Badge variant={s.status === "confirmed" ? "success" : "warning"}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Announcements</h3>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className={cx("p-4 rounded-xl border", a.urgent ? "border-red-500/20 bg-red-500/5" : "border-border bg-muted/30")}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      {a.urgent && <Badge variant="danger">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Badges + Leaderboard preview */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Badges</h3>
                <span className="text-xs text-muted-foreground">3/6 earned</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {BADGES.map((b) => (
                  <div key={b.name} className={cx("flex flex-col items-center gap-1 p-2 rounded-xl", b.earned ? "opacity-100" : "opacity-30 grayscale")}>
                    <span className="text-2xl">{b.icon}</span>
                    <p className="text-xs font-medium text-foreground text-center leading-tight">{b.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Leaderboard</h3>
                <Btn variant="ghost" size="sm" onClick={() => setView("vol-leaderboard")}>
                  Full <ChevronRight className="w-3 h-3" />
                </Btn>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 4).map((v, i) => (
                  <div key={v.id} className={cx("flex items-center gap-3 p-2 rounded-xl transition-colors", v.isMe ? "bg-primary/10" : "hover:bg-muted/40")}>
                    <span className={cx("text-sm font-bold w-5 text-center font-mono", i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground")}>
                      {i + 1}
                    </span>
                    <Avatar src={v.avatar} name={v.name} size={7} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{v.isMe ? "You" : v.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{v.xp.toLocaleString()} XP</p>
                    </div>
                    {i === 0 && <span className="text-base">👑</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Certificates</h3>
              <div className="space-y-2">
                {["AI Summit 2024", "Design Week 2024"].map((cert) => (
                  <div key={cert} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-foreground">{cert}</span>
                    </div>
                    <Btn variant="ghost" size="sm"><Download className="w-3 h-3" /></Btn>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({ setView }: { setView: (v: View) => void }) {
  const [tasks, setTasks] = useState<{ todo: any[]; inProgress: any[]; done: any[] }>(TASKS);

  const loadTasks = () => {
    api.getTasks().then((r) => setTasks(r.tasks)).catch(() => {});
  };

  useEffect(() => { loadTasks(); }, []);

  const addCard = async (stage: string) => {
    const title = window.prompt("Task title");
    if (!title) return;
    try {
      await api.createTask({ title, priority: "medium", stage });
      loadTasks();
    } catch (err) {
      console.warn("Failed to create task", err);
    }
  };

  const advance = async (t: any) => {
    const next: Record<string, string> = { todo: "inProgress", inProgress: "done" };
    const nextStage = next[t.stage];
    if (!nextStage) return;
    try {
      await api.updateTask(t.id, { stage: nextStage });
      loadTasks();
    } catch (err) {
      console.warn("Failed to update task", err);
    }
  };

  const cols = [
    { id: "todo", label: "To Do", color: "bg-slate-500", tasks: tasks.todo },
    { id: "inProgress", label: "In Progress", color: "bg-amber-500", tasks: tasks.inProgress },
    { id: "done", label: "Done", color: "bg-emerald-500", tasks: tasks.done },
  ];
  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("volunteer")} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">Task Board</h1>
          <Badge variant="violet">AI Summit 2025</Badge>
          <Btn variant="outline" size="sm" className="ml-auto" onClick={() => addCard("todo")}><Plus className="w-4 h-4" /> Add task</Btn>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {cols.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={cx("w-2.5 h-2.5 rounded-full", col.color)} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{col.tasks.length}</span>
              </div>
              {col.tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => advance(t)}
                  title={col.id !== "done" ? "Click to move to next stage" : undefined}
                  className={cx(
                    "bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all",
                    col.id !== "done" && "cursor-pointer"
                  )}
                >
                  <p className="text-sm font-medium text-foreground mb-2">{t.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={cx("text-xs font-semibold px-2 py-0.5 rounded-full", priorityColor(t.priority))}>
                      {t.priority}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.due}
                    </span>
                  </div>
                </div>
              ))}
              <button onClick={() => addCard(col.id)} className="w-full border-2 border-dashed border-border rounded-xl py-3 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add card
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

function Leaderboard({ setView }: { setView: (v: View) => void }) {
  const [leaderboard, setLeaderboard] = useState<any[]>(VOLUNTEERS);

  useEffect(() => {
    api.getLeaderboard().then((r) => setLeaderboard(r.leaderboard)).catch(() => {});
  }, []);

  const podium = [leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean);

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView("volunteer")} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Global volunteer rankings · August 2025</p>
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
          {podium.map((v, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            const golds = ["bg-slate-400/10 border-slate-400/30", "bg-amber-500/10 border-amber-500/30", "bg-amber-700/10 border-amber-700/30"];
            const icons = ["🥈", "🥇", "🥉"];
            return (
              <div key={v.id} className="flex-1 flex flex-col items-center gap-2">
                <Avatar src={v.avatar} name={v.name} size={12} />
                <p className="text-xs font-semibold text-foreground">{v.name.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground font-mono">{v.xp.toLocaleString()} XP</p>
                <div className={cx("w-full rounded-t-xl border flex items-center justify-center text-2xl", heights[podiumIdx], golds[podiumIdx])}>
                  {icons[podiumIdx]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {leaderboard.map((v, i) => (
            <div key={v.id} className={cx("flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 transition-colors", v.isMe ? "bg-primary/5" : "hover:bg-muted/30")}>
              <span className={cx("text-base font-bold w-6 text-center font-mono", i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground")}>
                {i + 1}
              </span>
              <Avatar src={v.avatar} name={v.name} size={10} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{v.isMe ? `${v.name} (You)` : v.name}</p>
                <p className="text-xs text-muted-foreground">Level {v.level} · {v.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground font-mono">{v.xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(v.badges, 3) }).map((_, j) => (
                  <span key={j} className="text-sm">{["🏆", "⚡", "🤝"][j]}</span>
                ))}
              </div>
              {v.streak > 7 && <Badge variant="warning">🔥 {v.streak}d</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Attendee Discovery ───────────────────────────────────────────────────────

function AttendeeDiscovery({ setView, onSelectEvent }: { setView: (v: View) => void; onSelectEvent?: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [events, setEvents] = useState<any[]>(EVENTS);
  const categories = ["All", "Tech", "Design", "Social", "Business", "Volunteer"];

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.getEvents({ category: activeCategory, search })
        .then((r) => setEvents(r.events))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timeout);
  }, [activeCategory, search]);

  const filtered = events;

  const openEvent = (id: number) => {
    if (onSelectEvent) onSelectEvent(id);
    setView("event-detail");
  };

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, cities, categories…"
              className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Btn variant="outline"><Filter className="w-4 h-4" /> Filters</Btn>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cx(
                "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                activeCategory === cat ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trending hero */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Trending Now
            </h2>
            <button className="text-sm text-primary font-semibold hover:underline">See all</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {events.filter((e) => e.trending).slice(0, 2).map((ev) => (
              <div
                key={ev.id}
                onClick={() => openEvent(ev.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="relative h-52 bg-muted">
                  <img src={unsplash(ev.image || ev.imageUrl, 700, 400)} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="violet">🔥 Trending</Badge>
                    <Badge variant="default">{ev.category}</Badge>
                  </div>
                  <button className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg leading-tight">{ev.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{ev.attendees.toLocaleString()} going</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{ev.price}</span>
                  <Btn size="sm" onClick={(e) => { e && (e as React.MouseEvent).stopPropagation(); openEvent(ev.id); }}>
                    Register
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All events grid */}
        <div>
          <h2 className="text-lg font-extrabold text-foreground mb-4">
            {activeCategory === "All" ? "All Events" : activeCategory} · {filtered.length} events
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {filtered.map((ev) => (
              <div
                key={ev.id}
                onClick={() => openEvent(ev.id)}
                className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300"
              >
                <div className="relative h-40 bg-muted">
                  <img src={unsplash(ev.image || ev.imageUrl, 500, 300)} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="default">{ev.category}</Badge>
                  </div>
                  <button className="absolute top-3 right-3 p-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-2 leading-tight">{ev.title}</h3>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{ev.attendees.toLocaleString()}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{ev.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Detail ─────────────────────────────────────────────────────────────

function EventDetail({ setView, eventId }: { setView: (v: View) => void; eventId?: number | null }) {
  const [ev, setEv] = useState<any>(EVENTS[0]);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [countdown, setCountdown] = useState({ days: 10, hours: 6, mins: 24 });

  useEffect(() => {
    if (!eventId) return;
    api.getEventById(eventId).then((r) => setEv(r.event)).catch(() => {});
  }, [eventId]);

  const handleRegister = async () => {
    if (!eventId) { setRegistered(true); setView("my-ticket"); return; }
    setRegistering(true);
    try {
      await api.registerForEvent(eventId);
      setRegistered(true);
      setView("my-ticket");
    } catch (err) {
      console.warn("Registration failed", err);
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        const totalSecs = c.days * 86400 + c.hours * 3600 + c.mins * 60 - 60;
        return {
          days: Math.floor(totalSecs / 86400),
          hours: Math.floor((totalSecs % 86400) / 3600),
          mins: Math.floor((totalSecs % 3600) / 60),
        };
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero */}
      <div className="relative h-72 bg-muted">
        <img src={unsplash(ev.image || ev.imageUrl, 1400, 600)} alt={ev.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button onClick={() => setView("attendee")} className="absolute top-6 left-6 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-6 right-6 flex gap-2">
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20 transition-colors"><Heart className="w-5 h-5" /></button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 hover:bg-white/20 transition-colors"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-12 relative">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex gap-2 mb-3">
                <Badge variant="violet">🔥 Trending</Badge>
                <Badge>{ev.category}</Badge>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground mb-2">{ev.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{ev.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{ev.location}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{ev.attendees.toLocaleString()} registered</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join us for the most anticipated technology summit of 2025. This three-day conference brings together visionaries, engineers, and investors from across the globe to explore the frontiers of artificial intelligence, sustainable tech, and the future of human-computer interaction.
              </p>
              <div className="flex gap-2 mt-4">
                {ev.tags.map((t) => <Badge key={t}><Tag className="w-3 h-3" /> {t}</Badge>)}
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-medium text-muted-foreground mb-3">Event starts in</p>
              <div className="grid grid-cols-3 gap-3">
                {[["Days", countdown.days], ["Hours", countdown.hours], ["Mins", countdown.mins]].map(([l, v]) => (
                  <div key={l as string} className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <p className="text-3xl font-extrabold text-primary font-mono">{String(v).padStart(2, "0")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Schedule highlights</h3>
              <div className="space-y-3">
                {[
                  { time: "9:00 AM", title: "Opening Keynote", speaker: "Dr. Alex Chen, CEO of DeepMind", type: "keynote" },
                  { time: "11:00 AM", title: "AI in Healthcare Panel", speaker: "4 industry experts", type: "panel" },
                  { time: "2:00 PM", title: "Workshop: Building LLM Apps", speaker: "Engineering leads", type: "workshop" },
                  { time: "5:00 PM", title: "Networking Reception", speaker: "All attendees welcome", type: "social" },
                ].map((item) => (
                  <div key={item.time} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                    <div className="text-xs font-mono font-medium text-muted-foreground w-16 flex-shrink-0 mt-0.5">{item.time}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.speaker}</p>
                    </div>
                    <div className="ml-auto">
                      <Badge variant={item.type === "keynote" ? "violet" : item.type === "workshop" ? "success" : "default"}>
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-3xl font-extrabold text-foreground">{ev.price}</p>
                <p className="text-sm text-muted-foreground">per person</p>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{ev.attendees.toLocaleString()} registered</span>
                  <span className="font-semibold text-foreground">{Math.round((ev.attendees / ev.capacity) * 100)}% full</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(ev.attendees / ev.capacity) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ev.capacity - ev.attendees} spots left</p>
              </div>
              {!registered ? (
                <Btn className="w-full justify-center" onClick={() => { setRegistered(true); setView("my-ticket"); }}>
                  <Ticket className="w-4 h-4" /> Register now
                </Btn>
              ) : (
                <Btn variant="secondary" className="w-full justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Registered!
                </Btn>
              )}
              <div className="mt-4 space-y-2">
                <button className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors">
                  <Calendar className="w-4 h-4" /> Add to calendar
                </button>
                <button className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors">
                  <Map className="w-4 h-4" /> View on map
                </button>
                <button className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors">
                  <Share2 className="w-4 h-4" /> Share event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Ticket ────────────────────────────────────────────────────────────────

function MyTicket({ setView, eventId, user }: { setView: (v: View) => void; eventId?: number | null; user?: any }) {
  const [ev, setEv] = useState<any>(EVENTS[0]);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    api.getMyTickets()
      .then((r) => {
        const tickets = r.tickets || [];
        const match = eventId ? tickets.find((t: any) => t.eventId === eventId) : tickets[0];
        const chosen = match || tickets[0];
        if (chosen) {
          setTicket(chosen);
          if (chosen.event) setEv({ ...chosen.event, image: chosen.event.imageUrl || chosen.event.image });
        }
      })
      .catch(() => {});
  }, [eventId]);

  const attendeeName = user?.name || "Jamie Rivera";
  const ticketId = ticket ? `#${ticket.qrToken}` : "#EVT-2025-08142";
  const checkInLabel = ev.date ? `${ev.date} · 8:00 AM` : "Aug 15, 2025 · 8:00 AM";

  return (
    <div className="pt-14 min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView("attendee")} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">My Ticket</h1>
        </div>

        {/* Ticket card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-violet-700 p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/80 text-sm font-medium">Evently</span>
              </div>
              <h2 className="text-white font-extrabold text-xl leading-tight mb-1">{ev.title}</h2>
              <p className="text-white/70 text-sm">{ev.date} · {ev.location}</p>
            </div>
          </div>

          {/* Tear */}
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-background -ml-3 flex-shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
            <div className="w-6 h-6 rounded-full bg-background -mr-3 flex-shrink-0" />
          </div>

          {/* QR section */}
          <div className="p-6">
            <div className="bg-muted rounded-2xl p-6 flex items-center justify-center mb-5">
              {/* SVG QR-like grid */}
              <svg width="120" height="120" viewBox="0 0 120 120" className="text-foreground">
                {/* Finder patterns */}
                <rect x="4" y="4" width="28" height="28" rx="3" fill="currentColor" />
                <rect x="8" y="8" width="20" height="20" rx="2" fill="var(--background)" />
                <rect x="12" y="12" width="12" height="12" rx="1" fill="currentColor" />
                <rect x="88" y="4" width="28" height="28" rx="3" fill="currentColor" />
                <rect x="92" y="8" width="20" height="20" rx="2" fill="var(--background)" />
                <rect x="96" y="12" width="12" height="12" rx="1" fill="currentColor" />
                <rect x="4" y="88" width="28" height="28" rx="3" fill="currentColor" />
                <rect x="8" y="92" width="20" height="20" rx="2" fill="var(--background)" />
                <rect x="12" y="96" width="12" height="12" rx="1" fill="currentColor" />
                {/* Data dots */}
                {[40,44,48,56,64,68,72,80,84].flatMap((x) => [40,44,48,52,56,60,64,68,72,76,80].map((y) => (Math.sin(x * y) > 0.2 ? <rect key={`dot-${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" fill="currentColor" /> : null)))}
                {/* Timing patterns */}
                {[36,44,52,60,68,76,84].map((x, i) => i % 2 === 0 ? <rect key={`th-${x}`} x={x} y="36" width="4" height="4" rx="1" fill="currentColor" /> : null)}
                {[36,44,52,60,68,76,84].map((y, i) => i % 2 === 0 ? <rect key={`tv-${y}`} x="36" y={y} width="4" height="4" rx="1" fill="currentColor" /> : null)}
              </svg>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Attendee", value: attendeeName },
                { label: "Ticket ID", value: ticketId, mono: true },
                { label: "Seat", value: "General Admission" },
                { label: "Check-in", value: checkInLabel },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={cx("text-xs font-semibold text-foreground", item.mono && "font-mono")}>{item.value}</span>
                </div>
              ))}
            </div>

            <Badge variant="success" className="w-full justify-center py-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Valid Ticket · Ready to scan
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex border-t border-border">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Download className="w-4 h-4" /> Save
            </button>
            <div className="w-px bg-border" />
            <button className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* More options */}
        <div className="mt-4 bg-card border border-border rounded-2xl overflow-hidden">
          {[
            { icon: Map, label: "Get directions", action: "Moscone Center, SF" },
            { icon: Bell, label: "Event reminders", action: "Set up" },
            { icon: Users, label: "Connect with attendees", action: "Networking" },
            { icon: MessageCircle, label: "Ask a question", action: "AI Assistant" },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 border-b border-border last:border-0 transition-colors text-left">
              <item.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.action}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [dark, setDark] = useState(true);
  const [role, setRole] = useState<Role>("attendee");
  const [user, setUser] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    // Extract token from URL if redirected from OAuth
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      // Clean up the URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Attempt to restore user session from JWT token on mount
    api.getMe()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          if (res.user.role) {
            const userRole = res.user.role.toLowerCase() as Role;
            setRole(userRole);
          }
        }
      })
      .catch((e) => {
        // Unauthenticated or offline
      });
  }, []);

  const showNav = view !== "landing" && view !== "auth";

  const handleSetView = (v: View) => {
    const roleFromView: Partial<Record<View, Role>> = {
      organizer: "organizer", "org-create": "organizer", "org-analytics": "organizer",
      volunteer: "volunteer", "vol-kanban": "volunteer", "vol-leaderboard": "volunteer",
      attendee: "attendee", "event-detail": "attendee", "my-ticket": "attendee",
    };
    if (roleFromView[v]) setRole(roleFromView[v] as Role);
    setView(v);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setSelectedEventId(null);
    setView("landing");
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {showNav && (
        <TopNav view={view} setView={handleSetView} dark={dark} setDark={setDark} role={role} setRole={setRole} user={user} onLogout={handleLogout} />
      )}

      {view === "landing" && <LandingPage setView={handleSetView} dark={dark} setDark={setDark} />}
      {view === "auth" && <AuthPage setView={handleSetView} onAuthSuccess={(u) => setUser(u)} />}
      {view === "organizer" && <OrganizerDashboard setView={handleSetView} />}
      {view === "org-create" && <EventCreationWizard setView={handleSetView} />}
      {view === "org-analytics" && <Analytics setView={handleSetView} />}
      {view === "volunteer" && <VolunteerDashboard setView={handleSetView} user={user} />}
      {view === "vol-kanban" && <KanbanBoard setView={handleSetView} />}
      {view === "vol-leaderboard" && <Leaderboard setView={handleSetView} />}
      {view === "attendee" && <AttendeeDiscovery setView={handleSetView} onSelectEvent={setSelectedEventId} />}
      {view === "event-detail" && <EventDetail setView={handleSetView} eventId={selectedEventId} />}
      {view === "my-ticket" && <MyTicket setView={handleSetView} eventId={selectedEventId} user={user} />}
    </div>
  );
}
