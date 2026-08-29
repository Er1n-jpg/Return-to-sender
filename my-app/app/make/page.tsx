"use client";
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

type block = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  content?: string;
  file?: File;
}

export default function MakePage() {
  const [blocks, setBlocks] = useState<block[]>([]);

function addText() {
  setBlocks(prev => [...prev, {
    id: crypto.randomUUID(),
    type: 'text',
    x: 400,
    y: 400,
    content: 'yay'
  }])
}
  
  function addImg(file: File) {
    const url = URL.createObjectURL(file);
    setBlocks(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'image',
      x: 100,
      y: 100,
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
        b.id === id ? { ...b, x: e.clientX - offsetX, y: e.clientY - offsetY } : b
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

  async function saveLetter() {
    const uploadedBoxes = await Promise.all(blocks.map(async (b) => {
      if (b.type === 'image' && b.file) {
        const path = `${Date.now()}-${b.file.name}`;
        await supabase.storage.from('letter-images').upload(path, b.file);
        const { data: urlData } = supabase.storage.from('letter-images').getPublicUrl(path);
        return { ...b, content: urlData.publicUrl, file: undefined };
      }
      return b;
    }));

    const { data, error } = await supabase
      .from('letters')
      .insert({ title: 'My letters', blocks: uploadedBoxes })
      .select();

    console.log(data, error);
  }

  return (
    <div className="flex h-screen bg-[#C9BEA7] justify-center items-center">

      <div className = "h-screen bg-[url('/background1.png')] w-200"> </div>

      {blocks.map(b => (
        <div
          key={b.id}
          onMouseDown={(e) => dragStart(e, b.id)}
          style={{ position: 'absolute', left: b.x, top: b.y, cursor: 'grab' }}
        >
          {b.type === 'text' ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateTxt(b.id, e.currentTarget.textContent || '')}
              className="bg-transparent text-black p-2 "
            >
              {b.content}
            </div>
          ) : (
            <img src={b.content} className="w-40" />
          )}
        </div>
      ))}

      <div className="navbar fixed bottom-4 left-4 flex gap-2 bg-black py-5 px-5 rounded-lg">
        <button onClick={addText} className="bg-white text-black px-4 py-2 rounded mr-20">
          Add text
        </button>
        <input type="file" accept="image/*" onChange={fileInput} />

        <button onClick={saveLetter} className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer ">
          Save
        </button>
      </div>
    </div>
  );
}