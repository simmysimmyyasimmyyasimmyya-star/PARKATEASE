import {useState,useEffect} from 'react'

const SEED={
 points:30, code:'PARK-RAHUL', fees:0, commission:0,
 spots:[
  {id:1,name:'Colaba Causeway Lane',city:'Mumbai',rate:60,free:6,cap:12,status:'vacant',at:Date.now()},
  {id:2,name:'Gateway Parking Plaza',city:'Mumbai',rate:80,free:2,cap:20,status:'filling',at:Date.now()},
  {id:3,name:'Bandra Linking Road',city:'Mumbai',rate:50,free:0,cap:10,status:'full',at:Date.now()},
  {id:4,name:'Fort Horniman Circle',city:'Mumbai',rate:70,free:8,cap:15,status:'vacant',at:Date.now()},
  {id:5,name:'Connaught Place Block B',city:'Delhi',rate:90,free:5,cap:25,status:'vacant',at:Date.now()},
  {id:6,name:'MG Road Metro Lot',city:'Bengaluru',rate:40,free:3,cap:14,status:'filling',at:Date.now()}],
 bookings:[]}
const KEY='parkatease-v1', FEE=30, HOLD=20*60*1000, ACCOUNTS={
 'driver@demo':{pw:'demo123',role:'driver'},'attendant@demo':{pw:'demo123',role:'attendant',spot:1}}
const DOT={vacant:'bg-green-500',filling:'bg-amber-500',full:'bg-red-500'}
const LABEL={vacant:'Vacant',filling:'Filling up',full:'Full'}
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m+' min ago'}

function useStore(){
 const [db,set]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))||SEED}catch{return SEED}})
 const save=f=>set(d=>{const n=f(structuredClone(d));localStorage.setItem(KEY,JSON.stringify(n));return n})
 useEffect(()=>{const h=e=>e.key===KEY&&set(JSON.parse(e.newValue));addEventListener('storage',h);return()=>removeEventListener('storage',h)},[])
 useEffect(()=>{const i=setInterval(()=>save(d=>{ // expire old holds, return slots
  d.bookings.forEach(b=>{if(b.status==='held'&&Date.now()-b.at>HOLD){b.status='expired';d.spots.find(s=>s.id===b.spotId).free++}});return d}),15000);return()=>clearInterval(i)},[])
 return [db,save]
}

export default function App(){
 const [db,save]=useStore()
 const [user,setUser]=useState(null)
 if(!user)return <Login onLogin={setUser}/>
 return <div className="min-h-screen">
  <header><div className="bg-taxi px-4 py-3 flex items-center justify-between">
   <b className="text-xl font-extrabold">ParkAtEase</b>
   <button className="text-sm underline" onClick={()=>setUser(null)}>Log out</button></div><div className="checker"/></header>
  <main className="max-w-xl mx-auto p-4">
   {user.role==='driver'?<Driver db={db} save={save}/>:<Attendant db={db} save={save} spotId={user.spot}/>}
  </main></div>
}

function Login({onLogin}){
 const [id,setId]=useState(''),[pw,setPw]=useState(''),[err,setErr]=useState('')
 const go=e=>{e.preventDefault();const a=ACCOUNTS[id.trim()];a&&a.pw===pw?onLogin(a):setErr('Wrong email or password. Try a demo account below.')}
 return <div className="min-h-screen bg-taxi flex flex-col">
  <div className="checker"/>
  <div className="flex-1 grid place-items-center p-4"><form onSubmit={go} className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 border-4 border-ink">
   <div className="h-10 relative overflow-hidden" aria-hidden><span className="park absolute text-3xl">🚕</span><span className="absolute right-6 top-1 border-2 border-dashed border-ink rounded px-2 text-sm font-bold">P</span></div>
   <h1 className="text-3xl font-extrabold leading-tight">No more circling the block.</h1>
   <input className="w-full border-2 border-ink rounded-lg p-3" placeholder="Email" value={id} onChange={e=>setId(e.target.value)}/>
   <input className="w-full border-2 border-ink rounded-lg p-3" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/>
   {err&&<p className="text-red-700 text-sm" role="alert">{err}</p>}
   <button className="w-full bg-ink text-taxi font-bold rounded-lg p-3">Log in</button>
   <p className="text-sm text-neutral-600">Demo: <code>driver@demo</code> or <code>attendant@demo</code>, password <code>demo123</code></p>
  </form></div></div>
}

