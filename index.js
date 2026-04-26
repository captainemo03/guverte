
// ===== CANLI ARKA PLAN =====
(function(){
  const cv=document.getElementById('bg-canvas');
  if(!cv)return;
  const cx=cv.getContext('2d');
  let W,H,t=0;
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  function draw(){
    cx.clearRect(0,0,W,H);
    // Sky
    const sky=cx.createLinearGradient(0,0,0,H*.65);
    sky.addColorStop(0,'#020810');sky.addColorStop(.6,'#04111f');sky.addColorStop(1,'#071828');
    cx.fillStyle=sky;cx.fillRect(0,0,W,H*.65);
    // Stars
    const stars=[[.16,.14,1],[.3,.07,1.2],[.44,.17,1],[.62,.05,1],[.76,.12,1],[.86,.21,.8],[.1,.25,1],[.92,.07,1.1],[.24,.1,.9],[.56,.16,1.3],[.68,.08,1],[.38,.22,.8]];
    stars.forEach(([rx,ry,r])=>{
      const a=Math.sin(t*.012+rx*10)*.4+.6;
      cx.fillStyle=`rgba(200,220,255,${a})`;
      cx.beginPath();cx.arc(rx*W,ry*H*.65,r,0,Math.PI*2);cx.fill();
    });
    // Moon
    const mx=W*.82,my=H*.1,mr=Math.min(W,H)*.028;
    const mg=cx.createRadialGradient(mx,my,0,mx,my,mr);
    mg.addColorStop(0,'rgba(200,215,230,.9)');mg.addColorStop(1,'transparent');
    cx.fillStyle=mg;cx.beginPath();cx.arc(mx,my,mr,0,Math.PI*2);cx.fill();
    cx.fillStyle='#030b18';cx.beginPath();cx.arc(mx+mr*.4,my-mr*.2,mr*.85,0,Math.PI*2);cx.fill();
    // Sea
    const sea=cx.createLinearGradient(0,H*.62,0,H);
    sea.addColorStop(0,'#071828');sea.addColorStop(1,'#030c18');
    cx.fillStyle=sea;cx.fillRect(0,H*.62,W,H);
    // Waves
    [[0,'rgba(13,48,96,.75)'],[1,'rgba(10,36,72,.6)'],[2,'rgba(8,28,56,.5)']].forEach(([i,col])=>{
      const phase=t*.009-i*.6,amp=(7+i*4)*(H/600),yb=H*(.64+i*.07);
      cx.beginPath();cx.moveTo(0,yb);
      for(let x=0;x<=W;x+=5)cx.lineTo(x,yb+Math.sin(x*.014+phase)*amp);
      cx.lineTo(W,H);cx.lineTo(0,H);cx.closePath();
      cx.fillStyle=col;cx.fill();
    });
    // Moon reflection
    cx.fillStyle='rgba(180,200,220,.05)';
    cx.fillRect(W*.78,H*.62,W*.08,H*.38);
    t++;requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);
  resize();draw();
})();


