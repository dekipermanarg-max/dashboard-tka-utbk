"use client"
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'

const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabase=url&&key?createClient(url,key):null

export default function Login(){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{if(supabase)supabase.auth.getUser().then(({data})=>{if(data.user)window.location.href='/'})},[])
 async function submit(e:React.FormEvent){e.preventDefault();if(!supabase){setMessage('Environment Supabase belum dipasang.');return}setBusy(true);setMessage('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else window.location.href='/';setBusy(false)}
 async function signup(){if(!supabase){setMessage('Environment Supabase belum dipasang.');return}setBusy(true);const {error}=await supabase.auth.signUp({email,password});setMessage(error?error.message:'Akun dibuat. Jika verifikasi email aktif, cek inbox lalu login.');setBusy(false)}
 return <div className="page"><header className="topbar"><div className="brand">TKA <span>×</span> UTBK</div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/import">Import Data</Link></nav></header><main className="main"><section className="panel" style={{maxWidth:520,margin:'40px auto'}}><div className="eyebrow">Secure Access</div><h1 className="title">Login</h1><p className="sub">Login diperlukan untuk membaca dan mengubah data dashboard.</p><form onSubmit={submit}><label className="label">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:'100%',padding:12,margin:'6px 0 14px',borderRadius:10,border:'1px solid #ddd'}}/><label className="label">Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required minLength={6} style={{width:'100%',padding:12,margin:'6px 0 16px',borderRadius:10,border:'1px solid #ddd'}}/><div className="actions"><button className="btn primary" disabled={busy}>{busy?'Memproses…':'Login'}</button><button type="button" className="btn secondary" onClick={signup} disabled={busy}>Buat Akun</button></div></form>{message&&<p className="sub" style={{marginTop:16}}>{message}</p>}</section></main></div>
}
