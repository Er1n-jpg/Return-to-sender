

"use client";
 
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
 
type Block = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
}
 
type LetterRow = {
  id: string;
  to_name: string | null;
  from_name: string | null;
  created_at: string;
  blocks: Block[];
}
 
const LETTER_W = 720;
const LETTER_H = 900;
const SCALE = 0.3;
 
export default function LettersGridPage() {
  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
 
  useEffect(() => {
    supabase
      .from('Cards')
      .select('id, to_name, from_name, created_at, blocks')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus('error');
          return;
        }
        setLetters((data ?? []) as LetterRow[]);
        setStatus('ok');
      });
  }, []);
 
  return (
    <div className="min-h-screen bg-[#E5D8BB] text-black px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Letters</h1>
          <Link
            href="/make"
            className="bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition duration-300"
          >
            Write a letter
          </Link>
        </div>
 
        {status === 'loading' && <p>Loading letters…</p>}
        {status === 'error' && <p>Couldn't load letters: {errorMsg}</p>}
        {status === 'ok' && letters.length === 0 && <p>No letters yet.</p>}
 
        {status === 'ok' && letters.length > 0 && (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
            {letters.map(letter => (
              <Link
                key={letter.id}
                href={`/letter/${letter.id}`}
                className="group bg-[#FBF6EA] rounded-lg overflow-hidden hover:-translate-y-1 hover:scale-105 transition duration-300"
              >

                <div
                  className="relative overflow-hidden mx-auto mt-4 rounded"
                  style={{ width: LETTER_W * SCALE, height: LETTER_H * SCALE }}
                >
                  <div
                    className="absolute top-0 left-0 bg-[url('/background1.png')] origin-top-left"
                    style={{ width: LETTER_W, height: LETTER_H, transform: `scale(${SCALE})` }}
                  >
                    {(letter.blocks ?? []).map(b => (
                      <div
                        key={b.id}
                        style={{ position: 'absolute', left: b.x, top: b.y, width: b.width, height: b.height }}
                      >
                        {b.type === 'text' ? (
                          <div className="p-2 w-full h-full break-words whitespace-normal overflow-hidden">
                            {b.content}
                          </div>
                        ) : (
                          <img src={b.content} alt="" className="w-full h-full object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
 
                <div className="px-4 py-3">
                  <p className="font-semibold truncate">To: {letter.to_name ?? 'Someone'}</p>
                  <p className="text-sm truncate">From: {letter.from_name ?? 'Anonymous'}</p>
                  <p className="text-xs text-black/50 mt-1">
                    {new Date(letter.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}