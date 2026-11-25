(function(root){
  'use strict';
  const names=['tunnel','terrain','rain','ribbons','swarm'];
  const TAU=Math.PI*2;
  function render(name,{width:w,height:h,t,energy:{bass:b,mid:m,treble:tr},density,plot}){
    const detail=density==='low'?.7:density==='high'?1.25:1;
    const size=Math.min(w,h);
    if(name==='tunnel'){
      // Perspective rings rush toward the viewer around a gently wandering vanishing point.
      const cx=w*(.5+.055*Math.sin(t*.17)),cy=h*(.48+.06*Math.cos(t*.13));
      for(let ring=0;ring<38;ring++){
        const z=((ring/38+t*.075)%1+1)%1;
        const r=size*.045/(1.06-z)*(1+b*.18),twist=t*.14+z*.8+m*.3;
        for(let i=0;i<160*detail;i++){
          const a=i/(160*detail)*TAU+twist;
          const polygon=1/(.9+.1*Math.cos(a*8));
          plot(cx+Math.cos(a)*r*polygon,cy+Math.sin(a)*r*.72*polygon,(ring+Math.floor(i/25))%7,i%8===0?4:0);
        }
      }
    }else if(name==='terrain'){
      // Height-field samples use a stable camera and moving mathematical terrain.
      for(let row=0;row<55*detail;row++){
        const z=row/(55*detail),perspective=.14+z*z;
        for(let col=0;col<150*detail;col++){
          const x=col/(150*detail)*2-1;
          const wave=Math.sin(x*8+z*12-t*.7)*Math.cos(z*9-t*.4+x*3);
          const peaks=Math.sin(x*17-z*7+t*.5)*(m*.4+.12);
          const y=h*.29+z*z*h*.65-(wave+peaks)*size*.09*perspective*(1+b*2);
          plot(w*.5+x*w*.58*perspective,y,(row+Math.floor(col/20))%7,col%5===0?1:tr>.5?2:0);
        }
      }
    }else if(name==='rain'){
      const spacing=density==='low'?20:density==='high'?10:14;
      for(let col=0;col<w/spacing;col++){
        const velocity=18+(col*17%63);
        const head=((col*131+t*velocity)%(h+260))-100;
        const length=10+(col*7%20)+Math.floor(b*12);
        for(let j=0;j<length;j++){
          const y=(head-j*13+h+260)%(h+260)-100;
          plot(col*spacing+Math.sin(t*.4+col)*m*12,y,j===0?6:(col+Math.floor(j/8))%6,(col*7+j+Math.floor(t*(2+tr*7)))%14);
        }
      }
    }else if(name==='ribbons'){
      for(let ribbon=0;ribbon<12;ribbon++){
        const phase=ribbon*TAU/12+t*.12;
        for(let i=0;i<650*detail;i++){
          const a=i/(650*detail)*TAU;
          const x=Math.sin(a*3+t*.14+phase)*w*.38;
          const y=Math.sin(a*4-t*.19+phase*.6)*h*.32;
          const offset=Math.sin(a*11+t+phase)*size*(.018+tr*.025);
          plot(w*.5+x*(1+b*.12),h*.5+y*(.85+m*.2)+offset,(ribbon+Math.floor(a*1.3))%7,ribbon%3===0?3:0);
        }
      }
    }else if(name==='swarm'){
      for(let arm=0;arm<7;arm++)for(let i=0;i<700*detail;i++){
        const fraction=i/(700*detail),r=Math.sqrt(fraction)*size*.44*(1+b*.15);
        const a=arm*TAU/7+fraction*8+t*.18+Math.sin(fraction*14-t*.3)*(.2+m*.4);
        const tilt=t*.08;
        const x=r*Math.cos(a),y=r*Math.sin(a)*(.65+.15*Math.sin(t*.1));
        plot(w*.5+x*Math.cos(tilt)-y*Math.sin(tilt),h*.5+x*Math.sin(tilt)+y*Math.cos(tilt),(arm+Math.floor(fraction*5))%7,(i+Math.floor(t*(1+tr*5)))%17===0?4:0);
      }
    }
  }
  const api={render,names};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TerminalScenes=api;
})(globalThis);