// ===== DUVAR SAATİ =====
(function(){
  const days=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  function drawClock(){
    const cv=document.getElementById('clock-canvas');
    if(!cv)return;
    // Force canvas size if it was collapsed (inside display:none)
    if(cv.width<10){cv.width=72;cv.height=72;}
    const cx=cv.getContext('2d');
    const W=cv.width,H=cv.height,R=W/2-4,cx0=W/2,cy0=H/2;
    const now=new Date();
    const h=now.getHours(),m=now.getMinutes(),s=now.getSeconds(),ms=now.getMilliseconds();
    cx.clearRect(0,0,W,H);
    // Face
    const bg=cx.createRadialGradient(cx0,cy0,0,cx0,cy0,R);
    bg.addColorStop(0,'#0d1f3c');bg.addColorStop(1,'#071324');
    cx.fillStyle=bg;cx.beginPath();cx.arc(cx0,cy0,R,0,Math.PI*2);cx.fill();
    // Outer ring
    cx.strokeStyle='#1a6bbf';cx.lineWidth=2;
    cx.beginPath();cx.arc(cx0,cy0,R,0,Math.PI*2);cx.stroke();
    cx.strokeStyle='#0f2748';cx.lineWidth=1;
    cx.beginPath();cx.arc(cx0,cy0,R-3,0,Math.PI*2);cx.stroke();
    // Hour ticks
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      const big=i%3===0;
      const r1=R-(big?8:5),r2=R-2;
      cx.strokeStyle=big?'#2e86e0':'#1a3a5f';
      cx.lineWidth=big?2:1;
      cx.beginPath();
      cx.moveTo(cx0+Math.sin(a)*r1,cy0-Math.cos(a)*r1);
      cx.lineTo(cx0+Math.sin(a)*r2,cy0-Math.cos(a)*r2);
      cx.stroke();
    }
    // Hour numbers (12,3,6,9)
    cx.fillStyle='#4a7098';cx.font='bold 7px Share Tech Mono,monospace';cx.textAlign='center';cx.textBaseline='middle';
    [[12,0],[3,Math.PI/2],[6,Math.PI],[9,-Math.PI/2]].forEach(([n,a])=>{
      const nr=R-16;
      cx.fillText(n,cx0+Math.sin(a)*nr,cy0-Math.cos(a)*nr);
    });
    // Hour hand
    const ha=((h%12)+m/60+s/3600)*Math.PI/6;
    cx.strokeStyle='#dce8fc';cx.lineWidth=3;cx.lineCap='round';
    cx.beginPath();cx.moveTo(cx0,cy0);
    cx.lineTo(cx0+Math.sin(ha)*(R*.5),cy0-Math.cos(ha)*(R*.5));cx.stroke();
    // Minute hand
    const ma=(m+s/60)*Math.PI/30;
    cx.strokeStyle='#8aabcc';cx.lineWidth=2;cx.lineCap='round';
    cx.beginPath();cx.moveTo(cx0,cy0);
    cx.lineTo(cx0+Math.sin(ma)*(R*.72),cy0-Math.cos(ma)*(R*.72));cx.stroke();
    // Second hand
    const sa=(s+ms/1000)*Math.PI/30;
    cx.strokeStyle='#c9952a';cx.lineWidth=1;cx.lineCap='round';
    cx.beginPath();cx.moveTo(cx0-Math.sin(sa)*8,cy0+Math.cos(sa)*8);
    cx.lineTo(cx0+Math.sin(sa)*(R*.85),cy0-Math.cos(sa)*(R*.85));cx.stroke();
    // Center dot
    cx.fillStyle='#c9952a';cx.beginPath();cx.arc(cx0,cy0,3,0,Math.PI*2);cx.fill();
    cx.fillStyle='#dce8fc';cx.beginPath();cx.arc(cx0,cy0,1.5,0,Math.PI*2);cx.fill();
    // Digital
    const dig=document.getElementById('clock-digital');
    if(dig) dig.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    // Date
    const dt=document.getElementById('clock-date');
    if(dt) dt.textContent=`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  setInterval(drawClock,100);
  drawClock();
  window._drawClock=drawClock;
})();

// ===== VERİ =====
const YEARS=[
  {year:1985,era:"Analog Çağ",note:"GPS yok. Sextant ile navigasyon."},
  {year:1998,era:"Dijital Geçiş",note:"GPS yaygınlaşıyor."},
  {year:2008,era:"Modern",note:"ECDIS, AIS, VDR tam kurulu."},
  {year:2018,era:"Günümüz",note:"Otomasyon ve siber güvenlik."},
];

const STYPES=[
  {key:"kuru",  ico:"🏗️",nm:"Kuru Yük",   ds:"Dökme/paket",ton:"22.000 DWT",spd:"14 kn",kontracts:[{ay:6,izin:1,ucret:"Orta"},{ay:9,izin:2,ucret:"Orta+"}]},
  {key:"tanker",ico:"🛢️",nm:"Tanker",     ds:"Petrol/kimya",ton:"45.000 DWT",spd:"13 kn",kontracts:[{ay:4,izin:1,ucret:"Yüksek"},{ay:6,izin:1,ucret:"Yüksek+"}]},
  {key:"kont",  ico:"📦",nm:"Konteyner",  ds:"TEU lojistik",ton:"18.000 GT", spd:"20 kn",kontracts:[{ay:4,izin:1,ucret:"Yüksek"},{ay:6,izin:2,ucret:"Çok Yüksek"}]},
  {key:"roro",  ico:"🚗",nm:"Ro-Ro",      ds:"Araç rampalı",ton:"12.000 GT", spd:"18 kn",kontracts:[{ay:3,izin:1,ucret:"Orta"},{ay:5,izin:1,ucret:"Orta+"}]},
  {key:"bulk",  ico:"⛏️",nm:"Bulk",        ds:"Maden/tahıl", ton:"55.000 DWT",spd:"13 kn",kontracts:[{ay:6,izin:2,ucret:"Orta"},{ay:9,izin:2,ucret:"Orta+"}]},
  {key:"lng",   ico:"🔵",nm:"LNG",         ds:"Sıvı gaz",    ton:"75.000 m³", spd:"19 kn",kontracts:[{ay:4,izin:1,ucret:"Çok Yüksek"},{ay:6,izin:2,ucret:"Maksimum"}]},
];

const SNAMES={
  kuru:["M/V Ege Meltem","M/V Karadeniz","M/V Bozkurt","M/V Marmara","M/V Toros"],
  tanker:["MT Boğaziçi","MT Fırat","MT Dicle","MT Akdeniz"],
  kont:["MV Istanbul Express","MV Turkon Bora","MV Bosphorus Star"],
  roro:["MV Ataşehir","MV Kadıköy","MV Üsküdar"],
  bulk:["M/V Trakya","M/V Anadolu","M/V Kayseri"],
  lng:["LNG Barbaros","LNG Fatih","LNG Yavuz"],
};

const ERA_TECH={
  1985:"GPS yok — sextant ve kâğıt harita ile seyir yapılıyor.",
  1998:"GPS yaygınlaşıyor ama güvenilirliği tartışmalı. Kâğıt harita zorunlu.",
  2008:"ECDIS var, AIS var, VDR var. Her şey kayıt altında.",
  2018:"Tam otomasyon, siber güvenlik, IMO 2020 kükürt sınırı geçerli.",
};

const CREW={
  anlatici:{name:"Anlatıcı",icon:"📖",title:""},
  suvari:{name:"Süvari",icon:"🎖️",title:"Kaptan"},
  z1:{name:"1. Zabiti",icon:"🧭",title:"Güverte Ops. Sorumlusu"},
  z2:{name:"2. Zabiti",icon:"🗺️",title:"Seyir Subayı"},
  z3:{name:"3. Zabiti",icon:"🚒",title:"Emniyet Subayı — SOLAS"},
  carkci:{name:"Çarkçıbaşı",icon:"⚙️",title:"Baş Mühendis"},
  bas2:{name:"2. Başmakinist",icon:"🔧",title:"Makine 2. Amiri"},
  lostromo:{name:"Lostromo",icon:"🪢",title:"Güverte Ustası"},
  silici:{name:"Silici Ramazan",icon:"🧹",title:"Güverte Temizlik Ustası"},
  yagci:{name:"Yağcı Mehmet Ali",icon:"🛢️",title:"Makine Yağlama Ustası"},
  asci:{name:"Aşçı Mehmet Usta",icon:"🍳",title:"Yemekhane Sorumlusu"},
  hasan:{name:"Tayfa Hasan",icon:"👷",title:"Deneyimli Güverte Tayfası"},
  musa:{name:"Tayfa Musa",icon:"👷",title:"Genç Güverte Tayfası"},
  gazsubay:{name:"Gaz Kontrol Subayı",icon:"🔵",title:"IGF Sertifikalı LNG Sorumlusu"},
};

// ===== GRAFİKLER =====
const GFX={
harbor:`<rect width="480" height="145" fill="#040d1a"/>
<rect y="92" width="480" height="53" fill="#06182e"/>
<rect x="30" y="72" width="180" height="20" fill="#0f2040"/>
<rect x="30" y="70" width="180" height="4" fill="#1a3a5f"/>
<rect x="55" y="56" width="130" height="18" rx="3" fill="#0d2040"/>
<rect x="140" y="40" width="35" height="18" rx="2" fill="#0f2848"/>
<rect x="148" y="34" width="10" height="8" fill="#0d1f3c"/>
<line x1="153" y1="18" x2="153" y2="40" stroke="#1a3a5f" stroke-width="1.5"/>
<rect x="143" y="44" width="5" height="4" rx="1" fill="#6fa8dc" opacity=".7"/>
<rect x="151" y="44" width="5" height="4" rx="1" fill="#6fa8dc" opacity=".5"/>
<rect x="159" y="44" width="5" height="4" rx="1" fill="#6fa8dc" opacity=".7"/>
<line x1="235" y1="18" x2="235" y2="90" stroke="#1e3a5f" stroke-width="2"/>
<line x1="210" y1="20" x2="265" y2="20" stroke="#1e3a5f" stroke-width="2"/>
<line x1="250" y1="20" x2="250" y2="70" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3,2"/>
<rect x="308" y="76" width="28" height="14" rx="1" fill="#1a4a7f"/>
<rect x="338" y="76" width="28" height="14" rx="1" fill="#2a5a30"/>
<rect x="368" y="76" width="28" height="14" rx="1" fill="#5a1a1a"/>
<rect x="308" y="62" width="28" height="14" rx="1" fill="#2a5a30"/>
<rect x="338" y="62" width="28" height="14" rx="1" fill="#1a4a7f"/>
<circle cx="418" cy="36" r="3" fill="#d4a017" opacity=".8"/>
<line x1="55" y1="96" x2="185" y2="96" stroke="#1a4a7f" stroke-width="1" opacity=".4"/>`,

sea:`<rect width="480" height="145" fill="#030d1a"/>
<rect width="480" height="60" fill="#04111f"/>
<ellipse cx="240" cy="62" rx="200" ry="12" fill="#1a4a7f" opacity=".15"/>
<rect y="62" width="480" height="83" fill="#06182e"/>
<g class="wave-anim">
<path d="M0 76 Q30 70 60 76 Q90 82 120 76 Q150 70 180 76 Q210 82 240 76 Q270 70 300 76 Q330 82 360 76 Q390 70 420 76 Q450 82 480 76 Q510 70 540 76" fill="none" stroke="#0d3060" stroke-width="1.5" opacity=".7"/>
<path d="M0 92 Q40 86 80 92 Q120 98 160 92 Q200 86 240 92 Q280 98 320 92 Q360 86 400 92 Q440 98 480 92" fill="none" stroke="#0f3868" stroke-width="1.2" opacity=".5"/>
<path d="M0 110 Q60 104 120 110 Q180 116 240 110 Q300 104 360 110 Q420 116 480 110" fill="none" stroke="#0d3060" stroke-width="1" opacity=".4"/>
</g>
<circle cx="80" cy="20" r="1" fill="#fff" opacity=".6"/>
<circle cx="150" cy="10" r="1" fill="#fff" opacity=".8"/>
<circle cx="220" cy="24" r="1.2" fill="#fff" opacity=".5"/>
<circle cx="310" cy="7" r="1" fill="#fff" opacity=".7"/>
<circle cx="380" cy="17" r="1" fill="#fff" opacity=".6"/>
<rect x="340" y="52" width="60" height="10" rx="2" fill="#040e1e"/>
<rect x="370" y="45" width="15" height="8" rx="1" fill="#040e1e"/>`,

night:`<rect width="480" height="145" fill="#020810"/>
<rect width="480" height="66" fill="#030b18"/>
<circle cx="380" cy="25" r="14" fill="#b8c8d8" opacity=".9"/>
<circle cx="385" cy="22" r="11" fill="#030b18"/>
<circle cx="380" cy="25" r="22" fill="none" stroke="#6090a0" stroke-width="1" opacity=".3"/>
<circle cx="30" cy="14" r="1" fill="#fff" opacity=".8"/>
<circle cx="70" cy="8" r="1.2" fill="#fff" opacity=".9"/>
<circle cx="120" cy="21" r="1" fill="#fff" opacity=".6"/>
<circle cx="160" cy="9" r="1" fill="#fff" opacity=".7"/>
<circle cx="200" cy="27" r="1.5" fill="#fff" opacity=".5"/>
<circle cx="250" cy="4" r="1" fill="#fff" opacity=".8"/>
<circle cx="310" cy="11" r="1.2" fill="#fff" opacity=".7"/>
<circle cx="430" cy="15" r="1" fill="#fff" opacity=".6"/>
<rect y="66" width="480" height="79" fill="#030c1e"/>
<ellipse cx="390" cy="100" rx="30" ry="4" fill="#405060" opacity=".3"/>
<g class="wave-anim">
<path d="M0 78 Q40 72 80 78 Q120 84 160 78 Q200 72 240 78 Q280 84 320 78 Q360 72 400 78 Q440 84 480 78" fill="none" stroke="#0a2038" stroke-width="1.5" opacity=".6"/>
<path d="M0 96 Q50 90 100 96 Q150 102 200 96 Q250 90 300 96 Q350 102 400 96 Q450 90 500 96" fill="none" stroke="#081828" stroke-width="1.2" opacity=".5"/>
</g>
<circle cx="240" cy="63" r="3" fill="#c93030" opacity=".9"/>
<circle cx="240" cy="63" r="6" fill="none" stroke="#c93030" stroke-width="1" opacity=".4"/>`,

storm:`<rect width="480" height="145" fill="#020a14"/>
<ellipse cx="100" cy="18" rx="80" ry="24" fill="#0a1828" opacity=".95"/>
<ellipse cx="200" cy="10" rx="100" ry="21" fill="#081420" opacity=".9"/>
<ellipse cx="320" cy="16" rx="90" ry="23" fill="#0a1828" opacity=".95"/>
<ellipse cx="430" cy="9" rx="70" ry="19" fill="#060f18"/>
<polyline points="200,13 190,43 198,43 183,73" fill="none" stroke="#d4d8e0" stroke-width="1.5" opacity=".8"/>
<polyline points="340,8 330,36 338,36 322,63" fill="none" stroke="#c0c8d8" stroke-width="1" opacity=".5"/>
<line x1="40" y1="48" x2="34" y2="68" stroke="#0d3060" stroke-width="1" opacity=".6"/>
<line x1="80" y1="43" x2="74" y2="63" stroke="#0d3060" stroke-width="1" opacity=".5"/>
<line x1="130" y1="48" x2="124" y2="68" stroke="#0d3060" stroke-width="1" opacity=".6"/>
<line x1="200" y1="46" x2="194" y2="66" stroke="#0d3060" stroke-width="1" opacity=".5"/>
<line x1="280" y1="50" x2="274" y2="70" stroke="#0d3060" stroke-width="1" opacity=".6"/>
<line x1="360" y1="44" x2="354" y2="64" stroke="#0d3060" stroke-width="1" opacity=".5"/>
<line x1="430" y1="48" x2="424" y2="68" stroke="#0d3060" stroke-width="1" opacity=".6"/>
<rect y="70" width="480" height="75" fill="#041020"/>
<path d="M0 78 Q20 66 40 78 Q60 90 80 78 Q100 66 120 78 Q140 90 160 78 Q180 66 200 78 Q220 90 240 78 Q260 66 280 78 Q300 90 320 78 Q340 66 360 78 Q380 90 400 78 Q420 66 440 78 Q460 90 480 78" fill="none" stroke="#0d3060" stroke-width="2.5" opacity=".8"/>
<path d="M0 96 Q25 82 50 96 Q75 110 100 96 Q125 82 150 96 Q175 110 200 96 Q225 82 250 96 Q275 110 300 96 Q325 82 350 96 Q375 110 400 96 Q425 82 450 96 Q475 110 480 96" fill="none" stroke="#0a2848" stroke-width="2" opacity=".7"/>
<path d="M20 80 Q28 76 36 80" fill="none" stroke="#8ab0c8" stroke-width="1.5" opacity=".5"/>
<path d="M100 76 Q108 72 116 76" fill="none" stroke="#8ab0c8" stroke-width="1.5" opacity=".4"/>
<path d="M220 82 Q228 78 236 82" fill="none" stroke="#8ab0c8" stroke-width="1.5" opacity=".5"/>
<path d="M340 78 Q348 74 356 78" fill="none" stroke="#8ab0c8" stroke-width="1.5" opacity=".4"/>`,

radar:`<rect width="480" height="145" fill="#020d08"/>
<circle cx="240" cy="72" r="66" fill="#030f06"/>
<circle cx="240" cy="72" r="66" fill="none" stroke="#0d3a18" stroke-width="1.5"/>
<circle cx="240" cy="72" r="22" fill="none" stroke="#0d3a18" stroke-width="1" opacity=".6"/>
<circle cx="240" cy="72" r="44" fill="none" stroke="#0d3a18" stroke-width="1" opacity=".5"/>
<circle cx="240" cy="72" r="64" fill="none" stroke="#0d3a18" stroke-width="1" opacity=".4"/>
<line x1="174" y1="72" x2="306" y2="72" stroke="#0d3a18" stroke-width="1" opacity=".5"/>
<line x1="240" y1="6" x2="240" y2="138" stroke="#0d3a18" stroke-width="1" opacity=".5"/>
<g class="radar-sweep" style="transform-origin:240px 72px">
<line x1="240" y1="72" x2="240" y2="8" stroke="#1aff50" stroke-width="1.5" opacity=".8"/>
<path d="M240 72 L240 8 A64 64 0 0 1 296 102 Z" fill="#1aff50" opacity=".06"/>
</g>
<circle cx="266" cy="48" r="3" fill="#1aff50" opacity=".9" class="blink"/>
<circle cx="280" cy="88" r="2.5" fill="#1aff50" opacity=".7"/>
<circle cx="207" cy="60" r="2" fill="#1aff50" opacity=".5"/>
<circle cx="250" cy="106" r="2" fill="#1aff50" opacity=".6"/>
<circle cx="240" cy="72" r="3" fill="#6fa8dc"/>
<line x1="240" y1="72" x2="266" y2="48" stroke="#d4a017" stroke-width="1" stroke-dasharray="3,2" opacity=".7"/>
<text x="243" y="10" fill="#0d3a18" font-size="8" font-family="monospace">N</text>
<text x="304" y="75" fill="#0d3a18" font-size="8" font-family="monospace">E</text>
<text x="243" y="140" fill="#0d3a18" font-size="8" font-family="monospace">S</text>
<text x="166" y="75" fill="#0d3a18" font-size="8" font-family="monospace">W</text>`,

compass:`<rect width="480" height="145" fill="#040d1a"/>
<line x1="0" y1="30" x2="480" y2="30" stroke="#0a1e30" stroke-width="1" opacity=".4"/>
<line x1="0" y1="72" x2="480" y2="72" stroke="#0a1e30" stroke-width="1" opacity=".3"/>
<line x1="0" y1="116" x2="480" y2="116" stroke="#0a1e30" stroke-width="1" opacity=".4"/>
<line x1="120" y1="0" x2="120" y2="145" stroke="#0a1e30" stroke-width="1" opacity=".3"/>
<line x1="360" y1="0" x2="360" y2="145" stroke="#0a1e30" stroke-width="1" opacity=".3"/>
<circle cx="150" cy="72" r="54" fill="#050f1c"/>
<circle cx="150" cy="72" r="54" fill="none" stroke="#1a3a5f" stroke-width="2"/>
<circle cx="150" cy="72" r="42" fill="none" stroke="#0d2a48" stroke-width="1"/>
<circle cx="150" cy="72" r="28" fill="none" stroke="#0a1e38" stroke-width="1" opacity=".5"/>
<line x1="150" y1="18" x2="150" y2="26" stroke="#2e6bbf" stroke-width="2"/>
<line x1="150" y1="118" x2="150" y2="126" stroke="#2e6bbf" stroke-width="2"/>
<line x1="96" y1="72" x2="104" y2="72" stroke="#2e6bbf" stroke-width="2"/>
<line x1="196" y1="72" x2="204" y2="72" stroke="#2e6bbf" stroke-width="2"/>
<text x="145" y="14" fill="#6fa8dc" font-size="10" font-weight="bold" font-family="monospace">N</text>
<text x="145" y="136" fill="#2e6bbf" font-size="9" font-family="monospace">S</text>
<text x="82" y="76" fill="#2e6bbf" font-size="9" font-family="monospace">W</text>
<text x="210" y="76" fill="#2e6bbf" font-size="9" font-family="monospace">E</text>
<g class="compass-needle" style="transform-origin:150px 72px">
<polygon points="150,20 145,72 150,77 155,72" fill="#c93030"/>
<polygon points="150,124 145,72 150,67 155,72" fill="#e8e8e8"/>
</g>
<circle cx="150" cy="72" r="5" fill="#0d1f3c"/>
<circle cx="150" cy="72" r="3" fill="#2e6bbf"/>
<rect x="278" y="22" width="178" height="102" rx="4" fill="#050f1c"/>
<rect x="278" y="22" width="178" height="102" rx="4" fill="none" stroke="#0d2a48" stroke-width="1"/>
<rect x="286" y="30" width="162" height="56" rx="2" fill="#030c18"/>
<path d="M293 76 Q320 52 358 56 Q388 60 432 44" fill="none" stroke="#0d3060" stroke-width="1.5" opacity=".8"/>
<polygon points="360,56 357,64 363,64" fill="#6fa8dc" opacity=".8"/>
<line x1="360" y1="56" x2="418" y2="30" stroke="#d4a017" stroke-width="1" stroke-dasharray="3,2" opacity=".7"/>
<text x="286" y="96" fill="#2e6bbf" font-size="7" font-family="monospace">SPD: 14.2 kn</text>
<text x="286" y="107" fill="#2e6bbf" font-size="7" font-family="monospace">COG: 247°</text>
<text x="368" y="96" fill="#d4a017" font-size="7" font-family="monospace">ETA: 06:42</text>
<text x="368" y="107" fill="#5dbf8a" font-size="7" font-family="monospace">RNG: 38nm</text>`,

engine:`<rect width="480" height="145" fill="#040c10"/>
<rect x="60" y="33" width="100" height="82" rx="3" fill="#071828"/>
<rect x="60" y="33" width="100" height="8" rx="2" fill="#0d2840"/>
<rect x="68" y="18" width="12" height="16" rx="1" fill="#0a2030" class="epulse"/>
<rect x="84" y="18" width="12" height="16" rx="1" fill="#0a2030" class="epulse"/>
<rect x="100" y="18" width="12" height="16" rx="1" fill="#0a2030" class="epulse"/>
<rect x="116" y="18" width="12" height="16" rx="1" fill="#0a2030" class="epulse"/>
<rect x="132" y="18" width="12" height="16" rx="1" fill="#0a2030" class="epulse"/>
<rect x="220" y="26" width="200" height="92" rx="4" fill="#040e18"/>
<rect x="220" y="26" width="200" height="92" rx="4" fill="none" stroke="#0d2a40" stroke-width="1.5"/>
<rect x="228" y="34" width="184" height="50" rx="2" fill="#030a12"/>
<circle cx="250" cy="59" r="14" fill="#050f18"/><circle cx="250" cy="59" r="14" fill="none" stroke="#0d2840" stroke-width="1.5"/>
<line x1="250" y1="59" x2="250" y2="47" stroke="#5dbf8a" stroke-width="2" transform="rotate(20,250,59)"/>
<text x="242" y="78" fill="#5dbf8a" font-size="7" font-family="monospace">RPM</text>
<circle cx="292" cy="59" r="14" fill="#050f18"/><circle cx="292" cy="59" r="14" fill="none" stroke="#0d2840" stroke-width="1.5"/>
<line x1="292" y1="59" x2="292" y2="47" stroke="#d4a017" stroke-width="2" transform="rotate(-15,292,59)"/>
<text x="284" y="78" fill="#d4a017" font-size="7" font-family="monospace">TEMP</text>
<circle cx="334" cy="59" r="14" fill="#050f18"/><circle cx="334" cy="59" r="14" fill="none" stroke="#0d2840" stroke-width="1.5"/>
<line x1="334" y1="59" x2="334" y2="47" stroke="#6fa8dc" stroke-width="2" transform="rotate(5,334,59)"/>
<text x="327" y="78" fill="#6fa8dc" font-size="7" font-family="monospace">PRESS</text>
<circle cx="376" cy="59" r="14" fill="#050f18"/><circle cx="376" cy="59" r="14" fill="none" stroke="#0d2840" stroke-width="1.5"/>
<line x1="376" y1="59" x2="376" y2="47" stroke="#c97070" stroke-width="2" transform="rotate(30,376,59)"/>
<text x="369" y="78" fill="#c97070" font-size="7" font-family="monospace">EXH.T</text>
<circle cx="235" cy="100" r="4" fill="#5dbf8a"/>
<circle cx="248" cy="100" r="4" fill="#5dbf8a"/>
<circle cx="261" cy="100" r="4" fill="#d4a017" class="blink"/>
<circle cx="274" cy="100" r="4" fill="#5dbf8a"/>
<circle cx="287" cy="100" r="4" fill="#5dbf8a"/>
<text x="228" y="114" fill="#0d2840" font-size="7" font-family="monospace">ENG ROOM CONTROL</text>`,

engine_fault:`<rect width="480" height="145" fill="#0a0505"/>
<rect x="60" y="33" width="100" height="82" rx="3" fill="#150505"/>
<rect x="68" y="18" width="12" height="16" rx="1" fill="#1a0808"/>
<rect x="84" y="18" width="12" height="16" rx="1" fill="#1a0808"/>
<rect x="100" y="18" width="12" height="16" rx="1" fill="#1a0808"/>
<circle cx="90" cy="26" r="3" fill="#c93010" class="alarm"/>
<rect x="220" y="26" width="200" height="92" rx="4" fill="#0a0505"/>
<rect x="220" y="26" width="200" height="92" rx="4" fill="none" stroke="#3a1010" stroke-width="1.5"/>
<rect x="228" y="34" width="184" height="50" rx="2" fill="#080202"/>
<circle cx="250" cy="59" r="14" fill="#0a0505"/><circle cx="250" cy="59" r="14" fill="none" stroke="#3a1010" stroke-width="1.5"/>
<line x1="250" y1="59" x2="250" y2="47" stroke="#c97070" stroke-width="2" transform="rotate(-45,250,59)"/>
<text x="242" y="78" fill="#c97070" font-size="7" font-family="monospace">ALARM</text>
<circle cx="292" cy="59" r="14" fill="#0a0505"/><circle cx="292" cy="59" r="14" fill="none" stroke="#c93010" stroke-width="2" class="alarm"/>
<line x1="292" y1="59" x2="292" y2="47" stroke="#c93010" stroke-width="2" transform="rotate(55,292,59)"/>
<text x="280" y="78" fill="#c93010" font-size="7" font-family="monospace">OVERHEAT</text>
<circle cx="334" cy="59" r="14" fill="#0a0505"/><circle cx="334" cy="59" r="14" fill="none" stroke="#3a1010" stroke-width="1.5"/>
<line x1="334" y1="59" x2="334" y2="47" stroke="#c97070" stroke-width="2" transform="rotate(-30,334,59)"/>
<text x="327" y="78" fill="#c97070" font-size="7" font-family="monospace">LOW</text>
<circle cx="235" cy="100" r="4" fill="#c93010" class="alarm"/>
<circle cx="248" cy="100" r="4" fill="#c93010" class="alarm"/>
<circle cx="261" cy="100" r="4" fill="#c93010" class="alarm"/>
<circle cx="274" cy="100" r="4" fill="#3a1010"/>
<circle cx="287" cy="100" r="4" fill="#3a1010"/>
<text x="228" y="115" fill="#c93010" font-size="7" font-family="monospace" class="blink">!!! ENGINE FAULT !!!</text>
<ellipse cx="90" cy="14" rx="8" ry="5" fill="#c93010" opacity=".2" class="smoke"/>
<ellipse cx="90" cy="10" rx="6" ry="4" fill="#a02010" opacity=".15" class="smoke2"/>`,

pirate:`<rect width="480" height="145" fill="#030810"/>
<rect width="480" height="63" fill="#040b18"/>
<rect y="63" width="480" height="82" fill="#04111e"/>
<g class="wave-anim">
<path d="M0 73 Q30 67 60 73 Q90 79 120 73 Q150 67 180 73 Q210 79 240 73 Q270 67 300 73 Q330 79 360 73 Q390 67 420 73 Q450 79 480 73" fill="none" stroke="#0a2438" stroke-width="1.2" opacity=".6"/>
<path d="M0 90 Q40 84 80 90 Q120 96 160 90 Q200 84 240 90 Q280 96 320 90 Q360 84 400 90 Q440 96 480 90" fill="none" stroke="#081e30" stroke-width="1" opacity=".5"/>
</g>
<rect x="140" y="48" width="130" height="18" rx="3" fill="#0d2040"/>
<rect x="200" y="36" width="32" height="14" rx="2" fill="#0a1830"/>
<line x1="216" y1="26" x2="216" y2="36" stroke="#0a1828" stroke-width="1.5"/>
<circle cx="80" cy="19" r="1" fill="#fff" opacity=".6"/>
<circle cx="300" cy="7" r="1" fill="#fff" opacity=".5"/>
<circle cx="420" cy="17" r="1" fill="#fff" opacity=".6"/>
<g class="speedboat"><rect x="30" y="60" width="55" height="8" rx="3" fill="#1a0808"/><rect x="50" y="54" width="20" height="8" rx="1" fill="#110505"/><text x="50" y="53" fill="#c93010" font-size="9" opacity=".8">☠</text></g>
<g class="speedboat" style="animation-delay:.8s"><rect x="30" y="74" width="48" height="7" rx="3" fill="#1a0808"/><rect x="46" y="68" width="18" height="7" rx="1" fill="#110505"/><text x="46" y="66" fill="#c93010" font-size="8" opacity=".7">☠</text></g>
<line x1="420" y1="60" x2="420" y2="10" stroke="#d4a017" stroke-width="2" opacity=".2" class="searchlight" style="transform-origin:420px 60px"/>
<text x="145" y="116" fill="#c93010" font-size="8" font-family="monospace" class="blink">TÜYSÜZ TEHDİT — SAHİL GÜVENLIK ARANIYOR</text>
<rect x="10" y="90" width="88" height="46" rx="2" fill="#040e18"/>
<rect x="10" y="90" width="88" height="46" rx="2" fill="none" stroke="#0d2030" stroke-width="1"/>
<text x="15" y="102" fill="#c93010" font-size="7" font-family="monospace">VHF CH16</text>
<text x="15" y="112" fill="#5dbf8a" font-size="7" font-family="monospace">MAYDAY x3</text>
<text x="15" y="122" fill="#d4a017" font-size="7" font-family="monospace">SAR: ETD 2H</text>
<text x="15" y="132" fill="#6fa8dc" font-size="7" font-family="monospace">SPEED: FULL</text>`,

bogaz:`<rect width="480" height="145" fill="#04111f"/>
<rect width="480" height="68" fill="#060f1e"/>
<rect y="68" width="480" height="77" fill="#061828"/>
<path d="M0 68 Q60 53 120 68 Q180 83 240 68 Q300 53 360 68 Q420 83 480 68" fill="none" stroke="#0d3060" stroke-width="1.2" opacity=".6"/>
<path d="M0 82 Q50 76 100 82 Q150 88 200 82 Q250 76 300 82 Q350 88 400 82 Q440 88 480 82" fill="none" stroke="#0a2440" stroke-width="1" opacity=".5"/>
<path d="M0 68 Q20 38 0 0" fill="#030d1a" stroke="#1a3a5f" stroke-width="2"/>
<path d="M480 68 Q460 38 480 0" fill="#030d1a" stroke="#1a3a5f" stroke-width="2"/>
<rect x="10" y="18" width="40" height="50" fill="#040d1a"/>
<rect x="60" y="28" width="30" height="40" fill="#040d1a"/>
<rect x="100" y="13" width="20" height="55" fill="#040d1a"/>
<rect x="390" y="23" width="35" height="45" fill="#040d1a"/>
<rect x="428" y="8" width="25" height="60" fill="#040d1a"/>
<circle cx="50" cy="16" r="3" fill="#d4a017" opacity=".7" class="blink"/>
<circle cx="110" cy="10" r="3" fill="#c93030" opacity=".7"/>
<circle cx="395" cy="20" r="3" fill="#d4a017" opacity=".7" class="blink"/>
<g class="drift" style="transform-origin:240px 66px">
<rect x="190" y="55" width="100" height="14" rx="3" fill="#0d2040"/>
<rect x="240" y="44" width="24" height="13" rx="2" fill="#0a1830"/>
<line x1="252" y1="34" x2="252" y2="44" stroke="#0a1828" stroke-width="1.5"/>
</g>
<g class="current"><text x="20" y="106" fill="#1a4a7f" font-size="14" opacity=".3">→→→→→→→→→→→→→→→→→→→→→→→→→→→→</text></g>
<text x="150" y="128" fill="#d4a017" font-size="8" font-family="monospace" class="blink">⚓ DEMİR ATILDI — BOĞAZ AKINTISI</text>
<rect x="355" y="82" width="116" height="54" rx="3" fill="#040d18"/>
<rect x="355" y="82" width="116" height="54" rx="3" fill="none" stroke="#0d2030" stroke-width="1"/>
<text x="363" y="95" fill="#c93010" font-size="7" font-family="monospace">⚠ SÜRÜKLENME</text>
<text x="363" y="106" fill="#d4a017" font-size="7" font-family="monospace">COG: 087° ⚡</text>
<text x="363" y="117" fill="#c97070" font-size="7" font-family="monospace">SOG: 0.8 kn</text>
<text x="363" y="128" fill="#5dbf8a" font-size="7" font-family="monospace">DEMİR: DÜŞÜK</text>`,

fire:`<rect width="480" height="145" fill="#040c10"/>
<line x1="0" y1="38" x2="480" y2="38" stroke="#0a1820" stroke-width="3"/>
<line x1="0" y1="98" x2="480" y2="98" stroke="#0a1820" stroke-width="3"/>
<rect x="40" y="0" width="8" height="145" fill="#081420"/>
<rect x="200" y="0" width="8" height="145" fill="#081420"/>
<rect x="380" y="0" width="8" height="145" fill="#081420"/>
<ellipse cx="240" cy="88" rx="35" ry="14" fill="#c93010" opacity=".3"/>
<ellipse cx="240" cy="80" rx="25" ry="11" fill="#d84010" opacity=".4"/>
<ellipse cx="240" cy="70" rx="18" ry="9" fill="#e06020" opacity=".5"/>
<path d="M225 93 Q230 70 240 53 Q245 70 255 56 Q255 76 265 93 Z" fill="#d84010" opacity=".6"/>
<path d="M230 93 Q235 72 242 58 Q248 72 258 93 Z" fill="#e86820" opacity=".5"/>
<path d="M232 93 Q238 74 243 63 Q247 74 252 93 Z" fill="#f09030" opacity=".4"/>
<ellipse cx="240" cy="43" rx="20" ry="11" fill="#0a1010" opacity=".7" class="smoke"/>
<ellipse cx="232" cy="28" rx="16" ry="9" fill="#080e0e" opacity=".6" class="smoke2"/>
<ellipse cx="238" cy="14" rx="14" ry="7" fill="#060c0c" opacity=".5" class="smoke3"/>
<rect x="80" y="66" width="20" height="42" rx="4" fill="#c93010" opacity=".8"/>
<rect x="83" y="60" width="14" height="8" rx="2" fill="#a02010"/>
<polygon points="360,48 340,86 380,86" fill="#d4a017" opacity=".8"/>
<text x="352" y="78" fill="#030810" font-size="14" font-weight="bold">!</text>
<circle cx="420" cy="27" r="10" fill="#c93010" opacity=".6" class="alarm"/>
<text x="20" y="128" fill="#c93010" font-size="8" font-family="monospace" class="blink">YANGIN ALARM — A GÜVERTESİ</text>`,

galley:`<rect width="480" height="145" fill="#050d0a"/>
<rect x="0" y="92" width="480" height="53" fill="#061410"/>
<rect x="0" y="90" width="480" height="4" fill="#0a1e18"/>
<rect x="30" y="70" width="120" height="26" rx="3" fill="#040d08"/>
<rect x="30" y="70" width="120" height="26" rx="3" fill="none" stroke="#0d2018" stroke-width="1.5"/>
<circle cx="60" cy="81" r="10" fill="#050f0a"/><circle cx="60" cy="81" r="10" fill="none" stroke="#0d2018" stroke-width="1"/>
<circle cx="100" cy="81" r="10" fill="#050f0a"/><circle cx="100" cy="81" r="10" fill="none" stroke="#0d2018" stroke-width="1"/>
<circle cx="100" cy="81" r="6" fill="#c9952a" opacity=".4"/>
<circle cx="140" cy="81" r="10" fill="#050f0a"/><circle cx="140" cy="81" r="10" fill="none" stroke="#0d2018" stroke-width="1"/>
<ellipse cx="100" cy="67" rx="18" ry="5" fill="#070f0c"/>
<rect x="82" y="61" width="36" height="7" rx="2" fill="#061210"/>
<path d="M96 61 Q100 55 104 61" fill="none" stroke="#0d2018" stroke-width="1.5"/>
<path d="M94 57 Q92 47 96 39" fill="none" stroke="#2a4a38" stroke-width="1" opacity=".4" class="smoke"/>
<path d="M100 55 Q98 45 102 37" fill="none" stroke="#2a4a38" stroke-width="1" opacity=".3" class="smoke2"/>
<rect x="190" y="18" width="250" height="5" rx="1" fill="#0a1e18"/>
<rect x="190" y="54" width="250" height="4" rx="1" fill="#0a1e18"/>
<rect x="320" y="8" width="130" height="68" rx="3" fill="#040e0a"/>
<rect x="320" y="8" width="130" height="68" rx="3" fill="none" stroke="#0d2018" stroke-width="1.5"/>
<text x="330" y="22" fill="#5dbf8a" font-size="8" font-family="monospace">BUGÜNKÜ MENÜ</text>
<text x="330" y="36" fill="#2e6bbf" font-size="7" font-family="monospace">Öğle: Levrek buğulama</text>
<text x="330" y="47" fill="#2e6bbf" font-size="7" font-family="monospace">Çorba: Mercimek</text>
<text x="330" y="57" fill="#2e6bbf" font-size="7" font-family="monospace">Tatlı: Sütlaç</text>
<text x="330" y="68" fill="#d4a017" font-size="6" font-family="monospace">Mür. sayısı: 22</text>`,

cabin:`<rect width="480" height="145" fill="#03090f"/>
<circle cx="390" cy="58" r="40" fill="#03090f"/>
<circle cx="390" cy="58" r="40" fill="none" stroke="#0d2a3a" stroke-width="6"/>
<circle cx="390" cy="58" r="34" fill="#030d1a"/>
<path d="M357 70 Q374 62 391 70 Q408 78 425 70" fill="none" stroke="#0d3060" stroke-width="1.5" opacity=".7"/>
<path d="M357 78 Q374 70 391 78 Q408 86 425 78" fill="none" stroke="#0a2440" stroke-width="1" opacity=".5"/>
<circle cx="400" cy="38" r="1" fill="#fff" opacity=".6"/>
<circle cx="376" cy="32" r="1" fill="#fff" opacity=".5"/>
<circle cx="390" cy="18" r="3" fill="#0d2a3a"/>
<circle cx="390" cy="98" r="3" fill="#0d2a3a"/>
<circle cx="350" cy="58" r="3" fill="#0d2a3a"/>
<circle cx="430" cy="58" r="3" fill="#0d2a3a"/>
<rect x="20" y="80" width="300" height="48" rx="2" fill="#050e18"/>
<rect x="20" y="78" width="300" height="5" rx="1" fill="#0a1e30"/>
<rect x="30" y="58" width="65" height="44" rx="2" fill="#06152a"/>
<rect x="30" y="58" width="65" height="44" rx="2" fill="none" stroke="#0d2840" stroke-width="1"/>
<text x="36" y="72" fill="#2e6bbf" font-size="7" font-family="monospace">NÖBET GÜNLÜĞÜ</text>
<line x1="35" y1="77" x2="88" y2="77" stroke="#0d2040" stroke-width=".8"/>
<text x="36" y="86" fill="#1a3a5f" font-size="6" font-family="monospace">02:14 — HEDEF</text>
<text x="36" y="95" fill="#1a3a5f" font-size="6" font-family="monospace">CPA: 1.2 nm ✓</text>
<circle cx="308" cy="53" r="18" fill="#040e18"/>
<circle cx="308" cy="53" r="18" fill="none" stroke="#0d2840" stroke-width="1.5"/>
<line x1="308" y1="36" x2="308" y2="45" stroke="#2e6bbf" stroke-width="2"/>
<line x1="308" y1="53" x2="318" y2="53" stroke="#6fa8dc" stroke-width="1.5"/>
<circle cx="308" cy="53" r="2" fill="#2e6bbf"/>
<text x="300" y="73" fill="#0d2840" font-size="6" font-family="monospace">02:14</text>`,

bridge:`<rect width="480" height="145" fill="#030a14"/>
<rect x="15" y="8" width="450" height="64" rx="3" fill="#040e1a"/>
<rect x="15" y="8" width="450" height="64" rx="3" fill="none" stroke="#0d2030" stroke-width="1.5"/>
<line x1="105" y1="8" x2="105" y2="72" stroke="#0d2030" stroke-width="2"/>
<line x1="195" y1="8" x2="195" y2="72" stroke="#0d2030" stroke-width="2"/>
<line x1="285" y1="8" x2="285" y2="72" stroke="#0d2030" stroke-width="2"/>
<line x1="375" y1="8" x2="375" y2="72" stroke="#0d2030" stroke-width="2"/>
<rect x="16" y="9" width="88" height="62" fill="#040d18"/>
<path d="M16 48 Q30 42 44 48 Q58 54 72 48 Q86 42 104 48" fill="none" stroke="#0a2840" stroke-width="1" opacity=".5"/>
<rect x="106" y="9" width="88" height="62" fill="#040d18"/>
<rect x="196" y="9" width="88" height="62" fill="#040d18"/>
<ellipse cx="240" cy="50" rx="35" ry="8" fill="#1a4a7f" opacity=".15"/>
<rect x="286" y="9" width="88" height="62" fill="#040d18"/>
<rect x="376" y="9" width="88" height="62" fill="#040d18"/>
<rect x="220" y="40" width="40" height="8" rx="1" fill="#040d18"/>
<rect x="246" y="34" width="10" height="8" rx="1" fill="#040d18"/>
<rect x="80" y="87" width="320" height="48" rx="4" fill="#040e18"/>
<rect x="80" y="87" width="320" height="48" rx="4" fill="none" stroke="#0d2030" stroke-width="1.5"/>
<circle cx="240" cy="108" r="18" fill="#030a12"/>
<circle cx="240" cy="108" r="18" fill="none" stroke="#0d2030" stroke-width="2"/>
<line x1="240" y1="90" x2="240" y2="126" stroke="#0d2030" stroke-width="1.5"/>
<line x1="220" y1="100" x2="260" y2="116" stroke="#0d2030" stroke-width="1.5"/>
<line x1="220" y1="116" x2="260" y2="100" stroke="#0d2030" stroke-width="1.5"/>
<circle cx="240" cy="108" r="4" fill="#0d2030"/>
<rect x="308" y="94" width="80" height="32" rx="2" fill="#030a12"/>
<text x="316" y="106" fill="#5dbf8a" font-size="6" font-family="monospace">AUTO PILOT</text>
<text x="316" y="116" fill="#5dbf8a" font-size="7" font-family="monospace" font-weight="bold">HDG 247°</text>
<circle cx="372" cy="118" r="5" fill="#5dbf8a" opacity=".8"/>`,

cargo:`<rect width="480" height="145" fill="#040c14"/>
<rect x="20" y="8" width="440" height="128" rx="4" fill="#050e18"/>
<rect x="20" y="8" width="440" height="128" rx="4" fill="none" stroke="#0d2030" stroke-width="1.5"/>
<rect x="28" y="76" width="46" height="21" rx="2" fill="#1a3a6b" opacity=".85"/>
<rect x="76" y="76" width="46" height="21" rx="2" fill="#2a5a30" opacity=".85"/>
<rect x="124" y="76" width="46" height="21" rx="2" fill="#5a1a1a" opacity=".85"/>
<rect x="172" y="76" width="46" height="21" rx="2" fill="#1a4a4a" opacity=".85"/>
<rect x="220" y="76" width="46" height="21" rx="2" fill="#3a2a4a" opacity=".85"/>
<rect x="268" y="76" width="46" height="21" rx="2" fill="#2a5a30" opacity=".85"/>
<rect x="316" y="76" width="46" height="21" rx="2" fill="#1a3a6b" opacity=".85"/>
<rect x="28" y="54" width="46" height="21" rx="2" fill="#2a5a30" opacity=".85"/>
<rect x="76" y="54" width="46" height="21" rx="2" fill="#5a1a1a" opacity=".85"/>
<rect x="124" y="54" width="46" height="21" rx="2" fill="#1a3a6b" opacity=".85"/>
<rect x="172" y="54" width="46" height="21" rx="2" fill="#2a5a30" opacity=".85"/>
<rect x="220" y="54" width="46" height="21" rx="2" fill="#5a1a1a" opacity=".85"/>
<rect x="268" y="54" width="46" height="21" rx="2" fill="#3a2a4a" opacity=".85"/>
<rect x="28" y="32" width="46" height="21" rx="2" fill="#5a1a1a" opacity=".85"/>
<rect x="76" y="32" width="46" height="21" rx="2" fill="#1a3a6b" opacity=".85"/>
<rect x="124" y="32" width="46" height="21" rx="2" fill="#2a5a30" opacity=".85"/>
<rect x="15" y="4" width="450" height="6" rx="2" fill="#0a1828"/>
<rect x="193" y="2" width="20" height="12" rx="2" fill="#0d2040" class="cargo-swing"/>
<line x1="203" y1="14" x2="203" y2="44" stroke="#1a3060" stroke-width="1.5" stroke-dasharray="3,2" class="cargo-swing"/>
<rect x="388" y="12" width="58" height="74" rx="3" fill="#08182a"/>
<text x="394" y="24" fill="#2e6bbf" font-size="7" font-family="monospace">MANIFEST</text>
<text x="394" y="36" fill="#5dbf8a" font-size="6" font-family="monospace">✓ TCKU 1234</text>
<text x="394" y="47" fill="#5dbf8a" font-size="6" font-family="monospace">✓ MSCU 5678</text>
<text x="394" y="58" fill="#c97070" font-size="6" font-family="monospace">✗ HLXU 9012</text>
<text x="394" y="69" fill="#5dbf8a" font-size="6" font-family="monospace">✓ GESU 3456</text>
<text x="394" y="80" fill="#d4a017" font-size="6" font-family="monospace">? CMAU 7890</text>`,

port_arrival:`<rect width="480" height="145" fill="#04111f"/>
<rect width="480" height="70" fill="#040f1e"/>
<ellipse cx="240" cy="72" rx="200" ry="28" fill="#c9952a" opacity=".12"/>
<circle cx="240" cy="68" r="12" fill="#c9952a" opacity=".7"/>
<circle cx="240" cy="68" r="20" fill="none" stroke="#c9952a" stroke-width="1" opacity=".3"/>
<rect x="20" y="36" width="15" height="34" fill="#040c18"/>
<rect x="38" y="46" width="20" height="24" fill="#040c18"/>
<rect x="62" y="28" width="12" height="42" fill="#040c18"/>
<rect x="77" y="40" width="18" height="30" fill="#040c18"/>
<rect x="98" y="33" width="22" height="37" fill="#040c18"/>
<rect x="378" y="18" width="12" height="52" rx="2" fill="#0a1e30"/>
<polygon points="372,18 390,18 384,6" fill="#0a1e30"/>
<circle cx="384" cy="12" r="5" fill="#d4a017" opacity=".8" class="blink"/>
<rect y="70" width="480" height="75" fill="#061828"/>
<g class="wave-anim">
<path d="M0 80 Q60 76 120 80 Q180 84 240 80 Q300 76 360 80 Q420 84 480 80" fill="none" stroke="#0d3060" stroke-width="1.2" opacity=".5"/>
<path d="M0 96 Q70 92 140 96 Q210 100 280 96 Q350 92 420 96 Q450 100 480 96" fill="none" stroke="#0a2448" stroke-width="1" opacity=".4"/>
</g>
<rect x="185" y="54" width="110" height="18" rx="3" fill="#0a1e30"/>
<rect x="245" y="42" width="30" height="14" rx="2" fill="#081828"/>
<line x1="260" y1="32" x2="260" y2="42" stroke="#0a1828" stroke-width="1.5"/>
<line x1="418" y1="70" x2="418" y2="18" stroke="#0a1828" stroke-width="3"/>
<line x1="393" y1="23" x2="448" y2="23" stroke="#0a1828" stroke-width="2"/>
<line x1="433" y1="23" x2="433" y2="53" stroke="#0a1828" stroke-width="1" stroke-dasharray="3,2"/>`,

sunrise:`<rect width="480" height="145" fill="#040e1c"/>
<rect y="53" width="480" height="92" fill="#061828"/>
<ellipse cx="240" cy="73" rx="220" ry="38" fill="#c9401a" opacity=".15"/>
<ellipse cx="240" cy="73" rx="160" ry="23" fill="#c9601a" opacity=".12"/>
<ellipse cx="240" cy="73" rx="100" ry="13" fill="#c9802a" opacity=".12"/>
<path d="M200 73 A40 40 0 0 1 280 73" fill="#c9952a" opacity=".8"/>
<circle cx="240" cy="73" r="40" fill="none" stroke="#c9952a" stroke-width="1" opacity=".2"/>
<line x1="0" y1="73" x2="480" y2="73" stroke="#c9501a" stroke-width="1" opacity=".3"/>
<rect y="73" width="480" height="72" fill="#04111e"/>
<ellipse cx="240" cy="102" rx="25" ry="4" fill="#c9952a" opacity=".2"/>
<g class="wave-anim">
<path d="M0 83 Q60 79 120 83 Q180 87 240 83 Q300 79 360 83 Q420 87 480 83" fill="none" stroke="#0d3060" stroke-width="1" opacity=".5"/>
<path d="M0 98 Q70 94 140 98 Q210 102 280 98 Q350 94 420 98 Q455 102 480 98" fill="none" stroke="#0a2440" stroke-width="1" opacity=".4"/>
</g>
<rect x="30" y="63" width="70" height="10" rx="2" fill="#030b18"/>
<rect x="75" y="56" width="18" height="8" rx="1" fill="#030b18"/>
<line x1="84" y1="46" x2="84" y2="56" stroke="#040d1c" stroke-width="1"/>`,
};

// ===== KRİZ SONLARI =====
const CRISIS_ENDS={
  cesaret_0:{emoji:"🫀",title:"Korku Seni Yendi",text:n=>`Cesaret puanı sıfıra düştü.\n\n${n} her kritik anda geri adım atmıştı. Fırtınada, krizlerde, zor anlarda hep çekilmişti.\n\nSon straw: Lostromo acil göreve çağırdı. ${n} yeniden çekildi.\n\n1. Zabiti: "Bu iş herkes için değil. Utanma — ama bu gemi için de değilsin."\n\nStaj belgesi "yetersiz" damgasıyla kapandı.`,stat:"CESARET 0 → Korku birikmesi — ihraç"},
  cesaret_100:{emoji:"💀",title:"Cesaret Seni Öldürdü",text:(n,sn)=>`${n} her tehlikeli işte ilk kalktı.\n\nFırtınada güverte kapatılmıştı. "Hemen hallederim" dedi.\n\nEmniyet halatı yetmedi. Dalga güverteyi süpürdü.\n\n${sn} anma plaketine bir isim daha kazındı.`,stat:"CESARET 100 → Kontrolsüz risk — ölüm"},
  bilgi_0:{emoji:"⚠️",title:"Bilgisizlik Gemiyi Tehlikeye Attı",text:n=>`Bilgi puanı sıfıra düştü.\n\n${n} not tutmamıştı. Prosedürleri bilmiyordu.\n\nGece nöbetinde radar alarmı çaldı. CPA: 0.4 mil.\n\nNe yapacağını bilmiyordu. Bekledi.\n\n800 tonluk kargo gemisi 60 metre önünden geçti.\n\nSüvari tutanağa yazdı:\n"Stajyer tehlikeli derecede yetersiz."\n\nStaj belgesi "yetersiz" ile kapandı.`,stat:"BİLGİ 0 → Bilgi bitti — ihraç"},
  bilgi_100:{emoji:"📚",title:"Kitap Adamı, Gemi Değil",text:n=>`${n} her soruya cevap verdi — teoride.\n\nAma halatı hiç tutmadı. Liman yaklaşmasında paralize oldu.\n\nRapor: "Akademik zeka yüksek. Operasyonel yetkinlik sıfır."`,stat:"BİLGİ 100 → Teori-pratik uçurumu"},
  sayginlik_0:{emoji:"👁️",title:"Mürettebat Seni Terk Etti",text:n=>`Saygınlık puanı sıfıra düştü.\n\nKimse ${n}'ye bakmıyordu artık. Yemekhanede tek oturdu. Lostromo görev listesinden adını sildi. Tayfalar konuşmayı kesti.\n\nSüvari 20. günde çağırdı:\n"Gemide takım ruhu şart. Bu ekiple çalışamazsınız."\n\nLimana yanaşırken kimseler el sallamadı. Kimse üzülmedi.`,stat:"SAYGINLIK 0 → Güven bitti — ihraç"},
  sayginlik_100:{emoji:"👑",title:"Herkesin Favorisi — Ama Mahvoldu",text:n=>`Herkes ${n}'yi sevdi. Kimseye hayır diyemedi.\n\nGün 25'e DİNÇLİK 5'e düşmüştü. Son nöbette köprüde uyuyakaldı.\n\nSüvari: "Bu çocuğu çok sevdik — mahvettik de."`,stat:"SAYGINLIK 100 → Aşırı talep — tükenme"},
  dinclik_dusuk:{emoji:"⚰️",title:"Yorgunluk Seni Mahvetti",text:n=>`Dinçlik puanı sıfıra düştü.\n\n${n} dinlenmemişti. Her nöbeti almış, hiç hayır dememişti.\n\nUyku 3 saate düştü. Yemekler atlandı. Gözler yanıyordu.\n\nSon nöbet: Köprüde tek başına. Saat 02:14.\n\nGözler kapandı.\n\nGemi 11 mil saparak Yunan karasularına girdi.\n\nSahil güvenlik müdahale etti. Tutanak:\n"Yorgunluk kaynaklı nöbet ihmali — stajyer görevden uzaklaştırıldı."`,stat:"DİNÇLİK 0 → Tükenmişlik — kaza"},
};

// ===== 60 SENARYO HAVUZU =====
function buildScenePool(n,sn,yr,stype){
  const era=ERA_TECH[yr]||ERA_TECH[2018];
  const st=STYPES.find(x=>x.key===stype)||STYPES[0];

  // Sahneler: her biri bağımsız, next kullanılmayacak (rastgele sıra sistemi)
  // next:null → sistem sonrakini kendisi seçecek
  // next:'end' → oyun biter
  // alert:true → ACİL banner + ses efekti

  return [
// ---- GÜN 1 SAHNELERİ ----
{id:"s01",gfx:"harbor",alert:false,day:"Gün 1",time:"05:30",loc:"İzmir Limanı — İskele",sub:`Sabah sisi — ${yr}`,who:"anlatici",
text:`İzmir Limanı, ${yr} yılı, sabah erken.\n\nÇantan sırtında, staj belgelerin avucunda iskeleye geldin. Önünde ${sn} — ${st.ton} ${st.nm} gemisi.\n\nRampadan biri indi:\n"Sen stajyer ${n} misin? 1. Zabiti köprüde bekliyor."`,
choices:[
{text:"Düzgünce selamlayıp kendini tanıt",tag:"akilli",effect:{sayginlik:5,bilgi:3}},
{text:"Heyecanla 'Evet!' deyip içeri gir",tag:"cesur",effect:{cesaret:5,sayginlik:-2}},
{text:"Sessizce başını salla, takip et",tag:"itaatkar",effect:{sayginlik:3}}]},

{id:"s02",gfx:"bridge",alert:false,day:"Gün 1",time:"06:10",loc:"Köprüüstü",sub:"1. Zabiti belgelerini inceliyor",who:"z1",
text:`"${n}. Tamam."\n\n1. Zabiti Ahmet Bey:\n\n"Burada üç kural var. Bir: Zamanında hazır ol. İki: Bilmediğini söyle — adam ölür. Üç: Lostromo ne derse yap.\n\n${era}"`,
choices:[
{text:"'Anlaşıldı efendim' — net ve sakin",tag:"itaatkar",effect:{sayginlik:6,bilgi:3}},
{text:"ISM ve STCW bilgini ortaya koy",tag:"cesur",effect:{bilgi:5,sayginlik:-5}},
{text:"Not defteri çıkarıp kuralları yaz",tag:"akilli",effect:{bilgi:8,sayginlik:5}}]},

{id:"s03",gfx:"harbor",alert:false,day:"Gün 1",time:"07:00",loc:"Ana Güverte — Pruva",sub:"Lostromo güverteyi tanıtıyor",who:"lostromo",
text:`Lostromo İbrahim Usta. Elleri nasırlı, gözleri keskin.\n\n"Gel ${n}." Pruvanın ucuna götürdü.\n\n"Şu halat — 52 mm çelik. Koptuğunda kırbaç gibi döner, kolu koparır. Yanlış bağlarsan ${sn} kayar.\n\nBu gemi konuşmaz. Önce dinleyeceksin."`,
choices:[
{text:"Dikkatle izle, sonra kendin dene",tag:"akilli",effect:{bilgi:12,sayginlik:8}},
{text:"'Okulda gördüm zaten' de",tag:"cesur",effect:{sayginlik:-8,cesaret:3}},
{text:"Her detayı not defterine yaz",tag:"akilli",effect:{bilgi:15,dinclik:-5}}]},

{id:"s04",gfx:"harbor",alert:false,day:"Gün 1",time:"08:00",loc:"Ana Güverte",sub:"Silici güverteyi temizliyor",who:"silici",
text:`Silici Ramazan Usta elinde fırça.\n\n"14 yıldır bu gemide siliciyim. Herkes beni görmez — ama güverte pis olunca herkes arar. Kaygan güverte, düşen tayfa demek."`,
choices:[
{text:"'Haklısınız usta, öğrenirim' de",tag:"itaatkar",effect:{sayginlik:5,bilgi:3}},
{text:"Sevinçle konuş, deneyimlerini sor",tag:"sosyal",effect:{sayginlik:7,bilgi:5}},
{text:"'Bu benim işim değil' diye düşün",tag:"korkak",effect:{sayginlik:-3}}]},

{id:"s05",gfx:"harbor",alert:false,day:"Gün 1",time:"09:30",loc:"Kıç Güverte",sub:"Palamar ekipmanı eğitimi",who:"lostromo",
text:`"Radyo kesilirse el işaretleri var. Dur, çek, bırak, yavaş — bunları bilmeden işin yok.\n\nŞimdi Hasan'a bak. Sen de ver aynı işareti."`,
choices:[
{text:"Dikkatle izle, işareti doğru tekrarla",tag:"akilli",effect:{bilgi:10,sayginlik:8}},
{text:"Hasan'a yürü, doğrudan sor",tag:"cesur",effect:{bilgi:8,sayginlik:7,cesaret:5}},
{text:"İzle ama katılma",tag:"korkak",effect:{cesaret:-5,sayginlik:-3}}]},

{id:"s06",gfx:"compass",alert:false,day:"Gün 1",time:"14:00",loc:"Köprüüstü",sub:"Navigasyon eğitimi",who:"z2",
text:yr<=1990
  ?`2. Zabiti:\n\n"${n}, ${yr}'de GPS yok. Sextant ile seyir yapıyoruz. Güneşi gözle, sextantı konumla."`
  :`2. Zabiti ECDIS'te:\n\n"${n}, elektronik harita, AIS, VDR — hepsi çalışıyor. Ama siber saldırı riski artıyor. ${era}"`,
choices:[
{text:yr<=1990?"Dikkatle öğren, gözlemi dene":"'GPS bozulunca kâğıt harita açarım' de",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Bilmiyorum, öğretir misiniz?' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:3}},
{text:yr<=1990?"'Radar kullanamaz mıyız?' de":"'Bu olmaz' de",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"s07",gfx:"galley",alert:false,day:"Gün 1",time:"19:30",loc:"Yemekhane",sub:"İlk akşam yemeği",who:"asci",
text:`"Oturun!" Mehmet Usta tombul, bıyıklı ve neşeli.\n\n"Bu gece levrek buğulama. Denizde karnın tok olmazsa beyin çalışmaz."\n\nMusa sana baktı: "${n}, ilk gün nasıldı?"`,
choices:[
{text:"Gülerek anlat, Musa ile kaynaş",tag:"sosyal",effect:{sayginlik:10,dinclik:5}},
{text:"Kısa cevap ver, erken uyu",tag:"itaatkar",effect:{dinclik:12}},
{text:"Lostromo'ya dön, denizcilik hikayeleri sor",tag:"akilli",effect:{bilgi:8,sayginlik:7}}]},

{id:"s08",gfx:"cabin",alert:false,day:"Gün 1",time:"22:00",loc:"Stajyer Kabini",sub:`${yr} — ilk gece, gemi homurtusu`,who:"anlatici",
text:`Kabin küçük. Gemi homurdanıyor. Motor titreşimi ayaklarından geliyor.\n\nYarın 05:45'te güvertede hazır olman gerekiyor.\n\n${era}`,
choices:[
{text:"Hemen uyu — dinç olmak şart",tag:"itaatkar",effect:{dinclik:15}},
{text:"Not defterini aç, öğrendiklerini yaz",tag:"akilli",effect:{bilgi:8,dinclik:-5}},
{text:"Pencereden denize bak, düşün — geç uyu",tag:"sosyal",effect:{dinclik:-3}}]},

// ---- RUTIN GÜN SAHNELERİ ----
{id:"s09",gfx:"harbor",alert:false,day:"Gün 2",time:"05:45",loc:"Ana Güverte — Sabah Turu",sub:"Güverte sabah kontrol turu",who:"lostromo",
text:`"Her sabah aynı. Güverte kontrol edilir. Bağlantılar, halatlar, ekipman kapakları, ışıklar.\n\nBu gemide liste dışı iş yapılmaz."\n\nSana kontrol listesi uzattı: "Sancak tarafını sen kontrol edeceksin."`,
choices:[
{text:"Listeyi alıp dikkatle her maddeyi kontrol et",tag:"akilli",effect:{bilgi:10,sayginlik:8}},
{text:"Hızlıca bak, 'tamam' deyip geri gel",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}},
{text:"Sorular sorarak kontrol et",tag:"akilli",effect:{bilgi:12,sayginlik:7,dinclik:-3}}]},

{id:"s10",gfx:"engine",alert:false,day:"Gün 2",time:"09:00",loc:"Makine Dairesi",sub:"Yağcı yağ kontrolleri yapıyor",who:"yagci",
text:`Yağcı Mehmet Ali elinde numune şişesi.\n\n"Bu ana makine yağı. Her 250 saatte bir alırız. Rengi, viskozitesi, metal parçacıkları — makine sağlığını söyler.\n\nYağlama olmadan motor 20 dakikada tutuşur."`,
choices:[
{text:"İlgiyle sor, numune analizi öğren",tag:"akilli",effect:{bilgi:10,sayginlik:5}},
{text:"'İlginç ama güverte bölümüm' de",tag:"itaatkar",effect:{sayginlik:2}},
{text:"Makine dairesini gezdirin de",tag:"sosyal",effect:{bilgi:8,sayginlik:8,dinclik:-3}}]},

{id:"s11",gfx:"engine",alert:false,day:"Gün 2",time:"10:30",loc:"Makine Kontrol Odası",sub:"2. Başmakinist sistem kontrolü",who:"bas2",
text:`2. Başmakinist Serdar Bey:\n\n"Jeneratör 1 yükte, jeneratör 2 beklemede. Bir jeneratör devre dışı kalırsa ne olur?"`,
choices:[
{text:"'Diğer devreye girer, yük dağılımı değişir' de",tag:"akilli",effect:{bilgi:12,sayginlik:8}},
{text:"'Bilmiyorum efendim' — dürüst ol",tag:"itaatkar",effect:{bilgi:5,sayginlik:3}},
{text:"'Güverte stajyeriyim' deyip çekilmeye çalış",tag:"korkak",effect:{sayginlik:-5}}]},

{id:"s12",gfx:"harbor",alert:false,day:"Gün 2",time:"14:00",loc:"Kıç Güverte",sub:"Liman çıkış prosedürü",who:"lostromo",
text:`"${n}, bugün palamar operasyonunu izleyeceksin. Sadece izle, dokunma."\n\nSüvari radyoyla: "Tüm istasyonlar, liman çıkış prosedürü başlıyor."\n\nRadyo: "Kıç! Hazır mısınız?"`,
choices:[
{text:"Lostromo'nun işaret vermesini bekle",tag:"itaatkar",effect:{sayginlik:5,bilgi:5}},
{text:"Lostromo onay verince 'Kıç hazır!' de",tag:"cesur",effect:{cesaret:8,sayginlik:5,bilgi:5}},
{text:"Her detayı kaydet",tag:"akilli",effect:{bilgi:10,sayginlik:3}}]},

{id:"s13",gfx:"sea",alert:false,day:"Gün 2",time:"16:00",loc:"Açık Deniz",sub:"İzmir Körfezi geride kaldı",who:"hasan",
text:`Gemi açık denize çıktı. Tayfa Hasan yanına geldi:\n\n"${n}, deniz tutması var mı? ${sn} gibi ${st.nm} gemisi limanda ağır görünür ama dalgaya farklı davranır."`,
choices:[
{text:"'Yok, deneme seferinde geçtim' de",tag:"akilli",effect:{sayginlik:5,bilgi:3}},
{text:"'Biraz var, ilaç aldım' — dürüst",tag:"itaatkar",effect:{sayginlik:5,dinclik:-3}},
{text:"'Yok' de ama içinde fırtına",tag:"korkak",effect:{dinclik:-8,sayginlik:-3}}]},

{id:"s14",gfx:"engine",alert:false,day:"Gün 3",time:"09:00",loc:"Makine Dairesi",sub:"Çarkçıbaşı ile teknik ders",who:"carkci",
text:`Çarkçıbaşı Fikret Bey:\n\n"${n}. Gel, bir saat ver."\n\n45 derece sıcak. Dev motorlar.\n\n"Şu ana makineler dursa ${sn}'de hiçbir şey çalışmaz. Hangisi aktif, hangisi yedek?"`,
choices:[
{text:"Paneli incele, doğru makineyi işaret et",tag:"akilli",effect:{bilgi:12,sayginlik:8}},
{text:"'Bilmiyorum ama öğrenmek istiyorum' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:5}},
{text:"Konuyu değiştir",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"s15",gfx:"cargo",alert:false,day:"Gün 3",time:"14:00",loc:"Ambar — Yük Sahası",sub:"Manifesto denetimi",who:"z1",
text:`"${n}, şu listede yükler var. Manifesto ile fiili yükü karşılaştır. Hata varsa bildir."\n\nSoğuk, karanlık ambar. İki ayrı kalemde eksik buldun.`,
choices:[
{text:"İkisini de hemen bildir",tag:"akilli",effect:{bilgi:15,sayginlik:12,cesaret:5}},
{text:"Üçer kez daha say, eminleş, bildir",tag:"itaatkar",effect:{bilgi:10,sayginlik:8,dinclik:-5}},
{text:"Geçiştir, liman halleder",tag:"korkak",effect:{sayginlik:-15,bilgi:-5}}]},

{id:"s16",gfx:"bridge",alert:false,day:"Gün 3",time:"19:00",loc:"Toplanma İstasyonu",sub:"SOLAS güvenlik eğitimi",who:"z3",
text:`3. Zabiti Kemal Bey:\n\n"${n}, SOLAS tatbikatı. Yangın alarmı çalınca ilk üç dakika kritik. Toplanma istasyonunuz nerede?"`,
choices:[
{text:"Muster listeni okuduysan doğru yeri söyle",tag:"akilli",effect:{bilgi:12,sayginlik:10}},
{text:"'Hatırlamıyorum, gösterir misiniz?' de",tag:"itaatkar",effect:{bilgi:5,sayginlik:-3}},
{text:"Yanlış yer söyle",tag:"korkak",effect:{sayginlik:-15,bilgi:-5}}]},

{id:"s17",gfx:"galley",alert:false,day:"Gün 3",time:"20:00",loc:"Yemekhane",sub:"Üçüncü akşam",who:"lostromo",
text:`Lostromo başköşeye kuruldu:\n\n"${n}, üç gündür izliyorum. Güvertede en çok neyi anlamadın?"`,
choices:[
{text:"Dürüstçe anlat",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"'Her şeyi anladım' de",tag:"cesur",effect:{cesaret:3,sayginlik:-5}},
{text:"'Bilmiyorum' de",tag:"korkak",effect:{sayginlik:-5}}]},

{id:"s18",gfx:"compass",alert:false,day:"Gün 4",time:"06:00",loc:"Köprüüstü — Sabah Nöbeti",sub:"İlk yarı-bağımsız nöbet",who:"z2",
text:`"${n}, bugün Radarı izle. CPA 1.5 milin altına düşerse beni çağır.\n\nHer küçük şeyde çağırırsan güvensizlik mesajı verirsin. Her şeyi kendi başına çözmeye çalışırsan hata yaparsın.\n\nDenge bul."`,
choices:[
{text:"Sakin izle, kritik durumda çağır",tag:"akilli",effect:{bilgi:10,sayginlik:10}},
{text:"Her küçük şeyi raporla",tag:"itaatkar",effect:{sayginlik:3,bilgi:5}},
{text:"Her şeyi kendi başına çöz",tag:"cesur",effect:{cesaret:8,sayginlik:-3,bilgi:5}}]},

{id:"s19",gfx:"bridge",alert:false,day:"Gün 4",time:"11:00",loc:"Köprüüstü",sub:"Süvari ile ilk sohbet",who:"suvari",
text:`Süvari Mustafa Kaptan köprüye geldi. Radarı inceledi:\n\n"${n}, dört gündür gemidesin. Lostromo'dan iyi şeyler duydum. Sana bir şey sormak istiyorum: ${sn}'de olmak nasıl?"`,
choices:[
{text:"Dürüstçe anlat — iyi ve zor yanlarıyla",tag:"sosyal",effect:{sayginlik:10,cesaret:5}},
{text:"'Her şey harika' de",tag:"itaatkar",effect:{sayginlik:3}},
{text:"'Beklediğimden farklı ama öğreniyorum' de",tag:"akilli",effect:{sayginlik:8,bilgi:3}}]},

{id:"s20",gfx:"compass",alert:false,day:"Gün 4",time:"18:00",loc:"Köprüüstü — Brifing",sub:"Fırtına uyarısı alındı",who:"z2",
text:`"Girit açıklarında alçak basınç. Beaufort 7-8 bekleniyor.\n\nSüvari burada. Karar: Güneye sapıp fırtınadan kaçırız ama geç varırız. Ya da doğrudan devam ederiz."\n\nSüvari ${n}'ye döndü: "Sen olsan?"`,
choices:[
{text:"Haritayı incele, alternatif rotayı gerekçeyle sun",tag:"akilli",effect:{bilgi:12,sayginlik:10,cesaret:8}},
{text:"'Süvarinin kararı doğru olur' de",tag:"korkak",effect:{sayginlik:-5,cesaret:-5}},
{text:"'Devam edelim' de",tag:"cesur",effect:{cesaret:10,sayginlik:3}}]},

// ---- KRİTİK SENARYOLAR ----
{id:"kriz01",gfx:"engine_fault",alert:true,day:"Gün 4",time:"14:00",loc:"Köprüüstü — ACİL ALARM",sub:"Ana makine arızası — gemi ileri sürme gücünü kaybetti",who:"carkci",
text:`Alarm çaldı — sert, kesintisiz.\n\nÇarkçıbaşı radyodan:\n"Köprü dikkat! Ana makine yüksek egzoz sıcaklığı alarmı verdi. Makineleri durduruyorum. Tekrar: MAKİNE DURDU."\n\nGemi bir anda yavaşlamaya başladı.\n\nSüvari: "${n}! Git Çarkçıbaşı'na yardım et. Gözlemle ve raporla!"`,
choices:[
{text:"Hemen makineye in, Çarkçıbaşı'nın yanında dur",tag:"kritik",effect:{cesaret:10,sayginlik:12,bilgi:8}},
{text:"'Ne yapabilirim?' diye sor, sonra git",tag:"akilli",effect:{bilgi:8,sayginlik:8}},
{text:"Köprüde kal, olayı izle",tag:"korkak",effect:{sayginlik:-8,cesaret:-5}}]},

{id:"kriz02",gfx:"engine_fault",alert:true,day:"Gün 4",time:"14:20",loc:"Makine Dairesi — Acil Müdahale",sub:"Egzoz sıcaklığı 480°C — limit 420°C",who:"bas2",
text:`Makine dairesinde herkes ciddi. Paniksiz ama gergin.\n\n2. Başmakinist:\n"${n}, not al. Soğutma suyu akışı düşmüş. Termostat arızası ya da soğutma suyu pompası kavitasyon.\n\nŞu vanayı manuel açacağım. Basınç değişimini izle ve söyle."`,
choices:[
{text:"Basınç göstergesini gözünden ayırma, değişimi bildir",tag:"akilli",effect:{bilgi:15,sayginlik:12}},
{text:"Çarkçıbaşı gelince ona bırak",tag:"korkak",effect:{sayginlik:-8}},
{text:"Vanayı kendisi de aç diye öner",tag:"cesur",effect:{cesaret:5,sayginlik:-3}}]},

{id:"kriz03",gfx:"engine",alert:false,day:"Gün 4",time:"15:45",loc:"Makine Dairesi — Arıza Giderildi",sub:"Soğutma suyu pompası değiştirildi",who:"carkci",
text:`Bir saat sonra motor yeniden çalışıyordu.\n\nÇarkçıbaşı ${n}'ye döndü:\n\n"Soğutma suyu pompasının kavitasyon yaptığını gördün mü? Bu arıza denizde olabilir. Sen sağ ol."`,
choices:[
{text:"Her şeyi not al — bu değerliydi",tag:"akilli",effect:{bilgi:15,sayginlik:8}},
{text:"'Bir dahaki sefere hazır olacağım' de",tag:"cesur",effect:{cesaret:5,sayginlik:8}},
{text:"Teşekkür et ve güverteye dön",tag:"itaatkar",effect:{sayginlik:5}}]},

{id:"kriz04",gfx:"storm",alert:false,day:"Gün 5",time:"07:00",loc:"Ana Güverte — Fırtına",sub:"Beaufort 8 — 18 derece yatış",who:"lostromo",
text:`Fırtına erken ve sert geldi. ${sn} 18 derece yatıyor.\n\nLostromo:\n"Güverteye çıkmak yasak! Ama kargo bağlantıları gevşedi — kayarsa hasar büyük."\n\nSessizlik. Kimse kımıldamıyordu.`,
choices:[
{text:"'Ben giderim' — emniyet halatı tak ve çık",tag:"cesur",effect:{cesaret:15,sayginlik:15,dinclik:-12}},
{text:"'Deneyimli biri daha doğru olur' deyip öner",tag:"akilli",effect:{sayginlik:3,cesaret:-5}},
{text:"Gözleri kaçır",tag:"korkak",effect:{sayginlik:-15,cesaret:-10}}]},

{id:"kriz05",gfx:"storm",alert:false,day:"Gün 5",time:"14:00",loc:"Köprüüstü — Fırtına Zirvesi",sub:"Beaufort 9 — dalga 7 metre",who:"suvari",
text:`Fırtına zirvesinde. Dalga 7 metreye çıktı.\n\nSüvari ${n}'ye:\n"Stajyer. İlk fırtınandaydın. Korkuyor musun?"`,
choices:[
{text:"'Evet, korkuyorum — ama görevimi yapıyorum' de",tag:"cesur",effect:{cesaret:10,sayginlik:10}},
{text:"'Hayır efendim' de",tag:"korkak",effect:{sayginlik:-3}},
{text:"'Endişeliyim ama ekibe güveniyorum' de",tag:"akilli",effect:{sayginlik:8,bilgi:5}}]},

{id:"kriz06",gfx:"galley",alert:false,day:"Gün 5",time:"20:00",loc:"Yemekhane — Fırtına Sonrası",sub:"Fırtına geçti — herkes yorgun",who:"asci",
text:`Fırtına geçti. Mehmet Usta sahanda yumurta pişirdi: "Basit, pratik, besleyici."\n\nSilici Ramazan:\n"Bugün üç ambar kapısı sızdırıyordu. ${n} hepsini buldu. İyi iş."`,
choices:[
{text:"Alçakgönüllüce teşekkür et",tag:"itaatkar",effect:{sayginlik:8}},
{text:"'Lostromo öğretti' de — krediyi paylaş",tag:"sosyal",effect:{sayginlik:12}},
{text:"Sessiz kal",tag:"korkak",effect:{sayginlik:2}}]},

{id:"kriz07",gfx:"bogaz",alert:true,day:"Gün 6",time:"03:00",loc:"Çanakkale Boğazı — ACİL",sub:"Demir tutmuyor — akıntı 4 knot — gemi sürükleniyor",who:"suvari",
text:`Gece 03:00. Çanakkale Boğazı girişi. Rüzgar hızlandı.\n\nSüvari:\n"Demir tutmuyor! SOG 0.8 knot kıyıya doğru. 2 mil mesafe kaldı.\n\n${n}! Sahil güvenliği VHF 16'dan ara, durumu bildir. Hızlı!"`,
choices:[
{text:"Hemen VHF'ye atla: 'SECURITE SECURITE — Türk sularında sürüklenme' de",tag:"kritik",effect:{cesaret:15,sayginlik:15,bilgi:8}},
{text:"Süvariye 'nasıl yapayım?' diye sor",tag:"korkak",effect:{sayginlik:-10,cesaret:-8}},
{text:"Yazılı prosedürü bul, sonra ara",tag:"akilli",effect:{bilgi:5,sayginlik:-5}}]},

{id:"kriz08",gfx:"bogaz",alert:true,day:"Gün 6",time:"03:15",loc:"Çanakkale Boğazı — VHF İletişimi",sub:"Sahil güvenlik bağlandı — kurtarma gemisi yolda",who:"z2",
text:`2. Zabiti:\n\n"${n}, sahil güvenlik bağlandı. Koordinatları ver: 40°12'N 026°24'E.\n\nSonra demir bağlarımızın durumunu sor."`,
choices:[
{text:"Koordinatı doğru oku, demir bağlarını sor",tag:"akilli",effect:{bilgi:15,sayginlik:12,cesaret:5}},
{text:"2. Zabiti yanında konuş, o düzeltsin",tag:"itaatkar",effect:{sayginlik:5,bilgi:5}},
{text:"Sesi titredi, hata yaptın",tag:"korkak",effect:{sayginlik:-8,cesaret:-5}}]},

{id:"kriz09",gfx:"sea",alert:false,day:"Gün 6",time:"05:30",loc:"Çanakkale Boğazı — Güven Sağlandı",sub:"Sürüklenme durduruldu",who:"suvari",
text:`Şafak sökerken makine devreye girdi. Kurtarma gemisi yanı başında.\n\nSüvari:\n"Bu gece VHF'ye atlayan senin. İyi yaptın. Boğazda sürüklenme — en kötü senaryo. Ama sen paniklemeden aradın."`,
choices:[
{text:"'Eğitim sayesinde' de — teşekkür et",tag:"akilli",effect:{bilgi:8,sayginlik:12}},
{text:"'Korktum ama yapmak gerekiyordu' de",tag:"cesur",effect:{cesaret:10,sayginlik:10}},
{text:"Sessiz gül, başını eğ",tag:"itaatkar",effect:{sayginlik:8}}]},

{id:"kriz10",gfx:"pirate",alert:true,day:"Gün 8",time:"04:00",loc:"Aden Körfezi — ACİL — KORSAN UYARISI",sub:"Yüksek hız tekneleri gemiye yaklaşıyor",who:"suvari",
text:`Gece 04:00. Tüm ışıklar söndürüldü.\n\nSüvari:\n"IMB NAVAREA uyarısı: Aden Körfezi'nde aktif korsan bölgesi. Radarda iki yüksek hız teknesi var — 28 knot, bize doğru geliyor.\n\nBMS prosedürleri başlıyor. ${n}, BMS odasına git — kapıyı içeriden kilitle!"`,
choices:[
{text:"Koş, BMS odasına gir, kapıyı kilitle",tag:"kritik",effect:{cesaret:12,sayginlik:12}},
{text:"'BMS odası nerede?' diye sor",tag:"korkak",effect:{sayginlik:-8,cesaret:-5}},
{text:"Köprüde kal, yardım et",tag:"cesur",effect:{cesaret:8,sayginlik:-5}}]},

{id:"kriz11",gfx:"pirate",alert:true,day:"Gün 8",time:"04:20",loc:"BMS Odası — Kilitli",sub:"Süvari makine hızını full'e çekti — kaçış manevrası",who:"anlatici",
text:`BMS odasının içi karanlık. Demir kapı kilitli.\n\nDışarıdan radyo: "${sn} kaçış manevrası başlıyor!"\n\n20 dakika böyle geçti. Sonra süvarinin sesi:\n\n"BMS — dışarı çıkabilirsiniz. Tekneler geride kaldı."`,
choices:[
{text:"Dışarı çık, Süvari'ye durumu sor",tag:"akilli",effect:{bilgi:8,sayginlik:8}},
{text:"Derin nefes al, sakin ol, çık",tag:"itaatkar",effect:{dinclik:5,cesaret:5}},
{text:"İlk dışarı çıkan sen ol",tag:"cesur",effect:{cesaret:8,sayginlik:5}}]},

{id:"kriz12",gfx:"bridge",alert:false,day:"Gün 8",time:"05:00",loc:"Köprüüstü — Korsan Sonrası",sub:"Değerlendirme toplantısı",who:"suvari",
text:`Süvari:\n\n"${n}, Aden'de her sefer bu risk var. BMS prosedürünü doğru uyguladın. Panikledin mi?"`,
choices:[
{text:"'Evet, içimde — ama yaptım' de — dürüst",tag:"cesur",effect:{cesaret:10,sayginlik:12}},
{text:"'Hayır efendim' de",tag:"korkak",effect:{sayginlik:3}},
{text:"'BMS odası beni rahatlattı' de",tag:"akilli",effect:{bilgi:5,sayginlik:8}}]},

// ---- EK RUTİN SAHNELER ----
{id:"s21",gfx:"sea",alert:false,day:"Gün 6",time:"06:30",loc:"Pruva — Sabah",sub:"Hasan ile sabah sohbeti",who:"hasan",
text:`Tayfa Hasan pruva korkuluğuna yaslandı.\n\n"${n}, senin yaşındayken ben de staj yaptım.\n\nBir süvari bana dedi: 'Deniz seni öldürmek istemez. Ama aptallığını affetmez.'"`,
choices:[
{text:"Dinle ve 'anlıyorum' de",tag:"sosyal",effect:{sayginlik:8,bilgi:5,dinclik:5}},
{text:"Benzer bir an olup olmadığını sor",tag:"akilli",effect:{bilgi:8,sayginlik:7}},
{text:"Teşekkür et ve görevine dön",tag:"itaatkar",effect:{dinclik:5}}]},

{id:"s22",gfx:"night",alert:false,day:"Gün 7",time:"22:00",loc:"Köprüüstü — Gece Nöbeti",sub:"İlk gerçek yalnız nöbet",who:"z2",
text:`"${n}, bu gece nöbette yalnızsın. İlk kez. Alarm çalarsa beni ara.\n\nGece nöbetinin en büyük düşmanı yorgunluktur. Oturma — ayakta kal."`,
choices:[
{text:"Ayakta kal, radara odaklan, kayıt tut",tag:"akilli",effect:{bilgi:12,sayginlik:10}},
{text:"Otur ama gözleri açık tut",tag:"korkak",effect:{dinclik:-5,sayginlik:-5}},
{text:"Küçük turlar at, aktif kal",tag:"cesur",effect:{bilgi:8,sayginlik:8,cesaret:5}}]},

{id:"s23",gfx:"radar",alert:false,day:"Gün 7",time:"23:30",loc:"Köprüüstü — Gece",sub:"Radar hedefi yaklaşıyor",who:"anlatici",
text:`Saat 23:30. Ekranda kırmızı nokta.\n\nHedef sancak baş omuzluğundan geçiş yapıyor. CPA: 0.8 mil. 12 dakika.\n\nCOLREG'e göre bu crossing durumunda ${sn} give-way gemi. Sen bağımsız manevra veremezsin; ama riski doğru okuyup nöbet zabitini hemen kaldırman gerekir.\n\n2. Zabiti uyuyor. 12 dakika.`,
choices:[
{text:"Hemen 2. Zabiti'yi ara, 'sancakta crossing hedef, CPA 0.8' diye rapor ver",tag:"akilli",effect:{bilgi:14,sayginlik:12}},
{text:"Hedefi izlemeye devam et, CPA biraz daha düşerse haber ver",tag:"cesur",effect:{cesaret:6,bilgi:2,dinclik:-5,sayginlik:-4}},
{text:"Bekle — AIS'te büyük gemi bizi zaten görüyordur",tag:"korkak",effect:{dinclik:-8,sayginlik:-10,bilgi:-8}}]},

{id:"s23b",gfx:"compass",alert:false,day:"Gün 7",time:"23:40",loc:"Köprüüstü — COLREG Dersi",sub:"2. Zabiti ile trafik değerlendirmesi",who:"z2",
text:`2. Zabiti köprüye geldi, radarı aldı.\n\n"İyi ki kaldırdın. Şimdi söyle: sancakta gemi varsa crossing'de kim give-way olur? Head-on'da ne yaparız? Dar kanalda nerede dururuz?"\n\nKısa kısa cevap vermeni bekliyor.`,
choices:[
{text:"'Sancaktaki hedef bende ise ben yol veririm; head-on'da sancağa döneriz; dar kanalda sancak sınırına yakın kalırız' de",tag:"kritik",effect:{bilgi:16,sayginlik:12,cesaret:6}},
{text:"'Önce VHF çağrısı yaparız, sonra bakarız' de",tag:"itaatkar",effect:{bilgi:3,sayginlik:-4}},
{text:"'Büyük olan geçer, küçük olan kaçar' de",tag:"korkak",effect:{bilgi:-10,sayginlik:-8}}]},

{id:"s24",gfx:"fire",alert:true,day:"Gün 9",time:"14:00",loc:"Yangın İstasyonu — TATBIKAT",sub:"Gerçekçi yangın tatbikatı — 4 dakika",who:"z3",
text:`Alarm çaldı.\n\n3. Zabiti:\n"Bu sefer gerçekçi yapıyoruz. ${n}, sen B güvertesi tahliye sorumlusun. Oradaki üç personeli toplanma istasyonuna götür. Süre: 4 dakika."`,
choices:[
{text:"Hızlıca koş, üç kişiyi bul ve yönlendir",tag:"cesur",effect:{cesaret:12,sayginlik:10,dinclik:-8}},
{text:"Sakin kal, sırayla kontrol et",tag:"akilli",effect:{bilgi:10,sayginlik:10}},
{text:"Kafan karışık — biri seni yönlendirsin",tag:"korkak",effect:{sayginlik:-10,cesaret:-8}}]},

{id:"s25",gfx:"sea",alert:false,day:"Gün 9",time:"10:00",loc:"Ana Güverte",sub:"Lostromo ile ileri halat teknikleri",who:"lostromo",
text:`"${n}, dün iyi iş çıkardın. Bugün daha ileri seviye göstereceğim.\n\nDeniz kelebeği, iki yarım, Fransız bağı — her birinin kullanım yeri farklı.\n\nBana göster: Baba babasına halat bağla."`,
choices:[
{text:"Dikkatlice dene, doğru yöntemi kullan",tag:"akilli",effect:{bilgi:12,sayginlik:10}},
{text:"Hızlıca bağla",tag:"cesur",effect:{cesaret:5,bilgi:5,sayginlik:3}},
{text:"'Bir daha gösterir misiniz?' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:5}}]},

{id:"s26",gfx:"bridge",alert:false,day:"Gün 10",time:"09:00",loc:"Süvari Kamarası",sub:"Özel değerlendirme sohbeti",who:"suvari",
text:`Süvari seni kahvaltıya çağırdı.\n\n"${n}, otur. Kahve?\n\n${sn}'de en çok kimi sayıyorsun? Kimi model alıyorsun?"`,
choices:[
{text:"Lostromo'yu söyle — pratik bilgi",tag:"akilli",effect:{sayginlik:10,bilgi:8}},
{text:"Süvariyi söyle — saygı",tag:"cesur",effect:{sayginlik:8,cesaret:3}},
{text:"'Herkesten bir şey alıyorum' de",tag:"sosyal",effect:{sayginlik:12,bilgi:5}}]},

{id:"s27",gfx:"sea",alert:false,day:"Gün 11",time:"15:00",loc:"Pruva — Akşam Üzeri",sub:"Lostromo ile son büyük ders",who:"lostromo",
text:`Lostromo ${n}'yi pruvanın ucuna götürdü. İlk gün gibi.\n\n"İlk gün seni buraya getirmiştim. Aşağı baktın, korkuyu gizlemeye çalıştın.\n\nŞimdi aynı yere bak."\n\nDenize baktın. Dalga var ama korkuyu hissetmedin.`,
choices:[
{text:"'Farkı hissediyorum' de — içten",tag:"sosyal",effect:{sayginlik:12,cesaret:8}},
{text:"Sessizce gül — sözün gereği yok",tag:"itaatkar",effect:{sayginlik:10,cesaret:5}},
{text:"'Hâlâ öğreniyorum' de",tag:"akilli",effect:{sayginlik:10,bilgi:5}}]},

{id:"s28",gfx:"galley",alert:false,day:"Gün 12",time:"20:00",loc:"Yemekhane — Veda Yemeği",sub:"Son akşam — herkes masada",who:"asci",
text:`Mehmet Usta özel menü hazırladı. Kuzu dolma ve baklava.\n\nHerkes masadaydı. Süvari ayağa kalktı:\n\n"${n}. Bu yolculukta bir söz var mı?"`,
choices:[
{text:"Herkese tek tek teşekkür et",tag:"sosyal",effect:{sayginlik:15,dinclik:10}},
{text:"Kısa ve özlü konuş",tag:"itaatkar",effect:{sayginlik:8}},
{text:"Öğrendiklerini listele",tag:"akilli",effect:{sayginlik:10,bilgi:8}}]},

{id:"s29",gfx:"engine",alert:false,day:"Gün 6",time:"09:00",loc:"Makine Kontrol Odası",sub:"2. Başmakinist paralel jeneratör dersi",who:"bas2",
text:`"${n}, dün fırtınada iki jeneratör aynı anda çalıştı.\n\nSana soruyorum: İki jeneratör paralel çalışırken en büyük risk ne?"`,
choices:[
{text:"'Faz senkronizasyonu kaybolursa kısa devre' de",tag:"akilli",effect:{bilgi:15,sayginlik:10}},
{text:"'Emin değilim, açıklar mısınız?' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:3}},
{text:"Tahmin et, yanlış olsa da söyle",tag:"cesur",effect:{bilgi:3,sayginlik:-3,cesaret:3}}]},

{id:"s30",gfx:"cargo",alert:false,day:"Gün 7",time:"14:00",loc:"Yük Sahası",sub:"Yükleme planı hazırlığı",who:"z1",
text:`"${n}, yükleme planını hazırlamak istiyorum. Denge hesabı, yük yerleşimi, manifesto taslağı.\n\nBu sefer sen yapacaksın. Referans dokümanlar masada."`,
choices:[
{text:"'Yapabilirim' de — inisiyatif al",tag:"cesur",effect:{cesaret:12,sayginlik:10}},
{text:"Referans dokümanlara bak, dikkatli hazırla",tag:"akilli",effect:{bilgi:15,sayginlik:12,dinclik:-8}},
{text:"'Biraz yardım alabilir miyim?' de",tag:"itaatkar",effect:{sayginlik:7,bilgi:8}}]},

{id:"s31",gfx:"port_arrival",alert:false,day:"Gün 7",time:"09:00",loc:"Pire Limanı",sub:"İlk yabancı liman — Yunanistan",who:"anlatici",
text:`${sn} Pire'ye demirlendi. Yunan güneşi yakıcı. Liman gürültülü.\n\nMehmet Usta: "Bu akşam balık var — kutlama!"`,
choices:[
{text:"Yükleme operasyonuna odaklan",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"Kısa bir tur at Pire'de",tag:"sosyal",effect:{sayginlik:8,dinclik:5}},
{text:"Mehmet Usta'nın yanına git",tag:"itaatkar",effect:{dinclik:8,sayginlik:5}}]},

{id:"s32",gfx:"compass",alert:false,day:"Gün 8",time:"10:00",loc:"Açık Deniz — Seyir",sub:"Uzun seyir — 6 saatlik solo nöbet",who:"z2",
text:`"${n}, bugün sana bağımsız bir görev veriyorum. Öğleden sonra nöbetini tek tutacaksın — 6 saat.\n\nHer saat bir kez kontrole geleceğim. Ama müdahale etmeyeceğim.\n\nHazır mısın?"`,
choices:[
{text:"'Hazırım efendim' — güvenle",tag:"cesur",effect:{cesaret:10,sayginlik:8}},
{text:"'Hazırım ama yakında ol' de",tag:"akilli",effect:{sayginlik:5,bilgi:5}},
{text:"'Emin değilim' de",tag:"korkak",effect:{cesaret:-5,sayginlik:-5}}]},

{id:"s33",gfx:"sea",alert:false,day:"Gün 8",time:"18:30",loc:"Köprüüstü",sub:"Solo nöbet değerlendirmesi",who:"z2",
text:`2. Zabiti raporu okudu. Sustu. Sonra:\n\n"Üç olayın ikisini doğru hallettın. Sahil muhafaza iletişimi mükemmeldi.\n\nBir eksik: Dümen kararında bilgilendirme zinciri kopmaz. Bağımsız nöbet, bağımsız karar değil.\n\nGenel: Çok iyi." Eli uzattı.`,
choices:[
{text:"El sıkış, teşekkür et",tag:"itaatkar",effect:{sayginlik:10,bilgi:5}},
{text:"'Bilgilendirme konusunu not aldım' de",tag:"akilli",effect:{bilgi:8,sayginlik:8}},
{text:"İçten gurur duy",tag:"sosyal",effect:{sayginlik:7,cesaret:5}}]},

{id:"s34",gfx:"galley",alert:false,day:"Gün 6",time:"08:00",loc:"Yemekhane — Kahvaltı",sub:"Silici ile sabah sohbeti",who:"silici",
text:`Silici Ramazan kahvaltıda:\n\n"${n}, sana bir şey soracaktım. Neden denizcilik seçtin?\n\nBen seçmedim. Babam denizciydi, ağabeyim de. Ben de öyle oldum."`,
choices:[
{text:"Gerçek cevabını ver — içten anlat",tag:"sosyal",effect:{sayginlik:10,bilgi:3}},
{text:"'Denizi seviyorum' de — sade ama dürüst",tag:"itaatkar",effect:{sayginlik:5}},
{text:"'Henüz tam bilmiyorum' de",tag:"akilli",effect:{sayginlik:7,bilgi:3}}]},

{id:"s35",gfx:"engine",alert:false,day:"Gün 10",time:"11:00",loc:"Makine Dairesi",sub:"Son makine ziyareti",who:"bas2",
text:`2. Başmakinist seni tekrar makine dairesine çağırdı.\n\n"Hatırla mısın — pompa arızasını? Tamir ettik. Titreşim 1.8 mm/s — normalin altında.\n\nSeninle birlikte çözüldü. Ben tesadüfe inanmam."`,
choices:[
{text:"İn, son bir kez pompaya bak",tag:"sosyal",effect:{sayginlik:10,bilgi:8,dinclik:-3}},
{text:"Teşekkür et — bir şeyler öğrettiği için",tag:"itaatkar",effect:{sayginlik:12}},
{text:"'Bu deneyim değerliydi' de",tag:"akilli",effect:{sayginlik:10,bilgi:5}}]},

// ---- FİNAL SAHNE (her zaman son) ----

// ---- YENİ SENARYOLAR ----
{id:"s36",gfx:"sea",alert:false,day:"Gün 5",time:"08:00",loc:"Açık Deniz — Şafak",sub:"Gemi dümen başı vardiyası",who:"z2",
text:`Şafak söküyor. 2. Zabiti köprüde, seyir günlüğünü kapatıyor.\n\n"${n}, bir şey soracağım. Şimdiye kadar en çok hangi sahneyi aklına kazıdın? Limanda ilk adım, lostromo'nun halatı, gece nöbeti?\n\nGemide her şeyi öğretmek zorundayız — siz stajyerler yarının zabitlerisisiniz."`,
choices:[
{text:"'Gece nöbetindeki radar hedefi' de — dürüst",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"'Lostromo'nun pruva dersi' de",tag:"sosyal",effect:{sayginlik:8,bilgi:5}},
{text:"'Hepsinden bir şey aldım' de",tag:"itaatkar",effect:{sayginlik:7}}]},

{id:"s37",gfx:"engine",alert:false,day:"Gün 7",time:"16:00",loc:"Makine Dairesi — Kazan Odası",sub:"Yağcı ile buhar sistemi kontrolü",who:"yagci",
text:`Yağcı Mehmet Ali seni kazanlar odasına götürdü.\n\n"${n}, şu ısı eşanjörlerine bak. Çelik plakalar arasından sıcak su geçiyor, deniz suyuyla soğutuluyor.\n\nTıkanma olursa ne olur?"`,
choices:[
{text:"'Soğutma düşer, aşırı ısınma riski artar' de",tag:"akilli",effect:{bilgi:12,sayginlik:8}},
{text:"'Bilmiyorum ama öğrenmek istiyorum' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:5}},
{text:"Konuyu değiştir",tag:"korkak",effect:{sayginlik:-3}}]},

{id:"s38",gfx:"sea",alert:false,day:"Gün 8",time:"14:00",loc:"Açık Deniz — Öğleden Sonra",sub:"Lostromo ile vinç bakımı",who:"lostromo",
text:`Lostromo kargo vincini bakıma aldı. ${n}'yi yanına çekti.\n\n"Vinç bakımı kimsenin görmek istemediği ama herkesin ihtiyaç duyduğu iş. Gres, yağ, halat kontrolü.\n\nSana öğreteceğim."`,
choices:[
{text:"İstekle katıl, gres tabancasını al",tag:"cesur",effect:{bilgi:10,sayginlik:10,dinclik:-5}},
{text:"Dikkatle izle, not al",tag:"akilli",effect:{bilgi:12,sayginlik:7}},
{text:"'Bu işi yapan ayrı biri değil mi?' de",tag:"korkak",effect:{sayginlik:-8}}]},

{id:"s39",gfx:"galley",alert:false,day:"Gün 9",time:"07:30",loc:"Yemekhane — Kahvaltı",sub:"Aşçı ile Türk kahvesi",who:"asci",
text:`Mehmet Usta Türk kahvesi yapıyordu.\n\n"${n}, denizciler çok kahve içer. Ama ölçüyü bil. Fazla kafein, gece nöbetinde uykusuzluk yapar — ama sabah nöbetinde hayat kurtarır.\n\nAl, iç."`,
choices:[
{text:"Al, keyifle iç — güzel bir an",tag:"sosyal",effect:{sayginlik:8,dinclik:5}},
{text:"Teşekkür et ama içme — kendi programın var",tag:"itaatkar",effect:{sayginlik:3}},
{text:"İç ve Mehmet Usta'ya gemi hikayeleri sor",tag:"akilli",effect:{sayginlik:10,bilgi:5}}]},

{id:"s40",gfx:"bridge",alert:false,day:"Gün 10",time:"14:00",loc:"Köprüüstü — Öğleden Sonra Nöbeti",sub:"3. Zabiti ile emniyet denetimi",who:"z3",
text:`3. Zabiti Kemal Bey nöbet devrine girdi.\n\n"${n}, sana SOLAS'tan bir soru: Gemide dört terk-i sefine bölgesi var. Her birinin birincil ve ikincil tahliye yolu nedir?\n\nBu soruyu bilmeden kaza anında ne yapacaksın?"`,
choices:[
{text:"Hatırladığın kadarını söyle, bilmediğini de söyle",tag:"akilli",effect:{bilgi:10,sayginlik:8}},
{text:"Muster listeni çıkar, oradan oku",tag:"itaatkar",effect:{bilgi:8,sayginlik:5}},
{text:"Tahmin et, yanlış olsa da",tag:"cesur",effect:{bilgi:3,sayginlik:-5,cesaret:3}}]},

{id:"s41",gfx:"cargo",alert:false,day:"Gün 11",time:"10:00",loc:"Yük Sahası — Ambar Kontrolü",sub:"1. Zabiti ile nem kontrolü",who:"z1",
text:`1. Zabiti ${n}'yi ambar 3'e götürdü.\n\n"Bak şu nem ölçere — 74%. Tahıl için sınır 65%, paketli yük için 70%. Yüksek nem kargoda küfe, sızdırmaya, ağırlık artışına yol açar.\n\nNe yaparsın?"`,
choices:[
{text:"'Havalandırma sistemini kontrol ederim, kapı güvertesini incelerim' de",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Çarkçıbaşı'ya bildiririm, yük sorumluluğu zabitlerin' de",tag:"itaatkar",effect:{bilgi:7,sayginlik:5}},
{text:"'Yüzde dört fark önemli değil' de",tag:"korkak",effect:{sayginlik:-8,bilgi:-5}}]},

{id:"s42",gfx:"sea",alert:false,day:"Gün 12",time:"17:00",loc:"Güverte — Akşam Üzeri",sub:"Tayfa Musa ile dertleşme",who:"musa",
text:`Tayfa Musa güverte korkuluğuna yaslandı, sesi yorgun:\n\n"${n}, ben evleneceğim önümüzdeki yıl. Kız arkadaşım 'ya denizi bırak ya beni' diyor. Sen ne düşünürsün?"`,
choices:[
{text:"Dürüstçe anlat — denizin fedakarlıklarını da söyle",tag:"sosyal",effect:{sayginlik:10,bilgi:5}},
{text:"'Seç — iki şeyi de yarım yapamazsın' de",tag:"cesur",effect:{sayginlik:5,cesaret:3}},
{text:"'Bu çok kişisel, ben karışamam' de",tag:"itaatkar",effect:{sayginlik:3}}]},

{id:"s43",gfx:"compass",alert:false,day:"Gün 6",time:"11:00",loc:"Köprüüstü — Seyir Dersi",sub:"2. Zabiti ile derinlik ölçümü",who:"z2",
text:`2. Zabiti ECDIS'te bir noktayı işaret etti.\n\n"${n}, şu kanaldan geçeceğiz. Su derinliği 18 metre. ${sn}'nin maksimum tahliyesi 9.2 metre. Güvenli mi?\n\nHesapla."`,
choices:[
{text:"'18-9.2=8.8m kıç boşluğu, IACS standardı minimum 3.5m, güvenli' de",tag:"akilli",effect:{bilgi:15,sayginlik:12}},
{text:"'Süvari karar vermeli' de",tag:"korkak",effect:{sayginlik:-5}},
{text:"Hesabı yap ama yüksek sesle yanlış söyle",tag:"cesur",effect:{bilgi:-3,sayginlik:-5}}]},

{id:"s44",gfx:"night",alert:false,day:"Gün 9",time:"01:00",loc:"Köprüüstü — Gece Seyri",sub:"Yıldızlı gece — huzurlu nöbet",who:"anlatici",
text:`Saat 01:00. Nöbet sakin geçiyor.\n\nDeniz ışıl ışıl — biyolüminesans. Dalgalar yeşil parlıyor. ${sn}'nin pruvasından akan su her seferinde bir ışık saçıyor.\n\nBu manzaraya hayran kaldın. Hayatında böyle bir şey görmemiştin.`,
choices:[
{text:"Radyodan 2. Zabiti'yi ara, görmesini söyle",tag:"sosyal",effect:{sayginlik:10,dinclik:5}},
{text:"Nöbet günlüğüne yaz, radarı izlemeyi bırakma",tag:"akilli",effect:{bilgi:5,sayginlik:5}},
{text:"İzle, içini çek — bu an sadece sana ait",tag:"itaatkar",effect:{dinclik:8,sayginlik:3}}]},

{id:"s45",gfx:"storm",alert:false,day:"Gün 4",time:"16:00",loc:"İç Koridor — Alt Güverte",sub:"Fırtınada iç güverte kontrolü",who:"z1",
text:`"${n}, dış güverte yasak. Ama ambar kapılarını kontrol edeceksin — su sızdırmazlık. 12 kapı. Her birini tek tek işaretle."`,
choices:[
{text:"Tüm kapıları titizlikle kontrol et",tag:"akilli",effect:{bilgi:10,sayginlik:10,dinclik:-8}},
{text:"Hızlıca bak, 'tamam' de",tag:"korkak",effect:{sayginlik:-8,bilgi:-3}},
{text:"Lostromo'yu da al, birlikte kontrol et",tag:"cesur",effect:{sayginlik:7,bilgi:8,dinclik:-5}}]},

{id:"s46",gfx:"harbor",alert:false,day:"Gün 2",time:"11:00",loc:"İskenderiye Limanı — Giriş",sub:"İlk yabancı liman girişi",who:"z2",
text:`${sn} İskenderiye'ye yaklaşıyor.\n\n2. Zabiti:\n\n"${n}, yabancı limanda gümrük prosedürü farklı. Bayrak idaresi, liman devleti kontrolü, sağlık belgesi, ISPS güvenlik bildirimi.\n\nPilot kalkana geldi. Gözlemle."`,
choices:[
{text:"Her prosedürü not al",tag:"akilli",effect:{bilgi:14,sayginlik:8}},
{text:"Pilota yardım et — el işaretleri ver",tag:"cesur",effect:{cesaret:8,sayginlik:10}},
{text:"Arka planda izle",tag:"itaatkar",effect:{bilgi:5}}]},

{id:"s47",gfx:"galley",alert:false,day:"Gün 7",time:"12:00",loc:"Yemekhane — Öğle Arası",sub:"Silici ile felsefe sohbeti",who:"silici",
text:`Silici Ramazan öğle arasında sessizce yiyor.\n\n"${n}, sana bir şey soracağım. Gemi personeline çok zaman harcadın — kim seni en çok etkiledi?"`,
choices:[
{text:"Lostromo'yu söyle ve neden etkilendiğini anlat",tag:"sosyal",effect:{sayginlik:10,bilgi:5}},
{text:"Silici Ramazan'ı söyle — 14 yıl aynı işi yapmak",tag:"sosyal",effect:{sayginlik:12}},
{text:"Süvariyi söyle — liderlik",tag:"cesur",effect:{sayginlik:8,cesaret:3}}]},

{id:"kriz13",gfx:"fire",alert:true,day:"Gün 10",time:"11:00",loc:"A Güvertesi — GERÇEK YANGIN",sub:"Elektrik panosu yangını — MAYDAY değil SECURITE",who:"z3",
text:`Alarm çaldı — bu sefer gerçek.\n\nSiyah duman görünüyor. A güvertesinde elektrik panosu yandı.\n\n3. Zabiti radyoda:\n"Tüm mürettebat muster istasyonlarına! Bu tatbikat değil!\n\n${n}! Sen B tahliye sorumlusun. Oradaki iki kişiyi çıkar. 90 saniye!"`,
choices:[
{text:"Koş, B güvertedeki iki kişiyi bul ve yönlendir",tag:"kritik",effect:{cesaret:15,sayginlik:15,dinclik:-10}},
{text:"3. Zabiti'ye 'B güverte kaç kişi?' diye sor",tag:"akilli",effect:{sayginlik:5,bilgi:5}},
{text:"Duman göründü — dondun",tag:"korkak",effect:{sayginlik:-15,cesaret:-12}}]},

{id:"kriz14",gfx:"fire",alert:true,day:"Gün 10",time:"11:05",loc:"Muster İstasyonu — B Güverte",sub:"Tahliye tamamlandı — 87 saniye",who:"z3",
text:`87 saniyede B güvertedekileri topladın.\n\n3. Zabiti krono baktı:\n\n"87 saniye. İyi. Standart 90 saniye.\n\nBir sorun: Listede 2 kişi yazıyordu ama sen 2 kişi getirdin. Doğru. Ama AMbar 3'ten çıkan Musa nerede?\n\nMuster listeni tam okudun mu?"`,
choices:[
{text:"'Musa'yı da almalıydım, muster listemde yoktu — hata bende' de",tag:"akilli",effect:{bilgi:12,sayginlik:10}},
{text:"'Ama listedeki herkesi aldım' de — savun",tag:"cesur",effect:{sayginlik:-3,cesaret:3}},
{text:"Sessiz kal, ne diyeceğini bil(e)miyorsun",tag:"korkak",effect:{sayginlik:-8}}]},

{id:"kriz15",gfx:"sea",alert:false,day:"Gün 3",time:"22:00",loc:"Açık Deniz — Gece",sub:"Gece denizinde adam düştü tatbikatı",who:"suvari",
text:`Süvari ani bir tatbikat başlattı.\n\n"ADAM DÜŞTÜ — SANCAK TARAF!"

Gemi manevra yapıyor. Deniz işaret feneri atıldı. Zabitler positione koştu.\n\nSüvari ${n}'ye:\n"Sen ne yapıyorsun? Söyle!"`,
choices:[
{text:"'Düşenin yerini gösteririm, gözden ayırmam' de — doğru",tag:"akilli",effect:{bilgi:15,sayginlik:12,cesaret:8}},
{text:"Bağırarak yardım çağır",tag:"cesur",effect:{cesaret:5,sayginlik:5}},
{text:"Dondun",tag:"korkak",effect:{sayginlik:-12,cesaret:-8}}]},


{id:"s48",gfx:"bridge",alert:false,day:"Gün 3",time:"10:00",loc:"Köprüüstü — Trafik Ayrım Şeridi",sub:"TSS geçişi — yoğun trafik",who:"z2",
text:`2. Zabiti radarı işaret etti:\n\n"${n}, şu an Çanakkale TSS'sine giriyoruz. Trafik ayrım şeridi — tek yönlü geçiş zorunlu. Seyir hızı minimum 8 knot.\n\nŞu kırmızı nokta — 3 mil önümüzde, yavaş gemi. CPA hesabı yap."`,
choices:[
{text:"CPA hesapla, yeterli mesafe varsa rahatla bildir",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"Süvariyi ara — TSS'de dikkatli olmak şart",tag:"cesur",effect:{cesaret:5,sayginlik:7,bilgi:5}},
{text:"2. Zabiti halleder diye düşün",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"s49",gfx:"galley",alert:false,day:"Gün 5",time:"11:30",loc:"Yemekhane — Öğle Arası",sub:"Tayfa Hasan ile uzun denizcilik sohbeti",who:"hasan",
text:`Tayfa Hasan öğle arasında bira gibi kahvesini yudumluyor:\n\n"${n}, sana bir şey söyleyeyim. Ben 18 yıldır gemideyim. Üç süvari altında çalıştım. Her biri farklıydı.\n\nBirincisi her şeyi ezberletti. İkincisi hiçbir şey öğretmedi. Üçüncüsü — şu andaki — sen ne öğrenmek istersen sorusunu sordu.\n\nHangisi en iyi öğreticiydi sence?"`,
choices:[
{text:"'Üçüncüsü — merakı öldürmeyen' de",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"'Birincisi — temel olmadan ilerlenmez' de",tag:"itaatkar",effect:{sayginlik:5,bilgi:5}},
{text:"Hepsinden bir şey var deyip dengeli cevap ver",tag:"sosyal",effect:{sayginlik:12,bilgi:5}}]},

{id:"s50",gfx:"harbor",alert:false,day:"Gün 4",time:"13:00",loc:"Cenova Limanı — Konteyner Sahası",sub:"İtalyan limanda yükleme denetimi",who:"z1",
text:`Cenova'da yükleme başladı. 1. Zabiti ${n}'ye döndü:\n\n"İtalyan liman yetkilileri gelecek. Portföy denetimi. Belgeleri hazır tut.\n\nBir sorun var — konteyner numarası 14 manifesto ile uyuşmuyor. Yetkili gelecek ve soracak."`,
choices:[
{text:"Numarayı yeniden kontrol et, doğruysa bildir, yanlışsa düzelt",tag:"akilli",effect:{bilgi:14,sayginlik:12,cesaret:5}},
{text:"1. Zabiti'ye bırak, senin işin değil",tag:"korkak",effect:{sayginlik:-8}},
{text:"Yanlış bile olsa geçiştirilir herhalde de",tag:"korkak",effect:{sayginlik:-12,bilgi:-5}}]},

{id:"s51",gfx:"night",alert:false,day:"Gün 8",time:"03:00",loc:"Köprüüstü — Derin Gece",sub:"03:00-06:00 nöbeti — en zor saat",who:"anlatici",
text:`Saat 03:00. Gece nöbetinin en ağır saati.\n\nGöz kapanmak istiyor. Deniz sakin. Radar sessiz. Hiçbir şey olmuyor.\n\nEn tehlikeli an bu — tehlikenin olmadığı an. Dikkat dağılır. Reflex körleşir.\n\nNe yapacaksın?`,
choices:[
{text:"Ayağa kalk, yüzünü yıka, güverteye çık — aktif kal",tag:"cesur",effect:{dinclik:-5,cesaret:8,bilgi:5}},
{text:"Radyo kontrolü yap, log yaz, ayakta dur",tag:"akilli",effect:{bilgi:10,sayginlik:8}},
{text:"Sadece birkaç dakika otururum diyerek otur",tag:"korkak",effect:{dinclik:-10,sayginlik:-8}}]},

{id:"s52",gfx:"engine",alert:false,day:"Gün 6",time:"14:00",loc:"Makine Dairesi — Sabo Sistemi",sub:"Çarkçıbaşı ile sintine sistemi",who:"carkci",
text:`Çarkçıbaşı ${n}'yi sintine pompası odasına götürdü.\n\n"${n}, MARPOL 73/78 biliyor musun? Denize yağlı su boşaltmak yasak. Sintine suyu sistemi var — yağ-su ayırıcı, 15 ppm monitör.\n\nKontrol düzeneği bozulsa bile denize basamayız. Cezası gemi alıkonması."`,
choices:[
{text:"MARPOL bilgini ortaya koy, sistemi incele",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'15 ppm ne demek?' diye sor",tag:"itaatkar",effect:{bilgi:10,sayginlik:5}},
{text:"Anlamadım ama anladım hissini ver",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"s53",gfx:"sea",alert:false,day:"Gün 9",time:"16:30",loc:"Ana Güverte — Sancak Bordasında",sub:"Lostromo ile pas sökme",who:"lostromo",
text:`Lostromo ${n}'yi sancak bordaya götürdü. Elinde çekiç ve paslanmış panel.\n\n"Güvertede bakım bitmez. Pas görmezse gemi çürür. Boya altında ne var biliyor musun?"\n\nÇekiçle vurdu — ses boş geldi. "İşte bu. Pasta boya altında hava boşluğu. Burası çürük."`,
choices:[
{text:"Çekiçle dene, ses farkını anlamaya çalış",tag:"akilli",effect:{bilgi:12,sayginlik:10,dinclik:-5}},
{text:"Not al, tüm gözlemleri kaydet",tag:"itaatkar",effect:{bilgi:10,sayginlik:7}},
{text:"'Bu çok ağır iş' diye düşün ama söyleme",tag:"korkak",effect:{sayginlik:-3}}]},

{id:"s54",gfx:"compass",alert:false,day:"Gün 7",time:"11:00",loc:"Köprüüstü — AIS Terminali",sub:"2. Zabiti ile AIS ve sahte hedef tartışması",who:"z2",
text:`2. Zabiti AIS ekranını açtı:\n\n"${n}, şu gemilere bak. Hepsi AIS yayıyor. Ama dikkat — bazı gemiler kasıtlı olarak yanlış pozisyon yayıyor.\n\nNeden böyle yapar bir gemi?"`,
choices:[
{text:"'Kaçakçılık, yaptırımlardan kaçma, balık avı gizleme' de",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Bilmiyorum ama tehlikeli olmalı' de",tag:"itaatkar",effect:{bilgi:7,sayginlik:5}},
{text:"'AIS kapatmak yasak değil mi?' diye sor",tag:"sosyal",effect:{bilgi:10,sayginlik:7}}]},

{id:"s55",gfx:"galley",alert:false,day:"Gün 10",time:"19:00",loc:"Yemekhane — Akşam",sub:"Aşçı ile hamur kültürü",who:"asci",
text:`Mehmet Usta bugün baklava yapıyor. Hamur açıyor, tereyağı sürüyor.\n\n"${n}, gel yardım et. Gemide baklava yapmak şart mı? Değil. Ama mürettebat moralini ayakta tutar. Ben 25 yıldır gemideyim. Herkes 'aşçı önemsiz' der. Ama mutfak kötüyse gemi kötüdür."`,
choices:[
{text:"Yardım et, hamur aç",tag:"sosyal",effect:{sayginlik:10,dinclik:5}},
{text:"Sohbet et, Mehmet Usta'nın denizcilik gözlemlerini dinle",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"Gülerek otur, izle",tag:"itaatkar",effect:{sayginlik:7,dinclik:5}}]},

{id:"s56",gfx:"storm",alert:false,day:"Gün 6",time:"08:00",loc:"Güverte — Fırtına Sonrası Kontrol",sub:"Her şey yerli yerinde mi?",who:"lostromo",
text:`Fırtına geçti. Lostromo güverte turuna çıktı, ${n}'yi yanına aldı.\n\n"Fırtına sonrası kontrol rutini. Her halat, her bağlantı, her kapak. Hasarlı varsa not et.\n\nSen kıç tarafını al."`,
choices:[
{text:"Listeyi al, her noktayı titizce kontrol et",tag:"akilli",effect:{bilgi:10,sayginlik:10,dinclik:-5}},
{text:"Lostromo ile birlikte git, gözlemle",tag:"itaatkar",effect:{bilgi:8,sayginlik:7}},
{text:"'Her şey tamam görünüyor' diyip hızlıca geç",tag:"korkak",effect:{sayginlik:-8,bilgi:-5}}]},

{id:"s57",gfx:"sea",alert:false,day:"Gün 11",time:"14:00",loc:"Açık Deniz — Öğleden Sonra",sub:"2. Başmakinist ile karşılaşma",who:"bas2",
text:`2. Başmakinist Serdar Bey güverte geçidinde seni durdurdu.\n\n"${n}, bir hafta daha geçtik. Makine odasından söylemeliyim — sen güverte stajyeri olarak en meraklısıydın.\n\nSana şunu sorayım: Eğer makine dairesi kariyeri düşünsen, başlangıç noktası ne olurdu?"`,
choices:[
{text:"'Yağcı olarak başlardım, sistemi temelden öğrenirim' de",tag:"akilli",effect:{bilgi:10,sayginlik:10}},
{text:"'Güverte daha ilgimi çekiyor ama teşekkürler' de",tag:"itaatkar",effect:{sayginlik:7}},
{text:"'Hem güverte hem makineyi öğrenmek istiyorum' de",tag:"sosyal",effect:{sayginlik:10,bilgi:8}}]},

{id:"s58",gfx:"bridge",alert:false,day:"Gün 12",time:"09:00",loc:"Köprüüstü — Sabah Brifing",sub:"Süvari ile liderlik dersi",who:"suvari",
text:`Süvari sabah brifinginde mürettebata döndü:\n\n"Bir süvari gemide en yalnız insandır. Her karar ona aittir. Başarı mürettebatın, hata süvarinin."\n\nSonra ${n}'ye baktı:\n"Sen bunu anlamak için erken. Ama düşün: Bir stajyer en fazla neyle katkı sağlar?"`,
choices:[
{text:"'Sormak — her şeyi sormak' de",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"'İş yapmak — öğrenmek için çalışmak' de",tag:"cesur",effect:{cesaret:5,sayginlik:8}},
{text:"'Hata yapmak ve öğrenmek' de",tag:"sosyal",effect:{sayginlik:10,bilgi:5}}]},

{id:"s59",gfx:"sea",alert:false,day:"Gün 2",time:"16:00",loc:"Pruva Güverte — Açık Deniz",sub:"İlk açık deniz hissi",who:"anlatici",
text:`Gemi açık denize çıktı. Kıyılar artık görünmüyor.\n\nSadece su. Her yanda. Ufuk her yönde eşit.\n\nBu his — sonsuzluk hissi — ilk kez görenin içini ürpertir. Küçüklük hissi. Ama bir yandan da özgürlük.\n\nNe hissediyorsun?`,
choices:[
{text:"Pruvaya git, rüzgarı hisset",tag:"cesur",effect:{cesaret:8,dinclik:5}},
{text:"Not defterini aç, bu anı yaz",tag:"akilli",effect:{bilgi:5,sayginlik:3}},
{text:"Görevi kontrol et — hissedecek vakit yok",tag:"itaatkar",effect:{sayginlik:5,bilgi:3}}]},

{id:"s60",gfx:"cargo",alert:false,day:"Gün 8",time:"10:00",loc:"Yük Sahası — Stowage Planı",sub:"Konteyner ağırlık dengesi hesabı",who:"z1",
text:`1. Zabiti stowage planını açtı:\n\n"${n}, bu gemide 340 konteyner var. Ağır olanlar altta, hafifler üste. Ama sorun: Şu 3 ağır konteyner son anda eklendi, sancak tarafa konuldu.\n\nGemi hafif sancak yatık. Trim hesabı yap — güvenli mi?"`,
choices:[
{text:"Hesabı yap: GM değeri, serbest yüzey, baş/kıç farkı",tag:"akilli",effect:{bilgi:15,sayginlik:12}},
{text:"'Süvari bilmeli, bildir' de",tag:"itaatkar",effect:{sayginlik:7,bilgi:5}},
{text:"'Hafif yatış normal' de",tag:"korkak",effect:{sayginlik:-8,bilgi:-5}}]},

{id:"s61",gfx:"harbor",alert:false,day:"Gün 1",time:"11:00",loc:"İzmir Limanı — Limancı Ofisi",sub:"ISPS güvenlik kodu — giriş prosedürü",who:"z3",
text:`3. Zabiti ${n}'yi limancı ofisine götürdü:\n\n"ISPS kodu. Her gemi Güvenlik Düzeyi 1, 2 veya 3'te çalışır. Şu an Düzey 1 — normal. Düzey 3 acil durum demek.\n\nSen stajyer olarak hangi ISPS belgesini taşımalısın?"`,
choices:[
{text:"'Continuous Synopsis Record ve SSAS bilinci' de",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Bilmiyorum, öğretir misiniz?' de",tag:"itaatkar",effect:{bilgi:8,sayginlik:5}},
{text:"'Kimlik belgen yeterli değil mi?' de",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"s62",gfx:"night",alert:false,day:"Gün 5",time:"00:30",loc:"Köprüüstü — Gece Yarısı",sub:"Lostromo ile tuhaf bir gece",who:"lostromo",
text:`Lostromo gece nöbet devrini yaparken köprüde durdu.\n\n"${n}. Uyku yok mu?"\n\nOturdu yanına. Denize baktı.\n\n"Ben bu gemide 14 yıldır çalışıyorum. İlk gece nöbetimde sana ne söyleseydim? Deniz seni test eder. Her zaman. Geçmek zorunda değilsin — ama dürüst olmak zorundasın."`,
choices:[
{text:"Sessizce dinle — bu anı hisset",tag:"sosyal",effect:{sayginlik:10,dinclik:5}},
{text:"'Siz geçtiniz mi tüm testleri?' diye sor",tag:"cesur",effect:{sayginlik:8,bilgi:5,cesaret:5}},
{text:"'Teşekkürler' de ve göreve dön",tag:"itaatkar",effect:{sayginlik:7}}]},

{id:"s63",gfx:"compass",alert:false,day:"Gün 10",time:"15:00",loc:"Köprüüstü — GMDSS Testi",sub:"Telsiz güvenlik sistemi test",who:"z3",
text:`3. Zabiti ${n}'ye GMDSS panelini gösterdi:\n\n"Global Maritime Distress and Safety System. Bu cihaz kaza anında otomatik distress sinyali gönderir.\n\nTest günü — sinyali test modunda çalıştır. Adım adım."`,
choices:[
{text:"Test prosedürünü oku, adım adım uygula",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"3. Zabiti'nin yapmasını izle, not al",tag:"itaatkar",effect:{bilgi:10,sayginlik:7}},
{text:"'Yanlış yaparım, siz yapın' de",tag:"korkak",effect:{sayginlik:-8,cesaret:-5}}]},

{id:"s64",gfx:"engine_fault",alert:true,day:"Gün 9",time:"22:00",loc:"Makine Dairesi — Gece Arızası",sub:"Jeneratör 2 devre dışı — yük transferi",who:"bas2",
text:`Gece 22:00. Alarm çaldı.\n\n2. Başmakinist acil radyoda:\n"Jeneratör 2 arıza! Otomatik transfer başarısız. Jeneratör 1'e manuel yük transferi yapıyorum.\n\n${n} makine odasına — gözlemle ve log tut!"`,
choices:[
{text:"Hemen in, log defterini al, her adımı kaydet",tag:"kritik",effect:{bilgi:14,sayginlik:12,cesaret:8}},
{text:"Köprüdeki 2. Zabiti'yi bilgilendir önce",tag:"akilli",effect:{bilgi:8,sayginlik:10}},
{text:"Alarm kesilene kadar bekle",tag:"korkak",effect:{sayginlik:-10,cesaret:-8}}]},

{id:"s66",gfx:"bridge",alert:false,day:"Gün 4",time:"20:30",loc:"Köprüüstü — Vardiya Devri",sub:"STCW vardiya tutma standartları",who:"z2",
text:`2. Zabiti vardiya devrine hazırlanıyor.\n\n"${n}, STCW sadece diploma işi değil. Vardiya devri eksiksiz bilgi devridir: rota, trafik, hava, arıza, görüş, alarm, seyir cihazları.\n\nŞimdi bana devri sen yapacakmış gibi kısa bir özet ver."`,
choices:[
{text:"Rota, trafik, hava, ekipman ve açık riskleri sırayla özetle",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Her şey normal' diyerek kısa kes",tag:"korkak",effect:{bilgi:-6,sayginlik:-8}},
{text:"Önce bilmediklerini söyle, sonra notlardan devret",tag:"itaatkar",effect:{bilgi:9,sayginlik:7}}]},

{id:"s67",gfx:"harbor",alert:false,day:"Gün 6",time:"09:30",loc:"Serdümen Güvertesi — Borda Hattı",sub:"LOADLINE ve Plimsoll işareti",who:"z1",
text:`1. Zabiti seni sancak bordaya götürdü.\n\n"Şu daire ve çizgiler var ya, Plimsoll mark. LOADLINE Sözleşmesi burada can bulur.\n\nYaz yükleme hattı ayrı, tropik ayrı, kış ayrı. Deniz suyu yoğunluğu ve mevsim fark eder.\n\nLiman memuru birazdan sorarsa ne dersin?"`,
choices:[
{text:"'Geminin serbest bordasını ve mevsimsel güvenli yükleme sınırını gösterir' de",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"'Aşırı yüklemeyi önler' de — kısa ama doğru",tag:"itaatkar",effect:{bilgi:8,sayginlik:6}},
{text:"'Sadece boya işareti' de",tag:"korkak",effect:{bilgi:-8,sayginlik:-8}}]},

{id:"s68",gfx:"engine",alert:false,day:"Gün 8",time:"13:30",loc:"Makine Kontrol Odası — Bunker Planı",sub:"BUNKERS 2001 ve yakıt kirliliği sorumluluğu",who:"carkci",
text:`Çarkçıbaşı bir dosya açtı.\n\n"${n}, bunker spill olursa sadece temizlik yapmayız; hukuki sorumluluk da doğar. BUNKERS Sözleşmesi tam burada devreye girer.\n\nŞirket sigortası, P&I bildirimi, liman otoritesi raporu. Bir damla denize gitse tutanak tutulur.\n\nİlk refleksin ne olur?"`,
choices:[
{text:"Sızıntıyı durdur, SOPEP prosedürünü aç, zabit ve makineyi aynı anda haberdar et",tag:"kritik",effect:{bilgi:15,sayginlik:12,cesaret:6}},
{text:"Önce fotoğraf çeker, sonra birine söylerim",tag:"korkak",effect:{bilgi:-5,sayginlik:-10}},
{text:"Amire sorar, adım adım ilerlerim",tag:"itaatkar",effect:{bilgi:8,sayginlik:7}}]},

{id:"s69",gfx:"cargo",alert:false,day:"Gün 11",time:"09:00",loc:"Liman — Kuru Havuz Planı",sub:"AFS ve karina boyası kuralları",who:"suvari",
text:`Süvari kuru havuz planına baktı.\n\n"Bu sefer sonunda karina boyası yenilenecek. Eskiden kimi boyalarda zararlı organotin vardı; şimdi AFS bunu sınırlandırıyor.\n\nBir boya sadece iyi tuttu diye kullanılmaz. Mevzuata da uygun olacak.\n\nTedarikçi sana 'eski stok ucuz boya' önerse ne dersin?"`,
choices:[
{text:"AFS uygunluk sertifikasını ve teknik veri sayfasını isterim",tag:"akilli",effect:{bilgi:14,sayginlik:10}},
{text:"Ucuzsa şirket karar verir der geçerim",tag:"korkak",effect:{bilgi:-6,sayginlik:-7}},
{text:"Önce 1. Zabiti ve teknik ofisi bilgilendiririm",tag:"itaatkar",effect:{bilgi:8,sayginlik:7}}]},

{id:"s70",gfx:"bridge",alert:false,day:"Gün 9",time:"15:00",loc:"Süvari Kamarası — Evrak Masası",sub:"Charter Party ve işletme modeli",who:"suvari",
text:`Süvari masadaki dosyaları gösterdi.\n\n"Denizde sadece seyir yok; kontrat da var. Time Charter, Voyage Charter, Bareboat Charter farklı şeyler.\n\nTime Charter'da ticari emir charterer'dan gelir ama geminin nautik emniyeti yine kaptandadır. Bareboat'ta işletme neredeyse tamamen kiracıya geçer.\n\nSana soruyorum: hangisinde ticari kontrol daha yoğundur?"`,
choices:[
{text:"Time Charter ile Bareboat farkını açıklayıp Bareboat'ta işletme kontrolünün çok daha geniş olduğunu söyle",tag:"akilli",effect:{bilgi:15,sayginlik:10}},
{text:"'Hepsi aynı kiralama' de",tag:"korkak",effect:{bilgi:-8,sayginlik:-8}},
{text:"Voyage ile Time Charter'ın yük ve rota etkisini ayırarak cevap ver",tag:"cesur",effect:{bilgi:10,sayginlik:8,cesaret:4}}]},

{id:"s71",gfx:"bogaz",alert:false,day:"Gün 6",time:"12:00",loc:"İstanbul Boğazı — Transit",sub:"Montreux ve boğaz geçiş rejimi",who:"z2",
text:`2. Zabiti boğaz geçiş evraklarını kapattı.\n\n"Montreux deyince herkes savaş gemisini hatırlar. Ama ticaret gemileri için de geçiş rejiminin omurgası odur. Bildirim, pilotaj uygulaması, trafik düzeni, egemenlik alanı.\n\nPeki bu bizim günlük işimize nasıl yansır?"`,
choices:[
{text:"'Boğaz geçişinde yerel trafik rejimine ve otorite talimatlarına uymamızı gerektirir' de",tag:"akilli",effect:{bilgi:13,sayginlik:10}},
{text:"'Sadece askeri gemileri ilgilendirir' de",tag:"korkak",effect:{bilgi:-7,sayginlik:-7}},
{text:"'Ticaret gemisi olarak serbest geçiş hakkımız var ama emniyet düzeni devam eder' de",tag:"itaatkar",effect:{bilgi:9,sayginlik:7}}]},

{id:"s72",gfx:"harbor",alert:false,day:"Gün 10",time:"08:30",loc:"Ro-Ro Terminali Yanı",sub:"Atina Sözleşmesi ve yolcu bagaj sorumluluğu",who:"z3",
text:`Limanın yan iskelesinde bir yolcu feribotu yanaşıyor. 3. Zabiti sana işaret etti.\n\n"Biz yük gemisiyiz ama deniz hukukunu parça parça öğreneceksin. Atina Sözleşmesi, yolcu ve bagaj zararında taşıyanın sorumluluğunu düzenler.\n\nFeribotta bir yolcu yaralansa veya bagajı kaybolsa mesele sadece nezaket olmaz; hukuki sorumluluk doğar.\n\nSence bu niye önemli?"`,
choices:[
{text:"Taşıyanın sorumluluğu, tazminat ve yolcu haklarını belirlediği için de",tag:"akilli",effect:{bilgi:12,sayginlik:9}},
{text:"'Yolcu gemilerini ilgilendirir, bize uzak' de",tag:"korkak",effect:{bilgi:-5,sayginlik:-4}},
{text:"'Farklı gemi tiplerinde farklı hukuk rejimlerini bilmek denizciyi güçlendirir' de",tag:"sosyal",effect:{bilgi:9,sayginlik:9}}]},

{id:"s73",gfx:"bridge",alert:false,day:"Gün 11",time:"18:00",loc:"Köprüüstü — Akşam Brifingi",sub:"SOLAS ve ISM ilişkisi",who:"suvari",
text:`Süvari akşam brifinginde gemi klasörünü açtı.\n\n"SOLAS sana neyi yapman gerektiğini söyler; ISM ise bunun gemide nasıl yönetileceğini düzene koyar. Checklist, raporlama, near-miss, iç tetkik, emniyet kültürü.\n\nBir emniyet aksaklığı gördüğünde susmak mı sadakat, bildirmek mi profesyonellik?"`,
choices:[
{text:"Bildirmek profesyonelliktir; emniyet yönetimi sessizlikle yürümez de",tag:"kritik",effect:{bilgi:14,sayginlik:12,cesaret:7}},
{text:"Önce arkadaşını korumak gerekir de",tag:"korkak",effect:{bilgi:-7,sayginlik:-8}},
{text:"Önce amire söyler, prosedürle ilerlerim de",tag:"itaatkar",effect:{bilgi:8,sayginlik:8}}]},

{id:"s65",gfx:"sea",alert:false,day:"Gün 13",time:"10:00",loc:"Açık Deniz — Son Seyir",sub:"Silici ile veda sohbeti",who:"silici",
text:`Silici Ramazan güverteyi son kez siliyordu.\n\n"${n}, yarın İzmir'e giriyoruz. Sen de ineceksin.\n\nSana şunu söyleyeyim: Gemide en zor şey ayrılmak. Her seferinde yeni insanlar, yeni gemi. Ama bir şey değişmez — deniz aynı deniz.\n\nTekrar gelecek misin?"`,
choices:[
{text:"'Evet, kesinlikle' de — kararın açık",tag:"cesur",effect:{cesaret:8,sayginlik:10}},
{text:"'Henüz bilmiyorum ama bu yolculuk beni etkiledi' de",tag:"akilli",effect:{sayginlik:8,bilgi:5}},
{text:"Gülerek 'Bakacağız' de",tag:"sosyal",effect:{sayginlik:7}}]},

{id:"kriz16",gfx:"storm",alert:true,day:"Gün 7",time:"05:00",loc:"Güverte — Fırtınada Halat Kopması",sub:"Beaufort 10 — güverte halatı koptu",who:"lostromo",
text:`Fırtına doruk noktasında. Lostromo radyoda:\n\n"Pruva sol bağlantı halatı koptu! Konteyner kayma riski var. Güverteye çıkmak yasak ama müdahale şart.\n\n${n} — sen emniyet halatın var. Gönüllü var mı?"\n\nSessizlik.`,
choices:[
{text:"'Ben giderim' — emniyet halatını tak, güverteye çık",tag:"kritik",effect:{cesaret:18,sayginlik:15,dinclik:-15}},
{text:"'Deneyimli birisi gitmeli' de — haklısın",tag:"akilli",effect:{sayginlik:5,cesaret:-3}},
{text:"Gözleri kaçır",tag:"korkak",effect:{sayginlik:-15,cesaret:-12}}]},

{id:"kriz17",gfx:"bogaz",alert:true,day:"Gün 5",time:"14:00",loc:"İstanbul Boğazı — Karşıdan Gemi",sub:"VHF iletişimi — çarpışma riski",who:"suvari",
text:`İstanbul Boğazı, en dar nokta. Karşıdan büyük tanker geliyor.\n\nSüvari:\n"Dar kanal. COLREG 9 unutulmayacak: sancak sınırına yakın kal, geçişi engelleme. Tanker VHF 16'dan çağırıyor — İngilizce konuşuyor. Radyoya kim girecek?"\n\nHerkes sessiz. Süvari ${n}'ye baktı.`,
choices:[
{text:"'Ben girerim' — radyoya atla, İngilizce konuş",tag:"kritik",effect:{cesaret:15,sayginlik:15,bilgi:8}},
{text:"'İngilizcem yeterli değil' de — dürüst",tag:"itaatkar",effect:{sayginlik:3,cesaret:-5}},
{text:"Süvariye yardım teklif et, o konuşsun",tag:"akilli",effect:{sayginlik:7,bilgi:5}}]},


{id:"kriz18",gfx:"cabin",alert:true,day:"Gün 6",time:"02:00",loc:"Tayfa Kabini — ACİL",sub:"Tayfa Musa ciddi hastalandı — gemi doktoru yok",who:"musa",
text:`Gece 02:00. Kapı çalındı.\n\nTayfa Musa yatakta, yüzü sarı, ateş 39.5.\n\n3. Zabiti:\n"${n}, sen ilk yardım eğitimi gördün. Şüpheli karın ağrısı — apandisit olabilir. En yakın liman 18 saat. Köprüyle radyo bağlantısı var.\n\nSen ne yaparsın?"`,
choices:[
{text:"Vital bulguları al, köprüdeki tıbbi kit prosedürünü aç, radyoyla kıyı doktorunu ara",tag:"kritik",effect:{cesaret:12,sayginlik:15,bilgi:10}},
{text:"3. Zabiti'yi ara, o halletsin",tag:"itaatkar",effect:{sayginlik:5,bilgi:5}},
{text:"Ateş düşürücü ver ve bekle",tag:"korkak",effect:{sayginlik:-5,bilgi:-3}}]},

{id:"kriz19",gfx:"cargo",alert:true,day:"Gün 5",time:"16:30",loc:"Ambar 2 — Kaçak Yolcu",sub:"Ambarda insan bulundu — ISPS ihlali",who:"z1",
text:`Güverte turu sırasında Tayfa Hasan ambarda birini buldu.\n\nGenç bir adam — Suriyeli, İngilizce bilmiyor. Korkmuş, aç.\n\n1. Zabiti:\n"${n}, sen ISPS eğitimini gördün. Prosedür nedir? Süvariyi habersiz bırakamayız — bu uluslararası suç."`,
choices:[
{text:"Süvariyi ve 1. Zabiti'yi haber ver, ISPS protokolünü başlat",tag:"akilli",effect:{bilgi:14,sayginlik:12,cesaret:5}},
{text:"Adamı önce dinle, sonra karar ver",tag:"sosyal",effect:{sayginlik:8,bilgi:5}},
{text:"Görmedim de, devam et",tag:"korkak",effect:{sayginlik:-15,bilgi:-8}}]},

{id:"kriz20",gfx:"engine",alert:true,day:"Gün 9",time:"08:00",loc:"Köprüüstü — Yakıt Krizi",sub:"Yakıt hesabı yanlış — en yakın limana?",who:"suvari",
text:`Süvari sesi gergin:\n\n"Yakıt hesabı hatası. Mevcut yakıt planlanan rotayı tamamlamaya yetmeyecek — 340 ton açık var.\n\nİki seçenek: Cenova'yı atlayıp doğrudan Barselona'ya git, yakıt al. Ya da Cenova'ya git ama hız düşür — %60 güçte.\n\n${n}, sen ne düşünürsün?"`,
choices:[
{text:"'Her iki rotanın yakıt hesabını yapayım, rakamla konuşalım' de",tag:"akilli",effect:{bilgi:15,sayginlik:12}},
{text:"'Cenova'yı atlayalım, güvenli' de",tag:"cesur",effect:{cesaret:5,sayginlik:5}},
{text:"'Süvari bilir en iyisini' de",tag:"korkak",effect:{sayginlik:-5,cesaret:-3}}]},

{id:"kriz21",gfx:"storm",alert:true,day:"Gün 7",time:"13:00",loc:"Ambar 3 — Yük Kayması",sub:"Fırtınada ağır konteynerler kaydı — dengesizlik",who:"z1",
text:`Fırtına sırasında alarm çaldı.\n\n1. Zabiti:\n"Ambar 3'te yük kayması! Gemi 8 derece sancak yatık. Dengesizlik artarsa devrilme riski var.\n\nKarşı tarafa balast suyu basıyoruz — ama ambar 3'ün kapısını da kontrol etmek lazım.\n\n${n}! Seninle gidiyorum. Hazır mısın?"`,
choices:[
{text:"'Hazırım' — emniyet halatını tak ve git",tag:"kritik",effect:{cesaret:15,sayginlik:15,dinclik:-12}},
{text:"'Deneyimli biri daha güvenli' de",tag:"akilli",effect:{sayginlik:3,cesaret:-5}},
{text:"Git ama eline geçen şeyi tut",tag:"cesur",effect:{cesaret:10,sayginlik:8,dinclik:-8}}]},

{id:"kriz22",gfx:"sea",alert:true,day:"Gün 10",time:"07:30",loc:"Açık Deniz — SOS Kurtarma",sub:"Yakın mesafede SOS — küçük tekne",who:"suvari",
text:`Radar alarm verdi. SOS sinyali: 3.2 mil güneyde.\n\nSüvari radarı inceledi:\n"Küçük tekne — 8 metrelik yelkenli. DSC sinyali sürüyor.\n\nBölgeye gittiğimizde tahminen 45 dakika gecikiriz. Şirket onayı lazım ama hayat tehlikesi öncelikli.\n\n${n}, şu an VHF'desin. Deniz Kuvvetleri'ni ara."`,
choices:[
{text:"VHF'ye atla: 'SECURITE — SAR kurtarma olayı, koordinatlar...' de",tag:"kritik",effect:{cesaret:15,sayginlik:15,bilgi:10}},
{text:"Süvariyi kaptana bağla, o konuşsun",tag:"itaatkar",effect:{sayginlik:5,bilgi:5}},
{text:"Sahil güvenlik zaten duymuştur diye devam et",tag:"korkak",effect:{sayginlik:-15,cesaret:-10}}]},

{id:"FINAL",gfx:"bridge",alert:false,day:"Son Gün",time:"15:00",loc:"Konferans Salonu",sub:"Staj değerlendirme — kontrat sona erdi",who:"z1",
text:`Son değerlendirme toplantısı.\n\n1. Zabiti, 2. Zabiti, Lostromo. Önlerinde staj formu.\n\n"${n}. ${yr} yılında, ${sn}'de. Fırtına, yük denetimi, gece nöbetleri, yangın tatbikatı, liman operasyonları, krizler.\n\nRaporun birinci satırına ne yazayım?"`,
choices:[
{text:"'Öğrenmeye hazır bir denizci' — alçakgönüllü",tag:"akilli",effect:{bilgi:10,sayginlik:15},next:'end'},
{text:"'Bu hayatı seçiyorum — her zorluğuyla'",tag:"cesur",effect:{cesaret:15,sayginlik:12},next:'end'},
{text:"'Henüz tam emin değilim ama devam edeceğim'",tag:"itaatkar",effect:{sayginlik:8,bilgi:5},next:'end'}]},
  ];
}

// ===== KONTRAT SİSTEMİ =====
const KONTRAT_DEFS={
  kuru:[{ay:6,izin:1,ucret:"Orta",bonus:"Kuru yük sertifikası"},{ay:9,izin:2,ucret:"Orta+",bonus:"Uzun seyir tecrübesi"}],
  tanker:[{ay:4,izin:1,ucret:"Yüksek",bonus:"Tanker sertifikası (OOW)"},{ay:6,izin:1,ucret:"Yüksek+",bonus:"MARPOL uzmanlığı"}],
  kont:[{ay:4,izin:1,ucret:"Yüksek",bonus:"Hızlı lojistik deneyimi"},{ay:6,izin:2,ucret:"Çok Yüksek",bonus:"Konteyner planlaması"}],
  roro:[{ay:3,izin:1,ucret:"Orta",bonus:"Araç operasyon sertifikası"},{ay:5,izin:1,ucret:"Orta+",bonus:"Trim uzmanlığı"}],
  bulk:[{ay:6,izin:2,ucret:"Orta",bonus:"Dökme yük sertifikası"},{ay:9,izin:2,ucret:"Orta+",bonus:"Trim ve stabilite"}],
  lng:[{ay:4,izin:1,ucret:"Çok Yüksek",bonus:"IGF temel sertifikası"},{ay:6,izin:2,ucret:"Maksimum",bonus:"LNG uzman sertifikası"}],
};

// ===== OYUN DEĞİŞKENLERİ =====
let pn="Stajyer", sn="M/V Ege Meltem";
let selYear=2018, selType="kuru", selKontrat=0;
let stats={cesaret:40,bilgi:22,sayginlik:32,dinclik:68};
let scenes=[], currentIdx=0, choicesMade=[];
let contractDays=0, contractTotal=6;
let sceneQueue=[], usedScenes=new Set();
const DIFFICULTY={
  positiveGainMult:0.72,
  negativeLossMult:1.18,
  highStatThreshold:70,
  extremeStatThreshold:85,
  highStatGainMult:0.55,
  extremeStatGainMult:0.5,
  passiveFatigue:2,
  periodicStressEvery:5,
  periodicStressLoss:1,
};
const SYSTEM_STATE={
  consecutiveMistakes:0,
  totalMistakes:0,
  hiddenFailures:{bridge:0,deck:0,engine:0,compliance:0},
  triggeredChains:new Set(),
};
const tagL={cesur:"Cesur",akilli:"Akıllı",itaatkar:"İtaatkar",korkak:"Korkak",sosyal:"Sosyal",kritik:"KRİTİK"};

// ===== GİRİŞ EKRANI =====
function buildIntro(){
  // Yıl seçimi
  const ys=document.getElementById('yearsel');
  YEARS.forEach(y=>{
    const d=document.createElement('div');
    d.className='ysel'+(y.year===selYear?' active':'');
    d.innerHTML=`<div class="ys-yr">${y.year}</div><div class="ys-era">${y.era}</div>`;
    d.onclick=()=>{selYear=y.year;document.querySelectorAll('.ysel').forEach(x=>x.classList.remove('active'));d.classList.add('active');};
    ys.appendChild(d);
  });
  // Gemi türü
  const st=document.getElementById('shiptype');
  STYPES.forEach(t=>{
    const konts=KONTRAT_DEFS[t.key]||[];
    const kontStr=konts.map(k=>`${k.ay}+1`).join(' / ');
    const d=document.createElement('div');
    d.className='selb'+(t.key===selType?' active':'');
    d.innerHTML=`<span class="sb-ico">${t.ico}</span><span class="sb-nm">${t.nm}</span><span class="sb-kont">${kontStr} ay</span>`;
    d.onclick=()=>{selType=t.key;document.querySelectorAll('.selb').forEach(x=>x.classList.remove('active'));d.classList.add('active');updateKontrat();updateSugs();};
    st.appendChild(d);
  });
  updateKontrat();
  updateSugs();
}

function updateKontrat(){
  const konts=KONTRAT_DEFS[selType]||[];
  const c=document.getElementById('kontratsel');
  c.innerHTML='';
  konts.forEach((k,i)=>{
    const d=document.createElement('div');
    d.className='kont-card'+(i===selKontrat?' active':'');
    d.innerHTML=`<div class="kc-ay">${k.ay}+1</div><div class="kc-lbl">ay seyir + ${k.izin} ay izin</div><div class="kc-ucret">Ücret: ${k.ucret}</div><div class="kc-izin">✓ ${k.bonus}</div>`;
    d.onclick=()=>{selKontrat=i;document.querySelectorAll('.kont-card').forEach(x=>x.classList.remove('active'));d.classList.add('active');};
    c.appendChild(d);
  });
}

function updateSugs(){
  const names=SNAMES[selType]||[];
  const c=document.getElementById('shipsugs');c.innerHTML='';
  names.forEach(n=>{const d=document.createElement('div');d.className='ssug';d.textContent=n;d.onclick=()=>{document.getElementById('shipnameinp').value=n;};c.appendChild(d);});
  if(!document.getElementById('shipnameinp').value||!names.includes(document.getElementById('shipnameinp').value))
    document.getElementById('shipnameinp').value=names[0]||'';
}

// ===== STAT YÖNETİMİ =====
function clamp(v){return Math.min(100,Math.max(0,Math.round(v)));}

function tuneDelta(key,current,delta){
  if(delta===0) return 0;
  if(delta>0){
    let mult=DIFFICULTY.positiveGainMult;
    if(current>=DIFFICULTY.highStatThreshold) mult*=DIFFICULTY.highStatGainMult;
    if(current>=DIFFICULTY.extremeStatThreshold) mult*=DIFFICULTY.extremeStatGainMult;
    if(key==='dinclik') mult*=0.8;
    return Math.max(1,Math.round(delta*mult));
  }
  let mult=DIFFICULTY.negativeLossMult;
  if(key==='dinclik') mult+=0.07;
  return Math.min(-1,Math.round(delta*mult));
}

function addEffectDelta(effect,key,delta){
  if(!delta) return;
  effect[key]=(effect[key]||0)+delta;
}

function getSceneDomain(sc){
  const blob=`${sc.gfx||''} ${sc.loc||''} ${sc.sub||''} ${sc.who||''}`.toLowerCase();
  if(/engine|makine|carkci|bas2|yagci/.test(blob)) return 'engine';
  if(/solas|marpol|stcw|loadline|bunker|bunkers|afs|atina|montreux|charter|isps|gmdss|compliance/.test(blob)) return 'compliance';
  if(/bridge|radar|compass|bogaz|tss|köprü|kopru|vhf|night/.test(blob)) return 'bridge';
  return 'deck';
}

function evaluateDecisionPressure(sc,c2){
  const extra={};
  const notes=[];
  const tag=c2.tag||'akilli';
  const domain=getSceneDomain(sc);
  const isMistake=tag==='korkak';

  if(isMistake){
    SYSTEM_STATE.consecutiveMistakes++;
    SYSTEM_STATE.totalMistakes++;
    SYSTEM_STATE.hiddenFailures[domain]=(SYSTEM_STATE.hiddenFailures[domain]||0)+1;
  }else{
    if(tag==='akilli'||tag==='kritik') SYSTEM_STATE.consecutiveMistakes=0;
    if(tag==='cesur') SYSTEM_STATE.consecutiveMistakes=Math.max(0,SYSTEM_STATE.consecutiveMistakes-1);
    SYSTEM_STATE.hiddenFailures[domain]=Math.max(0,(SYSTEM_STATE.hiddenFailures[domain]||0)-(tag==='kritik'?2:1));
  }

  if(SYSTEM_STATE.consecutiveMistakes>=2){
    addEffectDelta(extra,'sayginlik',-2);
    notes.push('Ayni tip hatalar ekipte guven asindirdi.');
  }
  if(SYSTEM_STATE.consecutiveMistakes>=3){
    addEffectDelta(extra,'dinclik',-3);
    addEffectDelta(extra,'bilgi',-1);
    notes.push('Ust uste hatalar baski ve dalginlik yaratti.');
  }

  const hiddenLevel=SYSTEM_STATE.hiddenFailures[domain]||0;
  const warnKey=`${domain}-warn`;
  const breakKey=`${domain}-break`;
  if(hiddenLevel>=3&&!SYSTEM_STATE.triggeredChains.has(warnKey)){
    SYSTEM_STATE.triggeredChains.add(warnKey);
    addEffectDelta(extra,'sayginlik',-2);
    notes.push('Gorunmeyen kucuk hatalar birikmeye basladi.');
  }
  if(hiddenLevel>=5&&!SYSTEM_STATE.triggeredChains.has(breakKey)){
    SYSTEM_STATE.triggeredChains.add(breakKey);
    addEffectDelta(extra,'bilgi',-2);
    addEffectDelta(extra,'dinclik',-4);
    notes.push('Gizli basarisizlik zinciri patladi; ekip seni daha yakin izliyor.');
  }

  if(stats.cesaret>=78&&tag==='cesur'){
    addEffectDelta(extra,'dinclik',-4);
    addEffectDelta(extra,'sayginlik',-2);
    notes.push('Yuksek cesaret kontrolsuz riske kaydi.');
  }
  if(stats.sayginlik>=78&&(tag==='sosyal'||tag==='itaatkar')){
    addEffectDelta(extra,'dinclik',-3);
    notes.push('Herkese yetismeye calismak seni yipratiyor.');
  }
  if(stats.bilgi>=82&&(tag==='akilli'||tag==='kritik')){
    addEffectDelta(extra,'cesaret',-2);
    addEffectDelta(extra,'sayginlik',-1);
    notes.push('Asiri analiz karar hizini dusurdu.');
  }

  return {extra,notes};
}

function applyEffect(e){
  const old={...stats};
  Object.keys(e).forEach(k=>{
    if(k==='yorgunluk'){
      const tuned=tuneDelta('dinclik',stats.dinclik,-e[k]); // yorgunluk artarsa dinclik azalir
      stats.dinclik=clamp(stats.dinclik+tuned);
    }
    else if(k==='dinclik'){
      const tuned=tuneDelta('dinclik',stats.dinclik,e[k]);
      stats.dinclik=clamp(stats.dinclik+tuned);
    }
    else if(stats[k]!==undefined){
      const tuned=tuneDelta(k,stats[k],e[k]);
      stats[k]=clamp(stats[k]+tuned);
    }
  });
  stats.dinclik=clamp(stats.dinclik-DIFFICULTY.passiveFatigue);
  if(choicesMade.length>0&&choicesMade.length%DIFFICULTY.periodicStressEvery===0){
    stats.sayginlik=clamp(stats.sayginlik-DIFFICULTY.periodicStressLoss);
  }
  updateStats(old);
  // Tehlike bolgesi bildirimi
  const dangerChecks = [
    {val:stats.cesaret, name:'Cesaret', prev:old.cesaret},
    {val:stats.bilgi,   name:'Bilgi',   prev:old.bilgi},
    {val:stats.sayginlik,name:'Sayginlik',prev:old.sayginlik},
    {val:stats.dinclik, name:'Dinclik', prev:old.dinclik},
  ];
  dangerChecks.forEach(d=>{
    if(d.val<=20 && d.prev>20){
      setTimeout(()=>showNotif('!','TEHLIKE!', d.name+' kritik seviyede - '+d.val+' kaldi!'), 300);
    }
  });
  return checkCrisis();
}

function updateStats(old){
  // Tehlike bölgesi uyarısı
  const dangerStats = [
    {key:'cesaret', elId:'s-cesaret', val:stats.cesaret, name:'Cesaret'},
    {key:'bilgi',   elId:'s-bilgi',   val:stats.bilgi,   name:'Bilgi'},
    {key:'sayginlik',elId:'s-sayginlik',val:stats.sayginlik,name:'Saygınlık'},
    {key:'dinclik', elId:'s-yorgunluk',val:stats.dinclik, name:'Dinçlik'},
  ];
  dangerStats.forEach(d=>{
    const el = document.getElementById(d.elId);
    if(!el) return;
    if(d.val<=20 && d.val>0){
      el.style.animation='fls .6s ease-in-out infinite';
      el.style.color='#ff4444';
    } else {
      el.style.animation='';
    }
  });
  ['cesaret','bilgi','sayginlik'].forEach(k=>{
    const el=document.getElementById('s-'+k);
    const v=Math.round(stats[k]);
    el.textContent=v;
    document.getElementById('b-'+k).style.width=v+'%';
    document.getElementById('b-'+k).style.background=v>=70?'#1a7a3c':v>=40?'#c9952a':'#8b2222';
    document.getElementById('s-'+k).style.color=v>=70?'#5dbf8a':v>=40?'#d4a017':'#c97070';
    if(old&&old[k]!==stats[k]){el.classList.add('sf');setTimeout(()=>el.classList.remove('sf'),400);}
  });
  // Dinçlik (ters — yüksek = iyi)
  const dv=Math.round(stats.dinclik);
  document.getElementById('s-yorgunluk').textContent=dv;
  document.getElementById('b-yorgunluk').style.width=dv+'%';
  document.getElementById('b-yorgunluk').style.background=dv>=70?'#1a7a3c':dv>=40?'#c9952a':'#8b2222';
  document.getElementById('s-yorgunluk').style.color=dv>=70?'#5dbf8a':dv>=40?'#d4a017':'#c97070';

  const s=stats.sayginlik;
  document.getElementById('repstars').textContent=s>=80?'⭐⭐⭐⭐⭐':s>=60?'⭐⭐⭐⭐':s>=40?'⭐⭐⭐':s>=20?'⭐⭐':'⭐';

  // Kontrat bar
  contractDays++;
  const pct=Math.round((contractDays/contractTotal)*100);
  document.getElementById('contract-days').textContent=`${contractDays} / ${contractTotal} GÜN`;
  document.getElementById('contract-fill').style.width=Math.min(pct,100)+'%';
}

function checkCrisis(){
  // Herhangi bir stat 0'a düşünce oyun biter
  if(stats.cesaret<=0)  return 'cesaret_0';
  if(stats.bilgi<=0)    return 'bilgi_0';
  if(stats.sayginlik<=0)return 'sayginlik_0';
  if(stats.dinclik<=0)  return 'dinclik_dusuk';
  return null;
}

function showNotif(icon,title,body){
  document.getElementById('notifico').textContent=icon;
  document.getElementById('notiftt').textContent=title;
  document.getElementById('notifbd').textContent=body;
  const o=document.getElementById('notifover');
  o.classList.add('show');
  setTimeout(()=>o.classList.remove('show'),2200);
}

// ===== RASTGELE SENARYO SIRASI =====
function buildSceneQueue(pool, totalDays){
  // Zorunlu sahneler: s01 (başlangıç), FINAL (son)
  const mandatory_start = pool.filter(s=>s.id==='s01');
  const final = pool.filter(s=>s.id==='FINAL');
  const crisis_scenes = pool.filter(s=>s.id.startsWith('kriz'));
  const regular = pool.filter(s=>!s.id.startsWith('kriz')&&s.id!=='s01'&&s.id!=='FINAL');

  // Kriz sahnelerini grupla
  const crisisGroups=[
    ['kriz01','kriz02','kriz03'], // makine arızası
    ['kriz04','kriz05','kriz06'], // fırtına
    ['kriz07','kriz08','kriz09'], // boğaz
    ['kriz10','kriz11','kriz12'], // korsan
  ];

  // Rastgele 2-3 kriz grubu seç
  const shuffledGroups=[...crisisGroups].sort(()=>Math.random()-0.5);
  const selectedCrisisGroups=shuffledGroups.slice(0,Math.min(2+Math.floor(Math.random()*2),shuffledGroups.length));
  const selectedCrisis=[];
  selectedCrisisGroups.forEach(g=>{
    g.forEach(id=>{
      const sc=pool.find(s=>s.id===id);
      if(sc) selectedCrisis.push(sc);
    });
  });

  // Düzenli sahneleri karıştır ve totalDays - (başlangıç+kriz+final) kadar seç
  const shuffledRegular=[...regular].sort(()=>Math.random()-0.5);
  const needed=Math.max(5, totalDays - selectedCrisis.length - 2);
  const selectedRegular=shuffledRegular.slice(0,needed);

  // Sıralamayı oluştur: başlangıç + (karışık regular + kriz) + final
  const middle=[...selectedRegular,...selectedCrisis].sort(()=>Math.random()-0.5);

  return [...mandatory_start, ...middle, ...final];
}

// ===== SAHNE RENDER =====
function renderScene(idx){
  if(idx>='end'||currentIdx>=sceneQueue.length){showEnd();return;}
  const sc=sceneQueue[currentIdx];
  if(!sc){showEnd();return;}
  if(sc.id==='FINAL'&&currentIdx<sceneQueue.length-1){
    // Henüz son değilse atla, yoksa göster
  }

  const c=CREW[sc.who]||CREW.anlatici;
  document.getElementById('dbd').textContent=sc.day;
  document.getElementById('tbd').textContent=sc.time;
  document.getElementById('lbd').textContent=sc.loc;
  document.getElementById('scene-sub').textContent=sc.sub||'';
  document.getElementById('spkico').textContent=c.icon;
  document.getElementById('spknm').textContent=c.name;
  document.getElementById('spktl').textContent=c.title;
  document.getElementById('text').textContent=typeof sc.text==='function'?sc.text(pn,sn):sc.text;
  document.getElementById('charname').textContent=pn;
  document.getElementById('charrole').textContent='GÜV. STAJYERİ · '+sc.day.toUpperCase();
  const stObj=STYPES.find(x=>x.key===selType);
  document.getElementById('shipinfo').textContent=sn+' · '+stObj.nm+' · '+selYear;
  document.getElementById('contract-type').textContent=stObj.nm+' '+contractTotal+'+'+(KONTRAT_DEFS[selType]?.[selKontrat]?.izin||1)+'ay';

  const pct=Math.round((currentIdx/sceneQueue.length)*100);
  document.getElementById('progbar').style.width=pct+'%';
  document.getElementById('chaplbl').textContent='SAHNE '+(currentIdx+1)+'/'+sceneQueue.length;

  const ab=document.getElementById('alert-banner');
  if(sc.alert){ab.style.display='block';ab.textContent='⚠ ACİL DURUM — '+sc.sub;ab.style.color='#ffcccc';}
  else ab.style.display='none';

  const svg=document.getElementById('gfx-svg');
  svg.innerHTML=GFX[sc.gfx]||GFX.sea;

  playSceneAudio(sc);
  onSceneRender(sc);

  const ch=document.getElementById('choices');ch.innerHTML='';
  sc.choices.forEach(c2=>{
    const b=document.createElement('button');b.className='cbtn';
    b.innerHTML='<span class="ctag tag-'+(c2.tag||'akilli')+'">'+tagL[c2.tag||'akilli']+'</span>'+c2.text;
    b.onclick=()=>{
      sfxClick();
      ch.querySelectorAll('.cbtn').forEach(x=>{x.disabled=true;x.style.opacity='.4';});
      const pressure=evaluateDecisionPressure(sc,c2);
      const resolvedEffect={...(c2.effect||{})};
      Object.entries(pressure.extra).forEach(([k,v])=>{resolvedEffect[k]=(resolvedEffect[k]||0)+v;});
      choicesMade.push({tag:c2.tag,domain:getSceneDomain(sc),extraPressure:Object.keys(pressure.extra).length>0});
      applyCrewEffect(sc.who, c2.tag);
      const crisis=applyEffect(resolvedEffect);

      const pos=Object.entries(resolvedEffect).filter(([k,v])=>v>0&&k!=='yorgunluk').map(([k,v])=>'+'+v+' '+k).join(' ');
      const neg=Object.entries(resolvedEffect).filter(([k,v])=>v<0&&k!=='yorgunluk').map(([k,v])=>v+' '+k).join(' ');
      const parts=[];if(pos)parts.push(pos);if(neg)parts.push(neg);
      const icon=c2.tag==='kritik'?'!':c2.tag==='cesur'?'^':c2.tag==='akilli'?'i':'~';
      if(parts.length)showNotif(icon,'Stat degisimi',parts.join(' | '));
      if(pressure.notes.length){
        setTimeout(()=>showNotif('!','Baski Artiyor',pressure.notes[0]),900);
        addJournalEntry('[BASKI] '+pressure.notes.join(' '), sc.day, sc.time);
      }

      addJournalEntry(c2.text, sc.day, sc.time);
      const nextFn=()=>{
        if(c2.next==='end'||currentIdx>=sceneQueue.length-1){showEnd();}
        else if(crisis){showCrisis(crisis);}
        else{currentIdx++;renderScene(currentIdx);}
      };
      setTimeout(nextFn, parts.length?2200:300);
    };
    ch.appendChild(b);
  });
}

// ===== KRİZ =====
function showCrisis(key){
  stopAllMusic();sfxFail();
  document.getElementById('game').style.display='none';
  const cs=document.getElementById('crisis');cs.style.display='flex';
  const c=CRISIS_ENDS[key];
  if(!c){showEnd();return;}
  document.getElementById('crise').textContent=c.emoji;
  document.getElementById('crist').textContent=c.title;
  document.getElementById('crisx').textContent=typeof c.text==='function'?c.text(pn,sn):c.text;
  document.getElementById('criss').textContent=c.stat;
}

// ===== SON =====
function showEnd(){
  stopAllMusic();
  document.getElementById('game').style.display='none';
  document.getElementById('endscr').style.display='flex';

  const avg=(stats.cesaret+stats.bilgi+stats.sayginlik)/3;
  const cesurC=choicesMade.filter(c=>c.tag==='cesur').length;
  const kritikC=choicesMade.filter(c=>c.tag==='kritik').length;
  const stObj=STYPES.find(x=>x.key===selType);
  const kont=KONTRAT_DEFS[selType]?.[selKontrat]||{ay:6,bonus:'—'};

  let emoji,title,flavor,desc,verdict;
  if(kritikC>=2&&stats.cesaret>=60&&avg>=60){
    emoji='🛡️';title='Krizlerin Denizcisi';
    flavor=`"Bu stajyer dört krizde donmadı." — Süvari, ${selYear}`;
    desc=`${pn}, ${contractTotal} aylık ${stObj.nm} kontratında makine arızası, boğazda sürüklenme ve korsan alarmında doğru kararlar aldı.`;
    verdict=`<strong>Staj Raporu (${selYear}):</strong> Kriz yönetimi olağanüstü. ${kont.bonus} kazanıldı. İleri kademe eğitim tavsiye edilir.`;
    setTimeout(sfxSuccess,300);
  }else if(stats.sayginlik>=70&&avg>=65){
    emoji='🏆';title='Geleceğin Süvarisi';
    flavor=`"Bu stajyer 10 yıl içinde köprüye çıkar." — Süvari, ${selYear}`;
    desc=`${pn}, ${sn}'da kendini kanıtladı. Mürettebat seninle gurur duyuyor.`;
    verdict=`<strong>Staj Raporu (${selYear}):</strong> Teknik bilgi üstün. Mürettebat uyumu mükemmel. ${kont.bonus} kazanıldı.`;
    setTimeout(sfxSuccess,300);
  }else if(stats.bilgi>=65&&avg>=55){
    emoji='🧭';title='Yetenekli Denizci';
    flavor=`"Teknik kafası güçlü." — 1. Zabiti`;
    desc=`${pn} bilgi konusunda üstün. Saha gelişiyor.`;
    verdict=`<strong>Staj Raporu (${selYear}):</strong> Teorik bilgi kuvvetli. ${kont.bonus} kazanıldı.`;
    setTimeout(sfxSuccess,300);
  }else if(cesurC>=5&&stats.cesaret>=60){
    emoji='⚓';title='Cesur Güverte Adamı';
    flavor=`"Korkmuyor." — Lostromo`;
    desc=`${pn} öne çıktı, risk üstlendi.`;
    verdict=`<strong>Staj Raporu (${selYear}):</strong> Liderlik potansiyeli yüksek. Teknik bilgi geliştirilmeli.`;
  }else{
    emoji='📖';title='Öğrenme Yolculuğu';
    flavor=`"Her büyük süvari ilk seferinde kaybolmuştur."`;
    desc=`${pn} zor bir ilk seferden geçti. Ama bitirmedi.`;
    verdict=`<strong>Staj Raporu (${selYear}):</strong> Potansiyel mevcut. ${kont.ay}+${kont.izin} aylık kontrat tamamlandı.`;
  }

  document.getElementById('ende').textContent=emoji;
  document.getElementById('endt').textContent=title;
  document.getElementById('endf').textContent=flavor;
  document.getElementById('endd').textContent=desc;
  document.getElementById('endv').innerHTML=verdict;
  document.getElementById('endgrid').innerHTML=
    '<div class="ecard"><div class="ecv" style="color:#6fa8dc;">'+Math.round(stats.cesaret)+'</div><div class="ecl">CESARET</div></div>'+
    '<div class="ecard"><div class="ecv" style="color:#d4a017;">'+Math.round(stats.bilgi)+'</div><div class="ecl">BİLGİ</div></div>'+
    '<div class="ecard"><div class="ecv" style="color:#5dbf8a;">'+Math.round(stats.sayginlik)+'</div><div class="ecl">SAYGINLIK</div></div>'+
    '<div class="ecard"><div class="ecv" style="color:#5dbf8a;">'+Math.round(stats.dinclik)+'</div><div class="ecl">DİNÇLİK</div></div>';
}

// ===== BAŞLAT =====
function beginGame(){
  const ni=document.getElementById('nameinp').value.trim();
  const si=document.getElementById('shipnameinp').value.trim();
  pn=ni||'Stajyer';
  sn=si||(SNAMES[selType]||['M/V Ege Meltem'])[0];

  const kont=KONTRAT_DEFS[selType]?.[selKontrat]||{ay:6,izin:1};
  contractTotal=(kont.ay+kont.izin)*4; // Her ay ~4 sahne
  contractDays=0;

  // Kontrat uzunluğuna göre sahne pool'u oluştur
  const pool=buildScenePool(pn,sn,selYear,selType);
  sceneQueue=buildSceneQueue(pool, contractTotal);
  currentIdx=0;

  stats={cesaret:40,bilgi:22,sayginlik:32,dinclik:68};
  choicesMade=[];
  SYSTEM_STATE.consecutiveMistakes=0;
  SYSTEM_STATE.totalMistakes=0;
  SYSTEM_STATE.hiddenFailures={bridge:0,deck:0,engine:0,compliance:0};
  SYSTEM_STATE.triggeredChains.clear();
  seenColregHints.clear();
  journalEntries=[];
  photos=[];
  routeHistory=[{x:85,y:130}];
  visitedPorts=new Set(['İzmir']);
  shipPosition={x:85,y:130};
  scenesSinceEvent=0;
  nextEventAt=5+Math.floor(Math.random()*4);
  initCrewSystem();

  document.getElementById('intro').style.display='none';
  const g=document.getElementById('game');g.style.display='flex';g.style.flexDirection='column';
  setTimeout(()=>{if(window._drawClock)window._drawClock();},50);
  setTimeout(()=>{if(window._drawClock)window._drawClock();},300);
  setTimeout(()=>{if(window._drawClock)window._drawClock();},600);
  updateStats({});
  document.getElementById('contract-fill').style.width='0%';
  document.getElementById('tb-photos-count').textContent='0';
  document.getElementById('contract-days').textContent=`0 / ${contractTotal} GÜN`;
  renderScene(0);
  setTimeout(()=>{const cv=document.getElementById('clock-canvas');if(cv){const ev=new Event('resize');window.dispatchEvent(ev);}},100);
}

function restartGame(){
  stopAllMusic();
  document.getElementById('crisis').style.display='none';
  document.getElementById('endscr').style.display='none';
  document.getElementById('game').style.display='none';
  document.getElementById('intro').style.display='flex';
}

document.getElementById('nameinp').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('shipnameinp').focus();});
document.getElementById('shipnameinp').addEventListener('keydown',e=>{if(e.key==='Enter')beginGame();});

// ===== MÜRETTEBAT İLİŞKİ SİSTEMİ =====
const CREW_DEFS = {
  lostromo: {name:"Lostromo", icon:"🪢", title:"Güverte Ustası", trust:50,
    secrets:["Denizde 22 yıl. İlk gemisi İzmir'den İskenderiye hattıydı.","Oğlu da denizcilik okulu okuyor — bilmiyor bunu.","Ellerindeki yara izi bir halat kazasından: 1998, Kızıldeniz."],
    tips:["Güverte kontrol listesini hiç atlamama","Halat bağlama tekniklerini sormaya devam et","Sabah turuna zamanında çık"]},
  suvari: {name:"Süvari", icon:"🎖️", title:"Kaptan", trust:40,
    secrets:["Emekliliğine 3 yıl kaldı. Bilmiyor bunu henüz.","Her seferin başında gemisine 5 dakika yalnız bakıyor.","İki dil biliyor — ama İngilizce konuşmayı sevmiyor."],
    tips:["Zor sorulara dürüst cevap ver","Köprüde konuşmak için izin iste","Sorduğunda görüşünü söyle"]},
  z1: {name:"1. Zabiti", icon:"🧭", title:"Güverte Ops.", trust:45,
    secrets:["Hukuk okumak istiyordu. Ailesi denizci çıkardı onu.","Her sabah 04:45'te kalkar — kimse bilmez.","Raporlarda her virgülü kontrol eder."],
    tips:["Belgeleri eksiksiz tut","Hata yaptıysan hemen bildir","Görev devrine zamanında hazır ol"]},
  z2: {name:"2. Zabiti", icon:"🗺️", title:"Seyir Subayı", trust:40,
    secrets:["Yıldızları tanıyor — eski usul sextant hâlâ masasında.","Mühendislik fonu var, seyire geçiş hikayesi ilginç.","Gece nöbetinde caz müziği dinliyor — sessizce."],
    tips:["ECDIS notlarını düzenli tut","Radar olaylarını logla","Nöbet devrine eksiksiz brifinle"]},
  z3: {name:"3. Zabiti", icon:"🚒", title:"Emniyet Subayı", trust:45,
    secrets:["Her tatbikat öncesi 10 dakika hazırlık yapıyor — görmeden.","SOLAS kitabını ezberden biliyor.","İlk gemisinde gerçek yangın yaşadı."],
    tips:["Muster listeni ezberle","Tatbikatlara ciddi katıl","Emniyet raporlarını atlatma"]},
  carkci: {name:"Çarkçıbaşı", icon:"⚙️", title:"Baş Mühendis", trust:35,
    secrets:["Bu gemide 11 yıldır — şirketi tanıdığından beter tanıyor.","Makine dairesini kapalı gözle dolaşabilir.","İki çocuğunun fotoğrafı kontrol panelinde."],
    tips:["Makine dairesine meraklı in","Teknik soruları çekinmeden sor","Arıza loglarını takip et"]},
  bas2: {name:"2. Başmakinist", icon:"🔧", title:"Makine 2. Amiri", trust:40,
    secrets:["Gece nöbetlerinde şiir yazıyor — kimse bilmiyor.","Jeneratör arızasını bir kez tek başına çözdü — 4 saatte.","İstanbul Teknik mezunu, master yarıda bıraktı."],
    tips:["Makine loglarını birlikte incele","Pompa sistemlerini öğren","Alarm gelince hemen bildir"]},
  lostromo2: {name:"Silici Ramazan", icon:"🧹", title:"Güverte Temizlik", trust:50,
    secrets:["14 yıl aynı gemide. Şirket birkaç kez transfer teklif etti, hep reddetti.","Güverte şemasını yönetimden iyi biliyor.","Her sabah 05:30'da güvertede — hiç gecikmeden."],
    tips:["Güverte temizliğine katıl","Kimyasal kullanımını öğren","Ramazan'ın gözlemlerine kulak ver"]},
  yagci: {name:"Yağcı Mehmet Ali", icon:"🛢️", title:"Makine Yağlama", trust:45,
    secrets:["Yağ analizini kendi kendine öğrendi — kurs almadı.","Ana makineyi 'dinleyerek' sorun tespit edebiliyor.","Üç gemide çalıştı, üçünü de sever ama bu en iyisi der."],
    tips:["Yağ numune analizini birlikte yap","Titreşim değişimlerine dikkat et","Yağcı'nın günlük kontrollerini izle"]},
  asci: {name:"Aşçı Mehmet Usta", icon:"🍳", title:"Yemekhane", trust:55,
    secrets:["25 yıldır gemide. İlk gemisi yelkenliydi.","Sabah 04:00'te kalkar, kahvaltıyı hazırlar.","Ekibin moralini menüyle okur — kötü gün geçirmişlerse et yapar."],
    tips:["Yemeğe zamanında gel","Teşekkür etmeyi unutma","Ara sıra yardım teklif et"]},
  hasan: {name:"Tayfa Hasan", icon:"👷", title:"Deneyimli Tayfa", trust:50,
    secrets:["18 yıl denizde, hiç zam istemedi — şirket her zaman verdi.","İki çocuğu var, ikisi de denizci değil — sevinç mi üzüntü mü bilmiyor.","Fırtınada en sakin o olur."],
    tips:["Hasan'ın el işaretlerini öğren","Zor anlarda yanında dur","Gözlemlerini paylaş"]},
  musa: {name:"Tayfa Musa", icon:"👷", title:"Genç Tayfa", trust:55,
    secrets:["İlk gemisi bu. Sen de ilk stajyersin — benzer his.","Evleneceği kız denizden korkuyor.","Gece vardiyasında yıldız sayıyor."],
    tips:["Musa ile deneyim paylaş","Zor anlarda yanında dur","Birlikte öğrenin"]},
};

let crewTrust = {};
let crewUnlocked = {};

function initCrewSystem(){
  Object.keys(CREW_DEFS).forEach(k => {
    crewTrust[k] = CREW_DEFS[k].trust;
    crewUnlocked[k] = 0;
  });
  renderCrewCards();
}

function updateCrewTrust(crewKey, delta){
  if(!crewKey || !CREW_DEFS[crewKey]) return;
  crewTrust[crewKey] = Math.min(100, Math.max(0, (crewTrust[crewKey]||50) + delta));
  // Unlock secrets at 60, 75, 90
  const unlockThresholds = [60,75,90];
  unlockThresholds.forEach((t,i) => {
    if(crewTrust[crewKey] >= t && (crewUnlocked[crewKey]||0) <= i){
      crewUnlocked[crewKey] = i+1;
      const def = CREW_DEFS[crewKey];
      if(def.secrets[i]){
        showNotif('🔓', def.name + ' — Güven Kazanıldı', def.secrets[i]);
        addJournalEntry(`${def.name} hakkında yeni bir şey öğrendim: ${def.secrets[i]}`);
      }
    }
  });
  renderCrewCards();
}

function getCrewKeyFromWho(who){
  const map = {
    lostromo:'lostromo', silici:'lostromo2', yagci:'yagci', asci:'asci',
    hasan:'hasan', musa:'musa', suvari:'suvari', z1:'z1', z2:'z2',
    z3:'z3', carkci:'carkci', bas2:'bas2'
  };
  return map[who] || null;
}

function renderCrewCards(){
  const c = document.getElementById('crew-cards');
  if(!c) return;
  c.innerHTML = '';
  Object.entries(CREW_DEFS).forEach(([key,def]) => {
    const trust = crewTrust[key] || def.trust;
    const unlocked = crewUnlocked[key] || 0;
    const color = trust>=70?'#5dbf8a':trust>=50?'#d4a017':'#c97070';
    const label = trust>=70?'Güvenir':'GÜVEN'+trust>=50?'Tanışıyor':'Mesafeli';
    const div = document.createElement('div');
    div.className = 'crew-card';
    div.innerHTML = `<div class="crew-card-top">
      <span class="crew-ico">${def.icon}</span>
      <div><div class="crew-name">${def.name}</div><div class="crew-title-small">${def.title}</div></div>
      <span style="margin-left:auto;font-size:11px;font-family:'Share Tech Mono',monospace;color:${color};">${trust}</span>
    </div>
    <div class="crew-trust-bar"><div class="crew-trust-fill" style="width:${trust}%;background:${color};"></div></div>
    <div class="crew-trust-lbl"><span>${trust>=70?'Güveniyor':trust>=50?'Tanışıyor':'Mesafeli'}</span><span>🔓 ${unlocked}/3</span></div>
    ${unlocked>0?`<div class="crew-unlocked">💬 "${def.secrets[unlocked-1]?.substring(0,50)}..."</div>`:''}`;
    c.appendChild(div);
  });
}

function toggleCrew(){
  const p = document.getElementById('crew-panel');
  p.classList.toggle('open');
}

// Apply crew trust changes based on scene choices
function applyCrewEffect(who, tag){
  const key = getCrewKeyFromWho(who);
  if(!key) return;
  const delta = tag==='sosyal'?5:tag==='akilli'?3:tag==='cesur'?2:tag==='korkak'?-5:tag==='itaatkar'?2:-2;
  updateCrewTrust(key, delta);
}

// ===== ROTA HARİTASI =====
const ROUTE_PORTS = [
  {name:"İzmir", x:85, y:130, visited:true},
  {name:"Çanakkale", x:130, y:100, visited:false},
  {name:"İstanbul", x:180, y:85, visited:false},
  {name:"Pire", x:120, y:160, visited:false},
  {name:"İskenderiye", x:200, y:210, visited:false},
  {name:"Cenova", x:60, y:80, visited:false},
  {name:"Barselona", x:30, y:100, visited:false},
];

let shipPosition = {x:85, y:130};
let routeHistory = [{x:85,y:130}];
let visitedPorts = new Set(["İzmir"]);

function openMap(){
  document.getElementById('map-panel').classList.add('show');
  renderMap();
}
function closeMap(){ document.getElementById('map-panel').classList.remove('show'); }

function updateShipPosition(sceneLoc){
  const locMap = {
    'İzmir':{x:85,y:130}, 'Çanakkale Boğazı':{x:130,y:100},
    'İstanbul Boğazı':{x:180,y:85}, 'Pire':{x:120,y:160},
    'İskenderiye':{x:200,y:210}, 'Cenova':{x:60,y:80},
    'Aden':{x:300,y:230}, 'Süveyş':{x:250,y:195},
  };
  for(const [key,pos] of Object.entries(locMap)){
    if(sceneLoc && sceneLoc.includes(key)){
      shipPosition = {x:pos.x, y:pos.y};
      routeHistory.push({...pos});
      visitedPorts.add(key);
      break;
    }
  }
}

function renderMap(){
  const svg = document.getElementById('map-svg');
  const legend = document.getElementById('map-legend');
  // Mediterranean sea background
  let s = `<rect width="440" height="260" fill="#030d1a" rx="6"/>`;
  // Sea texture
  for(let i=0;i<8;i++){
    s+=`<path d="M${i*60} ${80+i*20} Q${i*60+30} ${75+i*20} ${i*60+60} ${80+i*20}" fill="none" stroke="#0a2448" stroke-width="1" opacity=".4"/>`;
  }
  // Land masses (simplified Mediterranean)
  s+=`<path d="M0 60 Q50 40 100 50 Q150 45 200 60 Q250 55 300 70 Q350 65 400 80 L440 85 L440 0 L0 0 Z" fill="#071828" opacity=".7"/>`;
  s+=`<path d="M0 260 Q60 240 120 250 Q180 245 240 255 Q300 248 360 258 L440 255 L440 160 Q400 170 350 165 Q300 160 250 170 Q200 175 150 168 Q100 162 50 170 Q20 175 0 168 Z" fill="#071828" opacity=".5"/>`;
  // Italy/Greece simplified
  s+=`<path d="M120 90 Q130 100 125 115 Q120 125 115 120 Q110 110 115 95 Z" fill="#0a1e2e" opacity=".6"/>`;
  s+=`<path d="M80 70 Q95 65 100 75 Q98 85 90 82 Q82 78 80 70 Z" fill="#0a1e2e" opacity=".6"/>`;

  // Route line
  if(routeHistory.length > 1){
    let d = `M${routeHistory[0].x*4.4} ${routeHistory[0].y*2.6}`;
    for(let i=1;i<routeHistory.length;i++){
      d += ` L${routeHistory[i].x*4.4} ${routeHistory[i].y*2.6}`;
    }
    s+=`<path d="${d}" fill="none" stroke="#2e6bbf" stroke-width="1.5" stroke-dasharray="5,3" opacity=".7"/>`;
  }

  // Ports
  ROUTE_PORTS.forEach(p => {
    const px = p.x*4.4, py = p.y*2.6;
    const visited = visitedPorts.has(p.name);
    const color = visited ? '#5dbf8a' : '#2e6bbf';
    s+=`<circle cx="${px}" cy="${py}" r="${visited?5:3}" fill="${color}" opacity="${visited?1:.6}"/>`;
    s+=`<text x="${px+7}" y="${py+4}" fill="${color}" font-size="8" font-family="monospace" opacity="${visited?1:.7}">${p.name}</text>`;
    if(visited){
      s+=`<circle cx="${px}" cy="${py}" r="9" fill="none" stroke="${color}" stroke-width="1" opacity=".3"/>`;
    }
  });

  // Ship position
  const sx = shipPosition.x*4.4, sy = shipPosition.y*2.6;
  s+=`<circle cx="${sx}" cy="${sy}" r="5" fill="#d4a017"/>`;
  s+=`<path d="M${sx-4} ${sy} L${sx} ${sy-8} L${sx+4} ${sy} Z" fill="#d4a017"/>`;
  s+=`<circle cx="${sx}" cy="${sy}" r="10" fill="none" stroke="#d4a017" stroke-width="1" opacity=".5" class="blink"/>`;
  s+=`<text x="${sx+12}" y="${sy+4}" fill="#d4a017" font-size="8" font-family="monospace">${sn||'Gemi'}</text>`;

  svg.innerHTML = s;
  legend.textContent = `🟢 Uğranan liman  🔵 Planlanan liman  🟡 ${sn||'Gemimiz'}  — ${visitedPorts.size} liman uğrandı`;
}

// ===== SEYİR GÜNLÜĞİ =====
let journalEntries = [];
const seenColregHints = new Set();

function addJournalEntry(text, day, time){
  journalEntries.push({text, day: day||'—', time: time||'—', ts: Date.now()});
}

function openJournal(){
  document.getElementById('journal-panel').classList.add('show');
  renderJournal();
}
function closeJournal(){ document.getElementById('journal-panel').classList.remove('show'); }
function openColreg(){ document.getElementById('colreg-panel').classList.add('show'); }
function closeColreg(){ document.getElementById('colreg-panel').classList.remove('show'); }

function renderJournal(){
  const c = document.getElementById('journal-entries');
  if(journalEntries.length === 0){
    c.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:10px;">Henüz günlük girişi yok. Sahnelerdeki kararların burada görünecek.</div>';
    return;
  }
  c.innerHTML = journalEntries.slice().reverse().map(e => `
    <div class="journal-entry">
      <div class="journal-entry-day">${e.day} · ${e.time}</div>
      ${e.text}
    </div>`).join('');
}

// ===== HAVA SİSTEMİ =====
const WEATHER_STATES = [
  {ico:"☀️", desc:"Açık hava — mükemmel seyir", bft:1, color:"#d4a017"},
  {ico:"🌤️", desc:"Hafif bulutlu — sakin deniz", bft:2, color:"#d4a017"},
  {ico:"⛅", desc:"Parçalı bulutlu — hafif dalga", bft:3, color:"#c9952a"},
  {ico:"🌥️", desc:"Kapalı — orta deniz", bft:4, color:"#8aabcc"},
  {ico:"🌬️", desc:"Rüzgarlı — düzensiz dalga", bft:5, color:"#6fa8dc"},
  {ico:"🌧️", desc:"Yağmurlu — kuvvetli dalga", bft:6, color:"#4a7098"},
  {ico:"⛈️", desc:"Fırtınalı — gemi yatıyor", bft:8, color:"#c97070"},
  {ico:"🌀", desc:"Şiddetli fırtına — ACİL", bft:10, color:"#c93010"},
];

let currentWeather = 1;

function updateWeather(sceneGfx){
  const weatherMap = {
    'sea':1, 'harbor':0, 'night':2, 'compass':2, 'bridge':2,
    'storm':6, 'engine_fault':3, 'pirate':4, 'bogaz':3, 'fire':3,
    'galley':1, 'cabin':2, 'cargo':2, 'radar':3, 'engine':2,
    'port_arrival':1, 'sunrise':1,
  };
  const idx = weatherMap[sceneGfx] ?? currentWeather;
  currentWeather = idx;
  const w = WEATHER_STATES[Math.min(idx, WEATHER_STATES.length-1)];
  const ico = document.getElementById('weather-ico');
  const info = document.getElementById('weather-info');
  const bft = document.getElementById('weather-bft');
  const temp = document.getElementById('weather-temp');
  if(ico) ico.textContent = w.ico;
  if(bft){ bft.textContent = w.bft; bft.style.color = w.color; }
  if(info) info.innerHTML = `Beaufort <span id="weather-bft" style="color:${w.color};font-weight:600;">${w.bft}</span> — ${w.desc}`;
  if(temp) temp.textContent = `${18+Math.floor(Math.random()*10)}°C`;
}

// ===== FOTOĞRAF ALBÜMİ =====
let photos = [];

function addPhoto(title, caption, svgKey){
  photos.push({title, caption, svgKey, day: currentDay});
  document.getElementById('tb-photos-count').textContent = photos.length;
}

function openAlbum(){
  const p = document.getElementById('album-panel');
  p.classList.add('show');
  // Rebuild album content
  // Remove old photo cards
  const oldCards = p.querySelectorAll('.album-photo');
  oldCards.forEach(c => c.remove());
  
  if(photos.length === 0){
    const empty = document.createElement('div');
    empty.style.cssText = 'color:var(--text3);font-size:13px;padding:20px;text-align:center;width:100%;';
    empty.textContent = 'Henüz fotoğraf yok. Önemli anlarda otomatik çekilecek.';
    p.appendChild(empty);
    return;
  }
  photos.forEach(ph => {
    const div = document.createElement('div');
    div.className = 'album-photo';
    const mini = GFX[ph.svgKey] || GFX.sea;
    div.innerHTML = `<svg class="photo-img" viewBox="0 0 480 145" xmlns="http://www.w3.org/2000/svg">${mini}</svg>
      <div style="font-size:10px;font-weight:600;color:var(--text);margin-bottom:2px;">${ph.title}</div>
      <div class="photo-cap">${ph.caption}</div>
      <div style="font-size:8px;color:var(--text3);margin-top:2px;">Gün ${ph.day}</div>`;
    p.appendChild(div);
  });
}
function closeAlbum(){ document.getElementById('album-panel').classList.remove('show'); }

// ===== ANİ OLAY SİSTEMİ =====
const RANDOM_EVENTS = [
  {icon:"🤒",title:"Musa Hastalandı!",text:"Tayfa Musa aniden mide bulantısı şikayeti. Gemi doktoru yok.",timer:15,
    choices:[
      {text:"İlk yardım kutusunu al, ilaç ver",effect:{sayginlik:8,bilgi:5}},
      {text:"Mehmet Usta'ya git, bişeyler pişirsin",effect:{sayginlik:10}},
      {text:"Kendi haline bırak",effect:{sayginlik:-8}}]},
  {icon:"💧",title:"Tatlı Su Azaldı!",text:"Tatlı su tankı beklenenden hızlı tükeniyor. Hesap hatası mı?",timer:12,
    choices:[
      {text:"Tüketim kısıtlaması öner — herkesi bilgilendir",effect:{bilgi:8,sayginlik:7}},
      {text:"Çarkçıbaşı'ya bildir",effect:{bilgi:5,sayginlik:5}},
      {text:"Görmezden gel",effect:{sayginlik:-10,bilgi:-5}}]},
  {icon:"🐟",title:"Balık Sürüsü!",text:"Dev balık sürüsü geminin önünden geçiyor. Güverte herkes toplandı.",timer:20,
    choices:[
      {text:"Anı yaşa, mürettebatla beraber izle",effect:{sayginlik:10,dinclik:5}},
      {text:"Fotoğrafla — belgesel değeri var",effect:{bilgi:3,sayginlik:5}},
      {text:"Göreve dön",effect:{sayginlik:2}}]},
  {icon:"📡",title:"İletişim Kesildi!",text:"Uydu sistemi çöktü. VHF dışında hiçbir iletişim yok. 6 saat.",timer:10,
    choices:[
      {text:"Sakin kal, VHF prosedürünü uygula",effect:{bilgi:10,sayginlik:8,cesaret:5}},
      {text:"Süvariyi bilgilendir, bekleme moduna geç",effect:{sayginlik:7,bilgi:5}},
      {text:"Panikle",effect:{sayginlik:-12,cesaret:-8}}]},
  {icon:"🚢",title:"SOS Sinyali!",text:"Yakın mesafede SOS sinyali alındı. Küçük tekne mi?",timer:15,
    choices:[
      {text:"Süvariyi hemen çağır, pozisyona yönel",effect:{cesaret:10,sayginlik:12,bilgi:8}},
      {text:"Sahil güvenliği ara, konumlarını bil",effect:{bilgi:8,sayginlik:10}},
      {text:"Yanlış sinyal olabilir, devam et",effect:{sayginlik:-15,cesaret:-10}}]},
  {icon:"🪳",title:"Ambar İhlali!",text:"Ambar 2'de insan izine benzer şeyler var. Kaçak yolcu mu?",timer:12,
    choices:[
      {text:"Lostromo ve süvariyi bilgilendir",effect:{bilgi:10,sayginlik:12,cesaret:8}},
      {text:"Tek başına araştır",effect:{cesaret:8,sayginlik:-3}},
      {text:"Hayal görüyorum de, unut",effect:{sayginlik:-10}}]},
];

let eventTimer = null;
let eventActive = false;

function triggerRandomEvent(){
  if(eventActive) return;
  const ev = RANDOM_EVENTS[Math.floor(Math.random()*RANDOM_EVENTS.length)];
  showEventCard(ev);
}

function showEventCard(ev){
  eventActive = true;
  document.getElementById('event-icon').textContent = ev.icon;
  document.getElementById('event-title').textContent = ev.title;
  document.getElementById('event-text').textContent = ev.text;
  const ec = document.getElementById('event-choices');
  ec.innerHTML = '';
  ev.choices.forEach(c => {
    const b = document.createElement('button');
    b.className = 'event-choice';
    b.textContent = c.text;
    b.onclick = () => {
      clearInterval(eventTimer);
      applyEffect(c.effect);
      addJournalEntry(`Ani olay: ${ev.title} — "${c.text}" seçildi.`);
      document.getElementById('event-card').classList.remove('show');
      eventActive = false;
    };
    ec.appendChild(b);
  });
  document.getElementById('event-card').classList.add('show');
  let t = ev.timer;
  document.getElementById('event-timer').textContent = t;
  eventTimer = setInterval(() => {
    t--;
    const el = document.getElementById('event-timer');
    if(el) el.textContent = t;
    if(t<=0){
      clearInterval(eventTimer);
      // Time's up — worst choice by default
      applyEffect({sayginlik:-5, dinclik:-5});
      addJournalEntry(`Ani olay: ${ev.title} — süre doldu, hareketsiz kalındı.`);
      document.getElementById('event-card').classList.remove('show');
      eventActive = false;
    }
  }, 1000);
}

// Rastgele olay tetikleyici — her 5-8 sahnede bir
let scenesSinceEvent = 0;
let nextEventAt = 5 + Math.floor(Math.random()*4);

function maybeTrigerEvent(){
  scenesSinceEvent++;
  if(scenesSinceEvent >= nextEventAt){
    scenesSinceEvent = 0;
    nextEventAt = 5 + Math.floor(Math.random()*4);
    setTimeout(triggerRandomEvent, 1500);
  }
}

// Mevcut gün takibi
let currentDay = 1;
const COLREG_HINTS = {
  s23:{icon:'âš“', title:'COLREG - Crossing', body:'Sancakta hedef varsa give-way sensin. Erken fark et, riski dogru raporla, nobet zabitini hemen haberdar et.'},
  s23b:{icon:'ğŸ§­', title:'COLREG Ozeti', body:'Crossing, head-on ve dar kanal kurallari burada birlikte sinaniyor.'},
  s48:{icon:'ğŸ—ºï¸', title:'COLREG - TSS', body:'Trafik ayrim seridinde rota disiplinini koru ve diger gemilerin emniyetli gecisini zorlastirma.'},
  kriz17:{icon:'ğŸ“¡', title:'COLREG - Dar Kanal', body:'VHF yardimcidir; asil olan sancak sinirina yakin kalmak ve gecisi engellememektir.'}
};

// ===== SİSTEMLERİ ENTEGRE ET =====
// Bu fonksiyon mevcut renderScene'e ek olarak çalışır
function onSceneRender(sc){
  // Hava güncelle
  updateWeather(sc.gfx);
  // Harita pozisyonunu güncelle
  updateShipPosition(sc.loc);
  // Gün sayacını güncelle
  if(sc.day) {
    const m = sc.day.match(/\d+/);
    if(m) currentDay = parseInt(m[0]);
  }
  // Crew trust güncelle (sahne gösteriminde +1 tanışma)
  const crewKey = getCrewKeyFromWho(sc.who);
  if(crewKey) updateCrewTrust(crewKey, 1);
  // Önemli anlarda fotoğraf çek
  if(sc.alert) addPhoto(`ACİL: ${sc.sub}`, sc.day+' · '+sc.time, sc.gfx);
  else if(sc.id==='s01') addPhoto('İlk Adım', 'İskeleye ilk kez ayak basıyorum...', 'harbor');
  else if(sc.id==='FINAL') addPhoto('Son Gün', 'Bu yolculuğun son sahnesi.', 'bridge');
  const hint = COLREG_HINTS[sc.id];
  if(hint && !seenColregHints.has(sc.id)){
    seenColregHints.add(sc.id);
    setTimeout(()=>{
      showNotif(hint.icon, hint.title, hint.body);
      addJournalEntry(`[COLREG] ${hint.body}`, sc.day, sc.time);
    }, 250);
  }
  // Rastgele olay
  maybeTrigerEvent();
}


// ===== SES SİSTEMİ (Web Audio API) =====
let audioCtx = null;
let currentMusic = null;
let musicGain = null;


let soundEnabled = true;
function toggleSound(){
  soundEnabled = !soundEnabled;
  document.getElementById('sound-btn').textContent = soundEnabled ? '🔊' : '🔇';
  if(!soundEnabled) stopAllMusic();
}

const _origPlayTone = playTone;
// Wrap functions to respect soundEnabled - handled by checking at call sites

function getAudioCtx(){
  if(!soundEnabled) return null;
  if(!audioCtx){
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }catch(e){ return null; }
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Basit ses efekti üreticisi - Web Audio API ile synthtic sesler
function playTone(freq, type, duration, vol, delay=0){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.1);
}

function playNoise(duration, vol, delay=0){
  const ctx = getAudioCtx();
  if(!ctx) return;
  const bufSize = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for(let i=0;i<bufSize;i++) data[i] = (Math.random()*2-1);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  src.buffer = buf;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  src.start(ctx.currentTime + delay);
  src.stop(ctx.currentTime + delay + duration + 0.1);
}

// Müzik/ambians döngü sistemi
let ambianceNodes = [];
function stopAllMusic(){
  ambianceNodes.forEach(n=>{ try{ n.stop(); }catch(e){} });
  ambianceNodes = [];
  if(musicGain) musicGain.gain.setTargetAtTime(0, getAudioCtx()?.currentTime||0, 0.3);
}

function playDroneNote(freq, vol, ctx){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  ambianceNodes.push(osc);
  return osc;
}

// === ÖZEL SES FONKSİYONLARI ===

// VHF tıkırtısı
function sfxVHF(){
  playTone(800, 'square', 0.08, 0.3);
  setTimeout(()=>playTone(1200, 'square', 0.06, 0.2), 100);
  setTimeout(()=>playTone(800, 'square', 0.08, 0.25), 200);
}

// Alarm sesi (yangın/acil)
function sfxAlarm(){
  for(let i=0;i<5;i++){
    playTone(880, 'square', 0.15, 0.4, i*0.35);
    playTone(660, 'square', 0.15, 0.3, i*0.35+0.175);
  }
}

// Radar bip
function sfxRadarBip(){
  playTone(1200, 'sine', 0.12, 0.25);
}

// Dalga/fırtına ambians
function sfxStormAmbiance(){
  stopAllMusic();
  const ctx = getAudioCtx();
  if(!ctx) return;
  // Düşük frekanslı dalga uğultusu
  playDroneNote(40, 0.08, ctx);
  playDroneNote(55, 0.06, ctx);
  playDroneNote(80, 0.04, ctx);
  // Periyodik buhran notları
  let beat = 0;
  function stormBeat(){
    if(ambianceNodes.length === 0) return;
    playTone(120+Math.random()*60, 'sawtooth', 0.4+Math.random()*0.3, 0.06+Math.random()*0.04);
    if(Math.random() > 0.7) playNoise(0.3, 0.08);
    beat++;
    if(beat < 40) setTimeout(stormBeat, 400+Math.random()*600);
  }
  setTimeout(stormBeat, 500);
}

// Korsan gerilim müziği
function sfxPirateAmbiance(){
  stopAllMusic();
  const ctx = getAudioCtx();
  if(!ctx) return;
  // Gerilim dronu - düşük, tehditkar
  playDroneNote(55, 0.1, ctx);
  playDroneNote(82, 0.07, ctx);
  // Hızlı ritim
  let beat = 0;
  const pirateMelody = [220, 196, 185, 165, 196, 220, 233];
  function pirateBeat(){
    if(ambianceNodes.length === 0) return;
    // Darbuka ritmi
    playTone(80, 'square', 0.15, 0.12);
    if(beat%2===0) playNoise(0.08, 0.06, 0.15);
    // Gerilim melodisi
    if(beat%7===0){
      const note = pirateMelody[Math.floor(Math.random()*pirateMelody.length)];
      playTone(note, 'triangle', 0.3, 0.08, 0.2);
    }
    beat++;
    if(beat < 80) setTimeout(pirateBeat, 250);
  }
  setTimeout(pirateBeat, 200);
}

// Boğaz gerilimi — sessiz, tehlikeli
function sfxBogazAmbiance(){
  stopAllMusic();
  const ctx = getAudioCtx();
  if(!ctx) return;
  playDroneNote(65, 0.08, ctx);
  playDroneNote(97, 0.05, ctx);
  let beat = 0;
  function bogazBeat(){
    if(ambianceNodes.length === 0) return;
    if(beat%4===0) playTone(130+Math.random()*20, 'sine', 0.5, 0.04, Math.random()*0.2);
    if(beat%8===0) playTone(196, 'triangle', 0.4, 0.06);
    beat++;
    if(beat < 60) setTimeout(bogazBeat, 600+Math.random()*400);
  }
  setTimeout(bogazBeat, 300);
}

// Makine arızası — metalik, alarm
function sfxEngineAlarm(){
  stopAllMusic();
  // Metal titreşim
  for(let i=0;i<3;i++){
    playTone(150+i*30, 'sawtooth', 0.3, 0.15, i*0.4);
    playTone(300+i*20, 'square', 0.2, 0.1, i*0.4+0.15);
  }
  setTimeout(()=>{
    const ctx = getAudioCtx();
    if(!ctx) return;
    playDroneNote(40, 0.06, ctx);
    let beat = 0;
    function engineBeat(){
      if(ambianceNodes.length === 0) return;
      playTone(60, 'sawtooth', 0.2, 0.08);
      playNoise(0.15, 0.05, 0.1);
      beat++;
      if(beat < 30) setTimeout(engineBeat, 800);
    }
    engineBeat();
  }, 1500);
}


// Deniz dalgası arka plan sesi
function sfxOceanAmbiance(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  stopAllMusic();
  // Düşük frekanslı dalga uğultusu
  const createWave = (freq, amp, delay=0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15 + Math.random()*0.1;
    lfoGain.gain.value = amp * 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = amp;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    lfo.start(ctx.currentTime + delay);
    ambianceNodes.push(osc); ambianceNodes.push(lfo);
  };
  createWave(48, 0.06);
  createWave(72, 0.04, 0.3);
  createWave(95, 0.03, 0.7);
  // Periyodik kıyı çarpma efekti
  let waveT = 0;
  function waveImpact(){
    if(ambianceNodes.length === 0) return;
    const ctx2 = getAudioCtx();
    if(!ctx2) return;
    // Gürültü patlaması (dalga kıyıya çarptı)
    const bufSize = ctx2.sampleRate * 0.8;
    const buf = ctx2.createBuffer(1, bufSize, ctx2.sampleRate);
    const data = buf.getChannelData(0);
    for(let i=0; i<bufSize; i++){
      const env = Math.pow(1 - i/bufSize, 2);
      data[i] = (Math.random()*2-1) * env * 0.15;
    }
    const src = ctx2.createBufferSource();
    const filt = ctx2.createBiquadFilter();
    const g = ctx2.createGain();
    filt.type = 'bandpass';
    filt.frequency.value = 300 + Math.random()*200;
    filt.Q.value = 0.5;
    g.gain.value = 0.3 + Math.random()*0.2;
    src.buffer = buf;
    src.connect(filt); filt.connect(g); g.connect(ctx2.destination);
    src.start();
    src.stop(ctx2.currentTime + 0.8);
    waveT++;
    if(ambianceNodes.length > 0){
      const nextWave = 3000 + Math.random()*4000;
      setTimeout(waveImpact, nextWave);
    }
  }
  setTimeout(waveImpact, 2000);
}

// Gemi sesi — motor uğultusu (normal)
function sfxShipEngine(){
  stopAllMusic();
  const ctx = getAudioCtx();
  if(!ctx) return;
  playDroneNote(50, 0.05, ctx);
  playDroneNote(100, 0.03, ctx);
  playDroneNote(150, 0.02, ctx);
}

// Liman sesi — kalabalık, canlı
function sfxHarbor(){
  stopAllMusic();
  // Vinç sesleri
  setTimeout(()=>playTone(600, 'sawtooth', 0.15, 0.06), 200);
  setTimeout(()=>playTone(800, 'square', 0.1, 0.05), 700);
  setTimeout(()=>playNoise(0.2, 0.04), 1200);
}

// İyi sonuç fanfarı
function sfxSuccess(){
  const notes = [523, 659, 784, 1047];
  notes.forEach((n,i)=> playTone(n, 'triangle', 0.4, 0.15, i*0.15));
  setTimeout(()=>{
    [784, 1047, 1568].forEach((n,i)=> playTone(n, 'sine', 0.5, 0.2, i*0.1));
  }, 700);
}

// Kötü sonuç sesi
function sfxFail(){
  playTone(300, 'sawtooth', 0.5, 0.2);
  playTone(220, 'sawtooth', 0.5, 0.2, 0.3);
  playTone(160, 'sawtooth', 0.5, 0.25, 0.6);
}

// Seçim click sesi
function sfxClick(){
  playTone(800, 'sine', 0.05, 0.08);
}

// Sahneye göre ses çal
function playSceneAudio(sc){
  const gfx = sc.gfx || '';
  const alert = sc.alert || false;
  
  if(alert){
    if(gfx === 'pirate') { setTimeout(sfxPirateAmbiance, 300); sfxAlarm(); }
    else if(gfx === 'bogaz') { sfxBogazAmbiance(); setTimeout(()=>playTone(440,'square',0.1,0.3),500); }
    else if(gfx === 'engine_fault') { sfxEngineAlarm(); }
    else { sfxAlarm(); }
  } else {
    if(gfx === 'storm') sfxStormAmbiance();
    else if(gfx==='fire') { stopAllMusic(); sfxAlarm(); }
    else if(gfx === 'radar') { stopAllMusic(); sfxRadarBip(); }
    else if(gfx === 'engine') { stopAllMusic(); sfxShipEngine(); }
    else if(gfx==='harbor') { sfxHarbor(); sfxOceanAmbiance(); }
    else if(gfx==='sea'||gfx==='night'||gfx==='sunrise'||gfx==='port_arrival') { sfxShipEngine(); sfxOceanAmbiance(); }
    else if(gfx==='cabin'||gfx==='galley') { sfxOceanAmbiance(); }
    else { stopAllMusic(); }
  }
}


// ===== BAŞLATMA =====
document.getElementById('nameinp').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('shipnameinp').focus();});
document.getElementById('shipnameinp').addEventListener('keydown',e=>{if(e.key==='Enter')beginGame();});
buildIntro();

