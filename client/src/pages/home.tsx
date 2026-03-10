import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Youtube,
  Palette,
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
} from "lucide-react";
import { SiNetflix, SiYoutube, SiCanva } from "react-icons/si";

const orderFormSchema = z.object({
  contactPlatform: z.string().min(1, "Please select a contact platform"),
  contactUsername: z.string().min(1, "Username is required").min(3, "Username must be at least 3 characters"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  paymentScreenshot: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface Product {
  id: string;
  serviceName: string;
  planName: string;
  price: string;
  duration: string;
  features: string[];
  color: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: string;
  popular?: boolean;
}

const products: Product[] = [
  {
    id: "netflix-monthly",
    serviceName: "Netflix",
    planName: "Monthly Account",
    price: "5,000 MMK",
    duration: "1 Month",
    features: ["4K Ultra HD", "Up to 4 screens", "All devices", "Download content", "No ads"],
    color: "from-red-900/40 to-red-950/60",
    gradient: "from-red-600 to-red-800",
    icon: <SiNetflix className="w-8 h-8 text-red-500" />,
    badge: "Best Value",
    popular: true,
  },
  {
    id: "netflix-account",
    serviceName: "Netflix",
    planName: "Private Account",
    price: "12,000 MMK",
    duration: "3 Months",
    features: ["Dedicated profile", "4K Ultra HD", "All devices", "Download content", "Priority support"],
    color: "from-red-900/40 to-red-950/60",
    gradient: "from-red-600 to-red-800",
    icon: <SiNetflix className="w-8 h-8 text-red-500" />,
  },
  {
    id: "youtube-family",
    serviceName: "YouTube Premium",
    planName: "Family Plan",
    price: "4,500 MMK",
    duration: "1 Month",
    features: ["Ad-free YouTube", "YouTube Music", "Up to 6 members", "Background play", "Offline downloads"],
    color: "from-rose-900/40 to-red-950/60",
    gradient: "from-rose-500 to-red-700",
    icon: <SiYoutube className="w-8 h-8 text-rose-500" />,
    badge: "Family",
  },
  {
    id: "youtube-individual",
    serviceName: "YouTube Premium",
    planName: "Individual",
    price: "2,500 MMK",
    duration: "1 Month",
    features: ["Ad-free YouTube", "YouTube Music", "Background play", "Offline downloads", "Premium content"],
    color: "from-rose-900/40 to-red-950/60",
    gradient: "from-rose-500 to-red-700",
    icon: <SiYoutube className="w-8 h-8 text-rose-500" />,
  },
  {
    id: "canva-pro",
    serviceName: "Canva",
    planName: "Pro",
    price: "6,000 MMK",
    duration: "1 Month",
    features: ["100M+ premium assets", "Brand Kit", "Background remover", "Unlimited storage", "Magic AI tools"],
    color: "from-teal-900/40 to-cyan-950/60",
    gradient: "from-teal-500 to-cyan-600",
    icon: <SiCanva className="w-8 h-8 text-teal-400" />,
    badge: "AI Powered",
    popular: true,
  },
];

const paymentInfo = [
  { method: "KBZPay", number: "09 XXX XXX XXX", name: "Digital Packs" },
  { method: "WavePay", number: "09 XXX XXX XXX", name: "Digital Packs" },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
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
    onSuccess: () => {
      setOrderSuccess(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    },
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

  const onSubmit = (data: OrderFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Digital Packs <span className="text-violet-400">Vol 2</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block">Admin</a>
            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} data-testid="button-view-products">
              View Plans
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-64 h-64 bg-purple-800/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-violet-950/60 text-violet-300 border-violet-500/30 px-4 py-1.5 text-xs font-medium" data-testid="badge-hero">
            <Star className="w-3 h-3 mr-1.5 fill-violet-400 text-violet-400" />
            Trusted by 500+ customers in Myanmar
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Premium Digital
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Subscriptions
            </span>
          </h1>
          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Netflix, YouTube Premium, and Canva Pro at unbeatable prices. Fast delivery, reliable accounts, and 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border-0 px-8 h-12 text-base font-semibold shadow-lg shadow-violet-900/40"
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="button-hero-browse"
            >
              Browse Plans <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base" data-testid="button-hero-how">
              How it works
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
            {[
              { icon: <Users className="w-4 h-4" />, label: "500+ Customers" },
              { icon: <Clock className="w-4 h-4" />, label: "Instant Delivery" },
              { icon: <Shield className="w-4 h-4" />, label: "100% Guaranteed" },
              { icon: <Headphones className="w-4 h-4" />, label: "24/7 Support" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-white/40 text-sm" data-testid={`stat-${i}`}>
                <span className="text-violet-400">{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Banner */}
      <section className="py-6 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-white/30 text-xs uppercase tracking-widest font-medium">We accept</span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">K</span>
              </div>
              <span className="text-sm font-semibold text-white/80">KBZPay</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">W</span>
              </div>
              <span className="text-sm font-semibold text-white/80">WavePay</span>
            </div>
          </div>
          <Separator orientation="vertical" className="h-6 bg-white/10 hidden sm:block" />
          <span className="text-white/30 text-xs">Telegram & Messenger support</span>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Netflix */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/40 flex items-center justify-center">
                <SiNetflix className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Netflix</h2>
                <p className="text-white/40 text-sm">Stream unlimited movies & shows</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.filter(p => p.serviceName === "Netflix").map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          </div>

          {/* YouTube Premium */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/40 flex items-center justify-center">
                <SiYoutube className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">YouTube Premium</h2>
                <p className="text-white/40 text-sm">Ad-free videos + YouTube Music</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.filter(p => p.serviceName === "YouTube Premium").map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          </div>

          {/* Canva */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-800/40 flex items-center justify-center">
                <SiCanva className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Canva Pro</h2>
                <p className="text-white/40 text-sm">Design anything with AI-powered tools</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.filter(p => p.serviceName === "Canva").map(product => (
                <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Order Section */}
      <section className="py-20 px-4 sm:px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How to Order</h2>
            <p className="text-white/40">Get your subscription in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Play className="w-5 h-5" />, title: "Choose a Plan", desc: "Browse our plans and click Buy Now on your preferred subscription." },
              { step: "02", icon: <Zap className="w-5 h-5" />, title: "Make Payment", desc: "Pay via KBZPay or WavePay and take a screenshot of your transaction." },
              { step: "03", icon: <CheckCircle2 className="w-5 h-5" />, title: "Submit & Receive", desc: "Fill the form with your Telegram/Messenger and upload your payment screenshot." },
            ].map((s, i) => (
              <div key={i} className="relative bg-white/[0.03] border border-white/8 rounded-2xl p-6" data-testid={`step-${i}`}>
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

      {/* Payment Details */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Payment Details</h2>
          <p className="text-white/40 mb-10">Transfer to one of these accounts, then submit your order</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "KBZPay", color: "red", bg: "bg-red-950/30", border: "border-red-800/30", number: "09-XXX-XXX-XXX", holder: "Digital Packs Vol 2" },
              { name: "WavePay", color: "blue", bg: "bg-blue-950/30", border: "border-blue-800/30", number: "09-XXX-XXX-XXX", holder: "Digital Packs Vol 2" },
            ].map((p, i) => (
              <div key={i} className={`${p.bg} ${p.border} border rounded-2xl p-6 text-left`} data-testid={`payment-${p.name.toLowerCase()}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full ${p.color === "red" ? "bg-red-500" : "bg-blue-500"} flex items-center justify-center`}>
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
                    <p className="text-white font-medium">{p.holder}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm">Digital Packs Vol 2</span>
        </div>
        <p className="text-white/20 text-sm">© 2025 Digital Packs Vol 2. All rights reserved.</p>
      </footer>

      {/* Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={(open) => { setOrderOpen(open); if (!open) { setOrderSuccess(false); form.reset(); setPreviewImg(null); } }}>
        <DialogContent className="bg-[#0e0e1a] border border-white/10 text-white max-w-md w-[calc(100vw-2rem)] rounded-2xl p-0 overflow-hidden">
          {orderSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Order Submitted!</h3>
              <p className="text-white/40 text-sm mb-6">We've received your order for <span className="text-white font-medium">{selectedProduct?.serviceName} {selectedProduct?.planName}</span>. We'll contact you via {form.getValues("contactPlatform")} shortly.</p>
              <Button className="bg-violet-700 hover:bg-violet-600 w-full" onClick={() => setOrderOpen(false)} data-testid="button-close-success">
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* Dialog Header */}
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
                    {/* Contact Platform */}
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

                    {/* Contact Username */}
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

                    {/* Payment Method */}
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

                    {/* Payment Screenshot */}
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
                        <label className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer" data-testid="label-upload-screenshot">
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
      className={`relative rounded-2xl border border-white/8 bg-gradient-to-br ${product.color} p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300 group`}
      data-testid={`card-product-${product.id}`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
            {product.icon}
          </div>
          <div>
            <p className="text-white/50 text-xs font-medium">{product.serviceName}</p>
            <h3 className="font-bold text-white leading-tight">{product.planName}</h3>
          </div>
        </div>
        {product.badge && (
          <Badge className="bg-violet-950/80 text-violet-300 border-violet-500/30 text-xs px-2 py-0.5 shrink-0" data-testid={`badge-${product.id}`}>
            {product.badge}
          </Badge>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">{product.price}</span>
        <span className="text-white/30 text-sm">/ {product.duration}</span>
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-white/60" data-testid={`feature-${product.id}-${i}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* Button */}
      <Button
        onClick={() => onBuyNow(product)}
        className={`w-full bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white border-0 font-semibold h-10`}
        data-testid={`button-buy-${product.id}`}
      >
        Buy Now
      </Button>
    </div>
  );
}
