const K='cristy-street-food-v3';
const peso=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const seed={items:[
{id:1,type:'product',name:'Kwek-kwek',unit:'pcs',price:5,qty:80,low:20},
{id:2,type:'product',name:'Turon',unit:'pcs',price:10,qty:40,low:10},
{id:3,type:'product',name:'Siomai',unit:'pcs',price:5,qty:60,low:15},
{id:4,type:'product',name:'Siopao',unit:'pcs',price:25,qty:30,low:8},
{id:5,type:'product',name:'Cheese Stick',unit:'pcs',price:5,per:3,qty:60,low:15},
{id:6,type:'product',name:'Kikiam',unit:'pcs',price:5,per:3,qty:60,low:15},
{id:7,type:'product',name:'Fishball',unit:'pcs',price:5,per:4,qty:100,low:20},
{id:8,type:'product',name:'Banana Cue',unit:'pcs',price:25,qty:40,low:10},
{id:9,type:'product',name:'French Fries',unit:'cups',price:20,qty:30,low:8},
{id:10,type:'product',name:'Ham & Cheese Empanada',unit:'pcs',price:5,qty:30,low:8},
{id:11,type:'product',name:'Dynamite',unit:'pcs',price:10,per:3,qty:40,low:10},
{id:12,type:'product',name:'Palamig',unit:'cups',price:10,qty:50,low:12},
{id:13,type:'ingredient',name:'Cooking oil',unit:'L',price:0,qty:5,low:2},
{id:14,type:'ingredient',name:'Flour',unit:'kg',price:0,qty:3,low:1},
{id:15,type:'ingredient',name:'Eggs',unit:'pcs',price:0,qty:60,low:20},
{id:16,type:'ingredient',name:'Sugar',unit:'kg',price:0,qty:2,low:1},
{id:17,type:'ingredient',name:'Potatoes',unit:'kg',price:0,qty:5,low:2},
{id:18,type:'ingredient',name:'Cheese',unit:'kg',price:0,qty:2,low:1},
{id:19,type:'ingredient',name:'Bamboo skewers',unit:'pcs',price:0,qty:200,low:50},
{id:20,type:'ingredient',name:'Cups',unit:'pcs',price:0,qty:100,low:30}],sales:[],next:100};
let S;
try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!S||!S.items)S=JSON.parse(JSON.stringify(seed));
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let tab='dash',date=today();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isLow=i=>i.qty<=i.low;
const dayTotal=d=>S.sales.filter(s=>s.date===d).reduce((a,s)=>a+s.total,0);

