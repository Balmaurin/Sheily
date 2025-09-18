"use client";

import React, { useState } from "react";
import type { ScoreMeta } from "../providers/types";

export function Field({label, children}:{label:string; children:React.ReactNode}){
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function Tags({value, onChange}:{value:string[]; onChange:(v:string[])=>void}){
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((t,i)=>(
          <span key={t+i} className="px-2 py-1 rounded-lg bg-muted text-xs">{t}</span>
        ))}
      </div>
      <input 
        className="mt-2 w-full rounded-xl border bg-background px-3 py-2" 
        placeholder="Añade etiqueta y pulsa Enter" 
        value={input} 
        onChange={e=>setInput(e.target.value)} 
        onKeyDown={e=>{ 
          if(e.key==='Enter' && input.trim()){ 
            onChange([...value, input.trim()]); 
            setInput(''); 
          } 
        }} 
      />
    </div>
  );
}

export function Notice({meta}:{meta: ScoreMeta}){
  return (
    <div className={(meta.pass? 'bg-emerald-600/10 text-emerald-700':'bg-rose-600/10 text-rose-700') + ' rounded-xl p-3 text-sm'}>
      <div className="font-semibold">Calificación: {meta.score}/10 · Tokens: {meta.tokens}</div>
      {meta.notes.length>0 && (
        <ul className="list-disc pl-5 mt-1">
          {meta.notes.map((n,i)=>(<li key={i}>{n}</li>))}
        </ul>
      )}
    </div>
  );
}

export function Tips({title, points}:{title:string; points:string[]}){
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      <ul className="text-sm list-disc pl-5 space-y-1">
        {points.map((p,i)=>(<li key={i}>{p}</li>))}
      </ul>
    </div>
  );
}

export function Stat({label, value}:{label:string; value:number}){
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function Bar({label, value}:{label:string; value:number}){
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{width: `${value}%`}}/>
      </div>
    </div>
  );
}
