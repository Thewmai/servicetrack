const CFG=window.APP_CONFIG||{};
const live=!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase);
const IS_SHOP=document.body.dataset.page==="shop";
const sb=live?supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY):null;
const JOB=(new URLSearchParams(location.search).get("job")||"demo").slice(0,64);
const CID=Math.random().toString(36).slice(2);
if(IS_SHOP&&!live)document.body.classList.add("shop-mode");
if(live)document.body.classList.add("loading");
const STAGES=["Checked in","Diagnosing","Approved","Repairing","Quality check","Washing","Ready"];
const ZONES=[["reception","Reception"],["wait","Waiting slot"],["diag","Diagnosis bay"],["lift1","Lift 1"],["lift2","Lift 2"],["lift3","Lift 3"],["lift4","Lift 4"],["align","Alignment"],["tyre","Tyre bay"],["partw","Awaiting parts"],["body","Body work"],["paintp","Paint prep"],["spray","Spray booth"],["wash","Car wash"],["test","Test drive"],["ready","Ready for pickup"]];
const IS={wait:"Waiting to fix",diag:"Diagnosing",part:"Waiting for parts",work:"In progress",done:"Fixed"};
const PS={stock:"In stock",ord:"Ordered",ship:"Awaiting delivery",fit:"Installed"};
const svg=(c,t)=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><rect width='400' height='500' fill='${c}'/><circle cx='200' cy='230' r='80' fill='none' stroke='#111' stroke-width='1.5' opacity='.5'/><circle cx='200' cy='230' r='24' fill='none' stroke='#111' stroke-width='1.5' opacity='.5'/><text x='200' y='440' text-anchor='middle' font-size='18' letter-spacing='3' fill='#111' opacity='.6' font-family='sans-serif'>${t.toUpperCase()}</text></svg>`);
let S={stage:3,zone:"lift2",eta:Date.now()+2.25*3600e3,issues:[],parts:[],cams:{},photos:[],car:{name:"Toyota Camry 2.5 Hybrid",plate:"1กข 4821",owner:"Khun Anan"}};
if(!live)try{const x=JSON.parse(localStorage.getItem("svc6"));if(x&&x.issues)S=Object.assign(S,x)}catch(e){}
const $=i=>document.getElementById(i),$$=s=>[...document.querySelectorAll(s)];
let sv;function flash(m){let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");document.body.append(t)}t.textContent=m;t.classList.add("on");clearTimeout(flash.t);flash.t=setTimeout(()=>t.classList.remove("on"),4000)}
async function push(){const{error}=await sb.from("jobs").upsert({id:JOB,data:Object.assign({},S,{_by:CID}),updated_at:new Date().toISOString()});if(error)flash("Couldn’t save: "+error.message)}
const save=()=>{if(live){if(IS_SHOP){clearTimeout(sv);sv=setTimeout(push,250)}return}try{localStorage.setItem("svc6",JSON.stringify(S))}catch(e){}};
const zn=id=>ZONES.find(z=>z[0]==id)[1];
const fmt=t=>new Date(t).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const opts=o=>Object.keys(o).map(k=>`<option value="${k}">${o[k]}</option>`).join("");
function swap(el,t){if(el.textContent==t)return;if(!el.textContent){el.textContent=t;return}el.classList.add("out");setTimeout(()=>{el.textContent=t;el.classList.remove("out")},250)}
/* reveal observer (must be declared before addPhoto runs) */
let io=null;try{io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.08})}catch(e){}
function obs(e){io?io.observe(e):e.classList.add("in")}
/* build once */
$("trk").insertAdjacentHTML("beforeend",STAGES.map(s=>`<div class="st"><i></i>${s}</div>`).join(""));
$("stSel").innerHTML=STAGES.map((s,i)=>`<option value="${i}">${s}</option>`).join("");
$("map").innerHTML=ZONES.map(z=>`<button class="z" data-z="${z[0]}">${z[1]}</button>`).join("");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function buildIssues(){$("issues").innerHTML=S.issues.map((x,i)=>`<div class="row" data-i="${i}"><span>${esc(x.t)}</span><span class="v"><em class="ro" data-i="${i}"></em><select class="edit is" data-i="${i}">${opts(IS)}</select><button class="x rm" data-rm="${i}">Remove</button></span></div>`).join("")}
function buildParts(){$("parts").innerHTML=S.parts.map((p,i)=>`<tr data-i="${i}"><td>${esc(p.t)}</td><td class="n">${p.q}</td><td class="n">${(p.q*p.p).toLocaleString()}</td><td style="text-align:right"><span class="v"><em class="ro" data-p="${i}"></em><select class="edit ps" data-p="${i}">${opts(PS)}</select></span></td><td style="text-align:right;padding-left:14px"><button class="x rm" data-rmp="${i}">Remove</button></td></tr>`).join("");$("pE").style.display=S.parts.length?"none":"block"}
function shrink(file,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);{const u=c.toDataURL("image/jpeg",.72);c.toBlob(b=>cb(u,b),"image/jpeg",.72)}};im.src=r.result};r.readAsDataURL(file)}
function buildPhotos(newFirst){$("alb").innerHTML="";S.photos.forEach((p,i)=>{const d=document.createElement("div");d.className="ph"+(newFirst&&i===0?" new":"");d.innerHTML=`<div class="im"><img src="${p[0]}" alt="${esc(p[1])}"></div><div class="c">${esc(p[1])}<small>${esc(p[2])}</small></div><button class="x rm">Remove</button>`;
 d.onclick=()=>{$("lbI").src=p[0];$("lbT").textContent=p[1]+" — "+p[2];$("lb").classList.add("on")};
 d.querySelector(".rm").onclick=e=>{e.stopPropagation();d.classList.add("gone");setTimeout(()=>{S.photos.splice(i,1);save();buildPhotos()},400)};
 $("alb").append(d)})}
let tot=0;
function update(){
 const st=$$(".st");st.forEach((e,i)=>{e.classList.toggle("done",i<S.stage);e.classList.toggle("cur",i==S.stage)});
 $("fl").style.transform=`scaleX(${S.stage/(STAGES.length-1)})`;
 swap($("stTxt"),STAGES[S.stage]);$("stSel").value=S.stage;
 $$(".z").forEach(z=>z.classList.toggle("here",z.dataset.z==S.zone));
 swap($("locTxt"),zn(S.zone));swap($("camName"),zn(S.zone));
 S.issues.forEach((x,i)=>{const e=document.querySelector(`em[data-i="${i}"]`);if(!e)return;e.dataset.s=x.s;e.textContent=IS[x.s];document.querySelector(`.is[data-i="${i}"]`).value=x.s});
 S.parts.forEach((x,i)=>{const e=document.querySelector(`em[data-p="${i}"]`);if(!e)return;e.dataset.s=x.s;e.textContent=PS[x.s];document.querySelector(`.ps[data-p="${i}"]`).value=x.s});
 $("isCnt").textContent=S.issues.length?S.issues.filter(x=>x.s=="done").length+" of "+S.issues.length+" fixed":"—";
 const T=S.parts.reduce((a,x)=>a+x.q*x.p,0),from=tot,t0=performance.now();tot=T;
 (function a(n){const k=Math.min(1,(n-t0)/800),e=1-Math.pow(1-k,3);$("ptot").textContent="Total ฿"+Math.round(from+(T-from)*e).toLocaleString();if(k<1)requestAnimationFrame(a)})(t0);
 showCar();swap($("eta"),fmt(S.eta));swap($("etaD"),fmtDay(S.eta));if(document.activeElement!==$("etaIn"))$("etaIn").value=new Date(S.eta-new Date(S.eta).getTimezoneOffset()*6e4).toISOString().slice(0,16);mountCam();tick()}
function fmtDay(t){const d=new Date(t),n=new Date(),k=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);
 const s=d.toLocaleDateString([],{weekday:"short",day:"numeric",month:"short"});return (k==0?"Today · ":k==1?"Tomorrow · ":k==-1?"Yesterday · ":"")+s}
function showCar(){const c=S.car;$("carName").textContent=c.name||"Vehicle";$("plate").textContent=c.plate||"No plate";$("owner").textContent=c.owner||"Customer";
 [["cN","name"],["cP","plate"],["cO","owner"]].forEach(([i,k])=>{if(document.activeElement!==$(i))$(i).value=c[k]||""})}
function tick(){const m=Math.round((S.eta-Date.now())/6e4);$("left").textContent=S.stage==6?"Your car is ready":m>0?(m>=1440?`About ${Math.floor(m/1440)}d ${Math.floor(m%1440/60)}h remaining`:`About ${Math.floor(m/60)}h ${m%60}m remaining`):"Finishing up";$("ts").textContent=new Date().toLocaleTimeString()}
/* events */
const ind=$("ind");function place(){const b=document.querySelector(".tg a.on");ind.style.transform="translateX("+b.offsetLeft+"px)"}
[["cN","name"],["cP","plate"],["cO","owner"]].forEach(([i,k])=>$(i).addEventListener("input",e=>{S.car[k]=e.target.value;save();showCar()}));
$("stSel").onchange=e=>{S.stage=+e.target.value;save();update()};
$$(".z").forEach(z=>z.onclick=()=>{if(document.body.classList.contains("shop-mode")){S.zone=z.dataset.z;save();update()}});
$("issues").addEventListener("change",e=>{const s=e.target.closest(".is");if(s){S.issues[s.dataset.i].s=s.value;save();update()}});
$("parts").addEventListener("change",e=>{const s=e.target.closest(".ps");if(s){S.parts[s.dataset.p].s=s.value;save();update()}});
function drop(el,fn){el.classList.add("gone");setTimeout(()=>{fn();save();update()},380)}
$("issues").addEventListener("click",e=>{const b=e.target.closest("[data-rm]");if(b)drop(b.closest(".row"),()=>{S.issues.splice(+b.dataset.rm,1);buildIssues()})});
$("parts").addEventListener("click",e=>{const b=e.target.closest("[data-rmp]");if(b)drop(b.closest("tr"),()=>{S.parts.splice(+b.dataset.rmp,1);buildParts()})});
const addI=()=>{const v=$("isT").value.trim();if(!v)return;S.issues.push({t:v,s:"wait"});$("isT").value="";save();buildIssues();update();$("issues").lastElementChild.classList.add("new")};
$("isAdd").onclick=addI;$("isT").onkeydown=e=>{if(e.key=="Enter")addI()};
$("pAdd").onclick=()=>{const t=$("pN").value.trim(),q=Math.max(1,parseInt($("pQ").value)||1),p=Math.max(0,parseFloat($("pP").value)||0);if(!t)return;S.parts.push({t,q,p,s:"ord"});$("pN").value=$("pQ").value=$("pP").value="";save();buildParts();update();$("parts").lastElementChild.classList.add("new")};
$("etaBtn").onclick=()=>{const v=$("etaIn").value;if(!v)return;S.eta=new Date(v).getTime();if(isNaN(S.eta))return;save();update()};
$("up").onchange=e=>{const cap=$("phC").value.trim()||"New photo";[...e.target.files].forEach(fl=>shrink(fl,async(src,blob)=>{let url=src;if(live){try{url=await uploadPhoto(blob)}catch(err){return flash("Photo upload failed: "+err.message)}}S.photos.unshift([url,cap,"Uploaded "+fmt(Date.now())]);save();buildPhotos(true)}));e.target.value="";$("phC").value=""};
async function uploadPhoto(b){const n=JOB+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,7)+".jpg",{error}=await sb.storage.from("photos").upload(n,b,{contentType:"image/jpeg"});if(error)throw error;return sb.storage.from("photos").getPublicUrl(n).data.publicUrl}
$("lb").onclick=e=>{if(e.target.id!="lbI")$("lb").classList.remove("on")};
document.addEventListener("keydown",e=>{if(e.key=="Escape")$("lb").classList.remove("on")});
$$(".rv").forEach(obs);
/* cam */
let ck="";
function mountCam(){const u=S.cams[S.zone],k=S.zone+"|"+(u||"");if(k==ck)return;ck=k;const c=$("cam");c.querySelectorAll("img,iframe").forEach(e=>e.remove());$("cv").style.display=u?"none":"block";
 if(u){const el=/\.(mjpe?g|jpg|png|cgi)(\?|$)/i.test(u)?document.createElement("img"):document.createElement("iframe");el.src=u;c.prepend(el)}}
const cx=$("cv").getContext("2d");let f=0;
function draw(){f++;const w=640,h=360;cx.fillStyle="#0c0c0c";cx.fillRect(0,0,w,h);
 cx.strokeStyle="rgba(255,255,255,.18)";cx.lineWidth=1;cx.beginPath();cx.moveTo(0,262);cx.lineTo(w,262);cx.stroke();
 const x=215+Math.sin(f/110)*3;cx.strokeStyle="rgba(255,255,255,.85)";cx.lineWidth=1.5;
 cx.beginPath();cx.roundRect(x,175,215,70,16);cx.stroke();cx.beginPath();cx.roundRect(x+50,128,115,50,14);cx.stroke();
 [x+52,x+163].forEach(a=>{cx.beginPath();cx.arc(a,248,23,0,7);cx.stroke();cx.beginPath();cx.arc(a,248,8,0,7);cx.stroke()});
 const m=470+Math.sin(f/50)*26;cx.strokeStyle="rgba(255,255,255,.5)";cx.beginPath();cx.arc(m,150,10,0,7);cx.moveTo(m,160);cx.lineTo(m,215);cx.moveTo(m,215);cx.lineTo(m-10,262);cx.moveTo(m,215);cx.lineTo(m+10,262);cx.moveTo(m,172);cx.lineTo(m-22,196);cx.stroke();
 cx.fillStyle="rgba(255,255,255,.035)";cx.fillRect(0,(f*2.2)%h,w,22);
 cx.fillStyle="rgba(255,255,255,.4)";cx.font="11px monospace";cx.fillText("DEMO FEED / "+zn(S.zone).toUpperCase(),18,340);requestAnimationFrame(draw)}
$("camBtn").onclick=()=>{const v=$("camUrl").value.trim();if(v){S.cams[S.zone]=v;save();update()}};
$("camClr").onclick=()=>{delete S.cams[S.zone];save();update()};
addEventListener("storage",e=>{if(live||e.key!="svc6"||!e.newValue)return;try{S=JSON.parse(e.newValue)}catch(_){return}buildIssues();buildParts();buildPhotos();update()});
buildPhotos();buildIssues();buildParts();update();setTimeout(place,60);addEventListener("resize",place);if(document.fonts)document.fonts.ready.then(place);
setInterval(tick,1000);draw();
const redraw=()=>{buildIssues();buildParts();buildPhotos();update()};
if($("jobTxt"))$("jobTxt").textContent="Job "+JOB;
if(IS_SHOP){const set=(id,fn)=>$(id)&&fn($(id));
 set("lnk",e=>e.value=new URL("index.html?job="+encodeURIComponent(JOB),location.href).href);
 set("lnkBtn",b=>b.onclick=()=>navigator.clipboard.writeText($("lnk").value).then(()=>flash("Customer link copied"),()=>$("lnk").select()));
 set("jobIn",e=>e.value=JOB);
 set("jobGo",b=>b.onclick=()=>{const v=$("jobIn").value.trim();if(v)location.search="?job="+encodeURIComponent(v)});
 set("outBtn",b=>{b.style.display=live?"":"none";b.onclick=()=>sb.auth.signOut()})}
(async()=>{if(!live)return;
 const{data,error}=await sb.from("jobs").select("data").eq("id",JOB).maybeSingle();
 let need=false;
 if(error)flash("Couldn’t load: "+error.message);
 else if(data)S=Object.assign(S,data.data);
 else if(IS_SHOP)need=true;
 else{S.car={name:"Job not found",plate:"",owner:""};S.issues=[];S.parts=[];S.photos=[]}
 redraw();document.body.classList.remove("loading");
 sb.channel("job-"+JOB).on("postgres_changes",{event:"*",schema:"public",table:"jobs",filter:"id=eq."+JOB},p=>{const d=p.new&&p.new.data;if(d&&d._by!==CID){S=Object.assign(S,d);redraw()}}).subscribe();
 if(IS_SHOP){const gate=s=>{document.body.classList.toggle("shop-mode",!!s);$("login").classList.toggle("on",!s);if(s&&need){need=false;push()}};
  const{data:{session}}=await sb.auth.getSession();gate(session);sb.auth.onAuthStateChange((_,s)=>gate(s));
  $("lf").onsubmit=async e=>{e.preventDefault();$("lErr").textContent="";const{error:er}=await sb.auth.signInWithPassword({email:$("lE").value,password:$("lP").value});if(er)$("lErr").textContent=er.message}}
})();
 
