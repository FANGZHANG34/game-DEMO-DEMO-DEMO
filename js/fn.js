'use strict';
// function scrollTo(c,e,d=t=>(--t)**3+1){
//     var a=document.documentElement;
//     if(0===a.scrollTop){var b=a.scrollTop;
//     ++a.scrollTop;a=b+1===a.scrollTop--?a:document.body}
//     b=a.scrollTop;0>=e||("object"===typeof b&&(b=b.offsetTop),
//     "object"===typeof c&&(c=c.offsetTop),function(a,b,c,f,d,e,h){
//     function g(){0>f||1<f||0>=d?a.scrollTop=c:(a.scrollTop=b-(b-c)*h(f),
//     f+=d*e,setTimeout(g,e))}g()}(a,b,c,0,1/e,20,d))
// }
// 
const resolveVoid = Promise.resolve();
/**
 * loopSelf 自返回循环
 */
function loopSelf(){return loopSelf;}
/**
 * callBack 回调不求值
 * @param {()=>void} fn 
 */
function callBack(fn){resolveVoid.then(fn);}
/**
 * errorThrow 报告错误
 * @param {Error} e 
 */
function errorThrow(e){throw console.error(e),e;}
/**
 * strN 数字转规范字符串
 * @param {Number | String} N 
 * @param {Number} longN 
 * @returns {String}
 */
function strN(N,longN){return longN > (N = String(N)).length ? strN(N = '0'+N,longN) : N;}
/**
 * makeElement 定制元素
 * @param {String} tagName 
 * @param {{}} config 
 * @returns {HTMLElement}
 */
function makeElement(tagName,config){return Object.assign(document.createElement(tagName),config);}
/**
 * clearMedia 清空媒体内容
 * @param {HTMLAudioElement | HTMLVideoElement} mediaElement 
 */
function clearMedia(mediaElement){mediaElement.pause(),mediaElement.removeAttribute('src'),mediaElement.load();}
// getWindowWidth / getWindowHeight 获取窗口宽/高
function getWindowWidth(){return window.innerWidth ?? document.documentElement.clientWidth ?? document.body.clientWidth;}
function getWindowHeight(){return window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight;}
/**
 * timeRecord 过程计时
 * @param {(() => any) | never} promise 
 * @returns {Promise<{value: any | Error,time: Number}>} 
 */
async function timeRecord(promise){
    const t0 = Date.now();
    return {value: await(promise instanceof Function ? promise() : Promise.resolve(promise)),time: Date.now() - t0};
}
/**
 * copyObj 深复制对象
 * @param {never} obj 
 * @returns {never}
 */
function copyObj(obj){
    var newobj,i;
    if(obj instanceof Object){
        newobj = obj instanceof Array ? [] : {};
        for(i of Object.keys(obj)){i.charCodeAt(0) === 95 || (newobj[i] = copyObj(obj[i]));}
    }else{newobj = obj;}
    return newobj;
}
/**
 * clearCanvas 清空canvas并返回ctx
 * @param {HTMLCanvasElement} canvas 
 */
function clearCanvas(canvas){
    var ctx; return canvas.constructor === HTMLCanvasElement
    ? ((ctx = canvas.getContext('2d')).clearRect(0,0,canvas.width,canvas.height),ctx.closePath(),ctx)
    : console.error('=> Please put HTMLCanvasElement in function "clearCanvas" !');
}
/**
 * getImage 兑现图片
 * @param {String} imgUrl 
 * @returns {Promise<HTMLImageElement | false>}
 */
function getImage(imgUrl){
    const tempImageArray = window.gameManager.constTemp.tempImageArray,imgIf = tempImageArray.get(imgUrl);
    return new Promise(resolve=>!imgUrl ? resolve(false) : imgIf ? resolve(imgIf) : Object.assign(new Image(),{
        onload(){this.onload = this.onerror = null,tempImageArray.set(imgUrl,this),resolve(this);},onerror(){resolve(false);}
    }).src = imgUrl);
}
/**
 * getAudio 兑现音频
 * @param {String} audioUrl 
 * @returns {Promise<HTMLAudioElement | false>}
 */
function getAudio(audioUrl){
    const tempAudioArray = window.gameManager.constTemp.tempAudioArray,audioIf = tempAudioArray.get(audioUrl);
    return new Promise(resolve=>!audioUrl ? resolve(false) : audioIf ? resolve(audioIf.cloneNode()) : Object.assign(new Audio(),{
        oncanplay(){this.oncanplay = this.onerror = null,tempAudioArray.set(audioUrl,this),resolve(this.cloneNode())},onerror(){resolve(false);}
    }).src = audioUrl);
}
/**
 * searchSelf 寻找含self属性的真实对象
 * @param {{}} temp 
 * @returns {{}}
 */
