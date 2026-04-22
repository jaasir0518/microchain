"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    isVerified: false,
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      
      const data = await res.json();
      setFormData(data);
      setOriginalData({ name: data.name, phone: data.phone });
    } catch (error) {
      console.error("Failed to fetch settings", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear message when user starts typing
    if (message) setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setMessage({ type: "success", text: "Settings updated successfully!" });
      setOriginalData({ name: formData.name, phone: formData.phone });
      
      // Refresh session to update name in navbar
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.phone !== originalData.phone
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-zinc-400">Manage your account information and preferences</p>
      </div>

      {/* Alert Messages */}
      {message && (
        <Alert 
          className={`mb-6 ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Settings Card */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="bg-white/5 border-white/10 focus:border-emerald-500/50 text-white"
            />
            <p className="text-xs text-zinc-500">
              This name will be visible to other circle members
            </p>
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-white/5 border-white/10 text-zinc-400 cursor-not-allowed"
              />
              <Badge 
                variant="outline" 
                className="absolute right-3 top-1/2 -translate-y-1/2 border-zinc-600 text-zinc-400"
              >
                Cannot be changed
              </Badge>
            </div>
            <p className="text-xs text-zinc-500">
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-400" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className="bg-white/5 border-white/10 focus:border-emerald-500/50 text-white"
            />
            <p className="text-xs text-zinc-500">
              Optional: Used for important notifications
            </p>
          </div>

          {/* Verification Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-400" />
              Account Status
            </Label>
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <Badge 
                variant={formData.isVerified ? "default" : "secondary"}
                className={
                  formData.isVerified 
                    ? "bg-emerald-500 text-black" 
                    : "bg-zinc-700 text-zinc-300"
                }
              >
                {formData.isVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  "Unverified"
                )}
              </Badge>
              <p className="text-sm text-zinc-400">
                {formData.isVerified 
                  ? "Your account is verified" 
                  : "Complete your profile to get verified"}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            {!hasChanges() && !saving && (
              <p className="text-xs text-center text-zinc-500 mt-2">
                No changes to save
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="mt-6 bg-cyan-500/5 border-cyan-500/20 text-white">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-cyan-400">Privacy & Security</h3>
              <p className="text-sm text-zinc-400">
                Your personal information is encrypted and stored securely. 
                We use industry-standard security measures to protect your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
