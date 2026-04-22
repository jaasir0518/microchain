"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Wallet, TrendingUp, History, UserPlus, CheckCircle2, XCircle, Activity, ArrowUpRight, ArrowDownRight, Check, MessageSquare, Loader2, BarChart3, PieChart, TrendingDown } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export default function CircleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [circle, setCircle] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  
  // Voting state
  const [voteComment, setVoteComment] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);

  useEffect(() => {
    fetchCircleData();
    fetchAnalytics();
  }, [id]);

  const fetchCircleData = async () => {
    try {
      const res = await fetch(`/api/circles/${id}`);
      const data = await res.json();
      setCircle(data);
      setMembers(data.members || []);
      
      const loansRes = await fetch(`/api/loans?circleId=${id}`);
      const loansData = await loansRes.json();
      setLoans(loansData.loans || []);
    } catch (error) {
      console.error("Failed to fetch circle data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/circle/${id}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const handleContribute = async (amount: number) => {
    try {
      await fetch(`/api/circles/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      fetchCircleData();
      fetchAnalytics();
    } catch (error) {
      console.error("Failed to contribute", error);
    }
  };

  const handleVote = async (loanId: string, vote: "approve" | "reject") => {
    try {
      await fetch(`/api/loans/${loanId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote, comment: voteComment }),
      });
      setVoteComment("");
      setSelectedLoan(null);
      fetchCircleData();
    } catch (error) {
      console.error("Failed to vote", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const votingLoans = loans.filter(l => l.status === "voting");
  const activeLoans = loans.filter(l => l.status === "active");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/circles" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Circles
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">{circle?.name}</h1>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 h-6">
                Member
              </Badge>
            </div>
            <p className="text-zinc-400 max-w-2xl">{circle?.description}</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" className="border-white/10 text-white hover:bg-white/5" />}>
                <UserPlus className="w-4 h-4 mr-2" /> Invite Members
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Invite Members to Circle</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Share the invite code or send email invitations to add members.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-white">Invite Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={circle?.circle?.inviteCode || circle?.inviteCode || "Loading..."} 
                        readOnly 
                        className="bg-white/5 border-white/10 text-white font-mono text-lg"
                      />
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(circle?.circle?.inviteCode || circle?.inviteCode || "");
                          alert("Invite code copied!");
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500">Share this code with people you want to invite</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invite-emails" className="text-white">Or Send Email Invites</Label>
                    <Input 
                      id="invite-emails" 
                      placeholder="email1@example.com, email2@example.com" 
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-zinc-500">Comma-separated email addresses</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-black w-full">
                    Send Invitations
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger render={<Button variant="outline" className="border-white/10 text-white hover:bg-white/5" />}>
                <Wallet className="w-4 h-4 mr-2" /> Contribute
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Contribute to Pool</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Add funds to the circle pool and boost your trust score.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-white">Quick Amounts</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button onClick={() => handleContribute(500)} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        ₹500 <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px]">+2</Badge>
                      </Button>
                      <Button onClick={() => handleContribute(1000)} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        ₹1000 <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px]">+3</Badge>
                      </Button>
                      <Button onClick={() => handleContribute(2000)} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                        ₹2000 <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px]">+5</Badge>
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="custom-amount" className="text-white">Custom Amount (₹)</Label>
                    <Input id="custom-amount" type="number" placeholder="Enter amount" className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-black w-full">Contribute</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Pool Balance</p>
                <p className="text-3xl font-bold">₹{circle?.poolBalance?.toLocaleString() || 0}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Active Loans</p>
                <p className="text-3xl font-bold">{activeLoans.length}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <History className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Pending Votes</p>
                <p className="text-3xl font-bold">{votingLoans.length}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Members</p>
                <p className="text-3xl font-bold">{members.length}</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voting" className="w-full">
        <TabsList className="bg-white/5 border-white/10 mb-6 p-1">
          <TabsTrigger value="voting" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">
            Voting {votingLoans.length > 0 && <Badge className="ml-2 bg-purple-500/20 text-purple-400 text-[10px]">{votingLoans.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">Active Loans</TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">Members</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="voting">
          <div className="space-y-4">
            {votingLoans.length > 0 ? (
              votingLoans.map((loan) => (
                <Card key={loan._id} className="bg-white/5 border-white/10 text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${loan.borrower?.email}`} />
                          <AvatarFallback>{loan.borrower?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{loan.borrower?.name}</CardTitle>
                          <CardDescription className="text-zinc-400">{loan.purpose}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{loan.amount?.toLocaleString()}</p>
                        <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Trust: {loan.borrower?.trustScore}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Duration</span>
                        <span className="font-medium">{loan.duration} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Interest Rate</span>
                        <span className="font-medium">{loan.interestRate}%</span>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-emerald-400">{loan.votes?.approve || 0} Approve</span>
                          <span className="text-red-400">{loan.votes?.reject || 0} Reject</span>
                        </div>
                        <Progress 
                          value={((loan.votes?.approve || 0) / ((loan.votes?.approve || 0) + (loan.votes?.reject || 0) || 1)) * 100} 
                          className="h-2 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-track]]:bg-white/10" 
                        />
                      </div>

                      {loan.voteDetails && loan.voteDetails.length > 0 && (
                        <div className="pt-4 space-y-2">
                          <p className="text-sm text-zinc-400">Recent Votes:</p>
                          {loan.voteDetails.slice(0, 3).map((vote: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm bg-white/5 p-2 rounded">
                              <Badge className={`${vote.vote === 'approve' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-[10px]`}>
                                {vote.vote === 'approve' ? '✓' : '✗'}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-zinc-300">{vote.voter?.name}</p>
                                {vote.comment && <p className="text-zinc-500 text-xs mt-1">{vote.comment}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Dialog>
                          <DialogTrigger render={<Button className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50" />}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle>Approve Loan</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Add an optional comment with your vote.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="comment" className="text-white">Comment (Optional)</Label>
                                <Input 
                                  id="comment" 
                                  placeholder="Why are you approving this?" 
                                  className="bg-white/5 border-white/10 text-white"
                                  value={voteComment}
                                  onChange={(e) => setVoteComment(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => handleVote(loan._id, "approve")} 
                                className="bg-emerald-500 hover:bg-emerald-600 text-black w-full"
                              >
                                Submit Approval
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger render={<Button variant="outline" className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10" />}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle>Reject Loan</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Please provide a reason for rejection.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="reject-comment" className="text-white">Reason</Label>
                                <Input 
                                  id="reject-comment" 
                                  placeholder="Why are you rejecting this?" 
                                  className="bg-white/5 border-white/10 text-white"
                                  value={voteComment}
                                  onChange={(e) => setVoteComment(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => handleVote(loan._id, "reject")} 
                                className="bg-red-500 hover:bg-red-600 text-white w-full"
                              >
                                Submit Rejection
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardContent className="py-16 text-center">
                  <CheckCircle2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Pending Votes</h3>
                  <p className="text-zinc-400">All loan requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription className="text-zinc-400">Current outstanding loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Borrower</TableHead>
                      <TableHead className="text-zinc-400">Amount</TableHead>
                      <TableHead className="text-zinc-400">Repaid</TableHead>
                      <TableHead className="text-zinc-400">Due Date</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.map((loan) => (
                      <TableRow key={loan._id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">{loan.borrower?.name}</TableCell>
                        <TableCell>₹{loan.amount?.toLocaleString()}</TableCell>
                        <TableCell>₹{loan.repaidAmount?.toLocaleString() || 0}</TableCell>
                        <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription className="text-zinc-400">Circle members and their contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Member</TableHead>
                      <TableHead className="text-zinc-400">Trust Score</TableHead>
                      <TableHead className="text-zinc-400">Total Contributed</TableHead>
                      <TableHead className="text-zinc-400">Active Loans</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => (
                      <TableRow key={member._id?.toString() || member.user?._id?.toString() || `member-${index}`} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://i.pravatar.cc/150?u=${member.user?.email}`} />
                              <AvatarFallback>{member.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            {member.user?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {member.user?.trustScore}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{member.totalContributed?.toLocaleString() || 0}</TableCell>
                        <TableCell>{member.activeLoans || 0}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Pool Balance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.poolBalanceTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#666" tick={{fill: '#888'}} />
                      <YAxis stroke="#666" tick={{fill: '#888'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                        itemStyle={{ color: '#34d399' }}
                      />
                      <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Member Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.memberRankings?.slice(0, 5).map((member: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center">
                          #{i + 1}
                        </Badge>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">₹{member.totalContributed?.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Trust: {member.trustScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-white md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Loan Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Total Loans</p>
                    <p className="text-2xl font-bold">{analytics?.loanStats?.totalLoans || 0}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-emerald-400">{analytics?.loanStats?.approvedLoans || 0}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Repayment Rate</p>
                    <p className="text-2xl font-bold text-cyan-400">{analytics?.loanStats?.repaymentRate || 0}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Avg Amount</p>
                    <p className="text-2xl font-bold">₹{analytics?.loanStats?.avgLoanAmount?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