function Driver({db,save}){
 const [tab,setTab]=useState('find'),[city,setCity]=useState('Mumbai'),[pick,setPick]=useState(null)
 const cities=[...new Set(db.spots.map(s=>s.city))]
 return <>
  <nav className="flex gap-2 mb-4">{['find','bookings','rewards'].map(t=>
   <button key={t} onClick={()=>setTab(t)} className={'flex-1 rounded-full py-2 font-semibold border-2 border-ink '+(tab===t?'bg-ink text-taxi':'bg-white')}>{{find:'Find spot',bookings:'My bookings',rewards:'ParkPoints'}[t]}</button>)}</nav>
  {tab==='find'&&<>
   <select className="w-full border-2 border-ink rounded-lg p-2 mb-3" value={city} onChange={e=>setCity(e.target.value)}>{cities.map(c=><option key={c}>{c}</option>)}</select>
   <ul className="space-y-3">{db.spots.filter(s=>s.city===city).map(s=>
    <li key={s.id} className="bg-white rounded-xl p-4 border-2 border-ink flex items-center gap-3">
     <span className={'w-4 h-4 rounded-full '+DOT[s.status]} title={LABEL[s.status]}/>
     <div className="flex-1"><b>{s.name}</b><p className="text-sm text-neutral-600">{LABEL[s.status]}: {s.free}/{s.cap} free. Rs {s.rate}/hr paid on site. Updated {ago(s.at)}</p></div>
     <button disabled={s.free<1} onClick={()=>setPick(s)} className="bg-taxi border-2 border-ink rounded-lg px-3 py-2 font-bold disabled:opacity-40">Reserve</button></li>)}</ul></>}
  {tab==='bookings'&&<Bookings db={db}/>}
  {tab==='rewards'&&<Rewards db={db}/>}
  {pick&&<Reserve spot={pick} db={db} save={save} close={()=>{setPick(null);setTab('bookings')}}/>}
 </>
}

function Reserve({spot,db,save,close}){
 const [veh,setVeh]=useState(''),[paying,setPaying]=useState(false)
 const free=db.points>=60, fee=free?0:FEE
 const pay=()=>{setPaying(true);setTimeout(()=>{save(d=>{ // mock payment succeeds
  const s=d.spots.find(x=>x.id===spot.id);if(s.free<1)return d // spot filled during payment
  s.free--;if(s.free===0)s.status='full'
  if(free)d.points-=60;d.fees+=fee
  d.bookings.unshift({id:Date.now(),code:Math.random().toString(36).slice(2,8).toUpperCase(),spotId:spot.id,veh:veh.toUpperCase(),fee,status:'held',at:Date.now()});return d});close()},900)}
 return <Modal><h2 className="text-xl font-extrabold">Reserve at {spot.name}</h2>
  <input className="w-full border-2 border-ink rounded-lg p-3 my-3" placeholder="Vehicle number, e.g. MH01AB1234" value={veh} onChange={e=>setVeh(e.target.value)}/>
  <p className="mb-3">Reservation fee: <b>{free?'Free (60 ParkPoints used)':'Rs '+FEE}</b>. We hold your spot for 20 minutes. Pay the parking charge to the attendant on arrival.</p>
  <button disabled={!veh||paying} onClick={pay} className="w-full bg-ink text-taxi font-bold rounded-lg p-3 disabled:opacity-50">{paying?'Processing mock payment...':free?'Reserve for free':'Pay Rs '+FEE+' (mock)'}</button>
  <button onClick={close} className="w-full mt-2 underline">Cancel</button></Modal>
}

function Bookings({db}){
 const [,tick]=useState(0);useEffect(()=>{const i=setInterval(()=>tick(x=>x+1),1000);return()=>clearInterval(i)},[])
 if(!db.bookings.length)return <p className="text-center text-neutral-600 py-10">No bookings yet. Find a spot and reserve it.</p>
 return <ul className="space-y-3">{db.bookings.map(b=>{const s=db.spots.find(x=>x.id===b.spotId),left=Math.max(0,HOLD-(Date.now()-b.at))
  return <li key={b.id} className="bg-white rounded-xl p-4 border-2 border-ink">
   <b>{s.name}</b> <span className="text-sm">({b.veh})</span>
   <p className="text-3xl font-extrabold tracking-widest my-2">{b.code}</p>
   <p className="text-sm">{b.status==='held'?`Show this code to the attendant. Held for ${Math.floor(left/60000)}:${String(Math.floor(left/1000)%60).padStart(2,'0')}`:'Status: '+b.status}</p></li>})}</ul>
}

function Rewards({db}){
 const p=db.points%60+(db.points>=60?60:0), pct=Math.min(100,db.points/60*100)
 return <div className="bg-white rounded-xl p-5 border-2 border-ink space-y-3">
  <p className="text-5xl font-extrabold">{db.points}<span className="text-lg font-semibold"> ParkPoints</span></p>
  <div className="h-4 bg-neutral-200 rounded-full overflow-hidden"><div className="h-full bg-teal" style={{width:pct+'%'}}/></div>
  <p>{db.points>=60?'Free reservation unlocked. It applies at your next checkout.':`${60-db.points} points to your next free reservation. Each completed booking earns 15.`}</p>
  <div className="bg-taxi rounded-lg p-3"><p className="text-sm">Your referral code</p><b className="text-xl">{db.code}</b>
   <p className="text-sm">You get 15 points and your friend gets 10 when they complete a first booking.</p>
   <a className="underline font-semibold" href={'https://wa.me/?text='+encodeURIComponent('Park easy with ParkAtEase. Use my code '+db.code)} target="_blank" rel="noreferrer">Share on WhatsApp</a></div></div>
}

