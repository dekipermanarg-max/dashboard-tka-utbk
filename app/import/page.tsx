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
 const [parsed,setParsed]=useState<Parsed|null>(null)
 const [type,setType]=useState('')
 const [fileName,setFileName]=useState('')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 const [user,setUser]=useState<any>(null)

 useEffect(()=>{
  if(!supabase)return
  supabase.auth.getUser().then(({data})=>setUser(data.user))
  const {data}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null))
  return()=>data.subscription.unsubscribe()
 },[])

 const stats=useMemo(()=>{
  if(!parsed)return null
  const email=parsed.rows.map(r=>(r.Email||r.email||'').trim().toLowerCase()).filter(Boolean)
  const unique=new Set(email).size
  return {total:parsed.rows.length,unique,duplicates:email.length-unique}
 },[parsed])

 function handleFile(file:File){
  setMessage('')
  setFileName(file.name)
  Papa.parse<Record<string,string>>(file,{header:true,skipEmptyLines:true,complete:r=>{
   const headers=r.meta.fields||[]
   setParsed({headers,rows:r.data})
   setType(detect(headers))
  }})
 }

 async function confirm(){
  if(!parsed||!supabase){setMessage('Supabase belum terhubung. Pasang environment variable terlebih dahulu.');return}
  if(!user){setMessage('Silakan login terlebih dahulu untuk melakukan import.');return}
  if(type==='UNKNOWN'){setMessage('Format CSV tidak dikenali. Pastikan header sesuai template TKA, UTBK, atau Master Siswa.');return}
  setBusy(true);setMessage('Memvalidasi dan menyimpan import…')
  try{
   if(type==='MASTER SISWA'){
    let total=0,newRows=0,changedRows=0,sameRows=0,invalidRows=0
    for(const r of parsed.rows){
     const email=(r.Email||r.email||'').trim().toLowerCase()
     const name=(r['Nama Siswa']||r.Nama||r.name||'').trim()
     if(!email||!name){invalidRows++;continue}
     total++
     const {data:old}=await supabase.from('students').select('id,user_id,name,school,rombel,branch,mentor,role').eq('email',email).maybeSingle()
     const payload={email,user_id:r['User ID']||null,name,school:r.Sekolah||null,rombel:r.Rombel||null,branch:r.Cabang||null,mentor:r.Mentor||null,role:r.Role||null,raw_data:r,updated_at:new Date().toISOString()}
     const {error}=await supabase.from('students').upsert(payload,{onConflict:'email'})
     if(error)throw error
     if(!old)newRows++
     else if(JSON.stringify({...old,name:old.name||''})===JSON.stringify({...old,name:payload.name,school:payload.school,rombel:payload.rombel,branch:payload.branch,mentor:payload.mentor,role:payload.role,user_id:payload.user_id}))sameRows++
     else changedRows++
    }
    const {error:batchError}=await supabase.from('import_batches').insert({file_name:fileName||'import.csv',import_type:'MASTER SISWA',total_rows:parsed.rows.length,new_rows:newRows,changed_rows:changedRows,same_rows:sameRows,invalid_rows:invalidRows,status:'completed'})
    if(batchError)throw batchError
    setMessage(`Import Master Siswa berhasil: ${newRows} baru, ${changedRows} berubah, ${sameRows} sama, ${invalidRows} invalid.`)
   } else {
    const assessment_type=type==='UTBK'?'UTBK':'TKA'
    const eventNames=[...new Set(parsed.rows.map(r=>(r['Nama Event']||r.Event||'').trim()).filter(Boolean))]
    if(eventNames.length!==1)throw new Error('File harus berisi tepat satu Nama Event/TO.')
    const event_name=eventNames[0]
    const emails=[...new Set(parsed.rows.map(r=>(r.Email||r.email||'').trim().toLowerCase()).filter(Boolean))]
    if(!emails.length)throw new Error('Tidak ada email siswa yang valid.')
    const {data:students,error:studentError}=await supabase.from('students').select('id,email').in('email',emails)
    if(studentError)throw studentError
    const studentMap=new Map((students||[]).map((s:any)=>[String(s.email||'').toLowerCase(),s]))
    const {data:existing,error:existingError}=await supabase.from('assessments').select('id,email,student_id,scores,raw_data,status,jenjang,branch').eq('assessment_type',assessment_type).eq('event_name',event_name).in('email',emails)
    if(existingError)throw existingError
    const existingMap=new Map((existing||[]).map((a:any)=>[String(a.email||'').toLowerCase(),a]))
    const scoreKeys=assessment_type==='TKA'?TKA:UTBK
    let newRows=0,changedRows=0,sameRows=0,invalidRows=0
    for(const r of parsed.rows){
     const email=(r.Email||r.email||'').trim().toLowerCase()
     const student=studentMap.get(email)
     if(!email||!student){invalidRows++;continue}
     const scores:Record<string,string>={}
     for(const [k,v] of Object.entries(r))if(scoreKeys.includes(k)&&v!=='')scores[k]=v
     if(!Object.keys(scores).length){invalidRows++;continue}
     const payload={student_id:student.id,email,assessment_type,event_name,status:r.Status||r['Status Mapel Wajib']||r['Status Pengerjaan']||null,jenjang:r.Jenjang||null,branch:r.Cabang||null,scores,raw_data:r}
     const old=existingMap.get(email)
     const {error}=await supabase.from('assessments').upsert(payload,{onConflict:'email,assessment_type,event_name'})
     if(error)throw error
     if(!old)newRows++
     else if(JSON.stringify({student_id:old.student_id,status:old.status,jenjang:old.jenjang,branch:old.branch,scores:old.scores})===JSON.stringify({student_id:payload.student_id,status:payload.status,jenjang:payload.jenjang,branch:payload.branch,scores:payload.scores}))sameRows++
     else changedRows++
    }
    const {error:batchError}=await supabase.from('import_batches').insert({file_name:fileName||'import.csv',import_type:assessment_type,total_rows:parsed.rows.length,new_rows:newRows,changed_rows:changedRows,same_rows:sameRows,invalid_rows:invalidRows,status:'completed'})
    if(batchError)throw batchError
    setMessage(`Import ${event_name} berhasil: ${newRows} baru, ${changedRows} berubah, ${sameRows} sama, ${invalidRows} invalid.`)
   }
  }catch(e:any){setMessage(`Import gagal: ${e?.message||'Unknown error'}`)}finally{setBusy(false)}
 }

 return <div className="page"><header className="topbar"><div className="brand">TKA <span>×</span> UTBK</div><nav className="nav"><Link href="/">Dashboard</Link><Link className="active" href="/import">Import Data</Link><Link href="/login">Login</Link></nav></header><main className="main"><div className="hero"><div><div className="eyebrow">Data Pipeline</div><h1 className="title">Import Data</h1><p className="sub">Upload → validasi → preview → Confirm Update.</p></div></div><section className="panel"><div className="upload"><strong>Upload CSV TKA, UTBK, atau Master Siswa</strong><div><input type="file" accept=".csv,text/csv" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/></div></div>{!user&&<p className="sub" style={{marginTop:12}}>Login diperlukan sebelum data ditulis ke database.</p>}{parsed&&<><div className="cards" style={{marginTop:16}}><div className="card"><div className="label">Tipe</div><div className="value" style={{fontSize:20}}>{type}</div></div><div className="card"><div className="label">Total</div><div className="value">{stats?.total}</div></div><div className="card"><div className="label">Email unik</div><div className="value">{stats?.unique}</div></div><div className="card"><div className="label">Duplikat</div><div className="value">{stats?.duplicates}</div></div></div><div className="preview"><table className="table"><thead><tr>{parsed.headers.slice(0,8).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{parsed.rows.slice(0,15).map((r,i)=><tr key={i}>{parsed.headers.slice(0,8).map(h=><td key={h}>{r[h]}</td>)}</tr>)}</tbody></table></div><div className="actions"><button className="btn primary" onClick={confirm} disabled={busy||type==='UNKNOWN'||!user}>{busy?'Mengimport…':'Confirm Update'}</button><button className="btn secondary" onClick={()=>{setParsed(null);setFileName('');setMessage('')}}>Reset</button></div>{message&&<p className="sub" style={{marginTop:14}}>{message}</p>}</>}</section></main></div>}
