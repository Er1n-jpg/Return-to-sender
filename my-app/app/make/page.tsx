"use client";

import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type block = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  file?: File;
}

export default function MakePage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toName, setToName] = useState('');
  const [fromName, setFromName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && editingId !== selectedId) {
        setBlocks(prev => prev.filter(b => b.id !== selectedId));
        setSelectedId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingId]);

  
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  function addText() {
    setBlocks(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'text',
      x: 400,
      y: 400,
      width: 160,
      height: 60,
      content: 'Add your text here!'
    }])
  }

  function addImg(file: File) {
    const url = URL.createObjectURL(file);
    setBlocks(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'image',
      x: 100,
      y: 100,
      width: 160,
      height: 160,
      content: url,
      file
    }])
  }

  function fileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) addImg(file);
  }

  function dragStart(e: React.MouseEvent, id: string) {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const offsetX = e.clientX - block.x;
    const offsetY = e.clientY - block.y;

    function handleMouse(e: MouseEvent) {
      setBlocks(prev => prev.map(b =>
        b.id === id
          ? {
              ...b,
              x: Math.max(0, Math.min(e.clientX - offsetX, 720 - (b.width ?? 100))),
              y: Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - 40 - (b.height ?? 40)))
            }
          : b
      ));
    }

    function stopDrag() {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mouseup', stopDrag)
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mouseup', stopDrag)
  }

  function updateTxt(id: string, newText: string) {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, content: newText } : b
    ))
  }

  function resizeStart(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = block.width ?? 160;
    const startHeight = block.height ?? 160;

    function handleMouse(event: MouseEvent) {
      setBlocks(prev => prev.map(b => {
        if (b.id !== id) return b;
        return {
          ...b,
          width: Math.max(40, startWidth + (event.clientX - startX)),
          height: Math.max(40, startHeight + (event.clientY - startY)),
        };
      }));
    }

    function stopResize() {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseup', stopResize);
    }

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseup', stopResize);
  }

  function openSaveModal() {
    setSelectedId(null);
    setEditingId(null);
    setShowSaveModal(true);
  }

  async function saveLetter(e: React.FormEvent) {
    e.preventDefault();
    if (!toName.trim() || !fromName.trim()) return;
    setSaving(true);

    try {
      const uploadedBlocks = await Promise.all(blocks.map(async (b) => {
        if (b.type === 'image' && b.file) {
          const ext = b.file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('letter-images').upload(path, b.file);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from('letter-images').getPublicUrl(path);
          const { file, ...rest } = b;
          return { ...rest, content: urlData.publicUrl };
        }
        return b;
      }));

      const { error } = await supabase
        .from('Cards')
        .insert({
          title: `To ${toName.trim()}`,
          to_name: toName.trim(),
          from_name: fromName.trim(),
          blocks: uploadedBlocks,
        });

      if (error) throw error;

      setShowSaveModal(false);
      router.push('/');
    } catch (err) {
      console.error('Save failed:', err);
      const message = (err as { message?: string })?.message ?? 'unknown error';
      setToast(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#E5D8BB] justify-center items-center">
      <div
        className="mt-5 mb-5 h-[calc(100vh-2.5rem)] bg-[url('/background1.png')] w-180 shadow-[#968663] z-1 overflow-hidden relative"
        onClick={() => setSelectedId(null)}
      >
        {blocks.map(b => (
          <div
            key={b.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              setSelectedId(b.id);
              dragStart(e, b.id);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              cursor: 'grab',
              outline: selectedId === b.id ? '2px solid #6192e2' : 'none'
            }}
          >
            {b.type === 'text' ? (
              <div style={{ position: 'relative', width: b.width, height: b.height }}>
                <div
                  contentEditable={editingId === b.id}
                  suppressContentEditableWarning
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(b.id);
                  }}
                  onBlur={(e) => {
                    updateTxt(b.id, e.currentTarget.textContent || '');
                    setEditingId(null);
                  }}
                  className="bg-transparent text-black p-2 w-full h-full break-words whitespace-normal overflow-auto"
                >
                  {b.content}
                </div>
                <div onMouseDown={(e) => resizeStart(e, b.id)} style={resizeHandleStyle} />
              </div>
            ) : (
              <div style={{ position: 'relative', width: b.width, height: b.height }}>
                <img src={b.content} className="w-full h-full object-cover rounded" />
                <div onMouseDown={(e) => resizeStart(e, b.id)} style={resizeHandleStyle} />
              </div>
            )}
          </div>
        ))}

        <div className="navbar fixed bottom-4 left-4 flex gap-4 bg-black py-5 px-5 rounded-lg z-2">
          <button
            onClick={addText}
            className="bg-white text-black px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-110 transition duration-300"
          >
            Add text
          </button>

          <label
            htmlFor="fileUpload"
            className="bg-white text-black py-4 px-5 rounded-lg hover:scale-110 transition duration-300 hover:cursor-pointer"
          >
            Upload an image
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={fileInput}
            className="hidden"
          />

          <button
            onClick={openSaveModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-110 transition duration-300 hover:cursor-pointer ml-20"
          >
            Save
          </button>
        </div>
      </div>

      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => !saving && setShowSaveModal(false)}
        >
          <form
            onSubmit={saveLetter}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FBF6EA] text-black rounded-lg shadow-2xl p-6 w-80 flex flex-col gap-4"
          >
            <h2 className="text-xl font-semibold">One more step :D</h2>

            <label className="flex flex-col gap-1 text-sm">
              To
              <input
                autoFocus
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="Insert text here (or not)"
                className="border border-[#C9B98F] rounded px-3 py-2 bg-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              From
              <input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Insert text here (or not)"
                className="border border-[#C9B98F] rounded px-3 py-2 bg-white"
                required
              />
            </label>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:cursor-pointer disabled:opacity-60"
              >
                {saving ? 'Sending…' : 'Send letter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

const resizeHandleStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 12,
  height: 12,
  cursor: 'nwse-resize',
  background: 'white',
  border: '1px solid black',
  borderRadius: 2,
};