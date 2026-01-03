'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // npm install js-cookie করে নিও

export function useRole() {
  const [role, setRole] = useState(null); // 'admin', 'moderator', 'viewer'

  useEffect(() => {
    // কুকি থেকে রোল নেওয়া (Security) অথবা localStorage (Fast UI)
    const storedRole = Cookies.get('app_role') || localStorage.getItem('user_role');
    setRole(storedRole);
  }, []);

  return {
    role,
    isAdmin: role === 'admin',
    isModerator: role === 'moderator',
    isViewer: role === 'viewer',
    canEdit: role === 'admin', // শুধু এডমিন এডিট করতে পারবে
    canDistribute: role === 'admin' || role === 'moderator', // মডারেটর ও এডমিন কিট দিতে পারবে
  };
}