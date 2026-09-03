"use client";

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react";

type decoration = {
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    content: string;
    file?: File;
}

const Stamps = [
    'stamp1', 
    'stamp2', 
    'stamp3', 
    'stamp4', 
    'stamp5'] //placeholders untill I actually upload the art (soon soon trust)

const decos = [
    'deco1', 
    'deco2', 
    'deco3', 
    'deco4', 
    'deco5',] // l;alalaalala more placeholders untill I find time to draw good stamps



export default function letterCover() {
    const [toWho, setToWho] = useState('');
    const [fromWho, setFromWho] = useState('');
    const [stamp, setStamp] = useState(Stamps[0]);
    const [deco, setDeco] = useState<decoration[]>([]);
    const [selectedId, setSelectedId] = useState('');

    function dragStart(e: React.MouseEvent, id: string) { //tweeked some stuff from the prev page mostly changing deco variables
        e.stopPropagation();
        setSelectedId(id);
        const decos = deco.find(d => d.id === id);
        if (!decos) return;
        const offsetX = e.clientX - decos.x;
        const offsetY = e.clientY - decos.y

        function handleMouse(e: MouseEvent) {
            setDeco(prev => prev.map(d =>
                d.id === id ? { ...d, x: e.clientX - offsetX,  y: e.clientY - offsetY }: d
        ))
        }

        function stopDrag() {
            window.removeEventListener('mousemove', handleMouse)
            window.removeEventListener('mouseup', stopDrag)
        }

        window.addEventListener('mousemove', handleMouse)
        window.addEventListener('mouseup', stopDrag)
    }


async function saveEnvelope() {
  const { data, error } = await supabase
    .from('envelopes')
    .insert({

      stamp: stamp,
      decorations: deco
    })
    .select();
}

}