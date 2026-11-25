(function(root){
  'use strict';
  const names=['tunnel','terrain','rain','ribbons','swarm','tron','stars','city','radar','mandala','plasma','scope','circuit'];
  const TAU=Math.PI*2;
  function render(name,{width:w,height:h,t,energy:{bass:b,mid:m,treble:tr},density,plot}){
    const detail=density==='low'?.7:density==='high'?1.25:1;
    const size=Math.min(w,h);
    const stroke=(x1,y1,x2,y2,color,glyph=0)=>{
      const n=Math.min(650,Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/7*detail)));
      for(let i=0;i<=n;i++)plot(x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,color,glyph);
    };
    if(name==='tron'){
      const horizon=h*.40;
      // Stable perspective grid, flowing toward the viewer like a light-cycle arena.
      for(let lane=-12;lane<=12;lane++)stroke(w*.5+lane*w*.018,horizon,w*.5+lane*w*.14,h,Math.abs(lane)%3,1);
      for(let i=0;i<22;i++){
        const z=((i/22+t*.075)%1+1)%1,y=horizon+z*z*h*.61;
        stroke(0,y,w,y,i%4===0?3:0,i%4===0?1:0);
      }
      const radius=size*(.16+b*.035),cy=h*.29;
      for(let ring=0;ring<3;ring++)for(let i=0;i<300*detail;i++){
        const a=i/(300*detail)*TAU,r=radius*(1+ring*.06);
        plot(w*.5+Math.cos(a)*r,cy+Math.sin(a)*r,ring===1?3:0,ring===1?3:0);
      }
      for(let trail=0;trail<4;trail++){
        const x=w*(.12+trail*.24)+Math.sin(t*.35+trail)*w*.045;
        const y=h*(.58+trail%2*.18);
        stroke(x,y,x+w*(.08+m*.06),y,trail%2?3:0,3);
        stroke(x,y,x,y+size*(.04+tr*.05),trail%2?3:0,1);
      }
    }else if(name==='stars'){
      for(let i=0;i<1100*detail;i++){
        const z=((i*.6180339-t*.055)%1+1)%1;
        const a=i*2.399963+t*.025,r=(.025+z*z)*size*.9;
        const x=w*.5+Math.cos(a)*r*w/h,y=h*.5+Math.sin(a)*r;
        const tail=1+z*(.03+b*.14);
        stroke(x,y,w*.5+(x-w*.5)*tail,h*.5+(y-h*.5)*tail,i%7,(i+Math.floor(t*(1+tr*3)))%14);
      }
    }else if(name==='city'){
      // Layered skyline, window glyphs and an orbital neon sun.
      for(let layer=0;layer<3;layer++)for(let tower=0;tower<20;tower++){
        const bw=w/22,x=tower*w/19+(layer-1)*bw*.24;
        const top=h*(.67-layer*.08)-((tower*37+layer*23)%83)/100*h*.34-b*size*.045;
        const floor=h*(.89-layer*.04);
        stroke(x,top,x,floor,(tower+layer)%7,12);stroke(x,top,x+bw*.7,top,(tower+layer+1)%7,11);
        for(let wy=top+14;wy<floor;wy+=16)for(let wx=x+8;wx<x+bw*.65;wx+=12){
          const lit=Math.sin(wx*.13+wy*.17+Math.floor(t*(.4+tr*3)))>-.25;
          if(lit)plot(wx,wy,(tower+Math.floor(wy/32)+layer)%7,(tower+Math.floor(t*.3)+layer)%14);
        }
      }
      for(let i=0;i<600*detail;i++){
        const a=i/(600*detail)*TAU;
        plot(w*.72+Math.cos(a)*size*(.13+m*.025),h*.21+Math.sin(a)*size*.13,2,0);
      }
      for(let i=0;i<120;i++)plot((i*53+t*15)%w,h*.91+Math.sin(i*.7+t)*size*.025,3+i%3,11);
    }else if(name==='radar'){
      const cx=w*.5,cy=h*.5,R=size*.42,sweep=t*.65;
      for(let ring=1;ring<=6;ring++)for(let i=0;i<300*detail;i++){
        const a=i/(300*detail)*TAU;
        plot(cx+Math.cos(a)*R*ring/6,cy+Math.sin(a)*R*ring/6,ring%3,0);
      }
      stroke(cx-R,cy,cx+R,cy,1,11);stroke(cx,cy-R,cx,cy+R,1,12);
      for(let ray=0;ray<15;ray++){
        const a=sweep-ray*.018;
        stroke(cx,cy,cx+Math.cos(a)*R,cy+Math.sin(a)*R,ray<3?6:ray<8?0:1,ray<3?1:0);
      }
      for(let i=0;i<36;i++){
        const a=i*2.39996+Math.sin(t*.1+i)*.08,r=R*(.15+(i*17%80)/100)*(1+b*.07);
        const distance=((sweep-a)%TAU+TAU)%TAU;
        if(distance<1.5+m)for(let j=0;j<8;j++)plot(cx+Math.cos(a)*r+Math.cos(j*TAU/8)*(3+tr*7),cy+Math.sin(a)*r+Math.sin(j*TAU/8)*(3+tr*7),distance<.3?6:4,i%14);
      }
    }else if(name==='mandala'){
      const petals=12;
      for(let ring=0;ring<10;ring++)for(let i=0;i<600*detail;i++){
        const a=i/(600*detail)*TAU+t*(ring%2?.035:-.04);
        const r=size*(.06+ring*.036)*(1+.15*Math.cos(a*petals+t*.3)+b*.1);
        plot(w*.5+Math.cos(a)*r,h*.5+Math.sin(a)*r,(ring+Math.floor(i/70))%7,(ring+Math.floor(i/35+t*(.5+tr*2)))%14);
        if(i%8===0)plot(w*.5+Math.cos(a)*r*(.95+m*.05),h*.5+Math.sin(a)*r*(.95+m*.05),6,4);
      }
    }else if(name==='plasma'){
      const step=density==='low'?20:density==='high'?11:15;
      for(let y=30;y<h-30;y+=step)for(let x=16;x<w-16;x+=step){
        const nx=x/size,ny=y/size;
        const f=Math.sin(nx*11+t*.5)+Math.sin(ny*9-t*.37)+Math.sin((nx+ny)*7+t*.23)+Math.sin(Math.hypot(nx-w/size*.5,ny-.5)*15-t*.6);
        const contour=Math.abs(Math.sin(f*2+b*1.8));
        if(contour>.7-m*.15)plot(x+Math.sin(ny*6+t)*b*6,y,(Math.floor((f+4)*1.3)+Math.floor(t*.1))%7,Math.floor((f+4)*1.6+tr*3)%14);
      }
    }else if(name==='scope'){
      for(let x=0;x<w;x+=32)for(let y=30;y<h-30;y+=32)plot(x,y,1,0);
      for(let channel=0;channel<4;channel++)for(let i=0;i<1800*detail;i++){
        const f=i/(1800*detail),a=f*TAU;
        const amplitude=size*(.15+b*.17);
        if(channel<2){
          const y=h*(channel===0?.33:.68)+Math.sin(a*(3+channel*2)+t)*amplitude*.42+Math.sin(a*19-t*.7)*tr*size*.05;
          plot(w*.04+f*w*.92,y,channel?4:0,1);
        }else{
          const r=amplitude*(channel===2?.8:1),phase=t*.2+channel;
          plot(w*.5+Math.sin(a*3+phase)*r*(1+m*.3),h*.5+Math.sin(a*4-phase)*r,channel===2?2:6,0);
        }
      }
    }else if(name==='circuit'){
      for(let row=0;row<8;row++)for(let col=0;col<12;col++){
        const x=(col+.5)*w/12,y=(row+.5)*h/8,c=(row+col)%7;
        const dx=w/12*.7,dy=h/8*.35;
        stroke(x,y,x+dx*.55,y,c,11);stroke(x+dx*.55,y,x+dx*.55,y+dy,c,12);stroke(x+dx*.55,y+dy,x+dx,y+dy,c,11);
        const pulse=((t*(.3+tr*.4)+row*.13+col*.17)%1+1)%1;
        plot(x+dx*pulse,y+Math.sin(pulse*TAU)*dy*m,6,(col+row+Math.floor(t))%14);
        const radius=3+b*7;
        for(let i=0;i<10;i++)plot(x+Math.cos(i*TAU/10)*radius,y+Math.sin(i*TAU/10)*radius,c,4);
      }
    }
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
