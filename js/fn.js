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
function strN(N,longN){return longN <= String(N).length ? String(N) : strN('0'+N, longN);}
// clearMedia 清空媒体内容
function clearMedia(mediaElement){mediaElement.pause(),mediaElement.removeAttribute('src'),mediaElement.load();}
// getWindowWidth / getWindowHeight 获取窗口宽/高
function getWindowWidth(){return (window.innerWidth ?? document.documentElement.clientWidth ?? document.body.clientWidth);}
function getWindowHeight(){return (window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight);}
// copyObj 深复制对象
function copyObj(obj = {}){
    var newobj;
    if(obj instanceof Object && obj !== null){
        newobj = obj instanceof Array ? [] : {};
        for(var i in obj){i[0] === '_' || (newobj[i] = copyObj(obj[i]));}
    }else{newobj = obj;}
    return newobj;
}
// makeElement 定制元素
function makeElement(tagName, config){
    // e.g.
    // makeElement('div', {'className':'normal','textContent':'helloworld'});
    const theElement = document.createElement(tagName);
    for(let i in config){theElement[i] = config[i];}
    return theElement;
}
// getImage 兑现图片
function getImage(imgUrl){
    const tempImageArray = window.gameManager.constTemp.tempImageArray;
    return new Promise(resolve=>{
        var i = tempImageArray.get(imgUrl);
        !imgUrl ? resolve(false) : i ? resolve(i) :
        ((i = new Image()).onerror = ()=>resolve(false),i.onload = ()=>(tempImageArray.set(imgUrl,i),resolve(i)),i.src = imgUrl);
    });
}
// messageImageConcat 图片整合显示
async function messageImageConcat(imgUrl0,...imgUrlArray){
    const cartoonManager = window.gameManager.gameMessage.content,imageGetArray = [],
    tempCanvas = window.gameManager.constTemp.tempCanvas,tempContext = tempCanvas.getContext('2d');
    for(var i of imgUrlArray){imageGetArray.push(await getImage(i));}
    var i = imageGetArray.reduce((a,b)=>a + (b ? 1 : 0),0);
    if(i){
        const globalAlpha = (7 / 8) ** (i - 1);
        getImage(imgUrl0).then(value=>{
            tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height),tempContext.closePath();
            value && tempContext.drawImage(value,0,0);
            globalAlpha === 1 || (tempContext.globalAlpha = globalAlpha);
            for(i of imageGetArray){i && tempContext.drawImage(i,0,0);}
            cartoonManager.loader('','','tempCanvas');
            globalAlpha === 1 || (tempContext.globalAlpha = 1);
        });
    }
}
// loadCartoon 动画显示
function loadCartoon({
    head = 'w99_',tail = '.png',minN = 1,maxN = 79,longN = 2,bgmUrl = './audio/FM18.ogg',bgImgUrl = './img/w99_00.png',
    timeSep = 100,mode = 0
} = {}){
    var tempPaused = window.gameManager.playerMove.paused,playFn,N = minN;
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
    const tempFn = ()=>{
        playFn();return N > maxN ? ()=>{
            tempPaused ? (
                window.gameManager.gameMessage.self.classList.remove('disappear'),
                cartoonManager.image.self.classList.add('disappear')
            ) : window.gameManager.playerMove.paused = false;
            [cartoonManager.image.self.width,cartoonManager.image.self.height] = [1920,1080];
        } : tempFn;
    }
    window.gameManager.tempProcess.nowFn = tempFn;
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
    var parentObject;
    if(mode === 'r'){
        if(key1){
            switch(key0){
                case 'characterArray':
                    return key2 ? (parentObject = thisMemory.characterArray[key1])?.[key2] ??
                    (parentObject = objectArray.characterArray.get(+key1))[key2] : parentObject;
                case 'mapDataArray':
                    return key2 ? (parentObject = thisMemory.mapDataArray[key1])?.[key2] ??
                    (parentObject = mapDataArray.get(key1))[key2] : parentObject;
                case 'itemList':return key2 ? (parentObject = thisMemory.itemList[key1])[key2] : parentObject;
                default:throw new Error(`=> Memory has no '${key0}' !`);
            }
        }else{throw new Error('=> Need longer pathString !');}
    }else{
        parentObject = thisMemory[key0][key1] ??= {};
        switch(mode){
            case 'w':
                if(!key2){throw new Error(`=> Need the third KEY in '${pathString}' !`);}
                else if(key0 in thisMemory){return parentObject[key2] = value_fn;}
                else{throw new Error(`=> Memory has no '${key0}' !`);}
            case 'fn':
                if(!key2){throw new Error(`=> Need the third KEY in '${pathString}' !`);}
                else{return value_fn?.(parentObject,key2)};
            default:throw new Error(`=> What is the mode '${mode}' ?`);
        }
    }
}
// getRandomZoneUT 获取随机UT位置
function getRandomZoneUT(){return ~~(Math.random() * 961);}
// getRandomDiractionUT 获取随机UT方向
function getRandomDiractionUT(seedNum){
    switch(~~(Math.random() * 1000000 + seedNum) % 4){
        case 0:return [1,0];
        case 1:return [0,-1];
        case 2:return [-1,0];
        case 3:return [0,1];
    }
}