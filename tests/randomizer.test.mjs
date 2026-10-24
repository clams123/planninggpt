import assert from 'node:assert/strict';
import test from 'node:test';

try{ await import('../randomizer.js'); }catch{}

test('un verrou conserve uniquement la partie correspondante du design',()=>{
  const createRecipe=globalThis.PlanningRandomizer?.createRecipe;
  assert.equal(typeof createRecipe,'function');
  const sequence=[0,0,0,0,0,0];let cursor=0;
  const recipe=createRecipe({
    current:{layout:'cloud',skin:'cyber',palette:'cozy',angle:91,modifier:'ticket',preset:'comic'},
    pools:{layouts:['cloud','agenda'],skins:['cyber','manga'],palettes:['cozy','rpg'],modifiers:['ticket','anime'],presets:['comic','modern']},
    locks:{layout:true,cards:false,palette:true,effects:false,typography:true},
    random:()=>sequence[cursor++]??0
  });
  assert.deepEqual(recipe,{layout:'cloud',skin:'manga',palette:'cozy',angle:91,modifier:'anime',preset:'comic'});
});

test('les trois derniers tirages restent disponibles sans partager leurs objets',()=>{
  const rememberRecipe=globalThis.PlanningRandomizer?.rememberRecipe;
  assert.equal(typeof rememberRecipe,'function');
  const first={layout:'cloud',skin:'cyber',palette:'cozy',angle:10,modifier:'none',preset:''};
  const second={...first,layout:'agenda'};
  const third={...first,layout:'rpg'};
  const fourth={...first,layout:'manga'};
  const history=rememberRecipe(rememberRecipe(rememberRecipe(rememberRecipe([],first),second),third),fourth);
  assert.deepEqual(history.map(item=>item.layout),['manga','rpg','agenda']);
  fourth.layout='horror';
  assert.equal(history[0].layout,'manga');
});
