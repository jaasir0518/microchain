"use client";

import { use, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, ShieldAlert, Wallet, TrendingUp, History, UserPlus, CheckCircle2, XCircle, ChevronRight, Activity, ArrowUpRight, ArrowDownRight, Check } from "lucide-react";
import Link from "next/link";

export default function CircleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Interactive state for the specific circle
  const [circle, setCircle] = useState({
    id: id,
    name: id === "1" ? "College Buddies" : "Office Lunch Fund",
    description: "A private lending circle for immediate friends to cover short-term expenses with collective trust.",
    createdAt: "Oct 12, 2025",
    members: 8,
    totalCapital: 24000,
    availableCapital: 16500,
    activeLoans: 3,
    healthScore: 92,
    role: "Admin",
    rules: {
      maxLoanAmount: 5000,
      interestRate: 2.5, // % per month
      maxDuration: 60, // days
    }
  });

  const [membersList, setMembersList] = useState([
    { id: "m1", name: "Alex Kumar", role: "Admin", trustScore: 98, contributed: 5000, activeLoan: 0, status: "Healthy" },
    { id: "m2", name: "Priya Sharma", role: "Member", trustScore: 94, contributed: 3000, activeLoan: 2500, status: "On Track" },
    { id: "m3", name: "Rahul Verma", role: "Member", trustScore: 88, contributed: 4000, activeLoan: 0, status: "Healthy" },
    { id: "m4", name: "Neha Singh", role: "Member", trustScore: 76, contributed: 2000, activeLoan: 5000, status: "Warning" },
    { id: "m5", name: "Vikram Das", role: "Member", trustScore: 91, contributed: 3000, activeLoan: 0, status: "Healthy" },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: "a1", type: "repayment", user: "Priya Sharma", amount: 500, date: "2 hours ago" },
    { id: "a2", type: "loan_approved", user: "Neha Singh", amount: 5000, date: "1 day ago" },
    { id: "a3", type: "contribution", user: "Rahul Verma", amount: 1000, date: "3 days ago" },
    { id: "a4", type: "repayment", user: "Alex Kumar", amount: 2000, date: "1 week ago" },
  ]);

  const [loanProposals, setLoanProposals] = useState([
    { id: "p1", user: "Vikram Das", purpose: "Medical Emergency", amount: 4000, duration: "30 days", votes: { yes: 4, no: 0, required: 5 }, status: "Pending", userVoted: false },
  ]);

  const [activeLoansList, setActiveLoansList] = useState([
    { id: "al1", user: "Priya Sharma", amount: 2500, paid: 1500, dueDate: "Nov 15, 2025", isLate: false },
    { id: "al2", user: "Neha Singh", amount: 5000, paid: 0, dueDate: "Oct 28, 2025", isLate: true },
  ]);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanDuration, setLoanDuration] = useState("");

  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || !loanPurpose || !loanDuration) return;
    const numAmount = parseInt(loanAmount);
    if (numAmount > circle.rules.maxLoanAmount || numAmount > circle.availableCapital) {
      alert("Amount exceeds maximum allowed or available capital!");
      return;
    }

    const newProposal = {
      id: `p${Date.now()}`,
      user: "You",
      purpose: loanPurpose,
      amount: numAmount,
      duration: `${loanDuration} days`,
      votes: { yes: 1, no: 0, required: 5 },
      status: "Pending",
      userVoted: true,
    };

    setLoanProposals([newProposal, ...loanProposals]);
    setRecentActivity([{ id: `a${Date.now()}`, type: "loan_proposed", user: "You", amount: numAmount, date: "Just now" }, ...recentActivity]);
    
    setIsDialogOpen(false);
    setLoanAmount("");
    setLoanPurpose("");
    setLoanDuration("");
  };

  const handleApproveProposal = (proposalId: string) => {
    let proposalApproved = false;
    let approvedProposalData: any = null;

    setLoanProposals(loanProposals.map(p => {
      if (p.id === proposalId) {
        if (p.userVoted) return p;
        const newYes = p.votes.yes + 1;
        if (newYes >= p.votes.required) {
          proposalApproved = true;
          approvedProposalData = { ...p, votes: { ...p.votes, yes: newYes } };
          return null; // Will safely filter out below
        }
        return { ...p, votes: { ...p.votes, yes: newYes }, userVoted: true };
      }
      return p;
    }).filter(Boolean) as any);

    if (proposalApproved && approvedProposalData) {
      const newLoan = {
        id: `al${Date.now()}`,
        user: approvedProposalData.user,
        amount: approvedProposalData.amount,
        paid: 0,
        dueDate: "Next Month",
        isLate: false
      };
      
      setActiveLoansList([newLoan, ...activeLoansList]);
      setCircle(prev => ({
        ...prev,
        availableCapital: prev.availableCapital - approvedProposalData.amount,
        activeLoans: prev.activeLoans + 1
      }));
      setRecentActivity([{ id: `a${Date.now()}`, type: "loan_approved", user: approvedProposalData.user, amount: approvedProposalData.amount, date: "Just now" }, ...recentActivity]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation & Header */}
      <div className="mb-8">
        <Link href="/circles" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Circles
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">{circle.name}</h1>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 h-6">
                {circle.role}
              </Badge>
            </div>
            <p className="text-zinc-400 max-w-2xl">{circle.description}</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 w-full md:w-auto" onClick={() => {
              setRecentActivity([{ id: `a${Date.now()}`, type: "invite_sent", user: "New Member", amount: 0, date: "Just now" }, ...recentActivity]);
              alert("Invite link copied to clipboard!");
            }}>
              <UserPlus className="w-4 h-4 mr-2" /> Invite
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger render={<Button className="bg-emerald-500 hover:bg-emerald-600 text-black w-full md:w-auto" />}>
                Request Loan
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Request a Loan</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Submit a loan proposal to the circle. Members will vote on your request.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestLoan}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount" className="text-white">Amount (₹) - Max ₹{Math.min(circle.rules.maxLoanAmount, circle.availableCapital)}</Label>
                      <Input id="amount" type="number" required placeholder="5000" className="bg-white/5 border-white/10 text-white" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purpose" className="text-white">Purpose</Label>
                      <Input id="purpose" required placeholder="e.g. Medical emergency" className="bg-white/5 border-white/10 text-white" value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration" className="text-white">Duration (Days)</Label>
                      <Input id="duration" type="number" required placeholder="30" className="bg-white/5 border-white/10 text-white" value={loanDuration} onChange={e => setLoanDuration(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-black w-full">Submit Proposal</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10 text-white transition-all hover:bg-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Pool Health</p>
                <p className="text-3xl font-bold text-emerald-400">{circle.healthScore}%</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <Progress value={circle.healthScore} className="h-1 mt-4 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-track]]:bg-white/10" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10 text-white transition-all hover:bg-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Total Capital</p>
                <p className="text-3xl font-bold">₹{circle.totalCapital.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">₹{circle.availableCapital.toLocaleString()} available</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white transition-all hover:bg-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Active Loans</p>
                <p className="text-3xl font-bold">{circle.activeLoans}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <History className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">₹{(circle.totalCapital - circle.availableCapital).toLocaleString()} currently lent</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white transition-all hover:bg-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Members</p>
                <p className="text-3xl font-bold">{circle.members}</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">All members verified</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border-white/10 mb-6 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all">Overview</TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all">Members</TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all">Loans & Proposals</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400 transition-all">Rules & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="md:col-span-2 space-y-6">
              
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Proposals</CardTitle>
                  <CardDescription className="text-zinc-400">Loan requests requiring circle approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanProposals.length === 0 ? (
                     <div className="text-center py-6 text-zinc-500">No pending proposals at the moment.</div>
                  ) : loanProposals.map(proposal => (
                    <div key={proposal.id} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 transition-all hover:border-white/10">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${proposal.user}`} />
                          <AvatarFallback>{proposal.user[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{proposal.user}</p>
                          <p className="text-sm text-zinc-400">{proposal.purpose}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-lg">₹{proposal.amount}</p>
                        <p className="text-sm text-zinc-400">{proposal.duration}</p>
                      </div>
                      <div className="w-full sm:w-auto">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-400">{proposal.votes.yes} Yes</span>
                          <span className="text-zinc-500">Need {proposal.votes.required}</span>
                        </div>
                        <Progress value={(proposal.votes.yes / proposal.votes.required) * 100} className="h-1.5 w-full sm:w-24 mb-3 [&_[data-slot=progress-indicator]]:bg-emerald-500" />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveProposal(proposal.id)}
                            disabled={proposal.userVoted}
                            className={`flex-1 transition-all ${proposal.userVoted ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'}`}
                          >
                            {proposal.userVoted ? <Check className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />} 
                            {proposal.userVoted ? 'Voted' : 'Approve'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Capital Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-16 w-full rounded-full overflow-hidden bg-white/5 flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-black"
                      style={{ width: `${(circle.availableCapital / circle.totalCapital) * 100}%` }}
                    >
                      Available
                    </div>
                    <div 
                      className="bg-amber-500 h-full transition-all duration-1000 flex items-center justify-center text-xs font-bold text-black"
                      style={{ width: `${((circle.totalCapital - circle.availableCapital) / circle.totalCapital) * 100}%` }}
                    >
                      Lent Out
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-zinc-300">Available: ₹{circle.availableCapital.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-zinc-300">Lent Out: ₹{(circle.totalCapital - circle.availableCapital).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'repayment' ? 'bg-emerald-500/20 text-emerald-400' :
                        activity.type === 'loan_approved' ? 'bg-amber-500/20 text-amber-400' :
                        activity.type === 'loan_proposed' ? 'bg-indigo-500/20 text-indigo-400' :
                        activity.type === 'invite_sent' ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {activity.type === 'repayment' ? <ArrowDownRight className="w-4 h-4" /> :
                         activity.type === 'loan_approved' ? <ArrowUpRight className="w-4 h-4" /> :
                         activity.type === 'loan_proposed' ? <Activity className="w-4 h-4" /> :
                         activity.type === 'invite_sent' ? <UserPlus className="w-4 h-4" /> :
                         <Wallet className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-zinc-200">
                          <span className="font-medium">{activity.user}</span>
                          {activity.type === 'repayment' ? ' made a repayment of ' :
                           activity.type === 'loan_approved' ? ' was approved for ' :
                           activity.type === 'loan_proposed' ? ' requested a loan of ' :
                           activity.type === 'invite_sent' ? ' was invited to the circle.' :
                           ' contributed '}
                          {activity.amount > 0 && <span className="font-medium">₹{activity.amount}</span>}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-zinc-400 text-sm mt-2 hover:bg-white/5 hover:text-white">View all activity <ChevronRight className="w-4 h-4 ml-1"/></Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription className="text-zinc-400">Individuals in this trusted circle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Member</TableHead>
                      <TableHead className="text-zinc-400">Role</TableHead>
                      <TableHead className="text-zinc-400">Global Trust Score</TableHead>
                      <TableHead className="text-zinc-400 text-right">Contributed</TableHead>
                      <TableHead className="text-zinc-400 text-right">Active Loan</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersList.map((member) => (
                      <TableRow key={member.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 hover:scale-110 transition-transform">
                              <AvatarImage src={`https://i.pravatar.cc/150?u=${member.name}`} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {member.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-white/10 ${member.role === 'Admin' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-zinc-300'}`}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-400">{member.trustScore}</span>
                            <Progress value={member.trustScore} className="h-1.5 w-16 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-track]]:bg-white/5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₹{member.contributed.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{member.activeLoan > 0 ? `₹${member.activeLoan.toLocaleString()}` : '-'}</TableCell>
                        <TableCell>
                          <span className={`flex items-center text-sm ${member.status === 'Healthy' ? 'text-emerald-400' : member.status === 'Warning' ? 'text-red-400' : 'text-amber-400'}`}>
                            {member.status === 'Healthy' && <ShieldAlert className="w-3 h-3 mr-1 opacity-0" />}
                            {member.status === 'Warning' && <ShieldAlert className="w-3 h-3 mr-1" />}
                            {member.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription className="text-zinc-400">Current outstanding loans in the circle</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Borrower</TableHead>
                      <TableHead className="text-zinc-400">Amount</TableHead>
                      <TableHead className="text-zinc-400">Interest</TableHead>
                      <TableHead className="text-zinc-400">Due Date</TableHead>
                      <TableHead className="text-zinc-400 w-[200px]">Progress</TableHead>
                      <TableHead className="text-zinc-400 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoansList.map(loan => (
                      <TableRow key={loan.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">{loan.user}</TableCell>
                        <TableCell>₹{loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{circle.rules.interestRate}%</TableCell>
                        <TableCell>{loan.dueDate}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-400">
                              <span>₹{loan.paid.toLocaleString()} Paid</span>
                              {loan.isLate ? <span className="text-red-400">Overdue</span> : <span>{Math.round((loan.paid / loan.amount) * 100)}%</span>}
                            </div>
                            <Progress value={(loan.paid / loan.amount) * 100} className={`h-1.5 [&_[data-slot=progress-indicator]]:${loan.isLate ? 'bg-red-400' : 'bg-emerald-400'} [&_[data-slot=progress-track]]:bg-white/5`} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`border-${loan.isLate ? 'red' : 'emerald'}-500/30 text-${loan.isLate ? 'red' : 'emerald'}-400 bg-${loan.isLate ? 'red' : 'emerald'}-500/10`}>
                            {loan.isLate ? 'Late' : 'Active'}
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

        <TabsContent value="settings">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Circle Rules & Settings</CardTitle>
              <CardDescription className="text-zinc-400">Consensus-based parameters for this trust circle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-emerald-400 mb-4 uppercase tracking-wider">Lending Parameters</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Max Loan Amount</span>
                        <span className="font-mono font-medium">₹{circle.rules.maxLoanAmount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Default Interest Rate</span>
                        <span className="font-mono font-medium">{circle.rules.interestRate}% / month</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Max Duration</span>
                        <span className="font-mono font-medium">{circle.rules.maxDuration} Days</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Approval Required</span>
                        <span className="font-mono font-medium">Majority (51%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-emerald-400 mb-4 uppercase tracking-wider">Trust Requirements</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Min Global Trust Score to Join</span>
                        <span className="font-mono font-medium">60</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                        <span className="text-zinc-300">Penalty for Late Payment</span>
                        <span className="font-mono font-medium">-15 Trust Points</span>
                      </div>
                    </div>
                  </div>
                  
                  {circle.role === 'Admin' && (
                    <div className="pt-4">
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hidden md:flex items-center justify-center transition-all bg-white/5">
                        Propose Rule Change
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
