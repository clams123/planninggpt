(function(){
  'use strict';

  const DB_NAME = 'planninggpt_assets_v1';
  const STORE_NAME = 'images';
  const DB_VERSION = 1;

  function openDatabase(){
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB indisponible.'));
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Ouverture IndexedDB impossible.'));
    });
  }

  async function run(mode, operation){
    const db = await openDatabase();
    try{
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let result;
        try{ result = operation(store); }catch(error){ reject(error); return; }
        tx.oncomplete = () => resolve(result && result.result);
        tx.onerror = () => reject(tx.error || new Error('Écriture IndexedDB impossible.'));
        tx.onabort = () => reject(tx.error || new Error('Transaction IndexedDB annulée.'));
      });
    }finally{
      db.close();
    }
  }

  function put(id, dataUrl){
    if (!id || !String(dataUrl || '').startsWith('data:image/')) return Promise.reject(new Error('Image invalide.'));
    return run('readwrite', store => store.put(String(dataUrl), String(id)));
  }

  async function get(id){
    if (!id) return '';
    const value = await run('readonly', store => store.get(String(id)));
    return typeof value === 'string' && value.startsWith('data:image/') ? value : '';
  }

  function remove(id){
    if (!id) return Promise.resolve();
    return run('readwrite', store => store.delete(String(id)));
  }

  function clear(){
    return run('readwrite', store => store.clear());
  }

  async function keepOnly(ids){
    const allowed = new Set((ids || []).filter(Boolean).map(String));
    const db = await openDatabase();
    try{
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const request = tx.objectStore(STORE_NAME).openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          if (!allowed.has(String(cursor.key))) cursor.delete();
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }finally{
      db.close();
    }
  }

  window.PlanningAssetStore = {put, get, remove, clear, keepOnly};
})();
