import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Shield,
  Zap,
  Headphones,
  Star,
  Upload,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Users,
  Brain,
  Scissors,
  Music2,
  Send,
  Lock,
  Play,
  Tag,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  LogIn,
  LogOut,
  Package,
  Clapperboard,
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
  SiGoogle,
} from "react-icons/si";

const orderFormSchema = z.object({
  contactPlatform: z.string().min(1, "Please select a contact platform"),
  contactUsername: z.string().min(1, "Username is required").min(3, "At least 3 characters"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  paymentScreenshot: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type CategoryId = "all" | "ai" | "editing" | "music" | "telegram" | "vpn";

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
    startingFrom: null,
    productCount: 2,
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
}

interface AIApp {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  iconBg: string;
  accentBorder: string;
  accentGlow: string;
  neon: string;
  startingFrom: string;
  plans: AIPlan[];
}

const aiApps: AIApp[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    tagline: "OpenAI's flagship AI assistant",
    icon: <SiOpenai className="w-6 h-6 text-white" />,
    iconBg: "from-emerald-600 to-green-700",
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
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    tagline: "Google's most capable AI model",
    icon: <SiGooglegemini className="w-6 h-6 text-white" />,
    iconBg: "from-blue-500 to-indigo-600",
    accentBorder: "border-blue-500/25 hover:border-blue-400/50",
    accentGlow: "shadow-blue-500/10",
    neon: "text-blue-400",
    startingFrom: "From 25,000 KS",
    plans: [
      {
        id: "gemini-3month",
        name: "3 Months",
        price: "25,000 KS",
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
      },
      {
        id: "gemini-annual",
        name: "Annual",
        price: "45,000 KS",
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
      },
    ],
  },
  {
    id: "claude",
    name: "Claude Pro",
    tagline: "Anthropic's thoughtful AI assistant",
    icon: <SiAnthropic className="w-6 h-6 text-white" />,
    iconBg: "from-orange-500 to-amber-600",
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
    iconBg: "from-teal-500 to-cyan-600",
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
    icon: (
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
        <span className="text-white text-[9px] font-black tracking-tighter">KL</span>
      </div>
    ),
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
    icon: (
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center">
        <span className="text-white text-[9px] font-black tracking-tighter">PX</span>
      </div>
    ),
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
    icon: (
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
        <span className="text-white text-[9px] font-black tracking-tighter">LN</span>
      </div>
    ),
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
];

const editingApps: AIApp[] = [
  {
    id: "capcut",
    name: "CapCut",
    tagline: "Professional video editing & creation",
    icon: <Scissors className="w-6 h-6 text-white" />,
    iconBg: "from-amber-500 to-orange-600",
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
    icon: (
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center">
        <span className="text-white text-[9px] font-black tracking-tighter">Cc</span>
      </div>
    ),
    iconBg: "from-red-500 to-rose-700",
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

  // --- Music & Streaming (non-Netflix; Netflix is in the accordion) ---
  {
    id: "youtube-family",
    categoryId: "music",
    serviceName: "YouTube Premium",
    planName: "Family Plan",
    price: "4,500 MMK",
    duration: "1 Month",
    features: ["Ad-free YouTube", "YouTube Music", "Up to 6 members", "Background play", "Offline downloads"],
    cardColor: "from-rose-900/40 to-red-950/60",
    gradient: "from-rose-500 to-red-700",
    icon: <SiYoutube className="w-7 h-7 text-rose-500" />,
    badge: "Family",
  },
  {
    id: "youtube-individual",
    categoryId: "music",
    serviceName: "YouTube Premium",
    planName: "Individual",
    price: "2,500 MMK",
    duration: "1 Month",
    features: ["Ad-free YouTube", "YouTube Music", "Background play", "Offline downloads", "Premium content"],
    cardColor: "from-rose-900/40 to-red-950/60",
    gradient: "from-rose-500 to-red-700",
    icon: <SiYoutube className="w-7 h-7 text-rose-500" />,
  },
  {
    id: "spotify-premium",
    categoryId: "music",
    serviceName: "Spotify",
    planName: "Premium",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["Ad-free music", "Offline downloads", "High quality audio", "Unlimited skips", "All devices"],
    cardColor: "from-green-900/40 to-emerald-950/60",
    gradient: "from-green-500 to-emerald-600",
    icon: <SiSpotify className="w-7 h-7 text-green-400" />,
    badge: "Soon",
    comingSoon: true,
  },
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

  // --- Telegram ---
  {
    id: "telegram-monthly",
    categoryId: "telegram",
    serviceName: "Telegram",
    planName: "Premium Monthly",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["No ads", "4GB file uploads", "Faster downloads", "Exclusive stickers", "Voice-to-text"],
    cardColor: "from-blue-900/40 to-cyan-950/60",
    gradient: "from-blue-500 to-cyan-600",
    icon: <SiTelegram className="w-7 h-7 text-blue-400" />,
    badge: "Soon",
    comingSoon: true,
  },
  {
    id: "telegram-annual",
    categoryId: "telegram",
    serviceName: "Telegram",
    planName: "Premium Annual",
    price: "Coming Soon",
    duration: "1 Year",
    features: ["All monthly perks", "Best price per month", "No ads forever", "Premium badges", "Priority support"],
    cardColor: "from-blue-900/40 to-cyan-950/60",
    gradient: "from-cyan-500 to-blue-600",
    icon: <SiTelegram className="w-7 h-7 text-cyan-400" />,
    badge: "Save More",
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
  {
    id: "expressvpn-monthly",
    categoryId: "vpn",
    serviceName: "ExpressVPN",
    planName: "Standard",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["3,000+ servers", "Lightway protocol", "TrustedServer tech", "Split tunneling", "5 devices"],
    cardColor: "from-red-900/40 to-orange-950/60",
    gradient: "from-red-500 to-orange-600",
    icon: <Lock className="w-7 h-7 text-orange-400" />,
    badge: "Soon",
    comingSoon: true,
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
  UABPay:  { label: "Phone", value: "09892246556", name: "AungNaingOo", color: "border-purple-500/50 text-purple-400" },
  WavePay: { label: "Phone", value: "09963707270", name: "Zarni Aung",  color: "border-teal-500/50 text-teal-400"   },
  AYAPay:  { label: "Phone", value: "09963707270", name: "Zarni Aung",  color: "border-teal-500/50 text-teal-400"   },
  Binance: { label: "UID",   value: "979804957",   name: "Zarni Aung",  color: "border-amber-500/50 text-amber-400" },
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [expandedAIApp, setExpandedAIApp] = useState<string | null>("chatgpt");
  const [expandedMusicApp, setExpandedMusicApp] = useState<string | null>(null);
  const [expandedEditingApp, setExpandedEditingApp] = useState<string | null>("capcut");
  const [orderId, setOrderId] = useState<string>("");

  const { user, loading: authLoading, supabase, signInWithGoogle, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Array<{
    id: string;
    order_id: string;
    product_name: string;
    price: string;
    created_at: string;
  }>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const productsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && signInOpen) setSignInOpen(false);
  }, [user, signInOpen]);

  useEffect(() => {
    if (!ordersOpen || !user || !supabase) return;
    setOrdersLoading(true);
    supabase
      .from("orders")
      .select("id, order_id, product_name, price, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrderHistory(data as typeof orderHistory);
        setOrdersLoading(false);
      });
  }, [ordersOpen, user, supabase]);

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
    mutationFn: (data: OrderFormValues) =>
      apiRequest("POST", "/api/checkout", {
        orderId,
        productName: selectedProduct?.serviceName,
        planName: selectedProduct?.planName,
        price: selectedProduct?.price,
        ...data,
      }),
    onSuccess: async () => {
      setOrderSuccess(true);
      if (user && supabase) {
        await supabase.from("orders").insert({
          order_id: orderId,
          product_name: selectedProduct?.serviceName ?? "",
          price: selectedProduct?.price ?? "",
          user_id: user.id,
        });
      }
    },
    onError: () => toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" }),
  });

  const handleBuyNow = (product: Product) => {
    if (!user) { setSignInOpen(true); return; }
    setSelectedProduct(product);
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImg(base64);
      form.setValue("paymentScreenshot", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAIPlanBuyNow = (app: AIApp, plan: AIPlan) => {
    if (!user) { setSignInOpen(true); return; }
    setSelectedProduct({
      id: plan.id,
      categoryId: "ai",
      serviceName: app.name,
      planName: plan.name,
      price: plan.price,
      duration: plan.period,
      features: plan.features,
      cardColor: "from-fuchsia-900/40 to-violet-950/60",
      gradient: `from-${app.iconBg.split(" ")[0].replace("from-", "")} to-${app.iconBg.split(" ")[1].replace("to-", "")}`,
      icon: app.icon,
    });
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
  };

  const handleMusicPlanBuyNow = (app: AIApp, plan: AIPlan) => {
    if (!user) { setSignInOpen(true); return; }
    setSelectedProduct({
      id: plan.id,
      categoryId: "music",
      serviceName: app.name,
      planName: plan.name,
      price: plan.price,
      duration: plan.period,
      features: plan.features,
      cardColor: "from-red-900/40 to-rose-950/60",
      gradient: `from-${app.iconBg.split(" ")[0].replace("from-", "")} to-${app.iconBg.split(" ")[1].replace("to-", "")}`,
      icon: app.icon,
    });
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
  };

  const handleEditingPlanBuyNow = (app: AIApp, plan: AIPlan) => {
    if (!user) { setSignInOpen(true); return; }
    setSelectedProduct({
      id: plan.id,
      categoryId: "editing",
      serviceName: app.name,
      planName: plan.name,
      price: plan.price,
      duration: plan.period,
      features: plan.features,
      cardColor: "from-amber-900/40 to-orange-950/60",
      gradient: `from-${app.iconBg.split(" ")[0].replace("from-", "")} to-${app.iconBg.split(" ")[1].replace("to-", "")}`,
      icon: app.icon,
    });
    setOrderId(generateOrderId());
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
  };

  const onSubmit = (data: OrderFormValues) => mutation.mutate(data);

  const watchedPaymentMethod = form.watch("paymentMethod");
  const activePaymentInfo = PAYMENT_INFO[watchedPaymentMethod] ?? null;
  const [paymentBorderCls, paymentTextCls] = activePaymentInfo
    ? activePaymentInfo.color.split(" ")
    : ["border-white/10", "text-white"];

  const activeCat = categories.find(c => c.id === activeCategory)!;
  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.categoryId === activeCategory);

  const groupedByCategory = activeCategory === "all"
    ? categories.slice(1).map(cat => ({
        cat,
        items: products.filter(p => p.categoryId === cat.id),
      })).filter(g => g.items.length > 0 || ["ai", "editing", "music"].includes(g.cat.id))
    : null;

  const handleCategoryClick = (catId: CategoryId) => {
    setActiveCategory(catId);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-[#05050f] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05050f]/85 backdrop-blur-xl border-b border-white/[0.06]" style={{ boxShadow: "0 1px 0 0 rgba(139,92,246,0.08), 0 4px 24px 0 rgba(0,0,0,0.4)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            <Button
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white border-0 text-xs font-semibold shadow-md shadow-teal-500/20 transition-all duration-200 hover:scale-[1.03] hidden sm:flex"
              onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-view-products"
            >
              Browse Packs
            </Button>

            {!authLoading && !user && (
              <Button
                size="sm"
                variant="outline"
                className="border-violet-500/40 bg-violet-950/30 hover:bg-violet-900/40 text-violet-300 hover:text-white text-xs font-semibold transition-all gap-1.5"
                onClick={() => setSignInOpen(true)}
                data-testid="button-sign-in"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}

            {!authLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-600 text-white text-[10px] font-bold">
                        {user.email?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white/70 text-xs hidden sm:block max-w-[100px] truncate">{user.email}</span>
                    <ChevronDown className="w-3 h-3 text-white/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-[#0e0e1a] border border-white/10 text-white rounded-xl shadow-xl shadow-black/40"
                >
                  <DropdownMenuItem
                    className="gap-2 text-white/70 hover:text-white focus:text-white cursor-pointer"
                    onClick={() => setOrdersOpen(true)}
                    data-testid="button-my-orders"
                  >
                    <Package className="w-4 h-4 text-violet-400" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    className="gap-2 text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
                    onClick={() => signOut()}
                    data-testid="button-sign-out"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-60 -right-60 w-[700px] h-[700px] bg-violet-700/12 rounded-full blur-[140px]" />
          <div className="absolute top-10 -left-40 w-[500px] h-[500px] bg-cyan-700/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-800/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Trust pill */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/25 bg-teal-950/30 text-teal-400 text-xs font-semibold mb-8 backdrop-blur-sm" data-testid="badge-hero">
            <Star className="w-3 h-3 fill-teal-400 flex-shrink-0" />
            Trusted by 500+ creators in Myanmar
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up stagger-1 text-4xl sm:text-5xl md:text-[3.75rem] font-extrabold tracking-tight mb-6 leading-[1.08]">
            Unlock the World's Best
            <span className="block bg-gradient-to-r from-teal-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent mt-1 pb-1">
              Creative & AI Tools
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up stagger-2 text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Instant delivery, 24/7 local support, and premium subscriptions in Myanmar.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white border-0 px-9 h-13 text-base font-semibold shadow-lg shadow-teal-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-teal-500/40"
              onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-hero-browse"
            >
              Browse Packs <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/12 bg-white/[0.04] backdrop-blur-sm hover:bg-white/[0.09] hover:border-white/25 text-white px-9 h-13 text-base font-semibold transition-all duration-300 hover:scale-[1.03]"
              onClick={() => {
                const paymentSection = document.getElementById("payment-section");
                paymentSection?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="button-hero-howto"
            >
              How to Buy (KBZPay/Wave)
            </Button>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-in-up stagger-4 flex items-center justify-center gap-3 sm:gap-8 mt-14 flex-wrap">
            {[
              { icon: <Users className="w-4 h-4" />, label: "500+ Active Subs", color: "text-teal-400" },
              { icon: <Zap className="w-4 h-4" />, label: "Instant Access", color: "text-violet-400" },
              { icon: <Shield className="w-4 h-4" />, label: "Local Payments", color: "text-cyan-400" },
              { icon: <Headphones className="w-4 h-4" />, label: "24/7 Support", color: "text-fuchsia-400" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-white/45 text-sm">
                <span className={stat.color}>{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Creators / Testimonials */}
      <section className="py-14 px-4 sm:px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4 animate-fade-in-up">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-2">What our users say</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Trusted by Creators</h2>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-in-up stagger-1 flex items-center justify-center gap-3 text-sm text-white/40 my-6 flex-wrap">
            <span className="font-semibold text-teal-400">500+ Active Subs</span>
            <span className="text-white/15">|</span>
            <span className="font-semibold text-cyan-400">Instant Access</span>
            <span className="text-white/15">|</span>
            <span className="font-semibold text-violet-400">Local Payments</span>
          </div>

          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              {
                name: "Aung Ko Ko",
                handle: "@aungkoko.mm",
                avatar: "AK",
                avatarColor: "from-teal-500 to-cyan-600",
                border: "hover:border-teal-500/30",
                glow: "hover:shadow-teal-500/10",
                text: "KBZPay payment was confirmed in under 2 minutes. My ChatGPT Plus was active immediately. Best service I've used!",
              },
              {
                name: "Thida Myint",
                handle: "@thida.creates",
                avatar: "TM",
                avatarColor: "from-violet-500 to-fuchsia-600",
                border: "hover:border-violet-500/30",
                glow: "hover:shadow-violet-500/10",
                text: "Canva Pro at 20,000 KS for 2 years is unreal. The team responded on Telegram instantly whenever I needed help.",
              },
              {
                name: "Min Thu",
                handle: "@minthu.dev",
                avatar: "MT",
                avatarColor: "from-fuchsia-500 to-pink-600",
                border: "hover:border-fuchsia-500/30",
                glow: "hover:shadow-fuchsia-500/10",
                text: "Used WavePay to buy Gemini Pro. Got access in minutes. The local support is what makes PuriStep stand out.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl p-5 border border-white/7 ${t.border} ${t.glow} hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up stagger-${i + 2}`}
                data-testid={`testimonial-card-${i}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{t.avatar}</span>
                  </div>
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

      {/* Category Overview — Main Menu */}
      <section className="py-10 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">Browse by Category</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">What are you looking for?</h2>
          </div>

          {/* 5-card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="category-overview-grid">
            {categories.slice(1).map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                data-testid={`category-card-${cat.id}`}
                className={`group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-white/[0.07] glass-card ${cat.borderHover} hover:bg-white/[0.07] hover:scale-[1.03] transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in-up stagger-${i + 1}`}
                style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
              >
                {/* Glow blob behind icon */}
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 bg-gradient-to-br ${cat.color}`} />

                {/* Icon circle */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <span className="w-8 h-8 flex items-center justify-center">{cat.bigIcon}</span>
                </div>

                {/* Label */}
                <div className="relative z-10">
                  <p className="font-bold text-white text-sm leading-tight mb-1">{cat.label}</p>
                  <p className="text-white/35 text-xs leading-snug hidden sm:block">{cat.description}</p>
                </div>

                {/* Starting price */}
                <div className="relative z-10 mt-auto w-full">
                  {cat.startingFrom ? (
                    <div className={`rounded-xl py-2 px-3 ${cat.glowBg} border border-white/5 backdrop-blur-sm`}>
                      <p className="text-white/35 text-[10px] uppercase tracking-wider">Starting from</p>
                      <p className={`font-bold text-sm ${cat.neon}`}>{cat.startingFrom}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl py-2 px-3 bg-white/[0.04] border border-white/5">
                      <p className="text-white/20 text-[10px] uppercase tracking-wider">Pricing</p>
                      <p className="font-bold text-sm text-white/30">Coming Soon</p>
                    </div>
                  )}
                </div>

                {/* Arrow on hover */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ChevronRight className={`w-4 h-4 ${cat.neon}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="sticky top-16 z-40 bg-[#080810]/90 backdrop-blur-xl border-b border-white/5 py-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5" data-testid="category-filter-bar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                data-testid={`category-btn-${cat.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
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
      <section ref={productsRef} className="py-12 px-4 sm:px-6 scroll-mt-32">
        <div className="max-w-6xl mx-auto">

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
              {groupedByCategory.map(({ cat, items }) => (
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
                  {cat.id === "ai" ? (
                    <AIAccordion
                      apps={aiApps}
                      expandedId={expandedAIApp}
                      onToggle={id => setExpandedAIApp(prev => prev === id ? null : id)}
                      onBuyNow={handleAIPlanBuyNow}
                      onHelp={() => setHelpOpen(true)}
                    />
                  ) : cat.id === "editing" ? (
                    <AIAccordion
                      apps={editingApps}
                      expandedId={expandedEditingApp}
                      onToggle={id => setExpandedEditingApp(prev => prev === id ? null : id)}
                      onBuyNow={handleEditingPlanBuyNow}
                      onHelp={() => setHelpOpen(true)}
                    />
                  ) : cat.id === "music" ? (
                    <div className="space-y-6">
                      <AIAccordion
                        apps={musicApps}
                        expandedId={expandedMusicApp}
                        onToggle={id => setExpandedMusicApp(prev => prev === id ? null : id)}
                        onBuyNow={handleMusicPlanBuyNow}
                        onHelp={() => setHelpOpen(true)}
                      />
                      {items.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map(product => (
                            <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map(product => (
                        <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Single category filtered view — plain product cards */}
          {activeCategory !== "all" && activeCategory !== "ai" && activeCategory !== "music" && activeCategory !== "editing" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          )}

          {/* Editing Software — dedicated accordion view */}
          {activeCategory === "editing" && (
            <AIAccordion
              apps={editingApps}
              expandedId={expandedEditingApp}
              onToggle={id => setExpandedEditingApp(prev => prev === id ? null : id)}
              onBuyNow={handleEditingPlanBuyNow}
              onHelp={() => setHelpOpen(true)}
            />
          )}

          {/* Music & Streaming — accordion + remaining product cards */}
          {activeCategory === "music" && (
            <div className="space-y-6">
              <AIAccordion
                apps={musicApps}
                expandedId={expandedMusicApp}
                onToggle={id => setExpandedMusicApp(prev => prev === id ? null : id)}
                onBuyNow={handleMusicPlanBuyNow}
                onHelp={() => setHelpOpen(true)}
              />
              {filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI category — dedicated accordion view */}
          {activeCategory === "ai" && (
            <AIAccordion
              apps={aiApps}
              expandedId={expandedAIApp}
              onToggle={id => setExpandedAIApp(prev => prev === id ? null : id)}
              onBuyNow={handleAIPlanBuyNow}
              onHelp={() => setHelpOpen(true)}
            />
          )}
        </div>
      </section>

      {/* Payment Details */}
      <section id="payment-section" className="py-16 px-4 sm:px-6 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
          <p className="text-white/40 text-sm mb-8">Transfer to one of these accounts, then submit your order</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "KBZPay", bgClass: "bg-red-950/30 border-red-800/30", dotColor: "bg-red-500", number: "09-XXX-XXX-XXX" },
              { name: "WavePay", bgClass: "bg-blue-950/30 border-blue-800/30", dotColor: "bg-blue-500", number: "09-XXX-XXX-XXX" },
            ].map((p, i) => (
              <div key={i} className={`${p.bgClass} border rounded-2xl p-6 text-left backdrop-blur-md hover:scale-[1.02] transition-all duration-300 hover:shadow-lg`} data-testid={`payment-${p.name.toLowerCase()}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full ${p.dotColor} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{p.name[0]}</span>
                  </div>
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-white/30 text-xs">Phone Number</p>
                    <p className="text-white font-mono font-medium">{p.number}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs">Account Name</p>
                    <p className="text-white font-medium">PuriStep</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-2">Simple process</p>
            <h2 className="text-2xl font-bold mb-2">How to Order</h2>
            <p className="text-white/40 text-sm">Get your subscription in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: "01", icon: <Play className="w-5 h-5" />, title: "Choose a Plan", desc: "Browse our plans and click Buy Now on your preferred subscription.", color: "bg-teal-950/60 border-teal-500/25 text-teal-400" },
              { step: "02", icon: <Zap className="w-5 h-5" />, title: "Make Payment", desc: "Pay via KBZPay or WavePay and take a screenshot of your transaction.", color: "bg-violet-950/60 border-violet-500/25 text-violet-400" },
              { step: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Submit & Receive", desc: "Fill the form with your Telegram/Messenger and upload your payment screenshot.", color: "bg-fuchsia-950/60 border-fuchsia-500/25 text-fuchsia-400" },
            ].map((s, i) => (
              <div key={i} className={`relative glass-card rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.02] transition-all duration-300 border border-white/[0.07] animate-fade-in-up stagger-${i + 1}`}>
                <div className="text-5xl font-black text-white/[0.04] absolute top-4 right-4 leading-none select-none">{s.step}</div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${s.color}`}>
                  {s.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
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

      {/* Order Dialog */}
      <Dialog
        open={orderOpen}
        onOpenChange={(open) => {
          setOrderOpen(open);
          if (!open) { setOrderSuccess(false); form.reset(); setPreviewImg(null); setOrderId(""); }
        }}
      >
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">
          {orderSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Submitted!</h3>
              <p className="text-white/40 text-sm mb-4">
                We've received your order for{" "}
                <span className="text-white font-medium">{selectedProduct?.serviceName} {selectedProduct?.planName}</span>.
              </p>

              {/* Order ID highlighted box */}
              <div className="my-4 p-4 rounded-xl border border-teal-500/50 bg-teal-950/20 backdrop-blur-sm">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1.5">Your Order ID</p>
                <p
                  className="text-teal-400 font-black text-2xl tracking-[0.2em] font-mono"
                  data-testid="text-order-id"
                >
                  {orderId}
                </p>
              </div>

              <p className="text-amber-400/80 text-xs leading-relaxed mb-6">
                Please copy this Order ID and send it to our Admin to receive your product instantly.
              </p>

              <Button
                className="bg-violet-700 hover:bg-violet-600 w-full"
                onClick={() => setOrderOpen(false)}
                data-testid="button-close-success"
              >
                Done
              </Button>
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

              <div className="p-6">
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
                            onClick={() => { setPreviewImg(null); form.setValue("paymentScreenshot", ""); }}
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

      {/* Sign In Modal */}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-sm w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">
          <div className="p-6 pb-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-white">Sign In to PuriStep</DialogTitle>
                <DialogDescription className="text-white/40 text-xs">Sign in to place orders and track your history</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Neon divider accent */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
              <span className="text-white/25 text-xs">Secure login via</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            </div>

            <Button
              className="w-full h-12 bg-white hover:bg-white/90 active:bg-white/80 text-gray-900 font-semibold text-sm border-0 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-black/20 transition-all duration-200 hover:scale-[1.02]"
              disabled={signInLoading}
              onClick={async () => {
                setSignInLoading(true);
                await signInWithGoogle();
                setSignInLoading(false);
              }}
              data-testid="button-sign-in-google"
            >
              {signInLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              ) : (
                <SiGoogle className="w-5 h-5 text-gray-700" />
              )}
              {signInLoading ? "Redirecting..." : "Continue with Google"}
            </Button>

            <p className="text-white/20 text-xs text-center leading-relaxed">
              By signing in, you agree to our terms of service.
              Your data is secured by Google & Supabase.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Orders Modal */}
      <Dialog open={ordersOpen} onOpenChange={setOrdersOpen}>
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">
          <div className="p-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-white">My Orders</DialogTitle>
                <DialogDescription className="text-white/40 text-xs">Your PuriStep order history</DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
                ))}
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No orders yet</p>
                <p className="text-white/25 text-xs mt-1">Your orders will appear here after checkout</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                    data-testid={`order-card-${order.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{order.product_name}</span>
                      <span className="text-violet-400 font-bold text-sm flex-shrink-0">{order.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-mono text-xs">{order.order_id}</span>
                      <span className="text-white/30 text-xs">
                        {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    </div>
  );
}

function AIAccordion({
  apps,
  expandedId,
  onToggle,
  onBuyNow,
  onHelp,
}: {
  apps: AIApp[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onBuyNow: (app: AIApp, plan: AIPlan) => void;
  onHelp: () => void;
}) {
  return (
    <div className="space-y-3">
      {apps.map(app => {
        const isOpen = expandedId === app.id;
        return (
          <div
            key={app.id}
            className={`rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden
              ${isOpen
                ? `${app.accentBorder} bg-gradient-to-br from-white/[0.05] to-white/[0.02]`
                : `border-white/[0.07] bg-white/[0.025] ${app.accentBorder} hover:bg-white/[0.05]`
              }`}
            style={{ boxShadow: isOpen ? "0 8px 32px 0 rgba(0,0,0,0.3)" : "0 4px 16px 0 rgba(0,0,0,0.2)" }}
            data-testid={`accordion-${app.id}`}
          >
            {/* Banner / Title Row — Level 2 */}
            <button
              onClick={() => onToggle(app.id)}
              className="w-full flex items-center gap-4 px-5 py-4 group text-left"
              data-testid={`accordion-toggle-${app.id}`}
            >
              {/* App icon */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {app.icon}
              </div>

              {/* App name + tagline */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-base leading-tight">{app.name}</h3>
                  {app.plans.length > 1 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/8 text-white/40">
                      {app.plans.length} plans
                    </span>
                  )}
                </div>
                <p className="text-white/35 text-xs mt-0.5">{app.tagline}</p>
              </div>

              {/* Starting price + chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-semibold hidden sm:block ${app.neon}`}>{app.startingFrom}</span>
                <div className={`w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                  <ChevronDown className="w-4 h-4 text-white/50" />
                </div>
              </div>
            </button>

            {/* Expandable content — Level 3 pricing cards */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div className="px-4 pb-4">
                  {/* Thin divider */}
                  <div className="h-px bg-white/6 mb-4" />
                  <div className={`grid gap-3 ${app.plans.length === 1 ? "grid-cols-1 max-w-sm" : app.plans.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
                    {app.plans.map(plan => (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border flex flex-col gap-3 overflow-hidden p-4 transition-all duration-200 backdrop-blur-sm hover:scale-[1.02]
                          ${plan.highlight
                            ? `border-white/[0.18] bg-white/[0.06] hover:border-white/[0.28] hover:shadow-xl ${app.accentGlow}`
                            : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.14]"
                          }`}
                        data-testid={`card-ai-${plan.id}`}
                      >
                        {plan.highlight && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        )}

                        {/* Plan name + badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white/35 text-[10px] font-medium uppercase tracking-wide mb-0.5">{app.name}</p>
                            <h4 className="font-bold text-white text-sm leading-tight">{plan.name}</h4>
                          </div>
                          {plan.badge && (
                            <Badge
                              className={`text-[10px] px-1.5 py-0.5 shrink-0 border font-semibold ${plan.badgeStyle}`}
                              data-testid={`badge-ai-${plan.id}`}
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

                        {/* Buttons */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={() => onBuyNow(app, plan)}
                            className={`flex-1 bg-gradient-to-r ${app.iconBg} hover:opacity-90 text-white border-0 font-semibold h-8 text-xs`}
                            data-testid={`button-buy-${plan.id}`}
                          >
                            {plan.buttonLabel ?? "Buy Now"}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={onHelp}
                            className="h-8 w-8 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/40 hover:text-white flex-shrink-0"
                            title="Get help"
                            data-testid={`button-help-${plan.id}`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
          className={`w-full bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white border-0 font-semibold h-9 text-sm`}
          data-testid={`button-buy-${product.id}`}
        >
          Buy Now
        </Button>
      )}
    </div>
  );
}
