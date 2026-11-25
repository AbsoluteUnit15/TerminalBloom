const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function harness(getDisplayMedia){
  const elements=new Map(),events={};let connected;
  const el=id=>{if(!elements.has(id))elements.set(id,{value:id==='motion'?'.7':'1.3',checked:true,paused:true,src:'',setAttribute(k,v){this[k]=v;},getContext(){return {};},pause(){this.paused=true;},focus(){}});return elements.get(id);};
  const analyser={frequencyBinCount:2048};
  const context={state:'running',sampleRate:48000,createAnalyser:()=>analyser,resume:async()=>{},createMediaStreamSource:s=>(connected={stream:s,connect(n){this.destination=n;},disconnect(){this.disconnected=true;}})};
  const sandbox={document:{getElementById:el,addEventListener(){},body:{classList:{contains:()=>false}}},navigator:{mediaDevices:{getDisplayMedia}},window:{AudioContext:function(){return context;},addEventListener:(name,cb)=>events[name]=cb},MediaStream:class{constructor(tracks){this.tracks=tracks;}getTracks(){return this.tracks;}getAudioTracks(){return this.tracks;}},TerminalCRT:require('../crt.js'),TerminalLooks:require('../looks.js'),TerminalMath:require('../core.js'),TerminalScenes:require('../scenes.js'),performance:{now:()=>0},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(){},Uint8Array,URL,console};
  vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),sandbox);
  return {el,events,get connected(){return connected;},analyser};
}
function capture(audio=true){
  const make=kind=>({kind,stopped:false,stop(){this.stopped=true;}});
  const tracks=[make('video'),...(audio?[make('audio')]:[])];
  return {getTracks:()=>tracks,getAudioTracks:()=>tracks.filter(t=>t.kind==='audio')};
}
test('browser audio connects only audio to analyser and releases all tracks in idle',async()=>{
  const stream=capture();let options;
  const h=harness(async value=>{options=value;return stream;});
  await h.el('browserAudio').onclick();
  assert.equal(options.audio.suppressLocalAudioPlayback,false);
  assert.equal(options.video.displaySurface,'monitor');
  assert.equal(options.systemAudio,'include');
  assert.equal(options.monitorTypeSurfaces,'include');
  assert.equal(h.connected.destination,h.analyser);
  assert.deepEqual(h.connected.stream.getTracks().map(t=>t.kind),['audio']);
  assert.equal(h.el('browserAudio')['aria-pressed'],'true');
  h.el('idle').onclick();
  assert.ok(stream.getTracks().every(t=>t.stopped));
  assert.ok(h.connected.disconnected);
  assert.equal(h.el('browserAudio')['aria-pressed'],'false');
});
test('missing shared audio gives actionable help and stops screen capture',async()=>{
  const stream=capture(false),h=harness(async()=>stream);
  await h.el('browserAudio').onclick();
  assert.match(h.el('status').textContent,/Share tab audio/);
  assert.match(h.el('status').textContent,/Share system audio/);
  assert.ok(stream.getTracks().every(t=>t.stopped));
  assert.equal(h.connected,undefined);
});
test('cancelled picker returns to idle with a browser-specific message',async()=>{
  const h=harness(async()=>{throw Object.assign(new Error(),{name:'NotAllowedError'});});
  await h.el('browserAudio').onclick();
  assert.match(h.el('status').textContent,/cancelled|canceled|not allowed/i);
  assert.equal(h.el('browserAudio')['aria-pressed'],'false');
});
test('switching input during picker discards a late capture',async()=>{
  let resolve;const stream=capture(),h=harness(()=>new Promise(r=>resolve=r));
  const pending=h.el('browserAudio').onclick();h.el('idle').onclick();resolve(stream);await pending;
  assert.ok(stream.getTracks().every(t=>t.stopped));
  assert.equal(h.connected,undefined);
});
test('browser Stop sharing and page exit release capture',async()=>{
  for(const end of ['track','page']){
    const stream=capture(),h=harness(async()=>stream);await h.el('browserAudio').onclick();
    if(end==='track')stream.getTracks()[0].onended();else h.events.pagehide();
    assert.ok(stream.getTracks().every(t=>t.stopped));
    assert.equal(h.el('browserAudio')['aria-pressed'],'false');
  }
});
test('local audio disclosure reveals the player without interrupting PC audio',async()=>{
  const stream=capture(),h=harness(async()=>stream);
  h.el('localAudioPanel').hidden=true;
  await h.el('browserAudio').onclick();
  h.el('localAudioToggle').onclick();
  assert.equal(h.el('localAudioPanel').hidden,false);
  assert.equal(h.el('localAudioToggle')['aria-expanded'],'true');
  h.el('localAudioToggle').onclick();
  assert.equal(h.el('localAudioPanel').hidden,true);
  assert.equal(h.el('localAudioToggle')['aria-expanded'],'false');
  assert.ok(stream.getTracks().every(t=>!t.stopped));
});
