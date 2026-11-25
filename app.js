/* Terminal Bloom — dependency-free, local-only audio processing. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas=$('art'), ctx=canvas.getContext('2d',{alpha:false}), audio=$('audio');
  const {bands,cube,edges}=TerminalMath;
  const {palettes,alphabets,recommended}=TerminalLooks;
  let palette=palettes.spectrum.colors,glyphs=Array.from(alphabets.symbols.glyphs),alphabet='symbols',fontStyle='native';
  let width=0,height=0,cols=0,rows=0,cellW=8,cellH=12,grid=new Uint8Array(0),colors=new Uint8Array(0);
  let atlas,atlasCols=glyphs.length;
  let clock=0,last=performance.now(),frames=0,fps=60,fpsClock=0,frozen=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mode='idle',context,analyser,fileSource,micSource,stream,objectURL,operation=0;
  let browserSource,sharedStream,scene='bloom',sceneTime=0,cubeTime=0;
  let fft,energy={bass:0,mid:0,treble:0},alive=true;
  let density='medium',speed=Number($('motion').value),gain=Number($('sensitivity').value);
  let crt=true,hud=true;
  const setStatus = message => {$('status').textContent=message;};
  const crtRenderer=new TerminalCRT.Renderer($('crtOutput'),canvas),bassPulse=new TerminalCRT.BassPulse();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let glass=true,scanIntensity=Number($('scanIntensity').value),degauss=!reducedMotion,degaussStrength=Number($('degaussStrength').value);
  $('degauss').checked=degauss;
  if(crtRenderer.available)$('stage').classList.add('shader-on');
  else{$('degauss').disabled=true;$('degauss').checked=false;$('degauss').title='Degauss needs WebGL. Enable browser hardware acceleration, then reload.';degauss=false;}

  function resize() {
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;
    cellH=density==='high'?10:density==='low'?16:12;cellW=cellH*alphabets[alphabet].width;
    cols=Math.ceil(width/cellW);rows=Math.ceil(height/cellH);
    grid=new Uint8Array(cols*rows);colors=new Uint8Array(cols*rows);
    atlas=document.createElement('canvas');
    const aw=Math.ceil(cellW*dpr),ah=Math.ceil(cellH*dpr);
    atlas.width=aw*atlasCols;atlas.height=ah*palette.length;
    const font=fontStyle==='classic'?'"Lucida Console", '+alphabets[alphabet].font:fontStyle==='typewriter'?'"Courier New", '+alphabets[alphabet].font:alphabets[alphabet].font;
    const a=atlas.getContext('2d');a.font=`${Math.round(cellH*.93*dpr)}px ${font}`;a.textAlign='center';a.textBaseline='middle';
    palette.forEach((color,y)=>{a.fillStyle=color;glyphs.forEach((glyph,x)=>a.fillText(glyph,(x+.5)*aw,(y+.5)*ah,aw*.96));});
  }
  new ResizeObserver(resize).observe(canvas);
  function plot(x,y,color,glyph=1) {
    const col=Math.floor(x/cellW),row=Math.floor(y/cellH);
    if(col<2||col>=cols-2||row<3||row>=rows-3)return;
    const i=row*cols+col;grid[i]=glyph+1;colors[i]=color%palette.length;
  }
  function line(x1,y1,x2,y2,color,glyph=1) {
    const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/cellW));
    for(let i=0;i<=n;i++)plot(x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,color,glyph);
  }
  function drawArt(t) {
    grid.fill(0);ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);
    const cx=width*.5,cy=height*.51,R=Math.min(width*.30,height*.40);
    const b=energy.bass,m=energy.mid,tr=energy.treble;
    // Sparse, continuous deterministic glyph constellations.
    for(let i=0;i<150;i++) {
      const x=(i*127.13+Math.sin(t*.13+i)*35+t*(3+i%4))%(width-40)+20;
      const y=(i*79.73+Math.cos(t*.1+i*.7)*30+t*(1+i%3))%(height-60)+30;
      plot(x,y,i%7,(i+Math.floor(t*(.5+tr*5)))%glyphs.length);
    }
    if(scene==='bloom'){
    // A lattice of tilted rings, threaded around the central rose.
    const rings=density==='low'?12:19;
    for(let j=0;j<rings;j++) {
      const tilt=j*Math.PI/rings+t*.065;
      const radius=R*(.87+j*.013)*(1+b*.16);
      const squash=.26+.27*Math.sin(j*.39+t*.12)**2;
      for(let i=0;i<240;i++) {
        const a=i*Math.PI*2/240;
        const x=Math.cos(a)*radius,y=Math.sin(a)*radius*squash;
        plot(cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy+x*Math.sin(tilt)+y*Math.cos(tilt),(j+Math.floor(i/45))%6,(i+j)%3===0?2:0);
      }
    }
    // Two continuous rose/spirograph families; non-integer harmonics morph slowly.
    for(let layer=0;layer<3;layer++) {
      const count=density==='low'?650:1100;
      for(let i=0;i<count;i++) {
        const a=i/count*Math.PI*4, k=3+layer+Math.sin(t*.07)*.6;
        const r=R*(.55+.13*layer)*Math.cos(k*a+t*.18+layer)*(1+m*.24);
        const spin=t*(.08+layer*.025);
        const x=r*Math.cos(a+spin)+Math.cos(a*7-t*.2)*R*.065;
        const y=r*Math.sin(a+spin)+Math.sin(a*7-t*.2)*R*.065;
        plot(cx+x,cy+y,(layer*2+Math.floor(a*1.1+t*.16))%7,layer===1?3:1);
      }
    }
    // Proper 4D hypercube projected to 3D then 2D, rendered entirely in glyphs.
    const points=cube(cubeTime);
    const cubeX=width>650?width*.81:width*.75,cubeY=height*.47,scale=Math.min(width*.115,height*.20)*(1+m*.1);
    edges.forEach(([a,b],i)=>line(cubeX+points[a][0]*scale,cubeY+points[a][1]*scale,cubeX+points[b][0]*scale,cubeY+points[b][1]*scale,i%7,i%2?1:0));
    points.forEach((p,i)=>plot(cubeX+p[0]*scale,cubeY+p[1]*scale,6,4));
    // Small orbiting glyph clusters at the left balance the cube.
    for(let cluster=0;cluster<3;cluster++)for(let i=0;i<110;i++) {
      const a=i*.39+t*(.2+cluster*.08),r=(10+i*.38)*(1+tr*.4);
      const ox=width*.17+Math.sin(t*.09+cluster)*width*.025;
      const oy=height*(.31+cluster*.17);
      plot(ox+Math.cos(a)*r,oy+Math.sin(a)*r*.5,(cluster*2+i%2)%7,i%3===0?6:0);
    }
    }else TerminalScenes.render(scene,{width,height,t,energy,density,plot});
    const aw=atlas.width/atlasCols,ah=atlas.height/palette.length;
    for(let i=0;i<grid.length;i++)if(grid[i]) {
      ctx.drawImage(atlas,(grid[i]-1)*aw,colors[i]*ah,aw,ah,(i%cols)*cellW,Math.floor(i/cols)*cellH,cellW,cellH);
    }
    if(hud){ctx.save();if(glass){ctx.translate(width*.005,height*.005);ctx.scale(.99,.99);}drawHUD(t);ctx.restore();}
    if(crt&&!crtRenderer.available) {
      ctx.fillStyle=`rgba(0,0,0,${scanIntensity*.65})`;for(let y=1;y<height;y+=4)ctx.fillRect(0,y,width,2);
    }
    crtRenderer.render({width,height,glass,scan:crt?scanIntensity:0,pulse:bassPulse.amount*degaussStrength,age:bassPulse.age});
  }
  function drawHUD(t) {
    ctx.font='10px Consolas, monospace';ctx.textBaseline='top';ctx.fillStyle=palette[0];
    ctx.fillText(`TERMINAL BLOOM // ${scene.toUpperCase()}`,16,14);
    ctx.textAlign='right';ctx.fillStyle=palette[4];
    ctx.fillText(`${mode.toUpperCase()} / ${frozen?'FROZEN':String(Math.round(fps)).padStart(2,'0')+' FPS'}`,width-16,14);
    ctx.textAlign='left';ctx.fillStyle=palette[5];
    const hex=Array.from({length:Math.max(0,Math.floor((width-35)/24))},(_,i)=>((Math.floor(t*.5)+i*37+83)&255).toString(16).padStart(2,'0').toUpperCase()).join(' ');
    ctx.fillText(hex,16,height-18);
    const bx=18,by=height-76;
    ['bass','mid','treble'].forEach((name,i)=>{
      ctx.fillStyle=palette[i*2];ctx.fillText(`${name.toUpperCase().padEnd(6)} ${'▮'.repeat(Math.round(energy[name]*14)).padEnd(14,'·')}`,bx,by+i*13);
    });
    if(width>650&&scene==='bloom'){ctx.fillStyle=palette[1];ctx.fillText('4D → 3D → 2D',width*.75,height*.76);}
    ctx.textAlign='right';ctx.fillStyle='#89999f';ctx.fillText('H: CONTROLS / F: FULL SCREEN',width-16,height-36);ctx.textAlign='left';
  }
  function sample(dt) {
    let target={bass:0,mid:0,treble:0};
    if(analyser&&context.state==='running'&&(mode==='mic'||mode==='shared'||(mode==='file'&&!audio.paused))) {
      analyser.getByteFrequencyData(fft);target=bands(fft,context.sampleRate,analyser.fftSize,gain);
    }
    // Baseline geometric motion remains independent of audio, including real silence.
    for(const key of ['bass','mid','treble']) {
      const rate=target[key]>energy[key]?16:4;
      energy[key]+=(target[key]-energy[key])*(1-Math.exp(-dt*rate));
    }
  }
  let lastDraw=0;
  function frame(now) {
    if(!alive)return;
    requestAnimationFrame(frame);
    if(document.hidden){last=now;return;}
    // Cap rendering near 60fps even on high refresh rate displays.
    if(now-lastDraw<15)return;
    const dt=Math.min((now-last)/1000,.06);last=now;lastDraw=now;
    if(!frozen){sample(dt);bassPulse.update(energy.bass,dt,degauss);clock+=dt*speed;cubeTime+=dt*speed*(.65+energy.mid*.45);sceneTime+=dt;
      if($('autoscene').checked&&sceneTime>=30)nextScene();}
    frames++;fpsClock+=dt;if(fpsClock>=.5){fps=frames/fpsClock;frames=0;fpsClock=0;}
    if(atlas)drawArt(clock);
  }
  requestAnimationFrame(frame);

  async function ensureAudio() {
    if(!context) {
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)throw new Error('Web Audio is unavailable. Use a current Chrome, Edge, Firefox or Safari browser.');
      context=new AC();analyser=context.createAnalyser();analyser.fftSize=4096;
      analyser.smoothingTimeConstant=.68;analyser.minDecibels=-90;analyser.maxDecibels=-15;
      fft=new Uint8Array(analyser.frequencyBinCount);
    }
    await context.resume();
  }
  function stopMic() {
    if(micSource){micSource.disconnect();micSource=null;}
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
    $('mic').setAttribute('aria-pressed','false');
    stopBrowser();
  }
  function stopBrowser(){
    if(browserSource){browserSource.disconnect();browserSource=null;}
    if(sharedStream){sharedStream.getTracks().forEach(track=>{track.onended=null;track.stop();});sharedStream=null;}
    $('browserAudio').setAttribute('aria-pressed','false');
    $('browserAudio').textContent='Use PC / tab audio';
  }
  $('browserAudio').onclick=async()=>{
    if(mode==='shared'){goIdle();return;}
    const ticket=++operation;stopMic();audio.pause();disconnectFile();mode='idle';
    let pending;
    try{
      if(!navigator.mediaDevices?.getDisplayMedia)throw new Error('PC / tab audio sharing is unavailable. Open this app on localhost in desktop Chrome or Edge.');
      setStatus('For all PC audio: choose Entire screen and enable Share system audio. For one tab: enable Share tab audio.');
      // Invoke directly from the click: the browser requires transient user activation.
      pending=await navigator.mediaDevices.getDisplayMedia({
        video:{displaySurface:'monitor'},audio:{suppressLocalAudioPlayback:false},
        selfBrowserSurface:'exclude',systemAudio:'include',monitorTypeSurfaces:'include',surfaceSwitching:'include'
      });
      if(ticket!==operation){pending.getTracks().forEach(track=>track.stop());return;}
      if(!pending.getAudioTracks().length)throw new Error('No audio was shared. Choose Entire screen and enable Share system audio, or choose a tab and enable Share tab audio. If the audio option is missing, try desktop Chrome or Edge.');
      await ensureAudio();
      if(ticket!==operation){pending.getTracks().forEach(track=>track.stop());return;}
      sharedStream=pending;
      // The API requires a video track; its frames are never read, displayed or recorded.
      // Keep it alive so the browser sharing controls can stop the whole session.
      browserSource=context.createMediaStreamSource(new MediaStream(pending.getAudioTracks()));
      browserSource.connect(analyser); // No speaker output: the selected source already plays the sound.
      mode='shared';$('browserAudio').setAttribute('aria-pressed','true');$('browserAudio').textContent='Stop shared audio';
      pending.getTracks().forEach(track=>track.onended=()=>{if(mode==='shared'){goIdle();setStatus('Audio sharing ended · Idle animation continues.');}});
      setStatus('Shared audio active · Control playback and volume in the source app. Stop shared audio disconnects capture.');
    }catch(error){
      if(pending)pending.getTracks().forEach(track=>track.stop());
      if(ticket===operation){stopBrowser();mode='idle';setStatus(error.name==='NotAllowedError'?'Audio sharing was cancelled or not allowed. Click Use PC / tab audio to try again.':error.message||'Audio sharing could not start. Try desktop Chrome or Edge.');}
    }
  };
  function disconnectFile() {if(fileSource)fileSource.disconnect();}
  function showError(error) {
    const messages={NotAllowedError:'Microphone permission was denied. Allow microphone access in the browser, then try again.',NotFoundError:'No microphone found. Connect one, or open a local audio file.',NotReadableError:'The microphone is busy or unavailable. Check your input device and try again.',NotSupportedError:'This audio format could not be played. Try MP3, WAV or OGG.'};
    setStatus(messages[error.name]||error.message||'Audio could not start. Try another file or input.');
  }
  $('fileButton').onclick=()=>$('file').click();
  $('localAudioToggle').onclick=()=>{
    const panel=$('localAudioPanel');panel.hidden=!panel.hidden;
    $('localAudioToggle').setAttribute('aria-expanded',String(!panel.hidden));
  };
  $('file').onchange=async()=>{
    const file=$('file').files[0];if(!file)return;
    const ticket=++operation;
    stopMic();audio.pause();disconnectFile();mode='idle';
    if(objectURL)URL.revokeObjectURL(objectURL);
    objectURL=URL.createObjectURL(file);audio.src=objectURL;audio.volume=Number($('volume').value);
    $('track').textContent=file.name;$('track').title=file.name;$('play').disabled=true;$('seek').disabled=true;
    try {
      await ensureAudio();if(ticket!==operation)return;
      if(!fileSource)fileSource=context.createMediaElementSource(audio);
      fileSource.connect(analyser);fileSource.connect(context.destination);mode='file';
      $('play').disabled=false;await audio.play();
      if(ticket!==operation)return;
      setStatus('Local audio active · Bass / mids / treble are driving the field.');
    } catch(error){if(ticket===operation){audio.pause();disconnectFile();mode='idle';showError(error);}}
    $('file').value='';
  };
  $('mic').onclick=async()=>{
    if(mode==='mic'){goIdle();return;}
    const ticket=++operation;stopMic();audio.pause();disconnectFile();mode='idle';
    try {
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone access needs localhost or HTTPS. Start the included server, then open http://localhost:8787.');
      setStatus('Waiting for microphone permission…');
      await ensureAudio();if(ticket!==operation)return;
      const pending=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      if(ticket!==operation){pending.getTracks().forEach(t=>t.stop());return;}
      stream=pending;micSource=context.createMediaStreamSource(stream);micSource.connect(analyser);
      // Microphone deliberately has no path to speakers: no monitoring feedback.
      mode='mic';$('mic').setAttribute('aria-pressed','true');
      stream.getAudioTracks().forEach(track=>track.onended=()=>{if(mode==='mic'){goIdle();setStatus('Microphone disconnected · Idle animation continues.');}});
      setStatus('Microphone active · Input is analysed locally and is not played through speakers.');
    } catch(error){if(ticket===operation){stopMic();mode='idle';showError(error);}}
  };
  function goIdle(){operation++;stopMic();audio.pause();disconnectFile();mode='idle';setStatus('Idle animation · Audio input disconnected.');}
  $('idle').onclick=goIdle;
  $('play').onclick=async()=>{
    if(mode==='file'&&!audio.paused){audio.pause();return;}
    if(!audio.src)return;
    const ticket=++operation;stopMic();disconnectFile();
    try {await ensureAudio();if(ticket!==operation)return;fileSource.connect(analyser);fileSource.connect(context.destination);mode='file';await audio.play();if(ticket===operation)setStatus('Local audio active · Bass / mids / treble are driving the field.');}
    catch(error){if(ticket===operation){mode='idle';disconnectFile();showError(error);}}
  };
  audio.onplay=()=>{$('play').textContent='Pause';};
  audio.onpause=()=>{$('play').textContent='Play';if(mode==='file')setStatus('Audio paused · Idle motion continues.');};
  audio.onended=()=>{if(mode==='file')setStatus('Track ended · Play again, enable Loop, or open another file.');};
  audio.onerror=()=>{if(mode==='file'){audio.pause();disconnectFile();mode='idle';showError({name:'NotSupportedError'});}};
  const format=seconds=>Number.isFinite(seconds)?`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`:'0:00';
  function updateTransport(){
    const finite=Number.isFinite(audio.duration)&&audio.duration>0;
    $('seek').disabled=!finite;$('seek').value=finite?Math.round(audio.currentTime/audio.duration*1000):0;
    $('time').textContent=`${format(audio.currentTime)} / ${format(audio.duration)}`;
  }
  audio.ontimeupdate=updateTransport;audio.onloadedmetadata=updateTransport;
  $('seek').oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number($('seek').value)/1000*audio.duration;};
  $('volume').oninput=()=>{audio.volume=Number($('volume').value);};
  $('loop').onchange=()=>{audio.loop=$('loop').checked;};
  $('sensitivity').oninput=()=>{gain=Number($('sensitivity').value);};
  $('motion').oninput=()=>{speed=Number($('motion').value);};
  $('density').onchange=()=>{density=$('density').value;resize();};
  const sceneNames=['bloom',...TerminalScenes.names];
  function applyLook(paletteName,alphabetName){
    palette=palettes[paletteName].colors;alphabet=alphabetName;glyphs=Array.from(alphabets[alphabet].glyphs);
    $('palette').value=paletteName;$('alphabet').value=alphabetName;resize();
  }
  function selectScene(value){
    scene=value;sceneTime=0;$('scene').value=value;
    canvas.setAttribute('aria-label',`Animated retro terminal art: ${value}, reacting to bass, mids and treble.`);
    if($('sceneLook').checked)applyLook(...recommended[value]);
  }
  function nextScene(){selectScene(sceneNames[(sceneNames.indexOf(scene)+1)%sceneNames.length]);}
  $('scene').onchange=()=>selectScene($('scene').value);
  $('nextScene').onclick=nextScene;
  $('autoscene').onchange=()=>{sceneTime=0;};
  $('sceneLook').onchange=()=>{if($('sceneLook').checked)applyLook(...recommended[scene]);};
  $('palette').onchange=()=>{$('sceneLook').checked=false;applyLook($('palette').value,alphabet);};
  $('alphabet').onchange=()=>{$('sceneLook').checked=false;applyLook($('palette').value,$('alphabet').value);};
  $('fontStyle').onchange=()=>{fontStyle=$('fontStyle').value;resize();};
  $('shuffleLook').onclick=()=>{
    const colors=Object.keys(palettes),scripts=Object.keys(alphabets);$('sceneLook').checked=false;
    applyLook(colors[Math.floor(Math.random()*colors.length)],scripts[Math.floor(Math.random()*scripts.length)]);
  };
  if(document.fonts?.ready)document.fonts.ready.then(resize);
  $('crt').onchange=()=>{crt=$('crt').checked;};$('hud').onchange=()=>{hud=$('hud').checked;};
  $('scanIntensity').oninput=()=>{scanIntensity=Number($('scanIntensity').value);};
  $('glass').onchange=()=>{glass=$('glass').checked;$('stage').classList.toggle('crt-glass',glass);};
  $('degauss').onchange=()=>{degauss=$('degauss').checked&&crtRenderer.available;if(!degauss)bassPulse.amount=0;};
  $('degaussStrength').oninput=()=>{degaussStrength=Number($('degaussStrength').value);};
  $('testDegauss').disabled=!crtRenderer.available;
  $('testDegauss').onclick=()=>{if(crtRenderer.available){degauss=true;$('degauss').checked=true;bassPulse.age=0;bassPulse.amount=1;bassPulse.cooldown=1.4;}};
  function syncFreeze(){ $('freeze').textContent=frozen?'Resume art':'Freeze art';$('freeze').setAttribute('aria-pressed',String(frozen)); }
  function toggleFreeze(){frozen=!frozen;syncFreeze();}syncFreeze();
  if(frozen)setStatus('Reduced motion preference detected · Art is frozen. Choose Resume art to animate.');
  $('freeze').onclick=toggleFreeze;
  function toggleControls(){
    document.body.classList.toggle('controls-hidden');
    if(document.body.classList.contains('controls-hidden'))document.activeElement?.blur();
    else $('hide').focus();
  }
  $('hide').onclick=toggleControls;
  async function fullScreen(){
    try {if(document.fullscreenElement)await document.exitFullscreen();else if($('stage').requestFullscreen)await $('stage').requestFullscreen();else setStatus('Browser full screen is unavailable here. Open this app in a Chrome or Edge tab, then press F.');}
    catch(error){setStatus('Browser full screen could not start. Open this app in a Chrome or Edge tab and use Full screen. '+(error.message||''));}
  }
  $('fullscreen').onclick=fullScreen;
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
    const target=event.target;
    if(target.isContentEditable||['SELECT','TEXTAREA'].includes(target.tagName)||
      (target.tagName==='INPUT'&&!['range','checkbox','button'].includes(target.type)))return;
    const key=event.key.toLowerCase();
    if(key==='h'){event.preventDefault();toggleControls();}
    else if(key==='f'){event.preventDefault();fullScreen();}
    else if(event.code==='Space'&&!['BUTTON','INPUT'].includes(target.tagName)){event.preventDefault();toggleFreeze();}
    else if(event.key==='Escape'&&!document.fullscreenElement)document.body.classList.remove('controls-hidden');
  });
  window.addEventListener('pagehide',()=>{operation++;stopMic();audio.pause();disconnectFile();mode='idle';});
  window.addEventListener('beforeunload',()=>{if(objectURL)URL.revokeObjectURL(objectURL);});
})();
