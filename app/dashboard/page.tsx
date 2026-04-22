"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, ShieldCheck, Clock, ShieldAlert, Sparkles, Loader2, Vote, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toast-utils";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votingLoans, setVotingLoans] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [loanReason, setLoanReason] = useState<string>("");
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [availableLoans, setAvailableLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchVotingLoans();
    fetchAnalytics();
    fetchCircles();
    fetchAvailableLoans();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingLoans = async () => {
    try {
      const res = await fetch("/api/loans?status=voting");
      const data = await res.json();
      setVotingLoans(data.loans || []);
    } catch (error) {
      console.error("Failed to fetch voting loans", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics/personal");
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const fetchCircles = async () => {
    try {
      const res = await fetch("/api/circles");
      const data = await res.json();
      setCircles(data.circles || []);
    } catch (error) {
      console.error("Failed to fetch circles", error);
    }
  };

  const fetchAvailableLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await fetch("/api/loans/available");
      const data = await res.json();
      setAvailableLoans(data.loans || []);
    } catch (error) {
      console.error("Failed to fetch available loans", error);
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleLoanRequest = async () => {
    if (!selectedCircle || !loanAmount) {
      showErrorToast("Missing Information", "Please select a circle and enter an amount");
      return;
    }

    const amount = parseFloat(loanAmount);
    if (amount < 500 || amount > 8000) {
      showErrorToast("Invalid Amount", "Loan amount must be between ₹500 and ₹8,000");
      return;
    }

    const toastId = showLoadingToast("Submitting loan request...");
    setIsSubmittingLoan(true);
    
    try {
      const res = await fetch("/api/loans/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circleId: selectedCircle,
          amount,
          purpose: loanReason || "Personal use",
          durationDays: 30,
        }),
      });

      const data = await res.json();
      toast.dismiss(toastId);
      
      if (res.ok) {
        showSuccessToast("Loan Request Submitted!", data.message || "Your request is now pending approval from circle members.");
        setSelectedCircle("");
        setLoanAmount("");
        setLoanReason("");
        fetchUserData();
        fetchVotingLoans();
      } else {
        showErrorToast("Request Failed", data.error || "Unable to submit loan request. Please try again.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error submitting loan request:", error);
      showErrorToast("Network Error", "Unable to connect. Please check your internet connection.");
    } finally {
      setIsSubmittingLoan(false);
    }
  };

  const getChartData = () => {
    if (!user?.trustHistory || user.trustHistory.length === 0) {
      return [
        { name: 'Start', score: 50 },
      ];
    }
    return user.trustHistory.map((h: any) => ({
      name: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: h.score,
    }));
  };

  const currentScore = user?.trustScore || 50;
  const isProfileIncomplete = !user?.lastStatementUploadedAt;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isProfileIncomplete && (
        <Alert className="mb-8 bg-emerald-500/10 border-emerald-500/50 text-emerald-400">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Boost your Trust Score!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>Complete your behavioral profile to get a verified trust score and higher lending limits.</span>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-8">
              <Link href="/profile">Complete Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || "User"}
          </h1>
          <p className="text-sm md:text-base text-zinc-400">Here&apos;s what&apos;s happening with your Trust Circles today.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="border-white/10 text-white hover:bg-white/5 flex-1 md:flex-none" />}>
              <ArrowDownRight className="w-4 h-4 mr-2 text-red-400" />
              <span className="hidden sm:inline">Request Loan</span>
              <span className="sm:hidden">Request</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Request Loan</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Request a micro-loan from one of your Trust Circles.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="circle" className="text-white">Trust Circle</Label>
                  <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select a circle" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10 text-white">
                      {circles.length === 0 ? (
                        <SelectItem value="none" disabled>No circles available</SelectItem>
                      ) : (
                        circles.map((circle) => (
                          <SelectItem key={circle._id} value={circle._id}>
                            {circle.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Enter amount (e.g. 500)" 
                    className="bg-white/5 border-white/10 text-white"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    min="500"
                    max="8000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason" className="text-white">Reason (Optional)</Label>
                  <Input 
                    id="reason" 
                    placeholder="Why do you need this?" 
                    className="bg-white/5 border-white/10 text-white"
                    value={loanReason}
                    onChange={(e) => setLoanReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-black w-full"
                  onClick={handleLoanRequest}
                  disabled={isSubmittingLoan || circles.length === 0}
                >
                  {isSubmittingLoan ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600 text-black flex-1 md:flex-none" />}>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Lend Money</span>
              <span className="sm:hidden">Lend</span>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-[425px] bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lend Money</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Fulfill a loan request from your Trust Circles.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {loadingLoans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : availableLoans.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {availableLoans.map((loan) => (
                      <div 
                        key={loan._id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={async () => {
                          if (confirm(`Fund ${loan.borrower?.name || 'this user'} with ₹${loan.amount}?`)) {
                            try {
                              const res = await fetch(`/api/loans/${loan._id}/fund`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                              });
                              const data = await res.json();
                              if (res.ok) {
                                alert(data.message || 'Loan funded successfully!');
                                fetchAvailableLoans();
                                fetchUserData();
                              } else {
                                alert(data.error || 'Failed to fund loan');
                              }
                            } catch (error) {
                              console.error('Error funding loan:', error);
                              alert('Failed to fund loan');
                            }
                          }
                        }}
                      >
                        <div>
                          <h4 className="font-medium text-white mb-1">{loan.borrower?.name || 'Anonymous'}</h4>
                          <p className={`text-xs ${loan.borrower?.trustScore >= 700 ? 'text-emerald-400' : loan.borrower?.trustScore >= 600 ? 'text-amber-400' : 'text-red-400'}`}>
                            Trust Score: {loan.borrower?.trustScore || 'N/A'}
                          </p>
                          {loan.purpose && <p className="text-xs text-zinc-500 mt-1">{loan.purpose}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white mb-1">₹{loan.amount}</p>
                          <p className="text-xs text-zinc-400">{loan.circle?.name || 'Unknown Circle'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500">
                    <p className="text-sm">No loan requests available at the moment.</p>
                    <p className="text-xs mt-2">Check back later or join more circles.</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 w-full"
                  onClick={() => fetchAvailableLoans()}
                  disabled={loadingLoans}
                >
                  {loadingLoans ? 'Refreshing...' : 'Refresh Loans'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              AI Trust Score
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-4xl font-bold text-white">{currentScore}</div>
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] py-0 h-4 uppercase tracking-tighter">
                Quantum-Safe
              </Badge>
            </div>
            <Progress value={currentScore} max={100} className="h-2 mb-2 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-track]]:bg-white/10" />
            <p className={`text-xs ${currentScore > 90 ? 'text-emerald-400' : currentScore > 70 ? 'text-cyan-400' : 'text-zinc-400'}`}>
              {currentScore > 90 ? '🌟 Exceptional verified profile' : 
               currentScore > 70 ? '✅ High trust ranking' : 
               currentScore > 50 ? '📈 Trust is building' : 
               '⚠️ Complete profile to improve score'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              Total Borrowed
              <ArrowDownRight className="w-4 h-4 text-red-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">₹0</div>
            <div className="flex items-center text-xs text-zinc-400">
              <Clock className="w-3 h-3 mr-1" />
              No active borrowings
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              Total Lent
              <Wallet className="w-4 h-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">₹0</div>
            <div className="flex items-center text-xs text-emerald-400">
              <Activity className="w-3 h-3 mr-1" />
              Lend to start earning trust points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Requests Alert */}
      {votingLoans.length > 0 && (
        <Alert className="mb-8 bg-purple-500/10 border-purple-500/50 text-purple-400">
          <Vote className="h-4 w-4" />
          <AlertTitle>Voting Required!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>You have {votingLoans.length} loan request(s) waiting for your vote in your circles.</span>
            <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white font-bold h-8">
              <Link href="/circles">Review Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Chart Area */}
        <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
          <CardHeader>
            <CardTitle>Trust Score History</CardTitle>
            <CardDescription className="text-zinc-400">How your AI-evaluated trust has grown over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#18181b' }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-zinc-400">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {user?.trustHistory && user.trustHistory.length > 0 ? (
                user.trustHistory.slice(-4).reverse().map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.reason}</p>
                        <p className="text-xs text-zinc-400">System Verified</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+{item.score}</p>
                      <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-sm italic">No recent activity found.</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Your Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                  Trust Score Trend
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {(() => {
                    const trend = analytics.trustScoreTrend;
                    if (!trend || trend.length === 0) return '0';
                    if (trend.length === 1) return trend[0].score;
                    const firstScore = trend[0].score;
                    const lastScore = trend[trend.length - 1].score;
                    const change = lastScore - firstScore;
                    return `${change > 0 ? '+' : ''}${change}`;
                  })()}
                </div>
                <p className="text-xs text-zinc-400">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                  Total Circles
                  <Users className="w-4 h-4 text-cyan-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {analytics.totalCircles || 0}
                </div>
                <p className="text-xs text-zinc-400">Active memberships</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
                  Repayment Rate
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {analytics.repaymentRate || 100}%
                </div>
                <p className="text-xs text-zinc-400">On-time payments</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

