const {test}=require('node:test');
const assert=require('node:assert/strict');
test('degauss triggers on a big bass onset and settles without repeated sustained-bass triggers',()=>{
  const {BassPulse}=require('../crt.js');const pulse=new BassPulse();let hits=0;
  for(let i=0;i<60;i++)if(pulse.update(0,1/60))hits++;
  assert.equal(hits,0);assert.equal(pulse.amount,0);
  assert.equal(pulse.update(.9,1/60),true);
  assert.ok(pulse.amount>0);
  for(let i=0;i<240;i++)if(pulse.update(.9,1/60))hits++;
  assert.equal(hits,0);assert.ok(pulse.amount<.001);
  for(let i=0;i<150;i++)pulse.update(0,1/60);
  assert.equal(pulse.update(.85,1/60),true);
});
test('small bass and disabled pulses never trigger; output remains finite',()=>{
  const {BassPulse}=require('../crt.js');const pulse=new BassPulse();
  for(let i=0;i<300;i++)assert.equal(pulse.update(i%2?.35:0,1/60),false);
  assert.equal(pulse.update(1,1/60,false),false);assert.equal(pulse.amount,0);
  assert.ok(Number.isFinite(pulse.age));
});
test('CRT renderer gracefully reports unavailable WebGL',()=>{
  const {Renderer}=require('../crt.js');const renderer=new Renderer({getContext:()=>null},{});
  assert.equal(renderer.available,false);renderer.render({});
});
