(function(){
  const $ = id => document.getElementById(id);
  const DAYS = ['Утренний будильникÆУтренний будильникü','Утренний будильникƒн','Утренний будильникÆУтренний будильникé','Утренний будильникíУтренний будильникÇ','Утренний будильникºУтренний будильникé','Утренний будильникƒУтренний будильникé','Утренний будильникíУтренний будильник▒'];
  const RIDDLES = [
    {q:'Утренний будильникú Утренний будильникéУтренний будильникåУтренний будильник░ Утренний будильник£Утренний будильникìУтренний будильникÇУтренний будильник 5 Утренний будильник┤Утренний будильникçУтренний будильникÇУтренний будильник: Утренний будильникºУтренний будильник░Утренний будильникçУтренний будильник░, Утренний будильникºУтренний будильникçУтренний будильник, Утренний будильникºУтренний будильникçУтренний будильник, Утренний будильникºУтренний будильникçУтренний будильник. Утренний будильникÜУтренний будильник░Утренний будильник Утренний будильник▓Утренний будильникâУтренний будильникé Утренний будильник┐Утренний будильникÅУтренний будильникéУтренний будильникâУтренний будильникÄ?',opts:['Утренний будильникºУтренний будильникâУтренний будильникçУтренний будильникâ','Утренний будильник£Утренний будильникìУтренний будильникÇУтренний будильник','Утренний будильникºУтренний будильник░Утренний будильникçУтренний будильник░','Утренний будильник¥Утренний будильник░'],a:'Утренний будильник£Утренний будильникìУтренний будильникÇУтренний будильник'},
    {q:'Утренний будильникíУтренний будильникîУтренний будильник Утренний будильникüУтренний будильникÅУтренний будильникåУтренний будильник▓ Утренний будильник▓ Утренний будильник│Утренний будильник┤Утренний будильникâ Утренний будильникÄУтренний будильникé 28 Утренний будильник┤ней?',opts:['Утренний будильник₧Утренний будильник┤ин','Утренний будильникÆУтренний будильникüУтренний будильник 12','Утренний будильникöУтренний будильник▓Утренний будильник░','Утренний будильник¿Утренний будильникüУтренний будильникéУтренний будильникî'],a:'Утренний будильникÆУтренний будильникüУтренний будильник 12'},
    {q:'Утренний будильникºУтренний будильникéУтренний будильник Утренний будильник│Утренний будильникçУтренний будильник: 1 Утренний будильник│ Утренний будильник▓Утренний будильник░Утренний будильникéУтренний будильникï Утренний будильник 1 Утренний будильник│ Утренний будильник░?',opts:['Утренний будильникÆУтренний будильник░Утренний будильникéУтренний будильник░','Утренний будильникûУтренний будильник','Утренний будильник₧Утренний будильник┤Утренний будильник░Утренний будильник▓о','Утренний будильник¥Утренний будильник▓Утренний будильникüУтренний будильникéУтренний будильник'],a:'Утренний будильник₧Утренний будильник┤Утренний будильник░Утренний будильник▓о'},
    {q:'Утренний будильникôУтренний будильникÇУтренний будильник 7 Утренний будильникüУтренний будильник▓Утренний будильникçУтренний будильник, 2 Утренний будильник┐Утренний будильникéУтренний будильникâУтренний будильникêУтренний будильник. Утренний будильникíУтренний будильникîУтренний будильник Утренний будильникüУтренний будильник▓Утренний будильникçУтренний будильник Утренний будильникüУтренний будильникéУтренний будильник░Утренний будильникéУтренний будильникüУтренний будильникÅ Утренний будильник Утренний будильникâУтренний будильникéУтренний будильникÇУтренний будильникâ?',opts:['5','2','7','0'],a:'2'}
  ];
  const ODDS = [
    {items:['2','4','8','9'],a:'9',h:'Утренний будильник¥Утренний будильник░Утренний будильник┤Утренний будильник Утренний будильникçУтренний будильникæУтренний будильникéУтренний будильник Утренний будильникçУтренний будильникüУтренний будильник'},
    {items:['Утренний будильник»Утренний будильник▒локо','Утренний будильникæУтренний будильник░Утренний будильник░н','Утренний будильник£Утренний будильникÇУтренний будильник▓Утренний будильникî','Утренний будильникôУтренний будильникÇУтренний будильникâУтренний будильникêУтренний будильник░'],a:'Утренний будильник£Утренний будильникÇУтренний будильник▓Утренний будильникî',h:'Утренний будильник¥Утренний будильник░Утренний будильник┤Утренний будильник Утренний будильникêУтренний будильник Утренний будильникüУтренний будильник▓о'},
    {items:['Утренний будильникÜУтренний будильник▓Утренний будильник░Утренний будильник┤Утренний будильникÇУтренний будильник░Утренний будильникé','Утренний будильникóУтренний будильникÇУтренний будильникâУтренний будильник│Утренний будильникîУтренний будильник','Утренний будильникÜУтренний будильникÇУтренний будильникâУтренний будильник│','Утренний будильникáУтренний будильник▒'],a:'Утренний будильникÜУтренний будильникÇУтренний будильникâУтренний будильник│',h:'Утренний будильникñУтренний будильник│Утренний будильникâУтренний будильникÇУтренний будильник░ Утренний будильник▒Утренний будильник Утренний будильникâУтренний будильник│Утренний будильник▓'},
    {items:['Утренний будильник£Утренний будильник░Утренний будильникÇУтренний будильникü','Утренний будильникÆУтренний будильникÇУтренний будильник░','Утренний будильник¢Утренний будильникâУтренний будильник░','Утренний будильник«Утренний будильник┐Утренний будильникéУтренний будильникÇ'],a:'Утренний будильник¢Утренний будильникâУтренний будильник░',h:'Утренний будильник¥Утренний будильник Утренний будильникÅУтренний будильник▓Утренний будильникÅУтренний будильникéУтренний будильникüУтренний будильникÅ Утренний будильник┐Утренний будильник░Утренний будильникéУтренний будильник'}
  ];

  let alarms = [];
  try { alarms = JSON.parse(localStorage.getItem('sa_clean_v2')) || []; } catch(e) {}
  if (!alarms.length) alarms = [{id:Date.now(),time:'07:30',label:'Утренний будильникúУтренний будильникéУтренний будильникÇУтренний будильник Утренний будильник┐Утренний будильник┤Утренний будильникèУтренний будильникæУтренний будильник',days:[1,2,3,4,5],type:'combo',diff:3,count:3,on:true}];

  let customAudio = null;
  try {
    const req = indexedDB.open('AlarmDB', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('s');
    req.onsuccess = e => {
      const g = e.target.result.transaction('s','readonly').objectStore('s').get('mp3');
      g.onsuccess = () => { if (g.result) customAudio = URL.createObjectURL(g.result); };
    };
  } catch(e) {}

  function save() {
    try { localStorage.setItem('sa_clean_v2', JSON.stringify(alarms)); } catch(e) {}
    const c = alarms.filter(a => a.on).length;
    if ($('statusBar')) $('statusBar').textContent = c ? `≡ƒöö Утренний будильникÉУтренний будильникéУтренний будильник▓Утренний будильник Утренний будильник▒Утренний будильникâУтренний будильник┤Утренний будильникîУтренний будильник▓: ${c}` : '≡ƒöö Утренний будильник¥Утренний будильникé Утренний будильник░Утренний будильникéУтренний будильник▓Утренний будильникïУтренний будильникà Утренний будильник▒Утренний будильникâУтренний будильник┤Утренний будильникîУтренний будильник▓';
  }

  document.querySelectorAll('.nav-item').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
      b.classList.add('active');
      if ($(b.dataset.page)) $(b.dataset.page).classList.add('active');
    };
  });

  let editId = null;
  function render() {
    const l = $('alarmList');
    if (!l) return;
    l.innerHTML = '';
    alarms.sort((a,b) => a.time.localeCompare(b.time)).forEach(a => {
      const el = document.createElement('div');
      el.className = 'card' + (a.on ? ' on' : '');
      const dt = a.days.length === 7 ? 'Утренний будильникÜУтренний будильник░Утренний будильник┤Утренний будильникïУтренний будильник Утренний будильник┤Утренний будильникî' : (!a.days.length ? 'Утренний будильник₧Утренний будильник┤Утренний будильник Утренний будильникÇУтренний будильник░з' : a.days.map(d => DAYS[d]).join(', '));
      el.innerHTML = `<div class="c-info" style="flex:1;cursor:pointer;"><div class="card-time">${a.time}</div><div class="card-sub">${a.label} ΓÇó ${dt}</div><div><span class="tag">Утренний будильникúУтренний будильникÇ.${a.diff} ├ù ${a.count}</span></div></div><label class="switch"><input type="checkbox" ${a.on?'checked':''}><span class="slider"></span></label>`;
      el.querySelector('.c-info').onclick = () => openModal(a);
      el.querySelector('input').onchange = e => { a.on = e.target.checked; save(); render(); };
      l.appendChild(el);
    });
    save();
  }
  const modal = $('alarmModal');
  function openModal(a = null) {
    editId = a ? a.id : null;
    $('mTime').value = a ? a.time : '08:00';
    $('mLabel').value = a ? a.label : '';
    $('mType').value = a ? a.type : 'combo';
    $('mDiff').value = a ? a.diff : 3;
    $('mCnt').value = a ? a.count : 3;
    $('mDiffLbl').textContent = $('mDiff').value;
    $('mCntLbl').textContent = $('mCnt').value;
    $('btnDelAlarm').style.display = a ? 'block' : 'none';
    const sel = a ? a.days : [1,2,3,4,5];
    document.querySelectorAll('#mDays .day-chip').forEach(c => c.classList.toggle('sel', sel.includes(Number(c.dataset.d))));
    modal.classList.add('open');
  }
  if ($('btnAddAlarm')) $('btnAddAlarm').onclick = () => openModal(null);
  if ($('btnCloseModal')) $('btnCloseModal').onclick = () => modal.classList.remove('open');
  if ($('btnCancelModal')) $('btnCancelModal').onclick = () => modal.classList.remove('open');
  document.querySelectorAll('#mDays .day-chip').forEach(c => c.onclick = () => c.classList.toggle('sel'));
  if ($('mDiff')) $('mDiff').oninput = e => $('mDiffLbl').textContent = e.target.value;
  if ($('mCnt')) $('mCnt').oninput = e => $('mCntLbl').textContent = e.target.value;
  if ($('mAudio')) $('mAudio').onchange = e => {
    const f = e.target.files[0];
    if (f) {
      const req = indexedDB.open('AlarmDB', 1);
      req.onsuccess = ev => {
        ev.target.result.transaction('s','readwrite').objectStore('s').put(f, 'mp3');
        customAudio = URL.createObjectURL(f);
        alert('Утренний будильник£Утренний будильникâУтренний будильникïУтренний будильник░ Утренний будильникüУтренний будильникàУтренний будильникÇУтренний будильник░Утренний будильник░!');
      };
    }
  };
  if ($('btnSaveAlarm')) $('btnSaveAlarm').onclick = () => {
    const days = [];
    document.querySelectorAll('#mDays .day-chip.sel').forEach(c => days.push(Number(c.dataset.d)));
    const obj = {
      id: editId || Date.now(),
      time: $('mTime').value || '08:00',
      label: $('mLabel').value.trim() || 'Утренний будильникæУтренний будильникâУтренний будильник┤Утренний будильникîУтренний будильник',
      days, type: $('mType').value,
      diff: Number($('mDiff').value), count: Number($('mCnt').value), on: true
    };
    if (editId) { const i = alarms.findIndex(x => x.id === editId); if (i !== -1) alarms[i] = obj; }
    else alarms.push(obj);
    render(); modal.classList.remove('open');
  };
  if ($('btnDelAlarm')) $('btnDelAlarm').onclick = () => { alarms = alarms.filter(x => x.id !== editId); render(); modal.classList.remove('open'); };

  function calcRange() {
    const [sh,sm] = ($('serStart').value || '06:00').split(':').map(Number);
    const [eh,em] = ($('serEnd').value || '07:25').split(':').map(Number);
    const st = Math.max(1, Number($('serStep').value) || 10);
    let s = sh*60+sm, e = eh*60+em; if (e < s) e += 1440;
    const out = [];
    for (let c = s; c <= e && out.length < 60; c += st) out.push(`${String(Math.floor((c%1440)/60)).padStart(2,'0')}:${String(c%60).padStart(2,'0')}`);
    if ($('serPreview')) $('serPreview').textContent = `Утренний будильникæУтренний будильникâУтренний будильник┤Утренний будильникé Утренний будильникüУтренний будильник┤Утренний будильник░но ${out.length} Утренний будильник▒Утренний будильникâУтренний будильник┤Утренний будильникîУтренний будильник▓: ${out.join(', ')}`;
    return out;
  }
  ['serStart','serEnd','serStep'].forEach(id => { if ($(id)) $(id).oninput = calcRange; });
  if ($('serDiff')) $('serDiff').oninput = e => $('serDiffLbl').textContent = e.target.value;
  if ($('btnCreateSeries')) $('btnCreateSeries').onclick = () => {
    const list = calcRange();
    list.forEach((t, i) => alarms.push({ id: Date.now()+i, time: t, label: `Утренний будильникíУтренний будильникÇУтренний будильникÅ (${i+1}/${list.length})`, days:[1,2,3,4,5], type: $('serType').value, diff: Number($('serDiff').value), count: 3, on: true }));
    render();
    const firstTab = document.querySelector('[data-page="page-alarms"]');
    if (firstTab) firstTab.click();
  };
  calcRange();
  let tmSec = 300, tmInt = null;
  function updTm() { if ($('tmDisplay')) $('tmDisplay').textContent = `${String(Math.floor(tmSec/3600)).padStart(2,'0')}:${String(Math.floor((tmSec%3600)/60)).padStart(2,'0')}:${String(tmSec%60).padStart(2,'0')}`; }
  document.querySelectorAll('.tm-set').forEach(b => b.onclick = () => { clearInterval(tmInt); tmInt = null; tmSec = Number(b.dataset.s); updTm(); });
  if ($('btnTmStart')) $('btnTmStart').onclick = () => {
    if (tmInt) { clearInterval(tmInt); tmInt = null; return; }
    tmInt = setInterval(() => { tmSec--; updTm(); if (tmSec <= 0) { clearInterval(tmInt); tmInt = null; ring({time:'Утренний будильникóУтренний будильникÉУтренний будильникÖУтренний будильник£Утренний будильникòУтренний будильникá',label:'Утренний будильникÆУтренний будильникÇУтренний будильникÅ Утренний будильник▓Утренний будильникïУтренний будильникêУтренний будильник!',type:'math',diff:2,count:2}); } }, 1000);
  };
  if ($('btnTmReset')) $('btnTmReset').onclick = () => { clearInterval(tmInt); tmInt = null; tmSec = 300; updTm(); };

  let swMs = 0, swInt = null, laps = 0;
  function fmtSw(m) { return `${String(Math.floor(m/60000)).padStart(2,'0')}:${String(Math.floor((m%60000)/1000)).padStart(2,'0')}.${String(Math.floor((m%1000)/10)).padStart(2,'0')}`; }
  if ($('btnSwStart')) $('btnSwStart').onclick = () => {
    if (swInt) { clearInterval(swInt); swInt = null; return; }
    let last = Date.now();
    swInt = setInterval(() => { swMs += Date.now() - last; last = Date.now(); if ($('swDisplay')) $('swDisplay').textContent = fmtSw(swMs); }, 30);
  };
  if ($('btnSwLap')) $('btnSwLap').onclick = () => {
    if (!swMs) return; laps++;
    const d = document.createElement('div'); d.className = 'card'; d.innerHTML = `<span>Утренний будильникÜУтренний будильникÇУтренний будильникâУтренний будильник│ ${laps}</span><strong>${fmtSw(swMs)}</strong>`;
    if ($('swLaps')) $('swLaps').prepend(d);
  };
  if ($('btnSwReset')) $('btnSwReset').onclick = () => { clearInterval(swInt); swInt = null; swMs = 0; laps = 0; if ($('swDisplay')) $('swDisplay').textContent = '00:00.00'; if ($('swLaps')) $('swLaps').innerHTML = ''; };

  let actx = null, sInt = null, audEl = null, curRing = null, step = 1, bugInt = null;
  function playAlarm() {
    try { if (window.AndroidLock) window.AndroidLock.setRinging(true); } catch(e) {}
    if (customAudio) { audEl = new Audio(customAudio); audEl.loop = true; audEl.play().catch(()=>{}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; actx = new AC();
      let hi = true;
      sInt = setInterval(() => { const o = actx.createOscillator(); o.type = 'square'; o.frequency.value = hi ? 950 : 700; o.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.2); hi = !hi; }, 250);
    } catch(e) {}
  }
  function stopAlarm() {
    try { if (window.AndroidLock) window.AndroidLock.setRinging(false); } catch(e) {}
    if (sInt) clearInterval(sInt); if (bugInt) clearInterval(bugInt); if (actx) try { actx.close(); } catch(e) {} if (audEl) audEl.pause();
    $('ringScreen').classList.remove('active'); curRing = null;
  }
  function next() { $('tErr').textContent = ''; if (step >= curRing.count) stopAlarm(); else { step++; showTask(); } }
  function fail() { step = 1; $('tErr').textContent = 'Γ¥î Утренний будильник₧Утренний будильникêУтренний будильник▒Утренний будильник░! Утренний будильникíУтренний будильник▒Утренний будильникÇУтренний будильникü Утренний будильник░ 1-Утренний будильник Утренний будильник░Утренний будильник┤Утренний будильник░ние!'; showTask(); }

  function showTask() {
    if (bugInt) clearInterval(bugInt);
    const z = $('tZone'); z.innerHTML = '';
    const q = $('tQuest'); $('tStep').textContent = `Утренний будильникùУтренний будильник░Утренний будильник┤Утренний будильник░ние ${step} из ${curRing.count}`;
    const ALL = ['math','smash','pairs','memory','riddle','odd','code'];
    const mode = curRing.type === 'combo' ? ALL[(step - 1) % 7] : curRing.type;
    const d = curRing.diff || 3, r = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

    if (mode === 'math' || mode === 'code') {
      let ans = '';
      if (mode === 'math') { const a = r(6,15+d*4), b = r(5,12+d*3); q.textContent = `${a} ├ù ${b} = ?`; ans = String(a*b); }
      else { const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for (let i=0; i<4+d; i++) ans += ch[r(0,ch.length-1)]; q.textContent = 'Утренний будильникÆУтренний будильник▓Утренний будильник┤Утренний будильник Утренний будильник┤: ' + ans; }
      z.innerHTML = `<input id="ansIn" class="inp" style="text-align:center;font-size:20px;margin-bottom:10px;" placeholder="Утренний будильник₧Утренний будильникéУтренний будильник▓Утренний будильникé"><button id="ansBtn" class="btn-main">Утренний будильникƒУтренний будильникÇУтренний будильник▓Утренний будильникÇУтренний будильникéУтренний будильникî</button>`;
      $('ansBtn').onclick = () => $('ansIn').value.trim().toUpperCase() === ans ? next() : fail();
    } else if (mode === 'riddle' || mode === 'odd') {
      const item = mode === 'riddle' ? RIDDLES[r(0,RIDDLES.length-1)] : ODDS[r(0,ODDS.length-1)];
      q.textContent = mode === 'riddle' ? item.q : item.h;
      const g = document.createElement('div'); g.className = 'opts-grid';
      const arr = mode === 'riddle' ? item.opts : item.items;
      [...arr].sort(()=>Math.random()-0.5).forEach(o => {
        const b = document.createElement('button'); b.className = 'opt-b'; b.textContent = o;
        b.onclick = () => o === item.a ? next() : fail();
        g.appendChild(b);
      });
      z.appendChild(g);
    } else if (mode === 'memory') {
      q.textContent = 'Утренний будильникƒУтренний будильник▓Утренний будильникéУтренний будильникÇУтренний будильник Утренний будильник┐Утренний будильникÇУтренний будильникÅУтренний будильник┤Утренний будильник Утренний будильник▓Утренний будильникüУтренний будильник┐Утренний будильникïУтренний будильникêУтренний будильник!';
      const g = document.createElement('div'); g.className = 'mem-grid'; z.appendChild(g);
      const cells = []; let seq = [], pos = 0, lock = true;
      for (let k=0; k<2+d; k++) seq.push(r(0,8));
      for (let i=0; i<9; i++) {
        const c = document.createElement('div'); c.className = 'mem-c';
        c.onclick = () => { if (lock) return; c.classList.add('lit'); setTimeout(()=>c.classList.remove('lit'),150); if (i === seq[pos]) { pos++; if (pos >= seq.length) next(); } else fail(); };
        g.appendChild(c); cells.push(c);
      }
      let idx = 0; const iv = setInterval(() => { if (idx >= seq.length) { clearInterval(iv); lock = false; return; } cells[seq[idx]].classList.add('lit'); setTimeout(()=>cells[seq[idx]].classList.remove('lit'),300); idx++; }, 500);
    } else if (mode === 'pairs') {
      q.textContent = 'Утренний будильник¥Утренний будильник░Утренний будильник┤Утренний будильник Утренний будильник▓Утренний будильникüУтренний будильник Утренний будильник┐Утренний будильник░Утренний будильникÇУтренний будильникï!';
      const g = document.createElement('div'); g.className = 'pairs-grid'; z.appendChild(g);
      const em = ['≡ƒöÑ','ΓÜí','≡ƒÜÇ','≡ƒÆÄ'].slice(0, d<=2?3:4); const dk = [...em,...em].sort(()=>Math.random()-0.5);
      let op = [], mt = 0, lk = false;
      dk.forEach(s => {
        const c = document.createElement('div'); c.className = 'pair-c'; c.textContent = s;
        c.onclick = () => {
          if (lk || c.classList.contains('open') || c.classList.contains('done')) return;
          c.classList.add('open'); op.push(c);
          if (op.length === 2) { lk = true; if (op[0].textContent === op[1].textContent) { op.forEach(x=>x.classList.add('done')); op=[]; lk=false; mt++; if(mt>=em.length) next(); } else setTimeout(()=>{ op.forEach(x=>x.classList.remove('open')); op=[]; lk=false; }, 450); }
        };
        g.appendChild(c);
      });
    } else {
      q.textContent = 'Утренний будильникáУтренний будильник░Утренний будильник┤Утренний будильник░Утренний будильник▓Утренний будильник Утренний будильникâУтренний будильник▒Утренний будильник│Утренний будильник░Утренний будильникÄУтренний будильникëУтренний будильникà Утренний будильникâУтренний будильник▓!';
      const ar = document.createElement('div'); ar.className = 'arena'; z.appendChild(ar);
      let left = 4+d; const bg = document.createElement('div'); bg.className = 'bug'; bg.textContent = '≡ƒÉ₧'; ar.appendChild(bg);
      const mv = () => { bg.style.left = r(5, Math.max(10, ar.clientWidth-55))+'px'; bg.style.top = r(5, Math.max(10, ar.clientHeight-55))+'px'; };
      mv(); bugInt = setInterval(mv, 700);
      bg.onpointerdown = e => { e.preventDefault(); left--; if (left <= 0) next(); else mv(); };
    }
  }

  function ring(a) {
    curRing = a; step = 1;
    $('rTime').textContent = a.time; $('rTitle').textContent = a.label;
    $('ringScreen').classList.add('active');
    playAlarm(); showTask();
  }
  if ($('btnTestAlarm')) $('btnTestAlarm').onclick = () => ring(alarms[0] || {time:'Утренний будильникóУтренний будильникòУтренний будильникíУтренний будильникó',label:'Утренний будильникƒУтренний будильникÇУтренний будильник▓Утренний будильникÇУтренний будильник░ Утренний будильник▒Утренний будильникâУтренний будильник┤Утренний будильникîУтренний будильник░',type:'combo',diff:2,count:4});

  let lastMin = '';
  setInterval(() => {
    const n = new Date();
    if ($('topClock')) $('topClock').textContent = n.toTimeString().slice(0, 8);
    const hm = n.toTimeString().slice(0, 5);
    const mk = n.toDateString() + hm;
    if (n.getSeconds() === 0 && lastMin !== mk && !curRing) {
      alarms.forEach(a => { if (a.on && a.time === hm && (!a.days.length || a.days.includes(n.getDay()))) { lastMin = mk; ring(a); } });
    }
  }, 1000);

  render();
})();
window.triggerRing = typeof triggerRing !== 'undefined' ? triggerRing : window.triggerRing;