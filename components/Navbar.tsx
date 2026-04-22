"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fingerprint, LayoutDashboard, Users, UserCircle2, Settings, LogOut, LogIn, Bell, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Circles", href: "/circles", icon: Users },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-black group-hover:scale-105 transition-transform">
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-white">Trust<span className="text-emerald-400">Circles</span></span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                      ? "bg-white/10 text-emerald-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          {session && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden text-white hover:bg-white/10 p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-zinc-950 border-white/10">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-black">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white">TrustCircles</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.name}
                      </Link>
                    );
                  })}
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <UserCircle2 className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/auth/login' });
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10 hidden lg:flex">
            How it works
          </Button>
          
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative text-zinc-400 hover:text-white hover:bg-white/10" />}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-black">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-zinc-950 border-white/10 text-white">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px]">
                        {unreadCount} new
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <DropdownMenuItem
                        key={notif._id}
                        className={`focus:bg-white/10 focus:text-white cursor-pointer flex-col items-start p-3 ${!notif.read ? "bg-emerald-500/5" : ""}`}
                        onClick={() => !notif.read && markAsRead(notif._id)}
                      >
                        <div className="flex items-start justify-between w-full mb-1">
                          <span className="font-medium text-sm">{notif.title}</span>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-zinc-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      No notifications yet
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <Link href="/notifications">
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-emerald-400 cursor-pointer justify-center">
                    View All Notifications
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {status === "loading" ? (
            <div className="h-10 w-24 bg-white/5 animate-pulse rounded-full" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full px-6" />}>
                <UserCircle2 className="w-4 h-4 mr-2" />
                {session.user?.name || "User"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-white/10 text-white">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <Link href="/profile">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer w-full h-full">
                      <UserCircle2 className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer w-full h-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-400"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full px-6">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
