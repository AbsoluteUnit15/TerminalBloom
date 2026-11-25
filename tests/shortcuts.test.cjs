const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup({fullscreen=true}={}){
  const elements=new Map(),classes=new Set(),handlers={};let requests=0,exits=0;
  const el=id=>{if(!elements.has(id))elements.set(id,{value:'1',checked:false,setAttribute(){},getContext(){return {};},focus(){},blur(){}});return elements.get(id);};
  const document={getElementById:el,activeElement:el('hide'),addEventListener:(name,cb)=>handlers[name]=cb,body:{classList:{toggle:k=>classes.has(k)?classes.delete(k):classes.add(k),contains:k=>classes.has(k),remove:k=>classes.delete(k)}},exitFullscreen:async()=>{exits++;document.fullscreenElement=null;}};
  if(fullscreen)el('stage').requestFullscreen=async()=>{requests++;document.fullscreenElement=el('stage');};
  vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),{document,window:{addEventListener(){}},navigator:{},TerminalCRT:require('../crt.js'),TerminalMath:require('../core.js'),TerminalScenes:require('../scenes.js'),performance:{now:()=>0},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},Uint8Array,URL});
  function key(key,tagName='BODY',extra={}){let prevented=false;handlers.keydown({key,code:key===' '?'Space':`Key${key.toUpperCase()}`,target:{tagName},preventDefault(){prevented=true;},...extra});return prevented;}
  return {key,classes,el,get requests(){return requests;},get exits(){return exits;}};
}
test('H hides only controls without entering fullscreen or expanding the artwork',()=>{
  const h=setup();assert.equal(h.key('h'),true);assert.ok(h.classes.has('controls-hidden'));assert.ok(!h.classes.has('immersive'));assert.equal(h.requests,0);
  h.key('H','BUTTON');assert.ok(!h.classes.has('controls-hidden'));
});
test('F works with button focus, including after restoring controls, and toggles fullscreen',()=>{
  const h=setup();h.key('h');h.key('h');assert.equal(h.key('f','BUTTON'),true);assert.equal(h.requests,1);h.key('f','BUTTON');assert.equal(h.exits,1);
});
test('held shortcuts and typing in selects or editable fields do not toggle the view',()=>{
  const h=setup();h.key('f','BODY',{repeat:true});h.key('h','SELECT');h.key('f','INPUT',{target:{tagName:'INPUT',type:'text'}});h.key('f','DIV',{target:{tagName:'DIV',isContentEditable:true}});assert.equal(h.requests,0);assert.equal(h.classes.size,0);
});
test('fullscreen unavailability is reported without silently hiding controls',()=>{
  const h=setup({fullscreen:false});h.key('f');assert.equal(h.classes.size,0);assert.match(h.el('status').textContent,/full screen.*unavailable|unavailable.*full screen/i);
});
