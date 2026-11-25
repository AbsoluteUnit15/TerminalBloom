(function(root){
  'use strict';
  class BassPulse {
    constructor(){this.baseline=0;this.cooldown=0;this.age=10;this.amount=0;}
    update(bass,dt,enabled=true){
      this.age=Math.min(10,this.age+dt);this.cooldown=Math.max(0,this.cooldown-dt);
      const hit=enabled&&bass>.55&&bass>this.baseline+.16&&this.cooldown===0;
      this.baseline+=(bass-this.baseline)*(1-Math.exp(-dt*2));
      if(hit){this.age=0;this.cooldown=1.4;}
      this.amount=enabled?Math.exp(-this.age*3.1):0;
      if(this.amount<.001)this.amount=0;
      return hit;
    }
  }
  const vertex=`attribute vec2 a_position;varying vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
  const fragment=`precision mediump float;
    varying vec2 v_uv;uniform sampler2D u_image;
    uniform vec2 u_size;uniform float u_glass,u_scan,u_pulse,u_age;
    vec3 image(vec2 uv){
      if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)return vec3(0.);
      return texture2D(u_image,uv).rgb;
    }
    void main(){
      vec2 p=v_uv*2.-1.;
      // Inverse barrel mapping bows the entire glyph field and scanlines.
      vec2 q=p*(1.+u_glass*.045*p.yx*p.yx);
      float wave=sin(u_age*22.);
      q+=u_pulse*.042*wave*vec2(sin(p.y*8.+u_age*11.),sin(p.x*6.-u_age*9.));
      vec2 uv=q*.5+.5;
      float split=u_glass*.0007+u_pulse*.011;
      vec2 fringe=vec2(split*(.35+abs(p.x)),split*wave*.3);
      vec3 color=vec3(image(uv+fringe).r,image(uv).g,image(uv-fringe).b);
      // Magnetic colour-purity interference: broad rainbow lobes and finer
      // travelling iridescent bands linger briefly after the geometric wobble.
      vec2 magnet=vec2(.46*cos(u_age*1.3),.32*sin(u_age*1.1));
      vec2 field=p-magnet;
      float radius=length(field);
      float phase=radius*2.2+sin(field.y*3.+u_age*2.)*.24-u_age*1.7;
      vec3 rainbow=.5+.5*cos(6.2831853*(phase+vec3(0.,.3333,.6667)));
      float bands=.5+.5*sin(radius*17.-u_age*9.+field.x*3.);
      float shimmer=sqrt(max(0.,u_pulse))*exp(-radius*.65);
      float light=max(color.r,max(color.g,color.b));
      color=mix(color,rainbow*light*1.65,clamp(shimmer*(.55+bands*.35),0.,.9));
      color+=rainbow*shimmer*(.025+.045*bands);
      // Four CSS-pixel rows, with a narrow phosphor crest and deep dark gap.
      float scan=.5+.5*cos(uv.y*u_size.y*1.5707963);
      color*=1.-u_scan*.62*pow(scan,3.);
      float mask=.96+.04*cos(gl_FragCoord.x*2.0943951);
      color*=mix(1.,mask,u_glass);
      float vignette=1.-u_glass*.38*smoothstep(.3,1.5,dot(p,p));
      color*=vignette;
      // Restrained phosphor halo from immediate neighbours; retains crisp glyphs.
      vec2 px=1./u_size;
      color+=u_glass*.075*(image(uv+vec2(px.x,0.))+image(uv-vec2(px.x,0.)));
      // Glass sheen stays subtle and does not produce a full-screen flash.
      float sheen=u_glass*.012*pow(max(0.,1.-length((p-vec2(-.5,.75))*vec2(.65,1.5))),4.);
      color+=vec3(.65,.85,1.)*sheen;
      if(abs(q.x)>1.||abs(q.y)>1.)color=vec3(0.);
      gl_FragColor=vec4(color,1.);
    }`;
  class Renderer {
    constructor(output,source){
      this.available=false;this.output=output;this.source=source;
      try{
        const gl=output.getContext('webgl',{alpha:false,antialias:false,depth:false,preserveDrawingBuffer:false});
        if(!gl?.createShader)return;
        this.gl=gl;
        const compile=(kind,text)=>{const shader=gl.createShader(kind);gl.shaderSource(shader,text);gl.compileShader(shader);
          if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
        const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);this.program=program;
        const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
        const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        this.uniforms={};for(const name of ['size','glass','scan','pulse','age'])this.uniforms[name]=gl.getUniformLocation(program,'u_'+name);
        this.available=true;
        output.addEventListener('webglcontextlost',event=>{event.preventDefault();this.available=false;output.parentElement.classList.remove('shader-on');});
        output.addEventListener('webglcontextrestored',()=>{const next=new Renderer(output,source);Object.assign(this,next);if(this.available)output.parentElement.classList.add('shader-on');});
      }catch(error){this.error=error.message;}
    }
    render({width,height,glass,scan,pulse,age}){
      if(!this.available)return;
      const gl=this.gl,s=this.source,o=this.output;
      if(o.width!==s.width||o.height!==s.height){o.width=s.width;o.height=s.height;}
      gl.viewport(0,0,o.width,o.height);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,s);
      const u=this.uniforms;gl.uniform2f(u.size,width,height);gl.uniform1f(u.glass,glass?1:0);gl.uniform1f(u.scan,scan);gl.uniform1f(u.pulse,pulse);gl.uniform1f(u.age,age);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
  }
  const api={BassPulse,Renderer};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TerminalCRT=api;
})(globalThis);
