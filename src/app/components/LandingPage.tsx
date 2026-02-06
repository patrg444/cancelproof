import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CalendarClock,
  FileText,
  Bell,
  Cloud,
  ArrowRight,
  Star,
  CheckCircle2,
  Zap,
  Trophy,
  TrendingDown,
  Users,
  ChevronDown,
  ChevronUp,
  Flame,
  BookOpen,
  Crown,
  Check,
  X,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { PRICING_PLANS } from '@/lib/stripe';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadSampleData: () => void;
  onSignIn: () => void;
}

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, trigger: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (trigger && !hasStarted) {
      setHasStarted(true);
    }
  }, [trigger, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return count;
}

// Intersection observer hook
function useInView(threshold: number = 0.3) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { isInView, ref };
}

// Social proof stats
const SOCIAL_STATS = [
  { label: 'Subscriptions Tracked', value: 12400, prefix: '', suffix: '+' },
  { label: 'Saved by Users', value: 847000, prefix: '$', suffix: '+' },
  { label: 'Dark Patterns Flagged', value: 3200, prefix: '', suffix: '+' },
  { label: 'Cancellation Guides', value: 15, prefix: '', suffix: '' },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Saved $1,200/year',
    avatar: '👩‍💼',
    quote: 'I had no idea I was paying for 11 subscriptions I never used. CancelMem made me feel in control of my money again.',
    rating: 5,
  },
  {
    name: 'James K.',
    role: 'Fought Adobe & won',
    avatar: '👨‍💻',
    quote: "Adobe tried every dark pattern in the book. CancelMem's step-by-step guide got me through in 10 minutes. Proof saved.",
    rating: 5,
  },
  {
    name: 'Priya R.',
    role: 'Cancelled 7 services',
    avatar: '👩‍🎨',
    quote: "The cancel-by deadlines saved me. I would have missed Planet Fitness's 30-day notice window without the reminders.",
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Disputed a charge',
    avatar: '👨‍⚕️',
    quote: 'When a service kept charging me after cancellation, I had timestamped screenshots and confirmation numbers ready. Won my dispute in 3 days.',
    rating: 5,
  },
];

// How it works steps
const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Zap,
    title: 'Add your subscriptions',
    description: 'Type a name and we auto-detect the service. Our guides pre-fill cancellation methods, deadlines, and dark pattern warnings.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    step: 2,
    icon: Bell,
    title: 'Get smart reminders',
    description: 'Never miss a cancel-by deadline. Get alerts 7 days, 3 days, and 1 day before — because companies count on you forgetting.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    step: 3,
    icon: BookOpen,
    title: 'Follow the cancellation guide',
    description: 'Step-by-step instructions with dark pattern warnings. Know exactly what retention tricks to expect and how to get past them.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    step: 4,
    icon: ShieldCheck,
    title: 'Save your proof',
    description: 'Upload screenshots, confirmation emails, and reference numbers. Build a bulletproof case file for chargebacks if needed.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
];

// Dark pattern hall of shame
const DARK_PATTERN_EXAMPLES = [
  { service: 'Adobe Creative Cloud', difficulty: 5, trick: 'Early termination fees + hidden phone requirement', emoji: '🤬' },
  { service: 'Planet Fitness', difficulty: 4, trick: 'Certified letter or in-person visit required', emoji: '😤' },
  { service: 'NYT Digital', difficulty: 4, trick: 'Chat-only cancellation with aggressive retention', emoji: '😤' },
  { service: 'Peloton', difficulty: 4, trick: 'Phone call required + heavy upselling', emoji: '😤' },
  { service: 'SiriusXM', difficulty: 5, trick: 'Multiple "are you sure?" screens + fake discounts', emoji: '🤬' },
];

