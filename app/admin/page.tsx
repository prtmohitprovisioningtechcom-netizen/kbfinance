"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, FileText, Activity, Settings,
  ChevronRight, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminPage() {
  const { data: session } = useSession();
  
  const [stats, setStats] = useState({ totalCustomers: 0, pendingApps: 0, newEnquiries: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetch('/api/admin/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.stats) setStats(data.stats);
          if (data.activity) setRecentActivity(data.activity);
          setIsLoadingData(false);
        })
        .catch(err => {
          console.error("Failed to fetch admin data", err);
          setIsLoadingData(false);
        });
    }
  }, [session]);

  return (
    <AdminLayout title="Overview">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-[#0A2540]">Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
        <p className="text-gray-500 mt-2">Here is what's happening with your platform today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Customers", value: isLoadingData ? "..." : stats.totalCustomers, change: "Real-time", trend: "up", icon: <Users className="w-6 h-6 text-blue-500" />, bgColor: "bg-blue-500/10" },
          { title: "Pending Apps", value: isLoadingData ? "..." : stats.pendingApps, change: "Needs review", trend: "down", icon: <FileText className="w-6 h-6 text-amber-500" />, bgColor: "bg-amber-500/10" },
          { title: "New Enquiries", value: isLoadingData ? "..." : stats.newEnquiries, change: "Real-time", trend: "up", icon: <Activity className="w-6 h-6 text-emerald-500" />, bgColor: "bg-emerald-500/10" },
          { title: "System Status", value: "Online", change: "99.9%", trend: "up", icon: <CheckCircle2 className="w-6 h-6 text-purple-500" />, bgColor: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[#0A2540] mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-[#0A2540]">Recent Activity Stream</h3>
            <Button variant="ghost" className="text-sm text-[#1952B3] hover:bg-[#1952B3]/10 rounded-full">View All</Button>
          </div>
          <div className="p-6">
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
              {isLoadingData ? (
                <div className="text-gray-400 pl-4 py-2 animate-pulse">Loading activity...</div>
              ) : recentActivity.length === 0 ? (
                <div className="text-gray-400 pl-4 py-2">No recent activity found.</div>
              ) : recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative pl-8">
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#1952B3] shadow-sm"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                    <span className="font-bold text-[#0A2540]">{activity.user}</span>
                    <span className="flex items-center text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full w-fit">
                      <Clock className="w-3 h-3 mr-1" /> {new Date(activity.time).toLocaleDateString()} {new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{activity.action}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-[#0A2540] to-[#1952B3] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-lg font-bold mb-2">Need to review apps?</h3>
            <p className="text-blue-200 text-sm mb-6">You have {isLoadingData ? '...' : stats.pendingApps} pending applications waiting for your approval.</p>
            <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B2E] text-[#0A2540] font-bold rounded-xl shadow-md border-none">
              Review Applications
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#0A2540] mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-sm font-medium text-gray-700">
                <span className="flex items-center"><Users className="w-4 h-4 mr-3 text-blue-500" /> Manage Users</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-sm font-medium text-gray-700">
                <span className="flex items-center"><Activity className="w-4 h-4 mr-3 text-emerald-500" /> View Analytics</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-sm font-medium text-gray-700">
                <span className="flex items-center"><Settings className="w-4 h-4 mr-3 text-gray-500" /> System Settings</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
