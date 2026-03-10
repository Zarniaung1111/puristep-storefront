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
  color: string;
  neon: string;
  glow: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "all",
    label: "All",
    icon: <Tag className="w-4 h-4" />,
    color: "from-violet-600 to-purple-700",
    neon: "text-violet-400",
    glow: "shadow-violet-500/25",
    description: "All available digital subscriptions",
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: <Brain className="w-4 h-4" />,
    color: "from-violet-600 to-fuchsia-700",
    neon: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/25",
    description: "AI-powered creative & productivity tools",
  },
  {
    id: "capcut",
    label: "CapCut",
    icon: <Scissors className="w-4 h-4" />,
    color: "from-orange-600 to-amber-600",
    neon: "text-amber-400",
    glow: "shadow-amber-500/25",
    description: "Professional video editing & creation",
  },
  {
    id: "music",
    label: "Music & Video",
    icon: <Music2 className="w-4 h-4" />,
    color: "from-pink-600 to-rose-700",
    neon: "text-pink-400",
    glow: "shadow-pink-500/25",
    description: "Streaming music, video & entertainment",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: <Send className="w-4 h-4" />,
    color: "from-blue-600 to-cyan-600",
    neon: "text-cyan-400",
    glow: "shadow-cyan-500/25",
    description: "Telegram Premium subscriptions",
  },
  {
    id: "vpn",
    label: "VPN",
    icon: <Shield className="w-4 h-4" />,
    color: "from-emerald-600 to-teal-600",
    neon: "text-emerald-400",
    glow: "shadow-emerald-500/25",
    description: "Secure browsing & online privacy",
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

const products: Product[] = [
  // --- AI ---
  {
    id: "canva-pro",
    categoryId: "ai",
    serviceName: "Canva",
    planName: "Pro",
    price: "6,000 MMK",
    duration: "1 Month",
    features: ["100M+ premium assets", "Brand Kit", "Background remover", "Unlimited storage", "Magic AI tools"],
    cardColor: "from-teal-900/40 to-cyan-950/60",
    gradient: "from-teal-500 to-cyan-600",
    icon: <SiCanva className="w-7 h-7 text-teal-400" />,
    badge: "AI Powered",
  },
  {
    id: "chatgpt-plus",
    categoryId: "ai",
    serviceName: "ChatGPT",
    planName: "Plus",
    price: "Coming Soon",
    duration: "1 Month",
    features: ["GPT-4o access", "Image generation", "Advanced data analysis", "Priority access", "Plugins support"],
    cardColor: "from-emerald-900/40 to-green-950/60",
    gradient: "from-emerald-500 to-green-600",
    icon: <SiOpenai className="w-7 h-7 text-emerald-400" />,
    badge: "Soon",
    comingSoon: true,
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(product => (
                      <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Single category filtered view */}
          {activeCategory !== "all" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
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
