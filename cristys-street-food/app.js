const peso=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
let S={items:[],sales:[],user:null};
let tab='dash',date=today(),authMode='login',mfaMode='verify',stepupTarget='',resumeStepup=null,cancelStepup=null;
let theme=localStorage.getItem('cristys-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
function setTheme(next){
 theme=next;document.documentElement.dataset.theme=theme;
 const button=document.getElementById('theme-toggle');
 if(button){button.textContent=theme==='dark'?'☀ Light mode':'☾ Dark mode';button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} mode`)}
}
setTheme(theme);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isLow=i=>i.qty<=i.low;
const dayTotal=d=>S.sales.filter(s=>s.date===d).reduce((a,s)=>a+s.total,0);

function nav(){document.getElementById('nav').innerHTML=[['dash','Dashboard'],['sales','Sales'],['inv','Inventory'],...(S.user?.role==='admin'?[['admin','Accounts & security']]:[])]
.map(([k,l])=>`<button class="${tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('')+`<span class="account-chip">${esc(S.user?.username||'')} · ${esc(S.user?.role||'')}</span><button data-act="logout" class="logout-btn">Sign out</button>`}

function authPage(setup=false){document.getElementById('nav').innerHTML='';document.getElementById('app').innerHTML=`<div class="card auth-card"><h2>${setup?'Set up your business account':'Sign in to Cristy’s Street Food'}</h2><p>${setup?'Create the first administrator account. Use at least 12 characters and avoid common passwords.':'Sign in with your personal account to access sales and stock records.'}</p><form id="auth-form"><label>Username<input id="auth-user" autocomplete="username" required minlength="3"></label><label>Password<input id="auth-pass" type="password" autocomplete="${setup?'new-password':'current-password'}" required minlength="${setup?12:1}"></label><div id="auth-error" class="error-msg"></div><button class="btn" type="submit">${setup?'Create administrator':'Sign in'}</button></form></div>`}

function adminPage(){return `<div class="card"><h2>Accounts</h2><form id="user-form" class="row"><label>Username<input id="new-user" required minlength="3"></label><label>Password (12+ characters; not common)<input id="new-pass" type="password" required minlength="12"></label><label>Role<select id="new-role"><option value="staff">Staff</option><option value="admin">Administrator</option></select></label><button class="btn">Add account</button></form><div id="user-list" class="empty">Loading accounts…</div></div><div class="card"><div class="row security-actions"><h2>Business records</h2><button class="btn" data-act="backup">Download backup</button><button class="btn g" data-act="audit">View activity log</button></div><p class="muted">Keep downloaded backups in a separate, secure location. Schedule regular backups of the MySQL database on the server.</p><div id="audit-list"></div></div>`}

function renderTotpQr(text,canvas){const bytes=[...new TextEncoder().encode(text)],size=41,data=[];const push=(value,n)=>{for(let i=n-1;i>=0;i--)data.push((value>>>i)&1)};if(bytes.length>134)throw Error('Authenticator URI is too long for the local QR encoder.');push(4,4);push(bytes.length,8);bytes.forEach(b=>push(b,8));for(let i=0;i<Math.min(4,1088-data.length);i++)data.push(0);while(data.length%8)data.push(0);const cw=[];for(let i=0;i<data.length;i+=8){let v=0;for(let j=0;j<8;j++)v=(v<<1)|data[i+j];cw.push(v)}for(let pad=0;cw.length<136;pad++)cw.push(pad%2?0x11:0xec);
 const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11d);if((y>>>i)&1)z^=x}return z};const divisor=Array(18).fill(0);divisor[17]=1;let root=1;for(let i=0;i<18;i++){for(let j=0;j<18;j++){divisor[j]=mul(divisor[j],root);if(j+1<18)divisor[j]^=divisor[j+1]}root=mul(root,2)}const ecc=block=>{const rem=Array(18).fill(0);for(const b of block){const factor=b^rem[0];rem.shift();rem.push(0);for(let i=0;i<18;i++)rem[i]^=mul(divisor[i],factor)}return rem};const blocks=[cw.slice(0,68),cw.slice(68)],ec=blocks.map(ecc),all=[];for(let i=0;i<68;i++)for(const b of blocks)all.push(b[i]);for(let i=0;i<18;i++)for(const b of ec)all.push(b[i]);
 const m=Array.from({length:size},()=>Array(size).fill(null)),set=(x,y,v)=>{if(x>=0&&x<size&&y>=0&&y<size)m[y][x]=!!v};const finder=(cx,cy)=>{for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){const x=cx+dx,y=cy+dy,inside=dx>=0&&dx<=6&&dy>=0&&dy<=6,dark=inside&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4));set(x,y,dark)}};finder(0,0);finder(size-7,0);finder(0,size-7);for(let i=8;i<size-8;i++){if(m[6][i]===null)set(i,6,i%2===0);if(m[i][6]===null)set(6,i,i%2===0)}for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(34+dx,34+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
 let fmt=8<<10;for(let i=14;i>=10;i--)if((fmt>>>i)&1)fmt^=0x537<<(i-10);fmt=((8<<10)|fmt)^0x5412;for(let i=0;i<=5;i++)set(8,i,(fmt>>>i)&1);set(8,7,(fmt>>>6)&1);set(8,8,(fmt>>>7)&1);set(7,8,(fmt>>>8)&1);for(let i=9;i<15;i++)set(14-i,8,(fmt>>>i)&1);for(let i=0;i<8;i++)set(size-1-i,8,(fmt>>>i)&1);for(let i=8;i<15;i++)set(8,size-15+i,(fmt>>>i)&1);set(8,size-8,true);
 let bit=0,up=true;for(let right=size-1;right>=1;right-=2){if(right===6)right--;for(let vert=0;vert<size;vert++){const y=up?size-1-vert:vert;for(let j=0;j<2;j++){const x=right-j;if(m[y][x]!==null)continue;let v=bit<all.length*8?((all[bit>>>3]>>>(7-(bit&7)))&1)!==0:false;bit++;if((x+y)%2===0)v=!v;set(x,y,v)}}up=!up}
 const ctx=canvas.getContext('2d'),scale=10,quiet=4,total=size+quiet*2;canvas.width=total*scale;canvas.height=total*scale;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#000';for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(m[y][x])ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale)}

async function mfaPage(enroll){document.getElementById('nav').innerHTML='';const host=document.getElementById('app');mfaMode=enroll?'confirm':'verify';if(!enroll){host.innerHTML=`<div class="card auth-card"><h2>Two-step verification</h2><p>Enter the current six-digit code from your authenticator app.</p><form id="mfa-form"><label>Authenticator code<input id="mfa-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus></label><div id="mfa-error" class="error-msg"></div><button class="btn">Verify and sign in</button></form></div>`;return}const setup=await api('mfa_start');if(setup.error){host.innerHTML=`<div class="card error-msg">${esc(setup.error)}</div>`;return}host.innerHTML=`<div class="card auth-card"><h2>Set up Google Authenticator</h2><p>Open Google Authenticator, tap <b>+</b>, and choose <b>Scan a QR code</b>.</p><canvas id="mfa-qr" class="mfa-qr" aria-label="Google Authenticator setup QR code"></canvas><p><b>Cristy · ${esc(S.user?.username||'account')}</b></p><p>After scanning, enter the current six-digit code shown in Google Authenticator to finish setup.</p><form id="mfa-form"><label>Six-digit code<input id="mfa-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus></label><div id="mfa-error" class="error-msg"></div><button class="btn">Enable MFA</button></form></div>`;try{renderTotpQr(setup.otpauth,document.getElementById('mfa-qr'))}catch(err){document.getElementById('mfa-qr').replaceWith(document.createTextNode('Could not generate the QR code. Please contact support.'))}}

function stepupPage(target,resume,cancel){stepupTarget=target;resumeStepup=resume;cancelStepup=cancel;let dialog=document.getElementById('stepup-dialog');if(!dialog){document.body.insertAdjacentHTML('beforeend',`<dialog id="stepup-dialog" class="edit-dialog"><form id="stepup-form"><h2>Confirm sensitive action</h2><p id="stepup-description" class="muted"></p><label>Fresh six-digit Google Authenticator code<input id="stepup-code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus></label><div id="stepup-error" class="error-msg"></div><div class="modal-actions"><button type="button" class="btn g" data-act="cancel-stepup">Cancel</button><button class="btn">Verify and continue</button></div></form></dialog>`);dialog=document.getElementById('stepup-dialog')}const labels={user_add:'Create an account',user_delete:'Remove an account',user_role:'Change an account role',mfa_reset:'Reset an account’s MFA',account_unlock:'Unlock an account',audit:'View the activity log',backup:'Download a backup',sale_delete:'Delete a sales entry',sale_edit:'Edit a sales entry',price_edit:'Change a product price'};document.getElementById('stepup-description').textContent=`Confirm ${labels[target]||'this sensitive action'}. This code authorizes this action only.`;document.getElementById('stepup-code').value='';document.getElementById('stepup-error').textContent='';dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();const stop=cancelStepup;resumeStepup=null;cancelStepup=null;if(stop)stop()},{once:true});dialog.showModal();document.getElementById('stepup-code').focus()}

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
 <div class="card"><h2>Income, last 7 days</h2><div class="bars">${days.map(d=>`<div class="bar"><div>${d.v?'₱'+Math.round(d.v):''}</div><i style="height:${Math.round(d.v/mx*90)}px"></i>${esc(d.l)}</div>`).join('')}</div></div>
 <div class="card"><h2>Needs restocking</h2>${lows.length?lows.map(i=>`<div>${esc(i.name)} — <span class="tag low">${i.qty} ${esc(i.unit)} left</span></div>`).join(''):'<div class="empty">All stocks are healthy.</div>'}</div>`}

function sales(){
 const prods=S.items.filter(i=>i.type==='product');
 const list=S.sales.filter(s=>s.date===date).slice().reverse();
 return `<div class="card"><h2>Record a sale</h2><div class="row">
 <label>Product<select id="sp">${prods.map(p=>`<option value="${p.id}">${esc(p.name)} — ${peso(p.price)}${p.per>1?' per '+p.per+' pcs':''} (${p.qty} ${esc(p.unit)} left)</option>`).join('')}</select></label>
 <label style="max-width:130px">No. of orders<input id="sq" type="number" min="1" value="1"></label><label>Payment reference (optional)<input id="sr" maxlength="100"></label>
 <button class="btn" data-act="sell">Add sale</button></div><div id="msg" style="color:var(--bad);font-size:13px;margin-top:6px"></div></div>
 <div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Sales on</h2>
 <label style="max-width:170px"><input type="date" id="dt" value="${esc(date)}"></label></div>
 <div class="stat" style="margin:12px 0"><span>Total income for this day</span><b>${peso(dayTotal(date))}</b></div>
 ${list.length?`<div class="scroll"><table><tr><th>Time</th><th>Product</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th><th>Payment reference</th><th>Actions</th></tr>
 ${list.map(s=>`<tr><td>${esc(s.time)}</td><td>${esc(s.name)}${s.pcs>s.qty?' ('+s.pcs+' pcs)':''}</td><td class="r">${s.qty}</td><td class="r">${peso(s.price)}</td><td class="r">${peso(s.total)}</td><td>${esc(s.paymentReference||'')}</td><td><button class="btn s g" data-act="edit-sale" data-id="${s.id}">Edit</button> <button class="btn s d" data-act="del" data-id="${s.id}">Undo</button></td></tr>`).join('')}</table></div>`:'<div class="empty">No sales recorded for this date.</div>'}</div>`}

function invTable(type){
 const rows=S.items.filter(i=>i.type===type);
 const canManage=S.user?.role==='admin';
 const columns=(type==='product'?4:3)+(canManage?2:0);
 return `<div class="scroll"><table><tr><th>Name</th><th class="r">Stock</th>${type==='product'?'<th class="r">Price</th>':''}<th>Status</th>${canManage?'<th>Adjust</th><th></th>':''}</tr>
 ${rows.map(i=>`<tr><td>${esc(i.name)}</td><td class="r">${i.qty} ${esc(i.unit)}</td>${type==='product'?`<td class="r">${peso(i.price)}${i.per>1?' / '+i.per+' pcs':''}</td>`:''}
 <td><span class="tag ${isLow(i)?'low':'ok'}">${isLow(i)?'Low':'OK'}</span></td>
 ${canManage?`<td><input class="qty" type="number" id="a${i.id}" placeholder="+/−"> <button class="btn s g" data-act="adj" data-id="${i.id}">Apply</button></td><td><button class="btn s g" data-act="edit" data-id="${i.id}">Edit</button> <button class="btn s d" data-act="rm" data-id="${i.id}">Remove</button></td>`:''}</tr>`).join('')||`<tr><td class="empty" colspan="${columns}">None yet</td></tr>`}</table></div>`}

function inv(){
 return `<div class="card"><h2>Products (ready to sell)</h2>${invTable('product')}</div>
 <div class="card"><h2>Ingredients &amp; supplies</h2>${invTable('ingredient')}</div>
 ${S.user?.role==='admin'?`<div class="card"><h2>Add new item</h2><div class="row">
 <label>Type<select id="nt"><option value="product">Product</option><option value="ingredient">Ingredient</option></select></label>
 <label>Name<input id="nn"></label><label>Unit<input id="nu" placeholder="pcs, kg, L"></label>
 <label>Price (₱)<input id="np" type="number" min="0" value="0"></label>
 <label>Pieces per price<input id="nper" type="number" min="1" value="1"></label>
 <label>Stock<input id="ns" type="number" min="0" value="0"></label>
 <label>Low-stock alert at<input id="nl" type="number" min="0" value="5"></label>
 <button class="btn" data-act="add">Add item</button></div></div>`:''}`}

function updateAddFields(){
 const row=document.getElementById('nt')?.closest('.row');
 const labels=row?.querySelectorAll('label');
 const product=document.getElementById('nt')?.value==='product';
 if(labels?.[3])labels[3].hidden=!product;
 if(labels?.[4])labels[4].hidden=!product;
}

function render(){
 nav();document.getElementById('app').innerHTML=tab==='admin'?adminPage():({dash,sales,inv}[tab]||dash)();
 if(tab==='admin')loadUsers();
 if(tab==='inv')document.getElementById('app').insertAdjacentHTML('beforeend',`<dialog id="edit-dialog" class="edit-dialog"><form id="edit-form"><div class="modal-head"><h2>Edit item</h2><button type="button" class="icon-btn" data-act="close-edit" aria-label="Close">×</button></div><input type="hidden" id="edit-id"><label>Name<input id="edit-name" required></label><label>Unit<input id="edit-unit" placeholder="pcs, kg, L"></label><div id="edit-product-fields"><label>Price (₱)<input id="edit-price" type="number" min="0" step="0.01"></label><label>Pieces per price<input id="edit-per" type="number" min="1" step="1"></label></div><label>Low-stock alert at<input id="edit-low" type="number" min="0" step="any"></label><div class="modal-actions"><button type="button" class="btn g" data-act="close-edit">Cancel</button><button class="btn" type="submit">Save changes</button></div></form></dialog>`)
 if(tab==='sales')document.getElementById('app').insertAdjacentHTML('beforeend',`<dialog id="sale-edit-dialog" class="edit-dialog"><form id="sale-edit-form"><div class="modal-head"><h2>Edit sale</h2><button type="button" class="icon-btn" data-act="close-sale-edit" aria-label="Close">×</button></div><input type="hidden" id="sale-edit-id"><label>Orders<input id="sale-edit-orders" type="number" min="1" step="1" required></label><label>Price per order (₱)<input id="sale-edit-price" type="number" min="0" step="0.01" required></label><label>Payment reference<input id="sale-edit-reference" maxlength="100"></label><p class="muted">Changing the order quantity also adjusts product stock. A fresh authenticator code is required to save.</p><div class="modal-actions"><button type="button" class="btn g" data-act="close-sale-edit">Cancel</button><button class="btn" type="submit">Save sale</button></div></form></dialog>`)
}

async function api(action,data={}){
 try{const r=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})}),result=await r.json();if(result.stepupRequired)return new Promise(resolve=>stepupPage(result.stepupAction||action,async()=>resolve(await api(action,data)),()=>resolve({error:'Sensitive action cancelled.'})));return result}
 catch(e){return{error:'Cannot reach api.php. Is Apache running, and are you opening the page via http://localhost/ ?'}}}
async function loadUsers(){const j=await api('users');if(j.error)return;const host=document.getElementById('user-list');if(!host)return;host.innerHTML=`<div class="scroll"><table><tr><th>Username</th><th>Role</th><th>MFA</th><th>Sign-in status</th><th>Created</th><th></th></tr>${j.users.map(u=>{const locked=+u.lockout_until>Date.now()/1000,own=u.username===S.user.username;return `<tr><td>${esc(u.username)}</td><td>${own?esc(u.role):`<select id="role-${u.id}"><option value="staff" ${u.role==='staff'?'selected':''}>Staff</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select>`}</td><td>${+u.mfa_enabled?'Enabled':'Setup required'}</td><td>${locked?`Locked (${Math.ceil((+u.lockout_until-Date.now()/1000)/60)} min)`:+u.failures?`${u.failures} failed attempt(s)`:'OK'}</td><td>${esc(u.created_at)}</td><td>${!own?`<button class="btn s g" data-act="role-edit" data-id="${u.id}">Save role</button> ${locked?`<button class="btn s g" data-act="account-unlock" data-user="${esc(u.username)}">Unlock</button> `:''}${+u.mfa_enabled?`<button class="btn s g" data-act="mfa-reset" data-id="${u.id}">Reset MFA</button> `:''}<button class="btn s d" data-act="user-del" data-id="${u.id}">Remove</button>`:''}</td></tr>`}).join('')}</table></div>`}
async function load(){const status=await api('status');if(status.error){document.getElementById('app').innerHTML='<div class="card error-msg">'+esc(status.error)+'</div>';return}if(status.mfaChallenge||status.needsMfa)S.user=status.user;if(status.mfaChallenge){await mfaPage(false);return}if(status.needsMfa){await mfaPage(true);return}if(!status.authenticated){authMode=status.needsSetup?'setup':'login';authPage(status.needsSetup);return}const j=await api('load');if(j.error){authPage();return}S=j;render()}

document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;return render()}
 const b=e.target.closest('[data-act]');if(!b)return;
 const a=b.dataset.act,id=+b.dataset.id,v=x=>document.getElementById(x).value;
 let r;
 if(a==='backup'){const j=await api('backup');if(j.error)return alert(j.error);const name='cristys-backup-'+today()+'.json',json=JSON.stringify(j,null,2),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json)),hex=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');for(const [filename,body,type] of [[name,json,'application/json'],[name+'.sha256',hex+'  '+name+'\n','text/plain']]){const url=URL.createObjectURL(new Blob([body],{type})),link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url)}return}
 if(a==='logout'){await api('logout');S={items:[],sales:[],user:null};tab='dash';await load();return}
 if(a==='cancel-stepup'){document.getElementById('stepup-dialog')?.close();resumeStepup=null;const cancel=cancelStepup;cancelStepup=null;if(cancel)cancel();return}
 if(a==='mfa-reset'){if(!confirm('Reset this account’s MFA? The user will set it up again at their next sign-in.'))return;r=await api('mfa_reset',{id})}
 if(a==='role-edit'){const role=document.getElementById('role-'+id)?.value;r=await api('user_role',{id,role})}
 if(a==='account-unlock'){r=await api('account_unlock',{username:b.dataset.user})}
 if(a==='audit'){const j=await api('audit');if(j.error)return alert(j.error);const host=document.getElementById('audit-list');host.innerHTML=`<div class="scroll"><table><tr><th>When</th><th>Account</th><th>Activity</th><th>Details</th></tr>${j.logs.map(x=>`<tr><td>${esc(x.created_at)}</td><td>${esc(x.username)}</td><td>${esc(x.action)}</td><td>${esc(x.details||'')}</td></tr>`).join('')}</table></div>`;return}
 if(a==='user-del'){if(!confirm('Remove this account?'))return;r=await api('user_delete',{id})}
 if(a==='edit-sale'){const sale=S.sales.find(s=>s.id===id);if(!sale)return;document.getElementById('sale-edit-id').value=sale.id;document.getElementById('sale-edit-orders').value=sale.qty;document.getElementById('sale-edit-price').value=sale.price;document.getElementById('sale-edit-reference').value=sale.paymentReference||'';document.getElementById('sale-edit-dialog').showModal();return}
 if(a==='close-sale-edit'){document.getElementById('sale-edit-dialog')?.close();return}
 if(a==='sell'){
  const q=Math.floor(+v('sq'));if(!(q>0))return;
  const n=new Date();
  r=await api('sell',{item_id:+v('sp'),orders:q,date:today(),time:n.toTimeString().slice(0,5),payment_reference:v('sr').trim()});
  date=today();
 }
 if(a==='del')r=await api('del',{id});
 if(a==='adj'){const n=+document.getElementById('a'+id).value;if(!n)return;r=await api('adj',{id,n})}
 if(a==='edit'){
  const item=S.items.find(i=>i.id===id);if(!item)return;
  document.getElementById('edit-id').value=item.id;
  document.getElementById('edit-name').value=item.name;
  document.getElementById('edit-unit').value=item.unit;
  document.getElementById('edit-price').value=item.price;
  document.getElementById('edit-per').value=item.per;
  document.getElementById('edit-low').value=item.low;
  document.getElementById('edit-product-fields').hidden=item.type!=='product';
  document.getElementById('edit-dialog').showModal();
  return;
 }
 if(a==='close-edit'){document.getElementById('edit-dialog')?.close();return}
 if(a==='rm'){if(!confirm('Remove this item?'))return;r=await api('rm',{id})}
 if(a==='add'){const n=v('nn').trim();if(!n)return;
  r=await api('add',{type:v('nt'),name:n,unit:v('nu')||'pcs',price:+v('np')||0,per:Math.max(1,Math.floor(+v('nper'))||1),qty:+v('ns')||0,low:+v('nl')||0})}
 if(r&&r.error){if(a==='sell'&&document.getElementById('msg'))document.getElementById('msg').textContent=r.error;else alert(r.error);return}
 if(a==='user-del'||a==='mfa-reset'||a==='account-unlock'||a==='role-edit'){await loadUsers();return}
 await load();
});
document.addEventListener('submit',async e=>{
 if(e.target.id==='sale-edit-form'){e.preventDefault();const val=id=>document.getElementById(id).value;const result=await api('sale_edit',{id:+val('sale-edit-id'),orders:+val('sale-edit-orders'),price:+val('sale-edit-price'),payment_reference:val('sale-edit-reference').trim()});if(result.error){alert(result.error);return}document.getElementById('sale-edit-dialog').close();await load();return}
 if(e.target.id==='auth-form'){e.preventDefault();const action=authMode==='setup'?'setup':'login';const result=await api(action,{username:document.getElementById('auth-user').value.trim(),password:document.getElementById('auth-pass').value});if(result.error){document.getElementById('auth-error').textContent=result.error;return}await load();return}
 if(e.target.id==='mfa-form'){e.preventDefault();const result=await api(mfaMode==='confirm'?'mfa_confirm':'mfa_verify',{code:document.getElementById('mfa-code').value});if(result.error){document.getElementById('mfa-error').textContent=result.error;return}await load();return}
 if(e.target.id==='stepup-form'){e.preventDefault();const result=await api('stepup_verify',{target:stepupTarget,code:document.getElementById('stepup-code').value});if(result.error){document.getElementById('stepup-error').textContent=result.error;return}const dialog=document.getElementById('stepup-dialog'),resume=resumeStepup;resumeStepup=null;cancelStepup=null;dialog.close();if(resume)await resume();return}
 if(e.target.id==='user-form'){e.preventDefault();const result=await api('user_add',{username:document.getElementById('new-user').value.trim(),password:document.getElementById('new-pass').value,role:document.getElementById('new-role').value});if(result.error){alert(result.error);return}e.target.reset();await loadUsers();return}
});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='edit-form')return;
 e.preventDefault();
 const val=id=>document.getElementById(id).value;
 const result=await api('edit',{id:+val('edit-id'),name:val('edit-name').trim(),unit:val('edit-unit').trim()||'pcs',price:+val('edit-price')||0,per:Math.max(1,Math.floor(+val('edit-per'))||1),low:+val('edit-low')||0});
 if(result.error){alert(result.error);return}
 document.getElementById('edit-dialog').close();await load();
});
document.addEventListener('change',e=>{if(e.target.id==='dt'){date=e.target.value||today();render()}if(e.target.id==='nt')updateAddFields()});
document.getElementById('theme-toggle').addEventListener('click',()=>{
 const next=theme==='dark'?'light':'dark';localStorage.setItem('cristys-theme',next);setTheme(next);
});
load();
