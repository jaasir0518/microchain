"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CirclesPage() {
  const router = useRouter();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    maxLoanAmount: "",
    inviteEmails: ""
  });

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const res = await fetch("/api/circles");
      if (res.ok) {
        const data = await res.json();
        setCircles(data.circles || []);
      }
    } catch (error) {
      console.error("Failed to fetch circles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!formData.name.trim() || !formData.maxLoanAmount) {
      alert("Please fill in circle name and max loan amount");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          maxMembers: 20,
          initialPoolBalance: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Circle created:', data);
        setIsCreateDialogOpen(false);
        setIsCardDialogOpen(false);
        setFormData({ name: "", maxLoanAmount: "", inviteEmails: "" });
        await fetchCircles();
        // Use the circle ID from the response
        if (data.circle && data.circle.id) {
          router.push(`/circles/${data.circle.id}`);
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create circle");
      }
    } catch (error) {
      console.error("Error creating circle:", error);
      alert("Failed to create circle");
    } finally {
      setIsCreating(false);
    }
  };

  const displayCircles = circles;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-white">Loading circles...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Trust Circles</h1>
          <p className="text-zinc-400">Manage your private lending groups and view circle health.</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="border-white/10 text-white hover:bg-white/5" />}>
              <Users className="w-4 h-4 mr-2" />
              Join Circle
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Join a Trust Circle</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Enter the invite code shared by a circle admin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-code" className="text-white">Invite Code</Label>
                  <Input 
                    id="invite-code" 
                    placeholder="Enter 8-character code" 
                    className="bg-white/5 border-white/10 text-white font-mono text-lg uppercase"
                    maxLength={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-black w-full"
                  onClick={async () => {
                    const input = document.getElementById('invite-code') as HTMLInputElement;
                    const code = input?.value?.trim().toUpperCase();
                    if (!code || code.length !== 8) {
                      alert('Please enter a valid 8-character invite code');
                      return;
                    }
                    try {
                      const res = await fetch('/api/circles/join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inviteCode: code }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert(`Successfully joined ${data.circle.name}!`);
                        fetchCircles();
                        router.push(`/circles/${data.circle.id}`);
                      } else {
                        alert(data.error || 'Failed to join circle');
                      }
                    } catch (error) {
                      alert('Failed to join circle');
                    }
                  }}
                >
                  Join Circle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600 text-black" />}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Circle
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create Trust Circle</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Create a new private lending group and invite members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white">Circle Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. College Buddies" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxLoan" className="text-white">Max Loan Amount (₹)</Label>
                <Input 
                  id="maxLoan" 
                  type="number" 
                  placeholder="e.g. 5000" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.maxLoanAmount}
                  onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="members" className="text-white">Invite Members (Emails)</Label>
                <Input 
                  id="members" 
                  placeholder="comma separated emails" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.inviteEmails}
                  onChange={(e) => setFormData({ ...formData, inviteEmails: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600 text-black w-full"
                onClick={handleCreateCircle}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Circle"}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCircles.map((circle, index) => (
          <Card key={circle._id || circle.id || `circle-${index}`} className="bg-white/5 border-white/10 text-white hover:bg-white/[0.07] transition-all cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{circle.name}</CardTitle>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                  {circle.role}
                </Badge>
              </div>
              <CardDescription className="text-zinc-400 flex items-center gap-2 mt-2">
                <Users className="w-4 h-4" /> {circle.members} Members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={`avatar-${circle._id || circle.id}-${i}`} className="border-2 border-zinc-900 w-10 h-10">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${circle._id || circle.id}${i}`} />
                    <AvatarFallback className="bg-zinc-800 text-xs">U{i}</AvatarFallback>
                  </Avatar>
                ))}
                {circle.members > 4 && (
                  <div className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-medium z-10">
                    +{circle.members - 4}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Pool Capital</span>
                  <span className="font-semibold">{circle.totalCapital}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Active Loans</span>
                  <span className="font-semibold text-amber-400">{circle.activeLoans} pending</span>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 flex items-center">
                      <ShieldAlert className="w-4 h-4 mr-1" /> Circle Health
                    </span>
                    <span className="text-emerald-400 font-semibold">{circle.healthScore}%</span>
                  </div>
                  <Progress value={circle.healthScore} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-track]]:bg-white/10" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Link href={`/circles/${circle._id || circle.id}`} className="w-full block">
                <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/10">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {/* Create New Circle Card */}
        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
          <DialogTrigger nativeButton={false} render={<Card className="bg-transparent border-dashed border-2 border-white/20 text-white hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[350px]" />}>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start a new Circle</h3>
            <p className="text-sm text-zinc-400 text-center max-w-[200px]">
              Invite friends, set lending rules, and build trust together.
            </p>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create Trust Circle</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Create a new private lending group and invite members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="card-name" className="text-white">Circle Name</Label>
                <Input 
                  id="card-name" 
                  placeholder="e.g. College Buddies" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-maxLoan" className="text-white">Max Loan Amount (₹)</Label>
                <Input 
                  id="card-maxLoan" 
                  type="number" 
                  placeholder="e.g. 5000" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.maxLoanAmount}
                  onChange={(e) => setFormData({ ...formData, maxLoanAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-members" className="text-white">Invite Members (Emails)</Label>
                <Input 
                  id="card-members" 
                  placeholder="comma separated emails" 
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.inviteEmails}
                  onChange={(e) => setFormData({ ...formData, inviteEmails: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-600 text-black w-full"
                onClick={handleCreateCircle}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Circle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
