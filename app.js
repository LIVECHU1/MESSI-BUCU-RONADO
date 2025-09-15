/* app.js - main UI logic with WebAudio-generated click & bg music */
const CORRECT_KEY = "KEY-LIVECHULATRUNG1.0";
const overlay = document.getElementById('overlay');
const app = document.getElementById('app');
const pwInput = document.getElementById('pw');
const pwBtn = document.getElementById('pwBtn');
const statusBadge = document.getElementById('statusBadge');
const switches = Array.from(document.querySelectorAll('.switch'));
const statusList = document.getElementById('statusList');
const activeCount = document.getElementById('activeCount');
const toast = document.getElementById('toast');

/* WebAudio minimal engine for click + background tone */
const AudioEngine = (function(){
  let ctx = null;
  let master = null;
  let musicGain = null;
  let musicOsc = null;
  function ensure(){
    if(ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.02; musicGain.connect(master);
  }
  function click(){
    ensure();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.connect(g); g.connect(master);
    o.start(now); o.stop(now + 0.14);
  }
  function startMusic(){
    ensure();
    if(musicOsc) return;
    musicOsc = ctx.createOscillator();
    musicOsc.type = 'sine';
    musicOsc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(musicOsc.frequency);
    musicOsc.connect(musicGain);
    musicOsc.start();
    lfo.start();
  }
  function stopMusic(){
    if(!musicOsc) return;
    try{ musicOsc.stop(); }catch(e){}
    musicOsc = null;
  }
  return { click, startMusic, stopMusic };
})();

let state = {};
function showToast(text, opts={success:true}){
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.style.borderLeftColor = opts.success ? 'var(--success)' : 'var(--danger)';
  el.textContent = text;
  toast.appendChild(el);
  setTimeout(()=>{ el.style.transition='all .4s'; el.style.opacity=0; el.style.transform='translateY(8px)'; }, 2800);
  setTimeout(()=>el.remove(), 3600);
}

function updateStatus(){
  const enabled = Object.values(state).filter(Boolean).length;
  statusBadge.innerHTML = `Status: <strong>${enabled? 'Online':'Idle'}</strong>`;
  activeCount.textContent = 'Active: ' + enabled;
  statusList.innerHTML = '';
  for(const k of Object.keys(state)){
    const row = document.createElement('div');
    row.style.display='flex';row.style.justifyContent='space-between';row.style.alignItems='center';
    row.style.background='rgba(255,255,255,0.01)';row.style.padding='8px';row.style.borderRadius='8px';
    row.innerHTML = `<div style="font-size:14px">${formatName(k)}</div><div style="color:${state[k] ? '#7be495':'#a9b5c8'}">${state[k] ? 'ON' : 'OFF'}</div>`;
    statusList.appendChild(row);
  }
}

switches.forEach(s=>{
  const key = s.dataset.key;
  state[key] = false;
  s.addEventListener('click', ()=>{
    toggleKey(key, s);
  });
  s.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); s.click(); }});
});

function toggleKey(key, element){
  state[key] = !state[key];
  if(state[key]) element.classList.add('on'); else element.classList.remove('on');
  AudioEngine.click();
  showToast(`${formatName(key)} ${state[key] ? 'đã bật' : 'đã tắt'}`, {success: state[key]});
  updateStatus();
  if(state[key]) pulse(element);
}

function formatName(k){
  const map = {
    nheTam:'Nhẹ Tâm', fixRung:'Fix Rung', nhayTam:'Nhạy Tâm',
    aimlock:'Aimlock', tamAo:'Tâm Ảo', optimion:'Optimion', headlock:'Headlock', aimbody:'AimBody'
  };
  return map[k] || k;
}

function pulse(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:360});
}

document.getElementById('resetBtn').addEventListener('click', ()=>{
  for(const k in state){ state[k]=false; }
  switches.forEach(s=>s.classList.remove('on'));
  AudioEngine.click();
  showToast('Đã Reset tất cả chức năng', {success:true});
  updateStatus();
});

document.getElementById('exportState').addEventListener('click', ()=>{
  const data = JSON.stringify(state, null, 2);
  navigator.clipboard?.writeText(data).then(()=>showToast('Sao lưu trạng thái vào clipboard'), ()=>showToast('Không thể copy', {success:false}));
});
document.getElementById('importState').addEventListener('click', ()=>{
  const txt = prompt('Dán JSON trạng thái vào đây:');
  try{
    const obj = JSON.parse(txt);
    for(const k in state) if(k in obj) state[k] = !!obj[k];
    switches.forEach(s=>s.classList.toggle('on', !!state[s.dataset.key]));
    showToast('Đã phục hồi trạng thái', {success:true});
    updateStatus();
  }catch(e){ showToast('JSON không hợp lệ', {success:false}); }
});

document.getElementById('demoNotif').addEventListener('click', ()=>showToast('Thông báo thử nghiệm — OK', {success:true}));
document.getElementById('helpBtn').addEventListener('click', ()=> alert('Hướng dẫn:\n- Nhập mật khẩu chính xác để mở menu.\n- Bật/tắt công tắc để kích hoạt chức năng.\n- Reset All để tắt hết.\n- Export/Import để sao lưu trạng thái.'));

pwBtn.addEventListener('click', doLogin);
pwInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
function doLogin(){
  const v = pwInput.value.trim();
  if(v === CORRECT_KEY){
    overlay.style.display='none';
    app.removeAttribute('aria-hidden');
    AudioEngine.startMusic();
    showToast('Mở khóa thành công!', {success:true});
    updateStatus();
    app.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.9,.2,1)'});
  } else {
    AudioEngine.click();
    showToast('Mật khẩu sai — Vui lòng thử lại', {success:false});
    pwInput.value='';
    pwInput.focus();
  }
}

/* visual toggles to control particles.js */
const particlesToggle = document.getElementById('toggleParticles');
const snowToggle = document.getElementById('toggleSnow');
const rainbowToggle = document.getElementById('toggleRainbow');
particlesToggle.addEventListener('change', ()=>{
  if(window._particlesState) window._particlesState.particlesEnabled = particlesToggle.checked;
});
snowToggle.addEventListener('change', ()=>{
  if(window._particlesState) window._particlesState.snowEnabled = snowToggle.checked;
});
rainbowToggle.addEventListener('change', ()=>{ document.querySelector('.rainbow-outline').style.display = rainbowToggle.checked ? 'block':'none'; });
document.querySelector('.rainbow-outline').style.display = rainbowToggle.checked ? 'block':'none';

window.addEventListener('keydown', (e)=>{
  if(e.key === '1') { document.querySelector('.switch[data-key="nheTam"]').click(); }
  if(e.key === '2') { document.querySelector('.switch[data-key="fixRung"]').click(); }
  if(e.key === '3') { document.querySelector('.switch[data-key="nhayTam"]').click(); }
});

updateStatus();
