/* Guverte first-person WebGL ship runtime. Loaded after the main game bundle. */
(function(){
  'use strict';

  const STORAGE_KEY = 'guverte-first-person-world-v2';
  const MOBILE = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
  const clamp = (value,min,max)=>Math.max(min,Math.min(max,value));
  const callGame = (name,...args)=>{
    try{
      const fn = window[name];
      return typeof fn === 'function' ? fn(...args) : undefined;
    }catch(err){
      console.warn('FP3D bridge:', name, err);
      return undefined;
    }
  };
  const station = (id,label,detail,x,z,extra)=>Object.assign({id,label,detail,x,z,type:'station',kind:'pedestal'},extra||{});
  const door = (id,label,detail,x,z,target)=>({id,label,detail,x,z,target,type:'door',kind:'door'});
  const npc = (id,label,detail,line,x,z,path,speed,uniform)=>({id,label,detail,line,x,z,path,speed,uniform,type:'npc',kind:'npc'});

  const AREAS = {
    bridge:{
      title:'KÖPRÜÜSTÜ',subtitle:'Seyir ve kumanda merkezi',theme:'bridge',size:[22,18,5],bounds:[9.6,7.5],spawn:[0,5.4,0],outside:true,
      doors:[
        door('door-corridor','KORİDORA ÇIK','Yaşam mahalli ve alt güverte',0,7.2,'corridor'),
        door('door-deck','KÖPRÜ KANADI / GÜVERTE','Dış güverte ve deniz',-9.2,2.7,'deck')
      ],
      stations:[
        station('ecdis','ECDIS','Route check · safety contour',-6.5,-5.2,{device:'ecdis',kind:'console'}),
        station('vhf','VHF / DSC','Kanal · DSC · radio log',0,-6.2,{device:'vhf',kind:'console'}),
        station('radar','RADAR / ARPA','Target · CPA / TCPA',6.5,-5.2,{device:'radar',kind:'console'}),
        station('ais','AIS','Target ve voyage data',6.8,-1.8,{device:'ais',kind:'console'}),
        station('conning','CONNING','Heading · speed · rudder',0,-2.9,{device:'autopilot',kind:'console'}),
        station('bridge-binoculars','DÜRBÜN','Ufuk ve trafik taraması',-8.5,-5.8,{action:'binocular',kind:'view'}),
        station('bridge-logbook','SEYİR JURNALİ','Vardiya kaydı',-7.5,1.2,{action:'logbook',kind:'desk'})
      ],
      npcs:[
        npc('captain','KAPTAN','Süvari','Önce trafiği, sonra cihazı, en son kararı doğrula. Köprüüstünde acele değil disiplin gerekir.',-2.4,-1.1,[[-2.4,-1.1],[2.4,-1.1]],.19,'officer'),
        npc('oow','VARDİYA ZABİTİ','OOW','Radar ile AIS uyuşmuyorsa görsel gözetleme ve bağımsız sensör kontrolü yap.',4.3,-3.2,[[4.3,-3.2],[6,-2]],.24,'officer'),
        npc('lookout','GÖZCÜ','İskele kanat','İskele omuzlukta zayıf bir hedef görüyorum. Radarda küçük iz düşüyor.',-6,-2,[[-7,-2],[-4.8,-3.4]],.22,'deck')
      ]
    },
    corridor:{
      title:'ANA KORİDOR',subtitle:'Yaşam ve çalışma mahallerine geçiş',theme:'corridor',size:[6,26,3.2],bounds:[2.35,11.4],spawn:[0,-9.8,Math.PI],
      doors:[
        door('door-bridge','KÖPRÜÜSTÜ','Seyir merkezi',0,-11.1,'bridge'),
        door('door-cabin','KAMARA','Dinlenme ve kişisel alan',-2.2,-6.2,'cabin'),
        door('door-mess','MESSROOM','Yemek ve ekip sohbeti',2.2,-3.1,'mess'),
        door('door-galley','KAMBUZ','Mutfak ve günlük menü',2.2,.8,'galley'),
        door('door-infirmary','REVİR','Sağlık ve ilk yardım',-2.2,3.4,'infirmary'),
        door('door-radio','GMDSS ODASI','Haberleşme ekipmanı',-2.2,7.2,'radio'),
        door('door-cargo','YÜK KONTROL','Cargo ve ballast paneli',2.2,7.2,'cargo'),
        door('door-engine','MAKİNE DAİRESİ','ECR ve makine katı',0,11.1,'engine'),
        door('door-deck-corridor','DIŞ GÜVERTE','Başüstü ve bordalar',2.2,10,'deck')
      ],
      stations:[
        station('muster-plan','MUSTER LIST','Acil durum görevleri',-1.8,-1,{action:'notes',kind:'wall'}),
        station('fire-plan','FIRE PLAN','Yangın zonları ve kaçış',1.8,4.8,{action:'notes',kind:'wall'})
      ],
      npcs:[
        npc('cadet-roam','DİĞER STAJYER','Vardiyaya gidiyor','Kaptan gece emirlerini güncelledi. Köprüye çıkmadan önce okuyalım.',0,-1,[[0,-8],[0,8]],.31,'cadet'),
        npc('electrician-roam','ELEKTRİKÇİ','Alarm kontrolü','Bir sensör alarmı gördüm; ECR trendiyle karşılaştırmaya gidiyorum.',.5,6,[[.5,7],[-.5,1]],.23,'engine')
      ]
    },
    deck:{
      title:'DIŞ GÜVERTE',subtitle:'Deniz, mooring ve pilot operasyonu',theme:'deck',size:[14,34,12],bounds:[5.2,14.5],spawn:[0,10.5,0],outside:true,
      doors:[
        door('door-bridge-deck','KÖPRÜÜSTÜNE ÇIK','Seyir merkezi',-4.7,10.8,'bridge'),
        door('door-corridor-deck','YAŞAM MAHALLİ','Ana koridor',4.7,10.8,'corridor'),
        door('door-engine-deck','MAKİNE GİRİŞİ','ECR',4.7,-10.5,'engine')
      ],
      stations:[
        station('deck-mooring','MOORING WINCH','Halat gerilimi ve brake',-3.4,-6.3,{action:'deck3d',kind:'winch'}),
        station('deck-safe','EMNİYETLİ BEKLEME','Snap-back dışı alan',0,-2.5,{action:'walkTask',kind:'safe'}),
        station('deck-pilot','PİLOT MERDİVENİ','Ladder · light · lifebuoy',4.5,1.5,{action:'deck3d',kind:'ladder'}),
        station('deck-bow-view','PRUVADAN DENİZE BAK','Baş dalga ve rota',0,-13.1,{action:'sea',look:'bow',kind:'view'}),
        station('deck-sea-port','İSKELE BORDA','Swell ve trafik',-4.9,-1,{action:'sea',look:'port',kind:'view'}),
        station('deck-sea-stbd','SANCAK BORDA','Seyir fenerleri',4.9,-1,{action:'sea',look:'starboard',kind:'view'})
      ],
      npcs:[
        npc('bosun','LOSTROMO','Başüstü sorumlusu','Bight içine basma. Halatın yük yönünü ve snap-back alanını önce gör.',-2,-5,[[-3,-8],[2,-5]],.22,'deck'),
        npc('ab','USTA GEMİCİ','Pilot merdiveni','Merdiven yüksekliği tamam. Borda ışığı ve can simidini son kez kontrol edelim.',3,2,[[3,4],[4,-1]],.19,'deck')
      ]
    },
    engine:{
      title:'MAKİNE DAİRESİ',subtitle:'ECR, jeneratör ve yardımcı sistemler',theme:'engine',size:[20,24,6],bounds:[8.6,10.2],spawn:[0,-8.4,Math.PI],
      doors:[
        door('door-corridor-engine','ANA KORİDOR','Yaşam mahalli',0,-9.8,'corridor'),
        door('door-deck-engine','ACİL GÜVERTE ÇIKIŞI','Dış güverte',8,-7.5,'deck')
      ],
      stations:[
        station('engine-ecr','ECR ALARM PANELİ','Acknowledge · trend · reset',-5.8,-4.8,{action:'engine3d',kind:'console'}),
        station('engine-gen','JENERATÖR PANELİ','Load · Hz · sync',0,-5.5,{action:'engine3d',kind:'console'}),
        station('engine-bilge','BILGE PANELİ','Level · pump · alarm',5.8,-4.8,{action:'engine3d',kind:'console'}),
        station('engine-purifier','PURIFIER','Temperature · sludge',-5,4.5,{action:'engine3d',kind:'machine'}),
        station('engine-cooling','COOLING WATER','Pressure · temperature',2,4.7,{action:'engine3d',kind:'machine'}),
        station('engine-quickclose','QUICK CLOSING VALVE','Fuel isolation',7.5,4,{action:'engine3d',kind:'valve'})
      ],
      npcs:[
        npc('chief','BAŞ MÜHENDİS','ECR vardiyası','Alarmı susturmak çözüm değildir. Kaynağı teyit et, etkisini değerlendir, köprüye net rapor ver.',-3,-1,[[-4,-1],[2,-1]],.18,'engine'),
        npc('oiler','YAĞCI','Pompa turu','Bilge seviyesi yükseliyor. Emme süzgecini kontrol ettim; panelden trendi sen teyit et.',4,3,[[5,5],[3,-2]],.27,'engine')
      ]
    },
    cabin:{
      title:'KAMARA',subtitle:'Kişisel alan ve serbest zaman',theme:'cabin',size:[11,10,3.1],bounds:[4.4,3.8],spawn:[0,2.7,0],
      doors:[door('door-corridor-cabin','KORİDORA ÇIK','Vardiyaya dön',0,3.65,'corridor')],
      stations:[
        station('cabin-phone','TELEFON','Aile · mail · Starlink',-3.2,-1.4,{action:'phone',kind:'phone'}),
        station('cabin-notes','NOTLARIM','Kişisel not defteri',0,-2.8,{action:'notes',kind:'desk'}),
        station('cabin-glossary','SÖZLÜK','Denizcilik terimleri',2.2,-2.7,{action:'glossary',kind:'book'}),
        station('cabin-bed','YATAK','Dinçlik toparla',3.4,.8,{action:'rest',kind:'bed'}),
        station('cabin-ai','AI MATE','Sahne ve cihaz desteği',-3.1,1.5,{action:'ai',kind:'screen'})
      ],
      npcs:[npc('roommate','ODA ARKADAŞI','Vardiya sonrası','Biraz dinlen. Yorgunluk denizde sessizce büyüyen bir hatadır.',2,1,[[2,1],[1,-1]],.15,'cadet')]
    },
    mess:{
      title:'MESSROOM',subtitle:'Yemek ve mürettebat yaşamı',theme:'mess',size:[15,12,3.4],bounds:[6.3,4.7],spawn:[0,3.6,0],
      doors:[
        door('door-corridor-mess','ANA KORİDOR','Gemi içi geçiş',-3,4.45,'corridor'),
        door('door-galley-mess','KAMBUZ','Mutfak',3,4.45,'galley')
      ],
      stations:[
        station('mess-tea','ÇAY MOLASI','Moral ve dinçlik',-3.4,-1.2,{action:'rest',kind:'table'}),
        station('mess-crew','CREW CHAT','Ekip mesajları',3.5,-1.3,{action:'phone',kind:'screen'}),
        station('mess-menu','GÜNLÜK MENÜ','Aşçı notu',0,-4,{action:'notes',kind:'wall'})
      ],
      npcs:[
        npc('cook-mess','AŞÇI','Çay servisi','Çay taze. Ama vardiya öncesi ağır yemek yerine dengeli kal.',-2,0,[[-3,0],[2,0]],.16,'cook'),
        npc('crew-mess','GÜVERTE TAYFASI','Mola','Başüstünde swell arttı. Gece halat turunda zemine dikkat et.',3,1,[[3,1],[2,-2]],.13,'deck')
      ]
    },
    galley:{
      title:'KAMBUZ',subtitle:'Mutfak ve iaşe operasyonu',theme:'galley',size:[13,11,3.4],bounds:[5.3,4.1],spawn:[0,3.1,0],
      doors:[
        door('door-mess-galley','MESSROOM','Servis alanı',-2.4,3.9,'mess'),
        door('door-corridor-galley','ANA KORİDOR','Gemi içi geçiş',2.4,3.9,'corridor')
      ],
      stations:[
        station('galley-stove','KUZİNE','Sıcak yüzey ve yangın riski',-3.8,-2.8,{action:'notes',kind:'machine'}),
        station('galley-fridge','SOĞUK ODA','Erzak ve sıcaklık',3.8,-2.7,{action:'notes',kind:'machine'}),
        station('galley-menu','MENÜ PANOSU','Bugünün öğünleri',0,-4.1,{action:'notes',kind:'wall'})
      ],
      npcs:[npc('chief-cook','BAŞ AŞÇI','Kambuz sorumlusu','Kambuzda düzen emniyettir. Yağ yangınında su kullanılmaz; doğru söndürücüyü seçersin.',0,-1,[[-2,-1],[2,-1]],.18,'cook')]
    },
    infirmary:{
      title:'REVİR',subtitle:'Sağlık ve ilk yardım',theme:'infirmary',size:[12,10,3.3],bounds:[4.8,3.8],spawn:[0,2.8,0],
      doors:[door('door-corridor-infirmary','ANA KORİDOR','Gemi içi geçiş',0,3.65,'corridor')],
      stations:[
        station('medical-locker','İLK YARDIM DOLABI','Bandaj · oksijen · ilaç',-3.8,-2.5,{action:'notes',kind:'locker'}),
        station('medical-bed','MUAYENE YATAĞI','Hasta değerlendirme',2.5,-1.4,{action:'rest',kind:'bed'}),
        station('medical-radio','MEDICAL RADIO','TMAS / MRCC irtibatı',-2.8,1.5,{device:'vhf',kind:'console'})
      ],
      npcs:[npc('doctor','GEMİ DOKTORU','Sağlık sorumlusu','Önce sahne güvenliği; sonra bilinç, hava yolu, solunum ve dolaşım değerlendirmesi.',1,0,[[1,0],[-1,-1]],.14,'medical')]
    },
    radio:{
      title:'GMDSS ODASI',subtitle:'Deniz haberleşmesi ve acil cihazlar',theme:'radio',size:[12,10,3.3],bounds:[4.8,3.8],spawn:[0,2.8,0],
      doors:[door('door-corridor-radio','ANA KORİDOR','Köprü ve yaşam mahalli',0,3.65,'corridor')],
      stations:[
        station('radio-vhf','VHF / DSC','Distress ve working channel',-3.6,-2.7,{device:'vhf',kind:'console'}),
        station('radio-mf','MF / HF','DSC · radiotelephony',0,-3.3,{device:'mf_hf',kind:'console'}),
        station('radio-navtex','NAVTEX','MSI mesajları',3.6,-2.7,{device:'navtex',kind:'console'}),
        station('radio-epirb','EPIRB KABİNİ','Self-test · HRU',-3.8,1.2,{device:'epirb',kind:'locker'}),
        station('radio-sart','SART','Test ve yerleşim',3.8,1.2,{device:'sart',kind:'locker'})
      ],
      npcs:[npc('radio-officer','TELSİZ SORUMLUSU','GMDSS kontrolü','Distress mesajında konum, tehlikenin türü ve istenen yardım açık olmalı.',0,-.5,[[-1,-.5],[1,-.5]],.15,'officer')]
    },
    cargo:{
      title:'YÜK KONTROL ODASI',subtitle:'Cargo, ballast ve stabilite takibi',theme:'cargo',size:[18,14,3.8],bounds:[7.5,5.6],spawn:[0,4.4,0],
      doors:[door('door-corridor-cargo','ANA KORİDOR','Gemi içi geçiş',0,5.35,'corridor')],
      stations:[
        station('cargo-main','CARGO MİMİC','Loading sequence · pressure',-4.8,-4.4,{action:'cargo',kind:'console'}),
        station('cargo-ballast','BALLAST PANELİ','Tank transfer · list / trim',0,-5,{action:'cargo',kind:'console'}),
        station('cargo-reefer','REEFER / LASHING','Alarm ve securing',4.8,-4.4,{action:'cargo',kind:'console'}),
        station('cargo-plan','STOWAGE PLAN','Bay · row · tier',6,1.5,{action:'map',kind:'desk'})
      ],
      npcs:[npc('chief-officer','1. ZABİT','Yük operasyonu','Yük planını miktar, trim, shear force, bending moment ve liman sırasıyla birlikte oku.',-2,0,[[-3,0],[2,0]],.18,'officer')]
    }
  };

  const state = {
    active:false,ready:false,loading:null,THREE:null,renderer:null,scene:null,camera:null,
    stage:null,canvas:null,ui:{},area:'bridge',previousArea:'corridor',positions:{},
    player:{x:0,z:5},yaw:0,pitch:0,velocity:{x:0,z:0},keys:Object.create(null),
    stick:{x:0,y:0,pointerId:null},look:{active:false,pointerId:null,x:0,y:0},
    autoTarget:null,interactions:[],npcs:[],animatedScreens:[],waves:[],distantShips:[],
    animationId:0,lastFrame:0,elapsed:0,screenTick:0,nearest:null,currentDialogue:null,
    resizeObserver:null,quality:MOBILE?'mobile':'desktop',liveEvent:null,nextEventAt:18,completedDrills:Object.create(null),pendingDrill:null,audio:null,audioTick:0
  };

  function restoreState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      if(saved.area && AREAS[saved.area]) state.area = saved.area;
      if(saved.positions && typeof saved.positions === 'object') state.positions = saved.positions;
      if(Number.isFinite(saved.yaw)) state.yaw = saved.yaw;
    }catch(_err){}
  }
  function saveState(){
    try{
      state.positions[state.area] = {x:state.player.x,z:state.player.z,yaw:state.yaw};
      localStorage.setItem(STORAGE_KEY,JSON.stringify({area:state.area,positions:state.positions,yaw:state.yaw}));
    }catch(_err){}
  }
  restoreState();

  function loadThree(){
    if(state.THREE) return Promise.resolve(state.THREE);
    if(!state.loading){
      state.loading = import('./vendor/three.module.js').then(mod=>{
        state.THREE = mod;
        return mod;
      });
    }
    return state.loading;
  }

  function ensureHost(){
    let panel = document.getElementById('firstperson-panel');
    if(!panel){
      panel = document.createElement('div');
      panel.id = 'firstperson-panel';
      panel.tabIndex = -1;
      document.body.appendChild(panel);
    }
    let stage = document.getElementById('firstperson-stage');
    if(!stage){
      stage = document.createElement('div');
      stage.id = 'firstperson-stage';
      panel.appendChild(stage);
    }
    state.stage = stage;
    return {panel,stage};
  }

  function renderShell(){
    const host = ensureHost();
    host.stage.innerHTML =
      '<div class="fp3d-root" data-area="'+state.area+'">'+
        '<canvas id="fp3d-canvas" aria-label="Birinci şahıs gemi içi 3D görünüm"></canvas>'+
        '<div class="fp3d-loading show"><span></span><b>GEMİ HAZIRLANIYOR</b><small>3D mahal ve mürettebat yükleniyor</small></div>'+
        '<div class="fp3d-vignette"></div><div class="fp3d-motion-lines"></div>'+
        '<header class="fp3d-hud">'+
          '<div class="fp3d-location"><i></i><div><b id="fp3d-area-title">GEMİ İÇİ</b><span id="fp3d-area-subtitle">Serbest dolaşım</span></div></div>'+
          '<div class="fp3d-objective"><small>SIRADAKİ HEDEF</small><b id="fp3d-objective">Serbest dolaşım</b></div>'+
          '<nav class="fp3d-actions" aria-label="Birinci şahıs hızlı menü">'+
            '<button data-action="map" title="Harita">HARİTA</button><button data-action="notes" title="Notlarım">NOTLAR</button>'+
            '<button data-action="glossary" title="Sözlük">SÖZLÜK</button><button data-action="settings" title="Ayarlar">AYAR</button>'+
            '<button class="exit" data-action="exit" title="Birinci şahıs modundan çık">ÇIK</button>'+
          '</nav>'+
        '</header>'+
        '<nav class="fp3d-area-nav" aria-label="Gemi mahalleri"></nav>'+
        '<aside class="fp3d-mission-dock" aria-live="polite">'+
          '<div class="fp3d-route-head"><small>GÖREV DİREKTÖRÜ</small><b id="fp3d-route-title">Serbest dolaşım</b></div>'+
          '<p id="fp3d-route-reason">Yakındaki cihaz, kapı veya mürettebata yaklaş.</p>'+
          '<div class="fp3d-route-step"><i id="fp3d-route-arrow"></i><span id="fp3d-route-step">Hedef bekleniyor</span></div>'+
          '<button id="fp3d-route-action" type="button">HEDEFE YÜRÜ</button>'+
        '</aside>'+
        '<div class="fp3d-event-strip"><b id="fp3d-event-title">GEMİ SAKİN</b><span id="fp3d-event-text">Rutin vardiya akışı.</span></div>'+
        '<div class="fp3d-marker-layer"></div>'+
        '<div class="fp3d-crosshair"><i></i></div>'+
        '<div class="fp3d-prompt"><small>ETKİLEŞİM</small><b id="fp3d-prompt-text">Bir istasyona yaklaş</b><span id="fp3d-distance"></span></div>'+
        '<div class="fp3d-minimap"><b id="fp3d-map-title">GEMİ</b><div class="fp3d-map-grid"></div><i id="fp3d-map-player"></i><span id="fp3d-map-npcs"></span></div>'+
        '<div class="fp3d-help"><b>WASD</b> Yürü <b>Fare</b> Bak <b>E</b> Kullan <b>F</b> Hedef <b>R</b> Toparla</div>'+
        '<div class="fp3d-hands"><i></i><i></i></div>'+
        '<div class="fp3d-look-zone" aria-hidden="true"></div>'+
        '<div class="fp3d-stick" aria-label="Hareket kontrolü"><span></span></div>'+
        '<button class="fp3d-use" type="button"><span>KULLAN</span><small>E</small></button>'+
        '<button class="fp3d-run" type="button">HIZLI</button>'+
        '<div class="fp3d-dialogue" aria-live="polite"></div>'+
        '<div class="fp3d-drill" aria-live="polite"></div>'+
        '<div class="fp3d-fade active"></div>'+
      '</div>';
    state.canvas = host.stage.querySelector('#fp3d-canvas');
    state.ui = {
      root:host.stage.querySelector('.fp3d-root'),
      loading:host.stage.querySelector('.fp3d-loading'),
      markers:host.stage.querySelector('.fp3d-marker-layer'),
      areaNav:host.stage.querySelector('.fp3d-area-nav'),
      missionDock:host.stage.querySelector('.fp3d-mission-dock'),
      routeTitle:host.stage.querySelector('#fp3d-route-title'),
      routeReason:host.stage.querySelector('#fp3d-route-reason'),
      routeStep:host.stage.querySelector('#fp3d-route-step'),
      routeArrow:host.stage.querySelector('#fp3d-route-arrow'),
      routeAction:host.stage.querySelector('#fp3d-route-action'),
      eventStrip:host.stage.querySelector('.fp3d-event-strip'),
      eventTitle:host.stage.querySelector('#fp3d-event-title'),
      eventText:host.stage.querySelector('#fp3d-event-text'),
      drill:host.stage.querySelector('.fp3d-drill'),
      prompt:host.stage.querySelector('.fp3d-prompt'),
      promptText:host.stage.querySelector('#fp3d-prompt-text'),
      distance:host.stage.querySelector('#fp3d-distance'),
      title:host.stage.querySelector('#fp3d-area-title'),
      subtitle:host.stage.querySelector('#fp3d-area-subtitle'),
      objective:host.stage.querySelector('#fp3d-objective'),
      mapTitle:host.stage.querySelector('#fp3d-map-title'),
      mapPlayer:host.stage.querySelector('#fp3d-map-player'),
      mapNpcs:host.stage.querySelector('#fp3d-map-npcs'),
      stick:host.stage.querySelector('.fp3d-stick'),
      stickKnob:host.stage.querySelector('.fp3d-stick span'),
      lookZone:host.stage.querySelector('.fp3d-look-zone'),
      use:host.stage.querySelector('.fp3d-use'),
      run:host.stage.querySelector('.fp3d-run'),
      dialogue:host.stage.querySelector('.fp3d-dialogue'),
      fade:host.stage.querySelector('.fp3d-fade')
    };
    bindUi();
  }

  function bindUi(){
    state.ui.root.querySelectorAll('.fp3d-actions button').forEach(btn=>btn.addEventListener('click',()=>{
      const action = btn.dataset.action;
      if(action==='exit') closeWorld();
      else if(action==='map') callGame('openMap');
      else if(action==='notes') callGame('openNotes');
      else if(action==='glossary') callGame('openGlossary');
      else if(action==='settings'){
        closeWorld();
        callGame('toggleGameSettings',true);
      }
    }));
    state.ui.use.addEventListener('click',interact);
    state.ui.routeAction?.addEventListener('click',walkToDirectorTarget);
    state.ui.run.addEventListener('pointerdown',()=>{state.keys.shift=true;state.ui.run.classList.add('active');});
    ['pointerup','pointercancel','pointerleave'].forEach(type=>state.ui.run.addEventListener(type,()=>{state.keys.shift=false;state.ui.run.classList.remove('active');}));
    bindStick();
    bindLook();
  }

  const FP_EVENTS = [
    {area:'bridge',id:'vhf',title:'ACİL ÇAĞRI',text:'VHF DSC alarmı simülasyonu: konum, tehlike türü ve yardım talebini sırala.',kind:'urgent'},
    {area:'deck',id:'deck-sea-stbd',title:'FENER OKUMA',text:'Sancak bordada iki ışık görüldü; karakter ve sektör okuması bekleniyor.',kind:'nav'},
    {area:'radio',id:'radio-mf',title:'MORS TALİMİ',text:'GMDSS odasında kısa SOS ritmi alındı; kodu çöz.',kind:'radio'},
    {area:'cargo',id:'cargo-ballast',title:'GELGİT / TRİM',text:'Yük zabiti gelgit tablosu ve ballast hesabı için çağırıyor.',kind:'cargo'},
    {area:'engine',id:'engine-ecr',title:'MAKİNE ALARMI',text:'ECR panelinde bilge trendi yükseliyor; önce alarmı değil kaynağı doğrula.',kind:'engine'},
    {area:'cabin',id:'cabin-phone',title:'AİLE ÖZLEMİ',text:'Telefon titreşti; kısa bir aile mesajı moralini etkiliyor.',kind:'life'}
  ];
  const FP_DRILLS = {
    vhf:{title:'Acil Haberleşme',q:'Mayday çağrısında doğru ilk bilgi sırası hangisi?',a:0,opts:['Gemi adı / konum / tehlike / istenen yardım','Önce şirket, sonra aile, sonra VTS','Sadece kanal ve hava durumu'],effect:{bilgi:2,sayginlik:1}},
    'radio-vhf':{title:'DSC / VHF',q:'Distress alert sonrası telsizde ne yapılır?',a:1,opts:['Telefonla kaptanı ararım','Mayday mesajını konum ve tehlike türüyle tekrarlarım','AIS hedef adını okurum'],effect:{bilgi:2}},
    'radio-mf':{title:'Mors Kodu',q:'... --- ... hangi mesajdır?',a:2,opts:['Pan-pan','Securite','SOS'],effect:{bilgi:2}},
    ecdis:{title:'Gelgit ve UKC',q:'Gelgit tablosunda emniyetli UKC için ne kontrol edilir?',a:0,opts:['Chart datum, saat, yükseklik ve draft toplamı','Sadece rüzgar yönü','Sadece AIS rotası'],effect:{bilgi:2}},
    radar:{title:'Yarım Daire Seyri',q:'Çatışma riski artarken güvenli kararın temeli nedir?',a:1,opts:['Sadece hız artırmak','CPA/TCPA, nispi kerteriz ve COLREG değerlendirmesi','Sadece siren çalmak'],effect:{bilgi:2,sayginlik:1}},
    ais:{title:'Şamandıra / Fener',q:'Fener karakteri nasıl okunur?',a:2,opts:['Rengine hiç bakılmaz','Sadece yüksekliğine bakılır','Renk, periyot, grup çakma ve sektör birlikte okunur'],effect:{bilgi:2}},
    'deck-pilot':{title:'Flama ve Pilot Hazırlığı',q:'Pilot operasyonunda hangi işaretler birlikte kontrol edilir?',a:0,opts:['Flama, borda ışığı, can simidi ve ladder emniyeti','Sadece yemek saati','Sadece makine devri'],effect:{bilgi:1,sayginlik:1}},
    'deck-mooring':{title:'Raspa-Boya Emniyeti',q:'Raspa/boya öncesi en kritik kontrol nedir?',a:1,opts:['Boyayı hemen açmak','KKD, yüzey hazırlığı, havalandırma ve izin','Sadece fırça seçmek'],effect:{bilgi:1,sayginlik:1}},
    'cargo-ballast':{title:'Matematiksel Seyir',q:'Set/drift veya gelgit hesabında temel yaklaşım nedir?',a:0,opts:['Vektörleri ve zamanı birlikte hesaplamak','Rastgele rota değiştirmek','Sadece pusulaya bakmak'],effect:{bilgi:2}},
    'cargo-main':{title:'Yük Operasyonu',q:'Yük planı okunurken hangisi birlikte izlenir?',a:2,opts:['Sadece konteyner rengi','Sadece vardiya saati','Trim, list, SF/BM ve liman sırası'],effect:{bilgi:2}},
    'cabin-phone':{title:'Aile Özlemi',q:'Moral düştüğünde doğru davranış hangisi?',a:1,opts:['Vardiyada saklamak','Kısa iletişim kurup yorgunluğu dürüst bildirmek','Hiç uyumamak'],effect:{dinclik:1,sayginlik:1}},
    'medical-radio':{title:'Tıbbi Haberleşme',q:'TMAS/MRCC görüşmesinde bilgi nasıl verilir?',a:0,opts:['Bilinç, solunum, bulgu, konum ve istenen destek','Sadece yaş','Sadece gemi tipi'],effect:{bilgi:1}}
  };
  function drillForItem(item){if(!item)return null;return FP_DRILLS[item.id] || FP_DRILLS[item.device] || FP_DRILLS[item.action] || null;}
  function ensureAudio(){
    if(state.audio)return state.audio;
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    const ctx=new Ctx();
    const gain=ctx.createGain();gain.gain.value=.035;gain.connect(ctx.destination);
    state.audio={ctx,gain};return state.audio;
  }
  function playTone(freq=440,dur=.12,type='sine',vol=.08){
    const audio=ensureAudio();if(!audio)return;
    const ctx=audio.ctx;if(ctx.state==='suspended')ctx.resume?.();
    const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.value=freq;g.gain.value=vol;
    osc.connect(g);g.connect(audio.gain);osc.start();g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);osc.stop(ctx.currentTime+dur+.02);
  }
  function playAreaPulse(kind='area'){
    const map={urgent:[740,880,740],engine:[120,90,120],radio:[520,680,520],life:[260,220],warn:[180,140],drill:[420,540],nav:[360,520],cargo:[220,330],area:[180]};
    (map[kind]||map.area).forEach((f,i)=>setTimeout(()=>playTone(f,.1,i%2?'triangle':'sine',.08),i*120));
  }
  function pulseAmbient(){
    if(!state.active || state.elapsed-state.audioTick<5)return;
    state.audioTick=state.elapsed;
    const base={bridge:220,corridor:160,deck:110,engine:82,cabin:196,mess:246,galley:180,infirmary:300,radio:520,cargo:140}[state.area]||180;
    playTone(base,.18,state.area==='engine'?'sawtooth':'sine',state.area==='deck'?.045:.032);
    if(state.area==='cabin' && Math.floor(state.elapsed/15)%2===0) setTimeout(()=>playTone(230,.45,'sine',.025),220);
  }
  function updateEventStrip(){if(!state.ui.eventStrip)return;const ev=state.liveEvent;state.ui.eventStrip.classList.toggle('show',!!ev);if(ev){state.ui.eventTitle.textContent=ev.title;state.ui.eventText.textContent=ev.text;}}
  function maybeTriggerLiveEvent(){
    if(state.liveEvent || state.elapsed<state.nextEventAt)return;
    const pool=FP_EVENTS.filter(ev=>ev.area===state.area || Math.random()<.28);
    const ev=pool[Math.floor(Math.random()*Math.max(1,pool.length))] || FP_EVENTS[0];
    state.liveEvent={...ev,started:state.elapsed};state.nextEventAt=state.elapsed+32+Math.random()*20;
    callGame('addWatchFeed',ev.title+': '+ev.text, ev.kind==='urgent'||ev.kind==='engine'?'warn':'good');
    callGame('showNotif',ev.title,'1. Şahıs Olayı',ev.text);playAreaPulse(ev.kind);updateEventStrip();
  }
  function clearLiveEventIfHandled(item){if(state.liveEvent && item && (item.id===state.liveEvent.id || item.target===state.liveEvent.area)){state.liveEvent=null;updateEventStrip();}}
  function openTrainingDrill(item){
    const drill=drillForItem(item);if(!drill || state.completedDrills[item.id])return false;
    state.pendingDrill={item,drill};state.ui.drill.classList.add('show');
    state.ui.drill.innerHTML='<div class="fp3d-drill-card"><button class="fp3d-drill-close" type="button">KAPAT</button><small>EĞİTİM MODÜLÜ</small><b>'+drill.title+'</b><p>'+drill.q+'</p><div>'+drill.opts.map((opt,i)=>'<button type="button" data-answer="'+i+'">'+opt+'</button>').join('')+'</div></div>';
    state.ui.drill.querySelector('.fp3d-drill-close').onclick=closeTrainingDrill;
    state.ui.drill.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>answerTrainingDrill(Number(btn.dataset.answer)));
    playAreaPulse('drill');return true;
  }
  function closeTrainingDrill(){state.pendingDrill=null;if(!state.ui.drill)return;state.ui.drill.classList.remove('show');state.ui.drill.innerHTML='';}
  function answerTrainingDrill(answer){
    const pending=state.pendingDrill;if(!pending)return;const ok=answer===pending.drill.a;
    if(ok){state.completedDrills[pending.item.id]=true;callGame('applyEffect',pending.drill.effect||{bilgi:1},{skipContractTick:true});callGame('markWalkTaskDone',pending.item.id,pending.item.label);callGame('addWatchFeed',pending.drill.title+': doğru uygulama tamamlandı.','good');callGame('showNotif','EĞİTİM',pending.drill.title,'Doğru cevap kaydedildi.');clearLiveEventIfHandled(pending.item);closeTrainingDrill();}
    else{callGame('addWatchFeed',pending.drill.title+': yanlış seçim, tekrar dene.','warn');callGame('showNotif','EĞİTİM','Tekrar dene','İpucu: gemide önce emniyet, sonra doğrulama, sonra rapor.');playAreaPulse('warn');}
  }
  function getDirectorTarget(){
    if(state.liveEvent)return {area:state.liveEvent.area,id:state.liveEvent.id,label:state.liveEvent.title,reason:state.liveEvent.text};
    try{return callGame('getFirstPersonDirectorTarget')||null;}catch(_err){return null;}
  }
  function findInteractionById(id){
    if(!id)return null;
    return state.interactions.find(item=>item.id===id || item.device===id || item.action===id) || null;
  }
  function findDoorToArea(areaId){
    if(!areaId)return null;
    return state.interactions.find(item=>item.type==='door' && item.target===areaId) || null;
  }
  function getDirectorLocalItem(target){
    if(!target)return null;
    if(target.area && target.area!==state.area)return findDoorToArea(target.area);
    return findInteractionById(target.id) || findDoorToArea(target.area);
  }
  function walkToDirectorTarget(){
    const target=getDirectorTarget();
    if(target&&target.area&&target.area!==state.area){
      const doorItem=findDoorToArea(target.area);
      if(doorItem){walkTo(doorItem);return;}
      setArea(target.area);return;
    }
    const item=getDirectorLocalItem(target) || state.nearest;
    if(item)walkTo(item);
  }
  function updateMissionDock(){
    if(!state.ui.missionDock)return;
    const target=getDirectorTarget();
    const item=getDirectorLocalItem(target);
    const area=AREAS[state.area]||AREAS.bridge;
    const title=target?.label || area.title;
    const reason=target?.reason || 'Serbest dolaşım';
    state.ui.routeTitle.textContent=title;
    state.ui.routeReason.textContent=reason;
    let step='Yakındaki cihaz, kapı veya mürettebata yaklaş.';
    let action='HEDEFE YÜRÜ';
    let angle=0;
    let far=false;
    if(target?.area && target.area!==state.area){
      const targetArea=AREAS[target.area];
      const doorItem=findDoorToArea(target.area);
      step=(targetArea?targetArea.title:target.area.toUpperCase())+' mahalline geç.';
      action=doorItem?'KAPIYA YÜRÜ':'MAHALE GEÇ';
      if(doorItem){const p=doorItem.object.position;angle=Math.atan2(p.x-state.player.x,-(p.z-state.player.z))-state.yaw;}
      far=true;
    }else if(item){
      const p=item.object.position,dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
      step=item.label+' · '+Math.max(1,Math.round(dist*1.4))+' m';
      action=dist<3.35?(item.type==='door'?'GEÇ':item.type==='npc'?'KONUŞ':'KULLAN'):'HEDEFE YÜRÜ';
      angle=Math.atan2(dx,-dz)-state.yaw;
      far=dist>6;
    }else if(state.nearest){
      step='En yakın: '+state.nearest.label;
    }
    state.ui.routeStep.textContent=step;
    state.ui.routeAction.textContent=action;
    state.ui.routeArrow.style.transform='rotate('+angle+'rad)';
    state.ui.missionDock.classList.toggle('far',far);
    state.ui.missionDock.classList.toggle('ready',!!item && !far && action!=='HEDEFE YÜRÜ');
  }
  function buildAreaNav(){
    if(!state.ui.areaNav)return;
    const order=['bridge','corridor','deck','engine','radio','cargo','cabin','mess','galley','infirmary'];
    state.ui.areaNav.innerHTML=order.filter(id=>AREAS[id]).map(id=>{
      const area=AREAS[id];
      const label=area.title.replace('KÖPRÜÜSTÜ','KÖPRÜ').replace('ANA KORİDOR','KORİDOR').replace('DIŞ GÜVERTE','GÜVERTE').replace('MAKİNE DAİRESİ','MAKİNE').replace('YÜK KONTROL ODASI','YÜK');
      return '<button type="button" data-area="'+id+'" class="'+(id===state.area?'active':'')+'">'+label+'</button>';
    }).join('');
    state.ui.areaNav.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>setArea(btn.dataset.area)));
  }

  function bindStick(){
    const el = state.ui.stick;
    const update = ev=>{
      if(state.stick.pointerId!==ev.pointerId) return;
      const r = el.getBoundingClientRect();
      const radius = Math.max(28,r.width*.34);
      const x = clamp(ev.clientX-(r.left+r.width/2),-radius,radius);
      const y = clamp(ev.clientY-(r.top+r.height/2),-radius,radius);
      const length = Math.hypot(x,y);
      const factor = length>radius ? radius/length : 1;
      state.stick.x=(x*factor)/radius;
      state.stick.y=(y*factor)/radius;
      state.ui.stickKnob.style.transform='translate('+Math.round(x*factor)+'px,'+Math.round(y*factor)+'px)';
      state.autoTarget=null;
    };
    const stop = ev=>{
      if(ev && state.stick.pointerId!==ev.pointerId) return;
      state.stick.pointerId=null;state.stick.x=0;state.stick.y=0;
      state.ui.stickKnob.style.transform='translate(0,0)';
    };
    el.addEventListener('pointerdown',ev=>{state.stick.pointerId=ev.pointerId;el.setPointerCapture(ev.pointerId);update(ev);});
    el.addEventListener('pointermove',update);
    el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
  }

  function bindLook(){
    const zone = state.ui.lookZone;
    const start = ev=>{
      if(ev.target.closest('button')) return;
      state.look={active:true,pointerId:ev.pointerId,x:ev.clientX,y:ev.clientY};
      zone.setPointerCapture(ev.pointerId);
    };
    const move = ev=>{
      if(!state.look.active || state.look.pointerId!==ev.pointerId) return;
      const dx=ev.clientX-state.look.x,dy=ev.clientY-state.look.y;
      state.look.x=ev.clientX;state.look.y=ev.clientY;
      state.yaw-=dx*.0042;state.pitch=clamp(state.pitch-dy*.0032,-.72,.62);
      state.autoTarget=null;
    };
    const stop = ev=>{if(!ev || state.look.pointerId===ev.pointerId) state.look.active=false;};
    zone.addEventListener('pointerdown',start);zone.addEventListener('pointermove',move);
    zone.addEventListener('pointerup',stop);zone.addEventListener('pointercancel',stop);
    state.canvas.addEventListener('pointerdown',start);state.canvas.addEventListener('pointermove',move);
    state.canvas.addEventListener('pointerup',stop);state.canvas.addEventListener('pointercancel',stop);
  }

  function initRenderer(){
    const T=state.THREE;
    if(state.renderer){
      state.renderer.domElement.remove();
      state.canvas.replaceWith(state.renderer.domElement);
      state.canvas=state.renderer.domElement;
      state.canvas.id='fp3d-canvas';
      bindLook();
      resize();
      return;
    }
    const renderer=new T.WebGLRenderer({canvas:state.canvas,antialias:!MOBILE,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,MOBILE?1.25:1.75));
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.22;
    state.renderer=renderer;
    state.resizeObserver=new ResizeObserver(resize);
    state.resizeObserver.observe(state.stage);
    resize();
  }

  function resize(){
    if(!state.renderer||!state.camera||!state.stage) return;
    const rect=state.stage.getBoundingClientRect();
    const width=Math.max(1,Math.floor(rect.width)),height=Math.max(1,Math.floor(rect.height));
    state.renderer.setSize(width,height,false);
    state.camera.aspect=width/height;state.camera.updateProjectionMatrix();
  }

  function material(color,opts){
    const T=state.THREE;
    return new T.MeshStandardMaterial(Object.assign({color,roughness:.58,metalness:.18},opts||{}));
  }
  function box(parent,size,pos,mat,rot){
    const T=state.THREE;
    const mesh=new T.Mesh(new T.BoxGeometry(size[0],size[1],size[2]),mat);
    mesh.position.set(pos[0],pos[1],pos[2]);
    if(rot) mesh.rotation.set(rot[0]||0,rot[1]||0,rot[2]||0);
    parent.add(mesh);return mesh;
  }
  function cylinder(parent,radius,depth,pos,mat,rot){
    const T=state.THREE;
    const mesh=new T.Mesh(new T.CylinderGeometry(radius,radius,depth,20),mat);
    mesh.position.set(pos[0],pos[1],pos[2]);
    if(rot) mesh.rotation.set(rot[0]||0,rot[1]||0,rot[2]||0);
    parent.add(mesh);return mesh;
  }
  function disposeScene(){
    if(!state.scene) return;
    state.scene.traverse(obj=>{
      if(obj.geometry) obj.geometry.dispose();
      if(obj.material){
        const mats=Array.isArray(obj.material)?obj.material:[obj.material];
        mats.forEach(mat=>{if(mat.map) mat.map.dispose();mat.dispose();});
      }
    });
    state.interactions=[];state.npcs=[];state.animatedScreens=[];state.waves=[];state.distantShips=[];
  }

  function buildScene(){
    const T=state.THREE;
    disposeScene();
    const area=AREAS[state.area]||AREAS.bridge;
    const scene=new T.Scene();
    const colors={bridge:0x071827,corridor:0x101820,deck:0x8fc8e6,engine:0x171b1f,cabin:0x172637,mess:0x1a2633,galley:0x21282d,infirmary:0xd6e5e8,radio:0x101c29,cargo:0x101a24};
    scene.background=new T.Color(colors[area.theme]||0x071827);
    scene.fog=area.outside?new T.Fog(0x82b4cc,42,210):new T.FogExp2(0x07111c,.014);
    const camera=new T.PerspectiveCamera(MOBILE?72:67,1,.08,260);
    camera.rotation.order='YXZ';
    state.scene=scene;state.camera=camera;
    scene.add(new T.HemisphereLight(area.outside?0xcfeeff:0xaac9df,area.theme==='engine'?0x1b0906:0x080d13,area.outside?2.25:1.55));
    scene.add(new T.AmbientLight(area.outside?0x91c9e2:0x6f9ab0,area.outside?.95:.58));
    const key=new T.DirectionalLight(0xd7eeff,area.outside?2.2:1.15);key.position.set(-6,12,4);scene.add(key);
    if(area.theme==='engine'){const red=new T.PointLight(0xff5b3a,1.8,18);red.position.set(0,3,-4);scene.add(red);}
    if(area.theme==='galley'||area.theme==='infirmary'){const white=new T.PointLight(0xf5fbff,1.7,16);white.position.set(0,2.6,0);scene.add(white);}
    buildRoomShell(area);
    buildRoomDetails(area);
    area.stations.forEach(def=>createStation(def,area));
    area.doors.forEach(def=>createDoor(def,area));
    area.npcs.forEach((def,index)=>createNpc(def,index));
    buildMarkers();
    const saved=state.positions[state.area];
    const spawn=saved&&Number.isFinite(saved.x)?[saved.x,saved.z,saved.yaw]:area.spawn;
    state.player.x=clamp(spawn[0],-area.bounds[0],area.bounds[0]);
    state.player.z=clamp(spawn[1],-area.bounds[1],area.bounds[1]);
    state.yaw=Number.isFinite(spawn[2])?spawn[2]:0;state.pitch=0;state.autoTarget=null;
    updateAreaUi();
    resize();
  }

  function buildRoomShell(area){
    const T=state.THREE,w=area.size[0],d=area.size[1],h=area.size[2];
    const floorMat=material(area.theme==='deck'?0x40515e:area.theme==='engine'?0x20282d:0x263746,{roughness:.72,metalness:.28});
    if(area.theme==='deck'){
      box(state.scene,[10,.28,d],[0,-.18,0],floorMat);
      const railMat=material(0xaebfca,{roughness:.3,metalness:.72});
      [-5,5].forEach(x=>{
        box(state.scene,[.08,.08,d],[x,1.05,0],railMat);
        for(let z=-d/2+1;z<d/2;z+=2.2) cylinder(state.scene,.035,1.05,[x,.52,z],railMat);
      });
      buildSea(true);
      return;
    }
    box(state.scene,[w,.22,d],[0,-.12,0],floorMat);
    box(state.scene,[w,.16,d],[0,h,0],material(area.theme==='corridor'?0x26333b:0x1d2c38,{roughness:.8}));
    const wallMat=material(area.theme==='engine'?0x30363a:area.theme==='infirmary'?0xb9d0d4:0x213443,{roughness:.76,metalness:.1});
    box(state.scene,[.22,h,d],[-w/2, h/2,0],wallMat);
    box(state.scene,[.22,h,d],[ w/2, h/2,0],wallMat);
    box(state.scene,[w,h,.22],[0,h/2,d/2],wallMat);
    if(area.theme==='bridge'){
      box(state.scene,[w,.9,.28],[0,.45,-d/2],wallMat);
      box(state.scene,[w,.55,.28],[0,h-.275,-d/2],wallMat);
      for(let x=-w/2;x<=w/2;x+=4.4) box(state.scene,[.18,h-1.45,.32],[x,2.6,-d/2],material(0x7694a5,{metalness:.52}));
      const glass=material(0x6faed0,{transparent:true,opacity:.16,roughness:.12,metalness:.15,side:T.DoubleSide});
      const pane=new T.Mesh(new T.PlaneGeometry(w-1,h-1.5),glass);pane.position.set(0,2.65,-d/2-.02);state.scene.add(pane);
      buildSea(false);
    }else{
      box(state.scene,[w,h,.22],[0,h/2,-d/2],wallMat);
    }
    const lightMat=material(0xd9f4ff,{emissive:0x9dd8ff,emissiveIntensity:2,roughness:.15});
    const count=Math.max(2,Math.floor(d/5));
    for(let i=0;i<count;i++) box(state.scene,[Math.min(2.5,w*.45),.04,.35],[0,h-.1,-d/2+2+(i*(d-4)/Math.max(1,count-1))],lightMat);
  }

  function horizonTexture(){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=512;
    const ctx=canvas.getContext('2d');
    const sky=ctx.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#8fc8e6');sky.addColorStop(.72,'#a9d6e8');sky.addColorStop(1,'#d5ebf3');ctx.fillStyle=sky;ctx.fillRect(0,0,1024,258);
    const sea=ctx.createLinearGradient(0,256,0,512);sea.addColorStop(0,'#277ca5');sea.addColorStop(.35,'#155b86');sea.addColorStop(1,'#07385f');ctx.fillStyle=sea;ctx.fillRect(0,256,1024,256);
    ctx.fillStyle='rgba(239,250,255,.82)';ctx.fillRect(0,254,1024,3);
    ctx.strokeStyle='rgba(224,245,255,.24)';ctx.lineWidth=2;
    for(let y=286;y<510;y+=28){ctx.beginPath();for(let x=0;x<=1024;x+=28){const yy=y+Math.sin(x*.025+y*.03)*5;if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);}ctx.stroke();}
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
  }

  function buildSea(deckMode){
    const T=state.THREE;
    const horizon=new T.Mesh(new T.PlaneGeometry(420,120),new T.MeshBasicMaterial({map:horizonTexture(),fog:false}));
    horizon.position.set(0,1.6,deckMode?-122:-132);state.scene.add(horizon);
    const geo=new T.PlaneGeometry(deckMode?220:180,deckMode?220:100,MOBILE?28:48,MOBILE?28:34);
    geo.rotateX(-Math.PI/2);
    const mat=material(0x17628b,{roughness:.38,metalness:.18,transparent:true,opacity:.94});
    const sea=new T.Mesh(geo,mat);sea.position.set(0,deckMode?-.8:-1.5,deckMode?0:-56);state.scene.add(sea);
    const sun=new T.Mesh(new T.SphereGeometry(deckMode?3.6:2.4,24,16),new T.MeshBasicMaterial({color:0xffe6a0}));sun.position.set(-28,deckMode?20:15,deckMode?-92:-108);state.scene.add(sun);
    const base=Float32Array.from(geo.attributes.position.array);
    state.waves.push({mesh:sea,base});
    for(let i=0;i<(MOBILE?3:6);i++){
      const ship=new T.Group();
      box(ship,[2.2,.34,.55],[0,0,0],material(i%2?0x263645:0x692d28));
      box(ship,[.65,.5,.48],[-.45,.4,0],material(0xd7e2e6));
      const lamp=cylinder(ship,.05,.08,[.7,.3,0],material(0xffdc7b,{emissive:0xffb52e,emissiveIntensity:3}),[Math.PI/2,0,0]);
      ship.position.set(-28+i*12,.15,deckMode?-44-i*8:-66-i*10);
      state.scene.add(ship);state.distantShips.push({object:ship,speed:.12+i*.025,start:ship.position.x,lamp});
    }
  }

  function buildRoomDetails(area){
    const steel=material(0x70828d,{metalness:.64,roughness:.34});
    const dark=material(0x15232e,{metalness:.28,roughness:.62});
    if(area.theme==='bridge'){
      box(state.scene,[18,.9,2.1],[0,.45,-5.1],dark,[0,0,0]);
      box(state.scene,[7,.8,1.5],[0,.4,-2.4],dark);
    }else if(area.theme==='corridor'){
      for(let z=-9;z<=9;z+=3) box(state.scene,[5.2,.03,.08],[0,.02,z],material(0xe1c05c,{emissive:0x5a4510,emissiveIntensity:.5}));
      cylinder(state.scene,.07,24,[-2.45,2.5,0],steel,[Math.PI/2,0,0]);
    }else if(area.theme==='deck'){
      cylinder(state.scene,.62,1.15,[-3.2,.55,-6.2],dark,[0,0,Math.PI/2]);
      cylinder(state.scene,.23,1.4,[3.4,.22,-3.5],steel,[0,0,Math.PI/2]);
      box(state.scene,[3.4,.12,1.2],[0,.05,-12.8],material(0x344551));
      for(let z=-11;z<11;z+=4){cylinder(state.scene,.2,.7,[-4.2,.3,z],dark);cylinder(state.scene,.2,.7,[4.2,.3,z],dark);}
    }else if(area.theme==='engine'){
      for(let x=-6;x<=6;x+=4) cylinder(state.scene,1.05,3,[x,1.4,4.2],material(0x36444c,{metalness:.48}),[Math.PI/2,0,0]);
      cylinder(state.scene,.12,18,[-8,4,0],material(0xa44c33,{metalness:.5}),[Math.PI/2,0,0]);
      cylinder(state.scene,.15,16,[8,3.5,1],material(0x3a7b9d,{metalness:.5}),[Math.PI/2,0,0]);
    }else if(area.theme==='cabin'){
      box(state.scene,[3.4,.5,6],[3.2,.25,.4],material(0x17273a));
      box(state.scene,[3.2,.28,5.6],[3.2,.63,.4],material(0x7891a7,{roughness:.92}));
      box(state.scene,[3,.85,1.2],[-2.7,.45,-2.6],dark);
      box(state.scene,[1.5,2.5,1],[-4.4,1.25,1.5],material(0x293d4d));
    }else if(area.theme==='mess'){
      [-2.8,2.8].forEach(x=>{box(state.scene,[4.2,.18,2.1],[x,.82,-.6],material(0x52606a));for(let dz=-1;dz<=1;dz+=2)box(state.scene,[3.6,.7,.35],[x,.35,-.6+dz*1.25],dark);});
    }else if(area.theme==='galley'){
      box(state.scene,[11,1.1,1.4],[0,.55,-4],steel);
      box(state.scene,[1.8,2.5,1.4],[4.8,1.25,-2.2],material(0xd9e3e6,{metalness:.42}));
      for(let x=-4;x<2;x+=1.6)cylinder(state.scene,.34,.12,[x,1.16,-3.9],material(0x11161a),[Math.PI/2,0,0]);
    }else if(area.theme==='infirmary'){
      box(state.scene,[4.5,.6,2.2],[2.3,.45,-1.2],material(0xe5ecee));
      box(state.scene,[4.2,.25,2],[2.3,.86,-1.2],material(0x9ed3dc));
      box(state.scene,[2.4,2.5,.8],[-4.5,1.25,-2.6],material(0xd8e4e6));
    }else if(area.theme==='radio'||area.theme==='cargo'){
      box(state.scene,[area.size[0]-2,1.2,1.6],[0,.6,-area.size[1]/2+1.1],dark);
    }
  }

  function screenTexture(type,label){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=512;canvas.height=288;
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const item={canvas,ctx:canvas.getContext('2d'),texture,type,label,last:0};
    state.animatedScreens.push(item);drawScreen(item,0,true);return texture;
  }

  function drawScreen(item,time,force){
    if(!force && time-item.last<.09) return;
    item.last=time;
    const c=item.ctx,w=item.canvas.width,h=item.canvas.height;
    c.clearRect(0,0,w,h);c.fillStyle='#06121b';c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(102,199,237,.18)';c.lineWidth=1;
    for(let x=0;x<w;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<h;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.font='bold 23px monospace';c.fillStyle='#dcecf4';c.fillText(item.label,18,34);
    const kind=String(item.type||'').toLowerCase();
    if(kind.includes('radar')){
      const cx=260,cy=158,r=112;c.strokeStyle='#48d58d';c.lineWidth=2;
      [r,r*.68,r*.34].forEach(rr=>{c.beginPath();c.arc(cx,cy,rr,0,Math.PI*2);c.stroke();});
      const a=(time*.72)%(Math.PI*2);c.strokeStyle='#8affbf';c.lineWidth=4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.stroke();
      [[.6,.2],[-.45,.55],[.1,-.72]].forEach((p,i)=>{c.fillStyle=i===1?'#ffcc66':'#7ff0b1';c.beginPath();c.arc(cx+p[0]*r,cy+p[1]*r,5,0,Math.PI*2);c.fill();});
      c.fillStyle='#8fb5c8';c.font='16px monospace';c.fillText('CPA 0.8 NM  TCPA 12 MIN',18,270);
    }else if(kind.includes('ecdis')||kind.includes('cargo')||kind.includes('ballast')){
      c.fillStyle='#9edbe6';c.fillRect(10,48,w-20,h-62);c.fillStyle='#e7d982';
      c.beginPath();c.moveTo(10,80);c.lineTo(120,64);c.lineTo(175,150);c.lineTo(105,235);c.lineTo(10,210);c.closePath();c.fill();
      c.strokeStyle='#d02e42';c.lineWidth=5;c.beginPath();c.moveTo(85,230);c.lineTo(210,185);c.lineTo(325,125);c.lineTo(470,90);c.stroke();
      c.fillStyle='#ffcf4f';[85,210,325,470].forEach((x,i)=>{c.beginPath();c.arc(x,230-i*47,7,0,Math.PI*2);c.fill();});
      c.fillStyle='#12384b';c.font='16px monospace';c.fillText('ROUTE CHECK OK · XTE 0.02 NM',190,268);
    }else if(kind.includes('vhf')||kind.includes('mf')||kind.includes('navtex')||kind.includes('epirb')||kind.includes('sart')){
      c.fillStyle='#102c41';c.fillRect(30,65,w-60,145);c.strokeStyle='#4f9ac4';c.lineWidth=3;c.strokeRect(30,65,w-60,145);
      c.fillStyle='#ffcf5a';c.font='bold 64px monospace';c.fillText(kind.includes('vhf')?'CH 16':'GMDSS',70,150);
      c.fillStyle='#9fd1e7';c.font='18px monospace';c.fillText('DSC WATCH · GPS VALID · PWR HIGH',55,190);
      c.fillStyle=(Math.floor(time*2)%2)?'#ef5b5b':'#7df0b0';c.fillRect(430,76,28,18);
    }else{
      c.fillStyle='#70e5a6';c.font='19px monospace';
      ['SYSTEM READY','ALARM LIST  0','SENSOR FEED OK','STANDBY'].forEach((line,i)=>c.fillText(line,42,88+i*42));
      c.fillStyle='#ffcf5a';c.fillRect(350,82,90,18);c.fillStyle='#e96962';c.fillRect(350,124,55,18);
    }
    item.texture.needsUpdate=true;
  }

  function createStation(def){
    const T=state.THREE,g=new T.Group();g.position.set(def.x,0,def.z);
    const base=material(def.action==='walkTask'?0x245b45:0x213342,{metalness:.34});
    if(def.kind==='console'||def.device||def.kind==='screen'){
      box(g,[1.55,.82,.72],[0,.48,0],base);
      const frame=box(g,[1.34,.76,.12],[0,1.25,.22],material(0x0a1015,{metalness:.5}));
      const tex=screenTexture(def.device||def.id,def.label);
      const display=new T.Mesh(new T.PlaneGeometry(1.12,.58),new T.MeshBasicMaterial({map:tex}));
      display.position.set(0,1.27,.292);g.add(display);
      g.lookAt(0,1.05,0);
    }else if(def.kind==='bed'){
      box(g,[2.4,.5,1.35],[0,.3,0],material(0xcad8dd));box(g,[.65,.18,1.1],[-.75,.66,0],material(0x85a8b8));
    }else if(def.kind==='winch'){
      cylinder(g,.62,1.4,[0,.65,0],material(0x1d2a32,{metalness:.62}),[0,0,Math.PI/2]);
      cylinder(g,.24,1.8,[0,.65,0],material(0x8b6742,{metalness:.3}),[0,0,Math.PI/2]);
    }else if(def.kind==='machine'){
      cylinder(g,.58,1.6,[0,.8,0],base);box(g,[1.6,.25,1.2],[0,.18,0],material(0x141d23));
    }else if(def.kind==='valve'){
      cylinder(g,.09,1.5,[0,.8,0],material(0x8a9ba5));
      const wheel=new T.Mesh(new T.TorusGeometry(.42,.06,10,28),material(0xd45142,{metalness:.42}));wheel.position.y=1.45;wheel.rotation.x=Math.PI/2;g.add(wheel);
    }else if(def.kind==='wall'||def.kind==='locker'){
      box(g,[1.5,def.kind==='locker'?2.2:1.2,.18],[0,def.kind==='locker'?1.1:1.5,0],material(def.kind==='locker'?0xd4dee0:0x18364b));
    }else if(def.kind==='safe'){
      const ring=new T.Mesh(new T.RingGeometry(.7,1,40),new T.MeshBasicMaterial({color:0x68e39d,side:T.DoubleSide,transparent:true,opacity:.7}));
      ring.rotation.x=-Math.PI/2;ring.position.y=.025;g.add(ring);
    }else if(def.kind==='view'||def.kind==='ladder'){
      cylinder(g,.08,1.1,[0,.55,0],material(0xe2c15c,{emissive:0x5c4610,emissiveIntensity:.6}));
    }else{
      box(g,[1.45,.82,.82],[0,.42,0],base);
    }
    state.scene.add(g);registerInteraction(def,g);
  }

  function createDoor(def){
    const T=state.THREE,g=new T.Group();g.position.set(def.x,0,def.z);g.lookAt(0,1.2,0);
    const frame=material(0x8195a2,{metalness:.68,roughness:.28});
    box(g,[1.9,.12,.18],[0,.06,0],frame);box(g,[1.9,.16,.18],[0,2.45,0],frame);
    box(g,[.14,2.5,.18],[-.93,1.25,0],frame);box(g,[.14,2.5,.18],[.93,1.25,0],frame);
    const panel=box(g,[1.65,2.25,.12],[0,1.18,.02],material(0x173246,{emissive:0x071a2a,emissiveIntensity:.7}));
    const lamp=box(g,[.42,.08,.08],[0,2.25,.12],material(0x74e7aa,{emissive:0x36e88b,emissiveIntensity:3}));
    state.scene.add(g);registerInteraction(def,g);g.userData.lamp=lamp;g.userData.panel=panel;
  }

  function uniformColors(kind){
    const map={officer:[0x0b1b2c,0xf0ca62],deck:[0x102b3e,0xef8b2d],engine:[0x172c38,0xf07828],cadet:[0x12243a,0xd7edf8],cook:[0xf0f3f2,0x25292c],medical:[0x58a3af,0xffffff]};
    return map[kind]||map.deck;
  }

  function createNpcNameplate(label){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=80;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,256,80);
    ctx.fillStyle='rgba(3,14,23,.86)';
    ctx.strokeStyle='rgba(118,230,166,.72)';
    ctx.lineWidth=3;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(8,14,240,48,12);
    else ctx.rect(8,14,240,48);
    ctx.fill();ctx.stroke();
    ctx.fillStyle='#eafff2';
    ctx.font='700 22px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(label||'CREW').slice(0,18),128,39);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));
    sprite.position.set(0,2.72,0);
    sprite.scale.set(1.8,.56,1);
    sprite.renderOrder=30;
    return sprite;
  }

  function createNpcFigureSprite(label, uniform, index){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=384;
    const ctx=canvas.getContext('2d');
    const palette={
      officer:['#071c34','#f0ca62'],deck:['#173c55','#ef8b2d'],engine:['#222d35','#f07828'],
      cadet:['#123456','#d7edf8'],cook:['#f4f7f4','#25292c'],medical:['#58a3af','#ffffff'],crew:['#163451','#72e4a6']
    };
    const p=palette[uniform]||palette.crew;
    const skin=['#9a6248','#d0a07d','#6f4838'][Math.abs(index||0)%3];
    ctx.clearRect(0,0,256,384);
    ctx.shadowColor='rgba(0,0,0,.58)';ctx.shadowBlur=18;ctx.shadowOffsetY=14;
    ctx.fillStyle='rgba(8,20,30,.42)';ctx.beginPath();ctx.ellipse(128,348,52,13,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.fillStyle=p[0];
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(78,126,100,146,28) : ctx.rect(78,126,100,146);ctx.fill();
    ctx.fillStyle=p[1];ctx.fillRect(78,178,100,15);
    ctx.fillStyle=p[0];
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(66,134,24,118,12) : ctx.rect(66,134,24,118);ctx.fill();
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(166,134,24,118,12) : ctx.rect(166,134,24,118);ctx.fill();
    ctx.fillStyle=p[0];
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(90,258,31,78,12) : ctx.rect(90,258,31,78);ctx.fill();
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(135,258,31,78,12) : ctx.rect(135,258,31,78);ctx.fill();
    ctx.fillStyle='#07111e';ctx.fillRect(88,330,36,12);ctx.fillRect(132,330,36,12);
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(128,82,42,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#06111c';ctx.beginPath();ctx.arc(113,82,4,0,Math.PI*2);ctx.arc(143,82,4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(6,17,28,.75)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(128,96,15,.1,Math.PI-.1);ctx.stroke();
    if(uniform==='officer'){ctx.fillStyle='#f2f0e7';ctx.fillRect(88,35,80,18);ctx.fillStyle='#071c34';ctx.fillRect(96,26,64,16);}
    if(uniform==='cook'){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect ? ctx.roundRect(82,24,92,34,14) : ctx.rect(82,24,92,34);ctx.fill();}
    ctx.fillStyle='rgba(3,14,23,.88)';ctx.strokeStyle='rgba(118,230,166,.78)';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect ? ctx.roundRect(34,6,188,28,10) : ctx.rect(34,6,188,28);ctx.fill();ctx.stroke();
    ctx.fillStyle='#eafff2';ctx.font='700 18px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(label||'CREW').slice(0,16),128,20);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));
    sprite.position.set(0,1.55,-.04);
    sprite.scale.set(1.45,2.18,1);
    sprite.renderOrder=28;
    return sprite;
  }
  function createNpc(def,index){
    const T=state.THREE,g=new T.Group(),colors=uniformColors(def.uniform);
    const skin=material(index%3===0?0x9a6248:index%3===1?0xd0a07d:0x6f4838,{roughness:.88});
    const cloth=material(colors[0],{roughness:.72});const trim=material(colors[1],{emissiveIntensity:.35});
    const torso=box(g,[.76,1.02,.42],[0,1.28,0],cloth);
    const head=new T.Mesh(new T.SphereGeometry(.32,24,16),skin);head.position.set(0,2.06,0);g.add(head);
    const leftLeg=box(g,[.25,.84,.26],[-.21,.48,0],cloth);const rightLeg=box(g,[.25,.84,.26],[.21,.48,0],cloth);
    const leftArm=box(g,[.2,.86,.22],[-.52,1.31,0],cloth);const rightArm=box(g,[.2,.86,.22],[.52,1.31,0],cloth);
    box(g,[.62,.09,.42],[0,1.76,0],trim);
    const eyeMat=material(0x071016,{roughness:.5});
    box(g,[.055,.035,.025],[-.1,2.1,-.29],eyeMat);
    box(g,[.055,.035,.025],[.1,2.1,-.29],eyeMat);
    if(def.uniform==='officer') cylinder(g,.34,.09,[0,2.34,0],material(0xf0f0e7),[0,0,0]);
    if(def.uniform==='cook') cylinder(g,.38,.28,[0,2.38,0],material(0xffffff),[0,0,0]);
    const ring=new T.Mesh(new T.TorusGeometry(.58,.035,10,36),new T.MeshBasicMaterial({color:0x72e4a6,transparent:true,opacity:.5,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=.035;g.add(ring);
    g.add(createNpcFigureSprite(def.label, def.uniform, index));
    g.add(createNpcNameplate(def.label));
    g.scale.setScalar(1.18);
    g.position.set(def.x,0,def.z);state.scene.add(g);
    const item=registerInteraction(def,g);
    item.anim={path:def.path||[[def.x,def.z],[def.x,def.z]],speed:def.speed||.15,phase:index*.37,leftLeg,rightLeg,leftArm,rightArm,torso};
    state.npcs.push(item);
  }

  function registerInteraction(def,object){
    const item=Object.assign({},def,{object,marker:null,anim:null});
    object.userData.interaction=item;state.interactions.push(item);return item;
  }

  function buildMarkers(){
    state.ui.markers.innerHTML='';
    let objective={};
    try{objective=callGame('getFirstPersonDirectorTarget')||{};}catch(_err){}
    state.interactions.forEach(item=>{
      const btn=document.createElement('button');
      const roleClass=item.type==='npc'?(' '+(item.uniform||'crew')):'';
      btn.className='fp3d-marker '+item.type+roleClass+(objective.id===item.id?' objective':'');
      btn.dataset.id=item.id;
      btn.innerHTML='<i></i><b>'+item.label+'</b><small>'+item.detail+'</small><em></em>';
      btn.addEventListener('click',ev=>{ev.stopPropagation();walkTo(item);});
      state.ui.markers.appendChild(btn);item.marker=btn;
    });
  }

  function walkTo(item){
    if(!item||!item.object)return;
    const p=item.object.position;
    const dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
    if(dist<3.1){interact(item);return;}
    state.autoTarget={item,x:p.x,z:p.z};state.keys.w=false;state.keys.s=false;state.keys.a=false;state.keys.d=false;
  }

  function updateMarkers(){
    if(!state.camera)return;
    const T=state.THREE,v=new T.Vector3(),area=AREAS[state.area];
    let nearest=null;
    state.interactions.forEach(item=>{
      item.object.getWorldPosition(v);
      const dx=v.x-state.player.x,dz=v.z-state.player.z,dist=Math.hypot(dx,dz);
      if(!nearest||dist<nearest.distance) nearest=Object.assign({},item,{distance:dist,world:{x:v.x,z:v.z}});
      const projected=v.clone();projected.y+=item.type==='npc'?2.45:1.75;projected.project(state.camera);
      const visible=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1.18&&Math.abs(projected.y)<1.15&&dist<15;
      item.marker.classList.toggle('visible',visible);
      item.marker.classList.toggle('near',dist<3.1);
      if(visible){
        item.marker.style.left=((projected.x*.5+.5)*100)+'%';
        item.marker.style.top=((-projected.y*.5+.5)*100)+'%';
        item.marker.style.setProperty('--marker-scale',String(clamp(1.34-dist*.045,.72,1.1)));
        item.marker.querySelector('em').textContent=Math.max(1,Math.round(dist*1.4))+' m';
      }
    });
    state.nearest=nearest;
    const ready=nearest&&nearest.distance<3.1;
    state.ui.prompt.classList.toggle('ready',!!ready);
    state.ui.promptText.textContent=ready?nearest.label:'Bir istasyona yaklaş';
    state.ui.distance.textContent=nearest?Math.max(1,Math.round(nearest.distance*1.4))+' m':'';
    state.ui.use.classList.toggle('ready',!!ready);
    state.ui.use.querySelector('span').textContent=ready?(nearest.type==='door'?'GEÇ':nearest.type==='npc'?'KONUŞ':'KULLAN'):'YAKLAŞ';
    updateMissionDock();
    const bx=area.bounds[0],bz=area.bounds[1];
    state.ui.mapPlayer.style.left=clamp(((state.player.x+bx)/(bx*2))*100,5,95)+'%';
    state.ui.mapPlayer.style.top=clamp(((state.player.z+bz)/(bz*2))*100,5,95)+'%';
    const mapTarget=getDirectorLocalItem(getDirectorTarget());
    state.ui.mapNpcs.innerHTML=state.interactions.map(item=>{
      const p=item.object.position;
      const cls=item.type+(mapTarget&&mapTarget.id===item.id?' target':'')+(drillForItem(item)&&!state.completedDrills[item.id]?' drill':'');
      return '<i class="'+cls+'" style="left:'+clamp(((p.x+bx)/(bx*2))*100,5,95)+'%;top:'+clamp(((p.z+bz)/(bz*2))*100,5,95)+'%"></i>';
    }).join('');
  }

  function resetPlayerToSpawn(){
    const area=AREAS[state.area]||AREAS.bridge;
    const spawn=area.spawn||[0,0,0];
    state.player.x=clamp(spawn[0],-area.bounds[0],area.bounds[0]);
    state.player.z=clamp(spawn[1],-area.bounds[1],area.bounds[1]);
    state.yaw=Number.isFinite(spawn[2])?spawn[2]:0;
    state.pitch=0;
    state.velocity.x=0;state.velocity.z=0;
    state.autoTarget=null;
    state.positions[state.area]=null;
    updateMarkers();
    callGame('showNotif','BİRİNCİ ŞAHIS','Pozisyon toparlandı','Mevcut mahal başlangıç noktasına alındın.');
  }
  function updateAreaUi(){
    const area=AREAS[state.area];
    state.ui.root.dataset.area=state.area;
    state.ui.title.textContent=area.title;state.ui.subtitle.textContent=area.subtitle;state.ui.mapTitle.textContent=area.title;
    let objective='Serbest dolaşım';
    try{
      const target=callGame('getFirstPersonDirectorTarget');
      if(target&&target.reason) objective=target.reason;
    }catch(_err){}
    state.ui.objective.textContent=objective;
    buildAreaNav();
    updateMissionDock();
  }

  function setArea(next){
    if(!AREAS[next]||next===state.area)return;
    saveState();state.previousArea=state.area;state.area=next;
    state.positions[next]=null;
    state.ui.fade.classList.add('active');
    setTimeout(()=>{
      buildScene();
      try{firstPersonArea=next;}catch(_err){}
      callGame('addWatchFeed',AREAS[next].title+': mahal geçişi tamamlandı.','good');
      requestAnimationFrame(()=>state.ui.fade.classList.remove('active'));
    },180);
  }

  function interact(forced){
    const item=forced&&forced.id?forced:state.nearest;
    if(!item)return;
    if(!forced&&item.distance>=3.35){walkTo(item);return;}
    clearLiveEventIfHandled(item);
    if(item.type==='door'){setArea(item.target);return;}
    if(item.type==='npc'){openDialogue(item);return;}
    if(item.device){
      callGame('markWalkTaskDone',item.id,item.label);
      callGame('progressWalkMission','bridge3d',item.id,item.label);
      callGame('openRealBridgeConsole',item.device);
      return;
    }
    if(openTrainingDrill(item))return;
    const action=item.action;
    if(action==='phone')callGame('togglePhone');
    else if(action==='notes'||action==='logbook')callGame(action==='notes'?'openNotes':'openLogbook');
    else if(action==='glossary')callGame('openGlossary');
    else if(action==='map')callGame('openMap');
    else if(action==='binocular')callGame('openFirstPersonBinocularLook','bow');
    else if(action==='sea')callGame('openFirstPersonSeaLook',item.look||'bow');
    else if(action==='deck3d')callGame('openShipOperation3D','mooring3d');
    else if(action==='engine3d')callGame('openShipOperation3D','engine3d');
    else if(action==='cargo')callGame('openShipOperation3D','cargo3d');
    else if(action==='walkTask'){
      callGame('markWalkTaskDone',item.id,item.label);callGame('progressWalkMission','deck',item.id,item.label);
      callGame('showNotif','EMNİYET',item.label,'Snap-back dışındaki güvenli bölge teyit edildi.');
    }else if(action==='rest'){
      callGame('applyEffect',{dinclik:2,sayginlik:0},{skipContractTick:true});
      callGame('showNotif','SERBEST ZAMAN',item.label,'Kısa mola kaydedildi.');
    }else if(action==='ai'){
      callGame('showNotif','AI MATE','Seyir yardımcısı','Mevcut hedefi, riskleri ve cihaz sırasını takip edebilirsin.');
    }
    callGame('addWatchFeed',item.label+': etkileşim tamamlandı.','good');
  }

  function openDialogue(item){
    state.currentDialogue=item;
    state.ui.dialogue.classList.add('show');
    state.ui.dialogue.innerHTML=
      '<div class="fp3d-dialogue-card"><button class="fp3d-dialogue-close" type="button">KAPAT</button>'+
      '<div class="fp3d-dialogue-person '+(item.uniform||'crew')+'"><i></i><span><b>'+item.label+'</b><small>'+item.detail+'</small></span></div>'+
      '<p>'+item.line+'</p><div class="fp3d-dialogue-actions">'+
      '<button type="button" data-tone="professional">“Anlaşıldı, kontrol edip raporlayacağım.”</button>'+
      '<button type="button" data-tone="question">“Dikkat etmem gereken en kritik nokta ne?”</button>'+
      '<button type="button" data-tone="unsafe">“Tamam, ayrıntıya gerek yok.”</button></div></div>';
    state.ui.dialogue.querySelector('.fp3d-dialogue-close').onclick=closeDialogue;
    state.ui.dialogue.querySelectorAll('[data-tone]').forEach(btn=>btn.onclick=()=>respondDialogue(btn.dataset.tone));
  }
  function closeDialogue(){state.currentDialogue=null;state.ui.dialogue.classList.remove('show');state.ui.dialogue.innerHTML='';}
  function respondDialogue(tone){
    const item=state.currentDialogue;if(!item)return;
    const reply=tone==='unsafe'?'Aceleci cevap verdin; zabit seni tekrar uyardı.':tone==='question'?'Kritik noktayı tekrar sorup görevi teyit ettin.':'Emri kapalı çevrim iletişimle tekrar ettin.';
    callGame('addWatchFeed','Stajyer: '+reply,tone==='unsafe'?'warn':'good');
    callGame('pushPhoneMessage',item.label,reply,{open:false});
    callGame('applyEffect',tone==='unsafe'?{sayginlik:-1,yorgunluk:1}:{sayginlik:1},{skipContractTick:true});
    callGame('showNotif','DİYALOG',item.label,tone==='unsafe'?'Aceleci cevap ilişkiye işlendi.':'Konuşma gemi hafızasına kaydedildi.');
    playAreaPulse(tone==='unsafe'?'warn':'drill');
    closeDialogue();
  }

  function updateMovement(dt){
    const area=AREAS[state.area];
    let forward=(state.keys.w||state.keys.arrowup?1:0)-(state.keys.s||state.keys.arrowdown?1:0)-state.stick.y;
    let strafe=(state.keys.d||state.keys.arrowright?1:0)-(state.keys.a||state.keys.arrowleft?1:0)+state.stick.x;
    const manual=Math.abs(forward)+Math.abs(strafe)>.04;
    if(manual)state.autoTarget=null;
    if(state.autoTarget&&!manual){
      const p=state.autoTarget.item.object.position,dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
      if(dist<2.55){
        const arrived = state.autoTarget.item;
        state.autoTarget=null;
        if(arrived) setTimeout(()=>interact(arrived), 0);
      }else{
        const desired=Math.atan2(dx,-dz),delta=Math.atan2(Math.sin(desired-state.yaw),Math.cos(desired-state.yaw));
        state.yaw+=delta*clamp(dt*4,0,1);forward=1;strafe=0;
      }
    }
    const length=Math.hypot(forward,strafe);
    const moving=length>.04;
    if(length>1){forward/=length;strafe/=length;}
    const speed=(state.keys.shift?4.8:3.05)*(MOBILE?.92:1);
    const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);
    const targetVx=(fx*forward+rx*strafe)*speed,targetVz=(fz*forward+rz*strafe)*speed;
    const blend=1-Math.exp(-dt*10);
    state.velocity.x+=(targetVx-state.velocity.x)*blend;state.velocity.z+=(targetVz-state.velocity.z)*blend;
    if(!moving&&!state.autoTarget){state.velocity.x*=Math.pow(.03,dt);state.velocity.z*=Math.pow(.03,dt);}
    state.player.x=clamp(state.player.x+state.velocity.x*dt,-area.bounds[0],area.bounds[0]);
    state.player.z=clamp(state.player.z+state.velocity.z*dt,-area.bounds[1],area.bounds[1]);
    const bob=moving?Math.sin(state.elapsed*10)*.035:Math.sin(state.elapsed*1.5)*.006;
    state.camera.position.set(state.player.x,1.66+bob,state.player.z);
    state.camera.rotation.y=state.yaw;state.camera.rotation.x=state.pitch;
    state.ui.root.classList.toggle('moving',moving);
  }

  function updateWorld(dt){
    const T=state.THREE;
    state.waves.forEach(w=>{
      const attr=w.mesh.geometry.attributes.position,base=w.base;
      for(let i=0;i<attr.count;i++){
        const x=base[i*3],y=base[i*3+1];
        attr.setZ(i,Math.sin(x*.16+state.elapsed*1.25)*.18+Math.cos(y*.22-state.elapsed*.9)*.11);
      }
      attr.needsUpdate=true;
    });
    state.distantShips.forEach((s,i)=>{
      s.object.position.x=s.start+Math.sin(state.elapsed*s.speed+i)*8;
      s.object.position.y=.12+Math.sin(state.elapsed*.7+i)*.08;
      if(s.lamp)s.lamp.visible=Math.floor(state.elapsed*2+i)%2===0;
    });
    state.npcs.forEach((item,index)=>{
      const a=item.anim,p=a.path,t=(Math.sin(state.elapsed*a.speed+a.phase)+1)/2;
      item.object.position.x=p[0][0]+(p[1][0]-p[0][0])*t;
      item.object.position.z=p[0][1]+(p[1][1]-p[0][1])*t;
      const dx=p[1][0]-p[0][0],dz=p[1][1]-p[0][1];item.object.rotation.y=Math.atan2(dx,dz)+(Math.cos(state.elapsed*a.speed+a.phase)<0?Math.PI:0);
      const swing=Math.sin(state.elapsed*7+index)*.32;
      a.leftLeg.rotation.x=swing;a.rightLeg.rotation.x=-swing;a.leftArm.rotation.x=-swing;a.rightArm.rotation.x=swing;
      a.torso.position.y=1.25+Math.abs(Math.sin(state.elapsed*7+index))*.025;
    });
    if(state.elapsed-state.screenTick>.08){
      state.screenTick=state.elapsed;state.animatedScreens.forEach(s=>drawScreen(s,state.elapsed,false));
    }
  }

  function loop(time){
    if(!state.active){state.animationId=0;return;}
    const now=time*.001,dt=clamp(state.lastFrame?now-state.lastFrame:.016,.001,.05);
    state.lastFrame=now;state.elapsed+=dt;
    updateMovement(dt);updateWorld(dt);maybeTriggerLiveEvent();pulseAmbient();updateMarkers();
    state.renderer.render(state.scene,state.camera);
    state.animationId=requestAnimationFrame(loop);
  }

  function startLoop(){
    if(state.animationId)return;
    state.lastFrame=0;state.animationId=requestAnimationFrame(loop);
  }

  async function openWorld(){
    const host=ensureHost();
    state.active=true;
    try{firstPersonActive=true;firstPersonArea=state.area;}catch(_err){}
    document.body.classList.add('firstperson-active','firstperson-3d-active');
    host.panel.classList.add('show');host.panel.focus({preventScroll:true});
    if(!state.ui.root||!state.ui.root.isConnected)renderShell();
    else state.ui.loading.classList.add('show');
    try{
      await loadThree();
      initRenderer();buildScene();state.ready=true;
      state.ui.loading.classList.remove('show');
      requestAnimationFrame(()=>state.ui.fade.classList.remove('active'));
      startLoop();
      callGame('ensureWalkMission',callGame('inferWalkMissionKind'));
      callGame('addWatchFeed','Birinci şahıs gemi dünyası açıldı: mahal geçişleri, hareketli mürettebat ve cihaz etkileşimi aktif.','good');
    }catch(err){
      console.error('First person 3D failed',err);
      state.ui.loading.innerHTML='<b>3D GÖRÜNÜM AÇILAMADI</b><small>'+String(err.message||err)+'</small><button type="button">GÜVENLİ GÖRÜNÜME GEÇ</button>';
      state.ui.loading.querySelector('button').onclick=()=>{
        closeWorld();
        if(typeof legacyOpen==='function')legacyOpen();
      };
    }
  }

  function closeWorld(){
    saveState();state.active=false;state.keys=Object.create(null);state.stick.x=0;state.stick.y=0;state.autoTarget=null;closeDialogue();
    if(state.animationId)cancelAnimationFrame(state.animationId);state.animationId=0;
    try{firstPersonActive=false;}catch(_err){} 
    closeTrainingDrill();
    document.body.classList.remove('firstperson-active','firstperson-3d-active');
    document.getElementById('firstperson-panel')?.classList.remove('show');
  }

  function handleKeydown(ev){
    if(!state.active)return false;
    if(ev.target&&/input|textarea|select/i.test(ev.target.tagName||''))return false;
    const key=String(ev.key||'').toLowerCase();
    if(key==='escape'){
      ev.preventDefault();
      if(state.currentDialogue)closeDialogue();else closeWorld();
      return true;
    }
    if(key==='e'||key==='enter'){ev.preventDefault();interact();return true;}
    if(key==='m'){ev.preventDefault();callGame('openMap');return true;} 
    if(key==='r'){ev.preventDefault();resetPlayerToSpawn();return true;} 
    if(key==='f'){ev.preventDefault();walkToDirectorTarget();return true;}
    if(key==='n'){ev.preventDefault();callGame('openNotes');return true;}
    if(key==='g'){ev.preventDefault();callGame('openGlossary');return true;}
    if(key==='p'){ev.preventDefault();callGame('togglePhone');return true;}
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)){
      ev.preventDefault();state.keys[key]=true;return true;
    }
    return true;
  }
  function handleKeyup(ev){
    if(!state.active)return;
    const key=String(ev.key||'').toLowerCase();
    if(key==='shift')state.keys.shift=false;
    else state.keys[key]=false;
  }
  document.addEventListener('keydown',ev=>{
    if(state.active && handleKeydown(ev)) ev.stopImmediatePropagation();
  },true);
  window.addEventListener('keyup',handleKeyup,{passive:true});
  window.addEventListener('blur',()=>{state.keys=Object.create(null);state.stick.x=0;state.stick.y=0;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.active)startLoop();});

  const legacyOpen=window.openFirstPersonMode;
  window.openFirstPersonMode=openWorld;
  window.closeFirstPersonMode=closeWorld;
  window.setFirstPersonArea=setArea;
  window.interactFirstPerson=interact;
  window.handleFirstPersonKeydown=handleKeydown;
  window.fp3dRespond=respondDialogue;
  window.__GUVERTE_FP3D={state,areas:AREAS,open:openWorld,close:closeWorld,setArea,interact};
})();
