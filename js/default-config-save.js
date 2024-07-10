'use strict';
localStorage.getItem('configArray') || localStorage.setItem('configArray',LZString.compress(JSON.stringify({
    globalArray: {
        globalVolume: .25,bgm: .5,bgs: .25,dialogue: .75,
        textSep: 50,worldSpeed: 30,modeHard: 0
    }
})));
if(!localStorage.getItem('saveDataArray')){
    const temp = [0];
    for(var i = 1; i < 21;){temp[i++] = 0;}
    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(temp)));
}