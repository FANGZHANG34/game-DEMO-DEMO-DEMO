if(!localStorage.getItem('configArray')){
    localStorage.setItem('configArray',LZString.compress(JSON.stringify({
        globalArray:{
            globalVolume:0.2,bgm:1,bgs:1,dialogueVolume:1,
            textSep: 100,modeHard:0
        }
    })));
}
if(!localStorage.getItem('saveDataArray')){
    let temp = [{mapID:"001",id:0,xyz:[16,9,0],partner:{},switch:[],memory:{characterArray:{},itemList:{},maprDateArray:{}}}];
    for(let i = 1; i < 21;i++){temp[i] = 0;}
    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(temp)));
}