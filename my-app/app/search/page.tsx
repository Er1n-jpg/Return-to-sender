"use client";

import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SearchPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: '',
    title: '',
    blocks: '',
    created_at: ''
  })

  useEffect(() => {
    async function getSession() {
      const { data, error } = await supabase.auth.getSession();
      console.log(data, error);
      setSession(data.session);
    }
    getSession();
  },[])


  return (
    <div className="h-screen flex flex-col bg-[url('/beach.png')]">
      <div className="absolute inset-0 bg-cyan-100/50">
      <Link href="./make">
        <button className = "bg-black hover: cursor-pointer">
          Make a card! 1</button>
      </Link>
    </div>  
    </div>
  );
}

