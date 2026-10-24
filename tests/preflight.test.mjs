import assert from 'node:assert/strict';
import test from 'node:test';

try{ await import('../preflight.js'); }catch{}

test('le diagnostic retourne des alertes sélectionnables et ignore les décorations',()=>{
  const inspectProject=globalThis.PlanningPreflight?.inspectProject;
  assert.equal(typeof inspectProject,'function');
  const project={width:1600,height:900,showQr:false,background:{},days:Array.from({length:7},()=>({visible:true})),elements:[
    {id:'decor',type:'shape',builtIn:true,x:-20,y:0,w:40,h:40,opacity:1},
    {id:'title',type:'text',builtIn:false,x:-5,y:20,w:200,h:30,fontSize:12,opacity:1,color:'#777777',fill:'#777777'},
    {id:'card',type:'day',builtIn:true,x:100,y:100,w:300,h:240,fontSize:24,opacity:1,color:'#777777',fill:'#777777'}
  ]};
  const issues=inspectProject(project,{overflowIds:['title'],missingImageIds:[],qrValid:true});
  assert.deepEqual(issues.map(issue=>issue.code),['outside','overflow','small-text','low-contrast']);
  assert.equal(issues.find(issue=>issue.code==='low-contrast').elementId,'card');
  assert.ok(issues.every(issue=>issue.elementId==='title'||issue.elementId==='card'));
  assert.equal(issues.some(issue=>issue.elementId==='decor'),false);
});

test('le diagnostic sain ne produit aucune alerte',()=>{
  const inspectProject=globalThis.PlanningPreflight?.inspectProject;
  assert.equal(typeof inspectProject,'function');
  const project={width:1600,height:900,showQr:false,background:{},days:[],elements:[
    {id:'safe',type:'text',builtIn:false,x:100,y:100,w:300,h:60,fontSize:30,opacity:1,color:'#ffffff',fill:'#111827'}
  ]};
  assert.deepEqual(inspectProject(project,{overflowIds:[],missingImageIds:[],qrValid:true}),[]);
});

test('le diagnostic repère les images absentes, le QR et les chevauchements personnalisés',()=>{
  const inspectProject=globalThis.PlanningPreflight?.inspectProject;
  assert.equal(typeof inspectProject,'function');
  const project={width:1600,height:900,showQr:true,background:{},days:[],elements:[
    {id:'one',type:'text',builtIn:false,x:100,y:100,w:300,h:100,fontSize:30,opacity:1,color:'#ffffff',fill:'#111827'},
    {id:'two',type:'text',builtIn:false,x:120,y:110,w:280,h:90,fontSize:30,opacity:1,color:'#ffffff',fill:'#111827'}
  ]};
  const issues=inspectProject(project,{overflowIds:[],missingImageIds:['image-1'],qrValid:false});
  assert.deepEqual(issues.map(issue=>issue.code),['missing-image','invalid-qr','overlap']);
  assert.equal(issues.at(-1).elementId,'two');
  assert.equal(issues.at(-1).relatedElementId,'one');
});
