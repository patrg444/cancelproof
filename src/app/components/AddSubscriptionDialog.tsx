import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';
import { Subscription, BillingPeriod, CancellationMethod, SubscriptionCategory, CancelByRule, TimelineEvent, SubscriptionIntent } from '@/types/subscription';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarIcon, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { computeCancelByDate, getCancelByRuleLabel, getDefaultReminders, getDefaultCancelByRule } from '@/utils/subscriptionHelpers';

interface AddSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Subscription;
}

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
const billingPeriods: BillingPeriod[] = ['monthly', 'yearly', 'quarterly', 'weekly', 'one-time'];
const cancellationMethods: CancellationMethod[] = ['web', 'app-store', 'google-play', 'email', 'phone'];
const categories: SubscriptionCategory[] = ['streaming', 'software', 'fitness', 'productivity', 'news', 'gaming', 'other'];

type FormStep = 'basic' | 'cancellation' | 'advanced';

export function AddSubscriptionDialog({ open, onOpenChange, onSave, initialData }: AddSubscriptionDialogProps) {
  const [step, setStep] = useState<FormStep>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.renewalDate) {
      newErrors.renewalDate = 'Next charge date is required';
    }

    if (step === 'cancellation') {
      if (formData.cancellationUrl && !isValidUrl(formData.cancellationUrl)) {
        newErrors.cancellationUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDefaultFormData = (): Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> => {
    const renewalDate = new Date().toISOString().split('T')[0];
    const intent: SubscriptionIntent = 'keep';
    const cancelByRule = getDefaultCancelByRule(intent);
    const cancelByDate = computeCancelByDate(renewalDate, cancelByRule);
    
    return {
      name: '',
      amount: 0,
      currency: 'USD',
      renewalDate,
      intent,
      cancelByRule,
      cancelByDate,
      billingPeriod: 'monthly',
      category: 'other',
      cancellationMethod: 'web',
      cancellationUrl: '',
      cancellationSteps: '',
      requiredInfo: '',
      reminders: getDefaultReminders(intent),
      proofDocuments: [],
      proofStatus: 'not-required',
      timeline: [],
      status: 'active',
      notes: '',
    };
  };

  const [formData, setFormData] = useState<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>(getDefaultFormData());

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (!open) {
      setFormData(getDefaultFormData());
      setStep('basic');
    }
  }, [initialData, open]);

  const handleIntentChange = (newIntent: SubscriptionIntent) => {
    const newCancelByRule = getDefaultCancelByRule(newIntent);
    const newCancelByDate = computeCancelByDate(formData.renewalDate, newCancelByRule);
    const newReminders = getDefaultReminders(newIntent);
    
    setFormData({
      ...formData,
      intent: newIntent,
      cancelByRule: newCancelByRule,
      cancelByDate: newCancelByDate,
      reminders: newReminders,
    });
  };

  const handleCancelByRuleChange = (rule: CancelByRule) => {
    const newCancelByDate = computeCancelByDate(formData.renewalDate, rule);
    setFormData({
      ...formData,
      cancelByRule: rule,
      cancelByDate: newCancelByDate,
    });
  };

  const handleRenewalDateChange = (date: Date) => {
    const renewalDate = date.toISOString().split('T')[0];
    const newCancelByDate = computeCancelByDate(renewalDate, formData.cancelByRule);
    
    setFormData({ 
      ...formData, 
      renewalDate,
      cancelByDate: newCancelByDate,
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const initialTimeline: TimelineEvent[] = formData.timeline.length > 0 ? formData.timeline : [{
      id: `event-${Date.now()}`,
      type: 'created',
      timestamp: new Date().toISOString(),
      description: `Subscription ${initialData ? 'updated' : 'added'}: ${formData.name}`,
    }];

    onSave({
      ...formData,
      timeline: initialTimeline,
    });
  };

  const canProceedFromBasic = formData.name && formData.amount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>
            {step === 'basic' && 'Quick add — takes 30 seconds'}
            {step === 'cancellation' && 'Add cancellation details (optional)'}
            {step === 'advanced' && 'Configure reminders and notes (optional)'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info (Required) */}
          {step === 'basic' && (
            <div className="space-y-4">
              {/* Intent Field - NEW */}
              <div className="space-y-2">
                <Label htmlFor="intent">
                  What's your plan for this subscription? *
                </Label>
                <Select
                  value={formData.intent}
                  onValueChange={(value) => handleIntentChange(value as SubscriptionIntent)}
                >
                  <SelectTrigger id="intent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep (I want this subscription)</SelectItem>
                    <SelectItem value="trial">Trial (plan to cancel)</SelectItem>
                    <SelectItem value="cancel-soon">Cancel before next renewal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>This determines reminder defaults and cancel-by rules</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix, Spotify, Adobe"
                  required
                  className={errors.name ? 'border-red-500' : ''}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="9.99"
                    required
                    className={errors.amount ? 'border-red-500' : ''}
                    aria-invalid={!!errors.amount}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billing">Period</Label>
                  <Select
                    value={formData.billingPeriod}
                    onValueChange={(value) => setFormData({ ...formData, billingPeriod: value as BillingPeriod })}
                  >
                    <SelectTrigger id="billing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billingPeriods.map(period => (
                        <SelectItem key={period} value={period}>
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Next Charge Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.renewalDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(formData.renewalDate), 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.renewalDate)}
                      onSelect={(date) => date && handleRenewalDateChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.renewalDate && (
                  <p className="text-sm text-red-600">{errors.renewalDate}</p>
                )}
              </div>

              {/* Cancel-By Rule - ENHANCED */}
              <div className="space-y-2">
                <Label>Cancel-By Rule</Label>
                <Select
                  value={formData.cancelByRule}
                  onValueChange={(value) => handleCancelByRuleChange(value as CancelByRule)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Anytime</SelectItem>
                    <SelectItem value="1-day-before">1 day before renewal</SelectItem>
                    <SelectItem value="3-days-before">3 days before renewal</SelectItem>
                    <SelectItem value="7-days-before">7 days before renewal</SelectItem>
                    <SelectItem value="end-of-period">End of billing period</SelectItem>
                    <SelectItem value="custom">Custom date</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.cancelByRule === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(formData.cancelByDate), 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.cancelByDate)}
                        onSelect={(date) => date && setFormData({ ...formData, cancelByDate: date.toISOString().split('T')[0] })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
                
                {/* Show computed deadline - NEW */}
                {formData.cancelByRule !== 'anytime' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <p className="text-sm font-medium text-blue-900">
                      Cancel-by deadline: {format(new Date(formData.cancelByDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {getCancelByRuleLabel(formData.cancelByRule)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Subscription['status'] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="cancel-attempted">Cancel Attempted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Cancellation Details (Optional) */}
          {step === 'cancellation' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Cancellation Method</Label>
                <Select
                  value={formData.cancellationMethod}
                  onValueChange={(value) => setFormData({ ...formData, cancellationMethod: value as CancellationMethod })}
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cancellationMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">Cancellation URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.cancellationUrl}
                  onChange={(e) => setFormData({ ...formData, cancellationUrl: e.target.value })}
                  placeholder="https://example.com/cancel"
                  className={errors.cancellationUrl ? 'border-red-500' : ''}
                  aria-invalid={!!errors.cancellationUrl}
                />
                {errors.cancellationUrl && (
                  <p className="text-sm text-red-600">{errors.cancellationUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="support">Support Contact</Label>
                <Input
                  id="support"
                  value={formData.supportContact || ''}
                  onChange={(e) => setFormData({ ...formData, supportContact: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="steps">Cancellation Steps</Label>
                <Textarea
                  id="steps"
                  value={formData.cancellationSteps}
                  onChange={(e) => setFormData({ ...formData, cancellationSteps: e.target.value })}
                  placeholder="1. Go to account settings&#10;2. Click 'Manage subscription'&#10;3. ..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelNotes">Deadline Notes</Label>
                <Input
                  id="cancelNotes"
                  value={formData.cancelByNotes || ''}
                  onChange={(e) => setFormData({ ...formData, cancelByNotes: e.target.value })}
                  placeholder="e.g., Must cancel via web only, not in app"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requiredInfo">Required Information</Label>
                <Textarea
                  id="requiredInfo"
                  value={formData.requiredInfo}
                  onChange={(e) => setFormData({ ...formData, requiredInfo: e.target.value })}
                  placeholder="Account number, order ID, etc."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 3: Advanced (Optional) */}
          {step === 'advanced' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as SubscriptionCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cancel-By Reminders</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Based on your intent: {formData.intent === 'keep' ? 'No reminders (you want to keep this)' : 'Full reminder sequence'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="reminder-7"
                      checked={formData.reminders.sevenDays}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, reminders: { ...formData.reminders, sevenDays: !!checked } })
                      }
                    />
                    <Label htmlFor="reminder-7" className="font-normal">7 days before cancel-by date</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="reminder-3"
                      checked={formData.reminders.threeDays}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, reminders: { ...formData.reminders, threeDays: !!checked } })
                      }
                    />
                    <Label htmlFor="reminder-3" className="font-normal">3 days before</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="reminder-1"
                      checked={formData.reminders.oneDay}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, reminders: { ...formData.reminders, oneDay: !!checked } })
                      }
                    />
                    <Label htmlFor="reminder-1" className="font-normal">1 day before</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="reminder-0"
                      checked={formData.reminders.dayOf}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, reminders: { ...formData.reminders, dayOf: !!checked } })
                      }
                    />
                    <Label htmlFor="reminder-0" className="font-normal">On the day</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex justify-between w-full">
              <div>
                {step !== 'basic' && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      if (step === 'cancellation') setStep('basic');
                      if (step === 'advanced') setStep('cancellation');
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {step === 'basic' && (
                  <>
                    {formData.intent === 'keep' ? (
                      // For "Keep" subscriptions, make Save Now primary
                      <>
                        <Button 
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canProceedFromBasic}
                        >
                          Save Now
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setStep('cancellation')}
                          disabled={!canProceedFromBasic}
                        >
                          Add Cancellation Details (Optional)
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </>
                    ) : (
                      // For other intents, encourage adding cancellation details
                      <>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleSubmit}
                          disabled={!canProceedFromBasic}
                        >
                          Save Now
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => setStep('cancellation')}
                          disabled={!canProceedFromBasic}
                        >
                          Next: Cancellation Details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </>
                    )}
                  </>
                )}
                {step === 'cancellation' && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleSubmit}
                    >
                      Save Now
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setStep('advanced')}
                    >
                      Next: Advanced Options
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}
                {step === 'advanced' && (
                  <Button type="submit">
                    {initialData ? 'Update Subscription' : 'Add Subscription'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}