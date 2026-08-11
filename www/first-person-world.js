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
        station('deck-paint','RASPA / BOYA','KKD · izin · havalandirma',-4.2,4.2,{action:'paint',kind:'locker'}),
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
    stage:null,canvas:null,ui:{},area:'bridge',previousArea:'corridor',entryFrom:null,positions:{},
    player:{x:0,z:5},yaw:0,pitch:0,roll:0,velocity:{x:0,z:0},keys:Object.create(null),
    stick:{x:0,y:0,pointerId:null},look:{active:false,pointerId:null,x:0,y:0},runLock:false,
    autoTarget:null,autoNav:{lastDist:0,stuck:0,strafeDir:1,lastX:0,lastZ:0,lastPulse:0},interactions:[],npcs:[],animatedScreens:[],waves:[],distantShips:[],ambientFx:[],colliders:[],discoveries:Object.create(null),visitedAreas:Object.create(null),
    animationId:0,lastFrame:0,elapsed:0,screenTick:0,nearest:null,currentDialogue:null,
    resizeObserver:null,quality:MOBILE?'mobile':'desktop',liveEvent:null,nextEventAt:18,completedDrills:Object.create(null),completedIncidents:Object.create(null),incidentShift:0,pendingDrill:null,audio:null,audioTick:0,footstepTick:0,worldTick:0,watchMinutes:372,weather:'calm',lastDiscovery:'',questIndex:0,questDone:Object.create(null),worldXp:0,streak:0,bestStreak:0,badges:Object.create(null),crewBarkTick:0,crewBark:null,sobTick:0,fieldLog:[],fieldLogTick:0,sceneReportTimer:0,useReactTimer:0,routePulseTimer:0,areaNavFallbackTimer:0,areaArrivalTimer:0,lastAtmosphereNote:'',lastFocusId:'',lastRouteTargetId:'',routeGuides:[],routeBeacon:null,usePulses:[],lights:{}
  };

  function currentIncidentShift(minutes){
    return Math.floor((Number.isFinite(minutes)?minutes:state.watchMinutes)/360);
  }

  function resetIncidentsForNewShift(reason){
    state.completedIncidents=Object.create(null);
    state.incidentShift=currentIncidentShift();
    saveState();
    if(reason){
      pushFieldLog(reason,'info');
      callGame('addWatchFeed',reason,'good');
    }
    if(state.active&&state.scene){
      buildScene();
      requestAnimationFrame(()=>state.ui.fade?.classList.remove('active'));
    }
  }
  function restoreState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      if(saved.area && AREAS[saved.area]) state.area = saved.area;
      if(saved.positions && typeof saved.positions === 'object') state.positions = saved.positions;
      if(Number.isFinite(saved.yaw)) state.yaw = saved.yaw;
      if(Number.isFinite(saved.questIndex)) state.questIndex = saved.questIndex;
      if(saved.questDone && typeof saved.questDone === 'object') state.questDone = saved.questDone;
      if(Number.isFinite(saved.worldXp)) state.worldXp = saved.worldXp;
      if(Number.isFinite(saved.streak)) state.streak = saved.streak;
      if(Number.isFinite(saved.bestStreak)) state.bestStreak = saved.bestStreak;
      if(saved.badges && typeof saved.badges === 'object') state.badges = saved.badges;
      if(saved.discoveries && typeof saved.discoveries === 'object') state.discoveries = saved.discoveries;
      if(saved.visitedAreas && typeof saved.visitedAreas === 'object') state.visitedAreas = saved.visitedAreas;
      if(Number.isFinite(saved.watchMinutes)) state.watchMinutes = saved.watchMinutes;
      const savedShift=Number.isFinite(saved.incidentShift)?saved.incidentShift:currentIncidentShift(state.watchMinutes);
      state.incidentShift=currentIncidentShift(state.watchMinutes);
      if(saved.completedIncidents && typeof saved.completedIncidents === 'object' && savedShift===state.incidentShift) state.completedIncidents = saved.completedIncidents;
    }catch(_err){}
  }
  function saveState(){
    try{
      state.positions[state.area] = {x:state.player.x,z:state.player.z,yaw:state.yaw};
      localStorage.setItem(STORAGE_KEY,JSON.stringify({area:state.area,positions:state.positions,yaw:state.yaw,questIndex:state.questIndex,questDone:state.questDone,worldXp:state.worldXp,streak:state.streak,bestStreak:state.bestStreak,badges:state.badges,discoveries:state.discoveries,visitedAreas:state.visitedAreas,completedIncidents:state.completedIncidents,incidentShift:state.incidentShift,watchMinutes:state.watchMinutes}));
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
        '<div class="fp3d-world-status"><b>ACIK DUNYA</b><span id="fp3d-world-clock">06:12</span><span id="fp3d-world-weather">Sakin deniz</span><small id="fp3d-world-discovery">Gemi icinde serbest dolas</small></div>'+ 
        '<div class="fp3d-risk-meter"><b>RISK</b><span id="fp3d-risk-text">Rutin</span><small id="fp3d-risk-note">Normal vardiya</small><i><em id="fp3d-risk-fill"></em></i></div>'+
        '<div class="fp3d-duty-chain"><b>VARDIYA AKISI</b><span id="fp3d-duty-step">Gorev hazirlaniyor</span><small id="fp3d-duty-progress">0/0</small><i id="fp3d-duty-xp">XP 0</i><em id="fp3d-duty-streak">Seri x0</em></div>'+ 
        '<div class="fp3d-crew-bark"><b id="fp3d-bark-name">MURETTEBAT</b><span id="fp3d-bark-line">Gemi rutini basliyor</span></div>'+ 
        '<div class="fp3d-field-log"><b>SAHA GUNLUGU</b><span id="fp3d-field-log-line">Gemi hazir</span></div>'+ 
        '<div class="fp3d-scene-report" aria-live="polite"></div>'+ 
        '<div class="fp3d-marker-layer"></div>'+
        '<div class="fp3d-crosshair"><i></i></div>'+
        '<div class="fp3d-prompt"><small>ETKİLEŞİM</small><b id="fp3d-prompt-text">Bir istasyona yaklaş</b><span id="fp3d-distance"></span></div>'+
        '<div class="fp3d-minimap"><b id="fp3d-map-title">GEMİ</b><div class="fp3d-map-grid"></div><i id="fp3d-map-route"></i><i id="fp3d-map-player"></i><span id="fp3d-map-npcs"></span></div>'+
        '<div class="fp3d-compass"><b id="fp3d-heading">000</b><i id="fp3d-compass-needle"></i><span id="fp3d-bearing">HEDEF --</span><small id="fp3d-openwork">OLAY 0</small></div>'+
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
      worldStatus:host.stage.querySelector('.fp3d-world-status'),
      worldClock:host.stage.querySelector('#fp3d-world-clock'),
      worldWeather:host.stage.querySelector('#fp3d-world-weather'),
      worldDiscovery:host.stage.querySelector('#fp3d-world-discovery'),
      riskMeter:host.stage.querySelector('.fp3d-risk-meter'),
      riskText:host.stage.querySelector('#fp3d-risk-text'),
      riskNote:host.stage.querySelector('#fp3d-risk-note'),
      riskFill:host.stage.querySelector('#fp3d-risk-fill'),
      dutyChain:host.stage.querySelector('.fp3d-duty-chain'),
      dutyStep:host.stage.querySelector('#fp3d-duty-step'),
      dutyProgress:host.stage.querySelector('#fp3d-duty-progress'),
      dutyXp:host.stage.querySelector('#fp3d-duty-xp'),
      dutyStreak:host.stage.querySelector('#fp3d-duty-streak'),
      crewBark:host.stage.querySelector('.fp3d-crew-bark'),
      barkName:host.stage.querySelector('#fp3d-bark-name'),
      barkLine:host.stage.querySelector('#fp3d-bark-line'),
      fieldLog:host.stage.querySelector('.fp3d-field-log'),
      fieldLogLine:host.stage.querySelector('#fp3d-field-log-line'),
      sceneReport:host.stage.querySelector('.fp3d-scene-report'),
      prompt:host.stage.querySelector('.fp3d-prompt'),
      promptText:host.stage.querySelector('#fp3d-prompt-text'),
      distance:host.stage.querySelector('#fp3d-distance'),
      title:host.stage.querySelector('#fp3d-area-title'),
      subtitle:host.stage.querySelector('#fp3d-area-subtitle'),
      objective:host.stage.querySelector('#fp3d-objective'),
      mapTitle:host.stage.querySelector('#fp3d-map-title'),
      mapPlayer:host.stage.querySelector('#fp3d-map-player'),
      mapRoute:host.stage.querySelector('#fp3d-map-route'),
      mapNpcs:host.stage.querySelector('#fp3d-map-npcs'),
      compass:host.stage.querySelector('.fp3d-compass'),
      heading:host.stage.querySelector('#fp3d-heading'),
      compassNeedle:host.stage.querySelector('#fp3d-compass-needle'),
      bearing:host.stage.querySelector('#fp3d-bearing'),
      openWork:host.stage.querySelector('#fp3d-openwork'),
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
    state.ui.use.addEventListener('pointerdown',()=>state.ui.use.classList.add('pressed'));
    ['pointerup','pointercancel','pointerleave'].forEach(type=>state.ui.use.addEventListener(type,()=>state.ui.use.classList.remove('pressed')));
    state.ui.use.addEventListener('click',interact);
    state.ui.routeAction?.addEventListener('click',walkToDirectorTarget);
    state.ui.run.addEventListener('click',()=>{if(!MOBILE)return;state.runLock=!state.runLock;state.keys.shift=state.runLock;state.ui.run.classList.toggle('locked',state.runLock);state.ui.run.classList.toggle('active',state.runLock);hapticPulse(state.runLock?'good':'tap');});
    state.ui.run.addEventListener('pointerdown',()=>{if(MOBILE)return;state.keys.shift=true;state.ui.run.classList.add('active');});
    ['pointerup','pointercancel','pointerleave'].forEach(type=>state.ui.run.addEventListener(type,()=>{if(state.runLock)return;state.keys.shift=false;state.ui.run.classList.remove('active');}));
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
  const WORLD_INCIDENTS = {
    bridge:[
      {id:'bridge-bearing-check',label:'KERTERIZ TEYIDI',detail:'Gorsel hedef / pusula tekrar',x:-8.2,z:-2.8,tone:'nav',report:{title:'Kerteriz teyidi',meta:'Bridge wing / visual bearing',steps:['Hedefi gorsel olarak sec.','Pusula kerterizini radar/ECDIS ile karsilastir.','Kerteriz sabitse CPA riskini zabite bildir.']}},
      {id:'bridge-night-order',label:'GECE EMRI',detail:'Kaptan talimati / vardiya notu',x:-7.7,z:1.8,tone:'info',report:{title:'Gece emri kontrolu',meta:'Master standing orders',steps:['Gecerli hava ve trafik notunu oku.','Cagirma kriterlerini isaretle.','Vardiya defterine okundu teyidi dus.']}}
    ],
    corridor:[
      {id:'corridor-muster-tag',label:'MUSTER ETIKETI',detail:'Acil rol listesi kontrolu',x:-1.7,z:-.4,tone:'urgent',report:{title:'Acil rol listesi',meta:'Muster station / emergency duty',steps:['Kendi acil gorevini listede bul.','Toplanma mahallini ve can yelek noktasini teyit et.','Eksik isim varsa zabite bildir.']}},
      {id:'corridor-wet-floor',label:'ISLAK ZEMIN',detail:'Kayma riski / rapor',x:1.4,z:5.4,tone:'warn',report:{title:'Islak zemin bildirimi',meta:'Housekeeping / slip hazard',steps:['Alani isaretle ve kosuyu kes.','Sizinti kaynagini ara.','Temizlik veya teknik ekip kaydi ac.']}}
    ],
    deck:[
      {id:'deck-loose-line',label:'GEVSEK HALAT',detail:'Snap-back disi kontrol',x:-3.9,z:-8.2,tone:'warn',report:{title:'Gevsek halat kontrolu',meta:'Mooring deck / line safety',steps:['Snap-back alaninin disinda dur.','Halat yuk yonunu ve surtunme noktasini kontrol et.','Lostromoya gerilim durumunu raporla.']}},
      {id:'deck-flag-locker',label:'FLAMA DOLABI',detail:'H / Q / pilot isaretleri',x:4.2,z:3.2,tone:'nav',report:{title:'Flama dolabi',meta:'Signal flags',steps:['Pilot operasyonu icin H flamasini hazirla.','Q ve diger operasyon flamalarini ayir.','Kotu havada baglama noktasini tekrar kontrol et.']}}
    ],
    engine:[
      {id:'engine-hot-surface',label:'SICAK YUZEY',detail:'Yanma riski / izolasyon',x:6.2,z:2.8,tone:'engine',report:{title:'Sicak yuzey',meta:'Engine room hazard',steps:['Temas mesafesini koru.','Izolasyon ve uyari levhasini kontrol et.','Trend artiyorsa ECR kaydina bildir.']}},
      {id:'engine-leak-pan',label:'YAG DAMLASI',detail:'Leak tray / kirlilik riski',x:-4.8,z:3.8,tone:'warn',report:{title:'Yag sizinti kontrolu',meta:'Leak tray',steps:['Damlama noktasini bezle degil kaynakla tespit et.','Bilgeye karisma riskini kontrol et.','Makine zabitine miktar ve konumu bildir.']}}
    ],
    radio:[
      {id:'radio-battery-test',label:'BATARYA TESTI',detail:'GMDSS reserve power',x:3.2,z:1.8,tone:'radio',report:{title:'GMDSS batarya testi',meta:'Reserve power',steps:['Voltaj ve kapasite gostergesini oku.','Test saatini radio loga yaz.','Dusuk deger varsa kaptan ve elektrikciye bildir.']}},
      {id:'radio-navtex-print',label:'NAVTEX CIKTISI',detail:'MSI mesaj secimi',x:3.8,z:-1.6,tone:'radio',report:{title:'NAVTEX mesaj ayiklama',meta:'MSI / navigational warning',steps:['Mesaj tipini ve bolge kodunu oku.','Rota ile ilgili uyarilari ayir.','Kopruustu vardiyasina kisa ozet ver.']}}
    ],
    cargo:[
      {id:'cargo-lashing-alert',label:'LASHING ALARMI',detail:'Reefer / securing kontrolu',x:5.5,z:-2.2,tone:'cargo',report:{title:'Lashing alarmi',meta:'Cargo securing',steps:['Alarm satirini ve bay bilgisini oku.','Gemi hareketi ve rulo etkisini not et.','1. zabite kontrol onceligi raporla.']}},
      {id:'cargo-tide-window',label:'GELGIT PENCERESI',detail:'ETD / draft / UKC',x:-5.6,z:1.9,tone:'cargo',report:{title:'Gelgit penceresi',meta:'Tide window',steps:['ETD saatini gelgit tablosuyla eslestir.','Draft ve UKC payini birlikte hesapla.','Riskli pencere varsa operasyon sirasini revize et.']}}
    ],
    cabin:[
      {id:'cabin-fatigue-note',label:'YORGUNLUK NOTU',detail:'Uyku / moral takibi',x:1.6,z:-2.2,tone:'life',report:{title:'Yorgunluk notu',meta:'Fatigue management',steps:['Son uyku suresini yaz.','Moral durumunu saklamadan isaretle.','Gerekirse vardiya zabitine haber ver.']}},
      {id:'cabin-family-photo',label:'AILE FOTOGRAFI',detail:'Moral / odaklanma',x:-3.5,z:-.3,tone:'life',report:{title:'Aile fotografi',meta:'Homesick moment',steps:['Kisa nefes al ve mesajini toparla.','Vardiya oncesi dikkatini tekrar hedefe getir.','Ozlem artarsa yorgunluk notuna ekle.']}}
    ],
    mess:[
      {id:'mess-crew-mood',label:'EKIP MORALI',detail:'Kisa sohbet / vardiya havasi',x:2.4,z:.8,tone:'info',report:{title:'Ekip morali',meta:'Crew welfare',steps:['Sohbette yorgunluk ve gerginlik sinyallerini dinle.','Guverte ve makine notlarini ayir.','Vardiya oncesi kritik bilgiyi deftere ekle.']}}
    ],
    galley:[
      {id:'galley-grease-risk',label:'YAG YANGINI RISKI',detail:'Kuzine / sondurucu',x:-3.2,z:-2.1,tone:'warn',report:{title:'Yag yangini riski',meta:'Galley safety',steps:['Sicak yag ve havalandirma durumunu kontrol et.','Dogru sondurucuyu ve yangin battaniyesini bul.','Su kullanilmayacagini ekibe hatirlat.']}}
    ],
    infirmary:[
      {id:'medical-oxygen-check',label:'OKSIJEN KONTROLU',detail:'Basinc / maske / kayit',x:-3.2,z:-1.8,tone:'info',report:{title:'Oksijen kontrolu',meta:'Medical locker',steps:['Tup basincini oku.','Maske ve hortumu gorerek kontrol et.','Eksik varsa saglik sorumlusuna bildir.']}}
    ]
  };
  const WORLD_QUESTS = [
    {id:'q-watch-start',area:'bridge',target:'captain',title:'Vardiyayi devral',reason:'Kaptandan gece emrini al ve kopruustu rutinine basla.',log:'Kaptan gece emrini verdi; stajyer vardiyaya hazir.'},
    {id:'q-ecdis-tide',area:'bridge',target:'ecdis',title:'Gelgit / UKC kontrolu',reason:'ECDIS uzerinden rota, safety contour ve gelgit payini teyit et.',log:'ECDIS rota ve gelgit/UKC kontrolu acik dunya gorev zincirine islendi.'},
    {id:'q-radar-half',area:'bridge',target:'radar',title:'Yarim daire seyri',reason:'Radar hedefinde CPA/TCPA ve nispi kerterizi kontrol et.',log:'Radar uzerinde yarim daire seyri ve carpisma riski degerlendirildi.'},
    {id:'q-gmdss',area:'radio',target:'radio-vhf',title:'Acil haberlesme',reason:'GMDSS odasina gec, VHF/DSC distress sirasini uygula.',log:'Acil haberlesme zinciri GMDSS odasinda uygulandi.'},
    {id:'q-morse',area:'radio',target:'radio-mf',title:'Mors kodu',reason:'MF/HF basinda SOS ritmini coz ve kayda gec.',log:'Mors kodu talimi tamamlandi.'},
    {id:'q-buoy-light',area:'deck',target:'deck-sea-stbd',title:'Samandira ve fener okuma',reason:'Sancak bordadan fener karakteri, renk ve periyot okumasini yap.',log:'Fener/samandira gozlemi acik dunyada tamamlandi.'},
    {id:'q-flag-pilot',area:'deck',target:'deck-pilot',title:'Flama ve pilot hazirligi',reason:'Pilot merdiveni, borda isigi, can simidi ve isaretleri kontrol et.',log:'Pilot/flama hazirligi guvertede tamamlandi.'},
    {id:'q-paint-safety',area:'deck',target:'deck-paint',title:'Raspa-boya emniyeti',reason:'Raspa boya oncesi KKD, izin, havalandirma ve alan emniyetini teyit et.',log:'Raspa-boya emniyeti guverte gorevine baglandi.'},
    {id:'q-engine-alarm',area:'engine',target:'engine-ecr',title:'Makine alarmi',reason:'ECR alarm panelinde trendi oku, kaynagi dogrula, kopruye raporla.',log:'Makine alarmi ECR uzerinden degerlendirildi.'},
    {id:'q-cargo-tide',area:'cargo',target:'cargo-ballast',title:'Gelgit / ballast hesabi',reason:'Ballast ve gelgit etkisini trim/list ile birlikte kontrol et.',log:'Cargo-ballast gelgit hesabi tamamlandi.'},
    {id:'q-homesick',area:'cabin',target:'cabin-phone',title:'Aile ozlemi',reason:'Kamaraya gec, aile mesajini oku ve moralini saklamadan yonet.',log:'Aile ozlemi sahnesi acik dunya akisina baglandi.'},
    {id:'q-mess-check',area:'mess',target:'cook-mess',title:'Ekip rutini',reason:'Messroomda ekipten gece durumu ve moral bilgisini al.',log:'Messroom ekip rutini tamamlandi.'}
  ];

  function getWorldRank(){
    if(state.worldXp>=120) return 'Usta Stajyer';
    if(state.worldXp>=70) return 'Guvenilir Vardiyaci';
    if(state.worldXp>=35) return 'Gemiye Alisan';
    return 'Yeni Stajyer';
  }

  function updateRewardHud(){
    if(state.ui.dutyXp) state.ui.dutyXp.textContent=getWorldRank()+' · XP '+state.worldXp;
    if(state.ui.dutyStreak) state.ui.dutyStreak.textContent='Seri x'+state.streak+' · Rekor '+state.bestStreak;
  }

  function awardWorldProgress(source,amount){
    const key=source?.id || source?.label || String(source||'progress');
    if(source&&source.once&&state.badges[key]) return false;
    state.worldXp+=amount||4;
    state.streak+=1;
    state.bestStreak=Math.max(state.bestStreak,state.streak);
    if(source&&source.once) state.badges[key]=true;
    updateRewardHud();
    if(state.ui.dutyChain){
      state.ui.dutyChain.classList.add('pulse','reward');
      setTimeout(()=>state.ui.dutyChain&&state.ui.dutyChain.classList.remove('reward'),900);
    }
    saveState();
    return true;
  }
  function getActiveWorldQuest(){
    return WORLD_QUESTS[Math.min(state.questIndex,WORLD_QUESTS.length-1)] || null;
  }

  function updateDutyChain(){
    if(!state.ui.dutyChain) return;
    const quest=getActiveWorldQuest();
    const doneCount=Math.min(state.questIndex,WORLD_QUESTS.length);
    state.ui.dutyChain.classList.toggle('complete',doneCount>=WORLD_QUESTS.length);
    if(!quest || doneCount>=WORLD_QUESTS.length){
      state.ui.dutyStep.textContent='Serbest vardiya: gemiyi kesfetmeye devam et';
      state.ui.dutyProgress.textContent=WORLD_QUESTS.length+'/'+WORLD_QUESTS.length;
      updateRewardHud();
      return;
    }
    state.ui.dutyStep.textContent=quest.title;
    state.ui.dutyProgress.textContent=doneCount+'/'+WORLD_QUESTS.length;
      updateRewardHud();
  }

  function flashDutyChain(done,nextQuest){
    if(!state.ui.dutyChain)return;
    state.ui.dutyChain.classList.add('pulse');
    if(state.ui.dutyStep) state.ui.dutyStep.textContent=nextQuest?'Tamam: '+done.title+' / Siradaki: '+nextQuest.title:'Tum vardiya zinciri tamamlandi';
    if(state.ui.dutyProgress) state.ui.dutyProgress.textContent=Math.min(state.questIndex,WORLD_QUESTS.length)+'/'+WORLD_QUESTS.length;
    setTimeout(()=>{if(state.ui.dutyChain){state.ui.dutyChain.classList.remove('pulse');updateDutyChain();}},2100);
  }
  function advanceWorldQuest(item){
    const quest=getActiveWorldQuest();
    if(!quest || !item) return false;
    const match=quest.target===item.id || quest.target===item.device || quest.target===item.action;
    if(!match) return false;
    state.questDone[quest.id]=true;
    awardWorldProgress({id:quest.id,once:true},14);
    state.questIndex=Math.min(state.questIndex+1,WORLD_QUESTS.length);
    state.lastDiscovery='Gorev tamamlandi: '+quest.title;
    saveState();
    const nextQuest=getActiveWorldQuest();
    updateDutyChain();
    flashDutyChain(quest,nextQuest);
    if(state.ui.worldDiscovery) state.ui.worldDiscovery.textContent=state.lastDiscovery;
    pushFieldLog('Gorev tamam: '+quest.title+(nextQuest?' / Siradaki: '+nextQuest.title:''),'good');
    callGame('addWatchFeed','Acik dunya gorevi: '+quest.log+(nextQuest?' Siradaki: '+nextQuest.title:''),'good');
    callGame('showNotif','ACIK DUNYA',quest.title,nextQuest?'Gorev tamamlandi. Siradaki hedef: '+nextQuest.title:'Vardiya zinciri tamamlandi. Serbest kesif acildi.');
    playAreaPulse('drill');
    return true;
  }
  const FP_DRILLS = {
    vhf:{title:'Acil Haberleşme',q:'Mayday çağrısında doğru ilk bilgi sırası hangisi?',a:0,opts:['Gemi adı / konum / tehlike / istenen yardım','Önce şirket, sonra aile, sonra VTS','Sadece kanal ve hava durumu'],effect:{bilgi:2,sayginlik:1}},
    'radio-vhf':{title:'DSC / VHF',q:'Distress alert sonrası telsizde ne yapılır?',a:1,opts:['Telefonla kaptanı ararım','Mayday mesajını konum ve tehlike türüyle tekrarlarım','AIS hedef adını okurum'],effect:{bilgi:2}},
    'radio-mf':{title:'Mors Kodu',q:'... --- ... hangi mesajdır?',a:2,opts:['Pan-pan','Securite','SOS'],effect:{bilgi:2}},
    ecdis:{title:'Gelgit ve UKC',q:'Gelgit tablosunda emniyetli UKC için ne kontrol edilir?',a:0,opts:['Chart datum, saat, yükseklik ve draft toplamı','Sadece rüzgar yönü','Sadece AIS rotası'],effect:{bilgi:2}},
    radar:{title:'Yarım Daire Seyri',q:'Çatışma riski artarken güvenli kararın temeli nedir?',a:1,opts:['Sadece hız artırmak','CPA/TCPA, nispi kerteriz ve COLREG değerlendirmesi','Sadece siren çalmak'],effect:{bilgi:2,sayginlik:1}},
    ais:{title:'Şamandıra / Fener',q:'Fener karakteri nasıl okunur?',a:2,opts:['Rengine hiç bakılmaz','Sadece yüksekliğine bakılır','Renk, periyot, grup çakma ve sektör birlikte okunur'],effect:{bilgi:2}},
    'deck-pilot':{title:'Flama ve Pilot Hazırlığı',q:'Pilot operasyonunda hangi işaretler birlikte kontrol edilir?',a:0,opts:['Flama, borda ışığı, can simidi ve ladder emniyeti','Sadece yemek saati','Sadece makine devri'],effect:{bilgi:1,sayginlik:1}},
    'deck-paint':{title:'Raspa-Boya Emniyeti',q:'Raspa/boya öncesi en kritik kontrol nedir?',a:1,opts:['Boyayı hemen açmak','KKD, yüzey hazırlığı, havalandırma ve izin','Sadece fırça seçmek'],effect:{bilgi:1,sayginlik:1}},
    'cargo-ballast':{title:'Matematiksel Seyir',q:'Set/drift veya gelgit hesabında temel yaklaşım nedir?',a:0,opts:['Vektörleri ve zamanı birlikte hesaplamak','Rastgele rota değiştirmek','Sadece pusulaya bakmak'],effect:{bilgi:2}},
    'cargo-main':{title:'Yük Operasyonu',q:'Yük planı okunurken hangisi birlikte izlenir?',a:2,opts:['Sadece konteyner rengi','Sadece vardiya saati','Trim, list, SF/BM ve liman sırası'],effect:{bilgi:2}},
    'cabin-phone':{title:'Aile Özlemi',q:'Moral düştüğünde doğru davranış hangisi?',a:1,opts:['Vardiyada saklamak','Kısa iletişim kurup yorgunluğu dürüst bildirmek','Hiç uyumamak'],effect:{dinclik:1,sayginlik:1}},
    'medical-radio':{title:'Tıbbi Haberleşme',q:'TMAS/MRCC görüşmesinde bilgi nasıl verilir?',a:0,opts:['Bilinç, solunum, bulgu, konum ve istenen destek','Sadece yaş','Sadece gemi tipi'],effect:{bilgi:1}}
  };
  const CREW_BARKS = {
    bridge:['Kerteriz sabit kalmasin, CPA tekrar bak.','ECDIS alarmi gelirse once route check.','VHF dinlemede kal, kisa ve net konus.'],
    corridor:['Kapi esiklerinde acele etme.','Gece vardiyasi sessizdir ama gemi hep calisir.','Muster list panosunu bos gecme.'],
    deck:['Islak zeminde kosma.','Snap-back hattini gozunle sec.','Fener karakterini renk ve periyotla oku.'],
    engine:['Alarmi susturmak cozum degil.','Trend okumadan rapor verme.','Sicak yuzeylere mesafe birak.'],
    radio:['DSC sonrasi sesli mesaj net olmali.','SOS ritmini duyarsan kaydi kacirma.','Konum bilgisini iki kez teyit et.'],
    cargo:['Ballast degisimi trimle birlikte okunur.','Yuk planinda liman sirasi onemli.','Tank transferinde acele yok.'],
    cabin:['Yorgunlugu saklama.','Aile ozlemi vardiyada dikkat ister.','Kisa uyku bazen en iyi emniyet kararidir.'],
    mess:['Ekip havasini oku.','Yemek molasi da vardiya disiplinidir.','Cay taze, ama logbook unutulmaz.'],
    galley:['Yag yanginina su yok.','Kambuzda duzen emniyettir.'],
    infirmary:['Once sahne guvenligi.','Bilinc, solunum, dolasim sirasini bozma.']
  };

  const SCENE_REPORTS = {
    vhf:{title:'Acil haberlesme raporu',meta:'VHF CH16 / DSC distress',steps:['DSC alarmi kabul et, konumu iki kez teyit et.','Mayday: gemi adi, mevki, tehlike turu, istenen yardim.','Kaptan ve kopruye kapali cevrim rapor ver.']},
    'radio-vhf':{title:'GMDSS distress zinciri',meta:'Radio room / VHF',steps:['Distress alert sonrasi sesli Mayday hazirla.','GPS mevki, MMSI ve olay turunu loga yaz.','Working channel gecisini sadece talimatla yap.']},
    'radio-mf':{title:'Mors kodu sahnesi',meta:'... --- ... / SOS',steps:['Kisa-kisa-kisa, uzun-uzun-uzun, kisa-kisa-kisa ritmini dinle.','Mesaji SOS olarak coz ve saatini kaydet.','GMDSS loguna frekans ve sinyal notu dus.']},
    ecdis:{title:'Gelgit ve UKC tablosu',meta:'ECDIS route check',steps:['Chart datum, tide height ve saat farkini birlikte oku.','Draft + squat + emniyet payini hesapla.','Safety contour ve no-go alani rotada teyit et.']},
    radar:{title:'Matematiksel / yarim daire seyri',meta:'CPA / TCPA / nispi kerteriz',steps:['Hedefin nispi kerterizini ve mesafesini izle.','CPA/TCPA dusuyorsa COLREG durumunu belirle.','Manevrayi once rota, sonra hiz etkisiyle raporla.']},
    ais:{title:'AIS karsilastirma',meta:'Voyage data / target identity',steps:['AIS hedef adini radar iziyle eslestir.','CPA siralamasini filtrele.','Supheli fark varsa gorsel gozlem iste.']},
    'deck-sea-stbd':{title:'Samandira ve fener okuma',meta:'Renk / karakter / periyot',steps:['Rengi ve sektoru not et: kirmizi, yesil, beyaz.','Cakma grubunu ve periyodu say.','Harita semboluyle karsilastirip gecis tarafini sec.']},
    'deck-pilot':{title:'Flama ve pilot hazirligi',meta:'Pilot ladder / signal flags',steps:['H flama ve pilot isaretini kontrol et.','Ladder basamak, spreader, manrope ve borda isigini teyit et.','Can simidi, heaving line ve guvenli bekleme alanini hazirla.']},
    'deck-paint':{title:'Raspa-boya is emri',meta:'Permit / PPE / ventilation',steps:['Izin formu, ruzgar yonu ve sicak calisma riskini kontrol et.','Gozluk, maske, eldiven, kulaklik ve tulumu sec.','Raspa sonrasi yuzeyi temizle, astar ve boya katini loga yaz.']},
    'cargo-ballast':{title:'Gelgit / ballast hesabi',meta:'Trim / list / tide window',steps:['Gelgit penceresini yuk operasyon sirasi ile eslestir.','Ballast transferinin trim ve liste etkisini hesapla.','SF/BM limitleri icinde kaldigini zabite raporla.']},
    'engine-ecr':{title:'Makine alarm proseduru',meta:'Acknowledge / trend / source',steps:['Alarmi acknowledge et ama resetleme.','Trend ekranindan kaynagi ve etkisini dogrula.','Kopruye net durum, risk ve ETA raporu ver.']},
    'cabin-phone':{title:'Aile ozlemi sahnesi',meta:'Moral / yorgunluk',steps:['Mesaji oku, duyguyu bastirmadan kabul et.','Kisa cevap ver ve vardiya oncesi toparlan.','Yorgunluk artarsa zabite durumu bildir.']},
    'cook-mess':{title:'Ekip rutini',meta:'Messroom / morale',steps:['Ekipten gece deniz ve is durumu bilgisini al.','Yorgunluk ve moral isaretlerini gozle.','Vardiya notuna kisa ekip durumu ekle.']}
  };
  function pushFieldLog(text,tone){
    if(!text)return;
    state.fieldLog.unshift({text:String(text).slice(0,96),tone:tone||'info',time:state.elapsed});
    state.fieldLog=state.fieldLog.slice(0,5);
    updateFieldLog(true);
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function reportForItem(item){
    if(!item)return null;
    return item.report || SCENE_REPORTS[item.id] || SCENE_REPORTS[item.device] || SCENE_REPORTS[item.action] || null;
  }

  function showSceneReport(item,tone){
    if(!state.ui.sceneReport||!item)return;
    const report=reportForItem(item) || {title:item.label,meta:item.detail||'Gemi ici islem',steps:[item.label+' istasyonu incelendi.','Cevredeki riskler kontrol edildi.','Islem saha gunlugune kaydedildi.']};
    const steps=report.steps.map(step=>'<li>'+escapeHtml(step)+'</li>').join('');
    state.ui.sceneReport.dataset.tone=tone||'info';
    state.ui.sceneReport.innerHTML='<b>'+escapeHtml(report.title)+'</b><small>'+escapeHtml(report.meta||item.detail||'')+'</small><ol>'+steps+'</ol>';
    state.ui.sceneReport.classList.add('show');
    clearTimeout(state.sceneReportTimer);
    state.sceneReportTimer=setTimeout(()=>{if(state.ui.sceneReport)state.ui.sceneReport.classList.remove('show');},7600);
  }

  function activeIncidentItems(){
    return (state.interactions||[]).filter(item=>item.kind==='incident'&&item.object&&item.object.visible!==false&&!state.completedIncidents[item.id]);
  }

  function nearestActiveIncident(){
    return activeIncidentItems().map(item=>({item,dist:Math.hypot(item.object.position.x-state.player.x,item.object.position.z-state.player.z)})).sort((a,b)=>a.dist-b.dist)[0]||null;
  }

  function incidentToneLine(item){
    const tone=item?.tone||'info';
    const map={urgent:'Acil rol kontrolunu bos gecme.',warn:'Risk isaretli, once mesafe ve emniyet.',nav:'Seyirle ilgili isaret var, gozlemle dogrula.',radio:'Haberlesme kaydini temiz tut.',cargo:'Yuk operasyonunda sayi ve limit onemli.',engine:'Kaynak dogrulanmadan alarm kapanmaz.',life:'Moral ve yorgunluk da emniyet meselesi.',info:'Saha kontrolunu kayda gec.'};
    return map[tone]||map.info;
  }
  function updateFieldLog(force){
    if(!state.ui.fieldLog||!state.ui.fieldLogLine)return;
    if(!force && state.elapsed-state.fieldLogTick<1.6)return;
    state.fieldLogTick=state.elapsed;
    const entry=state.fieldLog[0];
    state.ui.fieldLog.classList.toggle('show',!!entry);
    if(!entry)return;
    state.ui.fieldLog.dataset.tone=entry.tone;
    state.ui.fieldLogLine.textContent=entry.text;
  }
  function updateCrewBarks(){
    if(!state.ui.crewBark || state.elapsed-state.crewBarkTick<7) return;
    state.crewBarkTick=state.elapsed;
    const nearNpc=state.npcs.map(item=>({item,dist:Math.hypot(item.object.position.x-state.player.x,item.object.position.z-state.player.z)})).sort((a,b)=>a.dist-b.dist)[0];
    const incident=nearestActiveIncident();
    const pool=CREW_BARKS[state.area]||CREW_BARKS.corridor;
    let line=nearNpc&&nearNpc.dist<7&&nearNpc.item.line?nearNpc.item.line:pool[Math.floor(Math.random()*pool.length)];
    let name=nearNpc&&nearNpc.dist<7?nearNpc.item.label:'GEMI RUTINI';
    if(incident&&incident.dist<8){
      name=nearNpc&&nearNpc.dist<7?nearNpc.item.label:'SAHA OLAYI';
      line=incident.item.label+': '+incidentToneLine(incident.item);
    }
    state.ui.barkName.textContent=name;
    state.ui.barkLine.textContent=line;
    state.ui.crewBark.classList.add('show');
    setTimeout(()=>{ if(state.ui.crewBark) state.ui.crewBark.classList.remove('show'); },5200);
  }
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
  function playMorseSOS(){
    const seq=[.12,.12,.12,.32,.32,.32,.12,.12,.12];
    let offset=0;
    seq.forEach((dur,i)=>{
      setTimeout(()=>playTone(720,dur,'sine',.11),offset*1000);
      offset+=dur+(i===2||i===5?.18:.08);
    });
  }
  function playHomesickSob(){
    const audio=ensureAudio();if(!audio)return;
    if(state.elapsed && state.elapsed-state.sobTick<7)return;
    state.sobTick=state.elapsed||0;
    const ctx=audio.ctx;if(ctx.state==='suspended')ctx.resume?.();
    for(let i=0;i<4;i++){
      const osc=ctx.createOscillator(),trem=ctx.createOscillator(),g=ctx.createGain(),tg=ctx.createGain();
      const start=ctx.currentTime+.18+i*.42,dur=.34+i*.05;
      osc.type='sine';osc.frequency.setValueAtTime(310-i*18,start);osc.frequency.exponentialRampToValueAtTime(185-i*9,start+dur);
      trem.type='sine';trem.frequency.setValueAtTime(7.5+i,start);tg.gain.value=.012;
      g.gain.setValueAtTime(.001,start);g.gain.linearRampToValueAtTime(.038,start+.08);g.gain.exponentialRampToValueAtTime(.001,start+dur);
      trem.connect(tg);tg.connect(g.gain);osc.connect(g);g.connect(audio.gain);
      osc.start(start);trem.start(start);osc.stop(start+dur+.03);trem.stop(start+dur+.03);
    }
  }
  function hapticPulse(kind){
    try{
      if(!MOBILE || !navigator.vibrate)return;
      const patterns={tap:[14],door:[24,28,18],good:[18,22,18],warn:[45,35,45],urgent:[80,45,80,45,120],nav:[18,18,36],radio:[14,20,14,20,42],engine:[60,30,80],life:[30,60,30],area:[28]};
      navigator.vibrate(patterns[kind]||patterns.tap);
    }catch(_err){}
  }

  function hapticKindForItem(item){
    if(!item)return 'tap';
    if(item.type==='door')return 'tap';
    if(item.type==='npc')return 'tap';
    if(item.kind==='incident')return item.tone||'warn';
    if(item.device){
      const device=String(item.device||item.id||'');
      if(device.includes('vhf')||device.includes('mf')||device.includes('navtex')||device.includes('epirb')||device.includes('sart'))return 'radio';
      if(device.includes('radar')||device.includes('ecdis')||device.includes('ais'))return 'nav';
      return 'good';
    }
    if(item.action==='engine3d')return 'engine';
    if(item.action==='cargo')return 'cargo';
    if(item.action==='sea'||item.action==='binocular')return 'nav';
    if(item.action==='phone'||item.action==='rest')return 'life';
    if(item.action==='paint'||item.action==='walkTask')return 'warn';
    return 'good';
  }
  function playAreaPulse(kind='area'){
    hapticPulse(kind);
    const map={urgent:[740,880,740],engine:[120,90,120],radio:[520,680,520],life:[260,220],warn:[180,140],drill:[420,540],nav:[360,520],cargo:[220,330],area:[180]};
    (map[kind]||map.area).forEach((f,i)=>setTimeout(()=>playTone(f,.1,i%2?'triangle':'sine',.08),i*120));
  }
  function playFootstep(intensity){
    const area=AREAS[state.area]||{};
    const now=state.elapsed||0;
    const cadence=state.keys.shift?.28:.38;
    if(now-state.footstepTick<cadence)return;
    state.footstepTick=now;
    const map={deck:[118,'triangle',.035],engine:[92,'sawtooth',.04],corridor:[160,'triangle',.028],bridge:[176,'triangle',.025],cargo:[132,'triangle',.03],radio:[210,'sine',.022],cabin:[190,'sine',.018],mess:[185,'sine',.02],galley:[170,'triangle',.024],infirmary:[225,'sine',.018]};
    const cfg=map[state.area]||[155,'triangle',.024];
    playTone(cfg[0]+Math.random()*18,.045,cfg[1],cfg[2]*clamp(intensity||1,.55,1.35));
    if(area.outside && Math.random()<.28) setTimeout(()=>playTone(82,.08,'sine',.018),55);
  }
  function pulseAmbient(){
    if(!state.active || state.elapsed-state.audioTick<5)return;
    state.audioTick=state.elapsed;
    const base={bridge:220,corridor:160,deck:110,engine:82,cabin:196,mess:246,galley:180,infirmary:300,radio:520,cargo:140}[state.area]||180;
    playTone(base,.18,state.area==='engine'?'sawtooth':'sine',state.area==='deck' ? .045 : .032);
    if(state.area==='cabin' && Math.floor(state.elapsed/15)%2===0) setTimeout(()=>playTone(230,.45,'sine',.025),220);
  }
  function updateEventStrip(){if(!state.ui.eventStrip)return;const ev=state.liveEvent;state.ui.eventStrip.classList.toggle('show',!!ev);if(ev){const left=Math.max(0,Math.ceil(55-(state.elapsed-(ev.started||state.elapsed))));state.ui.eventTitle.textContent=ev.title;state.ui.eventText.textContent=ev.text+' / sure '+left+' sn';}}
  function updateLiveEventPressure(){
    if(!state.liveEvent)return;
    const age=state.elapsed-(state.liveEvent.started||state.elapsed);
    if(age>55){
      pushFieldLog('Olay kacirildi: '+state.liveEvent.title+' / Seri sifirlandi','warn');
      callGame('addWatchFeed','Acik dunya olayi kacirildi: '+state.liveEvent.title,'warn');
      callGame('showNotif','VARDIYA BASKISI',state.liveEvent.title,'Olay gec kaldi. Seri sifirlandi, yeni olaya hazirlan.');
      state.streak=0;updateRewardHud();saveState();
      state.liveEvent=null;state.nextEventAt=state.elapsed+8+Math.random()*8;updateEventStrip();
      playAreaPulse('warn');
    }else if(Math.floor(age)%5===0){
      updateEventStrip();
    }
  }
  function maybeTriggerLiveEvent(){
    if(state.liveEvent || state.elapsed<state.nextEventAt)return;
    const pool=FP_EVENTS.filter(ev=>ev.area===state.area || Math.random()<.28);
    const ev=pool[Math.floor(Math.random()*Math.max(1,pool.length))] || FP_EVENTS[0];
    state.liveEvent={...ev,started:state.elapsed};state.nextEventAt=state.elapsed+10+Math.random()*8;
    pushFieldLog(ev.title+': hedef rotaya alindi',ev.kind==='urgent'||ev.kind==='engine'?'warn':'info');
    callGame('addWatchFeed',ev.title+': '+ev.text, ev.kind==='urgent'||ev.kind==='engine'?'warn':'good');
    callGame('showNotif',ev.title,'1. Şahıs Olayı',ev.text);playAreaPulse(ev.kind);if(ev.kind==='life')setTimeout(playHomesickSob,320);if(ev.id==='radio-mf')setTimeout(playMorseSOS,260);updateEventStrip();
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
    if(ok){state.completedDrills[pending.item.id]=true;triggerUsePulse(pending.item,'drill');awardWorldProgress({id:'drill-'+pending.item.id,once:true},5);advanceWorldQuest(pending.item);pushFieldLog('Egitim tamam: '+pending.drill.title+' / Seri x'+state.streak,'good');callGame('applyEffect',pending.drill.effect||{bilgi:1},{skipContractTick:true});callGame('markWalkTaskDone',pending.item.id,pending.item.label);callGame('addWatchFeed',pending.drill.title+': dogru uygulama tamamlandi.','good');callGame('showNotif','EGITIM',pending.drill.title,'Dogru cevap kaydedildi.');clearLiveEventIfHandled(pending.item);closeTrainingDrill();}
    else{state.streak=0;updateRewardHud();saveState();hapticPulse('warn');pushFieldLog('Tekrar dene: '+pending.drill.title+' / Seri sifirlandi','warn');callGame('addWatchFeed',pending.drill.title+': yanlis secim, tekrar dene.','warn');callGame('showNotif','EGITIM','Tekrar dene','Ipucu: gemide once emniyet, sonra dogrulama, sonra rapor.');playAreaPulse('warn');}
  }
  function getExplorationTarget(){
    const incident=nearestActiveIncident();
    if(incident) return {area:state.area,id:incident.item.id,label:'Saha olayi: '+incident.item.label,reason:incident.item.detail+' noktasini kontrol et ve rapora bagla.',explore:true,incident:true};
    const local=(state.interactions||[]).find(item=>!state.discoveries[item.id] && item.type!=='door' && item.kind!=='incident');
    if(local) return {area:state.area,id:local.id,label:'Kesif: '+local.label,reason:local.label+' istasyonunu incele ve gemi hafizasina ekle.',explore:true};
    const unseenArea=Object.keys(AREAS).find(id=>!state.visitedAreas[id]);
    if(unseenArea){
      const area=AREAS[unseenArea];
      return {area:unseenArea,id:null,label:'Yeni mahal kesfi',reason:area.title+' mahalline gec ve ilk kesfi tamamla.',explore:true};
    }
    const area=AREAS[state.area]||AREAS.bridge;
    const fallback=(area.stations||[])[Math.floor((state.elapsed||0)%Math.max(1,(area.stations||[]).length))];
    return fallback?{area:state.area,id:fallback.id,label:'Serbest vardiya',reason:fallback.label+' uzerinde serbest tekrar yap.',explore:true}:null;
  }
  function getDirectorTarget(){
    if(state.liveEvent)return {area:state.liveEvent.area,id:state.liveEvent.id,label:state.liveEvent.title,reason:state.liveEvent.text};
    const quest=getActiveWorldQuest();
    if(quest && state.questIndex<WORLD_QUESTS.length) return {area:quest.area,id:quest.target,label:quest.title,reason:quest.reason,quest:true};
    try{return callGame('getFirstPersonDirectorTarget')||getExplorationTarget();}catch(_err){return getExplorationTarget();}
  }
  function findInteractionById(id){
    if(!id)return null;
    return state.interactions.find(item=>item.id===id || item.device===id || item.action===id) || null;
  }
  function findDoorToArea(areaId){
    if(!areaId)return null;
    return state.interactions.find(item=>item.type==='door' && item.target===areaId) || null;
  }
  function findDoorTowardArea(areaId){
    if(!areaId || areaId===state.area) return null;
    const direct=findDoorToArea(areaId);
    if(direct) return direct;
    const queue=[{area:state.area,first:null}];
    const seen=new Set([state.area]);
    while(queue.length){
      const node=queue.shift();
      const doors=AREAS[node.area]?.doors||[];
      for(const d of doors){
        if(!d.target || seen.has(d.target)) continue;
        const first=node.first || d.target;
        if(d.target===areaId) return findDoorToArea(first);
        seen.add(d.target);
        queue.push({area:d.target,first});
      }
    }
    return null;
  }
  function findAreaRoute(areaId){
    if(!areaId || !AREAS[areaId]) return [];
    if(areaId===state.area) return [state.area];
    const queue=[{area:state.area,path:[state.area]}];
    const seen=new Set([state.area]);
    while(queue.length){
      const node=queue.shift();
      const doors=AREAS[node.area]?.doors||[];
      for(const d of doors){
        if(!d.target || seen.has(d.target)) continue;
        const path=node.path.concat(d.target);
        if(d.target===areaId) return path;
        seen.add(d.target);
        queue.push({area:d.target,path});
      }
    }
    return [];
  }

  function formatAreaRoute(path){
    return (path||[]).map(id=>AREAS[id]?.title||String(id).toUpperCase()).join(' > ');
  }
  function getDirectorLocalItem(target){
    if(!target)return null;
    if(target.area && target.area!==state.area)return findDoorTowardArea(target.area);
    return findInteractionById(target.id) || findDoorToArea(target.area);
  }
  function walkToDoorWithFallback(doorItem,desiredArea){
    if(!doorItem)return;
    clearTimeout(state.areaNavFallbackTimer);
    walkTo(doorItem);
    state.areaNavFallbackTimer=setTimeout(()=>{
      if(!state.active||state.area===desiredArea)return;
      const stillWalking=state.autoTarget&&state.autoTarget.item&&state.autoTarget.item.id===doorItem.id;
      if(stillWalking||doorItem.type==='door'){
        pushFieldLog('Gecis guvenceye alindi: '+doorItem.label,'info');
        setArea((desiredArea&&AREAS[desiredArea])?desiredArea:doorItem.target);
      }
    },2400);
  }

  function jumpToArea(target,reason){
    if(!target||!AREAS[target]||target===state.area)return;
    clearTimeout(state.areaNavFallbackTimer);
    resetInputState();
    pushFieldLog((reason||'Mahale gecis')+': '+AREAS[target].title,'info');
    setArea(target);
  }

  function walkToDirectorTarget(){
    const target=getDirectorTarget();
    if(target&&target.area&&target.area!==state.area){
      const doorItem=findDoorTowardArea(target.area);
      if(doorItem){jumpToArea(target.area,'Rota gecisi');return;}
      callGame('showNotif','ROTA YOK','Kapi baglantisi bulunamadi','Harita uzerinden uygun gecisi sec.');return;
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
    const reason=target?.reason || 'Serbest dolasim';
    state.ui.routeTitle.textContent=title;
    state.ui.routeReason.textContent=reason;
    let step='Yakindaki cihaz, kapi veya murettebata yaklas.';
    let action='HEDEFE YURU';
    let angle=0;
    let far=false;
    if(target?.area && target.area!==state.area){
      const targetArea=AREAS[target.area];
      const doorItem=findDoorTowardArea(target.area);
      const routeText=formatAreaRoute(findAreaRoute(target.area));
      step=(doorItem?doorItem.label:(targetArea?targetArea.title:target.area.toUpperCase()))+' uzerinden ilerle.'+(routeText?' Rota: '+routeText:'');
      action=doorItem?'KAPIYA YURU':'MAHALE GEC';
      if(doorItem){const p=doorItem.object.position;angle=Math.atan2(p.x-state.player.x,-(p.z-state.player.z))-state.yaw;}
      far=true;
    }else if(item){
      const p=item.object.position,dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
      step=item.label+' · '+Math.max(1,Math.round(dist*1.4))+' m';
      action=dist<3.35?(item.type==='door'?'GEC':item.type==='npc'?'KONUS':'KULLAN'):'HEDEFE YURU';
      angle=Math.atan2(dx,-dz)-state.yaw;
      far=dist>6;
    }else if(state.nearest){
      step='En yakin: '+state.nearest.label;
    }
    state.ui.routeStep.textContent=step;
    state.ui.routeAction.textContent=action;
    state.ui.routeArrow.style.transform='rotate('+angle+'rad)';
    state.ui.missionDock.classList.toggle('far',far);
    state.ui.missionDock.classList.toggle('ready',!!item && !far && action!=='HEDEFE YURU');
  }
  function buildAreaNav(){
    if(!state.ui.areaNav)return;
    const order=['bridge','corridor','deck','engine','radio','cargo','cabin','mess','galley','infirmary'];
    const navLabels={bridge:'KOPRU',corridor:'KORIDOR',deck:'GUVERTE',engine:'MAKINE',radio:'GMDSS',cargo:'YUK',cabin:'KAMARA',mess:'MESS',galley:'KAMBUZ',infirmary:'REVIR'};
    state.ui.areaNav.innerHTML=order.filter(id=>AREAS[id]).map(id=>{
      const area=AREAS[id];
      const cls=id===state.area?'active':'direct';
      const label=navLabels[id] || area.title;
      return `<button type="button" data-area="${id}" class="${cls}" title="Mahale gec: ${area.title}">${label}</button>`;
    }).join("");
    state.ui.areaNav.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      const target=btn.dataset.area;
      if(target===state.area) return;
      jumpToArea(target,'Mahalle secimi');
    }));
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
      el.classList.toggle('active',length>4);
      state.autoTarget=null;
    };
    const stop = ev=>{
      if(ev && state.stick.pointerId!==ev.pointerId) return;
      state.stick.pointerId=null;state.stick.x=0;state.stick.y=0;
      el.classList.remove('active');
      state.ui.stickKnob.style.transform='translate(0,0)';
    };
    el.addEventListener('pointerdown',ev=>{state.stick.pointerId=ev.pointerId;el.classList.add('active');el.setPointerCapture(ev.pointerId);update(ev);});
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
    state.interactions=[];state.npcs=[];state.animatedScreens=[];state.waves=[];state.distantShips=[];state.ambientFx=[];state.colliders=[];state.routeGuides=[];state.routeBeacon=null;state.usePulses=[];state.lights={};
  }

  function spawnForArea(area){
    const from=state.entryFrom;
    if(from){
      const entry=(area.doors||[]).find(d=>d.target===from);
      if(entry){
        const len=Math.max(.001,Math.hypot(entry.x,entry.z));
        const inwardX=-entry.x/len,inwardZ=-entry.z/len;
        const x=entry.x+inwardX*2.25,z=entry.z+inwardZ*2.25;
        const yaw=Math.atan2(-x,z);
        state.entryFrom=null;
        return [x,z,yaw];
      }
    }
    state.entryFrom=null;
    const saved=state.positions[state.area];
    return saved&&Number.isFinite(saved.x)?[saved.x,saved.z,saved.yaw]:area.spawn;
  }

  function createAmbientFx(area){
    const T=state.THREE,count=MOBILE?5:9;
    if(area.theme==='engine'){
      const mat=new T.MeshBasicMaterial({color:0xff8a55,transparent:true,opacity:.42,depthWrite:false});
      for(let i=0;i<count;i++){
        const spark=new T.Mesh(new T.SphereGeometry(.035,8,6),mat.clone());
        spark.position.set(-4+Math.random()*8,.8+Math.random()*2.4,-5+Math.random()*7);
        state.scene.add(spark);state.ambientFx.push({type:'spark',mesh:spark,phase:i*.73,speed:.9+Math.random()*1.4});
      }
      const steamMat=new T.MeshBasicMaterial({color:0xd9f0ff,transparent:true,opacity:.13,depthWrite:false});
      for(let i=0;i<(MOBILE?3:5);i++){
        const puff=new T.Mesh(new T.SphereGeometry(.18,12,8),steamMat.clone());
        puff.position.set(-5+i*2.4,.35,-3.8+Math.sin(i)*1.3);
        state.scene.add(puff);state.ambientFx.push({type:'steam',mesh:puff,baseY:puff.position.y,phase:i*.8});
      }
    }else if(area.outside){
      const mat=new T.MeshBasicMaterial({color:0xd7f3ff,transparent:true,opacity:.38,depthWrite:false});
      for(let i=0;i<count;i++){
        const spray=new T.Mesh(new T.BoxGeometry(.035,.42,.035),mat.clone());
        spray.position.set(-8+Math.random()*16,.35+Math.random()*1.5,-8+Math.random()*12);
        state.scene.add(spray);state.ambientFx.push({type:'spray',mesh:spray,phase:i*.41,speed:.8+Math.random()*.8});
      }
    }else if(area.theme==='radio'||area.theme==='cargo'||area.theme==='bridge'){
      const mat=new T.MeshBasicMaterial({color:area.theme==='radio'?0x8ebcff:0x70e9a8,transparent:true,opacity:.32,depthWrite:false});
      for(let i=0;i<(MOBILE?3:6);i++){
        const pulse=new T.Mesh(new T.RingGeometry(.08,.12,18),mat.clone());
        pulse.rotation.x=-Math.PI/2;pulse.position.set(-5+Math.random()*10,.08,-5+Math.random()*8);
        state.scene.add(pulse);state.ambientFx.push({type:'floorPulse',mesh:pulse,phase:i*.9});
      }
    }
  }

  function updateAmbientFx(dt){
    if(!state.ambientFx.length)return;
    state.ambientFx.forEach((fx,i)=>{
      const m=fx.mesh;if(!m)return;
      if(fx.type==='spark'){m.position.y+=dt*fx.speed;m.material.opacity=.2+.28*Math.abs(Math.sin(state.elapsed*8+fx.phase));if(m.position.y>3.2)m.position.y=.6;}
      else if(fx.type==='steam'){const t=(state.elapsed*.45+fx.phase)%1;m.position.y=(fx.baseY||.3)+t*2.4;m.scale.setScalar(.8+t*2.6);m.material.opacity=.16*(1-t);}
      else if(fx.type==='spray'){m.position.y+=dt*(fx.speed||1);m.position.z+=dt*.55;if(m.position.y>2.4){m.position.y=.25;m.position.z=-8+Math.random()*12;}m.material.opacity=.18+.22*Math.sin(state.elapsed*4+fx.phase)*.5+.11;}
      else if(fx.type==='floorPulse'){const s=1+Math.sin(state.elapsed*2.4+fx.phase)*.22;m.scale.setScalar(s);m.material.opacity=.18+.14*Math.abs(Math.sin(state.elapsed*2.2+fx.phase));}
    });
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
    const hemi=new T.HemisphereLight(area.outside?0xcfeeff:0xaac9df,area.theme==='engine'?0x1b0906:0x080d13,area.outside?2.25:1.55);scene.add(hemi);
    const ambient=new T.AmbientLight(area.outside?0x91c9e2:0x6f9ab0,area.outside?.95:.58);scene.add(ambient);
    const key=new T.DirectionalLight(0xd7eeff,area.outside?2.2:1.15);key.position.set(-6,12,4);scene.add(key);state.lights={hemi,ambient,key};
    if(area.theme==='engine'){const red=new T.PointLight(0xff5b3a,1.8,18);red.position.set(0,3,-4);scene.add(red);}
    if(area.theme==='galley'||area.theme==='infirmary'){const white=new T.PointLight(0xf5fbff,1.7,16);white.position.set(0,2.6,0);scene.add(white);}
    buildRoomShell(area);
    buildRoomDetails(area);
    area.stations.forEach(def=>createStation(def,area));
    area.doors.forEach(def=>createDoor(def,area));
    area.npcs.forEach((def,index)=>createNpc(def,index));
    createDynamicIncidents(area);
    createAmbientFx(area);
    createRouteGuides();
    buildMarkers();
    const spawn=spawnForArea(area);
    state.player.x=clamp(spawn[0],-area.bounds[0],area.bounds[0]);
    state.player.z=clamp(spawn[1],-area.bounds[1],area.bounds[1]);
    state.yaw=Number.isFinite(spawn[2])?spawn[2]:0;state.pitch=0;state.autoTarget=null;
    updateAreaUi();
    discoverArea(state.area);
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

  function buildNavigationAids(deckMode){
    const T=state.THREE;
    const red=material(0xc93b3b,{emissive:0x7a1111,emissiveIntensity:1.4,roughness:.42});
    const green=material(0x2fb36c,{emissive:0x0b7a38,emissiveIntensity:1.4,roughness:.42});
    const white=material(0xf3f0d5,{emissive:0xffe07a,emissiveIntensity:2.8,roughness:.25});
    const steel=material(0x657987,{metalness:.55,roughness:.36});
    function buoy(x,z,mat,labelOffset){
      const g=new T.Group();g.position.set(x,deckMode?-.42:.05,z);
      cylinder(g,.18,.9,[0,.45,0],mat);
      cylinder(g,.05,.75,[0,1.15,0],steel);
      const lamp=new T.Mesh(new T.SphereGeometry(.09,12,8),white);lamp.position.set(0,1.58,0);g.add(lamp);
      const top=new T.Mesh(new T.ConeGeometry(.24,.32,4),mat);top.position.set(0,1.85,0);top.rotation.y=Math.PI/4;g.add(top);
      state.scene.add(g);state.distantShips.push({object:g,speed:.04,start:x,lamp});
      return g;
    }
    buoy(-12,deckMode?-34:-72,red);
    buoy(12,deckMode?-42:-84,green);
    const light=new T.Group();light.position.set(deckMode?17:28,deckMode?.1:.2,deckMode?-58:-102);
    cylinder(light,.42,3.1,[0,1.55,0],material(0xd8dde0,{roughness:.48,metalness:.12}));
    cylinder(light,.58,.28,[0,3.18,0],steel);
    const lamp=new T.PointLight(0xffe28a,deckMode?2.8:2.1,36);lamp.position.set(0,3.32,0);light.add(lamp);
    const lens=new T.Mesh(new T.SphereGeometry(.18,16,10),white);lens.position.set(0,3.32,0);light.add(lens);
    state.scene.add(light);state.distantShips.push({object:light,speed:.02,start:light.position.x,lamp:lens});
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
    buildNavigationAids(deckMode);
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
    const fastScreen=state.liveEvent&&(state.liveEvent.kind==='radio'||state.liveEvent.kind==='engine');
    if(!force && time-item.last<(fastScreen ? .045 : .09)) return;
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

  function decorateStation(g,def){
    const T=state.THREE;
    const brass=material(0xd7b75a,{metalness:.42,roughness:.32,emissive:0x3b2a08,emissiveIntensity:.25});
    const red=material(0xd84a3a,{roughness:.48,emissive:0x4a0904,emissiveIntensity:.45});
    const green=material(0x3fc36f,{roughness:.48,emissive:0x073914,emissiveIntensity:.45});
    const white=material(0xf3f2df,{roughness:.36,emissive:0xffe08a,emissiveIntensity:.7});
    if(def.id==='deck-paint'){
      cylinder(g,.22,.42,[-.46,.23,.42],material(0xe7d35f,{metalness:.22,roughness:.45}));
      cylinder(g,.18,.35,[.05,.19,.48],material(0x2f8fc4,{metalness:.18,roughness:.45}));
      box(g,[.82,.08,.16],[.46,.72,.31],material(0xb4c0c8,{metalness:.5,roughness:.28}),[0,.34,-.24]);
      box(g,[.58,.06,.08],[.58,.85,.1],material(0x3b2514,{roughness:.72}),[0,-.2,.3]);
      const zone=new T.Mesh(new T.RingGeometry(.82,1.08,40),new T.MeshBasicMaterial({color:0xffd66b,transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}));
      zone.rotation.x=-Math.PI/2;zone.position.y=.022;g.add(zone);
    }else if(def.id==='deck-pilot'){
      cylinder(g,.035,2.4,[-.55,1.28,.05],brass);
      box(g,[.62,.34,.035],[-.24,2.1,.05],material(0x244bff,{roughness:.55}));
      box(g,[.62,.34,.035],[.38,1.72,.05],material(0xffdd4a,{roughness:.55}));
      for(let i=0;i<5;i++) box(g,[.88,.045,.055],[.15,.42+i*.23,.34],material(0xd8c08d,{roughness:.62}));
    }else if(def.id==='radio-mf'){
      box(g,[.86,.12,.42],[0,1.05,.48],material(0x10161c,{metalness:.35,roughness:.4}));
      box(g,[.58,.055,.08],[.02,1.18,.5],brass,[0,0,-.18]);
      cylinder(g,.07,.08,[-.28,1.21,.5],red,[Math.PI/2,0,0]);
      cylinder(g,.055,.08,[.34,1.18,.5],white,[Math.PI/2,0,0]);
    }else if(def.id==='radio-vhf'||def.id==='vhf'){
      cylinder(g,.12,.08,[.54,1.02,.46],red,[Math.PI/2,0,0]);
      box(g,[.12,.72,.09],[-.58,1.13,.44],material(0x0b0f13,{metalness:.42,roughness:.42}),[0,0,-.16]);
    }else if(def.id==='ecdis'){
      box(g,[1.1,.04,.78],[-.05,1.02,.5],material(0x14364a,{metalness:.25,roughness:.5}));
      for(let i=0;i<4;i++) cylinder(g,.035,.09,[-.44+i*.28,1.08,.53],i%2?green:brass,[Math.PI/2,0,0]);
      box(g,[.92,.025,.05],[.02,1.15,.56],material(0xffd66b,{emissive:0x5b3d07,emissiveIntensity:.4}),[0,0,.28]);
    }else if(def.id==='radar'){
      const arc=new T.Mesh(new T.TorusGeometry(.38,.025,8,28,Math.PI),new T.MeshBasicMaterial({color:0x70e9a8,transparent:true,opacity:.72,depthWrite:false}));
      arc.position.set(0,1.13,.52);arc.rotation.set(Math.PI/2,0,0);g.add(arc);
      box(g,[.62,.035,.04],[0,1.13,.55],green,[0,0,.42]);
    }else if(def.id==='deck-sea-stbd'){
      cylinder(g,.11,.42,[-.38,.32,.36],green);
      cylinder(g,.11,.42,[.02,.32,.36],red);
      cylinder(g,.11,.42,[.42,.32,.36],white);
      box(g,[.94,.04,.12],[.02,.74,.33],material(0xe8d071,{emissive:0x4f3905,emissiveIntensity:.45}));
    }else if(def.id==='cargo-ballast'){
      [-.42,0,.42].forEach((x,i)=>{cylinder(g,.16,.62,[x,.37,.45],material(i===1?0x3a8fb6:0x6d8794,{metalness:.28,roughness:.38}));box(g,[.24,.035,.24],[x,.72,.45],brass);});
      box(g,[1.1,.035,.06],[0,1.05,.51],material(0xffd66b,{emissive:0x5b3d07,emissiveIntensity:.32}),[0,0,-.18]);
    }else if(def.id==='cabin-phone'){
      box(g,[.62,.38,.05],[-.44,1.03,.42],material(0xe4d8c6,{roughness:.65}));
      box(g,[.46,.25,.035],[-.44,1.04,.455],material(0x19324a,{roughness:.6}));
      cylinder(g,.09,.06,[.42,1.04,.45],green,[Math.PI/2,0,0]);
    }
  }
  function createIncidentMarker(def,index){
    if(!def || state.completedIncidents[def.id]) return;
    const T=state.THREE,g=new T.Group();
    g.position.set(def.x||0,0,def.z||0);
    const colors={urgent:0xe85a51,warn:0xf07828,nav:0x76cce8,radio:0x8ebcff,cargo:0xddb957,engine:0xff6a3c,life:0x72e4a6,info:0x70e9a8};
    const color=colors[def.tone]||colors.info;
    const ring=new T.Mesh(new T.RingGeometry(.42,.64,36),new T.MeshBasicMaterial({color,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.04;g.add(ring);
    const pole=box(g,[.08,.9,.08],[0,.46,0],material(0x1a2630,{metalness:.38,roughness:.42}));
    const badge=new T.Mesh(new T.OctahedronGeometry(.22,0),new T.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false}));
    badge.position.set(0,1.08,0);g.add(badge);
    const light=new T.PointLight(color,.95,5);light.position.set(0,1.05,0);g.add(light);
    g.userData.incident={ring,badge,light,pole,phase:index*.71,tone:def.tone||'info'};
    const item=Object.assign({type:'station',kind:'incident',action:'incident'},def);
    state.scene.add(g);registerInteraction(item,g);registerCollider(g,.52);
  }

  function createDynamicIncidents(area){
    const list=(WORLD_INCIDENTS[state.area]||[]).filter(def=>!state.completedIncidents[def.id]);
    list.slice(0,MOBILE?1:2).forEach((def,index)=>createIncidentMarker(def,index));
  }
  function stationHaloColor(def){
    const map={urgent:0xe85a51,warn:0xf07828,nav:0x76cce8,radio:0x8ebcff,cargo:0xddb957,engine:0xff6a3c,life:0x72e4a6,info:0x70e9a8};
    if(def.tone&&map[def.tone])return map[def.tone];
    if(def.device||def.kind==='console'||def.kind==='screen')return 0x76cce8;
    if(def.kind==='machine'||def.action==='engine3d')return 0xff6a3c;
    if(def.action==='cargo')return 0xddb957;
    return 0x70e9a8;
  }

  function attachStationHalo(g,def){
    const T=state.THREE,color=stationHaloColor(def);
    const halo=new T.Mesh(new T.RingGeometry(.52,.72,36),new T.MeshBasicMaterial({color,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}));
    halo.rotation.x=-Math.PI/2;halo.position.y=.026;halo.visible=true;g.add(halo);
    g.userData.stationHalo={halo,color,phase:Math.random()*6.28};
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
    decorateStation(g,def);
    attachStationHalo(g,def);
    state.scene.add(g);registerInteraction(def,g);registerCollider(g, def.kind==='console'||def.device?1.05:def.kind==='bed'?1.25:def.kind==='winch'?1.15:.75);
  }

  function createDoorSign(def){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=384;canvas.height=128;
    const ctx=canvas.getContext('2d');
    const target=AREAS[def.target];
    const title=String(target?.title||def.label||'GECIS').toUpperCase();
    ctx.clearRect(0,0,384,128);
    ctx.fillStyle='rgba(4,14,22,.92)';ctx.fillRect(12,18,360,92);
    ctx.strokeStyle='rgba(255,214,107,.86)';ctx.lineWidth=4;ctx.strokeRect(12,18,360,92);
    ctx.fillStyle='rgba(112,233,168,.95)';ctx.fillRect(28,88,328,4);
    ctx.fillStyle='#ffe6a5';ctx.font='700 20px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('GECIS',192,40);
    ctx.fillStyle='#eaf7ff';ctx.font='700 28px monospace';
    ctx.fillText(title.slice(0,18),192,70);
    ctx.fillStyle='#8fb5c8';ctx.font='700 14px monospace';
    ctx.fillText(String(def.detail||'').slice(0,28),192,98);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;
    const sign=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));
    sign.position.set(0,3.05,.04);sign.scale.set(2.2,.74,1);sign.renderOrder=32;
    return sign;
  }

  function createDoor(def){
    const T=state.THREE,g=new T.Group();g.position.set(def.x,0,def.z);g.lookAt(0,1.2,0);
    const frame=material(0x8195a2,{metalness:.68,roughness:.28});
    box(g,[1.9,.12,.18],[0,.06,0],frame);box(g,[1.9,.16,.18],[0,2.45,0],frame);
    box(g,[.14,2.5,.18],[-.93,1.25,0],frame);box(g,[.14,2.5,.18],[.93,1.25,0],frame);
    const panel=box(g,[1.65,2.25,.12],[0,1.18,.02],material(0x173246,{emissive:0x071a2a,emissiveIntensity:.7}));
    panel.userData.closedX=panel.position.x;panel.userData.closedZ=panel.position.z;panel.userData.open=0;
    const lamp=box(g,[.42,.08,.08],[0,2.25,.12],material(0x74e7aa,{emissive:0x36e88b,emissiveIntensity:3}));
    const sign=createDoorSign(def);g.add(sign);
    state.scene.add(g);registerInteraction(def,g);registerCollider(g,.95);g.userData.lamp=lamp;g.userData.panel=panel;g.userData.sign=sign;
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

  function createNpcSpeechBubble(){
    const T=state.THREE,canvas=document.createElement('canvas');
    canvas.width=384;canvas.height=128;
    const ctx=canvas.getContext('2d');
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,opacity:.92}));
    sprite.position.set(0,3.16,.02);sprite.scale.set(2.25,.75,1);sprite.renderOrder=34;sprite.visible=false;
    sprite.userData.bubble={canvas,ctx,tex,lastText:'',lastTone:''};
    return sprite;
  }

  function updateNpcSpeechBubble(sprite,text,tone){
    if(!sprite||!sprite.userData||!sprite.userData.bubble)return;
    const data=sprite.userData.bubble,clean=String(text||'').replace(/\s+/g,' ').trim().slice(0,58);
    const t=tone||'info';
    if(data.lastText===clean&&data.lastTone===t)return;
    data.lastText=clean;data.lastTone=t;
    const ctx=data.ctx;ctx.clearRect(0,0,384,128);
    const stroke=t==='urgent'||t==='engine'?'rgba(255,106,80,.9)':t==='radio'?'rgba(142,188,255,.9)':t==='nav'?'rgba(118,204,232,.9)':'rgba(112,233,168,.86)';
    ctx.fillStyle='rgba(3,13,22,.9)';
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(12,18,360,82,16);else ctx.rect(12,18,360,82);ctx.fill();
    ctx.strokeStyle=stroke;ctx.lineWidth=4;ctx.stroke();
    ctx.beginPath();ctx.moveTo(178,100);ctx.lineTo(202,100);ctx.lineTo(190,118);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#eaf7ff';ctx.font='700 20px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    const words=clean.split(' ');let line='',lines=[];
    words.forEach(w=>{const next=line?line+' '+w:w;if(ctx.measureText(next).width>318&&line){lines.push(line);line=w;}else line=next;});
    if(line)lines.push(line);lines.slice(0,2).forEach((ln,i)=>ctx.fillText(ln,192,48+i*27));
    data.tex.needsUpdate=true;
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
    const skin=material(index%3===0?0x9a6248:index%3===1?0xd0a07d:0x6f4838,{roughness:.88,metalness:.02});
    const cloth=material(colors[0],{roughness:.76,metalness:.08});
    const trim=material(colors[1],{roughness:.45,metalness:.18,emissive:colors[1],emissiveIntensity:.08});
    const boot=material(0x03070d,{roughness:.82,metalness:.18});
    const eyeMat=material(0x071016,{roughness:.5});

    const root=new T.Group();
    root.position.y=0;
    g.add(root);

    const hips=new T.Group();hips.position.set(0,.98,0);root.add(hips);
    const spine=new T.Group();spine.position.set(0,1.18,0);root.add(spine);
    const torso=box(spine,[.72,1.02,.38],[0,.18,0],cloth);
    torso.castShadow=true;
    box(spine,[.78,.1,.42],[0,.62,0],trim);
    box(spine,[.22,.08,.44],[-.18,.72,0],trim);
    box(spine,[.22,.08,.44],[.18,.72,0],trim);

    const headGroup=new T.Group();headGroup.position.set(0,2.08,0);root.add(headGroup);
    const neck=cylinder(headGroup,.12,.16,[0,-.28,0],skin);
    const head=new T.Mesh(new T.SphereGeometry(.31,24,18),skin);head.position.set(0,0,0);headGroup.add(head);
    box(headGroup,[.055,.035,.025],[-.1,.04,-.29],eyeMat);
    box(headGroup,[.055,.035,.025],[.1,.04,-.29],eyeMat);
    box(headGroup,[.06,.04,.12],[0,-.04,-.32],skin);
    if(def.uniform==='officer'){
      cylinder(headGroup,.34,.08,[0,.31,0],material(0xf0f0e7,{roughness:.5}),[0,0,0]);
      box(headGroup,[.54,.08,.28],[0,.27,-.12],material(0x071c34,{roughness:.55}));
    }
    if(def.uniform==='cook'){
      cylinder(headGroup,.36,.18,[0,.34,0],material(0xffffff,{roughness:.65}),[0,0,0]);
      box(headGroup,[.56,.12,.46],[0,.27,0],material(0xf8f8f4,{roughness:.7}));
    }

    function limb(pivot,size,offset,mat){
      const group=new T.Group();group.position.set(pivot[0],pivot[1],pivot[2]);root.add(group);
      const part=box(group,size,offset,mat);
      return {group,part};
    }
    const leftArm=limb([-.5,1.62,0],[.18,.76,.2],[0,-.35,0],cloth);
    const rightArm=limb([.5,1.62,0],[.18,.76,.2],[0,-.35,0],cloth);
    const leftHand=new T.Mesh(new T.SphereGeometry(.105,14,10),skin);leftHand.position.set(0,-.76,0);leftArm.group.add(leftHand);
    const rightHand=new T.Mesh(new T.SphereGeometry(.105,14,10),skin);rightHand.position.set(0,-.76,0);rightArm.group.add(rightHand);
    const leftLeg=limb([-.2,.94,0],[.22,.82,.24],[0,-.38,0],cloth);
    const rightLeg=limb([.2,.94,0],[.22,.82,.24],[0,-.38,0],cloth);
    const leftBoot=box(leftLeg.group,[.32,.12,.46],[.03,-.88,-.09],boot);
    const rightBoot=box(rightLeg.group,[.32,.12,.46],[-.03,-.88,-.09],boot);
    const leftSole=box(leftLeg.group,[.36,.035,.5],[.04,-.965,-.1],boot);
    const rightSole=box(rightLeg.group,[.36,.035,.5],[-.04,-.965,-.1],boot);

    const shadow=new T.Mesh(new T.CircleGeometry(.62,28),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;root.add(shadow);
    const footShadowMat=new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false});
    const leftFootShadow=new T.Mesh(new T.CircleGeometry(.18,18),footShadowMat.clone());
    const rightFootShadow=new T.Mesh(new T.CircleGeometry(.18,18),footShadowMat.clone());
    leftFootShadow.rotation.x=rightFootShadow.rotation.x=-Math.PI/2;
    leftFootShadow.position.set(-.22,.022,-.13);rightFootShadow.position.set(.22,.022,-.13);
    root.add(leftFootShadow);root.add(rightFootShadow);
    const ring=new T.Mesh(new T.TorusGeometry(.62,.025,10,40),new T.MeshBasicMaterial({color:0x72e4a6,transparent:true,opacity:.34,depthWrite:false}));
    ring.rotation.x=Math.PI/2;ring.position.y=.04;root.add(ring);

    const plate=createNpcNameplate(def.label);
    plate.position.set(0,2.72,0);plate.scale.set(1.45,.45,1);g.add(plate);
    const speech=createNpcSpeechBubble();g.add(speech);
    g.position.set(def.x,0,def.z);g.scale.setScalar(1.05);state.scene.add(g);
    const item=registerInteraction(def,g);
    registerCollider(g,.62);
    item.anim={path:def.path||[[def.x,def.z]],speed:def.speed||.15,phase:index*.37,targetIndex:1,wait:.2+index*.16,root,spine,headGroup,leftLeg:leftLeg.group,rightLeg:rightLeg.group,leftArm:leftArm.group,rightArm:rightArm.group,leftBoot,rightBoot,leftSole,rightSole,leftFootShadow,rightFootShadow,ring,shadow,speech,lastX:def.x,lastZ:def.z,attention:0,gesture:0};
    state.npcs.push(item);
  }

  function pulseRouteTarget(target){
    if(!target||!target.id||!state.ui.root)return;
    if(state.lastRouteTargetId===target.id)return;
    state.lastRouteTargetId=target.id;
    state.ui.root.classList.remove('route-pulse');
    void state.ui.root.offsetWidth;
    state.ui.root.classList.add('route-pulse');
    clearTimeout(state.routePulseTimer);
    state.routePulseTimer=setTimeout(()=>state.ui.root&&state.ui.root.classList.remove('route-pulse'),900);
    if(target.object)triggerUsePulse(target,'nav');
    hapticPulse('nav');
  }

  function createRouteGuides(){
    const T=state.THREE;
    state.routeGuides=[];state.routeBeacon=null;
    const mat=new T.MeshBasicMaterial({color:0xffd66b,transparent:true,opacity:.42,depthWrite:false});
    for(let i=0;i<7;i++){
      const ring=new T.Mesh(new T.RingGeometry(.16,.27,28),mat.clone());
      ring.rotation.x=-Math.PI/2;ring.position.y=.045;
      const arrow=new T.Mesh(new T.ConeGeometry(.09,.25,3),new T.MeshBasicMaterial({color:0xfff0a3,transparent:true,opacity:.78,depthWrite:false}));
      arrow.rotation.x=Math.PI/2;arrow.position.set(0,.012,-.28);ring.add(arrow);ring.userData.arrow=arrow;
    }
    const beacon=new T.Group();
    const beamMat=new T.MeshBasicMaterial({color:0xffd66b,transparent:true,opacity:.16,depthWrite:false});
    const beam=new T.Mesh(new T.CylinderGeometry(.08,.44,3.4,24,1,true),beamMat);beam.position.y=1.72;beacon.add(beam);
    const ring=new T.Mesh(new T.TorusGeometry(.62,.035,10,48),new T.MeshBasicMaterial({color:0xffd66b,transparent:true,opacity:.72,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.08;beacon.add(ring);
    const cap=new T.Mesh(new T.SphereGeometry(.18,16,10),new T.MeshBasicMaterial({color:0xfff0a3,transparent:true,opacity:.9,depthWrite:false}));cap.position.y=3.45;beacon.add(cap);
    const light=new T.PointLight(0xffd66b,1.5,9);light.position.y=2.2;beacon.add(light);
    beacon.visible=false;state.scene.add(beacon);state.routeBeacon=beacon;
  }

  function updateRouteGuides(){
    if(!state.scene||!state.routeGuides.length)return;
    const target=getDirectorLocalItem(getDirectorTarget());
    if(!target||!target.object){
      state.lastRouteTargetId='';
      state.routeGuides.forEach(g=>g.visible=false);
      if(state.routeBeacon)state.routeBeacon.visible=false;
      if(state.ui.root)state.ui.root.classList.remove('has-route','route-pulse');
      return;
    }
    pulseRouteTarget(target);
    const pos=target.object.position;
    const dx=pos.x-state.player.x,dz=pos.z-state.player.z,dist=Math.hypot(dx,dz);
    const near=dist<2.25;
    state.routeGuides.forEach((g,i)=>{
      const active=!near && i<Math.min(7,Math.max(2,Math.floor(dist*.55)));
      g.visible=active;
      if(!active)return;
      const f=(i+1)/(state.routeGuides.length+1);
      g.position.set(state.player.x+dx*f,.046,state.player.z+dz*f);
      g.rotation.z=Math.atan2(dx,dz);
      const pulse=.92+Math.sin(state.elapsed*4.2+i*.55)*.18;
      g.scale.setScalar(pulse);
      g.material.opacity=.22+Math.sin(state.elapsed*3.6+i*.7)*.08+(target.type==='door' ? .1 : .18);
      if(g.userData.arrow){g.userData.arrow.material.opacity=.48+Math.sin(state.elapsed*5.1+i*.6)*.18;}
    });
    if(state.routeBeacon){
      const beaconColor=toneColorForItem(target);
      state.routeBeacon.traverse(obj=>{if(obj.material&&obj.material.color)obj.material.color.setHex(beaconColor);if(obj.isPointLight)obj.color.setHex(beaconColor);});
      state.routeBeacon.visible=true;
      state.routeBeacon.position.set(pos.x,.04,pos.z);
      state.routeBeacon.rotation.y=state.elapsed*.95;
      const s=1+Math.sin(state.elapsed*3.2)*.08;
      state.routeBeacon.scale.setScalar(s);
    }
    if(state.ui.root)state.ui.root.classList.add('has-route');
  }
  function registerInteraction(def,object){
    const item=Object.assign({},def,{object,marker:null,anim:null});
    object.userData.interaction=item;state.interactions.push(item);return item;
  }

  function registerCollider(object,radius){
    if(!object || !Number.isFinite(radius)) return;
    state.colliders.push({object,radius});
  }

  function resolveCollision(nextX,nextZ){
    const area=AREAS[state.area]||AREAS.bridge;
    let x=clamp(nextX,-area.bounds[0],area.bounds[0]);
    let z=clamp(nextZ,-area.bounds[1],area.bounds[1]);
    state.colliders.forEach(col=>{
      if(!col.object || !col.object.position) return;
      const dx=x-col.object.position.x,dz=z-col.object.position.z;
      const min=(col.radius||.7)+.46;
      const dist=Math.hypot(dx,dz);
      if(dist>0.001 && dist<min){
        const push=(min-dist)/dist;
        x+=dx*push;z+=dz*push;
      }
    });
    return {x:clamp(x,-area.bounds[0],area.bounds[0]),z:clamp(z,-area.bounds[1],area.bounds[1])};
  }

  function discover(item){
    if(!item || state.discoveries[item.id]) return;
    state.discoveries[item.id]=true;
    state.lastDiscovery=item.label;
    awardWorldProgress({id:'discover-'+item.id,once:true},2);
    if(state.ui.worldDiscovery) state.ui.worldDiscovery.textContent='Kesfedildi: '+item.label;
    updateDutyChain();saveState();
    pushFieldLog('Kesif: '+item.label,'good');
    callGame('addWatchFeed','Acik dunya kesfi: '+item.label+' bulundu.','good');
  }

  function formatWatch(minutes){
    const total=Math.floor(minutes)%1440;
    return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
  }

  function triggerFirstPersonUse(item){
    if(!state.ui.root)return;
    state.ui.root.classList.remove('using-item','using-door','using-npc');
    void state.ui.root.offsetWidth;
    state.ui.root.classList.add('using-item');
    if(item?.type==='door')state.ui.root.classList.add('using-door');
    else if(item?.type==='npc')state.ui.root.classList.add('using-npc');
    clearTimeout(state.useReactTimer);
    state.useReactTimer=setTimeout(()=>{if(state.ui.root)state.ui.root.classList.remove('using-item','using-door','using-npc');},420);
  }

  function triggerUsePulse(item,tone){
    if(!item||!item.object||!state.scene||!state.THREE)return;
    const T=state.THREE,pos=item.object.position;
    const color=tone==='door'?0xffd66b:tone==='npc'?0x72e4a6:0x76cce8;
    const ring=new T.Mesh(new T.RingGeometry(.42,.58,42),new T.MeshBasicMaterial({color,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.set(pos.x,.06,pos.z);state.scene.add(ring);
    const spark=new T.PointLight(color,.9,5);spark.position.set(pos.x,1.15,pos.z);state.scene.add(spark);
    state.usePulses.push({ring,spark,start:state.elapsed,dur:1.05});
  }

  function updateUsePulses(){
    if(!state.usePulses.length)return;
    state.usePulses=state.usePulses.filter(p=>{
      const t=clamp((state.elapsed-p.start)/p.dur,0,1);
      p.ring.scale.setScalar(1+t*2.4);
      p.ring.material.opacity=(1-t)*.62;
      p.spark.intensity=(1-t)*.9;
      if(t>=1){state.scene.remove(p.ring);state.scene.remove(p.spark);p.ring.geometry.dispose();p.ring.material.dispose();return false;}
      return true;
    });
  }
  function discoverArea(areaId){
    const area=AREAS[areaId];
    if(!area||state.visitedAreas[areaId])return;
    state.visitedAreas[areaId]=true;
    awardWorldProgress({id:'area-'+areaId,once:true},5);
    state.lastDiscovery='Yeni mahal: '+area.title;
    if(state.ui.worldDiscovery) state.ui.worldDiscovery.textContent=state.lastDiscovery;
    updateDutyChain();saveState();
    pushFieldLog('Yeni mahal: '+area.title,'good');
    callGame('addWatchFeed','Acik dunya kesfi: '+area.title+' ilk kez gezildi.','good');
  }
  function updateRiskMeter(){
    if(!state.ui.riskMeter) return;
    const base={bridge:.35,corridor:.22,deck:.58,engine:.7,radio:.42,cargo:.55,cabin:.18,mess:.16,galley:.48,infirmary:.28}[state.area]||.3;
    const nearest=state.nearest;
    const proximity=nearest?clamp((4-nearest.distance)/4,0,.35):0;
    const eventKind=state.liveEvent?.kind || '';
    const incident=nearestActiveIncident();
    const incidentBoost=incident?clamp((8-incident.dist)/8,0,.24):0;
    const eventBoost=(eventKind==='urgent'||eventKind==='engine') ? .34 : (eventKind==='nav'||eventKind==='cargo' ? .22 : (eventKind ? .16 : 0));
    const risk=clamp(base+proximity+eventBoost+incidentBoost,0,1);
    const label=risk>.74?'Yuksek':risk>.48?'Dikkat':risk>.25?'Kontrol':'Rutin';
    state.ui.riskText.textContent=label;
    if(state.ui.riskNote) state.ui.riskNote.textContent=state.liveEvent?(state.liveEvent.title+' hedefe bagli'):incident?(incident.item.label+' / saha olayi'):nearest&&nearest.distance<3.1?'Yakinda islem var':'Normal vardiya';
    state.ui.riskFill.style.width=Math.round(risk*100)+'%';
    state.ui.riskMeter.dataset.level=label.toLowerCase();
  }  function worldWeatherLabel(hour){
    if(state.liveEvent){
      const map={urgent:'DSC alarm / teyit',nav:'Fener gozlemi',radio:'GMDSS trafik',cargo:'Ballast hesabi',engine:'Alarm trendi',life:'Moral dusuk'};
      return map[state.liveEvent.kind]||state.liveEvent.title;
    }
    if(state.area==='engine')return 'Sicak / gurultulu';
    if(state.area==='deck')return hour>=19||hour<6?'Gece vardiyasi':'Swell hafif';
    if(state.area==='bridge')return 'Gorus iyi';
    if(state.area==='radio')return 'Dinleme vardiyasi';
    if(state.area==='cargo')return 'Yuk takibi';
    return 'Gemi ici rutin';
  }
  function updateWorldStatus(dt){
    if(!state.ui.worldStatus) return;
    state.watchMinutes+=dt*2.4;
    if(state.elapsed-state.worldTick>.8){
      state.worldTick=state.elapsed;
      const shift=currentIncidentShift();
      if(shift!==state.incidentShift){
        state.incidentShift=shift;
        resetIncidentsForNewShift('Yeni vardiya turu: saha olaylari yenilendi.');
        return;
      }
      const hour=Math.floor(state.watchMinutes/60)%24;
      state.weather=worldWeatherLabel(hour);
      state.ui.worldClock.textContent=formatWatch(state.watchMinutes);
      state.ui.worldWeather.textContent=state.weather;
      const watchKind=(hour>=19||hour<6)?'Gece':'Gunduz';
      state.ui.worldStatus.dataset.watch=(hour>=19||hour<6)?'night':'day';
      const note=watchKind+' / '+state.weather;
      if(note!==state.lastAtmosphereNote){state.lastAtmosphereNote=note;pushFieldLog(note,'info');}
      if(!state.lastDiscovery) state.ui.worldDiscovery.textContent='Kapilardan gec, cihazlari kullan, ekipten bilgi al';
    }
  }

  function angleToCompass(rad){
    const deg=((rad*180/Math.PI)%360+360)%360;
    return Math.round(deg).toString().padStart(3,'0');
  }

  function updateCompass(mapTarget){
    if(!state.ui.compass)return;
    const heading=((state.yaw*180/Math.PI)%360+360)%360;
    state.ui.heading.textContent=Math.round(heading).toString().padStart(3,'0');
    state.ui.compassNeedle.style.transform='rotate('+(-state.yaw)+'rad)';
    const activeIncidents=state.interactions.filter(item=>item.kind==='incident'&&item.object&&item.object.visible!==false).length;
    if(state.ui.openWork)state.ui.openWork.textContent='OLAY '+activeIncidents;
    if(mapTarget&&mapTarget.object){
      const p=mapTarget.object.position;
      const dx=p.x-state.player.x,dz=p.z-state.player.z;
      const dist=Math.max(1,Math.round(Math.hypot(dx,dz)*1.4));
      const bearing=Math.atan2(dx,-dz);
      const delta=Math.atan2(Math.sin(bearing-state.yaw),Math.cos(bearing-state.yaw));
      const side=Math.abs(delta)<.24?'ON':delta>0?'SAG':'SOL';
      state.ui.bearing.textContent=side+' '+dist+' m / '+angleToCompass(bearing);
    }else{
      state.ui.bearing.textContent='HEDEF --';
    }
  }
  function toneClassForItem(item){
    return item&&item.tone?(' tone-'+String(item.tone).replace(/[^a-z0-9_-]/gi,'').toLowerCase()):'';
  }

  function toneColorForItem(item){
    const map={urgent:0xe85a51,warn:0xf07828,nav:0x76cce8,radio:0x8ebcff,cargo:0xddb957,engine:0xff6a3c,life:0x72e4a6,info:0x70e9a8};
    return map[item?.tone]||0xffd66b;
  }
  function updateFocusCue(target,dist){
    if(!state.ui.root)return;
    const focused=target&&dist<8;
    state.ui.root.classList.toggle('target-near',!!focused);
    if(focused && state.lastFocusId!==target.id){
      state.lastFocusId=target.id;
      pushFieldLog('Hedef yakinda: '+target.label,'info');
    }else if(!focused){
      state.lastFocusId='';
    }
  }
  function buildMarkers(){
    state.ui.markers.innerHTML='';
    let objective={};
    try{objective=getDirectorTarget()||{};}catch(_err){}
    state.interactions.forEach(item=>{
      const btn=document.createElement('button');
      const roleClass=item.type==='npc'?(' '+(item.uniform||'crew')):'';
      const routeItem=getDirectorLocalItem(objective);
      btn.className='fp3d-marker '+item.type+roleClass+(item.kind?' '+item.kind:'')+toneClassForItem(item)+((objective.id===item.id || (routeItem&&routeItem.id===item.id))?' objective':'');
      btn.dataset.id=item.id;
      btn.innerHTML='<i></i><b>'+item.label+'</b><small>'+item.detail+'</small><em></em>';
      btn.addEventListener('click',ev=>{ev.stopPropagation();item.type==='door'?walkToDoorWithFallback(item,item.target):walkTo(item);});
      state.ui.markers.appendChild(btn);item.marker=btn;
    });
  }

  function resetAutoNav(item,dist){
    state.autoNav={lastDist:Number.isFinite(dist)?dist:999,stuck:0,strafeDir:(state.autoNav?.strafeDir||1),lastX:state.player.x,lastZ:state.player.z,lastPulse:0,itemId:item?.id||''};
  }

  function walkTo(item){
    if(!item||!item.object)return;
    const p=item.object.position;
    const dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
    if(dist<approachDistanceForItem(item)+.35){interact(item);return;}
    state.autoTarget={item,x:p.x,z:p.z};resetAutoNav(item,dist);state.keys.w=false;state.keys.s=false;state.keys.a=false;state.keys.d=false;
  }

  function updateMarkers(){
    if(!state.camera)return;
    const T=state.THREE,v=new T.Vector3(),area=AREAS[state.area];
    const objective=getDirectorTarget()||{};
    const mapTarget=getDirectorLocalItem(objective);
    let nearest=null,aimed=null;
    state.interactions.forEach(item=>{
      item.object.getWorldPosition(v);
      const dx=v.x-state.player.x,dz=v.z-state.player.z,dist=Math.hypot(dx,dz);
      if(!nearest||dist<nearest.distance) nearest=Object.assign({},item,{distance:dist,world:{x:v.x,z:v.z}});
      if(dist<4.2) discover(item);
      const projected=v.clone();projected.y+=item.type==='npc'?2.45:1.75;projected.project(state.camera);
      const visible=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1.18&&Math.abs(projected.y)<1.15&&dist<15;
      const aim=Math.hypot(projected.x,projected.y);
      if(visible&&dist<6.2&&aim<.28){
        const score=aim+dist*.035;
        if(!aimed||score<aimed.aimScore) aimed=Object.assign({},item,{distance:dist,aimScore:score,world:{x:v.x,z:v.z}});
      }
      item.marker.classList.toggle('visible',visible);
      item.marker.classList.toggle('near',dist<3.1);
      item.marker.classList.toggle('objective',!!((objective.id===item.id)||(mapTarget&&mapTarget.id===item.id)));
      if(visible){
        item.marker.style.left=((projected.x*.5+.5)*100)+'%';
        item.marker.style.top=((-projected.y*.5+.5)*100)+'%';
        item.marker.style.setProperty('--marker-scale',String(clamp(1.34-dist*.045,.72,1.1)));
        item.marker.querySelector('em').textContent=Math.max(1,Math.round(dist*1.4))+' m';
      }
    });
    if(aimed) nearest=aimed;
    state.nearest=nearest;
    state.interactions.forEach(item=>item.marker&&item.marker.classList.toggle('aim-focus',!!(aimed&&aimed.id===item.id)));
    const ready=nearest&&nearest.distance<approachDistanceForItem(nearest);
    state.ui.prompt.classList.toggle('ready',!!ready);
    state.ui.promptText.textContent=ready?nearest.label:(aimed?('Bakilan hedef: '+aimed.label):'Bir istasyona yaklas');
    state.ui.distance.textContent=nearest?Math.max(1,Math.round(nearest.distance*1.4))+' m':'';
    state.ui.use.classList.toggle('ready',!!ready);
    state.ui.use.querySelector('span').textContent=ready?(nearest.type==='door'?'GEC':nearest.type==='npc'?'KONUS':'KULLAN'):(aimed?'ODAK':'YAKLAS');
    updateMissionDock();
    const bx=area.bounds[0],bz=area.bounds[1];
    state.ui.mapPlayer.style.left=clamp(((state.player.x+bx)/(bx*2))*100,5,95)+'%';
    state.ui.mapPlayer.style.top=clamp(((state.player.z+bz)/(bz*2))*100,5,95)+'%';
    updateMapRoute(mapTarget,area);
    updateCompass(mapTarget);
    state.ui.mapNpcs.innerHTML=state.interactions.map(item=>{
      const p=item.object.position;
      const cls=item.type+(item.kind?' '+item.kind:'')+toneClassForItem(item)+(mapTarget&&mapTarget.id===item.id?' target':'')+(drillForItem(item)&&!state.completedDrills[item.id]?' drill':'');
      return '<i class="'+cls+'" style="left:'+clamp(((p.x+bx)/(bx*2))*100,5,95)+'%;top:'+clamp(((p.z+bz)/(bz*2))*100,5,95)+'%"></i>';
    }).join('');
  }

  function updateMapRoute(mapTarget,area){
    if(!state.ui.mapRoute)return;
    if(!mapTarget||!mapTarget.object){state.ui.mapRoute.style.display='none';return;}
    const bx=area.bounds[0],bz=area.bounds[1],p=mapTarget.object.position;
    const px=clamp(((state.player.x+bx)/(bx*2))*100,5,95),py=clamp(((state.player.z+bz)/(bz*2))*100,5,95);
    const tx=clamp(((p.x+bx)/(bx*2))*100,5,95),ty=clamp(((p.z+bz)/(bz*2))*100,5,95);
    const dx=tx-px,dy=ty-py,len=Math.hypot(dx,dy);
    state.ui.mapRoute.style.display=len>4?'block':'none';
    state.ui.mapRoute.style.left=px+'%';state.ui.mapRoute.style.top=py+'%';state.ui.mapRoute.style.width=len+'%';
    state.ui.mapRoute.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';
  }
  function summarizeCurrentTarget(){
    const target=getDirectorTarget();
    if(!target)return 'Serbest kesif';
    return target.label||target.reason||'Serbest kesif';
  }

  function announceAreaArrival(areaId){
    const area=AREAS[areaId];
    if(!area)return;
    const summary=summarizeCurrentTarget();
    pushFieldLog(area.title+' varis / Hedef: '+summary,'info');
    if(state.ui.root){
      state.ui.root.classList.remove('area-arrival');
      void state.ui.root.offsetWidth;
      state.ui.root.classList.add('area-arrival');
      clearTimeout(state.areaArrivalTimer);
      state.areaArrivalTimer=setTimeout(()=>state.ui.root&&state.ui.root.classList.remove('area-arrival'),1100);
    }
    callGame('showNotif','MAHAL GIRISI',area.title,'Yeni hedef: '+summary);
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
      const target=getDirectorTarget();
      if(target&&target.reason) objective=target.reason;
    }catch(_err){}
    state.ui.objective.textContent=objective;
    buildAreaNav();
    updateMissionDock();
    updateDutyChain();
  }

  function setArea(next){
    if(!AREAS[next]||next===state.area)return;
    clearTimeout(state.areaNavFallbackTimer);state.autoTarget=null;resetAutoNav(null,0);
    saveState();state.previousArea=state.area;state.entryFrom=state.area;state.area=next;
    state.positions[next]=null;
    state.ui.fade.classList.add('active');
    setTimeout(()=>{
      buildScene();
      try{firstPersonArea=next;}catch(_err){}
      hapticPulse('door');
      announceAreaArrival(next);
      callGame('addWatchFeed',AREAS[next].title+': mahal gecisi tamamlandi.','good');
      requestAnimationFrame(()=>state.ui.fade.classList.remove('active'));
    },180);
  }

  function interact(forced){
    const item=forced&&forced.id?forced:state.nearest;
    if(!item)return;
    if(!forced&&item.distance>=3.35){walkTo(item);return;}
    hapticPulse(hapticKindForItem(item));
    triggerFirstPersonUse(item);
    triggerUsePulse(item,item.type);
    showSceneReport(item,item.type==='door'?'door':item.type==='npc'?'npc':'info');
    clearLiveEventIfHandled(item);
    if(item.type==='door'){pushFieldLog('Kapi gecisi: '+item.label,'info');setArea(item.target);return;}
    if(item.type==='npc'){advanceWorldQuest(item);openDialogue(item);return;}
    if(item.device){
      if(item.id==='radio-mf')playMorseSOS();
      callGame('markWalkTaskDone',item.id,item.label);
      callGame('progressWalkMission','bridge3d',item.id,item.label);
      callGame('openRealBridgeConsole',item.device);
      pushFieldLog('Cihaz acildi: '+item.label,'info');
      advanceWorldQuest(item);
      if(drillForItem(item)&&!state.completedDrills[item.id]) setTimeout(()=>openTrainingDrill(item),120);
      return;
    }
    if(openTrainingDrill(item))return;
    const action=item.action;
    if(action==='incident'){
      hapticPulse('good');
      state.completedIncidents[item.id]=true;
      awardWorldProgress({id:item.id,once:true},7);
      saveState();
      pushFieldLog('Mini olay tamam: '+item.label+' / Seri x'+state.streak,'good');
      callGame('applyEffect',{bilgi:1,sayginlik:1},{skipContractTick:true});
      callGame('addWatchFeed','Acik dunya mini olay: '+item.label+' tamamlandi.','good');
      callGame('showNotif','ACIK DUNYA OLAYI',item.label,'Saha kontrolu tamamlandi ve kayda gecti.');
      if(item.object){item.object.visible=false;if(item.marker)item.marker.remove();}
      return;
    }
    if(action==='phone'){callGame('togglePhone');playHomesickSob();pushFieldLog('Aile mesaji acildi','info');advanceWorldQuest(item);}
    else if(action==='notes'||action==='logbook')callGame(action==='notes'?'openNotes':'openLogbook');
    else if(action==='glossary')callGame('openGlossary');
    else if(action==='map')callGame('openMap');
    else if(action==='binocular')callGame('openFirstPersonBinocularLook','bow');
    else if(action==='sea'){callGame('openFirstPersonSeaLook',item.look||'bow');pushFieldLog('Deniz gozlemi: '+item.label,'info');advanceWorldQuest(item);}
    else if(action==='deck3d'){callGame('openShipOperation3D','mooring3d');pushFieldLog('Guverte operasyonu: '+item.label,'info');advanceWorldQuest(item);}
    else if(action==='paint'){pushFieldLog('Raspa boya kontrolu tamam','good');advanceWorldQuest(item);callGame('showNotif','RASPA / BOYA',item.label,'KKD, izin, havalandirma ve yuzey hazirligi teyit edildi.');}
    else if(action==='engine3d'){callGame('openShipOperation3D','engine3d');pushFieldLog('Makine paneli acildi: '+item.label,'info');advanceWorldQuest(item);}
    else if(action==='cargo'){callGame('openShipOperation3D','cargo3d');pushFieldLog('Yuk/ballast paneli acildi','info');advanceWorldQuest(item);}
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


  function incidentForDialogue(){
    const incident=nearestActiveIncident();
    return incident&&incident.dist<9?incident:null;
  }

  function dialogueTextForNpc(item,incident){
    if(!incident)return item.line;
    return item.line+'\n\nYakindaki saha olayi: '+incident.item.label+'. '+incidentToneLine(incident.item)+' Konumu pusulada ve minimapte isaretli.';
  }

  function dialogueQuestionLabel(incident){
    return incident?'Beni olaya yonlendir.':'Dikkat etmem gereken en kritik nokta ne?';
  }
  function openDialogue(item){
    state.currentDialogue=item;
    const incident=incidentForDialogue();
    state.dialogueIncidentId=incident?incident.item.id:'';
    const line=dialogueTextForNpc(item,incident).replace(/\n/g,'<br>');
    state.ui.dialogue.classList.add('show');
    state.ui.dialogue.innerHTML=
      '<div class="fp3d-dialogue-card"><button class="fp3d-dialogue-close" type="button">KAPAT</button>'+
      '<div class="fp3d-dialogue-person '+(item.uniform||'crew')+'"><i></i><span><b>'+item.label+'</b><small>'+item.detail+'</small></span></div>'+
      '<p>'+line+'</p><div class="fp3d-dialogue-actions">'+
      '<button type="button" data-tone="professional">Anlasildi, kontrol edip raporlayacagim.</button>'+
      '<button type="button" data-tone="question">'+dialogueQuestionLabel(incident)+'</button>'+
      '<button type="button" data-tone="unsafe">Tamam, ayrintiya gerek yok.</button></div></div>';
    state.ui.dialogue.querySelector('.fp3d-dialogue-close').onclick=closeDialogue;
    state.ui.dialogue.querySelectorAll('[data-tone]').forEach(btn=>btn.onclick=()=>respondDialogue(btn.dataset.tone));
  }
  function closeDialogue(){state.currentDialogue=null;state.dialogueIncidentId='';state.ui.dialogue.classList.remove('show');state.ui.dialogue.innerHTML='';}
  function respondDialogue(tone){
    const item=state.currentDialogue;if(!item)return;
    const incident=state.dialogueIncidentId?findInteractionById(state.dialogueIncidentId):null;
    const reply=tone==='unsafe'?'Aceleci cevap verdin; zabit seni tekrar uyardi.':tone==='question'?'Kritik noktayi sorup saha olayina yoneldin.':'Emri kapali cevrim ile tekrar ettin.';
    callGame('addWatchFeed','Stajyer: '+reply,tone==='unsafe'?'warn':'good');
    callGame('pushPhoneMessage',item.label,reply,{open:false});
    callGame('applyEffect',tone==='unsafe'?{sayginlik:-1,yorgunluk:1}:{sayginlik:1},{skipContractTick:true});
    if(incident&&tone!=='unsafe'){
      pushFieldLog(item.label+' olayi isaret etti: '+incident.label,'info');
      callGame('showNotif','SAHA YONLENDIRME',incident.label,'Murettebat olayi pusula ve minimap uzerinden isaretledi.');
      if(tone==='question') setTimeout(()=>walkTo(incident),90);
    }else{
      callGame('showNotif','DIYALOG',item.label,tone==='unsafe'?'Aceleci cevap iliskiye islendi.':'Konusma gemi hafizasina kaydedildi.');
    }
    hapticPulse(tone==='unsafe'?'warn':incident?'nav':'good');
    playAreaPulse(tone==='unsafe'?'warn':'drill');
    closeDialogue();
  }
  function approachDistanceForItem(item){
    if(!item)return 2.55;
    if(item.type==='door')return 2.95;
    if(item.type==='npc')return 2.75;
    if(item.kind==='console'||item.device)return 2.55;
    return 2.65;
  }
  function movementSpeedForArea(area,run){
    const indoor={corridor:.82,cabin:.76,mess:.82,galley:.78,infirmary:.78,radio:.8,cargo:.86,engine:.82};
    const areaId=state.area;
    const mod=area?.outside?1:(indoor[areaId]||.9);
    const base=run?(area?.outside?4.85:4.05):3.05;
    return base*mod*(MOBILE?.9:1);
  }
  function updateMovement(dt){
    const area=AREAS[state.area];
    let forward=(state.keys.w||state.keys.arrowup?1:0)-(state.keys.s||state.keys.arrowdown?1:0)-state.stick.y;
    let strafe=(state.keys.d||state.keys.arrowright?1:0)-(state.keys.a||state.keys.arrowleft?1:0)+state.stick.x;
    const manual=Math.abs(forward)+Math.abs(strafe)>.04;
    if(manual){state.autoTarget=null;resetAutoNav(null,0);}
    if(state.autoTarget&&!manual){
      const item=state.autoTarget.item;
      if(!item||!item.object){state.autoTarget=null;resetAutoNav(null,0);}else{
        const p=item.object.position,dx=p.x-state.player.x,dz=p.z-state.player.z,dist=Math.hypot(dx,dz);
        const moved=Math.hypot(state.player.x-(state.autoNav?.lastX||state.player.x),state.player.z-(state.autoNav?.lastZ||state.player.z));
        const progress=(state.autoNav?.lastDist||dist)-dist;
        const approach=approachDistanceForItem(item)+(item.type==='door'?.18:0);
        if(dist<approach){
          const arrived = item;
          state.autoTarget=null;resetAutoNav(null,0);
          if(arrived) setTimeout(()=>interact(arrived), 0);
        }else{
          if(progress<.012 && moved<.035) state.autoNav.stuck+=dt; else state.autoNav.stuck=Math.max(0,state.autoNav.stuck-dt*1.8);
          if(item.type==='door'&&state.autoNav.stuck>1.35){
            pushFieldLog('Kapi rotasi takildi, gecis tamamlandi: '+item.label,'info');
            state.autoTarget=null;resetAutoNav(null,0);
            setArea(item.target);
            return;
          }
          if(state.autoNav.stuck>.9){state.autoNav.strafeDir*=-1;state.autoNav.stuck=.28;}
          state.autoNav.lastDist=dist;state.autoNav.lastX=state.player.x;state.autoNav.lastZ=state.player.z;
          const desired=Math.atan2(dx,-dz),delta=Math.atan2(Math.sin(desired-state.yaw),Math.cos(desired-state.yaw));
          state.yaw+=delta*clamp(dt*(dist<5?5.8:4.4),0,1);
          forward=dist<3.8 ? .68 : 1;
          strafe=state.autoNav.stuck>.22 ? state.autoNav.strafeDir*(dist<5?.58:.36) : 0;
          if(state.autoNav.stuck>.2 && state.elapsed-(state.autoNav.lastPulse||0)>1.8){state.autoNav.lastPulse=state.elapsed;pushFieldLog('Oto rota engelden kaciniyor: '+item.label,'info');}
        }
      }
    }
    const length=Math.hypot(forward,strafe);
    const moving=length>.04;
    if(length>1){forward/=length;strafe/=length;}
    const speed=movementSpeedForArea(area,state.keys.shift);
    const fx=Math.sin(state.yaw),fz=-Math.cos(state.yaw),rx=Math.cos(state.yaw),rz=Math.sin(state.yaw);
    const targetVx=(fx*forward+rx*strafe)*speed,targetVz=(fz*forward+rz*strafe)*speed;
    const blend=1-Math.exp(-dt*10);
    state.velocity.x+=(targetVx-state.velocity.x)*blend;state.velocity.z+=(targetVz-state.velocity.z)*blend;
    if(!moving&&!state.autoTarget){state.velocity.x*=Math.pow(.03,dt);state.velocity.z*=Math.pow(.03,dt);}
    const resolved=resolveCollision(state.player.x+state.velocity.x*dt,state.player.z+state.velocity.z*dt);
    state.player.x=resolved.x;
    state.player.z=resolved.z;
    const moveSpeed=Math.hypot(state.velocity.x,state.velocity.z);
    if(moveSpeed>.35) playFootstep(clamp(moveSpeed/4,0,1.25));
    const shipSway=(area?.outside||state.area==='bridge')?Math.sin(state.elapsed*.72)*.018:state.area==='engine'?Math.sin(state.elapsed*1.6)*.011:Math.sin(state.elapsed*.4)*.004;
    const bob=moving?Math.sin(state.elapsed*(state.keys.shift?13.2:10))*clamp(moveSpeed*.011,.018,.052):Math.sin(state.elapsed*1.5)*.006;
    const lean=clamp(strafe*.045 + state.velocity.x*.004,-.075,.075)+shipSway;
    state.roll+=(lean-state.roll)*clamp(dt*7,0,1);
    state.camera.position.set(state.player.x,1.66+bob,state.player.z);
    state.camera.rotation.y=state.yaw;state.camera.rotation.x=state.pitch;state.camera.rotation.z=state.roll;
    state.ui.root.classList.toggle('moving',moving);
    state.ui.root.classList.toggle('running',moving&&state.keys.shift);
  }

  function updateAtmosphere(){
    if(!state.scene||!state.lights)return;
    const area=AREAS[state.area]||AREAS.bridge;
    const hour=Math.floor(state.watchMinutes/60)%24;
    const night=hour>=19||hour<6;
    const eventKind=state.liveEvent?.kind||'';
    const outside=!!area.outside;
    if(outside){
      const bg=night?0x071321:(eventKind==='nav'?0x12304a:0x8fc8e6);
      const fog=night?0x071321:(eventKind==='nav'?0x1d5c78:0x82b4cc);
      state.scene.background.setHex(bg);
      if(state.scene.fog&&state.scene.fog.color) state.scene.fog.color.setHex(fog);
      if(state.lights.hemi) state.lights.hemi.intensity=night ? 1.25 : 2.25;
      if(state.lights.ambient) state.lights.ambient.intensity=night ? .42 : .95;
      if(state.lights.key) state.lights.key.intensity=night ? .72 : 2.2;
    }else{
      if(state.lights.hemi) state.lights.hemi.intensity=eventKind==='engine' ? 1.25 : 1.55;
      if(state.lights.ambient) state.lights.ambient.intensity=(eventKind==='urgent'||eventKind==='engine') ? .45 : .58;
      if(state.lights.key) state.lights.key.intensity=eventKind ? .95 : 1.15;
    }
  }
  function updateIncidentMarkers(){
    state.interactions.forEach(item=>{
      if(item.kind!=='incident'||!item.object||!item.object.userData.incident)return;
      const inc=item.object.userData.incident;
      const pulse=.5+.5*Math.sin(state.elapsed*4.4+inc.phase);
      if(inc.ring){inc.ring.scale.setScalar(1+pulse*.18);inc.ring.material.opacity=.36+pulse*.28;}
      if(inc.badge){inc.badge.rotation.y+=.025;inc.badge.position.y=1.08+Math.sin(state.elapsed*3.2+inc.phase)*.08;}
      if(inc.light)inc.light.intensity=.6+pulse*1.2;
    });
  }
  function updateStationSignals(){
    const target=getDirectorLocalItem(getDirectorTarget());
    state.interactions.forEach(item=>{
      if(item.type==='door'||item.type==='npc'||!item.object||!item.object.userData||!item.object.userData.stationHalo)return;
      const data=item.object.userData.stationHalo,halo=data.halo;if(!halo)return;
      const dist=Math.hypot(item.object.position.x-state.player.x,item.object.position.z-state.player.z);
      const active=target&&target.id===item.id;
      const used=!!state.discoveries[item.id]||!!state.questDone[item.id]||!!state.completedDrills[item.id];
      const near=dist<approachDistanceForItem(item)+.75;
      const pulse=.5+.5*Math.sin(state.elapsed*3.4+data.phase);
      halo.visible=active||near||used;
      halo.scale.setScalar((active?1.18:near?1.08:1)+pulse*(active?.18:.08));
      halo.material.opacity=active?(.42+pulse*.22):near?(.32+pulse*.16):used?.18:.1;
      if(halo.material.color)halo.material.color.setHex(used&&!active?0x72e4a6:data.color);
    });
  }

  function updateDoorSignals(){
    const target=getDirectorLocalItem(getDirectorTarget());
    state.interactions.forEach(item=>{
      if(item.type!=='door'||!item.object||!item.object.userData)return;
      const lamp=item.object.userData.lamp,panel=item.object.userData.panel;
      const dist=Math.hypot(item.object.position.x-state.player.x,item.object.position.z-state.player.z);
      const active=target&&target.id===item.id;
      const near=dist<3.4;
      const pulse=.5+.5*Math.sin(state.elapsed*5.2);
      if(lamp){
        lamp.scale.set(near?1.35:active?1.22:1,near?1.35:active?1.22:1,near?1.35:active?1.22:1);
        if(lamp.material&&lamp.material.emissiveIntensity!==undefined) lamp.material.emissiveIntensity=active?4.6+pulse*1.4:near?5.2:3;
      }
      if(panel){
        const targetOpen=near?1:(active?.48:0);
        panel.userData.open+=(targetOpen-(panel.userData.open||0))*clamp(.16+dist*.012,.16,.34);
        panel.position.x=(panel.userData.closedX||0)+panel.userData.open*.46;
        panel.position.z=(panel.userData.closedZ||.02)+panel.userData.open*.08;
        panel.rotation.y=-panel.userData.open*.08;
        if(panel.material&&panel.material.emissiveIntensity!==undefined) panel.material.emissiveIntensity=active?1.35+pulse*.28:near?1.18+pulse*.22:.7;
      }
      if(item.object.userData.sign){
        item.object.userData.sign.position.y=3.05+(active||near?Math.sin(state.elapsed*3.2)*.035:0);
        if(item.object.userData.sign.material)item.object.userData.sign.material.opacity=active?1:near?.94:.72;
      }
    });
  }
  function npcDutyTarget(item,index,eventItem){
    let target=eventItem;
    if(!target){
      const objective=getDirectorLocalItem(getDirectorTarget());
      if(objective&&objective.type!=='door')target=objective;
    }
    if(!target||!target.object||target.id===item.id)return null;
    const p=target.object.position;
    const angle=index*2.399+(target.id.length%5)*.42;
    const radius=target.kind==='incident'?1.45:target.type==='npc'?1.8:1.25;
    const area=AREAS[state.area]||AREAS.bridge;
    return {
      x:clamp(p.x+Math.cos(angle)*radius,-area.bounds[0]+.75,area.bounds[0]-.75),
      z:clamp(p.z+Math.sin(angle)*radius,-area.bounds[1]+.75,area.bounds[1]-.75),
      label:target.label,
      tone:target.tone||target.kind||'info'
    };
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
    updateAtmosphere();
    updateAmbientFx(dt);
    updateStationSignals();
    updateDoorSignals();
    updateIncidentMarkers();
    state.distantShips.forEach((s,i)=>{
      s.object.position.x=s.start+Math.sin(state.elapsed*s.speed+i)*8;
      s.object.position.y=.12+Math.sin(state.elapsed*.7+i)*.08;
      if(s.lamp){const urgent=!!state.liveEvent&&(state.liveEvent.kind==='nav'||state.liveEvent.kind==='urgent'||state.liveEvent.kind==='radio');s.lamp.visible=urgent?Math.floor(state.elapsed*5+i)%2===0:Math.floor(state.elapsed*2+i)%2===0;if(s.lamp.material&&s.lamp.material.emissiveIntensity!==undefined)s.lamp.material.emissiveIntensity=urgent?3.8:2.8;}
    });
    const worldArea=AREAS[state.area]||AREAS.bridge;
    const incidentFocus=nearestActiveIncident();
    const eventItem=state.liveEvent&&state.liveEvent.area===state.area?findInteractionById(state.liveEvent.id):(incidentFocus?incidentFocus.item:null);
    state.npcs.forEach((item,index)=>{
      const a=item.anim,p=a.path&&a.path.length?a.path:[[item.object.position.x,item.object.position.z]];
      const prevX=item.object.position.x,prevZ=item.object.position.z;
      const duty=npcDutyTarget(item,index,eventItem);
      let moving=false;
      if(duty){
        const dx=duty.x-item.object.position.x,dz=duty.z-item.object.position.z,dist=Math.hypot(dx,dz);
        if(dist>.2){
          const step=Math.min(dist,(a.speed||.15)*3.75*dt);
          item.object.position.x+=(dx/dist)*step;item.object.position.z+=(dz/dist)*step;moving=true;
        }else{
          a.wait=Math.max(a.wait,.16);
        }
      }else if(p.length>1){
        if(a.wait>0){
          a.wait=Math.max(0,a.wait-dt);
        }else{
          const target=p[a.targetIndex%p.length];
          const dx=target[0]-item.object.position.x,dz=target[1]-item.object.position.z,dist=Math.hypot(dx,dz);
          if(dist<.08){
            item.object.position.x=target[0];item.object.position.z=target[1];
            a.targetIndex=(a.targetIndex+1)%p.length;
            a.wait=.65+((index+a.targetIndex)%4)*.28;
          }else{
            const step=Math.min(dist,(a.speed||.15)*2.65*dt);
            item.object.position.x+=(dx/dist)*step;item.object.position.z+=(dz/dist)*step;moving=true;
          }
        }
      }
      const avoidX=item.object.position.x-state.player.x,avoidZ=item.object.position.z-state.player.z;
      const avoidDist=Math.hypot(avoidX,avoidZ);
      if(avoidDist>.001 && avoidDist<1.18){
        const avoidPush=(1.18-avoidDist)*.42;
        item.object.position.x+=avoidX/avoidDist*avoidPush;
        item.object.position.z+=avoidZ/avoidDist*avoidPush;
        moving=true;
      }
      state.npcs.forEach((other,otherIndex)=>{
        if(otherIndex===index||!other.object)return;
        const ox=item.object.position.x-other.object.position.x,oz=item.object.position.z-other.object.position.z;
        const od=Math.hypot(ox,oz);
        if(od>.001&&od<.92){
          const push=(.92-od)*.28;
          item.object.position.x+=ox/od*push;item.object.position.z+=oz/od*push;moving=true;
        }
      });
      if(worldArea&&worldArea.bounds){
        item.object.position.x=clamp(item.object.position.x,-worldArea.bounds[0]+.55,worldArea.bounds[0]-.55);
        item.object.position.z=clamp(item.object.position.z,-worldArea.bounds[1]+.55,worldArea.bounds[1]-.55);
      }
      const mvx=item.object.position.x-prevX,mvz=item.object.position.z-prevZ;
      moving=moving||Math.hypot(mvx,mvz)>.0008;
      if(moving){
        const targetYaw=Math.atan2(mvx,-mvz);
        const delta=Math.atan2(Math.sin(targetYaw-item.object.rotation.y),Math.cos(targetYaw-item.object.rotation.y));
        item.object.rotation.y+=delta*clamp(dt*8,0,1);
      }else{
        const lookObject=eventItem&&eventItem.object?eventItem.object:null;
        const lookX=lookObject?lookObject.position.x:state.player.x,lookZ=lookObject?lookObject.position.z:state.player.z;
        const lookYaw=Math.atan2(lookX-item.object.position.x,-(lookZ-item.object.position.z));
        const delta=Math.atan2(Math.sin(lookYaw-item.object.rotation.y),Math.cos(lookYaw-item.object.rotation.y));
        item.object.rotation.y+=delta*clamp(dt*(lookObject?3.8:2.2),0,1);
      }
      const playerDist=Math.hypot(item.object.position.x-state.player.x,item.object.position.z-state.player.z);
      a.attention+=( (eventItem||playerDist<4.2?1:0)-a.attention)*clamp(dt*4,0,1);
      const speechText=eventItem?(eventItem.label+': '+incidentToneLine(eventItem)):(duty&&a.attention>.35?('Gorev noktasi: '+duty.label):(playerDist<4.2?String(item.detail||item.line||'Vardiya takipte.').slice(0,58):''));
      if(a.speech){
        a.speech.visible=!!speechText;
        if(speechText) updateNpcSpeechBubble(a.speech,speechText,eventItem?.tone||duty?.tone||item.uniform||'info');
        a.speech.position.y=3.08+Math.sin(state.elapsed*1.8+index)*.045;
        if(a.speech.material)a.speech.material.opacity=clamp(.35+a.attention*.75,.35,.98);
      }
      a.gesture+=dt*(moving?1.9:.75);
      const gait=state.elapsed*8.4+index;
      const swing=moving?Math.sin(gait)*.46:Math.sin(state.elapsed*1.7+index)*.045;
      const footLift=moving?Math.max(0,Math.sin(gait))*.055:0;
      const otherLift=moving?Math.max(0,-Math.sin(gait))*.055:0;
      const breath=Math.sin(state.elapsed*1.35+a.phase)*.018;
      const weightShift=moving?Math.sin(gait)*.026:Math.sin(state.elapsed*1.15+index)*.006;
      a.root.position.y=moving?Math.abs(Math.sin(gait*2))*.012:0;
      a.root.rotation.z=weightShift;
      a.leftLeg.rotation.x=swing;a.rightLeg.rotation.x=-swing;
      a.leftLeg.position.y=.94+footLift;a.rightLeg.position.y=.94+otherLift;
      if(a.leftFootShadow){a.leftFootShadow.material.opacity=moving?(.3-footLift*3.2):.22;a.leftFootShadow.scale.setScalar(1+otherLift*2.1);}
      if(a.rightFootShadow){a.rightFootShadow.material.opacity=moving?(.3-otherLift*3.2):.22;a.rightFootShadow.scale.setScalar(1+footLift*2.1);}
      if(a.leftBoot)a.leftBoot.rotation.x=clamp(-swing*.22,-.16,.16);
      if(a.rightBoot)a.rightBoot.rotation.x=clamp(swing*.22,-.16,.16);
      a.leftArm.rotation.x=-swing*.85-a.attention*.18+Math.sin(a.gesture+index)*.045;
      a.rightArm.rotation.x=swing*.85-a.attention*.12+Math.cos(a.gesture*.8+index)*.04;
      if(duty&&!moving&&a.attention>.5){a.rightArm.rotation.z=-.38-Math.sin(a.gesture*1.4)*.08;a.leftArm.rotation.z=.18;}else{a.rightArm.rotation.z=0;a.leftArm.rotation.z=0;}
      a.spine.position.y=1.18+breath+(moving?Math.abs(Math.sin(gait))*.035:Math.sin(state.elapsed*1.2+index)*.01);
      a.spine.rotation.x=a.attention*.045+clamp(Math.sin(gait)*.025,-.025,.025);
      const faceYaw=Math.atan2(state.player.x-item.object.position.x,-(state.player.z-item.object.position.z));
      const faceDelta=Math.atan2(Math.sin(faceYaw-item.object.rotation.y),Math.cos(faceYaw-item.object.rotation.y));
      a.headGroup.rotation.y=clamp(faceDelta,-.42,.42);
      a.headGroup.rotation.x=clamp(a.attention*.08+Math.sin(state.elapsed*1.9+a.phase)*.018,-.08,.13);
      const alert=!!eventItem;
      a.ring.material.opacity=alert ? .46 : (state.nearest&&state.nearest.id===item.id&&state.nearest.distance<3.2 ? .58 : .28);
      if(a.ring.material.color) a.ring.material.color.setHex(alert?0xffd66b:0x72e4a6);
      a.shadow.scale.setScalar(moving?1.08:1);
      a.lastX=item.object.position.x;a.lastZ=item.object.position.z;
    });
    if(state.elapsed-state.screenTick>.08){
      state.screenTick=state.elapsed;state.animatedScreens.forEach(s=>drawScreen(s,state.elapsed,false));
    }
  }

  function loop(time){
    if(!state.active){state.animationId=0;return;}
    const now=time*.001,dt=clamp(state.lastFrame?now-state.lastFrame:.016,.001,.05);
    state.lastFrame=now;state.elapsed+=dt;
    updateMovement(dt);updateWorld(dt);updateWorldStatus(dt);maybeTriggerLiveEvent();updateLiveEventPressure();updateCrewBarks();pulseAmbient();updateMarkers();updateRouteGuides();updateUsePulses();updateFieldLog(false);updateRiskMeter();
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
    state.nextEventAt=Math.min(state.nextEventAt||999,state.elapsed+5);
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

  function resetInputState(){
    state.keys=Object.create(null);
    state.stick.x=0;state.stick.y=0;state.stick.pointerId=null;
    state.look.active=false;state.look.pointerId=null;
    state.autoTarget=null;state.runLock=false;
    state.ui.stick?.classList.remove('active');
    state.ui.stickKnob&&(state.ui.stickKnob.style.transform='translate(0,0)');
    state.ui.use?.classList.remove('pressed');
    state.ui.run?.classList.remove('locked','active');
  }

  function pauseWorldForBackground(){
    if(!state.active)return;
    saveState();
    resetInputState();
    if(state.animationId)cancelAnimationFrame(state.animationId);
    state.animationId=0;
  }

  function resumeWorldFromBackground(){
    if(!state.active)return;
    state.lastFrame=0;
    startLoop();
  }

  function closeWorld(){
    saveState();state.active=false;resetInputState();closeDialogue();
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
  window.addEventListener('blur',()=>{saveState();resetInputState();});
  window.addEventListener('focus',resumeWorldFromBackground);
  window.addEventListener('pagehide',pauseWorldForBackground);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseWorldForBackground();else resumeWorldFromBackground();});

  const legacyOpen=window.openFirstPersonMode;
  window.openFirstPersonMode=openWorld;
  window.closeFirstPersonMode=closeWorld;
  window.setFirstPersonArea=setArea;
  window.jumpFirstPersonArea=area=>jumpToArea(area,'Dis komut');
  window.interactFirstPerson=interact;
  window.handleFirstPersonKeydown=handleKeydown;
  window.fp3dRespond=respondDialogue;
  window.__GUVERTE_FP3D={state,areas:AREAS,open:openWorld,close:closeWorld,setArea,interact};
})();
