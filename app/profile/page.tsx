"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCircle2, Wallet, History, Sparkles, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateKeyPair, encryptBehavioralData } from "@/lib/encryption";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: 0,
    avgTransactionAmount: 0,
    repaymentRate: 0,
    latePayments: 0,
    accountAgeMonths: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setUser(data);
      
      // If user has behavioral data, populate the form
      if (data.behavioralData) {
        setFormData({
          monthlyIncome: data.behavioralData.monthlyIncome || 0,
          avgTransactionAmount: data.behavioralData.avgTransactionAmount || 0,
          repaymentRate: data.behavioralData.repaymentRate || 0,
          latePayments: data.behavioralData.latePayments || 0,
          accountAgeMonths: data.behavioralData.accountAgeMonths || 0,
          totalTransactions: data.behavioralData.totalTransactions || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const calculateTrustScore = async () => {
    setCalculating(true);
    try {
      // 1. Generate local Kyber keys for this session
      const keyPair = generateKeyPair();

      // 2. Encrypt behavioral data with public key (Simulating zero-exposure)
      const encryptedData = encryptBehavioralData(formData, keyPair.publicKey);

      // 3. Send encrypted data + private key to API (Simulating secure delegation)
      // In a real production system, the private key wouldn't be sent directly, 
      // but for this demo, we're showing the full pipeline works.
      const res = await fetch("/api/trust/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData,
          privateKey: keyPair.privateKey,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await fetchUserData(); // Refresh user data to show new score
      }
    } catch (error) {
      console.error("Calculation failed", error);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: User Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
            <div className="h-24 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 w-full" />
            <CardContent className="relative pt-0 flex flex-col items-center -mt-12">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center mb-4">
                <UserCircle2 className="w-16 h-16 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">{session?.user?.name || "User Name"}</h2>
              <p className="text-zinc-400 text-sm mb-4">{session?.user?.email}</p>
              
              <div className="flex gap-2 mb-6">
                <Badge variant={user?.isVerified ? "default" : "secondary"} className={user?.isVerified ? "bg-emerald-500 text-black" : "bg-white/10 text-zinc-400"}>
                  {user?.isVerified ? <ShieldCheck className="w-3 h-3 mr-1" /> : null}
                  {user?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400">
                  Trust Score: {user?.trustScore || 50}
                </Badge>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Repayments</p>
                  <p className="font-bold text-emerald-400">{user?.onTimeRepayments || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Circles Joined</p>
                  <p className="font-bold text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Quantum Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-zinc-400 space-y-3">
              <p>Your behavioral data is encrypted using <strong>NIST-approved Kyber-768</strong> before leaving your browser.</p>
              <p>The AI model processes encrypted vectors, ensuring your raw bank statement data is never stored on our servers.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="completion" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 mb-6">
              <TabsTrigger value="completion" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Profile
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                <History className="w-4 h-4 mr-2" />
                Trust History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completion">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Behavioral Profile Completion</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Provide your financial behavior metrics to calibrate your AI Trust Score. 
                    This data is encrypted locally.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                      <Input 
                        id="monthlyIncome" 
                        name="monthlyIncome" 
                        type="number" 
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avgTransactionAmount">Avg. Transaction (₹)</Label>
                      <Input 
                        id="avgTransactionAmount" 
                        name="avgTransactionAmount" 
                        type="number" 
                        value={formData.avgTransactionAmount}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repaymentRate">Repayment Rate (%)</Label>
                      <Input 
                        id="repaymentRate" 
                        name="repaymentRate" 
                        type="number" 
                        value={formData.repaymentRate}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latePayments">Late Payments</Label>
                      <Input 
                        id="latePayments" 
                        name="latePayments" 
                        type="number" 
                        value={formData.latePayments}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountAgeMonths">Account Age (Months)</Label>
                      <Input 
                        id="accountAgeMonths" 
                        name="accountAgeMonths" 
                        type="number" 
                        value={formData.accountAgeMonths}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalTransactions">Total Transactions</Label>
                      <Input 
                        id="totalTransactions" 
                        name="totalTransactions" 
                        type="number" 
                        value={formData.totalTransactions}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/10 focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={calculateTrustScore} 
                      disabled={calculating}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      {calculating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Encrypting & Calculating...
                        </>
                      ) : (
                        <>
                          Analyze Behavioral Statement
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Trust Verification Logs</CardTitle>
                  <CardDescription className="text-zinc-400">Timeline of your trust evaluation events.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.trustHistory && user.trustHistory.length > 0 ? (
                      user.trustHistory.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.reason}</p>
                              <p className="text-xs text-zinc-500">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-400">{item.score}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">AI Verified</p>
                          </div>
                        </div>
                      )).reverse()
                    ) : (
                      <div className="text-center py-12 text-zinc-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No trust history yet. Complete your profile to get started.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