function searchSelf(keyList = ['gameManager'],temp){
    var obj = window,keyArray,i = 0,key;temp ??= {_: 0};
    for(key of keyList){obj = obj[key]}
    switch(obj?.constructor){
        case Object:case Array:(keyArray = Object.keys(obj)).includes('self') && (temp[keyList.join('.')] = obj.self,temp._++);
        for(key of keyArray){switch(obj[key]?.constructor){case Object:case Array:searchSelf([...keyList,key],temp);}}
    }
    return temp;
}
/**
 * classNameAddOrRemove 类名快捷更替
 * @param {String} className 
 * @param {HTMLElement | null} remove4element 
 * @param {HTMLElement | null} add4element 
 */
function classNameAddOrRemove(className,remove4element = null,add4element = null){
    try{remove4element && remove4element.classList.remove(className),add4element && add4element.classList.add(className);}
    catch(error){
        throw !(className instanceof String) ? new Error('=> "className" must be string !') :
        remove4element && !(remove4element instanceof HTMLElement) ? new Error('=> "remove4element" must be HTMLElement !') :
        add4element && !(add4element instanceof HTMLElement) ? new Error('=> "add4element" must be HTMLElement !') :
        error;
    }
}
/**
 * cb2promise 回调转异步类
 * @param {{thisArg: {},methodName: String,callback: (...value)=>"this.resolve(value)"}} param0 
 * @param  {...any} parameters 
 * @returns {Promise<value>}
 */
function cb2promise({thisArg,methodName,callback = function(...value){this.resolve(value);}} = {},...parameters){
    if(thisArg instanceof Object && methodName in thisArg) return new Promise(resolve=>{
        const temp = {callback,resolve};
        try{thisArg[methodName](...parameters,(...value)=>temp.callback(...value));}catch({message: message0}){
            try{thisArg[methodName]((...value)=>temp.callback(...value),...parameters);}catch({message: message1}){
                errorThrow(new Error('=> Neither head or tail of parameters is Callback !\n'+message0+'\n'+message1))
            }
        }
    }); else throw new Error('=> Wrong:\n    "thisArg" not instanceof Object\n  or\n    "methodName" not in "thisArg" !');
};
/**
 * messageImageConcat 图片整合显示
 * @param {String} imgUrl0 
 * @param  {...String} imgUrlArray 
 */
function messageImageConcat(imgUrl0,...imgUrlArray){
    const cartoonManager = window.gameManager.gameMessage.content,imageGetArray = [],
    tempCanvas = window.gameManager.constTemp.tempCanvas,tempContext = tempCanvas.getContext('2d');
    var i;
    for(var i of imgUrlArray){imageGetArray.push(getImage(i));}
    Promise.all(imageGetArray).then(valueArray=>{
        const globalAlpha = (7 / 8) ** ((i = valueArray.reduce((a,b)=>a + (b ? 1 : 0),0)) - 1);
        i && getImage(imgUrl0).then(value=>{
            tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height),tempContext.closePath();
            value && tempContext.drawImage(value,0,0);
            globalAlpha === 1 || (tempContext.globalAlpha = globalAlpha);
            for(i of valueArray){i && tempContext.drawImage(i,0,0);}
            cartoonManager.loader('','','tempCanvas');
            globalAlpha === 1 || (tempContext.globalAlpha = 1);
        });
    });
}
/**
 * loadCartoon 动画显示
 * @param {{head: String,tail: String,minN: Number,maxN: Number,longN: Number,bgmUrl: String,bgImgUrl: String,timeSep: Number,mode: 0 |1 | 2 }} param0 
 * @returns {Promise<void>}
 */
