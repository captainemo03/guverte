(function(){
  'use strict';

  const QUALITY_KEY = 'guverte-visual-quality-v1';
  const DIAGNOSTICS_KEY = 'guverte-diagnostics-v1';
  const SAVE_KEY_LOCAL = 'guverte-save-v1';
  const SAVE_BACKUP_KEY_LOCAL = 'guverte-save-backup-v1';
  const MAX_DIAGNOSTICS = 24;
  const QUALITY_LEVELS = ['low', 'balanced', 'high'];
  let visualQuality = 'balanced';
  let lastHeartbeat = Date.now();
  let nativeDiagnosticStatus = null;

  function readJson(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      return fallback;
    }
  }

  function writeJson(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(e){
      return false;
    }
  }

  function getAutoVisualQuality(){
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = !!navigator.connection?.saveData;
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    if(reduced || saveData || (memory && memory <= 4) || (cores && cores <= 4)) return 'low';
    if((memory >= 8 || memory === 0) && cores >= 8 && Math.min(screen.width, screen.height) >= 720) return 'high';
    return 'balanced';
  }

  function qualityLabel(level){
    const labels = {
      low: typeof t === 'function' ? t('quality.low', 'Performans') : 'Performans',
      balanced: typeof t === 'function' ? t('quality.balanced', 'Dengeli') : 'Dengeli',
      high: typeof t === 'function' ? t('quality.high', 'Yuksek') : 'Yuksek'
    };
    return labels[level] || labels.balanced;
  }

  function syncQualityControls(){
    document.querySelectorAll('[data-quality-controls]').forEach(box=>{
      box.innerHTML = QUALITY_LEVELS.map(level=>`
        <button type="button" class="${visualQuality===level?'active':''}" onclick="setVisualQuality('${level}')">
          ${qualityLabel(level)}
        </button>`).join('');
    });
    document.querySelectorAll('[data-quality-status]').forEach(el=>{
      el.textContent = `${qualityLabel(visualQuality)} - ${getAutoVisualQuality()==='low' ? 'cihaz korumasi' : 'canli grafik profili'}`;
    });
  }

  function setVisualQuality(level, notify){
    visualQuality = QUALITY_LEVELS.includes(level) ? level : getAutoVisualQuality();
    document.documentElement.dataset.visualQuality = visualQuality;
    document.body?.setAttribute('data-visual-quality', visualQuality);
    try{ localStorage.setItem(QUALITY_KEY, visualQuality); }catch(e){}
    syncQualityControls();
    window.dispatchEvent(new CustomEvent('guverte-visual-quality-change', {detail:{quality:visualQuality}}));
    if(notify !== false && typeof showNotif === 'function'){
      showNotif('GRAFIK', 'Gorsel Kalite', `${qualityLabel(visualQuality)} profili aktif.`);
    }
    return visualQuality;
  }

  function getVisualQuality(){
    return visualQuality;
  }

  function compactError(error){
    if(!error) return {message:'Bilinmeyen hata', stack:''};
    if(typeof error === 'string') return {message:error.slice(0,500), stack:''};
    return {
      message:String(error.message || error.reason || error).slice(0,500),
      stack:String(error.stack || '').split('\n').slice(0,8).join('\n').slice(0,1800)
    };
  }

  function getSceneDiagnostic(){
    try{
      const scene = typeof sceneQueue !== 'undefined' && sceneQueue?.length ? sceneQueue[currentIdx] : null;
      return {
        index:typeof currentIdx === 'number' ? currentIdx : -1,
        id:scene?.id || '',
        location:scene?.loc || '',
        gfx:scene?.gfx || ''
      };
    }catch(e){
      return {index:-1,id:'',location:'',gfx:''};
    }
  }

  function sendDiagnosticToNative(entry){
    try{
      if(window.GuverteDiagnosticsNative?.recordWebDiagnostic){
        window.GuverteDiagnosticsNative.recordWebDiagnostic(JSON.stringify(entry));
      }
    }catch(e){}
  }

  function recordReleaseDiagnostic(kind, error, extra){
    const detail = compactError(error);
    const entry = {
      ts:new Date().toISOString(),
      kind:String(kind || 'event').slice(0,40),
      message:detail.message,
      stack:detail.stack,
      scene:getSceneDiagnostic(),
      language:typeof gameLanguage === 'string' ? gameLanguage : 'tr',
      mode:typeof gameplayMode === 'string' ? gameplayMode : 'unknown',
      quality:visualQuality,
      extra:extra && typeof extra === 'object' ? extra : {}
    };
    const logs = readJson(DIAGNOSTICS_KEY, []);
    logs.unshift(entry);
    writeJson(DIAGNOSTICS_KEY, logs.slice(0, MAX_DIAGNOSTICS));
    sendDiagnosticToNative(entry);
    return entry;
  }

  function getReleaseDiagnostics(){
    return readJson(DIAGNOSTICS_KEY, []);
  }

  function clearReleaseDiagnostics(){
    try{ localStorage.removeItem(DIAGNOSTICS_KEY); }catch(e){}
    try{ window.GuverteDiagnosticsNative?.clearDiagnostics?.(); }catch(e){}
    if(typeof showNotif === 'function') showNotif('QA', 'Tanilama Temizlendi', 'Yerel hata ve donma kayitlari silindi.');
    renderReleaseHealthSummary();
  }

  function getDeviceSummary(){
    return {
      platform:navigator.platform || 'unknown',
      language:navigator.language || 'unknown',
      screen:`${screen.width}x${screen.height}`,
      viewport:`${window.innerWidth}x${window.innerHeight}`,
      pixelRatio:Number(window.devicePixelRatio || 1).toFixed(2),
      cores:Number(navigator.hardwareConcurrency || 0),
      memoryGb:Number(navigator.deviceMemory || 0),
      saveData:!!navigator.connection?.saveData,
      online:navigator.onLine !== false
    };
  }

  function getSaveHealth(){
    const main = readJson(SAVE_KEY_LOCAL, null);
    const backup = readJson(SAVE_BACKUP_KEY_LOCAL, null);
    return {
      main:!!(main && Array.isArray(main.sceneQueue) && main.sceneQueue.length),
      mainSavedAt:main?.savedAt || '',
      backup:!!(backup && Array.isArray(backup.sceneQueue) && backup.sceneQueue.length),
      backupSavedAt:backup?.savedAt || ''
    };
  }

  function buildReleaseDiagnosticReport(){
    const logs = getReleaseDiagnostics();
    const hardening = getReleaseHardeningChecks(false);
    const products = {
      billingBridge:!!(window.GuverteBillingNative || window.GuverteBilling),
      adsBridge:!!window.GuverteAdsNative,
      diagnosticsBridge:!!window.GuverteDiagnosticsNative,
      premium:typeof premiumUnlocked === 'boolean' ? premiumUnlocked : false,
      removeAds:typeof adsRemoved === 'boolean' ? adsRemoved : false
    };
    return {
      generatedAt:new Date().toISOString(),
      app:'Guverte',
      webBuild:'index-163/release-quality-8',
      device:getDeviceSummary(),
      scene:getSceneDiagnostic(),
      save:getSaveHealth(),
      products,
      hardening,
      visualQuality,
      native:nativeDiagnosticStatus,
      diagnostics:logs.slice(0,12)
    };
  }

  function releaseCheck(status, title, detail){
    return {status, title, detail:String(detail || '').slice(0,260)};
  }

  function getReleaseHardeningChecks(applyFixes){
    const checks = [];
    const push = (status, title, detail)=>checks.push(releaseCheck(status, title, detail));
    try{
      if(typeof refreshMonetizationState === 'function') refreshMonetizationState();
      const premiumState = typeof premiumUnlocked === 'boolean' ? premiumUnlocked : false;
      const lockedScenes = !premiumState && Array.isArray(sceneQueue) && typeof isPremiumContentScene === 'function'
        ? sceneQueue.filter(sc=>isPremiumContentScene(sc)).length
        : 0;
      const premiumShip = !premiumState && typeof isPremiumShipType === 'function' && typeof selType !== 'undefined' && isPremiumShipType(selType);
      if((lockedScenes || premiumShip) && applyFixes && typeof enforcePremiumAccessGuards === 'function'){
        enforcePremiumAccessGuards('release_self_test');
      }
      push(lockedScenes || premiumShip ? 'fail' : 'pass', 'Premium guard', lockedScenes || premiumShip
        ? `Ucretsiz akista premium iz var: ${lockedScenes} sahne, gemi=${premiumShip}`
        : `Premium kilidi temiz. ID: ${typeof PREMIUM_PRODUCT_ID !== 'undefined' ? PREMIUM_PRODUCT_ID : 'premium_full_pack'}`);
      push(typeof ADS_REMOVAL_PRODUCT_ID !== 'undefined' && ADS_REMOVAL_PRODUCT_ID === 'remove_ads' ? 'pass' : 'warn', 'Remove ads product', `ID: ${typeof ADS_REMOVAL_PRODUCT_ID !== 'undefined' ? ADS_REMOVAL_PRODUCT_ID : 'yok'} · durum ${typeof adsRemoved === 'boolean' && adsRemoved ? 'aktif' : 'kilitli'}`);
    }catch(error){
      push('fail', 'Premium / ads guard', compactError(error).message);
    }

    try{
      const fixed = applyFixes && typeof sanitizeCrewPortraitRoster === 'function' ? sanitizeCrewPortraitRoster('release_self_test') : 0;
      let mismatches = 0;
      if(typeof CREW_DEFS !== 'undefined' && typeof inferPortraitBase === 'function' && typeof crewPortraits !== 'undefined'){
        Object.keys(CREW_DEFS).forEach(key=>{
          const expected = inferPortraitBase(CREW_DEFS[key]);
          const current = crewPortraits[key];
          const sheet = String(current?.portraitSheet || '');
          const wrongSheet = expected === 'female'
            ? /support-style-male|support-male/i.test(sheet)
            : /support-style-female|support-female/i.test(sheet);
          const wrongBase = current && current.__base && current.__base !== expected;
          const femaleBeard = expected === 'female' && current?.beard && current.beard !== 'clean';
          if(!current || wrongSheet || wrongBase || femaleBeard) mismatches += 1;
        });
      }
      push(mismatches ? 'fail' : fixed ? 'warn' : 'pass', 'Character gender QA', mismatches
        ? `${mismatches} karakterde isim/cinsiyet/portre uyumsuzlugu kaldi.`
        : fixed ? `${fixed} eski portre otomatik yenilendi.` : 'Kadin/erkek isimleri ve portre base eslesmesi temiz.');
    }catch(error){
      push('fail', 'Character gender QA', compactError(error).message);
    }

    try{
      const taskCount = typeof MAP_TASKS !== 'undefined' && Array.isArray(MAP_TASKS) ? MAP_TASKS.length : 0;
      let currentOk = false;
      let tolerance = 0;
      if(taskCount && typeof getCurrentMapTask === 'function' && typeof ensureSelectedPortChart === 'function' && typeof getMapTaskTarget === 'function' && typeof getMapTaskEffectiveTolerance === 'function'){
        const task = getCurrentMapTask();
        const port = ensureSelectedPortChart();
        const target = task && port ? getMapTaskTarget(task, port) : null;
        tolerance = target ? getMapTaskEffectiveTolerance(task, target) : 0;
        currentOk = !!(target && Number.isFinite(target.x) && Number.isFinite(target.y) && tolerance >= 20);
      }
      push(taskCount >= 10 && currentOk ? 'pass' : taskCount >= 6 ? 'warn' : 'fail', 'Map / ECDIS tasks', `${taskCount} gorev · aktif hitbox toleransi ${Math.round(tolerance)}px · chart ${currentOk ? 'tiklanabilir' : 'kontrol istiyor'}`);
    }catch(error){
      push('fail', 'Map / ECDIS tasks', compactError(error).message);
    }

    try{
      const deviceCount = typeof DEVICE_TRAINER !== 'undefined' && Array.isArray(DEVICE_TRAINER) ? DEVICE_TRAINER.length : 0;
      const menuCount = typeof DEVICE_MENU_TREE !== 'undefined' ? Object.keys(DEVICE_MENU_TREE).length : 0;
      const practiceCount = typeof DEVICE_PRACTICE !== 'undefined' ? Object.keys(DEVICE_PRACTICE).length : 0;
      push(deviceCount >= 8 && menuCount >= 8 && practiceCount >= 6 ? 'pass' : 'warn', 'Device simulator', `${deviceCount} cihaz · ${menuCount} menu agaci · ${practiceCount} pratik zinciri`);
    }catch(error){
      push('fail', 'Device simulator', compactError(error).message);
    }

    try{
      const normalized = typeof normalizePlayerAppearance === 'function';
      const noteReady = !!document.querySelector?.('.creator-auto-uniform-note');
      push(normalized && noteReady ? 'pass' : 'warn', 'Creator preset guard', normalized
        ? 'Karakter preset normalizasyonu ve rol bazli uniforma notu aktif.'
        : 'Karakter preset normalizasyonu bulunamadi.');
    }catch(error){
      push('warn', 'Creator preset guard', compactError(error).message);
    }

    try{
      const setupReady = typeof getSetupReadinessDetails === 'function' && typeof renderSetupOnboardingGuide === 'function';
      const premiumReady = typeof getPremiumAccessSummary === 'function';
      push(setupReady && premiumReady ? 'pass' : 'warn', 'Launch readiness', setupReady && premiumReady
        ? 'Ilk akista karakter, gemi, rota, mod ve premium durumu tek panelde kontrol ediliyor.'
        : 'Ilk akis / premium ozet baglantisi eksik.');
    }catch(error){
      push('warn', 'Launch readiness', compactError(error).message);
    }

    try{
      const mapPractice = typeof maybeQueueMapPracticeFromScene === 'function' && typeof getRemedialMapTaskForScene === 'function';
      const polish = typeof getGamePolishStatus === 'function';
      push(mapPractice && polish ? 'pass' : 'warn', 'Mission polish spine', mapPractice && polish
        ? 'Harita tekrari ve oyun ici durum kocu sahne kararlarina bagli.'
        : 'Harita tekrari veya oyun ici durum kocu eksik.');
    }catch(error){
      push('warn', 'Mission polish spine', compactError(error).message);
    }

    try{
      const retentionReady = typeof progressRetentionMission === 'function'
        && typeof renderRetentionPanel === 'function'
        && typeof recordLeaderboardScore === 'function';
      const missionReady = typeof DAILY_MISSION_POOL !== 'undefined' && typeof WEEKLY_MISSION_POOL !== 'undefined';
      push(retentionReady && missionReady ? 'pass' : 'warn', 'Retention loop', retentionReady && missionReady
        ? 'Sezon, gunluk/haftalik gorev, XP ve leaderboard dongusu aktif.'
        : 'Retention dongusu eksik.');
    }catch(error){
      push('warn', 'Retention loop', compactError(error).message);
    }

    try{
      const graphicsReady = typeof getProfessionalGraphicsOverlay === 'function'
        && typeof getModernBridgeOverlay === 'function'
        && typeof getScene4KOverlay === 'function';
      const cinemaReady = typeof CINEMATIC_SCENES !== 'undefined'
        && !!CINEMATIC_SCENES.suezConvoy
        && !!CINEMATIC_SCENES.panamaLock
        && !!CINEMATIC_SCENES.tankerManifold
        && !!CINEMATIC_SCENES.researchRov;
      const threeReady = typeof getThreeAreaLauncherPanel === 'function'
        && typeof openThreeTrainingArea === 'function';
      push(graphicsReady && cinemaReady && threeReady ? 'pass' : 'warn', 'Professional graphics package', graphicsReady && cinemaReady && threeReady
        ? 'Modern bridge, atlas/ECDIS overlay, cinematic pack and 3D training launchers are wired.'
        : 'Professional graphics package needs review.');
    }catch(error){
      push('warn', 'Professional graphics package', compactError(error).message);
    }

    try{
      const mobileWidth = Math.min(window.innerWidth || 0, screen.width || 0);
      const clean = typeof cleanHudMode === 'boolean' ? cleanHudMode : false;
      push(mobileWidth && mobileWidth <= 480 && !clean ? 'warn' : 'pass', 'Screen breathing', clean ? 'Temiz HUD acik.' : `Standart HUD · viewport ${window.innerWidth}x${window.innerHeight}`);
    }catch(error){
      push('warn', 'Screen breathing', compactError(error).message);
    }

    try{
      const save = getSaveHealth();
      push(save.main || save.backup ? 'pass' : 'warn', 'Save safety', save.main ? 'Ana kayit hazir.' : save.backup ? 'Yedek kayit hazir.' : 'Henuz kayit yok.');
    }catch(error){
      push('fail', 'Save safety', compactError(error).message);
    }

    return checks;
  }

  function renderReleaseHardeningSummary(){
    const box = document.getElementById('release-hardening-summary');
    if(!box) return;
    const checks = getReleaseHardeningChecks(true);
    box.innerHTML = checks.map(check=>`
      <div class="release-check-card ${check.status}">
        <em>${check.status}</em>
        <b>${check.title}</b>
        <small>${check.detail}</small>
      </div>`).join('');
  }

  function feedbackText(){
    const category = document.getElementById('tester-feedback-category')?.value || 'general';
    const title = (document.getElementById('tester-feedback-title')?.value || '').trim();
    const description = (document.getElementById('tester-feedback-description')?.value || '').trim();
    const include = document.getElementById('tester-feedback-diagnostics')?.checked !== false;
    const report = include ? buildReleaseDiagnosticReport() : null;
    return [
      `Category: ${category}`,
      `Title: ${title || 'Guverte test feedback'}`,
      '',
      description || 'No description entered.',
      '',
      include ? 'Diagnostics:' : '',
      include ? '```json' : '',
      include ? JSON.stringify(report, null, 2) : '',
      include ? '```' : ''
    ].filter((line, index, all)=>line || (index > 0 && all[index-1])).join('\n');
  }

  async function copyText(value){
    try{
      await navigator.clipboard.writeText(value);
      return true;
    }catch(e){
      const area = document.createElement('textarea');
      area.value = value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  }

  async function copyTesterReport(){
    const ok = await copyText(feedbackText());
    if(typeof showNotif === 'function'){
      showNotif('QA', ok ? 'Rapor Kopyalandi' : 'Kopyalama Basarisiz', ok ? 'Tester raporu panoya alindi.' : 'Raporu tekrar dene.');
    }
  }

  function downloadJson(name, payload){
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
  }

  function downloadTesterReport(){
    downloadJson(`guverte-test-report-${Date.now()}.json`, buildReleaseDiagnosticReport());
  }

  function openGitHubFeedback(){
    const title = (document.getElementById('tester-feedback-title')?.value || 'Guverte test feedback').trim();
    const body = feedbackText().slice(0,7000);
    const url = `https://github.com/captainemo03/guverte/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
  }

  function openTesterFeedback(){
    const panel = document.getElementById('tester-feedback-panel');
    if(!panel) return;
    panel.classList.add('show');
    panel.setAttribute('aria-hidden', 'false');
    renderReleaseHealthSummary();
  }

  function closeTesterFeedback(){
    const panel = document.getElementById('tester-feedback-panel');
    panel?.classList.remove('show');
    panel?.setAttribute('aria-hidden', 'true');
  }

  function renderReleaseHealthSummary(){
    const box = document.getElementById('release-health-summary');
    if(!box) return;
    const report = buildReleaseDiagnosticReport();
    const save = report.save;
    box.innerHTML = [
      ['Kayit', save.main ? 'hazir' : 'yok'],
      ['Yedek', save.backup ? 'hazir' : 'yok'],
      ['Billing', report.products.billingBridge ? 'bagli' : 'web'],
      ['Reklam', report.products.adsBridge ? 'bagli' : 'web'],
      ['Tanilama', `${report.diagnostics.length} kayit`],
      ['Grafik', qualityLabel(visualQuality)]
    ].map(([key,value])=>`<span><b>${key}</b><em>${value}</em></span>`).join('');
    renderReleaseHardeningSummary();
  }

  function exportSaveBackup(){
    const payload = readJson(SAVE_KEY_LOCAL, null);
    if(!payload){
      if(typeof showNotif === 'function') showNotif('KAYIT', 'Kayit Yok', 'Disa aktarilacak oyun kaydi bulunamadi.');
      return;
    }
    downloadJson(`guverte-save-${Date.now()}.json`, {
      type:'guverte-save-export',
      exportedAt:new Date().toISOString(),
      payload
    });
    if(typeof showNotif === 'function') showNotif('KAYIT', 'Yedek Hazir', 'Kayit dosyasi disa aktarildi.');
  }

  function triggerSaveImport(){
    document.getElementById('save-import-input')?.click();
  }

  async function handleSaveImport(event){
    const file = event?.target?.files?.[0];
    if(!file) return;
    try{
      const parsed = JSON.parse(await file.text());
      const payload = parsed?.type === 'guverte-save-export' ? parsed.payload : parsed;
      if(!payload || !Array.isArray(payload.sceneQueue) || !payload.sceneQueue.length || !payload.stats){
        throw new Error('Gecerli Guverte kaydi degil.');
      }
      const current = localStorage.getItem(SAVE_KEY_LOCAL);
      if(current){
        try{ localStorage.setItem(SAVE_BACKUP_KEY_LOCAL, current); }
        catch(error){ recordReleaseDiagnostic('save_import_backup_skipped', error); }
      }
      try{
        localStorage.setItem(SAVE_KEY_LOCAL, JSON.stringify(payload));
      }catch(firstError){
        localStorage.removeItem(SAVE_BACKUP_KEY_LOCAL);
        localStorage.setItem(SAVE_KEY_LOCAL, JSON.stringify(payload));
        recordReleaseDiagnostic('save_import_storage_recovered', firstError);
      }
      if(typeof refreshSaveEntryActions === 'function') refreshSaveEntryActions();
      if(typeof renderSavePanel === 'function') renderSavePanel();
      if(typeof showNotif === 'function') showNotif('KAYIT', 'Kayit Ice Aktarildi', 'Devam Et ile yedegi acabilirsin.');
    }catch(error){
      recordReleaseDiagnostic('save_import_error', error, {fileName:file.name});
      if(typeof showNotif === 'function') showNotif('KAYIT', 'Yedek Acilamadi', 'Dosya bozuk veya baska bir uygulamaya ait.');
    }finally{
      event.target.value = '';
    }
  }

  function runReleaseSelfTest(){
    const testKey = 'guverte-release-self-test';
    let storageOk = false;
    try{
      localStorage.setItem(testKey, String(Date.now()));
      storageOk = !!localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
    }catch(e){
      recordReleaseDiagnostic('storage_test_error', e);
    }
    try{ window.GuverteBillingNative?.checkProducts?.(); }catch(e){ recordReleaseDiagnostic('billing_test_error', e); }
    try{ window.GuverteAdsNative?.getStatus?.(); }catch(e){ recordReleaseDiagnostic('ads_test_error', e); }
    try{ window.GuverteDiagnosticsNative?.getStatus?.(); }catch(e){ recordReleaseDiagnostic('native_diagnostics_error', e); }
    const hardening = getReleaseHardeningChecks(true);
    recordReleaseDiagnostic('release_self_test', '', {storageOk, device:getDeviceSummary(), hardening});
    renderReleaseHealthSummary();
    openTesterFeedback();
    if(typeof showNotif === 'function') showNotif('QA', 'Yayin Testi Tamam', storageOk ? 'Kayit, cihaz ve kopru kontrolleri calisti.' : 'Yerel kayit testi basarisiz.');
  }

  window.__guverteDiagnosticsNativeStatus = function(status){
    nativeDiagnosticStatus = status && typeof status === 'object' ? status : null;
    renderReleaseHealthSummary();
  };

  window.setVisualQuality = setVisualQuality;
  window.getVisualQuality = getVisualQuality;
  window.openTesterFeedback = openTesterFeedback;
  window.closeTesterFeedback = closeTesterFeedback;
  window.copyTesterReport = copyTesterReport;
  window.downloadTesterReport = downloadTesterReport;
  window.openGitHubFeedback = openGitHubFeedback;
  window.clearReleaseDiagnostics = clearReleaseDiagnostics;
  window.getReleaseHardeningChecks = getReleaseHardeningChecks;
  window.renderReleaseHardeningSummary = renderReleaseHardeningSummary;
  window.exportSaveBackup = exportSaveBackup;
  window.triggerSaveImport = triggerSaveImport;
  window.handleSaveImport = handleSaveImport;
  window.runReleaseSelfTest = runReleaseSelfTest;
  window.renderReleaseHealthSummary = renderReleaseHealthSummary;
  window.recordReleaseDiagnostic = recordReleaseDiagnostic;

  window.addEventListener('error', event=>{
    recordReleaseDiagnostic('javascript_error', event.error || event.message, {
      file:String(event.filename || '').split('/').pop(),
      line:event.lineno || 0,
      column:event.colno || 0
    });
  });

  window.addEventListener('unhandledrejection', event=>{
    recordReleaseDiagnostic('unhandled_rejection', event.reason || 'Promise rejection');
  });

  window.addEventListener('offline', ()=>recordReleaseDiagnostic('network_offline', 'Internet baglantisi kesildi.'));
  window.addEventListener('online', ()=>recordReleaseDiagnostic('network_online', 'Internet baglantisi geri geldi.'));

  setInterval(()=>{
    const now = Date.now();
    const drift = now - lastHeartbeat - 3000;
    if(drift > 6000) recordReleaseDiagnostic('ui_stall', `Ana ekran ${Math.round(drift/1000)} saniye yanit vermedi.`, {driftMs:drift});
    lastHeartbeat = now;
  }, 3000);

  function initializeReleaseQuality(){
    let saved = '';
    try{ saved = localStorage.getItem(QUALITY_KEY) || ''; }catch(e){}
    setVisualQuality(QUALITY_LEVELS.includes(saved) ? saved : getAutoVisualQuality(), false);
    renderReleaseHealthSummary();
    try{ window.GuverteDiagnosticsNative?.getStatus?.(); }catch(e){}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initializeReleaseQuality, {once:true});
  }else{
    initializeReleaseQuality();
  }
})();
