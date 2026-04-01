"use client";

import Link from "next/link";
import { ArrowRight, HeartHandshake, Trophy, Waves, ArrowUpRight, Sparkles } from "lucide-react";
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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0A0A0B] text-zinc-50 selection:bg-rose-500/30">
      {/* Ambient Premium Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-rose-500/20 via-fuchsia-500/10 to-transparent blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
          className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-violet-500/20 via-cyan-500/10 to-transparent blur-[120px]" 
        />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-fuchsia-500/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <HeartHandshake className="h-5 w-5 text-rose-300 group-hover:scale-110 transition-transform duration-300" />
            </span>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Fairway Forward
            </span>
          </Link>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex"
        >
          <Link className="hover:text-white transition-colors" href="/charities">Our Charities</Link>
          <Link className="hover:text-white transition-colors" href="/how-it-works">Impact Engine</Link>
        </motion.nav>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium text-zinc-300 hover:text-white transition-colors md:block">
            Sign In
          </Link>
          <Link
            href="/subscribe"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
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
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur-md mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Not your typical golf platform.
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-white selection:text-rose-200">
              Score for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-fuchsia-300 to-violet-300">
                something bigger.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="mt-6 text-lg lg:text-xl leading-relaxed text-zinc-400 max-w-xl">
              Log your last 5 Stableford scores. Drive a portion of your subscription directly to causes you care about. Win massive monthly prize pools.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/subscribe" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-8 text-base font-bold text-white transition-all hover:opacity-90 hover:scale-105 shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)]">
                Join the Movement
              </Link>
              <Link href="/charities" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-white ring-1 ring-transparent transition-all hover:bg-white/10 backdrop-blur-md">
                View Charities
                <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white mb-1">10%</div>
                <div className="text-sm text-zinc-500 font-medium">Minimum Charity Cut</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">Last 5</div>
                <div className="text-sm text-zinc-500 font-medium">Scores Tracked</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">Monthly</div>
                <div className="text-sm text-zinc-500 font-medium">Jackpot Draws</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
            className="relative hidden lg:block"
          >
            {/* Glassmorphic Dashboard Preview */}
            <div className="relative z-10 rounded-[2rem] border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                <div>
                  <div className="text-white font-semibold">Your Impact Board</div>
                  <div className="text-xs text-zinc-400 mt-1">Live Subscription Active</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-violet-500" />
              </div>
              
              <div className="space-y-4">
                <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-white/5 border border-white/5 p-5 transition-colors hover:bg-white/10 cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-medium text-white">Children's Health Fund</div>
                    <div className="text-xs font-bold text-rose-300">15% Split</div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "68%" }} 
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-rose-400 to-fuchsia-400" 
                    />
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-white/5 border border-white/5 p-5">
                    <div className="text-xs font-medium text-zinc-400 mb-2">Rolling Scores</div>
                    <div className="flex gap-2">
                      {[38,34,41].map((s, i) => (
                        <div key={i} className="flex-1 rounded-lg bg-zinc-800 py-2 text-center text-sm font-bold text-white border border-white/5">
                          {s}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl bg-white/5 border border-white/5 p-5 flex flex-col justify-center">
                    <div className="text-xs font-medium text-zinc-400 mb-1">Next Draw</div>
                    <div className="text-xl font-bold text-white">Oct 1st</div>
                    <div className="text-xs text-fuchsia-300 mt-1">Est. Pool $2,450</div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Decorative orbital rings behind the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full z-0 animate-[spin_40s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/[0.02] rounded-full z-0 animate-[spin_30s_linear_infinite_reverse]" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
