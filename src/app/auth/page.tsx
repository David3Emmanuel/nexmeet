import type { Metadata } from 'next';
import AuthFlow from '@/components/auth/AuthFlow';

export const metadata: Metadata = {
  title: 'Sign In — NexMeet',
  description: 'Sign in to NexMeet to host events and manage AI-powered networking.',
};

export default function AuthPage() {
  return <AuthFlow />;
}
