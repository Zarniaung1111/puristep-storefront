import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Shield,
  Zap,
  Star,
  Upload,
  X,
  ChevronRight,
  Sparkles,
  Search,
  Clock,
  Brain,
  Music2,
  Send,
  Lock,
  Play,
  Tag,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  Clapperboard,
  Plus,
  Gamepad2,
  Info,
  Target,
  BookOpen,
} from "lucide-react";
import {
  SiNetflix,
  SiYoutube,
  SiCanva,
  SiSpotify,
  SiApplemusic,
  SiNordvpn,
  SiTelegram,
  SiOpenai,
  SiGooglegemini,
  SiAnthropic,
  SiAdobecreativecloud,
  SiMessenger,
  SiBinance,
} from "react-icons/si";

const orderFormSchema = z.object({
  contactPlatform: z.string().min(1, "Please select a contact platform"),
  contactUsername: z.string().min(1, "Username is required").min(3, "At least 3 characters"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  paymentScreenshot: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type CategoryId = "all" | "ai" | "editing" | "music" | "telegram" | "vpn" | "gaming" | "education";

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  bigIcon: React.ReactNode;
  color: string;
  neon: string;
  glow: string;
  glowBg: string;
  borderHover: string;
  description: string;
  startingFrom: string | null;
  productCount: number;
}

const categories: Category[] = [
  {
    id: "all",
    label: "All",
    icon: <Tag className="w-4 h-4" />,
    bigIcon: <Tag className="w-8 h-8" />,
    color: "from-violet-600 to-purple-700",
    neon: "text-violet-400",
    glow: "shadow-violet-500/25",
    glowBg: "bg-violet-500/10",
    borderHover: "hover:border-violet-500/40",
    description: "All available digital subscriptions",
    startingFrom: "2,500 MMK",
    productCount: 0,
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: <Brain className="w-4 h-4" />,
    bigIcon: <Brain className="w-8 h-8" />,
    color: "from-fuchsia-600 to-violet-700",
    neon: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/30",
    glowBg: "bg-fuchsia-500/10",
    borderHover: "hover:border-fuchsia-500/40",
    description: "AI-powered creative & productivity tools",
    startingFrom: "6,000 MMK",
    productCount: 6,
  },
  {
    id: "editing",
    label: "Editing Software",
    icon: <Clapperboard className="w-4 h-4" />,
    bigIcon: <Clapperboard className="w-8 h-8" />,
    color: "from-orange-500 to-amber-600",
    neon: "text-amber-400",
    glow: "shadow-amber-500/30",
    glowBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
    description: "Professional video editing & creation",
    startingFrom: "19,000 KS",
    productCount: 3,
  },
  {
    id: "music",
    label: "Music & Streaming",
    icon: <Music2 className="w-4 h-4" />,
    bigIcon: <Music2 className="w-8 h-8" />,
    color: "from-pink-600 to-rose-700",
    neon: "text-pink-400",
    glow: "shadow-pink-500/30",
    glowBg: "bg-pink-500/10",
    borderHover: "hover:border-pink-500/40",
    description: "Streaming music, video & entertainment",
    startingFrom: "2,500 MMK",
    productCount: 6,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: <Send className="w-4 h-4" />,
    bigIcon: <Send className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-600",
    neon: "text-cyan-400",
    glow: "shadow-cyan-500/30",
    glowBg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-500/40",
    description: "Telegram Premium subscriptions",
    startingFrom: "From 24,000 KS",
    productCount: 4,
  },
  {
    id: "vpn",
    label: "VPN",
    icon: <Shield className="w-4 h-4" />,
    bigIcon: <Shield className="w-8 h-8" />,
    color: "from-emerald-500 to-teal-600",
    neon: "text-emerald-400",
    glow: "shadow-emerald-500/30",
    glowBg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/40",
    description: "Secure browsing & online privacy",
    startingFrom: null,
    productCount: 2,
  },
  {
    id: "gaming",
    label: "Gaming Coins",
    icon: <Gamepad2 className="w-4 h-4" />,
    bigIcon: <Gamepad2 className="w-8 h-8" />,
    color: "from-yellow-500 to-amber-600",
    neon: "text-yellow-400",
    glow: "shadow-yellow-500/30",
    glowBg: "bg-yellow-500/10",
    borderHover: "hover:border-yellow-500/40",
    description: "In-game currency and top-ups",
    startingFrom: "3,500 KS",
    productCount: 1,
  },
  {
    id: "education",
    label: "Education",
    icon: <BookOpen className="w-4 h-4" />,
    bigIcon: <BookOpen className="w-8 h-8" />,
    color: "from-sky-500 to-blue-600",
    neon: "text-sky-400",
    glow: "shadow-sky-500/30",
    glowBg: "bg-sky-500/10",
    borderHover: "hover:border-sky-500/40",
    description: "Online learning & language tools",
    startingFrom: "5,000 KS",
    productCount: 3,
  },
];

interface Product {
  id: string;
  categoryId: CategoryId;
  serviceName: string;
  planName: string;
  price: string;
  duration: string;
  features: string[];
  cardColor: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: string;
  comingSoon?: boolean;
}

interface AIPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  badgeStyle?: string;
  highlight?: boolean;
  buttonLabel?: string;
  customInstructions?: {
    intro?: string;
    introHighlight?: string;
    whatYouGet?: string[];
    whatYouGetLabel?: string;
    howToUse?: string[];
    howToUseText?: string;
    warranty?: string;
  };
}

interface AIApp {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  iconBg: string;
  iconGlow?: string;
  accentBorder: string;
  accentGlow: string;
  neon: string;
  startingFrom: string;
  plans: AIPlan[];
  comingSoon?: boolean;
}

const aiApps: AIApp[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    tagline: "OpenAI's flagship AI assistant",
    icon: <SiOpenai className="w-6 h-6 text-white" />,
    iconBg: "from-[#10A37F] to-[#0a8a6b]",
    iconGlow: "0 0 18px rgba(16,163,127,0.45)",
    accentBorder: "border-emerald-500/25 hover:border-emerald-400/50",
    accentGlow: "shadow-emerald-500/10",
    neon: "text-emerald-400",
    startingFrom: "From 19,000 KS",
    plans: [
      {
        id: "chatgpt-team",
        name: "Business Team Invite",
        price: "19,000 KS",
        period: "Monthly",
        features: [
          "Admin managed workspace",
          "Shared team collaboration",
          "Priority access to GPT-5",
          "Privacy-first (no training on data)",
        ],
        badge: "Best Seller",
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        highlight: true,
        customInstructions: {
          intro: "Chatgpt business team invite plan သည် ကိုယ့် personal mail ကို invite လုပ်ပေးမှာဖြစ်ပါတယ်",
          howToUse: [
            "Mail inbox တွင် chatgpt invite mail ကိုနှိပ်၍ join workspace ကိုနှိပ်ပါ",
            "ကိုယ့် acc ကို log in ဝင်ပြီးတာနဲ့ business plus subscription ကိုရပါပြီ",
          ],
        },
      },
      {
        id: "chatgpt-individual",
        name: "Individual",
        price: "35,000 KS",
        period: "Monthly",
        features: [
          "Full GPT-5 Thinking access",
          "Advanced Voice Mode",
          "1,000 Sora video credits / month",
          "DALL-E 3 image generation",
        ],
        customInstructions: {
          intro: "20$ Chatgpt plus official subscription.\nCan renew after subscription ends",
          whatYouGet: [
            "Chatgpt Mail & password ပိုပေးမှာဖြစ်ပါတယ်",
            "မိမိ ကိုယ်ပိုင် account ဖြင့်ယူလိုပါက Mail & password \u200cpိုပေးရပါမယ်",
          ],
          howToUseText: "Log in & use !!",
          warranty: "Fully guarantee for whole duration",
        },
      },
      {
        id: "chatgpt-annual",
        name: "Annual",
        price: "185,000 KS",
        period: "Yearly",
        features: [
          "Best value — save over 200,000 KS",
          "12 months uninterrupted Plus",
          "Dedicated priority support",
        ],
        badge: "Best Value",
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        customInstructions: {
          intro: "$200 Chatgpt plus official subscription.",
          introHighlight: "Can renew after subscription ends",
          whatYouGet: [
            "Chatgpt Mail & password ပို့ပေးမှာဖြစ်ပါတယ်",
            "မိမိ ကိုယ်ပိုင် account ဖြင့်ယူလိုပါက Mail & password \u200cပို့ပေးရပါမယ်",
          ],
          howToUseText: "Log in & use !!",
          warranty: "Fully guarantee for whole duration",
        },
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    tagline: "Google's most capable AI model",
    icon: <SiGooglegemini className="w-6 h-6 text-white" />,
    iconBg: "from-blue-400 to-purple-500",
    iconGlow: "0 0 18px rgba(139,92,246,0.45)",
    accentBorder: "border-blue-500/25 hover:border-blue-400/50",
    accentGlow: "shadow-blue-500/10",
    neon: "text-blue-400",
    startingFrom: "From 25,000 KS",
    plans: [
      {
        id: "gemini-3month",
        name: "3 Months",
        price: "30,000 KS",
        period: "3 Months",
        features: [
          "Gemini 3.1 Pro Thinking model",
          "Veo 3.1 — 1,000 video credits / month",
          "5x NotebookLM access",
          "1M token context window",
          "2TB Google storage",
        ],
        badge: "Best Value",
        badgeStyle: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        highlight: true,
        customInstructions: {
          intro: "60$ Gemini pro 3 months subscription.",
          introHighlight: "Must use another account after subscription ends",
          whatYouGetLabel: "What you get :",
          whatYouGet: [
            "Plan ဝယ်ယူပြီး ရရှိသော account ဖြင့် log in ဝင်၍ တန်းသုံးနိုင်သည်",
            "မိမိ personal mail ဖြင့် ယူလိုပါက mail & password ပို့ပေးရပါမယ်",
          ],
          warranty: "Fully guarantee for whole duration",
        },
      },
      {
        id: "gemini-annual",
        name: "Annual",
        price: "55,000 KS",
        period: "Yearly",
        features: [
          "Gemini 3.1 Pro Thinking model",
          "Veo 3.1 — 1,000 video credits / month",
          "5x NotebookLM access",
          "1M token context window",
          "2TB Google storage",
        ],
        badge: "Best Price",
        badgeStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
        customInstructions: {
          intro: "1 Year Gemini Pro official subscription.",
          introHighlight: "Can renew after subscription ends",
          whatYouGetLabel: "What you get :",
          whatYouGet: [
            "Plan ဝယ်ယူပြီး ရရှိသော account ဖြင့် log in ဝင်၍ တန်းသုံးနိုင်သည်",
            "မိမိ personal mail ဖြင့် ယူလိုပါက mail & password ပို့ပေးရပါမယ်",
          ],
          warranty: "Fully guarantee for whole duration",
        },
      },
    ],
  },
  {
    id: "claude",
    name: "Claude Pro",
    tagline: "Anthropic's thoughtful AI assistant",
    icon: <img src="/claude-logo.jpg" alt="Claude AI Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-[#D97757] to-[#be5c38]",
    iconGlow: "0 0 18px rgba(217,119,87,0.45)",
    accentBorder: "border-orange-500/25 hover:border-orange-400/50",
    accentGlow: "shadow-orange-500/10",
    neon: "text-orange-400",
    startingFrom: "From 340,000 KS",
    plans: [
      {
        id: "claude-6month",
        name: "6 Months",
        price: "340,000 KS",
        period: "6 Months",
        features: [
          "5x higher usage limits",
          "Access to top-tier models (Opus & Sonnet)",
          "Projects & Artifacts workspace",
          "Priority access during high traffic",
        ],
        badge: "Best Value",
        badgeStyle: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        highlight: true,
      },
    ],
  },
  {
    id: "canva",
    name: "Canva Pro",
    tagline: "AI-powered design for everyone",
    icon: <SiCanva className="w-6 h-6 text-white" />,
    iconBg: "from-[#00C4CC] to-[#009ea5]",
    iconGlow: "0 0 18px rgba(0,196,204,0.45)",
    accentBorder: "border-teal-500/25 hover:border-teal-400/50",
    accentGlow: "shadow-teal-500/10",
    neon: "text-teal-400",
    startingFrom: "From 20,000 KS",
    plans: [
      {
        id: "canva-edu-2yr",
        name: "Edu Pro — 2 Years",
        price: "20,000 KS",
        period: "2 Years",
        features: [
          "100M+ premium photos & templates",
          "One-click Background Remover",
          "Magic AI editing tools",
          "1TB Cloud Storage",
        ],
        badge: "Best Deal",
        badgeStyle: "bg-teal-500/20 text-teal-300 border-teal-500/40",
        highlight: true,
      },
    ],
  },
  {
    id: "kling",
    name: "Kling AI",
    tagline: "Professional AI video generation",
    icon: <img src="/kling-logo.png" alt="Kling AI Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-violet-600 to-fuchsia-700",
    accentBorder: "border-violet-500/25 hover:border-violet-400/50",
    accentGlow: "shadow-violet-500/10",
    neon: "text-violet-400",
    startingFrom: "From 42,000 KS",
    plans: [
      {
        id: "kling-standard",
        name: "Kling AI Standard",
        price: "42,000 KS",
        period: "Monthly",
        features: [
          "1000 fast-generation credits per month",
          "Professional text-to-video & image-to-video",
          "Advanced camera movement controls",
          "Watermark removal",
          "Commercial usage rights",
        ],
        badge: "Video AI",
        badgeStyle: "bg-violet-500/20 text-violet-300 border-violet-500/40",
        highlight: true,
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity Pro",
    tagline: "AI-powered search & research assistant",
    icon: <img src="/perplexity-logo.png" alt="Perplexity AI Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-cyan-500 to-teal-600",
    accentBorder: "border-cyan-500/25 hover:border-cyan-400/50",
    accentGlow: "shadow-cyan-500/15",
    neon: "text-cyan-400",
    startingFrom: "From 24,000 KS",
    plans: [
      {
        id: "perplexity-monthly",
        name: "Monthly",
        price: "24,000 KS",
        period: "Monthly",
        features: [
          "Unlimited Pro Searches",
          "Premium AI Models (GPT-4o, Claude 3.5 Sonnet)",
          "Unlimited File Uploads",
          "AI Image Generation",
          "Ad-Free Experience",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "perplexity-yearly",
        name: "Annual",
        price: "68,000 KS",
        period: "Yearly",
        features: [
          "Save over 75% compared to monthly",
          "Everything in the Monthly plan",
          "Always Up-to-Date Models",
          "Uninterrupted Workflow",
          "Priority Support",
        ],
        badge: "🏆 Best Value",
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        highlight: true,
        buttonLabel: "Select Yearly Plan",
      },
    ],
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    tagline: "Fine-tuned AI image generation",
    icon: <img src="/leonardo-logo.png" alt="Leonardo AI Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-yellow-500 to-orange-600",
    accentBorder: "border-yellow-500/25 hover:border-yellow-400/50",
    accentGlow: "shadow-yellow-500/10",
    neon: "text-yellow-400",
    startingFrom: "Price TBD",
    plans: [
      {
        id: "leonardo-tbd",
        name: "Coming Soon",
        price: "TBD",
        period: "—",
        features: [
          "Fine-tuned image generation models",
          "Daily generation credits",
          "Alchemy upscaler & enhancer",
          "Custom AI model training",
          "Commercial use license",
        ],
        badge: "Image AI",
        badgeStyle: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
        highlight: false,
      },
    ],
  },
];

const musicApps: AIApp[] = [
  {
    id: "netflix",
    name: "Netflix",
    tagline: "4K streaming, private profile, MM region",
    icon: <SiNetflix className="w-6 h-6 text-red-500" />,
    iconBg: "from-red-600 to-red-800",
    accentBorder: "border-red-500/25 hover:border-red-400/50",
    accentGlow: "shadow-red-500/10",
    neon: "text-red-400",
    startingFrom: "From 22,000 KS",
    plans: [
      {
        id: "netflix-premium-4k",
        name: "Netflix Premium 4K + HDR",
        price: "22,000 KS",
        period: "Monthly",
        features: [
          "Own profile (100% private)",
          "4K Ultra HD + HDR quality",
          "1 device supported",
          "Direct Myanmar (MM) Region access (No VPN required)",
        ],
        badge: "4K",
        badgeStyle: "bg-red-500/20 text-red-300 border-red-500/40",
        highlight: true,
      },
    ],
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    tagline: "Ad-free videos, YouTube Music, background play",
    icon: <SiYoutube className="w-6 h-6 text-rose-500" />,
    iconBg: "from-rose-500 to-red-700",
    accentBorder: "border-rose-500/25 hover:border-rose-400/50",
    accentGlow: "shadow-rose-500/10",
    neon: "text-rose-400",
    startingFrom: "From 22,000 KS",
    plans: [
      {
        id: "youtube-premium-monthly",
        name: "Monthly",
        price: "22,000 KS",
        period: "Monthly",
        features: [
          "100% Ad-free videos",
          "YouTube Music Premium included",
          "Background play (screen off)",
          "Download for offline viewing",
        ],
        buttonLabel: "Buy Now",
      },
      {
        id: "youtube-premium-annual",
        name: "1 Year",
        price: "140,000 KS",
        period: "1 Year",
        features: [
          "Save 124,000 KS compared to monthly",
          "Uninterrupted ad-free viewing for 12 months",
          "YouTube Music Premium included",
          "Background play & Offline downloads",
        ],
        badge: "🏆 BEST VALUE",
        badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        highlight: true,
        buttonLabel: "Buy Now",
      },
    ],
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    tagline: "Ad-free music, offline downloads, all devices",
    icon: <SiSpotify className="w-6 h-6 text-green-400" />,
    iconBg: "from-green-500 to-emerald-700",
    accentBorder: "border-green-500/25 hover:border-green-400/50",
    accentGlow: "shadow-green-500/10",
    neon: "text-green-400",
    startingFrom: "Individual & Family",
    plans: [
      { id: "spotify-individual-1m",  name: "Individual Monthly",   price: "14,000 KS", period: "monthly",   features: [] },
      { id: "spotify-individual-2m",  name: "Individual 2 Months",  price: "26,000 KS", period: "2 months",  features: [] },
      { id: "spotify-individual-3m",  name: "Individual 3 Months",  price: "34,000 KS", period: "3 months",  features: [] },
      { id: "spotify-family-1m",      name: "Family Monthly",       price: "8,000 KS",  period: "monthly",   features: [] },
      { id: "spotify-family-2m",      name: "Family 2 Months",      price: "14,000 KS", period: "2 months",  features: [] },
      { id: "spotify-family-3m",      name: "Family 3 Months",      price: "22,000 KS", period: "3 months",  features: [] },
      { id: "spotify-family-6m",      name: "Family 6 Months",      price: "47,000 KS", period: "6 months",  features: [] },
      { id: "spotify-family-12m",     name: "Family 12 Months",     price: "74,000 KS", period: "12 months", features: [] },
    ],
  },
];

const editingApps: AIApp[] = [
  {
    id: "capcut",
    name: "CapCut",
    tagline: "Professional video editing & creation",
    icon: <img src="/capcut-logo.webp" alt="CapCut Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-black to-[#111111]",
    iconGlow: "0 0 14px rgba(255,255,255,0.10)",
    accentBorder: "border-amber-500/25 hover:border-amber-400/50",
    accentGlow: "shadow-amber-500/10",
    neon: "text-amber-400",
    startingFrom: "From 19,000 KS",
    plans: [
      {
        id: "capcut-pro-monthly",
        name: "Pro Monthly",
        price: "19,000 KS",
        period: "Monthly",
        features: [
          "Remove watermark",
          "Premium templates",
          "AI features",
          "All devices",
          "Cloud storage 100GB",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "capcut-pro-6month",
        name: "Pro 6 Months",
        price: "42,000 KS",
        period: "6 Months",
        features: [
          "Save 72,000 MMK compared to monthly",
          "All Pro Monthly perks",
          "Uninterrupted editing",
          "Priority rendering speed",
          "Locked-in price for 6 months",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "capcut-pro-annual",
        name: "Pro Annual",
        price: "71,000 KS",
        period: "1 Year",
        features: [
          "Massive savings (pay for 4 months, get 12)",
          "Everything in 6-Month plan",
          "Seamless workflow for heavy projects",
          "Always up-to-date AI features",
          "100GB Cloud Storage",
        ],
        badge: "🏆 Best Value",
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        highlight: true,
        buttonLabel: "Select Plan",
      },
    ],
  },
  {
    id: "adobe-cc",
    name: "Adobe Creative Cloud",
    tagline: "Professional creative suite for creators",
    icon: <SiAdobecreativecloud className="w-6 h-6 text-[#FF0000]" />,
    iconBg: "from-[#1a1a1a] to-[#111111]",
    iconGlow: "0 0 14px rgba(255,0,0,0.25)",
    accentBorder: "border-red-500/25 hover:border-red-400/50",
    accentGlow: "shadow-red-500/10",
    neon: "text-red-400",
    startingFrom: "From 25,000 KS",
    plans: [
      {
        id: "adobe-cc-monthly",
        name: "Monthly",
        price: "25,000 KS",
        period: "Monthly",
        features: [
          "Access to 20+ apps (Premiere, Photoshop)",
          "1,000 Generative AI Credits per month",
          "100GB Cloud Storage",
          "Premium Adobe Fonts",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "adobe-cc-4month",
        name: "4 Months",
        price: "63,000 KS",
        period: "4 Months",
        features: [
          "Save 37,000 MMK compared to monthly",
          "4,000 Generative AI Credits total",
          "Uninterrupted access to all apps",
          "Locked-in rate for 120 days",
        ],
        badge: "🏆 Best Value",
        badgeStyle: "bg-red-500/20 text-red-300 border-red-500/40",
        highlight: true,
        buttonLabel: "Select 4-Month Plan",
      },
    ],
  },
];

const telegramApps: AIApp[] = [
  {
    id: "telegram-premium",
    name: "Telegram Premium",
    tagline: "Increased limits, faster speeds",
    icon: <SiTelegram className="w-6 h-6 text-blue-400" />,
    iconBg: "from-blue-500 to-cyan-600",
    accentBorder: "border-blue-500/25 hover:border-blue-400/50",
    accentGlow: "shadow-blue-500/10",
    neon: "text-cyan-400",
    startingFrom: "From 24,000 KS",
    plans: [
      {
        id: "telegram-1m",
        name: "1 Month",
        price: "24,000 KS",
        period: "1 month",
        features: [
          "4GB file uploads",
          "Faster download speeds",
          "Voice-to-text conversion",
          "Premium badge & stickers",
          "Ad-free public channels",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "telegram-3m",
        name: "3 Months",
        price: "49,000 KS",
        period: "3 months",
        features: [
          "4GB file uploads",
          "Faster download speeds",
          "Voice-to-text conversion",
          "Premium badge & stickers",
          "Ad-free public channels",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "telegram-6m",
        name: "6 Months",
        price: "79,000 KS",
        period: "6 months",
        features: [
          "4GB file uploads",
          "Faster download speeds",
          "Voice-to-text conversion",
          "Premium badge & stickers",
          "Ad-free public channels",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "telegram-12m",
        name: "1 Year",
        price: "136,000 KS",
        period: "1 year",
        features: [
          "4GB file uploads",
          "Faster download speeds",
          "Voice-to-text conversion",
          "Premium badge & stickers",
          "Ad-free public channels",
        ],
        badge: "🏆 Best Value",
        badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        highlight: true,
        buttonLabel: "Select Plan",
      },
    ],
  },
];

const vpnApps: AIApp[] = [
  {
    id: "expressvpn",
    name: "Express VPN Premium",
    tagline: "High-speed, unblock any app",
    icon: <img src="/expressvpn-logo.jpg" alt="ExpressVPN Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-red-600 to-orange-700",
    accentBorder: "border-red-500/25 hover:border-red-400/50",
    accentGlow: "shadow-red-500/10",
    neon: "text-red-400",
    startingFrom: "From 4,000 KS",
    plans: [
      {
        id: "expressvpn-1m",
        name: "Monthly",
        price: "4,000 KS",
        period: "1 month",
        features: [
          "Unblock all restricted apps (FB, IG, Telegram)",
          "Fast & stable connection",
          "100% private browsing",
          "1 device supported",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "expressvpn-3m",
        name: "3 Months",
        price: "12,000 KS",
        period: "3 months",
        features: [
          "90 days uninterrupted access",
          "All monthly premium features",
          "High-speed streaming support",
          "Bypass ISP throttling",
        ],
        buttonLabel: "Select Plan",
      },
      {
        id: "expressvpn-1y",
        name: "1 Year",
        price: "32,000 KS",
        period: "1 year",
        features: [
          "Save 16,000 KS instantly",
          "Full 12-months uninterrupted",
          "Top-priority fast servers",
          "Ultimate security lock",
        ],
        badge: "🏆 BEST VALUE",
        badgeStyle: "bg-red-500/20 text-red-300 border-red-500/40",
        highlight: true,
        buttonLabel: "Select Plan",
      },
    ],
  },
];

const products: Product[] = [
  // --- AI (non-ChatGPT) ---
  {
    id: "gemini-pro",
    categoryId: "ai",
    serviceName: "Gemini",
    planName: "Advanced",
    price: "20,000 MMK",
    duration: "1 Month",
    features: ["Advanced reasoning", "Google app integration", "Gemini 1.5 Pro model", "1M token context", "Priority access"],
    cardColor: "from-blue-900/40 to-indigo-950/60",
    gradient: "from-blue-500 to-indigo-600",
    icon: <SiGooglegemini className="w-7 h-7 text-blue-400" />,
    badge: "Google AI",
  },
  {
    id: "claude-pro",
    categoryId: "ai",
    serviceName: "Claude",
    planName: "Pro",
    price: "22,000 MMK",
    duration: "1 Month",
    features: ["High-capacity usage", "Artifacts feature", "Claude 3.5 Sonnet", "Priority bandwidth", "Advanced analysis"],
    cardColor: "from-orange-900/40 to-amber-950/60",
    gradient: "from-orange-500 to-amber-600",
    icon: <SiAnthropic className="w-7 h-7 text-orange-400" />,
    badge: "Anthropic",
  },
  {
    id: "canva-pro",
    categoryId: "ai",
    serviceName: "Canva",
    planName: "Pro",
    price: "6,000 MMK",
    duration: "1 Month",
    features: ["Brand Kit", "Magic AI tools", "Background remover", "100M+ premium assets", "Unlimited storage"],
    cardColor: "from-teal-900/40 to-cyan-950/60",
    gradient: "from-teal-500 to-cyan-600",
    icon: <SiCanva className="w-7 h-7 text-teal-400" />,
    badge: "Best Price",
  },
  {
    id: "kling-ai",
    categoryId: "ai",
    serviceName: "Kling AI",
    planName: "Standard",
    price: "42,000 KS",
    duration: "1 Month",
    features: [
      "1000 fast-generation credits per month",
      "Professional text-to-video & image-to-video",
      "Advanced camera movement controls",
      "Watermark removal",
      "Commercial usage rights",
    ],
    cardColor: "from-violet-900/40 to-purple-950/60",
    gradient: "from-violet-500 to-purple-600",
    icon: (
      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
        <span className="text-white text-[10px] font-black tracking-tighter">KL</span>
      </div>
    ),
    badge: "Video AI",
  },
  {
    id: "leonardo-ai",
    categoryId: "ai",
    serviceName: "Leonardo AI",
    planName: "Apprentice",
    price: "12,000 MMK",
    duration: "1 Month",
    features: ["Fine-tuned image models", "Daily credits (8,500)", "Alchemy upscaler", "Custom AI training", "Commercial license"],
    cardColor: "from-yellow-900/40 to-orange-950/60",
    gradient: "from-yellow-500 to-orange-600",
    icon: (
      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
        <span className="text-white text-[10px] font-black tracking-tighter">LN</span>
      </div>
    ),
    badge: "Image AI",
  },

  // --- CapCut (now under Editing Software accordion — no product cards needed here) ---

  // --- Music & Streaming product cards (YouTube Premium & Spotify are now in the accordion) ---
  {
    id: "apple-music",
    categoryId: "music",
    serviceName: "Apple Music",
    planName: "Individual",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["100M+ songs", "Lossless audio", "Dolby Atmos", "Lyrics synced", "All devices"],
    cardColor: "from-pink-900/40 to-rose-950/60",
    gradient: "from-pink-500 to-rose-600",
    icon: <SiApplemusic className="w-7 h-7 text-pink-400" />,
    badge: "Soon",
    comingSoon: true,
  },

  // --- VPN ---
  {
    id: "nordvpn-monthly",
    categoryId: "vpn",
    serviceName: "NordVPN",
    planName: "Standard",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["6,000+ servers", "No logs policy", "Kill switch", "Ad & malware blocker", "6 devices"],
    cardColor: "from-blue-900/40 to-indigo-950/60",
    gradient: "from-blue-600 to-indigo-700",
    icon: <SiNordvpn className="w-7 h-7 text-blue-400" />,
    badge: "Soon",
    comingSoon: true,
  },
];

const gamingApps: AIApp[] = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    tagline: "Diamonds & Weekly/Twilight Passes",
    icon: <Gamepad2 className="w-6 h-6 text-yellow-300" />,
    iconBg: "from-yellow-500 to-amber-600",
    accentBorder: "border-yellow-500/25 hover:border-yellow-400/50",
    accentGlow: "shadow-yellow-500/10",
    neon: "text-yellow-400",
    startingFrom: "From 3,500 KS",
    plans: [],
  },
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    tagline: "UC Top-up",
    icon: <Target className="w-6 h-6 text-orange-400" />,
    iconBg: "from-orange-500 to-amber-700",
    accentBorder: "border-orange-500/25",
    accentGlow: "shadow-orange-500/10",
    neon: "text-orange-400",
    startingFrom: "Coming Soon",
    plans: [],
    comingSoon: true,
  },
];

const educationApps: AIApp[] = [
  {
    id: "coursera-plus",
    name: "Coursera Plus",
    tagline: "Unlimited Learning",
    icon: <img src="/coursera-logo.png" alt="Coursera Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-blue-500 to-indigo-600",
    accentBorder: "border-blue-500/25 hover:border-blue-400/50",
    accentGlow: "shadow-blue-500/10",
    neon: "text-blue-400",
    startingFrom: "From 15,000 KS",
    plans: [
      {
        id: "coursera-monthly",
        name: "Monthly",
        price: "15,000 KS",
        period: "Monthly",
        features: [
          "Access to 7,000+ courses",
          "Earn unlimited certificates",
          "Professional certs from Google/IBM",
          "Learn at your own pace",
        ],
      },
      {
        id: "coursera-annual",
        name: "Annual",
        price: "120,000 KS",
        period: "Yearly",
        features: [
          "Access to 7,000+ courses",
          "Earn unlimited certificates",
          "Professional certs from Google/IBM",
          "Learn at your own pace",
          "Best value for long-term learners",
        ],
        badge: "Best Value",
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
  },
  {
    id: "elsa-speak",
    name: "ELSA Speak Pro",
    tagline: "AI English Coach",
    icon: <img src="/elsa-logo.png" alt="ELSA Speak Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-teal-500 to-cyan-600",
    accentBorder: "border-teal-500/25 hover:border-teal-400/50",
    accentGlow: "shadow-teal-500/10",
    neon: "text-teal-400",
    startingFrom: "From 8,000 KS",
    plans: [
      {
        id: "elsa-monthly",
        name: "Monthly",
        price: "8,000 KS",
        period: "Monthly",
        features: [
          "Advanced AI pronunciation analysis",
          "Unlimited bite-sized lessons",
          "Customized learning plans",
          "Ad-free experience",
        ],
        badge: "Best Seller",
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      },
      {
        id: "elsa-quarterly",
        name: "3 Months",
        price: "22,000 KS",
        period: "3 Months",
        features: [
          "Advanced AI pronunciation analysis",
          "Unlimited bite-sized lessons",
          "Customized learning plans",
          "Ad-free experience",
          "Save vs monthly plan",
        ],
        badge: "Best Value",
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      },
    ],
  },
  {
    id: "duolingo-super",
    name: "Duolingo Super",
    tagline: "Learn Languages Fast",
    icon: <img src="/duolingo-dark.png" alt="Duolingo Logo" className="w-10 h-10 rounded-xl object-cover" />,
    iconBg: "from-lime-500 to-green-600",
    accentBorder: "border-lime-500/25 hover:border-lime-400/50",
    accentGlow: "shadow-lime-500/10",
    neon: "text-lime-400",
    startingFrom: "From 5,000 KS",
    plans: [
      {
        id: "duolingo-monthly",
        name: "Monthly",
        price: "5,000 KS",
        period: "Monthly",
        features: [
          "Unlimited Hearts (no waiting)",
          "Ad-free learning",
          "Personalized practice hub",
          "Unlimited Legendary attempts",
        ],
      },
      {
        id: "duolingo-annual",
        name: "Annual",
        price: "45,000 KS",
        period: "Yearly",
        features: [
          "Unlimited Hearts (no waiting)",
          "Ad-free learning",
          "Personalized practice hub",
          "Unlimited Legendary attempts",
          "Best price per month",
        ],
        badge: "Best Value",
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        customInstructions: {
          intro: "Duolingo Super (1 Year / standard) official subscription.",
          introHighlight: "Can renew after subscription ends",
          whatYouGet: [
            "Log in credentials for a pre-activated account (or activation on your personal mail if available)",
            "Plan ဝယ်ယူပြီး ရရှိသော account ဖြင့် log in ဝင်၍ တန်းသုံးနိုင်သည်",
            "မိမိ personal mail ဖြင့် ယူလိုပါက mail & password ပို့ပေးရပါမယ် (သီးသန့် option)",
          ],
          howToUseText: "Log in & use !!",
          warranty: "Fully guarantee for whole duration",
        },
      },
    ],
  },
];

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "PS-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const PAYMENT_INFO: Record<string, { label: string; value: string; name: string; color: string }> = {
  KBZPay:  { label: "Phone", value: "09892246556", name: "AungNaingOo", color: "border-purple-500/50 text-purple-400" },
  UABPay:  { label: "Phone", value: "09442988204", name: "AungNaingOo", color: "border-teal-500/50 text-teal-400"    },
  WavePay: { label: "Phone", value: "09442988204", name: "AungNaingOo", color: "border-blue-500/50 text-blue-400"    },
  AYAPay:  { label: "Phone", value: "09442988204", name: "AungNaingOo", color: "border-teal-500/50 text-teal-400"    },
  Binance: { label: "UID",   value: "979804957",   name: "PuriStep",    color: "border-amber-500/50 text-amber-400"  },
};

const CAROUSEL_CARDS = [
  { icon: <SiNetflix className="w-5 h-5 text-red-500" />,         bg: "bg-red-600/15",    title: "Netflix",      sub: "Streaming",        price: "22,000 KS", accent: "text-red-400"    },
  { icon: <SiOpenai className="w-5 h-5 text-violet-400" />,       bg: "bg-violet-600/15", title: "ChatGPT Plus", sub: "AI Assistant",     price: "19,000 KS", accent: "text-violet-400" },
  { icon: <SiSpotify className="w-5 h-5 text-green-500" />,       bg: "bg-green-600/15",  title: "Spotify",      sub: "Music & Podcasts", price: "8,000 KS",  accent: "text-green-400"  },
  { icon: <SiCanva className="w-5 h-5 text-cyan-400" />,          bg: "bg-cyan-600/15",   title: "Canva Pro",    sub: "Design Tool",      price: "12,000 KS", accent: "text-cyan-400"   },
  { icon: <SiYoutube className="w-5 h-5 text-red-400" />,         bg: "bg-red-500/15",    title: "YouTube",      sub: "Premium",          price: "9,000 KS",  accent: "text-red-300"    },
  { icon: <SiTelegram className="w-5 h-5 text-blue-400" />,       bg: "bg-blue-600/15",   title: "Telegram",     sub: "Premium",          price: "7,000 KS",  accent: "text-blue-400"   },
  { icon: <SiGooglegemini className="w-5 h-5 text-purple-400" />, bg: "bg-purple-600/15", title: "Gemini",       sub: "AI Assistant",     price: "15,000 KS", accent: "text-purple-400" },
  { icon: <SiNordvpn className="w-5 h-5 text-blue-300" />,        bg: "bg-blue-500/15",   title: "NordVPN",      sub: "VPN Security",     price: "14,000 KS", accent: "text-blue-300"   },
];

const CAROUSEL_SLOTS = [
  { x: 0,    scale: 1.10, opacity: 1.00, zIndex: 20 }, // 0  center
  { x: 155,  scale: 0.90, opacity: 0.55, zIndex: 10 }, // 1  right-1
  { x: 295,  scale: 0.75, opacity: 0.20, zIndex: 5  }, // 2  right-2
  { x: 430,  scale: 0.65, opacity: 0.00, zIndex: 0  }, // 3  right-3 (edge, hidden)
  { x: 560,  scale: 0.60, opacity: 0.00, zIndex: 0  }, // 4  off-screen right
  { x: -560, scale: 0.60, opacity: 0.00, zIndex: 0  }, // 5  off-screen left
  { x: -295, scale: 0.75, opacity: 0.20, zIndex: 5  }, // 6  left-2
  { x: -155, scale: 0.90, opacity: 0.55, zIndex: 10 }, // 7  left-1
];

function HeroCarousel({ onCardClick }: { onCardClick?: () => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % 8), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[250px] flex items-center justify-center mt-4 mb-8 overflow-hidden">
      {/* Tech grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[500px] h-[150px] bg-purple-600/30 blur-[80px] md:blur-[100px] rounded-[100%] pointer-events-none -z-10" />

      {/* Track with edge-fade mask — overflow-hidden clips cards at ±560px slots */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        {CAROUSEL_CARDS.map((card, i) => {
          const slot = (i - active + 8) % 8;
          const s = CAROUSEL_SLOTS[slot];
          return (
            <div
              key={i}
              onClick={onCardClick}
              style={{
                position: 'absolute',
                width: '120px',
                height: '140px',
                transform: `translateX(${s.x}px) scale(${s.scale})`,
                opacity: s.opacity,
                zIndex: s.zIndex,
                transition: 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.65s ease',
                cursor: 'pointer',
              }}
              className="bg-[#13151A] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-2xl shadow-black/60"
            >
              {slot === 0 && (
                <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-500/30 pointer-events-none" />
              )}
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                {card.icon}
              </div>
              <p className="text-[13px] font-bold text-white leading-tight text-center">{card.title}</p>
              <p className="text-[10px] text-gray-500 leading-tight text-center">{card.sub}</p>
              <p className="text-[10px] leading-tight">
                <span className="text-gray-600">From </span>
                <span className={`font-semibold ${card.accent}`}>{card.price}</span>
              </p>
            </div>
          );
        })}
      </div>
      {/* Bottom fade — dissolves grid into the section below */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none z-0" />
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [productModalApp, setProductModalApp] = useState<AIApp | null>(null);
  const [productModalCategoryId, setProductModalCategoryId] = useState<string>("ai");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [mlbbUserId, setMlbbUserId] = useState("");
  const [mlbbServerId, setMlbbServerId] = useState("");

  const productsRef = useRef<HTMLDivElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const { toast } = useToast();

  const [fabVisible, setFabVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [orderIdCopied, setOrderIdCopied] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      contactPlatform: "",
      contactUsername: "",
      paymentMethod: "",
      paymentScreenshot: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("productName", selectedProduct?.serviceName ?? "");
      fd.append("planName", selectedProduct?.planName ?? "");
      fd.append("price", selectedProduct?.price ?? "");
      fd.append("contactPlatform", data.contactPlatform);
      fd.append("contactUsername", data.contactUsername);
      fd.append("paymentMethod", data.paymentMethod);
      if (selectedProduct?.serviceName === "Mobile Legends") {
        fd.append("mlbbUserId", mlbbUserId);
        fd.append("mlbbServerId", mlbbServerId);
      }
      if (selectedFileRef.current) {
        fd.append("paymentScreenshot", selectedFileRef.current);
      }
      return fetch("/api/checkout", { method: "POST", body: fd, credentials: "include" }).then(async res => {
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        return res;
      });
    },
    onSuccess: () => setOrderSuccess(true),
    onError: () => toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" }),
  });

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
    selectedFileRef.current = null;
    setMlbbUserId("");
    setMlbbServerId("");
  };

  const openProductModal = (app: AIApp, categoryId: string) => {
    setProductModalApp(app);
    setProductModalCategoryId(categoryId);
    setProductModalOpen(true);
  };

  const handleAppPlanBuyNow = (app: AIApp, plan: AIPlan) => {
    setProductModalOpen(false);
    const cardColorMap: Record<string, string> = {
      ai: "from-fuchsia-900/40 to-violet-950/60",
      editing: "from-amber-900/40 to-orange-950/60",
      music: "from-red-900/40 to-rose-950/60",
      telegram: "from-blue-900/40 to-cyan-950/60",
      vpn: "from-red-900/40 to-orange-950/60",
    };
    setSelectedProduct({
      id: plan.id,
      categoryId: productModalCategoryId,
      serviceName: app.name,
      planName: plan.name,
      price: plan.price,
      duration: plan.period,
      features: plan.features,
      cardColor: cardColorMap[productModalCategoryId] ?? "from-violet-900/40 to-violet-950/60",
      gradient: app.iconBg,
      icon: app.icon,
    });
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
    selectedFileRef.current = null;
    setMlbbUserId("");
    setMlbbServerId("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
      return;
    }
    selectedFileRef.current = file;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: OrderFormValues) => mutation.mutate(data);

  const watchedPaymentMethod = form.watch("paymentMethod");
  const activePaymentInfo = PAYMENT_INFO[watchedPaymentMethod] ?? null;
  const [paymentBorderCls, paymentTextCls] = activePaymentInfo
    ? activePaymentInfo.color.split(" ")
    : ["border-white/10", "text-white"];

  const activeCat = categories.find(c => c.id === activeCategory)!;
  const q = searchQuery.toLowerCase().trim();

  const matchesApp = (app: AIApp) =>
    !q || app.name.toLowerCase().includes(q) || app.tagline.toLowerCase().includes(q);
  const matchesProduct = (p: Product) =>
    !q || p.serviceName.toLowerCase().includes(q) || p.planName.toLowerCase().includes(q);

  const filteredAIApps = aiApps.filter(matchesApp);
  const filteredEditingApps = editingApps.filter(matchesApp);
  const filteredMusicApps = musicApps.filter(matchesApp);
  const filteredTelegramApps = telegramApps.filter(matchesApp);
  const filteredVpnApps = vpnApps.filter(matchesApp);
  const filteredGamingApps = gamingApps.filter(matchesApp);
  const filteredEducationApps = educationApps.filter(matchesApp);

  const filteredProducts = (activeCategory === "all"
    ? products
    : products.filter(p => p.categoryId === activeCategory)
  ).filter(matchesProduct);

  const groupedByCategory = activeCategory === "all"
    ? categories.slice(1).map(cat => ({
        cat,
        items: products.filter(p => p.categoryId === cat.id).filter(matchesProduct),
        filteredApps: cat.id === "ai" ? filteredAIApps : cat.id === "editing" ? filteredEditingApps : cat.id === "music" ? filteredMusicApps : cat.id === "telegram" ? filteredTelegramApps : cat.id === "vpn" ? filteredVpnApps : cat.id === "gaming" ? filteredGamingApps : cat.id === "education" ? filteredEducationApps : [],
      })).filter(g => g.items.length > 0 || g.filteredApps.length > 0 || (!q && ["ai", "editing", "music", "telegram", "vpn", "gaming", "education"].includes(g.cat.id)))
    : null;

  const handleCategoryClick = (catId: CategoryId) => {
    setActiveCategory(catId);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white pt-16 w-full max-w-[100vw] overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05050f]/85 backdrop-blur-xl border-b border-white/[0.06]" style={{ boxShadow: "0 1px 0 0 rgba(139,92,246,0.08), 0 4px 24px 0 rgba(0,0,0,0.4)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Puri<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Step</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/admin" className="text-sm text-white/30 hover:text-white/60 transition-colors hidden sm:block">Admin</a>
          </div>
        </div>
      </nav>

      {/* ── Premium Hero Section ── */}
      <section className="relative overflow-hidden flex flex-col items-center text-center pt-4 pb-6 px-4 w-full bg-gradient-to-b from-purple-900/20 via-[#0B0C10] to-[#0B0C10]">

        {/* Background nebula orbs */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/30 rounded-full blur-[100px] md:blur-[120px] top-[-10%] opacity-70" />
          <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-cyan-600/20 rounded-full blur-[90px] md:blur-[100px] top-[10%] left-[20%] opacity-60" />
        </div>

        {/* ① 3D Orbit Carousel */}
        <div className="relative z-20 w-full">
          <HeroCarousel onCardClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        </div>

        {/* ② Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Digital Subscriptions{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>

        {/* ③ Subtitle */}
        <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8">
          Instant delivery. 24/7 local support. Premium packs for Myanmar.
        </p>

        {/* ④ CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto mb-6">
          <button
            onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-95 transition-all duration-150 ease-out active:scale-95"
            data-testid="button-hero-shop"
          >
            Shop Subscriptions
          </button>
          <a
            href="#how-to-buy-section"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm text-white/65 bg-[#121212] border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-150 ease-out active:scale-95 text-center"
            data-testid="button-hero-howto"
          >
            How to Buy (Wave / KBZ)
          </a>
        </div>

        {/* ⑤ Trust bar */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-green-500 text-green-500" />
            ))}
          </div>
          <span className="text-gray-500 text-xs">4.9/5 Rating · Trusted by 500+ Myanmar Creators</span>
        </div>

      </section>

      {/* ── Recent Purchases Marquee ── */}
      <div className="w-full overflow-hidden border-y border-white/[0.05] bg-[#07070e]/80 py-2.5 flex items-stretch">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center px-4 border-r border-white/[0.07] mr-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 whitespace-nowrap">Recent Purchases</span>
        </div>
        {/* Scrolling strip */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee flex items-center whitespace-nowrap w-max">
            {[
              { action: "Thida upgraded to",       product: "ChatGPT Plus"                  },
              { action: "Min Thu Aung bought",      product: "Canva Pro 1 Year"               },
              { action: "Kyaw Zin topped up",       product: "Mobile Legends 706 Diamonds"    },
              { action: "Hsu Htet Shin purchased",  product: "Netflix Premium 1 Month"        },
              { action: "Hein Htet bought",         product: "Spotify Premium"                },
              { action: "Zaw secured",              product: "NordVPN 1 Year"                 },
              { action: "Thida upgraded to",        product: "ChatGPT Plus"                   },
              { action: "Min Thu Aung bought",      product: "Canva Pro 1 Year"               },
              { action: "Kyaw Zin topped up",       product: "Mobile Legends 706 Diamonds"    },
              { action: "Hsu Htet Shin purchased",  product: "Netflix Premium 1 Month"        },
              { action: "Hein Htet bought",         product: "Spotify Premium"                },
              { action: "Zaw secured",              product: "NordVPN 1 Year"                 },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center mr-10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2 flex-shrink-0" />
                <span className="text-white/35 text-xs">{item.action}</span>
                <span className="text-purple-400 font-semibold text-xs ml-1">{item.product}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Browse by Category ── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Browse by Category</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">What are you looking for?</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 w-full">

          {/* AI Tools */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => handleCategoryClick("ai")}
            data-testid="category-card-ai"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">AI Tools</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">AI-powered creative & productivity tools</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Starting From</span>
              <span className="text-xs font-bold text-purple-400 mt-0.5">6,000 KS</span>
            </div>
          </div>

          {/* Editing Software */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => handleCategoryClick("editing")}
            data-testid="category-card-editing"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mb-4">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Editing Software</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">Professional video editing & creation</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Starting From</span>
              <span className="text-xs font-bold text-orange-400 mt-0.5">19,000 KS</span>
            </div>
          </div>

          {/* Music & Streaming */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => handleCategoryClick("music")}
            data-testid="category-card-music"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center mb-4">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Music & Streaming</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">Streaming music, video & entertainment</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Starting From</span>
              <span className="text-xs font-bold text-pink-400 mt-0.5">2,500 KS</span>
            </div>
          </div>

          {/* Telegram */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => handleCategoryClick("telegram")}
            data-testid="category-card-telegram"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Telegram</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">Telegram Premium subscriptions</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Pricing</span>
              <span className="text-xs font-bold text-blue-400 mt-0.5">Coming Soon</span>
            </div>
          </div>

          {/* VPN */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] transition-colors"
            onClick={() => handleCategoryClick("vpn")}
            data-testid="category-card-vpn"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">VPN</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">Secure browsing & online privacy</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Pricing</span>
              <span className="text-xs font-bold text-teal-400 mt-0.5">Coming Soon</span>
            </div>
          </div>

          {/* Gaming Coins */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] hover:border-yellow-500/30 transition-colors"
            data-testid="category-card-gaming"
            onClick={() => handleCategoryClick("gaming")}
          >
            <div className="w-12 h-12 rounded-2xl bg-yellow-500 flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Gaming Coins</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">In-game currency and top-ups</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Starting From</span>
              <span className="text-xs font-bold text-yellow-400 mt-0.5">3,500 KS</span>
            </div>
          </div>

          {/* Education */}
          <div
            className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:bg-white/[0.04] hover:border-sky-500/30 transition-colors"
            data-testid="category-card-education"
            onClick={() => handleCategoryClick("education")}
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Education</p>
            <p className="text-xs text-gray-500 mb-auto pb-4">Language learning and online courses</p>
            <div className="w-full bg-white/5 rounded-xl py-2 flex flex-col items-center mt-auto">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Starting From</span>
              <span className="text-xs font-bold text-sky-400 mt-0.5">5,000 KS</span>
            </div>
          </div>

        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="sticky top-16 z-40 bg-[#080810]/90 backdrop-blur-xl border-b border-white/5 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">

          {/* Search Bar */}
          <div
            className="flex items-center gap-3 w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-5 transition-all duration-200 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/10 focus-within:shadow-[0_0_18px_0_rgba(139,92,246,0.15)]"
            data-testid="search-bar-container"
          >
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for CapCut, Spotify, Adobe..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 focus:outline-none min-w-0"
              data-testid="input-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-150 ease-out active:scale-95"
                data-testid="button-search-clear"
              >
                <X className="w-3 h-3 text-white/50" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5" data-testid="category-filter-bar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                data-testid={`category-btn-${cat.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out flex-shrink-0 border active:scale-95 ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg ${cat.glow}`
                    : "bg-white/[0.04] text-white/50 border-white/8 hover:bg-white/[0.08] hover:text-white/80"
                }`}
              >
                <span className={activeCategory === cat.id ? "text-white" : cat.neon}>
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsRef} className="py-6 pb-12 px-4 sm:px-6 lg:px-8 scroll-mt-48">
        <div className="max-w-7xl mx-auto">

          {/* Trending Packs header — shown in All view only */}
          {activeCategory === "all" && !q && (
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">🔥 Trending Packs</h2>
            </div>
          )}

          {/* Active category header */}
          {activeCategory !== "all" && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-white`}>
                  {activeCat.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{activeCat.label}</h2>
                  <p className="text-white/40 text-sm">{activeCat.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* All categories grouped view */}
          {activeCategory === "all" && groupedByCategory && (
            <div className="space-y-14">
              {groupedByCategory.map(({ cat, items, filteredApps }) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{cat.label}</h2>
                        <p className="text-white/35 text-xs">{cat.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`text-xs font-medium ${cat.neon} hover:opacity-80 transition-opacity flex items-center gap-1`}
                      data-testid={`see-all-${cat.id}`}
                    >
                      See all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {filteredApps.length > 0 ? (
                    <MatteAppGrid
                      apps={filteredApps}
                      onSelect={app => openProductModal(app, cat.id)}
                    />
                  ) : items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                      {items.map(product => (
                        <MatteProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Single category filtered view — matte product cards */}
          {activeCategory !== "all" && activeCategory !== "ai" && activeCategory !== "music" && activeCategory !== "editing" && activeCategory !== "telegram" && activeCategory !== "vpn" && activeCategory !== "gaming" && activeCategory !== "education" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {filteredProducts.map(product => (
                <MatteProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          )}

          {/* Telegram Premium — matte card grid */}
          {activeCategory === "telegram" && (
            <MatteAppGrid
              apps={filteredTelegramApps}
              onSelect={app => openProductModal(app, "telegram")}
            />
          )}

          {/* Editing Software — matte card grid */}
          {activeCategory === "editing" && (
            <MatteAppGrid
              apps={filteredEditingApps}
              onSelect={app => openProductModal(app, "editing")}
            />
          )}

          {/* Music & Streaming — matte card grid + remaining product cards */}
          {activeCategory === "music" && (
            <div className="space-y-6">
              <MatteAppGrid
                apps={filteredMusicApps}
                onSelect={app => openProductModal(app, "music")}
              />
              {filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {filteredProducts.map(product => (
                    <MatteProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI category — matte card grid */}
          {activeCategory === "ai" && (
            <MatteAppGrid
              apps={filteredAIApps}
              onSelect={app => openProductModal(app, "ai")}
            />
          )}

          {/* VPN — matte card grid + remaining coming-soon cards */}
          {activeCategory === "vpn" && (
            <div className="space-y-6">
              <MatteAppGrid
                apps={filteredVpnApps}
                onSelect={app => openProductModal(app, "vpn")}
              />
              {filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {filteredProducts.map(product => (
                    <MatteProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gaming Coins — matte card grid */}
          {activeCategory === "gaming" && (
            <MatteAppGrid
              apps={filteredGamingApps}
              onSelect={app => openProductModal(app, "gaming")}
            />
          )}

          {/* Education — matte card grid */}
          {activeCategory === "education" && (
            <MatteAppGrid
              apps={filteredEducationApps}
              onSelect={app => openProductModal(app, "education")}
            />
          )}
        </div>
      </section>

      {/* Payment Details */}
      <section id="payment-section" className="py-16 px-4 sm:px-6 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
          <p className="text-white/40 text-sm mb-8">Transfer to one of these accounts, then submit your order</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* KBZPay */}
            <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-300 hover:shadow-lg" data-testid="payment-kbzpay">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="font-semibold text-white">KBZPay</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/30 text-xs mb-1">Phone Number</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("09892246556"); toast({ title: "Copied!", description: "09892246556 copied to clipboard" }); }}
                    className="flex items-center gap-2 group"
                    data-testid="copy-kbzpay-number"
                  >
                    <span className="text-white font-mono font-medium">09892246556</span>
                    <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Account Name</p>
                  <p className="text-white font-medium">AungNaingOo</p>
                </div>
              </div>
            </div>

            {/* WavePay */}
            <div className="bg-blue-950/20 border border-blue-800/30 rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-300 hover:shadow-lg" data-testid="payment-wavepay">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
                <span className="font-semibold text-white">WavePay</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/30 text-xs mb-1">Phone Number</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("09442988204"); toast({ title: "Copied!", description: "09442988204 copied to clipboard" }); }}
                    className="flex items-center gap-2 group"
                    data-testid="copy-wavepay-number"
                  >
                    <span className="text-white font-mono font-medium">09442988204</span>
                    <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Account Name</p>
                  <p className="text-white font-medium">AungNaingOo</p>
                </div>
              </div>
            </div>

            {/* UABPay */}
            <div className="bg-teal-950/20 border border-teal-500/30 rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-300 hover:shadow-lg" data-testid="payment-uabpay">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">U</span>
                </div>
                <span className="font-semibold text-white">UABPay</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/30 text-xs mb-1">Phone Number</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("09442988204"); toast({ title: "Copied!", description: "09442988204 copied to clipboard" }); }}
                    className="flex items-center gap-2 group"
                    data-testid="copy-uabpay-number"
                  >
                    <span className="text-white font-mono font-medium">09442988204</span>
                    <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-teal-400 transition-colors" />
                  </button>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Account Name</p>
                  <p className="text-white font-medium">AungNaingOo</p>
                </div>
              </div>
            </div>

            {/* Binance */}
            <div className="bg-[#FCD535]/5 border border-[#FCD535]/25 rounded-2xl p-6 text-left hover:scale-[1.02] transition-all duration-300 hover:shadow-lg" data-testid="payment-binance">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#FCD535] flex items-center justify-center">
                  <SiBinance className="w-4 h-4 text-[#1E1E2E]" />
                </div>
                <span className="font-semibold text-white">Binance</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/30 text-xs mb-1">UID</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("979804957"); toast({ title: "Copied!", description: "Binance UID copied to clipboard" }); }}
                    className="flex items-center gap-2 group"
                    data-testid="copy-binance-uid"
                  >
                    <span className="text-white font-mono font-medium">979804957</span>
                    <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-[#FCD535] transition-colors" />
                  </button>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Account Name</p>
                  <p className="text-white font-medium">PuriStep</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How to Order */}
      <section id="how-to-buy-section" className="py-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-2">Simple process</p>
            <h2 className="text-2xl font-bold mb-2">How to Buy</h2>
            <p className="text-white/40 text-sm">အဆင့် (၃) ဆင့်ဖြင့် လွယ်ကူစွာ ဝယ်ယူနိုင်ပါသည်</p>
          </div>

          {/* Timeline wrapper */}
          <div className="relative grid grid-cols-1 gap-5">
            {/* Vertical connecting line */}
            <div className="absolute left-[35px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-teal-500/40 via-violet-500/40 to-fuchsia-500/40 -z-0 pointer-events-none" />

            {[
              { step: "01", icon: <Play className="w-5 h-5" />,       title: "မိမိနှစ်သက်ရာ Plan ကိုရွေးပါ",       desc: "မိမိဝယ်ယူလိုသော Subscription ကိုရွေးချယ်ပြီး Buy Now ကိုနှိပ်ပါ။",                                                     color: "bg-teal-950/60 border-teal-500/25 text-teal-400"     },
              { step: "02", icon: <Zap className="w-5 h-5" />,        title: "ငွေပေးချေပါ",                          desc: "KBZPay (သို့) WavePay ဖြင့် ငွေပေးချေပြီး screenshot မှတ်ယူထားပါ။",                                                   color: "bg-violet-950/60 border-violet-500/25 text-violet-400" },
              { step: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "ပြေစာပို့ပြီး အကောင့်ရယူပါ",      desc: "Telegram/Messenger အကောင့်နှင့် ငွေလွှဲပြေစာ screenshot ကို payment form တွင် ပေးပို့ပါ။", color: "bg-fuchsia-950/60 border-fuchsia-500/25 text-fuchsia-400" },
            ].map((s, i) => (
              <div
                key={i}
                className={`relative z-10 flex items-start gap-4 bg-[#0B0C10] rounded-2xl p-5 border border-white/[0.07] hover:bg-white/[0.04] transition-all duration-300 animate-fade-in-up stagger-${i + 1}`}
              >
                {/* Icon — positioned so the timeline line threads through its center */}
                <div className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  {s.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="font-semibold text-white mb-1 leading-snug">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Creators / Testimonials */}
      <section data-testid="testimonial-section" className="py-14 px-4 sm:px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-2">What our users say</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Trusted by Creators</h2>
          </div>

          {/* Testimonial cards */}
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:gap-6 md:overflow-visible gap-4">
            {[
              {
                name: "Aung Ko Ko",
                handle: "@aungkoko.mm",
                avatarSrc: "https://api.dicebear.com/9.x/micah/svg?seed=Aung&backgroundColor=transparent",
                text: "KBZPay payment was confirmed in under 2 minutes. My ChatGPT Plus was active immediately. Best service I've used!",
              },
              {
                name: "Thida Myint",
                handle: "@thida.creates",
                avatarSrc: "https://api.dicebear.com/9.x/micah/svg?seed=Thida&backgroundColor=transparent",
                text: "Canva Pro at 20,000 KS for 2 years is unreal. The team responded on Telegram instantly whenever I needed help.",
              },
              {
                name: "Min Thu",
                handle: "@minthu.dev",
                avatarSrc: "https://api.dicebear.com/9.x/micah/svg?seed=MinThu&backgroundColor=transparent",
                text: "Used WavePay to buy Gemini Pro. Got access in minutes. The local support is what makes PuriStep stand out.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`min-w-[85vw] snap-center md:min-w-0 md:w-full bg-[#121212] rounded-2xl p-5 border border-white/[0.06] transition-all duration-200 animate-fade-in-up stagger-${i + 2}`}
                data-testid={`testimonial-card-${i}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={t.avatarSrc}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0 bg-transparent"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-white/35 text-xs">{t.handle}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-white/55 text-sm leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center bg-white/[0.01]">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm">Puri<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Step</span></span>
        </div>
        <p className="text-white/20 text-xs">© 2025 PuriStep. Myanmar's Premium Digital Subscription Reseller.</p>
      </footer>

      {/* ── Contact Admin FAB ── */}
      <div
        className={`fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300 ${
          fabVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Popup options */}
        <div
          className={`flex flex-col gap-3 mb-1 origin-bottom transition-all duration-200 ${
            fabOpen ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"
          }`}
        >
          <a
            href="https://t.me/PuriStep"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#2AABEE] hover:bg-[#2298D6] text-white px-4 py-3 rounded-2xl shadow-lg transition-colors"
            data-testid="fab-telegram"
          >
            <SiTelegram className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm">Telegram</span>
          </a>
          <a
            href="https://m.me/PuriStep"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#0084FF] hover:bg-[#0073E6] text-white px-4 py-3 rounded-2xl shadow-lg transition-colors"
            data-testid="fab-messenger"
          >
            <SiMessenger className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-sm">Messenger</span>
          </a>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setFabOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_10px_40px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-white"
          data-testid="fab-toggle"
          aria-label="Contact admin"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Order Dialog */}
      <Dialog
        open={orderOpen}
        onOpenChange={(open) => {
          setOrderOpen(open);
          if (!open) { setOrderSuccess(false); form.reset(); setPreviewImg(null); selectedFileRef.current = null; setOrderId(""); setMlbbUserId(""); setMlbbServerId(""); setOrderIdCopied(false); setShowChatOptions(false); }
        }}
      >
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden max-h-[90dvh] flex flex-col">
          {orderSuccess ? (
            <div className="p-8 text-center">
              {/* Success icon */}
              <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Submitted!</h3>
              <p className="text-white/40 text-sm mb-4">
                We've received your order for{" "}
                <span className="text-white font-medium">{selectedProduct?.serviceName} {selectedProduct?.planName}</span>.
              </p>

              {/* Clickable Order ID box — copies on tap */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(orderId).then(() => {
                    setOrderIdCopied(true);
                    setTimeout(() => setOrderIdCopied(false), 2000);
                  });
                }}
                className="w-full my-4 p-4 rounded-xl border border-teal-500/50 bg-teal-950/20 backdrop-blur-sm hover:bg-teal-900/25 active:scale-[0.98] transition-all duration-150 cursor-pointer group"
                data-testid="button-copy-order-id"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                  Your Order ID
                  <Copy className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
                </p>
                <p className="text-teal-400 font-black text-2xl tracking-[0.2em] font-mono" data-testid="text-order-id">
                  {orderId}
                </p>
                <p className={`text-xs mt-1.5 transition-all duration-200 ${orderIdCopied ? "text-green-400" : "text-white/20"}`}>
                  {orderIdCopied ? "✓ Copied!" : "Tap to copy"}
                </p>
              </button>

              {/* Burmese instruction */}
              <p className="text-amber-400/80 text-xs leading-relaxed mb-6">
                ကျေးဇူးပြု၍ မိမိ order id ကို Admin ထံသို့ပို့ပေးပြီး Subscription ကို ရယူနိုင်ပါပြီ
              </p>

              {/* Chat options (revealed after clicking Get your order) */}
              <div
                className={`flex flex-col gap-3 mb-3 origin-bottom transition-all duration-200 ${
                  showChatOptions ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none h-0 mb-0 overflow-hidden"
                }`}
              >
                <a
                  href={`https://t.me/PuriStep?text=${encodeURIComponent("Hello Admin, I have submitted my order. My Order ID is: " + orderId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#2AABEE] hover:bg-[#2298D6] text-white px-4 py-3 rounded-2xl shadow-lg transition-colors font-bold text-sm active:scale-95"
                  data-testid="button-success-telegram"
                >
                  <SiTelegram className="w-5 h-5" />
                  Telegram
                </a>
                <a
                  href="https://m.me/PuriStep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#0084FF] hover:bg-[#0073E6] text-white px-4 py-3 rounded-2xl shadow-lg transition-colors font-bold text-sm active:scale-95"
                  data-testid="button-success-messenger"
                >
                  <SiMessenger className="w-5 h-5" />
                  Messenger
                </a>
              </div>

              {/* Primary CTA */}
              {!showChatOptions && (
                <Button
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 w-full active:scale-95 transition-all duration-150 ease-out font-bold"
                  onClick={() => setShowChatOptions(true)}
                  data-testid="button-get-order"
                >
                  Get your order
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {selectedProduct?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-base font-semibold text-white leading-tight">
                      {selectedProduct?.serviceName} — {selectedProduct?.planName}
                    </DialogTitle>
                    <DialogDescription className="text-violet-400 font-bold text-lg mt-0.5">
                      {selectedProduct?.price}
                      <span className="text-white/30 text-sm font-normal ml-1">/ {selectedProduct?.duration}</span>
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactPlatform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-wide">Contact via</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-violet-500" data-testid="select-contact-platform">
                                <SelectValue placeholder="Choose platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#13131f] border-white/10 text-white">
                              <SelectItem value="Telegram">Telegram</SelectItem>
                              <SelectItem value="Messenger">Messenger</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-wide">Your Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="@username or profile name"
                              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-violet-500"
                              data-testid="input-contact-username"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/60 text-xs uppercase tracking-wide">Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-violet-500" data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#13131f] border-white/10 text-white">
                              <SelectItem value="KBZPay">KBZPay</SelectItem>
                              <SelectItem value="WavePay">WavePay</SelectItem>
                              <SelectItem value="AYAPay">AYAPay</SelectItem>
                              <SelectItem value="UABPay">UABPay</SelectItem>
                              <SelectItem value="Binance">Binance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* MLBB — Game ID fields */}
                    {selectedProduct?.serviceName === "Mobile Legends" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider block">User ID</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={mlbbUserId}
                            onChange={e => setMlbbUserId(e.target.value)}
                            placeholder="e.g., 12345678"
                            className="w-full bg-[#13151A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-colors"
                            data-testid="input-mlbb-user-id"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider block">Server ID</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={mlbbServerId}
                            onChange={e => setMlbbServerId(e.target.value)}
                            placeholder="e.g., (1234)"
                            className="w-full bg-[#13151A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-colors"
                            data-testid="input-mlbb-server-id"
                          />
                        </div>
                      </div>
                    )}

                    {/* Dynamic payment info box */}
                    {activePaymentInfo && (
                      <div className={`rounded-xl border ${paymentBorderCls} bg-white/[0.03] backdrop-blur-sm p-4`}>
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Send payment to</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white/40 text-xs flex-shrink-0">{activePaymentInfo.label}:</span>
                              <span className={`font-mono font-bold text-sm ${paymentTextCls} truncate`} data-testid="text-payment-value">{activePaymentInfo.value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activePaymentInfo.value);
                                toast({ title: "Copied!", description: `${activePaymentInfo.label} copied to clipboard` });
                              }}
                              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                              data-testid="button-copy-payment"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-xs">Name:</span>
                            <span className="text-white/70 text-sm font-medium">{activePaymentInfo.name}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs uppercase tracking-wide block">Payment Screenshot</label>
                      {previewImg ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                          <img src={previewImg} alt="Payment screenshot" className="w-full h-40 object-cover" data-testid="img-screenshot-preview" />
                          <button
                            type="button"
                            onClick={() => { setPreviewImg(null); selectedFileRef.current = null; }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                            data-testid="button-remove-screenshot"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
                          data-testid="label-upload-screenshot"
                        >
                          <Upload className="w-5 h-5 text-white/30" />
                          <span className="text-white/30 text-xs">Upload screenshot (max 5MB)</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} data-testid="input-screenshot-file" />
                        </label>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border-0 h-11 font-semibold mt-2"
                      data-testid="button-submit-order"
                    >
                      {mutation.isPending ? "Sending..." : "Submit Order"}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-sm w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-white">Need Help?</DialogTitle>
                <DialogDescription className="text-white/40 text-xs">Contact us via your preferred platform</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <a
              href="https://t.me/digitalpacks_vol2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 hover:bg-blue-950/50 hover:border-blue-500/40 transition-all group"
              data-testid="link-help-telegram"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <SiTelegram className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">Telegram</p>
                <p className="text-blue-400 text-xs">@digitalpacks_vol2</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors flex-shrink-0" />
            </a>
            <a
              href="https://m.me/digitalpacks.vol2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-violet-950/30 border border-violet-500/20 hover:bg-violet-950/50 hover:border-violet-500/40 transition-all group"
              data-testid="link-help-messenger"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">Messenger</p>
                <p className="text-violet-400 text-xs">@digitalpacks.vol2</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-violet-400 transition-colors flex-shrink-0" />
            </a>
            <p className="text-white/20 text-xs text-center pt-1">We typically respond within a few minutes</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Universal Product Modal */}
      <ProductModal
        app={productModalApp}
        categoryId={productModalCategoryId}
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onBuyNow={handleAppPlanBuyNow}
      />
    </div>
  );
}

function AIAccordion({
  apps,
  onSelect,
}: {
  apps: AIApp[];
  onSelect: (app: AIApp) => void;
}) {
  return (
    <div className="space-y-3">
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => onSelect(app)}
          className={`w-full rounded-2xl border backdrop-blur-md transition-all duration-150 ease-out overflow-hidden
            border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.14] active:scale-95 text-left`}
          style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.2)" }}
          data-testid={`accordion-${app.id}`}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-11 h-11 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center flex-shrink-0">
              {app.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-base leading-tight">{app.name}</h3>
                {app.plans.length > 1 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/40">
                    {app.plans.length} plans
                  </span>
                )}
              </div>
              <p className="text-white/35 text-xs mt-0.5">{app.tagline}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-semibold hidden sm:block ${app.neon}`}>{app.startingFrom}</span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function MatteAppGrid({
  apps,
  onSelect,
}: {
  apps: AIApp[];
  onSelect: (app: AIApp) => void;
}) {
  if (!apps.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => !app.comingSoon && onSelect(app)}
          disabled={app.comingSoon}
          className={`bg-[#121212] rounded-2xl border border-white/5 p-4 flex flex-col min-h-[160px] text-left w-full transition-transform duration-150 ease-out relative
            ${app.comingSoon
              ? "opacity-75 cursor-not-allowed"
              : "cursor-pointer active:scale-95 hover:border-white/[0.12] hover:bg-[#181818]"
            }`}
          data-testid={`card-${app.id}`}
        >
          {/* Coming Soon badge */}
          {app.comingSoon && (
            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider absolute top-3 right-3">
              Soon
            </span>
          )}

          {/* Icon top-left */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mb-3 ${app.comingSoon ? "bg-white/[0.04] border border-white/[0.06]" : "bg-[#0a0a0a] border border-white/10"}`}>
            {app.icon}
          </div>

          {/* Name */}
          <p className={`text-sm font-semibold leading-tight ${app.comingSoon ? "text-white/50" : "text-white"}`}>{app.name}</p>
          {app.comingSoon && (
            <p className="text-[10px] text-white/25 mt-0.5 leading-tight">{app.tagline}</p>
          )}

          {/* Pricing bottom */}
          <div className="mt-auto pt-3 flex items-end justify-between w-full">
            {app.comingSoon ? (
              <div className="w-full">
                <div className="w-full bg-white/[0.04] text-white/25 cursor-not-allowed py-1.5 rounded-lg text-[10px] font-semibold border border-white/[0.06] flex items-center justify-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Currently Unavailable
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider leading-none mb-0.5">Starting from</p>
                  <p className="text-xs font-bold text-white leading-tight">{app.startingFrom}</p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5 text-white/50" />
                </div>
              </>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function MatteProductCard({ product, onBuyNow }: { product: Product; onBuyNow: (p: Product) => void }) {
  return (
    <button
      onClick={() => !product.comingSoon && onBuyNow(product)}
      disabled={product.comingSoon}
      className={`bg-[#121212] rounded-2xl border border-white/5 p-4 flex flex-col min-h-[160px] text-left w-full transition-transform duration-150 ease-out relative ${product.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95 hover:border-white/[0.12] hover:bg-[#181818]"}`}
      data-testid={`card-product-${product.id}`}
    >
      {/* Icon top-left */}
      <div className="w-11 h-11 rounded-xl bg-white/[0.07] flex items-center justify-center flex-shrink-0 mb-3">
        {product.icon}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-white leading-tight">{product.serviceName}</p>

      {/* Pricing bottom */}
      <div className="mt-auto pt-3 flex items-end justify-between w-full">
        {product.comingSoon ? (
          <>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider leading-none mb-0.5">Pricing</p>
              <p className="text-xs font-bold text-white/30 leading-tight">Coming Soon</p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-white/20" />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider leading-none mb-0.5">Starting from</p>
              <p className="text-xs font-bold text-white leading-tight">{product.price}</p>
            </div>
            <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <Plus className="w-3.5 h-3.5 text-white/50" />
            </div>
          </>
        )}
      </div>
    </button>
  );
}

function ProductCard({ product, onBuyNow }: { product: Product; onBuyNow: (p: Product) => void }) {
  return (
    <div
      className={`relative rounded-2xl border backdrop-blur-md flex flex-col gap-4 transition-all duration-300 group p-5
        ${product.comingSoon
          ? "border-white/5 opacity-65 bg-white/[0.02]"
          : "border-white/[0.08] bg-gradient-to-br " + product.cardColor + " hover:border-white/[0.18] hover:scale-[1.02] hover:shadow-xl"
        }`}
      style={!product.comingSoon ? { boxShadow: "0 4px 24px 0 rgba(0,0,0,0.25)" } : undefined}
      data-testid={`card-product-${product.id}`}
    >
      {product.comingSoon && (
        <div className="absolute inset-0 rounded-2xl bg-[#080810]/20 pointer-events-none" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
            {product.icon}
          </div>
          <div>
            <p className="text-white/45 text-xs font-medium">{product.serviceName}</p>
            <h3 className="font-bold text-white text-sm leading-tight">{product.planName}</h3>
          </div>
        </div>
        {product.badge && (
          <Badge
            className={`text-xs px-2 py-0.5 shrink-0 ${product.comingSoon ? "bg-white/10 text-white/40 border-white/10" : "bg-violet-950/80 text-violet-300 border-violet-500/30"}`}
            data-testid={`badge-${product.id}`}
          >
            {product.badge}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-xl font-black ${product.comingSoon ? "text-white/30" : "text-white"}`}>
          {product.price}
        </span>
        {!product.comingSoon && (
          <span className="text-white/30 text-xs">/ {product.duration}</span>
        )}
      </div>

      <ul className="space-y-1.5 flex-1">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-white/55" data-testid={`feature-${product.id}-${i}`}>
            <CheckCircle2 className={`w-3 h-3 shrink-0 ${product.comingSoon ? "text-white/20" : "text-violet-400"}`} />
            {f}
          </li>
        ))}
      </ul>

      {product.comingSoon ? (
        <div className="w-full h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
          <span className="text-white/30 text-xs font-medium">Coming Soon</span>
        </div>
      ) : (
        <Button
          onClick={() => onBuyNow(product)}
          className={`w-full bg-gradient-to-r ${product.gradient} hover:opacity-90 active:scale-95 text-white border-0 font-semibold h-9 text-sm transition-all duration-150 ease-out`}
          data-testid={`button-buy-${product.id}`}
        >
          Buy Now
        </Button>
      )}
    </div>
  );
}

function ProductModal({
  app,
  categoryId,
  open,
  onClose,
  onBuyNow,
}: {
  app: AIApp | null;
  categoryId: string;
  open: boolean;
  onClose: () => void;
  onBuyNow: (app: AIApp, plan: AIPlan) => void;
}) {
  const [spotifyTab, setSpotifyTab] = useState<"individual" | "family">("individual");
  const [mlbbTab, setMlbbTab] = useState<"standard" | "double">("standard");
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<AIPlan | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const openDetailsModal = (plan: AIPlan) => { setSelectedPlanDetails(plan); setIsDetailsModalOpen(true); };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  const isSpotify = app?.id === "spotify-premium";
  const isMLBB = app?.id === "mobile-legends";

  const mlbbStandardPackages = [
    { id: "ml-86",   amount: "86",                   label: "Diamonds",     price: "5,000 KS",   isPass: false },
    { id: "ml-172",  amount: "172",                  label: "Diamonds",     price: "10,000 KS",  isPass: false },
    { id: "ml-257",  amount: "257",                  label: "Diamonds",     price: "14,500 KS",  isPass: false },
    { id: "ml-706",  amount: "706",                  label: "Diamonds",     price: "36,500 KS",  isPass: false },
    { id: "ml-2195", amount: "2,195",                label: "Diamonds",     price: "103,000 KS", isPass: false },
    { id: "ml-3688", amount: "3,688",                label: "Diamonds",     price: "162,000 KS", isPass: false },
    { id: "ml-5532", amount: "5,532",                label: "Diamonds",     price: "258,000 KS", isPass: false },
    { id: "ml-9288", amount: "9,288",                label: "Diamonds",     price: "430,000 KS", isPass: false },
    { id: "ml-wdp",  amount: "Weekly",               label: "Diamond Pass", price: "6,500 KS",   isPass: true  },
    { id: "ml-twi",  amount: "Twilight",             label: "Pass",         price: "30,000 KS",  isPass: true  },
  ];

  const mlbbDoublePackages = [
    { id: "ml2x-100",  amount: "50+50",   label: "Bonus (100 total)",  price: "3,500 KS"  },
    { id: "ml2x-300",  amount: "150+150", label: "Bonus (300 total)",  price: "9,500 KS"  },
    { id: "ml2x-500",  amount: "250+250", label: "Bonus (500 total)",  price: "16,000 KS" },
    { id: "ml2x-1000", amount: "500+500", label: "Bonus (1,000 total)", price: "32,000 KS" },
  ];

  const spotifyIndividualPlans: AIPlan[] = [
    { id: "spotify-individual-1m", name: "Monthly",  price: "14,000 KS", period: "monthly",  features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Listen with friends in real-time"] },
    { id: "spotify-individual-2m", name: "2 Months", price: "26,000 KS", period: "2 months", features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Listen with friends in real-time"] },
    { id: "spotify-individual-3m", name: "3 Months", price: "34,000 KS", period: "3 months", features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Listen with friends in real-time"], badge: "Best Value", badgeStyle: "bg-green-500/20 text-green-300 border-green-500/40", highlight: true },
  ];

  const spotifyFamilyPlans: AIPlan[] = [
    { id: "spotify-family-1m",  name: "Monthly",   price: "8,000 KS",  period: "monthly",   features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Private account in a premium plan"] },
    { id: "spotify-family-2m",  name: "2 Months",  price: "14,000 KS", period: "2 months",  features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Private account in a premium plan"] },
    { id: "spotify-family-3m",  name: "3 Months",  price: "22,000 KS", period: "3 months",  features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Private account in a premium plan"] },
    { id: "spotify-family-6m",  name: "6 Months",  price: "47,000 KS", period: "6 months",  features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Private account in a premium plan"] },
    { id: "spotify-family-12m", name: "12 Months", price: "74,000 KS", period: "12 months", features: ["Ad-free music listening","Download to listen offline","Play songs in any order","High audio quality (320kbps)","Private account in a premium plan"], badge: "Best Value", badgeStyle: "bg-green-500/20 text-green-300 border-green-500/40", highlight: true },
  ];

  const plans: AIPlan[] = isSpotify
    ? (spotifyTab === "individual" ? spotifyIndividualPlans : spotifyFamilyPlans)
    : (app?.plans ?? []);

  const gridCols = plans.length <= 2
    ? "grid-cols-1 sm:grid-cols-2"
    : plans.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <>
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center transition-all duration-300
        ${open ? "backdrop-blur-sm bg-black/70 pointer-events-auto" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      data-testid="product-modal-backdrop"
    >
      <div
        className={`w-full sm:max-w-2xl sm:mx-4 bg-[#0e0e1a] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[88vh] overflow-y-auto transition-all duration-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full
          ${open ? "translate-y-0 sm:scale-100 sm:opacity-100" : "translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"}`}
        onClick={e => e.stopPropagation()}
        data-testid="product-modal"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-[#0e0e1a]/95 backdrop-blur-sm border-b border-white/[0.07] px-5 py-4 flex items-center justify-between">
          {app && (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center`}
                style={{ boxShadow: app.iconGlow ?? "0 2px 8px rgba(0,0,0,0.3)" }}
              >
                {app.icon}
              </div>
              <div>
                <h2 className="font-bold text-white text-base leading-tight">{app.name}</h2>
                <p className="text-white/40 text-xs">{app.tagline}</p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-all duration-150 ease-out active:scale-95 ml-auto flex-shrink-0"
            data-testid="button-product-modal-close"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 pr-2 space-y-5">

          {/* Spotify Individual / Family toggle */}
          {isSpotify && (
            <div className="flex bg-white/[0.04] rounded-xl p-1 border border-white/[0.07]">
              {(["individual", "family"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSpotifyTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ease-out active:scale-95
                    ${spotifyTab === t
                      ? "bg-green-500/15 text-green-300 border border-green-500/25 shadow-sm"
                      : "text-white/35 hover:text-white/65"
                    }`}
                  data-testid={`tab-spotify-${t}`}
                >
                  {t === "individual" ? "Individual" : "Family"}
                </button>
              ))}
            </div>
          )}

          {/* MLBB — Standard / 2x Diamonds tab + square grid */}
          {isMLBB && app && (
            <div className="space-y-5">
              {/* Tab toggle */}
              <div className="flex p-1 bg-[#1a1a1a] rounded-xl w-full max-w-md mx-auto border border-white/[0.06]">
                {(["standard", "double"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setMlbbTab(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ease-out active:scale-95
                      ${mlbbTab === t
                        ? "bg-[#2a2d36] text-white shadow-md"
                        : "text-gray-400 hover:text-white"
                      }`}
                    data-testid={`tab-mlbb-${t}`}
                  >
                    {t === "standard" ? "Standard Diamonds" : "2x Diamonds"}
                  </button>
                ))}
              </div>

              {/* Standard Diamonds grid */}
              {mlbbTab === "standard" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {mlbbStandardPackages.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => {
                        const fakePlan: AIPlan = { id: pkg.id, name: `${pkg.amount} ${pkg.label}`, price: pkg.price, period: "one-time", features: [] };
                        onBuyNow(app, fakePlan);
                      }}
                      className="aspect-square bg-[#121212] border border-white/5 hover:border-cyan-500 hover:bg-white/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center relative group"
                      data-testid={`button-mlbb-pkg-${pkg.id}`}
                    >
                      {/* Diamond icon */}
                      <div className={`mb-1.5 ${pkg.isPass ? "text-purple-400" : "text-cyan-400"} group-hover:scale-110 transition-transform duration-150`}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-60">
                          <path d="M12 2L2 9l10 13L22 9z" />
                        </svg>
                      </div>
                      {/* Amount */}
                      <p className="font-bold text-white text-sm leading-tight">{pkg.amount}</p>
                      <p className="text-white/45 text-[10px] leading-tight mb-2">{pkg.label}</p>
                      {/* Price */}
                      <p className={`font-semibold text-xs ${pkg.isPass ? "text-purple-400" : "text-cyan-400"}`}>{pkg.price}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* 2x Diamonds grid */}
              {mlbbTab === "double" && (
                <div className="space-y-4">
                <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs md:text-sm rounded-xl p-3 text-center font-medium">
                  1 / jan / 2025 မှစ၍ ပထမအကြိမ် recharge အတွက်သာ အကျိုးဝင်သည်။
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {mlbbDoublePackages.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => {
                        const fakePlan: AIPlan = { id: pkg.id, name: `${pkg.amount} ${pkg.label}`, price: pkg.price, period: "one-time", features: [] };
                        onBuyNow(app, fakePlan);
                      }}
                      className="aspect-square bg-[#121212] border border-white/5 hover:border-yellow-400 hover:bg-white/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center relative group"
                      data-testid={`button-mlbb-2x-${pkg.id}`}
                    >
                      {/* Double diamond icon */}
                      <div className="mb-1.5 text-yellow-400 group-hover:scale-110 transition-transform duration-150 relative">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-50 absolute -left-2 top-0.5">
                          <path d="M12 2L2 9l10 13L22 9z" />
                        </svg>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-70 relative">
                          <path d="M12 2L2 9l10 13L22 9z" />
                        </svg>
                      </div>
                      {/* Amount */}
                      <p className="font-bold text-white text-sm leading-tight mt-1">{pkg.amount}</p>
                      <p className="text-white/45 text-[10px] leading-tight mb-2">{pkg.label}</p>
                      {/* Price */}
                      <p className="font-semibold text-xs text-yellow-400">{pkg.price}</p>
                    </button>
                  ))}
                </div>
                </div>
              )}
            </div>
          )}

          {/* Plan cards — hidden for MLBB */}
          {app && !isMLBB && (
            <div className={`grid gap-3 ${gridCols}`}>
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border flex flex-col gap-3 overflow-hidden p-4 transition-all duration-200 backdrop-blur-sm hover:scale-[1.02]
                    ${plan.highlight
                      ? `border-white/[0.18] bg-white/[0.06] hover:border-white/[0.28] hover:shadow-xl ${app.accentGlow}`
                      : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.14]"
                    }`}
                  data-testid={`card-product-plan-${plan.id}`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  )}

                  {/* Plan name + badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white/35 text-[10px] font-medium uppercase tracking-wide mb-0.5">
                        {isSpotify ? `Spotify ${spotifyTab === "individual" ? "Individual" : "Family"}` : app.name}
                      </p>
                      <h4 className="font-bold text-white text-sm leading-tight">{plan.name}</h4>
                    </div>
                    {plan.badge && (
                      <Badge
                        className={`text-[10px] px-1.5 py-0.5 shrink-0 border font-semibold ${plan.badgeStyle}`}
                        data-testid={`badge-plan-${plan.id}`}
                      >
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-white">{plan.price}</span>
                    <span className="text-white/30 text-xs">/ {plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${app.neon}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA row */}
                  <div className="flex gap-2 w-full mt-auto">
                    <Button
                      onClick={() => onBuyNow(app, plan)}
                      className={`flex-1 bg-gradient-to-r ${app.iconBg} hover:opacity-90 active:scale-95 text-white border-0 font-semibold h-8 text-xs transition-all duration-150 ease-out`}
                      data-testid={`button-buy-plan-${plan.id}`}
                    >
                      {plan.buttonLabel ?? "Buy Now"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => openDetailsModal(plan)}
                      className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] hover:border-white/20 active:scale-95 transition-all duration-150 flex items-center justify-center flex-shrink-0"
                      data-testid={`button-details-plan-${plan.id}`}
                      aria-label="Plan details"
                    >
                      <Info className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ── Plan Details Modal ── */}
    {isDetailsModalOpen && selectedPlanDetails && (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setIsDetailsModalOpen(false)}
        data-testid="details-modal-backdrop"
      >
        <div
          className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-md relative animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsDetailsModalOpen(false)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center transition-colors"
            data-testid="button-close-details"
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>

          {/* Plan name */}
          <h3 className="text-base font-bold text-white pr-8 leading-tight">{selectedPlanDetails.name}</h3>
          <p className="text-white/35 text-xs mt-0.5">{selectedPlanDetails.period} plan · {selectedPlanDetails.price}</p>

          {/* Badge */}
          {selectedPlanDetails.badge && (
            <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${selectedPlanDetails.badgeStyle}`}>
              {selectedPlanDetails.badge}
            </span>
          )}

          {/* Body — custom instructions OR standard features list */}
          {selectedPlanDetails.customInstructions ? (
            <div className="mt-4 text-sm leading-relaxed space-y-4">
              {/* Intro */}
              {(selectedPlanDetails.customInstructions.intro || selectedPlanDetails.customInstructions.introHighlight) && (
                <div>
                  {selectedPlanDetails.customInstructions.intro && (
                    <p className="text-white/70">{selectedPlanDetails.customInstructions.intro}</p>
                  )}
                  {selectedPlanDetails.customInstructions.introHighlight && (
                    <p className="text-green-400 font-medium">{selectedPlanDetails.customInstructions.introHighlight}</p>
                  )}
                </div>
              )}

              {/* What you will get — bullet list */}
              {selectedPlanDetails.customInstructions.whatYouGet && (
                <div>
                  <h4 className="text-white font-semibold mb-2">{selectedPlanDetails.customInstructions.whatYouGetLabel ?? "What you will get?"}</h4>
                  <ul className="space-y-2 list-disc pl-4 marker:text-green-500">
                    {selectedPlanDetails.customInstructions.whatYouGet.map((item, i) => (
                      <li key={i} className="text-white/70">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to use — bullet list (Business Team style) */}
              {selectedPlanDetails.customInstructions.howToUse && (
                <div>
                  <h4 className="text-white font-semibold mb-2">How to use :</h4>
                  <ul className="space-y-2 list-disc pl-4 marker:text-green-500">
                    {selectedPlanDetails.customInstructions.howToUse.map((step, i) => (
                      <li key={i} className="text-white/70">{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to use — plain text (Individual style) */}
              {selectedPlanDetails.customInstructions.howToUseText && (
                <div>
                  <h4 className="text-white font-semibold mb-2">How to use :</h4>
                  <p className="text-white/70">{selectedPlanDetails.customInstructions.howToUseText}</p>
                </div>
              )}

              {/* Warranty */}
              {selectedPlanDetails.customInstructions.warranty && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Warranty:</h4>
                  <p className="text-green-400 font-medium">{selectedPlanDetails.customInstructions.warranty}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2">What's included</p>
              {selectedPlanDetails.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Got it */}
          <button
            type="button"
            onClick={() => setIsDetailsModalOpen(false)}
            className="mt-6 w-full py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all duration-150 active:scale-[0.98]"
            data-testid="button-got-it"
          >
            Got it
          </button>
        </div>
      </div>
    )}
    </>
  );
}
