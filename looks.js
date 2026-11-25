(function(root){
  'use strict';
  const palettes={
    spectrum:{label:'Terminal spectrum',colors:['#24e6fa','#fa43cf','#ffe45d','#ff9440','#acfa45','#5485ff','#eefaff']},
    tron:{label:'Tron cyan / orange',colors:['#20eaff','#1c9aff','#78f6ff','#ff932f','#ffce66','#5874ff','#e4ffff']},
    green:{label:'Green phosphor',colors:['#3aff84','#1cc95d','#9dffac','#59ed48','#c9ff8e','#259d70','#efffe9']},
    amber:{label:'Amber terminal',colors:['#ffad29','#e87c16','#ffda70','#ff7040','#eac340','#b9652c','#fff0ba']},
    sakura:{label:'Sakura neon',colors:['#ffa0d8','#ff50a3','#ffc7ee','#aa87ff','#77e5ed','#8455dc','#fff0fa']},
    ice:{label:'Arctic blue',colors:['#61eaff','#579dff','#b1faff','#83c6ff','#99a0ff','#3376cf','#f0ffff']},
    fire:{label:'Solar flare',colors:['#ffb334','#ff4e35','#ffe46c','#ff772b','#f973ad','#bc415f','#fff3ce']},
    violet:{label:'Ultraviolet',colors:['#bf75ff','#7955ff','#ef6fff','#638cff','#f2afff','#aa42b9','#f4edff']}
  };
  const alphabets={
    symbols:{label:'ASCII / geometric',glyphs:'·+×*◇:≋░○/\\─│•',width:.65,font:'Consolas, "Liberation Mono", monospace'},
    japanese:{label:'Japanese · katakana',glyphs:'アイウエオカキクケコサシスセ',width:.95,font:'"MS Gothic", "Yu Gothic", "Noto Sans Mono CJK JP", monospace'},
    korean:{label:'Korean · Hangul jamo',glyphs:'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',width:.95,font:'"Malgun Gothic", "GulimChe", "Noto Sans Mono CJK KR", monospace'},
    cyrillic:{label:'Cyrillic',glyphs:'ЖДФЛЯБЦШЩЮЭЧЫЙ',width:.7,font:'Consolas, "Liberation Mono", monospace'},
    binary:{label:'Binary / machine code',glyphs:'01ABCDEF<>[]{}',width:.65,font:'"Lucida Console", Consolas, monospace'}
  };
  const recommended={bloom:['spectrum','symbols'],tunnel:['ice','symbols'],terrain:['sakura','symbols'],rain:['green','japanese'],ribbons:['violet','symbols'],swarm:['spectrum','symbols'],tron:['tron','symbols'],stars:['ice','cyrillic'],city:['sakura','korean'],radar:['green','symbols'],mandala:['amber','japanese'],plasma:['violet','korean'],scope:['green','symbols'],circuit:['amber','binary']};
  const api={palettes,alphabets,recommended};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TerminalLooks=api;
})(globalThis);
