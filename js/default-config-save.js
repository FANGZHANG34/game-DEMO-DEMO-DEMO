if(!localStorage.getItem('configArray')){
    localStorage.setItem('configArray',LZString.compress(JSON.stringify({
        globalArray:{
            globalVolume:.25,bgm:.25,bgs:.25,dialogue:.25,
            textSep: 100,modeHard:0
        }
    })));
}
if(!localStorage.getItem('saveDataArray')){
    const temp = [{
        mapID: '001',id: 0,xyz: [16,9,0],partner: [],switch: [],record: {},
        memory: {itemList: {onceArray: {},twiceArray: {},onfitArray: {}},characterArray: {},mapDataArray: {}}
    }];
    for(var i = 1; i < 21;){temp[i++] = 0;}
    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(temp)));
}