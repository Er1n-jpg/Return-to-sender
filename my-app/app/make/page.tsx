"use client";
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

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
  const [blocks, setBlocks] = useState<block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const editingText = target.isContentEditable;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingText) {
        setBlocks(prev => prev.filter(b => b.id !== selectedId));
        setSelectedId(null);
      } else if ((e.key === 'Delete' )){

      }

    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [selectedId]);


  function addText() {
    setBlocks(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'text',
      x: 400,
      y: 400,
      content: 'Add Text Here :)'
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
        b.id === id ?
          {
            ...b, x: Math.max(0, Math.min(e.clientX - offsetX, 720 - (b.width ?? 100))),
            y: Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - 40 - (b.height ?? 40)))
          } : b
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
    const startWidth = block.width ?? 160;
    const startY = e.clientY;

    function handleMouse(e: MouseEvent) {
      const newWidth = Math.max(40, startWidth + (e.clientX - startX));
      setBlocks(prev => prev.map(b =>
        b.id === id ? { ...b, width: newWidth, height: newWidth } : b
      ));
    }

    function stopResize() {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseup', stopResize);
    }

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseup', stopResize);

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
    <div className="flex h-screen bg-[#E5D8BB] justify-center items-center">

      <div className="mt-5 mb-5 h-[calc(100vh-2.5rem)] bg-[url('/background1.png')] w-180 rounded shadow-2xl shadow-[#968663] z-1 overflow-hidden relative" onClick={() => setSelectedId(null)}>

        {blocks.map(b => (
          <div
            key={b.id}
            onMouseDown={(e) => {
              setSelectedId(b.id);
              dragStart(e, b.id);
            }}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              cursor: 'grab',
              outline: selectedId === b.id ? '2px solid #3b82f6' : 'none'
            }}
          >
            {b.type === 'text' ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(b.id);
                }}
                onBlur={(e) => {
                updateTxt(b.id, e.currentTarget.textContent || '');
                setEditingId(null);
                }}
                style = {{ width: b.width, height: b.height}}
                className="bg-transparent text-black p-2 break-words whitespace-normal overflow-auto"
              >
                {b.content}
              </div>
            ) : (
              <div style={{ position: 'relative', width: b.width, height: b.height }}>
                <img src={b.content} className="w-full h-full object-cover rounded" />
                <div
                  onMouseDown={(e) => resizeStart(e, b.id)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    cursor: 'nwse-resize',
                    background: 'white',
                  }}
                />
              </div>


            )}
          </div>
        ))}

        <div className="navbar fixed bottom-4 left-4 flex gap-4 bg-black py-5 px-5 rounded-lg z-2">
          <button onClick={addText} className="bg-white text-black px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-110 transition duration-300 ">
            Add text
          </button>

          <label htmlFor="fileUpload" className="bg-white text-black py-4 px-5 rounded-lg hover:scale-110 transition duration-300 hover:cursor-pointer">
            Upload an image
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image*/"
            onChange={fileInput}
            className="hidden"
          ></input>

          <button onClick={saveLetter} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-110 transition duration-300 hover:cursor-pointer ml-20">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function handleMouse(this: Window, ev: MouseEvent) {
  throw new Error('Function not implemented.');
}