function loadCartoon({
    head = 'w99_',tail = '.png',minN = 1,maxN = 79,longN = 2,bgmUrl = './audio/FM18.ogg',bgImgUrl = './img/w99_00.png',
    timeSep = 100,mode = 0
} = {}){
    var tempPaused = !window.gameManager.gameMessage.self.classList.length,N = minN,playFn;
    window.gameManager.gameMessage.self.classList.add('disappear');
    window.gameManager.setGameInterval('tempProcess',timeSep / (mode || 1));
    window.gameManager.playerMove.paused = true;
    head = './img/'+head;
    const cartoonManager = window.gameManager.gameMessage.content;
    cartoonManager.loader('',bgmUrl);
    [cartoonManager.image.self.width,cartoonManager.image.self.height] = [1280,720];
    switch(mode){
        case 0:
            playFn = bgImgUrl ? ()=>{messageImageConcat(bgImgUrl,head+strN(N++,longN)+tail);} :
            ()=>{cartoonManager.loader('','',head+strN(N++,longN)+tail);};break;
        case 1:playFn = ()=>{messageImageConcat(bgImgUrl,head+strN(N++,longN)+tail,head+strN(N,longN)+tail);};break;
        case 2:
            var tempN,tempPlayFn = bgImgUrl
            ? ()=>{messageImageConcat(bgImgUrl,head+strN((tempN = N),longN)+tail)}
            : ()=>{cartoonManager.loader('','',head+strN((tempN = N),longN)+tail);};
            playFn = ()=>{tempN === N ? messageImageConcat(bgImgUrl,head+strN(N++,longN)+tail,head+strN(N,longN)+tail) : tempPlayFn();}
            break;
        default:throw(new Error(`=> There is no mode '${mode}'`));
    }
    return new Promise(resolve=>{
    const tempFn = window.gameManager.tempProcess.nowFn = ()=>{
        playFn();return N > maxN ? ()=>{
            tempPaused ? classNameAddOrRemove('disappear',window.gameManager.gameMessage.self,cartoonManager.image.self) :
            window.gameManager.playerMove.paused = false;
            [cartoonManager.image.self.width,cartoonManager.image.self.height] = [1920,1080];
            resolve();
        } : tempFn;
    }});
}
/**
 * memoryHandle 记忆信息操作
 * @param {String} pathString 
 * @param {'r' | 'w' | 'fn'} mode 
 * @param {any | (parentObject: {},key2: String) => any} value_fn 
 * @param {{} | window.gameManager.constTemp.memory} thisMemory 
 */
function memoryHandle(
    pathString = 'characterArray.0.name',mode = 'r',value_fn = (parentObject,key2)=>parentObject[key2],
    thisMemory = window.gameManager.constTemp.memory
){
    // thisMemory do mode at pathString some time with value_fn.
    // 'pathString' example:
    // 'characterArray.0.name' => thisMemory['characterArray']['0']?.['name'] || characterArray.get(0)['name']
    // 'mapDataArray.001.0' => thisMemory['mapDataArray']['001']?.['0'] || mapDataArray.get('001')['0']
    // 'itemList.onceArray.绷带' => thisMemory['itemList']['onceArray']['绷带']
    const
    storeNameList = ['characterArray','mapDataArray','itemList'],
    [key0,key1,key2] = pathString.split('.')
    ;
    if(!storeNameList.includes(key0)){throw new Error('=> Wrong key0 (the first) in pathString !');}
    if(!key1){throw new Error('=> Not found key1 (the second) in pathString !');}
    const parentObject = thisMemory[key0][key1] ??= {},
    sourceObject = key0 === 'characterArray' ? characterArray.get(+key1)
    : key0 === 'mapDataArray' ? mapDataArray.get(key1)
    : parentObject
    ;
    switch(mode){
        case 'r': return key2 ? parentObject[key2] ?? sourceObject[key2]
        : Object.assign({},sourceObject,parentObject);
        case 'w': return !key2 ? console.error(`=> Need the third KEY in '${pathString}' !`)
        : Object.keys(thisMemory).includes(key0) ? (
            value_fn && value_fn instanceof String &&
            key0 === 'characterArray' && key2 === 'name' &&
            (characterArray.list[key1] = value_fn),
            parentObject[key2] = value_fn ?? ''
        ) : console.error(`=> Memory has no '${key0}' !`);
        case 'fn': return !key2 ? console.error(`=> Need the third KEY in '${pathString}' !`)
        : value_fn instanceof Function ? value_fn(parentObject,key2)
        : console.error('=> Need function "value_fn" in mode "fn" !');
        default: throw new Error(`=> What is the mode '${mode}' ?`);
        
    }
}
// getRandomZoneUT 获取随机UT位置
function getRandomZoneUT(){return ~~(Math.random() * 961);}
/**
 * getRandomDiractionUT 获取随机UT方向
 * @param {Number} seedN 
 */
function getRandomDiractionUT(seedN){
    return seedN = ~~(Math.random() * 1000000 + seedN) % 4,seedN-- ? seedN-- ? seedN ? [0,1] : [-1,0] : [0,-1] : [1,0];
}
/**
 * objArrayFilter  对象清洗
 * @param {{}[]} objArray 
 * @param {(value: any) => Boolean} callback 
 * @returns {(String | {})[]}
 */
function objArrayFilter(objArray,callback,toStringArray = true,isReverse = true){
    const tempArray = [];
    var i,j,keyNameList,buffArray;
    if(toStringArray){
        for(i = objArray.length;i --> 0;){
            const keyNameList = Object.keys(objArray[i]);
            for(j = keyNameList.length;j --> 0;){
                callback(objArray[i][keyNameList[j]]) && tempArray.push(keyNameList[j]);
            }
        }
        return isReverse ? tempArray : tempArray.reverse();
    }else{
        for(i of objArray){
            keyNameList = Object.keys(i),tempArray.push(buffArray = {});
            for(j of keyNameList){callback(i[j]) && (buffArray[j] = i[j]);}
        }
        return isReverse ? tempArray.reverse() : tempArray;
    }
}