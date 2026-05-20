'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { LoginForm, SignupForm } from '@/components/auth/AuthForms';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={view === 'login' ? 'Log in to TikTok' : 'Sign up for TikTok'}
    >
      {view === 'login' ? (
        <LoginForm onSuccess={onClose} switchToSignup={() => setView('signup')} />
      ) : (
        <SignupForm onSuccess={onClose} switchToLogin={() => setView('login')} />
      )}
    </Modal>
  );
}