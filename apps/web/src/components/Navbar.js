'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
export default function Navbar() {
  const pathname = usePathname();

  const getLinkClasses = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    
    const baseClasses = "px-4 py-2 font-arcade text-xs tracking-wider transition-colors";
    const activeClasses = "text-[#e0e2ff] bg-[#6366f1]/20 border-2 border-[#6366f1] shadow-[3px_3px_0px_#000] hover:bg-[#6366f1] hover:text-white";
    const inactiveClasses = "text-slate-400 border-2 border-transparent hover:border-slate-700 hover:text-white";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md" data-purpose="primary-header">
=======
    <header className="sticky top-0 z-50 bg-[#080914] border-b-4 border-[#181a30]" data-purpose="primary-header">
>>>>>>> c16129e775cdfee4272f7f06af44c3c09b38f247
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-8 xl:px-12 h-24 flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <Link aria-label="PRISON Home" className="flex items-center gap-4 group cursor-pointer" href="/">
          <div className="w-12 h-12 bg-[#6366f1] flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_#4338ca] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <span className="font-arcade text-white font-extrabold text-sm tracking-tighter">PR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-arcade text-white text-xl tracking-widest flex items-center gap-1 group-hover:text-[#a5b4fc] transition-colors">
              PRISON
            </span>
            <span className="font-silk text-[10px] text-[#a5b4fc] tracking-widest font-semibold uppercase mt-0.5">
              SECURITY NETWORK
            </span>
          </div>
        </Link>
        
        {/* NAVIGATION LINKS */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
          <Link className={getLinkClasses('/')} href="/#overview">
            OVERVIEW
          </Link>
          <Link className={getLinkClasses('/sandbox')} href="/sandbox">
            SANDBOX
          </Link>
          <Link className={getLinkClasses('/registry')} href="/registry">
            THREAT REGISTRY
          </Link>
          <Link className={getLinkClasses('/docs')} href="/docs">
            DOCS
          </Link>
        </nav>
        
        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-5 xl:gap-8">
          <div className="hidden xl:flex items-center gap-2.5 font-silk text-sm text-slate-400 bg-black/60 px-4 py-2 border border-slate-800">
            <span className="w-3 h-3 bg-[#6366f1] inline-block border border-black animate-pulse"></span>
            <span className="text-slate-300">All Systems Online</span>
          </div>
          
          <Show when="signed-out">
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="font-arcade text-xs text-slate-300 hover:text-white transition-colors">LOGIN</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="pixel-btn bg-[#6366f1] text-white font-arcade text-xs px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#312e81] hover:bg-[#4f46e5] transition-all">SIGN UP</button>
              </SignUpButton>
            </div>
          </Show>
          
          <Show when="signed-in">
            <Link href="/sandbox" className="pixel-btn bg-[#6366f1] text-white font-arcade text-xs sm:text-sm px-6 py-3 sm:px-8 sm:py-4 border-2 border-black shadow-[4px_4px_0px_#312e81] hover:bg-[#4f46e5] transition-all flex items-center gap-2.5">
              <span className="text-[#fde047] font-bold text-base">⚡</span>
              <span className="">DETONATE PR</span>
            </Link>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-[#6366f1] rounded-none shadow-[2px_2px_0px_#000]" } }} />
          </Show>
        </div>
        
      </div>
    </header>
  );
}
