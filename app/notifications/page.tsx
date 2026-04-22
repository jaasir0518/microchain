"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Loader2, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filter === "unread" ? "/api/notifications?unreadOnly=true" : "/api/notifications";
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
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

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => 
        fetch(`/api/notifications`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        })
      ));
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?notificationId=${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: any = {
      loan_request: "💰",
      loan_approved: "✅",
      loan_rejected: "❌",
      loan_repaid: "💵",
      vote_required: "🗳️",
      contribution_received: "🎉",
      circle_joined: "👥",
      trust_score_updated: "📊",
      reminder: "⏰",
    };
    return iconMap[type] || "🔔";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-emerald-400" />
            Notifications
          </h1>
          <p className="text-zinc-400">Stay updated with your Trust Circles activity.</p>
        </div>
        <Button
          onClick={markAllAsRead}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5"
          disabled={notifications.filter(n => !n.read).length === 0}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
            Unread
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Card
                key={notif._id}
                className={`bg-white/5 border-white/10 text-white hover:bg-white/[0.07] transition-all ${
                  !notif.read ? "border-l-4 border-l-emerald-500" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          {notif.title}
                          {!notif.read && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                              NEW
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-zinc-400 mt-2">{notif.message}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          {new Date(notif.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notif.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notif._id)}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notif._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="py-16 text-center">
                <Bell className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                <p className="text-zinc-400">
                  {filter === "unread" ? "You're all caught up!" : "You'll see notifications here when you have activity."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
