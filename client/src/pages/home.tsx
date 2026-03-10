import { useState, useRef } from "react";
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
  Headphones,
  Star,
  Upload,
  X,
  ChevronRight,
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
} from "react-icons/si";

const orderFormSchema = z.object({
  contactPlatform: z.string().min(1, "Please select a contact platform"),
  contactUsername: z.string().min(1, "Username is required").min(3, "At least 3 characters"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  paymentScreenshot: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type CategoryId = "all" | "ai" | "capcut" | "music" | "telegram" | "vpn";

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
    id: "capcut",
    label: "CapCut",
    icon: <Scissors className="w-4 h-4" />,
    bigIcon: <Scissors className="w-8 h-8" />,
    color: "from-orange-500 to-amber-600",
    neon: "text-amber-400",
    glow: "shadow-amber-500/30",
    glowBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
    description: "Professional video editing & creation",
    startingFrom: null,
    productCount: 2,
  },
  {
    id: "music",
    label: "Music & Video",
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

interface ChatGPTPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  badgeStyle?: string;
  highlight?: boolean;
}

const chatGptPlans: ChatGPTPlan[] = [
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
    planName: "Pro",
    price: "15,000 MMK",
    duration: "1 Month",
    features: ["High-quality video generation", "Text-to-video", "5s & 10s video clips", "720p & 1080p output", "Commercial use"],
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

  // --- CapCut ---
  {
    id: "capcut-pro-monthly",
    categoryId: "capcut",
    serviceName: "CapCut",
    planName: "Pro Monthly",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["Remove watermark", "Premium templates", "AI features", "All devices", "Cloud storage 100GB"],
    cardColor: "from-amber-900/40 to-orange-950/60",
    gradient: "from-amber-500 to-orange-600",
    icon: <Scissors className="w-7 h-7 text-amber-400" />,
    badge: "Soon",
    comingSoon: true,
  },
  {
    id: "capcut-pro-annual",
    categoryId: "capcut",
    serviceName: "CapCut",
    planName: "Pro Annual",
    price: "Coming Soon",
    duration: "1 Year",
    features: ["All Pro Monthly perks", "Best value", "Remove watermark", "AI background", "Priority render"],
    cardColor: "from-amber-900/40 to-orange-950/60",
    gradient: "from-orange-500 to-red-600",
    icon: <Scissors className="w-7 h-7 text-orange-400" />,
    badge: "Best Value",
    comingSoon: true,
  },

  // --- Music & Video ---
  {
    id: "netflix-monthly",
    categoryId: "music",
    serviceName: "Netflix",
    planName: "Monthly Account",
    price: "5,000 MMK",
    duration: "1 Month",
    features: ["4K Ultra HD", "Up to 4 screens", "All devices", "Download content", "No ads"],
    cardColor: "from-red-900/40 to-red-950/60",
    gradient: "from-red-600 to-red-800",
    icon: <SiNetflix className="w-7 h-7 text-red-500" />,
    badge: "Best Value",
  },
  {
    id: "netflix-private",
    categoryId: "music",
    serviceName: "Netflix",
    planName: "Private Account",
    price: "12,000 MMK",
    duration: "3 Months",
    features: ["Dedicated profile", "4K Ultra HD", "All devices", "Download content", "Priority support"],
    cardColor: "from-red-900/40 to-red-950/60",
    gradient: "from-red-600 to-red-800",
    icon: <SiNetflix className="w-7 h-7 text-red-500" />,
  },
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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      apiRequest("POST", "/api/orders", {
        productName: selectedProduct?.serviceName,
        planName: selectedProduct?.planName,
        price: selectedProduct?.price,
        ...data,
      }),
    onSuccess: () => setOrderSuccess(true),
    onError: () => toast({ title: "Error", description: "Failed to submit order. Please try again.", variant: "destructive" }),
  });

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
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

  const handleChatGPTBuyNow = (plan: ChatGPTPlan) => {
    setSelectedProduct({
      id: plan.id,
      categoryId: "ai",
      serviceName: "ChatGPT Plus",
      planName: plan.name,
      price: plan.price,
      duration: plan.period,
      features: plan.features,
      cardColor: "from-emerald-900/40 to-green-950/60",
      gradient: "from-emerald-500 to-green-600",
      icon: <SiOpenai className="w-7 h-7 text-emerald-400" />,
    });
    setOrderOpen(true);
    setOrderSuccess(false);
    form.reset();
    setPreviewImg(null);
  };

  const onSubmit = (data: OrderFormValues) => mutation.mutate(data);

  const activeCat = categories.find(c => c.id === activeCategory)!;
  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.categoryId === activeCategory);

  const groupedByCategory = activeCategory === "all"
    ? categories.slice(1).map(cat => ({
        cat,
        items: products.filter(p => p.categoryId === cat.id),
      })).filter(g => g.items.length > 0)
    : null;

  const handleCategoryClick = (catId: CategoryId) => {
    setActiveCategory(catId);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              Digital Packs <span className="text-violet-400">Vol 2</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block">Admin</a>
            <Button
              size="sm"
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs"
              onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-view-products"
            >
              Browse Plans
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-64 h-64 bg-purple-800/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge
            className="mb-5 bg-violet-950/60 text-violet-300 border-violet-500/30 px-4 py-1.5 text-xs font-medium"
            data-testid="badge-hero"
          >
            <Star className="w-3 h-3 mr-1.5 fill-violet-400 text-violet-400" />
            Trusted by 500+ customers in Myanmar
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Premium Digital
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Subscriptions
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            AI tools, music streaming, VPN, Telegram Premium & more — at unbeatable prices. Pay with KBZPay or WavePay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border-0 px-8 h-12 text-base font-semibold shadow-lg shadow-violet-900/40"
              onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-hero-browse"
            >
              Browse Plans <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            {[
              { icon: <Users className="w-4 h-4" />, label: "500+ Customers" },
              { icon: <Clock className="w-4 h-4" />, label: "Instant Delivery" },
              { icon: <Shield className="w-4 h-4" />, label: "100% Guaranteed" },
              { icon: <Headphones className="w-4 h-4" />, label: "24/7 Support" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-white/40 text-sm">
                <span className="text-violet-400">{stat.icon}</span>
                {stat.label}
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

          {/* 5-card grid: 3 top + 2 centered bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="category-overview-grid">
            {categories.slice(1).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                data-testid={`category-card-${cat.id}`}
                className={`group relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-white/8 bg-white/[0.03] ${cat.borderHover} hover:bg-white/[0.06] transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Glow blob behind icon */}
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${cat.color}`} />

                {/* Icon circle */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 32px -4px var(--tw-shadow-color)` }}
                >
                  <span className="w-8 h-8 flex items-center justify-center">{cat.bigIcon}</span>
                </div>

                {/* Label */}
                <div className="relative z-10">
                  <p className="font-bold text-white text-sm leading-tight mb-1">{cat.label}</p>
                  <p className="text-white/40 text-xs leading-snug hidden sm:block">{cat.description}</p>
                </div>

                {/* Starting price */}
                <div className="relative z-10 mt-auto w-full">
                  {cat.startingFrom ? (
                    <div className={`rounded-xl py-2 px-3 ${cat.glowBg} border border-white/5`}>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Starting from</p>
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
                    <div className="space-y-6">
                      <ChatGPTSubSection
                        plans={chatGptPlans}
                        onBuyNow={handleChatGPTBuyNow}
                        onHelp={() => setHelpOpen(true)}
                        compact
                      />
                      {items.length > 0 && (
                        <>
                          <p className="text-white/30 text-xs uppercase tracking-widest font-semibold pt-2">More AI Tools</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(product => (
                              <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                            ))}
                          </div>
                        </>
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

          {/* Single category filtered view */}
          {activeCategory !== "all" && activeCategory !== "ai" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          )}

          {/* AI category — dedicated structured view */}
          {activeCategory === "ai" && (
            <div className="space-y-10">
              <ChatGPTSubSection
                plans={chatGptPlans}
                onBuyNow={handleChatGPTBuyNow}
                onHelp={() => setHelpOpen(true)}
              />
              {filteredProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-white/8" />
                    <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">More AI Tools</p>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Payment Details */}
      <section className="py-16 px-4 sm:px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Payment Details</h2>
          <p className="text-white/40 text-sm mb-8">Transfer to one of these accounts, then submit your order</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "KBZPay", bgClass: "bg-red-950/30 border-red-800/30", dotColor: "bg-red-500", number: "09-XXX-XXX-XXX" },
              { name: "WavePay", bgClass: "bg-blue-950/30 border-blue-800/30", dotColor: "bg-blue-500", number: "09-XXX-XXX-XXX" },
            ].map((p, i) => (
              <div key={i} className={`${p.bgClass} border rounded-2xl p-6 text-left`} data-testid={`payment-${p.name.toLowerCase()}`}>
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
                    <p className="text-white font-medium">Digital Packs Vol 2</p>
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
            <h2 className="text-2xl font-bold mb-2">How to Order</h2>
            <p className="text-white/40 text-sm">Get your subscription in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: "01", icon: <Play className="w-5 h-5" />, title: "Choose a Plan", desc: "Browse our plans and click Buy Now on your preferred subscription." },
              { step: "02", icon: <Zap className="w-5 h-5" />, title: "Make Payment", desc: "Pay via KBZPay or WavePay and take a screenshot of your transaction." },
              { step: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Submit & Receive", desc: "Fill the form with your Telegram/Messenger and upload your payment screenshot." },
            ].map((s, i) => (
              <div key={i} className="relative bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <div className="text-5xl font-black text-white/5 absolute top-4 right-4 leading-none">{s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
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
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm">Digital Packs Vol 2</span>
        </div>
        <p className="text-white/20 text-xs">© 2025 Digital Packs Vol 2. All rights reserved.</p>
      </footer>

      {/* Order Dialog */}
      <Dialog
        open={orderOpen}
        onOpenChange={(open) => {
          setOrderOpen(open);
          if (!open) { setOrderSuccess(false); form.reset(); setPreviewImg(null); }
        }}
      >
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">
          {orderSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Submitted!</h3>
              <p className="text-white/40 text-sm mb-6">
                We've received your order for{" "}
                <span className="text-white font-medium">{selectedProduct?.serviceName} {selectedProduct?.planName}</span>.
                We'll contact you via {form.getValues("contactPlatform")} shortly.
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
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

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
                      {mutation.isPending ? "Submitting..." : "Submit Order"}
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
    </div>
  );
}

function ChatGPTSubSection({
  plans,
  onBuyNow,
  onHelp,
  compact = false,
}: {
  plans: ChatGPTPlan[];
  onBuyNow: (plan: ChatGPTPlan) => void;
  onHelp: () => void;
  compact?: boolean;
}) {
  return (
    <div>
      {/* Sub-section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white flex-shrink-0">
          <SiOpenai className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base leading-tight">ChatGPT Plus</h3>
          <p className="text-white/35 text-xs">Official OpenAI subscription plans</p>
        </div>
        <div className="ml-auto">
          <div className="h-px w-16 bg-gradient-to-r from-emerald-500/40 to-transparent" />
        </div>
      </div>

      {/* 3 Plan cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${compact ? "" : ""}`}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border flex flex-col gap-4 overflow-hidden transition-all duration-300 group
              ${plan.highlight
                ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-green-950/80 hover:border-emerald-400/50"
                : "border-white/8 bg-gradient-to-br from-[#0d1a14] to-[#091009] hover:border-emerald-500/20"
              } p-5`}
            data-testid={`card-chatgpt-${plan.id}`}
          >
            {/* Neon top line for highlighted card */}
            {plan.highlight && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
            )}

            {/* Header row: plan name + badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white/40 text-xs font-medium mb-0.5">ChatGPT Plus</p>
                <h4 className="font-bold text-white text-sm leading-tight">{plan.name}</h4>
              </div>
              {plan.badge && (
                <Badge
                  className={`text-xs px-2 py-0.5 shrink-0 border font-semibold ${plan.badgeStyle}`}
                  data-testid={`badge-chatgpt-${plan.id}`}
                >
                  {plan.badge}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{plan.price}</span>
              <span className="text-white/30 text-xs">/ {plan.period}</span>
            </div>

            {/* Features */}
            <ul className="space-y-2 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => onBuyNow(plan)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white border-0 font-semibold h-9 text-sm"
                data-testid={`button-buy-chatgpt-${plan.id}`}
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onHelp}
                className="h-9 w-9 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/50 hover:text-white flex-shrink-0"
                title="Get help"
                data-testid={`button-help-chatgpt-${plan.id}`}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onBuyNow }: { product: Product; onBuyNow: (p: Product) => void }) {
  return (
    <div
      className={`relative rounded-2xl border ${product.comingSoon ? "border-white/5 opacity-75" : "border-white/8 hover:border-white/18"} bg-gradient-to-br ${product.cardColor} p-5 flex flex-col gap-4 transition-all duration-300 group`}
      data-testid={`card-product-${product.id}`}
    >
      {product.comingSoon && (
        <div className="absolute inset-0 rounded-2xl bg-[#080810]/30 pointer-events-none" />
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
