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
  }, [])

  return (
    <div className="h-screen flex flex-col bg-[url('/beach.png')]">
      <div className="absolute inset-0 bg-cyan-100/50 justify-end items-end flex  ">
        <Link href="./make">
          <div className="px-10 py-5 rounded-lg hover:cursor-pointer bg-[#3b82f6] text-white mr-10 mb-10 hover:scale-110 duration-300 text-xl">
            Make a card!
          </div>
        </Link>
      </div>
    </div>
  );
}

