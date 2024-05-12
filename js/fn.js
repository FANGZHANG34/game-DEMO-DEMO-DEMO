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
    var newobj;
    if(obj instanceof Object && obj !== null){
        newobj = obj instanceof Array ? [] : {};
        for(var i in obj){i[0] === '_' || (newobj[i] = copyObj(obj[i]));}
    }else{newobj = obj;}
    return newobj;
}
// messageImageConat 图片整合显示
function messageImageConat(imgUrl0,...imgUrlArray){
    const cartoonManager = window.gameManager.gameMessage.content,ctx = cartoonManager.image.self.getContext('2d');
    const tempImageArray = window.gameManager.constTemp.tempImageArray,imagePromiseArray = [],tempArray = {};
    for(let i of imgUrlArray){
        imagePromiseArray.push(new Promise(resolve=>{
            tempImageArray.has(i) && resolve(1);
            (tempArray[i] = new Image()).src = i;
            tempArray[i].onload = ()=>{tempImageArray.set(i,tempArray[i]);resolve(1);};
            tempArray[i].onerror = ()=>resolve(0);
        }))
    }
    Promise.all(imagePromiseArray).then(value=>{
        var i = value.reduce((a,b)=>a + b,0);
        if(i){
            const globalAlpha = (7 / 8) ** (i - 1);
            console.log(globalAlpha);
            new Promise(resolve=>{
                tempImageArray.has(imgUrl0) && resolve(imgUrl0);
                var temp = (i = new Image()).src = imgUrl0 ?? '';
                i.onload = ()=>resolve(temp);
                i.onerror = ()=>resolve(false);
            }).then(value=>{
                value && cartoonManager.loader('','',imgUrl0);
                cartoonManager.image.autoReset = false;
                ctx.globalAlpha = globalAlpha;
                for(i of imgUrlArray){cartoonManager.loader('','',i);}
                cartoonManager.image.autoReset = true;
                ctx.globalAlpha = 1;
            });
        }
    });
}
// loadCartoon 动画显示
function loadCartoon({
    head = 'w99_',tail = '.png',minN = 1,maxN = 79,longN = 2,bgmUrl = './audio/FM18.ogg',bgImgUrl = './img/w99_00.png',
    timeSep = 100,mode = 0
} = {}){
    var tempPaused = window.gameManager.playerMove.paused,playFn;
    window.gameManager.setGameInterval('tempProcess',timeSep / (mode || 1));
    window.gameManager.playerMove.paused = true;
    head = './img/'+head;
    const cartoonManager = window.gameManager.gameMessage.content;
    cartoonManager.loader('',bgmUrl);
    [cartoonManager.image.self.width,cartoonManager.image.self.height] = [1280,720];
    var N = minN;
    switch(mode){
        case 0:
            playFn = bgImgUrl ? ()=>{messageImageConat(bgImgUrl,head+strN(N++,longN)+tail);} :
            ()=>{cartoonManager.loader('','',head+strN(N++,longN)+tail);};break;
        case 1:playFn = ()=>{messageImageConat(bgImgUrl,head+strN(N++,longN)+tail,head+strN(N,longN)+tail);};break;
        case 2:
            var tempN,tempPlayFn = bgImgUrl
            ? ()=>{messageImageConat(bgImgUrl,head+strN((tempN = N),longN)+tail)}
            : ()=>{cartoonManager.loader('','',head+strN((tempN = N),longN)+tail);};
            playFn = ()=>{tempN === N ? messageImageConat(bgImgUrl,head+strN(N++,longN)+tail,head+strN(N,longN)+tail) : tempPlayFn();}
            break;
        default:throw(new Error(`=> There is no mode '${mode}'`));
    }
    const tempFn = ()=>{
        playFn();return N > maxN ? ()=>{
            tempPaused ? window.gameManager.gameMessage.self.classList.remove('disappear') : window.gameManager.playerMove.paused = false;
            [cartoonManager.image.self.width,cartoonManager.image.self.height] = [1920,1080];
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
                    return key2 ? (parentObject = thisMemory.characterArray[key1])?.[key2] ??
                    (parentObject = objectArray.characterArray.get(+key1))[key2] : parentObject;
                }
                case 'mapDataArray':{
                    return key2 ? (parentObject = thisMemory.mapDataArray[key1])?.[key2] ??
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