function Attendant({db,save,spotId}){
 const spot=db.spots.find(s=>s.id===spotId),[popup,setPopup]=useState(true),[code,setCode]=useState(''),[msg,setMsg]=useState('')
 useEffect(()=>{const i=setInterval(()=>setPopup(true),20*60*1000);return()=>clearInterval(i)},[])
 const mine=db.bookings.filter(b=>b.spotId===spotId)
 const verify=()=>{const b=mine.find(x=>x.code===code.trim().toUpperCase()&&x.status==='held')
  if(!b)return setMsg('No active booking with that code.')
  save(d=>{d.bookings.find(x=>x.id===b.id).status='arrived';return d});setMsg('Verified. Vehicle '+b.veh+' has arrived.');setCode('')}
 const complete=b=>{const amt=Number(prompt('Parking amount collected (Rs):',spot.rate));if(!amt)return
  save(d=>{d.bookings.find(x=>x.id===b.id).status='completed';d.points+=15;d.commission+=amt*0.1;return d})}
 return <>
  <h2 className="text-2xl font-extrabold">{spot.name}</h2>
  <p className="mb-3">{LABEL[spot.status]}: {spot.free}/{spot.cap} free. Updated {ago(spot.at)}</p>
  <div className="bg-white rounded-xl p-4 border-2 border-ink mb-4">
   <input className="border-2 border-ink rounded-lg p-3 w-40 mr-2" placeholder="Booking code" value={code} onChange={e=>setCode(e.target.value)}/>
   <button onClick={verify} className="bg-ink text-taxi font-bold rounded-lg p-3">Verify booking</button>
   {msg&&<p className="mt-2 text-sm" role="status">{msg}</p>}</div>
  <ul className="space-y-2">{mine.map(b=><li key={b.id} className="bg-white rounded-lg p-3 border-2 border-ink flex justify-between items-center">
   <span><b>{b.veh}</b> <span className="text-sm">{b.code} - {b.status}</span></span>
   {b.status==='arrived'&&<button onClick={()=>complete(b)} className="bg-taxi border-2 border-ink rounded px-3 py-1 font-bold">Mark completed</button>}</li>)}</ul>
  <p className="mt-4 text-sm">Commission owed to ParkAtEase (10%): <b>Rs {db.commission.toFixed(0)}</b></p>
  <button onClick={()=>setPopup(true)} className="fixed bottom-4 right-4 bg-ink text-taxi font-bold rounded-full px-5 py-3 shadow-lg">Update now</button>
  {popup&&<UpdatePopup spot={spot} save={save} close={()=>setPopup(false)}/>}
 </>
}

function UpdatePopup({spot,save,close}){
 const [st,setSt]=useState(spot.status),[n,setN]=useState(spot.free)
 const ok=()=>{save(d=>{const s=d.spots.find(x=>x.id===spot.id);s.status=n===0?'full':st;s.free=n;s.at=Date.now();return d});close()}
 return <Modal><h2 className="text-xl font-extrabold mb-3">How's your spot right now?</h2>
  <div className="grid grid-cols-3 gap-2 mb-4">{Object.keys(LABEL).map(k=><button key={k} onClick={()=>setSt(k)} className={'rounded-lg p-3 font-bold border-2 border-ink '+(st===k?'bg-taxi':'bg-white')}><span className={'inline-block w-3 h-3 rounded-full mr-1 '+DOT[k]}/>{LABEL[k]}</button>)}</div>
  <div className="flex items-center justify-center gap-6 mb-4">
   <button aria-label="Fewer free slots" onClick={()=>setN(Math.max(0,n-1))} className="w-14 h-14 text-3xl rounded-full border-2 border-ink">-</button>
   <div className="text-center"><b className="text-4xl">{n}</b><p className="text-sm">free slots</p></div>
   <button aria-label="More free slots" onClick={()=>setN(Math.min(spot.cap,n+1))} className="w-14 h-14 text-3xl rounded-full border-2 border-ink">+</button></div>
  <button onClick={ok} className="w-full bg-ink text-taxi font-bold rounded-lg p-3">Confirm update</button>
  <button onClick={close} className="w-full mt-2 underline">Remind me in 10 minutes</button></Modal>
}

const Modal=({children})=><div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-10" role="dialog" aria-modal="true"><div className="bg-white rounded-2xl p-5 w-full max-w-sm border-4 border-ink">{children}</div></div>
