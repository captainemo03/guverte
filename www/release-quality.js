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
      webBuild:'index-155/release-quality-1',
      device:getDeviceSummary(),
      scene:getSceneDiagnostic(),
      save:getSaveHealth(),
      products,
      visualQuality,
      native:nativeDiagnosticStatus,
      diagnostics:logs.slice(0,12)
    };
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
    recordReleaseDiagnostic('release_self_test', '', {storageOk, device:getDeviceSummary()});
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