// FAQ items
const FAQ_ITEMS = [
  {
    q: 'Is CancelMem free?',
    a: 'Yes! Track up to 5 subscriptions for free with all core features. Upgrade to Pro for unlimited subscriptions, cloud sync, and email reminders.',
  },
  {
    q: 'Does CancelMem actually cancel my subscriptions for me?',
    a: "No — and that's by design. We give you step-by-step guides, deadline tracking, and proof storage. You stay in control of the actual cancellation so there's no risk of unauthorized actions on your accounts.",
  },
  {
    q: 'Is my data private?',
    a: "Absolutely. Your data is stored locally on your device by default. Cloud sync is optional and only available when you sign in. We never sell your data or share it with third parties.",
  },
  {
    q: 'What are dark patterns?',
    a: "Dark patterns are deceptive design tricks companies use to make cancelling harder — things like hidden cancel buttons, mandatory phone calls, guilt-trip messaging, and fake discount offers. We flag these in our guides so you're prepared.",
  },
  {
    q: 'How do cancellation guides work?',
    a: "When you add a subscription, we auto-detect the service and offer a pre-built guide with step-by-step instructions, expected dark patterns, and pro tips. Guides are community-verified and regularly updated.",
  },
  {
    q: 'Can I export my proof documents?',
    a: "Pro users can export their entire case file as a PDF — perfect for filing chargebacks or disputes with your bank. Free users can still save and view all proof documents within the app.",
  },
];

