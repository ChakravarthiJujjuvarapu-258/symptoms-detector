import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, Loader2, Mail, Smartphone } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in \u2014 AI Symptoms Detector" },
      {
        name: "description",
        content:
          "Sign in to AI Symptoms Detector with Google, your email address or your mobile number to save and revisit your symptom assessments."
      },
      { property: "og:title", content: "Sign in \u2014 AI Symptoms Detector" },
      {
        property: "og:description",
        content: "Sign in with Google, email or mobile number to keep your assessment history."
      }
    ]
  }),
  component: AuthPage
});

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72)
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, { message: "Use international format, e.g. +14155550123" });

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.57Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.88c-1.03.7-2.36 1.11-3.9 1.11-3 0-5.54-2.02-6.45-4.74H1.7v2.98A11.99 11.99 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.55 14.7a7.2 7.2 0 0 1 0-4.6V7.12H1.7a12 12 0 0 0 0 10.56l3.85-2.98Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.29-3.29C17.71 1.2 15.1 0 12 0 7.35 0 3.33 2.67 1.7 6.56l3.85 2.98C6.46 6.82 9 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const expiresIn = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const codeExpired = otpSent && expiresIn === 0;

  useEffect(() => {
    if (!otpSent) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [otpSent]);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);


  const withBusy = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy("");
    }
  };

  const signInWithGoogle = () =>
    withBusy("google", async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/", replace: true });
    });

  const submitEmail = (e) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    return withBusy("email", async () => {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password
      });
      if (error) toast.error(error.message);
    });
  };

  const sendOtp = (e) => {
    e.preventDefault();
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    return withBusy("otp-send", async () => {
      const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data });
      if (error) {
        toast.error(error.message);
        return;
      }
      setOtpSent(true);
      toast.success("We sent a 6-digit code to your phone.");
    });
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length < 4) {
      toast.error("Enter the code you received");
      return;
    }
    return withBusy("otp-verify", async () => {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: code,
        type: "sms"
      });
      if (error) toast.error(error.message);
    });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-16">
      <div className="mb-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl clinical-gradient text-primary-foreground">
          <Activity className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Keep your assessments and history across devices.
        </p>
      </div>

      <Card className="rounded-3xl surface-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Welcome</CardTitle>
          <CardDescription>Choose how you'd like to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={signInWithGoogle}
            disabled={busy !== ""}
          >
            {busy === "google" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="email" className="rounded-lg">
                <Mail className="mr-1.5 size-4" aria-hidden="true" />
                Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-lg">
                <Smartphone className="mr-1.5 size-4" aria-hidden="true" />
                Mobile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <form className="space-y-3" onSubmit={submitEmail}>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-email">Email address</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={busy !== ""}>
                  {busy === "email" && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  {mode === "signup" ? "Create account" : "Sign in"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                  onClick={() => setMode((m) => (m === "signup" ? "signin" : "signup"))}
                >
                  {mode === "signup"
                    ? "Already have an account? Sign in"
                    : "New here? Create an account"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              {otpSent ? (
                <form className="space-y-3" onSubmit={verifyOtp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-otp">Verification code</Label>
                    <Input
                      id="auth-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Sent to {phone}</p>
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={busy !== ""}>
                    {busy === "otp-verify" && (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    )}
                    Verify and sign in
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                  >
                    Use a different number
                  </button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={sendOtp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-phone">Mobile number</Label>
                    <Input
                      id="auth-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+14155550123"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include your country code. We'll text you a one-time code.
                    </p>
                  </div>
                  <Button type="submit" className="w-full rounded-xl" disabled={busy !== ""}>
                    {busy === "otp-send" && (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    )}
                    Send code
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            Educational tool only. Signing in never replaces professional medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export { Route };
