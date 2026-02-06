import { ShieldCheck, CalendarClock, FileText, Bell, Cloud, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadSampleData: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onLoadSampleData, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">CancelMem</div>
            <div className="text-sm text-gray-600">Proof-first cancellation tracking.</div>
          </div>
          <Button variant="outline" onClick={onSignIn}>Sign in</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Never miss a cancel-by deadline</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mt-4">
            Track cancellations, deadlines, and proof in one place
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
            CancelMem helps you keep receipts, screenshots, and notes together so you can prove you cancelled —
            and avoid surprise renewals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button size="lg" className="w-full sm:w-auto px-8" onClick={onGetStarted}>
              Add your first subscription
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" onClick={onLoadSampleData}>
              Load sample data
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Works offline • Optional cloud sync when you sign in
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Cancel-by rules</h2>
              </div>
              <p className="text-sm text-gray-600">
                Track cancel-by dates and renewal dates so you know exactly when to act.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Proof uploads</h2>
              </div>
              <p className="text-sm text-gray-600">
                Save confirmation emails, screenshots, chat transcripts, and other proof of cancellation attempts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Reminders</h2>
              </div>
              <p className="text-sm text-gray-600">
                Get nudges before critical dates so you don’t get stuck in “forgot to cancel” limbo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Audit-ready</h2>
              </div>
              <p className="text-sm text-gray-600">
                Keep a clean timeline of events so you can reference what happened, when, and what you saved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Optional cloud sync</h2>
              </div>
              <p className="text-sm text-gray-600">
                Sign in to sync across devices. Stay local if you prefer.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

