"use client"
import {useMemo,useState,useEffect} from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import {createClient} from '@supabase/supabase-js'

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabase=supabaseUrl&&supabaseKey?createClient(supabaseUrl,supabaseKey):null

type Parsed={headers:string[];rows:Record<string,string>[]}
function detect(headers:string[]){const h=headers.map(x=>x.toLowerCase().trim());if(h.includes('nama event')&&h.includes('mat'))return 'TKA';if(h.includes('pu')&&h.includes('ppu')&&h.includes('pbm'))return 'UTBK';if((h.includes('nama siswa')||h.includes('nama'))&&h.includes('rombel')&&h.includes('mentor'))return 'MASTER SISWA';return 'UNKNOWN'}
const TKA=['MAT','B.IND','ENG','MAT LANJ','B.IND LANJ','ENG LANJ','FIS','KIM','BIO','EKO','GEO','SOS','SEJ','PPKN']
const UTBK=['PU','PPU','PBM','PK','LBI Saintek','LBI Soshum','LBE','PM']
export default function ImportPage(){
 const [parsed,setParsed]=useState<Parsed|null>(null);const [type,setType]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [user,setUser]=useState<any>(null)
 useEffect(()=>{if(!supabase)return;supabase.auth.getUser().then(({data})=>setUser(data.user));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>data.subscription.unsubscribe()},[])
 const stats=useMemo(()=>{if(!parsed)return null;const email=parsed.rows.map(r=>(r.Email||r.email||'').trim().toLowerCase()).filter(Boolean);const unique=new Set(email).size;return {total:parsed.rows.length,unique,duplicates:email.length-unique}},[parsed])
 function handleFile(file:File){setMessage('');Papa.parse<Record<string,string>>(file,{header:true,skipEmptyLines:true,complete:r=>{const headers=r.meta.fields||[];setParsed({headers,rows:r.data});setType(detect(headers))}})}
 async function confirm(){if(!parsed||!supabase){setMessage('Supabase belum terhubung. Pasang environment variable terlebih dahulu.');return}if(!user){setMessage('Silakan login terlebih dahulu untuk melakukan import.');return}setBusy(true);setMessage('Memproses import…');try{
  if(type==='MASTER SISWA'){
   for(const r of parsed.rows){const email=(r.Email||r.email||'').trim().toLowerCase();if(!email)continue;const {error}=await supabase.from('students').upsert({email,user_id:r['User ID']||null,name:r['Nama Siswa']||r.Nama||'',school:r.Sekolah||null,rombel:r.Rombel||null,branch:r.Cabang||null,mentor:r.Mentor||null,role:r.Role||null,raw_data:r},{onConflict:'email'});if(error)throw error}
  } else {
   for(const r of parsed.rows){const email=(r.Email||r.email||'').trim().toLowerCase();if(!email)continue;const assessment_type=type==='UTBK'?'UTBK':'TKA';const event_name=r['Nama Event']||r.Event||'Imported';const scores:Record<string,string>={};for(const [k,v] of Object.entries(r))if((assessment_type==='TKA'?TKA:UTBK).includes(k)&&v!=='')scores[k]=v;const {error}=await supabase.from('assessments').upsert({email,assessment_type,event_name,status:r.Status||r['Status Mapel Wajib']||r['Status Pengerjaan']||null,jenjang:r.Jenjang||null,branch:r.Cabang||null,scores,raw_data:r},{onConflict:'email,assessment_type,event_name'});if(error)throw error}
  }
  await supabase.from('assessments').update({student_id:(await supabase.from('students').select('id,email')).data?.find((s:any)=>s.email) ? undefined : undefined}).eq('email','__never__')
  setMessage(`Import ${parsed.rows.length} baris berhasil.`)
 }catch(e:any){setMessage(`Import gagal: ${e?.message||'Unknown error'}`)}finally{setBusy(false)}}
 return <div className="page"><header className="topbar"><div className="brand">TKA <span>×</span> UTBK</div><nav className="nav"><Link href="/">Dashboard</Link><Link className="active" href="/import">Import Data</Link><Link href="/login">Login</Link></nav></header><main className="main"><div className="hero"><div><div className="eyebrow">Data Pipeline</div><h1 className="title">Import Data</h1><p className="sub">Upload → validasi → preview → Confirm Update.</p></div></div><section className="panel"><div className="upload"><strong>Upload CSV TKA, UTBK, atau Master Siswa</strong><div><input type="file" accept=".csv,text/csv" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/></div></div>{!user&&<p className="sub" style={{marginTop:12}}>Login diperlukan sebelum data ditulis ke database.</p>}{parsed&&<><div className="cards" style={{marginTop:16}}><div className="card"><div className="label">Tipe</div><div className="value" style={{fontSize:20}}>{type}</div></div><div className="card"><div className="label">Total</div><div className="value">{stats?.total}</div></div><div className="card"><div className="label">Email unik</div><div className="value">{stats?.unique}</div></div><div className="card"><div className="label">Duplikat</div><div className="value">{stats?.duplicates}</div></div></div><div className="preview"><table className="table"><thead><tr>{parsed.headers.slice(0,8).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{parsed.rows.slice(0,15).map((r,i)=><tr key={i}>{parsed.headers.slice(0,8).map(h=><td key={h}>{r[h]}</td>)}</tr>)}</tbody></table></div><div className="actions"><button className="btn primary" onClick={confirm} disabled={busy||type==='UNKNOWN'}>{busy?'Mengimport…':'Confirm Update'}</button><button className="btn secondary" onClick={()=>{setParsed(null);setMessage('')}}>Reset</button></div>{message&&<p className="sub" style={{marginTop:14}}>{message}</p>}</>}</section></main></div>}
