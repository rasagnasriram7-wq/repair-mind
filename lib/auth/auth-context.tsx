'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, Profile } from '@/types';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_TECHNICIAN: Profile = {
  id: 'u-tech-101',
  full_name: 'Dave Kowalski',
  email: 'dave.kowalski@plant-ops.com',
  role: 'technician',
  created_at: new Date().toISOString(),
};

const DEMO_MANAGER: Profile = {
  id: 'u-mgr-201',
  full_name: 'Elena Rostova',
  email: 'elena.rostova@plant-ops.com',
  role: 'manager',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(true);

  // Restore stored session or default demo technician on first launch
  useEffect(() => {
    try {
      const stored = localStorage.getItem('repair_mind_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setIsDemoUser(true);
      } else {
        // Default to Demo Technician for instant out-of-the-box experience
        setUser(DEMO_TECHNICIAN);
        localStorage.setItem('repair_mind_user', JSON.stringify(DEMO_TECHNICIAN));
        setIsDemoUser(true);
      }
    } catch {
      setUser(DEMO_TECHNICIAN);
    } finally {
      setIsLoading(false);
    }

    // If Supabase is configured, listen to auth state changes
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
          if (sbUser) {
            const profile: Profile = {
              id: sbUser.id,
              full_name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Technician',
              email: sbUser.email || 'tech@plant.com',
              role: (sbUser.user_metadata?.role as UserRole) || 'technician',
              created_at: sbUser.created_at,
            };
            setUser(profile);
            setIsDemoUser(false);
            localStorage.setItem('repair_mind_user', JSON.stringify(profile));
          }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const profile: Profile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Technician',
              email: session.user.email || 'tech@plant.com',
              role: (session.user.user_metadata?.role as UserRole) || 'technician',
              created_at: session.user.created_at,
            };
            setUser(profile);
            setIsDemoUser(false);
            localStorage.setItem('repair_mind_user', JSON.stringify(profile));
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    }
  }, []);

  const login = async (email: string, password = '', role: UserRole = 'technician'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // If auth fails on real Supabase, inform user or provide fallback
          console.warn('Supabase signin error:', error.message);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile: Profile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            email: data.user.email || email,
            role: (data.user.user_metadata?.role as UserRole) || role,
            created_at: data.user.created_at,
          };
          setUser(profile);
          setIsDemoUser(false);
          localStorage.setItem('repair_mind_user', JSON.stringify(profile));
          return { success: true };
        }
      }

      // Local / Offline / Demo mode login
      const cleanEmail = email.toLowerCase().trim();
      let matchedProfile: Profile;

      if (cleanEmail.includes('admin') || cleanEmail.includes('manager') || role === 'manager') {
        matchedProfile = { ...DEMO_MANAGER, email: cleanEmail };
      } else {
        matchedProfile = {
          id: `u-${Date.now()}`,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Technician',
          email: cleanEmail,
          role,
          created_at: new Date().toISOString(),
        };
      }

      setUser(matchedProfile);
      setIsDemoUser(true);
      localStorage.setItem('repair_mind_user', JSON.stringify(matchedProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password = '', role: UserRole = 'technician'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role,
            },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile: Profile = {
            id: data.user.id,
            full_name: name,
            email,
            role,
            created_at: new Date().toISOString(),
          };
          setUser(profile);
          setIsDemoUser(false);
          localStorage.setItem('repair_mind_user', JSON.stringify(profile));
          return { success: true };
        }
      }

      const newProfile: Profile = {
        id: `u-${Date.now()}`,
        full_name: name,
        email: email.toLowerCase().trim(),
        role,
        created_at: new Date().toISOString(),
      };
      setUser(newProfile);
      setIsDemoUser(true);
      localStorage.setItem('repair_mind_user', JSON.stringify(newProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    localStorage.removeItem('repair_mind_user');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('repair_mind_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
