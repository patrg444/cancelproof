import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoadingState, EmptyState, ErrorState } from '@/app/components/StateViews';

describe('LoadingState', () => {
  it('renders default loading message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders custom loading message', () => {
    render(<LoadingState message="Loading subscriptions..." />);
    expect(screen.getByText('Loading subscriptions...')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No subscriptions"
        description="Track your first subscription to get started"
      />
    );
    expect(screen.getByText('No subscriptions')).toBeTruthy();
    expect(screen.getByText('Track your first subscription to get started')).toBeTruthy();
  });

  it('renders and fires action button', () => {
    const onAction = vi.fn();
    render(
      <EmptyState title="Empty" action="Add Subscription" onAction={onAction} />
    );
    fireEvent.click(screen.getByText('Add Subscription'));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe('ErrorState', () => {
  it('renders error with retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Sync failed" onRetry={onRetry} />);
    expect(screen.getByText('Sync failed')).toBeTruthy();
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