function nav(){document.getElementById('nav').innerHTML=[['dash','Dashboard'],['sales','Sales'],['inv','Inventory']]
.map(([k,l])=>`<button class="${tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('')}

function dash(){
 const t=S.sales.filter(s=>s.date===today());
 const sold=t.reduce((a,s)=>a+s.qty,0);
 const by={};t.forEach(s=>by[s.name]=(by[s.name]||0)+s.qty);
 const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
 const lows=S.items.filter(isLow);
 const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);return{k,l:d.toLocaleDateString('en-PH',{weekday:'short'}),v:dayTotal(k)}});
 const mx=Math.max(1,...days.map(d=>d.v));
 const week=days.reduce((a,d)=>a+d.v,0);
 return `<div class="card"><div class="grid">
 <div class="stat"><span>Today’s income</span><b>${peso(dayTotal(today()))}</b></div>
 <div class="stat"><span>Items sold today</span><b>${sold}</b></div>
 <div class="stat"><span>Best seller today</span><b>${top?esc(top[0]):'—'}</b></div>
 <div class="stat"><span>Last 7 days</span><b>${peso(week)}</b></div>
 <div class="stat"><span>Low-stock items</span><b style="color:${lows.length?'var(--bad)':'var(--ok)'}">${lows.length}</b></div></div></div>
 <div class="card"><h2>Income, last 7 days</h2><div class="bars">${days.map(d=>`<div class="bar"><div>${d.v?'₱'+Math.round(d.v):''}</div><i style="height:${Math.round(d.v/mx*90)}px"></i>${d.l}</div>`).join('')}</div></div>
 <div class="card"><h2>Needs restocking</h2>${lows.length?lows.map(i=>`<div>${esc(i.name)} — <span class="tag low">${i.qty} ${esc(i.unit)} left</span></div>`).join(''):'<div class="empty">All stocks are healthy.</div>'}</div>`}

function sales(){
 const prods=S.items.filter(i=>i.type==='product');
 const list=S.sales.filter(s=>s.date===date).slice().reverse();
 return `<div class="card"><h2>Record a sale</h2><div class="row">
 <label>Product<select id="sp">${prods.map(p=>`<option value="${p.id}">${esc(p.name)} — ${peso(p.price)}${p.per>1?' per '+p.per+' pcs':''} (${p.qty} ${esc(p.unit)} left)</option>`).join('')}</select></label>
 <label style="max-width:130px">No. of orders<input id="sq" type="number" min="1" value="1"></label>
 <button class="btn" data-act="sell">Add sale</button></div><div id="msg" style="color:var(--bad);font-size:13px;margin-top:6px"></div></div>
 <div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Sales on</h2>
 <label style="max-width:170px"><input type="date" id="dt" value="${date}"></label></div>
 <div class="stat" style="margin:12px 0"><span>Total income for this day</span><b>${peso(dayTotal(date))}</b></div>
 ${list.length?`<div class="scroll"><table><tr><th>Time</th><th>Product</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th><th></th></tr>
 ${list.map(s=>`<tr><td>${s.time}</td><td>${esc(s.name)}${s.pcs>s.qty?' ('+s.pcs+' pcs)':''}</td><td class="r">${s.qty}</td><td class="r">${peso(s.price)}</td><td class="r">${peso(s.total)}</td><td><button class="btn s d" data-act="del" data-id="${s.id}">Undo</button></td></tr>`).join('')}</table></div>`:'<div class="empty">No sales recorded for this date.</div>'}</div>`}

function invTable(type){
 const rows=S.items.filter(i=>i.type===type);
 return `<div class="scroll"><table><tr><th>Name</th><th class="r">Stock</th>${type==='product'?'<th class="r">Price</th>':''}<th>Status</th><th>Adjust</th><th></th></tr>
 ${rows.map(i=>`<tr><td>${esc(i.name)}</td><td class="r">${i.qty} ${esc(i.unit)}</td>${type==='product'?`<td class="r">${peso(i.price)}${i.per>1?' / '+i.per+' pcs':''}</td>`:''}
 <td><span class="tag ${isLow(i)?'low':'ok'}">${isLow(i)?'Low':'OK'}</span></td>
 <td><input class="qty" type="number" id="a${i.id}" placeholder="+/−"> <button class="btn s g" data-act="adj" data-id="${i.id}">Apply</button></td>
 <td><button class="btn s d" data-act="rm" data-id="${i.id}">Remove</button></td></tr>`).join('')||'<tr><td class="empty">None yet</td></tr>'}</table></div>`}

function inv(){
 return `<div class="card"><h2>Products (ready to sell)</h2>${invTable('product')}</div>
 <div class="card"><h2>Ingredients &amp; supplies</h2>${invTable('ingredient')}</div>
 <div class="card"><h2>Add new item</h2><div class="row">
 <label>Type<select id="nt"><option value="product">Product</option><option value="ingredient">Ingredient</option></select></label>
 <label>Name<input id="nn"></label><label>Unit<input id="nu" placeholder="pcs, kg, L"></label>
 <label>Price (₱)<input id="np" type="number" min="0" value="0"></label>
 <label>Pieces per price<input id="nper" type="number" min="1" value="1"></label>
 <label>Stock<input id="ns" type="number" min="0" value="0"></label>
 <label>Low-stock alert at<input id="nl" type="number" min="0" value="5"></label>
 <button class="btn" data-act="add">Add item</button></div></div>`}

function render(){nav();document.getElementById('app').innerHTML={dash,sales,inv}[tab]()}

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;return render()}
 const b=e.target.closest('[data-act]');if(!b)return;
 const a=b.dataset.act,id=+b.dataset.id,v=x=>document.getElementById(x).value;
 if(a==='sell'){
  const p=S.items.find(i=>i.id==v('sp')),q=Math.floor(+v('sq'));
  if(!p||!(q>0))return;
  const pc=q*(p.per||1);if(pc>p.qty){document.getElementById('msg').textContent=`Only ${p.qty} ${p.unit} of ${p.name} left in stock.`;return}
  p.qty-=pc;const n=new Date();
  S.sales.push({id:S.next++,date:today(),time:n.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),itemId:p.id,name:p.name,qty:q,pcs:pc,price:p.price,total:p.price*q});
  date=today();
 }
 if(a==='del'){const s=S.sales.find(x=>x.id===id);if(s){const p=S.items.find(i=>i.id===s.itemId);if(p)p.qty+=(s.pcs||s.qty);S.sales=S.sales.filter(x=>x.id!==id)}}
 if(a==='adj'){const n=+document.getElementById('a'+id).value,i=S.items.find(x=>x.id===id);if(!n||!i)return;i.qty=Math.max(0,i.qty+n)}
 if(a==='rm'){if(!confirm('Remove this item?'))return;S.items=S.items.filter(i=>i.id!==id)}
 if(a==='add'){const n=v('nn').trim();if(!n)return;
  S.items.push({id:S.next++,type:v('nt'),name:n,unit:v('nu')||'pcs',price:+v('np')||0,per:Math.max(1,Math.floor(+v('nper'))||1),qty:+v('ns')||0,low:+v('nl')||0})}
 save();render();
});
document.addEventListener('change',e=>{if(e.target.id==='dt'){date=e.target.value||today();render()}});
render();
