import { ShieldCheck, CalendarClock, FileText, Bell, Cloud, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadSampleData: () => void;
  onSignIn: () => void;
}

const features = [
  { icon: CalendarClock, title: 'Cancel-by rules', desc: 'Track cancel-by dates and renewal dates so you know exactly when to act.' },
  { icon: FileText, title: 'Proof uploads', desc: 'Save confirmation emails, screenshots, chat transcripts, and other proof of cancellation attempts.' },
  { icon: Bell, title: 'Reminders', desc: 'Get nudges before critical dates so you don\'t get stuck in "forgot to cancel" limbo.' },
  { icon: ShieldCheck, title: 'Audit-ready', desc: 'Keep a clean timeline of events so you can reference what happened, when, and what you saved.' },
  { icon: Cloud, title: 'Optional cloud sync', desc: 'Sign in to sync across devices. Stay local if you prefer.' },
] as const;

export function LandingPage({ onGetStarted, onLoadSampleData, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors duration-200">
      <header className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">CancelMem</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Proof-first cancellation tracking.</div>
          </div>
          <Button variant="outline" onClick={onSignIn}>Sign in</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40">Never miss a cancel-by deadline</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mt-4">
            Track cancellations, deadlines, and proof in one place
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-4">
            CancelMem helps you keep receipts, screenshots, and notes together so you can prove you cancelled —
            and avoid surprise renewals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button size="lg" className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={onGetStarted}>
              Add your first subscription
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" onClick={onLoadSampleData}>
              Load sample data
            </Button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Works offline • Optional cloud sync when you sign in
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-medium text-card-foreground">{title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
