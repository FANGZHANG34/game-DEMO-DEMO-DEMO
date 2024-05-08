// function scrollTo(c,e,d=t=>(--t)**3+1){
//     var a=document.documentElement;
//     if(0===a.scrollTop){var b=a.scrollTop;
//     ++a.scrollTop;a=b+1===a.scrollTop--?a:document.body}
//     b=a.scrollTop;0>=e||("object"===typeof b&&(b=b.offsetTop),
//     "object"===typeof c&&(c=c.offsetTop),function(a,b,c,f,d,e,h){
//     function g(){0>f||1<f||0>=d?a.scrollTop=c:(a.scrollTop=b-(b-c)*h(f),
//     f+=d*e,setTimeout(g,e))}g()}(a,b,c,0,1/e,20,d))
// }
// strN 数字转规范字符串
function strN(N,longN){
    if(longN <= String(N).length){
        return String(N);
    }else{return strN('0'+N, longN);}
}
// clearMedia 清空媒体内容
function clearMedia(mediaElement){
    mediaElement.pause();
    mediaElement.removeAttribute('src');
    mediaElement.load();
}
// copyObj 深复制对象
function copyObj(obj = {}){
    let newobj = null;
    if(obj instanceof Object && obj !== null){
        newobj = obj instanceof Array ? [] : {};
        for (var i in obj) {newobj[i] = copyObj(obj[i]);}
    }else{newobj = obj;}
    return newobj;
}
// messageImageConat 图片整合显示
function messageImageConat(imgUrlArray){
    const cartoonManager = window.gameManager.gameMessage.content;
    let temp;
    if(temp = imgUrlArray.shift()){
        cartoonManager.loader('','',temp);
        cartoonManager.image.autoReset = false;
        for(temp of imgUrlArray){cartoonManager.loader('','',temp);}
        new Promise(()=>{cartoonManager.image.autoReset = true;});
    }
}
// loadCartoon 动画显示
function loadCartoon(params = {head: 'w99_',tail: '.png',minN: 1,maxN: 79,longN: 2,bgmUrl: './audio/FM18.ogg'}){
    let tempPaused = window.gameManager.playerMove.paused;
    window.gameManager.playerMove.paused = true;
    const cartoonManager = window.gameManager.gameMessage.content;
    cartoonManager.loader('',params.bgmUrl);
    [cartoonManager.image.stage.width,cartoonManager.image.stage.height] = [1280,720];
    let N = params.minN;
    const tempFn = ()=>{
        cartoonManager.loader('','','./img/'+params.head+strN(N++,params.longN)+params.tail);
        return N > params.maxN ? ()=>{
            tempPaused ? window.gameManager.gameMessage.self.classList.remove('disappear') : window.gameManager.playerMove.paused = false;
            [cartoonManager.image.stage.width,cartoonManager.image.stage.height] = [1920,1080];
        } : tempFn;
    }
    window.gameManager.tempProcess.nowFn = tempFn;
}
// makeElement 定制元素
function makeElement(tagName, config){
    // e.g.
    // makeElement('div', {'className':'normal','textContent':'helloworld'});
    const theElement = document.createElement(tagName);
    for(let i in config){theElement[i]=config[i];}
    return theElement;
}
// getRandomZoneUT 获取随机UT位置
function getRandomZoneUT(){
    return (50 * Math.random()).toFixed(1);
}
// getRandomDiractionUT 获取随机UT方向
function getRandomDiractionUT(){
    let temp = String(Math.random()).slice(2,4);
    return [temp.charAt(0) > 4 ? 'Left' : 'Top',temp.charAt(1) > 4 ? '+' : '-'];
}
// memoryHandle 记忆信息操作
function memoryHandle(
    pathString = 'characterArray.0.name',mode = 'r',value_fn = (parentObject,key2)=>parentObject[key2],
    thisMemory = window.gameManager.constTemp.memory
){
    // thisMemory do mode at pathString some time with value_fn.
    // 'pathString' example:
    // 'characterArray.0.name' => thisMemory['characterArray']['0']?.['name'] || objectArray['characterArray'].get(0)['name']
    // 'mapDataArray.001.0' => thisMemory['mapDataArray']['001']?.['0'] || mapDataArray.get('001')['0']
    // 'itemList.onceArray.绷带' => thisMemory['itemList']['onceArray']['绷带']
    const [key0,key1,key2] = pathString.split('.');
    let parentObject;
    if(mode === 'r'){
        if(key1){
            switch(key0){
                case 'characterArray':{
                    return key2 ? (parentObject = thisMemory.characterArray[key1])?.[key2] ||
                    (parentObject = objectArray.characterArray.get(+key1))[key2] : parentObject;
                }
                case 'mapDataArray':{
                    return key2 ? (parentObject = thisMemory.mapDataArray[key1])?.[key2] ||
                    (parentObject = mapDataArray.get(key1))[key2] : parentObject;
                }
                case 'itemList':return key2 ? (parentObject = thisMemory.itemList[key1])[key2] : parentObject;
                default:throw new Error(`=> Memory has no '${key0}' !`);
            }
        }else{throw new Error('=> Need longer pathString !');}
    }else{
        parentObject = thisMemory[key0][key1] ??= {};
        switch(mode){
            case 'w':{
                if(!key2){throw new Error(`=> Need the third KEY in '${pathString}' !`);}
                else if(key0 in thisMemory){return parentObject[key2] = value_fn;}
                else{throw new Error(`=> Memory has no '${key0}' !`);}
            }
            case 'fn':{
                if(!key2){throw new Error(`=> Need the third KEY in '${pathString}' !`);}
                else{return value_fn?.(parentObject,key2)};
            }
            default:throw new Error(`=> What is the mode '${mode}' ?`);
        }
    }
}