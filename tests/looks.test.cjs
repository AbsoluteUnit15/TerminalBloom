const {test}=require('node:test');
const assert=require('node:assert/strict');
test('all alphabets have fourteen distinct glyphs and all palettes have seven valid colours',()=>{
  const {alphabets,palettes,recommended}=require('../looks.js');
  for(const pack of Object.values(alphabets)){
    assert.equal(Array.from(pack.glyphs).length,14);
    assert.equal(new Set(Array.from(pack.glyphs)).size,14);
    assert.ok(pack.width>=.6&&pack.width<=1);
  }
  for(const palette of Object.values(palettes)){
    assert.equal(palette.colors.length,7);
    assert.ok(palette.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)));
  }
  for(const scene of ['bloom',...require('../scenes.js').names]){
    assert.ok(recommended[scene],scene+' has a curated look');
    assert.ok(palettes[recommended[scene][0]]);
    assert.ok(alphabets[recommended[scene][1]]);
  }
});