// Feature comparison for mini pricing section
const FEATURE_COMPARISON = [
  { feature: 'Track subscriptions', free: '5', pro: 'Unlimited' },
  { feature: 'Cancellation guides', free: true, pro: true },
  { feature: 'Dark pattern warnings', free: true, pro: true },
  { feature: 'Cancel-by reminders', free: 'Browser only', pro: 'Email + Push' },
  { feature: 'Proof uploads', free: true, pro: true },
  { feature: 'Cloud sync', free: false, pro: true },
  { feature: 'PDF proof exports', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
];

export function LandingPage({ onGetStarted, onLoadSampleData, onSignIn }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const { isInView: statsInView, ref: statsRef } = useInView(0.3);
  const savingsCount = useCountUp(847000, 2500, statsInView);
  const subsCount = useCountUp(12400, 2000, statsInView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CancelMem</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:inline">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:inline">
              FAQ
            </a>
            <Button variant="outline" size="sm" onClick={onSignIn}>Sign in</Button>
          </div>
        </div>
      </header>

      <main>
        {/* ============================================= */}
        {/* HERO SECTION */}
        {/* ============================================= */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center">
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 mb-4">
              <Flame className="h-3 w-3 mr-1" />
              Companies make cancelling hard on purpose
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mt-4 leading-tight">
              Stop paying for things
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                you forgot to cancel
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-6">
              CancelMem tracks your cancel-by deadlines, warns you about dark patterns,
              and saves proof of cancellation — so you never get charged for something you tried to cancel.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white text-base h-12"
                onClick={onGetStarted}
              >
                Start tracking free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 text-base h-12"
                onClick={onLoadSampleData}
              >
                See demo data
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Free forever plan</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Works offline</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> No credit card needed</span>
            </p>
          </div>
        </section>

        {/* ============================================= */}
        {/* SOCIAL PROOF COUNTER BAR */}
        {/* ============================================= */}
        <section className="border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-8" ref={statsRef}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {SOCIAL_STATS.map((stat, i) => {
                const animatedValue = i === 0 ? subsCount : i === 1 ? savingsCount : null;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.prefix}
                      {animatedValue !== null ? animatedValue.toLocaleString() : stat.value.toLocaleString()}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* DARK PATTERN HALL OF SHAME */}
        {/* ============================================= */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Dark Pattern Hall of Shame
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
              These companies make cancelling intentionally hard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
              We rate every service's cancellation difficulty and expose their tricks.
              Here are some of the worst offenders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {DARK_PATTERN_EXAMPLES.map((item) => (
              <Card key={item.service} className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.service}</div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">{item.trick}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-lg">{item.emoji}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mx-0.5 ${
                              i < item.difficulty ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            CancelMem includes step-by-step guides to beat all of these.
          </p>
        </section>

        {/* ============================================= */}
        {/* HOW IT WORKS */}
        {/* ============================================= */}
        <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                How CancelMem works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-3">
                Four steps to never get surprise-charged again
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, description, color, bg }) => (
                <div key={step} className="relative">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-full">
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                      Step {step}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                  {/* Connector line */}
                  {step < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* FEATURES GRID */}
        {/* ============================================= */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need to fight back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
              Built for people who are tired of companies making it easy to sign up and impossible to leave.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CalendarClock,
                title: 'Cancel-by deadline tracking',
                desc: 'Know exactly when you need to cancel — down to the day. Smart rules for different billing periods.',
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-100 dark:bg-blue-900/30',
              },
              {
                icon: BookOpen,
                title: 'Service-specific guides',
                desc: '15+ pre-built guides with step-by-step instructions. Auto-fills when you add a service.',
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-100 dark:bg-purple-900/30',
              },
              {
                icon: ShieldCheck,
                title: 'Dark pattern warnings',
                desc: "Know what tricks to expect before you start. Guilt trips, fake discounts, hidden buttons — we flag them all.",
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-100 dark:bg-red-900/30',
              },
              {
                icon: FileText,
                title: 'Proof of cancellation',
                desc: 'Save screenshots, confirmation emails, and chat transcripts. Build a case file for disputes.',
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-100 dark:bg-green-900/30',
              },
              {
                icon: Bell,
                title: 'Smart reminders',
                desc: "Get nudges 7 days, 3 days, and 1 day before deadlines. Because companies count on you forgetting.",
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-100 dark:bg-amber-900/30',
              },
              {
                icon: Flame,
                title: 'Rage post templates',
                desc: 'Share your cancellation story. Pick a tone, customize the message, and post to X — because naming and shaming works.',
                color: 'text-orange-600 dark:text-orange-400',
                bg: 'bg-orange-100 dark:bg-orange-900/30',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <Card key={title} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ============================================= */}
        {/* TESTIMONIALS */}
        {/* ============================================= */}
        <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Real people, real savings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-3">
                Join thousands who stopped losing money to forgotten subscriptions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.avatar}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* SAVINGS CALCULATOR / MOTIVATOR */}
        {/* ============================================= */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-8 md:p-12 text-center">
            <TrendingDown className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              The average person wastes{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                $240/year
              </span>
              {' '}on forgotten subscriptions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
              That's a free vacation, a new gadget, or 48 fancy coffees.
              How much are you wasting right now?
            </p>
            <Button
              size="lg"
              className="mt-6 bg-green-600 hover:bg-green-700 text-white text-base h-12 px-8"
              onClick={onGetStarted}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Find out what you can save
            </Button>
          </div>
        </section>

        {/* ============================================= */}
        {/* PRICING */}
        {/* ============================================= */}
        <section id="pricing" className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Simple, honest pricing
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-3">
                No hidden fees. No dark patterns. (We practice what we preach.)
              </p>

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  Yearly
                </span>
                {billingPeriod === 'yearly' && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40">
                    Save 33%
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Plan */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Free</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">forever</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Perfect for trying it out
                  </p>
                  <Button variant="outline" className="w-full mt-6" onClick={onGetStarted}>
                    Get started free
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {FEATURE_COMPARISON.map((item) => (
                      <li key={item.feature} className="flex items-center gap-2 text-sm">
                        {item.free === false ? (
                          <X className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                        <span className={item.free === false ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                          {item.feature}
                          {typeof item.free === 'string' && (
                            <span className="text-gray-400 dark:text-gray-500 ml-1">({item.free})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro</h3>
                  <div className="mt-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${billingPeriod === 'yearly'
                        ? (PRICING_PLANS.pro.priceYearly / 12).toFixed(2)
                        : PRICING_PLANS.pro.priceMonthly.toFixed(2)
                      }
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ${PRICING_PLANS.pro.priceYearly}/year — save ${((PRICING_PLANS.pro.priceMonthly * 12) - PRICING_PLANS.pro.priceYearly).toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    For power cancellers
                  </p>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white" onClick={onSignIn}>
                    Start free, upgrade anytime
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {FEATURE_COMPARISON.map((item) => (
                      <li key={item.feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.feature}
                          {typeof item.pro === 'string' && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium ml-1">({item.pro})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* FAQ */}
        {/* ============================================= */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================= */}
        {/* FINAL CTA */}
        {/* ============================================= */}
        <section className="border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Ready to stop wasting money?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
              Add your first subscription in 30 seconds. Free, private, and works offline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white text-base h-12"
                onClick={onGetStarted}
              >
                Start tracking free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              No account required • 5 free subscriptions • Upgrade anytime
            </p>
          </div>
        </section>

        {/* ============================================= */}
        {/* FOOTER */}
        {/* ============================================= */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">CancelMem</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Made for people tired of being charged for things they cancelled.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
