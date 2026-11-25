const {test}=require('node:test');
const assert=require('node:assert/strict');
test('each new scene produces distinct finite glyph compositions at rest and with audio',()=>{
  const {render,names}=require('../scenes.js');
  const signatures=new Set();
  for(const scene of names){
    const capture=(time,energy)=>{
      const points=[];
      render(scene,{width:1200,height:700,t:time,energy,density:'medium',plot:(...p)=>points.push(p)});
      assert.ok(points.length>100&&points.length<30000,`${scene}: bounded rendering work`);
      assert.ok(points.every(p=>p.every(Number.isFinite)),`${scene}: finite coordinates`);
      assert.ok(points.every(p=>p[2]>=0&&p[2]<7&&p[3]>=0&&p[3]<14),`${scene}: palette and glyph range`);
      return JSON.stringify(points.slice(0,200));
    };
    const idle=capture(10,{bass:0,mid:0,treble:0});
    signatures.add(idle);
    assert.notEqual(capture(11,{bass:0,mid:0,treble:0}),idle,`${scene}: idle motion`);
    assert.notEqual(capture(10,{bass:.8,mid:.7,treble:.6}),idle,`${scene}: audio response`);
    capture(100000,{bass:1,mid:1,treble:1});
  }
  assert.equal(signatures.size,names.length);
  assert.equal(names.length,5);
});
