"use client";

import Link from "next/link";
import { ArrowRight, HeartHandshake, Sparkles, ArrowUpRight, Target, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
      
      {/* Cool animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Ambient Premium Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
          className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-cyan-500/20 via-emerald-500/10 to-transparent blur-[120px]" 
        />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] border border-emerald-500/20">
              <Flag className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            </span>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Fairway Forward
            </span>
          </Link>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex"
        >
          <Link className="hover:text-emerald-400 transition-colors" href="/charities">Our Charities</Link>
          <Link className="hover:text-emerald-400 transition-colors" href="/how-it-works">Impact Engine</Link>
        </motion.nav>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium text-slate-300 hover:text-white transition-colors md:block">
            Sign In
          </Link>
          <Link
            href="/subscribe"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
          >
            Start Impact
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-20 pt-12 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-8 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]">
              <Target className="h-3.5 w-3.5" />
              Not your typical golf platform.
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-white selection:text-emerald-200">
              Score for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                something bigger.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-6 text-lg lg:text-xl leading-relaxed text-slate-400 max-w-xl">
              Log your last 5 Stableford scores. Drive a portion of your subscription directly to causes you care about. Win massive monthly prize pools.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/subscribe" className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-base font-bold text-slate-950 transition-all hover:opacity-90 hover:scale-105 shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)]">
                Join the Movement
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/charities" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-8 text-base font-medium text-white ring-1 ring-transparent transition-all hover:bg-slate-800 hover:border-slate-600 backdrop-blur-md">
                View Charities
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/60">
              <div>
                <div className="text-3xl font-bold text-white mb-1">10%</div>
                <div className="text-sm text-slate-500 font-medium">Minimum Charity Cut</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">Last 5</div>
                <div className="text-sm text-slate-500 font-medium">Scores Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-1">Monthly</div>
                <div className="text-sm text-slate-500 font-medium">Jackpot Draws</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 40 }}
            className="relative hidden lg:block"
          >
            {/* Glassmorphic Dashboard Preview */}
            <div className="relative z-10 rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl overflow-hidden group">
              {/* Cool inner glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-6 mb-6 relative z-10">
                <div>
                  <div className="text-white font-semibold text-lg flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-emerald-400" />
                    Your Impact Board
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]" />
                    Live Subscription Active
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_20px_-5px_rgba(52,211,153,0.5)]" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5 transition-colors hover:bg-slate-800/80 hover:border-emerald-500/30 cursor-pointer shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Children&apos;s Health Fund
                    </div>
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">15% Split</div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "68%" }} 
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 relative" 
                    >
                      <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 transform -translate-x-full group-hover:animate-[ping_1.5s_infinite]" />
                    </motion.div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5 hover:bg-slate-800/80 hover:border-cyan-500/30 transition-colors shadow-lg">
                    <div className="text-xs font-medium text-slate-400 mb-3 flex items-center justify-between">
                      Rolling Scores
                    </div>
                    <div className="flex gap-2">
                      {[38,34,41].map((s, i) => (
                        <div key={i} className="flex-1 rounded-lg bg-slate-900 py-3 text-center text-sm font-bold text-emerald-400 border border-slate-700/50 shadow-inner">
                          {s}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5 flex flex-col justify-center hover:bg-slate-800/80 transition-colors shadow-lg group/draw">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover/draw:bg-cyan-500/20 transition-colors" />
                    <div className="text-xs font-medium text-slate-400 mb-1 z-10">Next Draw</div>
                    <div className="text-2xl font-bold text-white z-10">Oct 1st</div>
                    <div className="text-xs font-medium text-cyan-400 mt-2 flex items-center gap-1 z-10 border-t border-slate-700/50 pt-2">
                      Est. Pool $2,450
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* High-tech orbital rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] rounded-full border border-emerald-500/20 border-dashed z-0 animate-[spin_60s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-cyan-500/10 rounded-full z-0 animate-[spin_40s_linear_infinite_reverse]" />
            
            {/* Glowing dots on rings */}
            <div className="absolute top-[8%] left-[80%] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse" />
            <div className="absolute bottom-[20%] left-[5%] w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
