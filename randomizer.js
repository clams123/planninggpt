(function(root){
  'use strict';

  const LOCK_KEYS=['layout','cards','palette','effects','typography'];

  function normalizeLocks(value){
    const source=value&&typeof value==='object'?value:{};
    return Object.fromEntries(LOCK_KEYS.map(key=>[key,!!source[key]]));
  }

  function choice(values,current,random){
    const pool=(Array.isArray(values)?values:[]).filter(value=>value!==current);
    const fallback=Array.isArray(values)&&values.length?values:[current];
    const candidates=pool.length?pool:fallback;
    return candidates[Math.floor(random()*candidates.length)]??current;
  }

  function createRecipe({current={},pools={},locks={},random=Math.random}={}){
    const fixed=normalizeLocks(locks);
    const layout=fixed.layout?current.layout:choice(pools.layouts,current.layout,random);
    const skin=fixed.cards?current.skin:choice(pools.skins,current.skin,random);
    const palette=fixed.palette?current.palette:choice(pools.palettes,current.palette,random);
    return {
      layout,
      skin,
      palette,
      angle:fixed.palette?current.angle:Math.floor(random()*361),
      modifier:fixed.effects?current.modifier:choice(pools.modifiers,current.modifier,random),
      preset:fixed.typography?current.preset:choice(pools.presets,current.preset,random)
    };
  }

  function rememberRecipe(history,recipe,limit=3){
    const clean=Array.isArray(history)?history:[];
    return [JSON.parse(JSON.stringify(recipe)),...clean.map(item=>JSON.parse(JSON.stringify(item)))].slice(0,Math.max(1,limit));
  }

  root.PlanningRandomizer={LOCK_KEYS,normalizeLocks,createRecipe,rememberRecipe};
})(typeof window==='undefined'?globalThis:window);
