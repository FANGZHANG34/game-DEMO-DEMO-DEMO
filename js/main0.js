'use strict';
/**
 * 
 * @returns {Promise<gameManager,Error>}
 */
window.onload = ()=>{
    // 设置全局的函数、常量和变量
    // gameManager 游戏元素管理员，其属性包含了所有游戏元素
    // 大多数游戏元素都有self属性以指向其本体HTMLElement

    // gameManager 游戏管理者，游戏基框架的集合对象
    // .gameTip 布尔值，表示游戏提示元素是否显现，请勿修改！
    // .constTemp 游戏常量对象集合
    // .hoverAudio 鼠标移动至选项而使用的音频元素
    // .clickAudio 鼠标点击而使用的音频元素
    // .globalProcess ... .playerMove 预定的四个游戏循环计时器参考对象
    // .makePromise() 在该脚本执行完后进行补丁操作
    // .setWorldSpeed() 设置世界时间流速
    // .setGameInterval() 设置游戏循环计时器的ID
    // .bgs() 一次性地使用游戏音效
    const gameManager = window.gameManager = {
        gameTip: false,promiseArray: [],
        encryptedTemp: {
            self: Object.assign(new Image()),
            /**
             * 
             * @param {String} src 
             * @returns {Promise<Boolean>}
             */
            loader: src=>new Promise(resolve=>void Object.assign(gameManager.encryptedTemp.self,{
                onload(){
                    const tempCtx = makeElement('canvas',{
                        width: this.naturalWidth,height: this.naturalHeight
                    }).getContext('2d');
                    tempCtx.drawImage(this,0,0);
                    var
                    imgData = Array.from(tempCtx.getImageData(0,0,this.naturalWidth,this.naturalHeight).data),
                    tailN = (imgData.length ?? 0) - 1,
                    tempData = []
                    ;
                    while(!(imgData[tailN] || tailN < 0)){tailN -= 4;}
                    imgData = imgData.slice(0,++tailN),
                    tailN -= 4;
                    for(let i = 0;i < tailN;i++){tempData.push(imgData[i++],imgData[i++],imgData[i++]);}
                    imgData[tailN++] || (
                        imgData[tailN++] ? tempData = tempData.slice(0,-2):
                        imgData[tailN] ? tempData.pop() :
                        console.error('=> Wrong end with PNG file !')
                    );
                    gameManager.encryptedTemp.data = JSON.parse(LZString.decompressFromUint8Array(tempData));
                    resolve(true,console.log('success!'));
                },
                onerror(){console.error(new Error('=> Failed to load encryptedTemp !')),resolve(false);},
                src
            })).
            then(value=>(Object.assign(gameManager.encryptedTemp.self,{onload: null,onerror: null}),value)).
            catch(e=>console.error(e)),
            data: null
        },
        constTemp: {
            memory: null,tempCanvas: makeElement('canvas',{width: 1920,height: 1080}),
            tempImageArray: new Map(),tempAudioArray: new Map(),
            moveDiraction: {_: 0,s: [0,1,0],a: [-1,0,0],w: [0,-1,0],d: [1,0,0]},
            moveKeyframes: [{},{}],gameBodyKeyframes: [{},{}],moveConfig: {duration: 133,fill: 'forwards'}
        },
        hoverAudio: new Audio('./audio/1.ogg'),clickAudio: new Audio('./audio/Cancel2.ogg'),
        bgm: {
            // bgm 背景音乐
            // .report() 报告音频
            // .next() 切换音频
            self: Object.assign(new Audio(),{onplay: ()=>gameManager.bgm.report(),onended: ()=>gameManager.bgm.next()}),
            index: 0,tempSrc: null,
            loader(audioUrl,mode = false){
                audioUrl === this.tempSrc ? mode && (this.self.currentTime = 0) :
                audioUrl instanceof Array ? (this.tempSrc = audioUrl,this.self.src = './audio/'+this.tempSrc[this.index = 0]) :
                (this.self.src = './audio/'+(this.tempSrc = audioUrl)),
                this.self.paused && this.self.play().catch(e=>{console.error(e),this.next();});
            },
            report(){console.log(this.tempSrc?.[this.index] ?? this.tempSrc);},
            next(){
                Promise.resolve(
                    this.tempSrc instanceof Array
                    ? this.self.src = './audio/'+this.tempSrc[this.index = (this.index + 1) % this.tempSrc.length]
                    : this.self.currentTime = 0,this.self.play()
                ).catch(e=>{console.error(e),this.index + 1 < this.tempSrc.length && this.ended();});
            }
        },
        globalProcess: {intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        dialogueProcess: {intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        tempProcess: {intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        playerMove: {
            intervalID: null,timeSep: null,paused: true,onEvent: null,nowFn: null,
            promise: false,moveD: 0,step: 0,
            async stepFn(){return clearCanvas(gameManager.gamePlayer.display).drawImage(
                await getImage(memoryHandle('characterArray.'+gameManager.gamePlayer.id+'.display')),
                -this.step * 120, -gameManager.gamePlayer.moveD * 120
            ),this.step > 0 && (this.step--, true);},
            defaultFn(){
                var temp,i;
                const moveD = gameManager.constTemp.moveDiraction,gamePlayer = gameManager.gamePlayer;
                if(gamePlayer.id !== null && moveD._){
                    const previous = gamePlayer.xyz.concat();
                    for(gamePlayer.moveD = 0;gamePlayer.moveD < 4;gamePlayer.moveD++){
                        if(null !== (
                            (temp = moveD['sawd'[gamePlayer.moveD]])[2] === moveD._ ? temp[0] ?
                            previous[i = 0] = Math.min(Math.max(0,gamePlayer.xyz[0] + temp[0]),limitWidth) :
                            previous[i = 1] = Math.min(Math.max(0,gamePlayer.xyz[1] + temp[1]),limitHeight) : null
                        )){break;}
                    }
                    previous[i] !== gamePlayer.xyz[i] && gameManager.gameMap.onDirectionEvent(previous) &&
                    (!gameManager.gameMap.board.zone || gameManager.gameMap.board.zone[previous[1]][previous[0]]) ? (
                        this.promise = gamePlayer.loader(gamePlayer.id,previous,true).
                        then(()=>gameManager.gameMap.onPointEvent(previous)),this.step = 3
                    ) : this.stepFn();
                }
            }
        },
        /**
         * makePromise() 作出承诺
         * @param {Function} fn 
         */
        makePromise(fn){console.log('promiseCount:',this.promiseArray.push(new Promise(resolve=>setTimeout(()=>resolve(fn())))));},
        /**
         * completeSelf() 独善其身
         * @param {String} pathStr 
         * @returns {Promise<gameManager,Error>}
         */
        completeSelf(pathStr,forgot = true){return Promise.all(this.promiseArray).then(
            ()=>(forgot && (this.promiseArray = []),this),
            ({message: e})=>{throw console.error(e = new Error(String(pathStr)+'\n'+e)),e;}
        );},
        setWorldSpeed(num = 30){
            this.constTemp.moveConfig.duration = ~~(4000 / num);
            this.setGameInterval('playerMove',~~(1000 / num) + 1,2);
        },
        /**
         * setGameInterval() 设置游戏循环计时器
         * @param {String} type 
         * @param {Number} timeSep 
         * @returns {{}}
         */
        setGameInterval(type,timeSep,exMode = 0){
            const temp = gameManager[type] ??= {intervalID: null,timeSep: null,paused: false,onEvent: ()=>{},nowFn: null};
            exMode && (temp.promise ??= false),exMode > 1 && (temp.step ??= 0),
            (timeSep = +timeSep) !== 0 && isFinite(timeSep) && timeSep !== temp.timeSep && (
                temp.timeSep = timeSep,temp.intervalID?.constructor === Number && clearInterval(temp.intervalID),console.log(type,timeSep),
                temp.intervalID = setInterval(
                    !exMode-- ? ()=>temp.paused || (temp.onEvent?.(),(temp.nowFn &&= temp.nowFn?.() ?? null) || temp.defaultFn?.())
                    : !exMode-- ? ()=>temp.paused || Promise.resolve(temp.promise).then(()=>(
                        temp.promise = false,temp.onEvent?.(),temp.nowFn = (temp.nowFn ? temp.nowFn?.() : temp.defaultFn?.()) ?? null
                    )) : !exMode-- ? ()=>temp.paused || Promise.resolve(temp.promise && temp.stepFn?.()).
                    then(value=>{if(value){throw value;}else{return temp.promise;}}).then(()=>(
                        temp.promise = false,temp.onEvent?.(),temp.nowFn = (temp.nowFn ? temp.nowFn?.() : temp.defaultFn?.()) ?? null
                    )).catch(e=>e || console.error(e))
                    : ()=>(clearInterval(temp.intervalID),console.error('=> Wrong exMode when setGameInterval !')),
                    timeSep
                )
            )
            return temp;
        },
        bgs: (onended=>
            /**
             * bgs() 产生音效
             * @param {String} audioUrl 
             * @returns {Promise<HTMLAudioElement | false>}
             */
            audioUrl=>getAudio(audioUrl).then(value=>value && Object.assign(value,{
                volume: configArray.globalArray.globalVolume * configArray.globalArray.bgs,
                currentTime: 0,onended
            }
        ).play()))(function(){clearMedia(this);})
    };
    gameManager.constTemp.tempImageArray.set('tempCanvas',gameManager.constTemp.tempCanvas);
    // 设置循环计时器
    gameManager.makePromise(()=>(
        gameManager.setGameInterval('autoSL',3e5).onEvent = ()=>{
            gameManager.gameMap.mapID && localStorage.
            setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)));
        },gameManager.setGameInterval('globalProcess',100),gameManager.setGameInterval('dialogueProcess',66),
        gameManager.setGameInterval('tempProcess',100),null
    ));

    // configArray 本地配置
    // hoverAudio 鼠标音效元素
    // clickAudio 点击音效元素
    // singleStepLength 单位长度
    // mapWidth,mapHeight 地图相对长度
    // limitWidth,limitHeight 地图坐标限制
    // mapRealWidth,mapRealHeight 地图实际长度
    const configArray = JSON.parse(LZString.decompress(localStorage.getItem('configArray')));
    const singleStepLength = 60;
    const [mapWidth,mapHeight] = [32,18];
    const [limitWidth,limitHeight] = [mapWidth-1,mapHeight-1];
    const [mapRealWidth,mapRealHeight] = [mapWidth * singleStepLength,mapHeight * singleStepLength];

    // *.self *的本体元素
    // *.style *的当前样式
    {
        let temp;
        // gameBody 游戏大元素集合
        // .menu 菜单元素
        // .gameTip 游戏提示
        // .menuBoard 选项对应面板对象
        // .gameTip.tipFn() 开关游戏提示
        const gameBody = gameManager.gameBody = {
            self: document.getElementById('gameBody'),
            menu: document.getElementById('menu'),
            gameTip: {
                self: temp = document.getElementById('gameTip'),
                tipFn(mouseEvent,isTip = true){
                    const gameTip = this.self,tipStyle = this.style;
                    var x,y,temp;
                    isTip ? (
                        x = (temp = mouseEvent.clientX) * 2 < (x = getWindowWidth()) ? temp + 32 : temp - 32 - x / 5,
                        y = (temp = mouseEvent.clientY) * 2 < (y = getWindowHeight()) ? temp + 18 : temp - 18 - this.self.scrollHeight,
                        tipStyle.translate = x+'px '+y+'px 0px',
                        gameManager.gameTip ||= (gameTip.classList.remove('disappear'),true)
                    ) : gameManager.gameTip &&= (gameTip.classList.add('disappear'),false);
                }
            },
            menuBoard: {
                self: document.getElementById('menuBoard'),
                title: {self: document.getElementById('guide')},
                characterGame: {self: document.getElementById('characterBoard')},
                gallery: {self: document.getElementById('myGallery')},
                config: {
                    self: document.getElementById('myConfig'),
                    loader(){
                        this.applyVolume(),
                        gameManager.setWorldSpeed(configArray.globalArray.worldSpeed);
                    },
                    applyVolume(){
                        gameManager.gameMessage.content.video.volume = gameManager.gameMessage.content.audio.volume =
                        configArray.globalArray.globalVolume * configArray.globalArray.dialogue,
                        gameManager.bgm.self.volume = configArray.globalArray.globalVolume * configArray.globalArray.bgm,
                        gameManager.hoverAudio.volume = gameManager.clickAudio.volume = configArray.globalArray.globalVolume * configArray.globalArray.bgs;
                    }
                }
            }
        };
        gameBody.gameTip.style = temp.style;
        (temp = Array.from(gameBody.menuBoard.config.self.children)).shift();
        for(let element of temp){gameBody.menuBoard.config[element.id] = element.children[1];}
        gameManager.makePromise(async()=>await gameManager.encryptedTemp.loader('./js/asset.png'));
        gameManager.makePromise(()=>{gameBody.menuBoard.openGame = {self: gameManager.gameFileSL.self},gameBody.menuBoard.config.loader();});
    }
    {
        // gameMap 游戏地图
        // .mapConcat 地图元素集合
        // .loader() 加载地图
        // .onDirectionEvent() 检测某位置的前进方向是否触发什么事件
        // .onPointEvent() 检测某位置触发什么事件
        const gameMap = gameManager.gameMap = {
            mapID: null,size: {width: singleStepLength * mapWidth,height: singleStepLength * mapHeight},
            mapConcat: Array.from(document.getElementsByClassName('mapImg')),
            loader(mapID){
                var imgUrl = memoryHandle('mapDataArray.'+(gameManager.gameFileSL.origin[0].mapID = this.mapID = mapID)+'.0');
                getImage(imgUrl).then(value=>{
                    if(value){for(imgUrl = 0;imgUrl < 4;imgUrl++){
                        clearCanvas(this.mapConcat[imgUrl]).drawImage(value,0,-imgUrl * mapRealHeight);
                    }}else{console.error('=> Wrong map imgUrl: '+mapImageUrl);}
                });
                gameManager.globalProcess.nowFn = eventArray.get(memoryHandle('mapDataArray.'+mapID+'.4'))?.[1];
            },
            /**
             * 
             * @param {Array} xyz 
             * @returns {String}
             */
            onDirectionEvent(xyz){
                nodeArrayLoop:for(var nodeCharacter of this.objectManager.nodeArray){
                    var temp = nodeCharacter.xyz,i;
                    for(i = 0;i < 3;i++){if(temp[i] !== xyz[i]){continue nodeArrayLoop;}}
                    eventArray.get(memoryHandle('characterArray.'+(temp = nodeCharacter.id)+'.selfEvent') || '0')[1](temp);
                    getImage(memoryHandle('characterArray.'+temp+'.display')).then(value=>(
                        clearCanvas(nodeCharacter.display).drawImage(value,0,-(nodeCharacter.moveD = (gameManager.gamePlayer.moveD + 2) % 4) * 120)
                    ));
                    return memoryHandle('characterArray.'+temp+'.zone');
                };
                return true;
            },
            /**
             * 
             * @param {Array} xyz 
             * @returns {Boolean}
             */
            onPointEvent(xyz){
                mapEventLoop:for(var eventInfo of memoryHandle('mapDataArray.'+this.mapID+'.3')){
                    for(var i = 0;i < 3;i++){if(eventInfo[i] !== xyz[i] && eventInfo[i] !== null){continue mapEventLoop;}}
                    eventArray.get(eventInfo[3])[1]();
                    return true;
                }
                return false;
            }
        };
        for(let i of gameMap.mapConcat){Object.assign(i,gameMap.size).style.zIndex = i.id[3];}
        {
            // mapBoard 地图面板
            // .zone 地图通行区域
            // .array 单位区块子元素集合
            // .loader() 加载地图通行区域
            const mapBoard = gameMap.board = {
                self: document.getElementById('gameMapBoard'),array: null,zone: null,
                /**
                 * 
                 * @param {Array} boardZoneArray 
                 */
                loader(boardZoneArray){
                    this.zone = [];
                    for(let i of Object.keys(boardZoneArray)){
                        this.zone[i] = Array.from(boardZoneArray[i].toString(2)).map(i=>+i).reverse();
                        for(let j = mapWidth-1; j >= 0; j--){this.zone[i][j] = !this.zone[i][j];}
                    }
                }
            };
            mapBoard.self.style.width = gameMap.mapConcat[0].width+'px';
            let temp = ['<div></div>'],i = 1;while(mapWidth > i){temp[i++] = temp[0];}
            temp = ['<div>'+temp.join('')+'</div>'],i = 1;while(mapHeight > i){temp[i++] = temp[0];}
            mapBoard.self.innerHTML = temp.join(''),mapBoard.self.classList.remove('disappear');
            mapBoard.array = Array.from(document.querySelectorAll('#gameMapBoard>div>div'));
        }
        {
            // mapObjectManager 地图对象管理者，地图上的对象集合
            // .array 地图对象集合
            // .nodeArray 地图对象元素集合
            // .nodeTemp 地图对象元素模板
            // .loader() 加载地图对象
            const objectManager = gameMap.objectManager = {
                nodeArray: [],
                nodeTemp: makeElement('div',{className: 'mapObject',innerHTML: '<canvas height="120" width="120"></canvas>'}),
                /**
                 * 
                 * @param {...{}} characterInfoArray 
                 */
                characterLoader(characterInfoArray){
                    var i,object;for(i of this.nodeArray){i.self.remove();}
                    this.nodeArray = [];
                    for(object of characterInfoArray){
                        (this.nodeArray[this.nodeArray.length] = Object.assign(
                            {},gameManager.gamePlayer,{self: i = this.nodeTemp.cloneNode(true),id: null,xyz: [],moveD: 0,photo: null}
                        )).loader(object.id,object.xyz),gameManager.gamePlayer.self.insertAdjacentElement('beforebegin',i);
                    }
                }
            };
        }
    }
    {
        // gamePlayer 游戏主角
        // .id 主角编号
        // .display 显现元素<canvas>
        // .xyz 主角方位
        // photo 立绘
        // .loader() 加载主角方位
        // .focus() 聚焦主角方位
        const gamePlayer = gameManager.gamePlayer = {
            self: Object.assign(document.getElementById('player'),{innerHTML: '<canvas width="120" height="120"></canvas>'}),
            id: null,xyz: [],moveD: 0,display: null,
            photo: {
                self: Object.assign(document.getElementById('playerPhoto'),{width: 720,height: 2025}),
                loader(imageUrl){getImage(imageUrl).then(value=>clearCanvas(this.self).drawImage(value,0,0));}
            },
            /**
             * 
             * @param {Number} id 
             * @param {...Number | undefined} xyz 
             * @returns {Promise<undefined>}
             */
            loader(id,xyz,isFocus = false){
                const moveKeyframes = gameManager.constTemp.moveKeyframes,appear = this.id !== id;
                xyz && (
                    [this.xyz[0],this.xyz[1],this.xyz[2]] = xyz,
                    (!this.self.style.zIndex || +this.self.style.zIndex !== xyz[2]) && (this.self.style.zIndex = String(xyz[2])),
                    moveKeyframes[0].translate = `${xyz[0] * singleStepLength}px ${xyz[1] * singleStepLength}px 0px`
                ),appear && (
                    this.id = id,this.display = this.self.firstChild,moveKeyframes[1] = Object.assign({},moveKeyframes[0]),
                    getImage(memoryHandle('characterArray.'+id+'.display')).then(value=>(
                        value ? clearCanvas(this.display).drawImage(value,0,0) : console.error('=> Wrong character display: '+mapImageUrl)
                    ))
                ),this === gamePlayer && (
                    gameManager.gameFileSL.origin[0].id = id,
                    this.photo.loader(memoryHandle('characterArray.'+id+'.photo')),
                    xyz && gameManager.gameMap.board.loader(memoryHandle('mapDataArray.'+gameManager.gameMap.mapID+'.1')[xyz[2]])
                ),isFocus && this.focus();
                return this.self.animate(moveKeyframes.reverse(),gameManager.constTemp.moveConfig).finished;
            },
            focus(){
                const windowWidth = getWindowWidth(),windowHeight = windowWidth * 9/16;
                const gameBodyKeyframes = gameManager.constTemp.gameBodyKeyframes;
                gameBodyKeyframes[0].translate = -Math.min(
                    Math.max(0,singleStepLength * this.xyz[0] - (windowWidth - singleStepLength) / 2),mapRealWidth - windowWidth
                )+'px '+ -Math.min(
                    Math.max(0,singleStepLength * this.xyz[1] - (windowHeight - singleStepLength) / 2),mapRealHeight - windowHeight
                )+'px 0px';
                gameManager.gameBody.self.animate(gameBodyKeyframes.reverse(),gameManager.constTemp.moveConfig);
            }
        };
    }
    {
        // gameFileSL 游戏存档
        // .origin 存档管理元素
        // .array 存档元素的子元素集合
        // .importFileSL() 加载存档元素的子元素集合
        const gameFileSL = gameManager.gameFileSL = {
            self: document.getElementById('SL'),
            temp: makeElement('input',{type: 'file',accept: 'application/json',onchange(){
                Object.assign(new FileReader(),{onload(){
                    gameFileSL.origin = JSON.parse(this.result),localStorage.setItem('saveDataArray',LZString.compress(this.result));
                }}).readAsText(tempFile.files[0]);
            }}),
            origin: JSON.parse(LZString.decompress(localStorage.getItem('saveDataArray'))),
            importFileSL(){this.temp.click(),this.self.classList.remove('disappear'),gameManager.gameInfoSL.self.classList.add('disappear');}
        };
        gameFileSL.array = gameFileSL.self.children;
        for(let i of Object.keys(gameFileSL.origin)){
            gameFileSL.self.insertAdjacentElement('beforeend',makeElement('div',{textContent: (i === '0' ? '自动存档' : '手动存档')+i}));
        }
    }
    {
        // gameInfoSL 当前存档对象
        // .stage 当前存档浏览
        // .temp 当前存档信息
        // .saveDataTemp 用于替代的存档信息
        // .shower() 展示存档
        // .loader() 加载存档
        // .saver() 保存存档
        // .deleter() 删除存档
        const gameInfoSL = gameManager.gameInfoSL = {
            self: document.getElementById('infoSL'),stage: document.querySelector('#infoSL>pre'),index: null,temp: null,
            saveDataTemp: {
                mapID: '001',id: 0,xyz: [16,9,0],partner: [],switch: [],record: {},
                memory: {itemList: {onceArray: {},twiceArray: {},onfitArray: {}},characterArray: {1: {selfEvent: '4'}},mapDataArray: {}}
            },
            shower(){
                this.stage.textContent = this.index === '0' ? '（自动更新，只读）\n当前信息：' : '信息：';
                if(gameInfoSL.temp){for(var i of Object.values(this.temp)){this.stage.textContent += '\n'+String(i);}}
                else{this.stage.textContent += '\n'+'NULL'}
                this.self.classList.remove('disappear');
            },
            loader(){
                var temp = this.temp || this.saveDataTemp;
                gameManager.constTemp.memory =
                (gameManager.gameFileSL.origin[0] = Object.assign(copyObj(temp),{xyz: gameManager.gamePlayer.xyz})).memory;
                gameManager.gameMap.loader(temp.mapID);
                gameManager.gameMap.objectManager.characterLoader(memoryHandle('mapDataArray.'+temp.mapID+'.2'));
                gameManager.gamePlayer.loader(temp.id,temp.xyz,true);
                gameManager.gameBody.menu.classList.add('disappear');
            },
            saver(){
                gameManager.gameMap.mapID ? confirm('确认覆盖存档？') ? (
                    this.temp = gameManager.gameFileSL.origin[this.index] = copyObj(gameManager.gameFileSL.origin[0]),
                    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin))),
                    this.shower()
                ) : alert('已取消保存。') : alert('！！！写入失败！！！\n\n因为您未开始游玩');
            },
            deleter(){
                confirm('确认删除存档？') ? (
                    this.temp = gameManager.gameFileSL.origin[this.index] = 0,this.shower(),
                    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)))
                ) : alert('已取消操作。');
            }
        }
    }
    {
        // gameMessage 游戏消息
        // .loader() 加载
        // .*.reset() 重置
        // .*.loader() 加载
        // .closer() 关闭
        const gameMessage = gameManager.gameMessage = {
            self: document.getElementById('gameMessage'),
            /**
             * 
             * @param {{name: String | undefined,faceUrl: String | undefined}} param0 
             * @param {{text: String | undefined,audioUrl: String | undefined,imageUrl: String | undefined,videoUrl: String | undefined}} param1 
             * @param {{string: any}} choiceArray
             * @param {Function | undefined} finallyFn 
             */
            loader({name,faceUrl} = {},{text,audioUrl,imageUrl,videoUrl} = {},choiceArray = {},finallyFn){
                this.closer(gameManager.playerMove.paused ||= true),
                this.content.loader(text,audioUrl,imageUrl,videoUrl),this.sender.loader(name,faceUrl),
                this.option.setChoiceArray(choiceArray,finallyFn),
                this.self.classList.remove('disappear');
            },
            closer(paused = false){
                gameManager.playerMove.paused === paused || (gameManager.playerMove.paused = paused);
                this.self.classList.add('disappear'),this.sender.reset(),this.content.reset(),this.option.reset();
            },
            sender: {
                // sender 发送人
                // .name 名字
                // .face 表情
                self: document.getElementById('messageSenderInfo'),
                name: document.getElementById('messageSenderName'),
                face: Object.assign(document.getElementById('messageSenderStage'),{width: 300,height: 300}),
                reset(){this.name.textContent = '',clearCanvas(this.face);},
                /**
                 * 
                 * @param {String | undefined} name 
                 * @param {String | undefined} faceUrl 
                 */
                loader(name,faceUrl){
                    name && (this.name.textContent = name),getImage(faceUrl).then(value=>(
                        value ? this.face.getContext('2d').drawImage(value,0,0) : faceUrl && console.error('=> Wrong faceUrl :'+faceUrl)
                    ));
                }
            },
            content: {
                // content 内容
                // .textId 文本循环器ID
                // .text 文本
                // .image 图片对象
                // .video 视频
                // .audio 音频
                self: document.getElementById('messageContent'),
                textId: null,text: document.getElementById('messageText'),audio: new Audio(),
                image: {self: Object.assign(document.getElementById('messageImage'),{width: 1920,height: 1080}),autoReset: true},
                video: Object.assign(document.getElementById('messageVideo'),{onended(){
                    gameMessage.option.ended = true,gameManager.bgm.loader(gameManager.bgm.tempSrc,true),
                    gameMessage.self.classList.remove('disappear'),this.classList.add('disappear');
                }}),
                reset(){
                    const image = this.image.self;
                    image.classList.add('disappear'),this.video.classList.add('disappear'),clearCanvas(image);
                    this.text.textContent = '',clearMedia(this.video),clearMedia(this.audio);
                },
                /**
                 * 
                 * @param {String | undefined} text 
                 * @param {String | undefined} audioUrl 
                 * @param {String | undefined} imageUrl 
                 * @param {String | undefined} videoUrl 
                 */
                loader(text,audioUrl,imageUrl,videoUrl){
                    const autoReset = this.image.autoReset,image = this.image.self;
                    this.video.volume = this.audio.volume = configArray.globalArray.globalVolume * configArray.globalArray.dialogue,
                    this.textId && clearInterval(this.textId),this.textId = null,
                    text && (text = Array.from(text),this.textId = setInterval(()=>(
                        this.text.textContent += text.shift() || (clearInterval(this.textId),''),
                        this.self.scrollTo({top:this.self.scrollHeight,behavior:'smooth'})
                    ), configArray.globalArray.textSep)),
                    imageUrl && (image.classList.remove('disappear'),getImage(imageUrl).then(value=>(
                        value && (autoReset ? clearCanvas(image) : image.getContext('2d')).drawImage(value,0,0)
                    ))),
                    videoUrl && (this.video.src = videoUrl,this.video.play().then(()=>(
                        gameManager.bgm.self.pause(),gameMessage.self.classList.add('disappear'),this.video.classList.remove('disappear')
                    ),e=>console.error(e))),
                    audioUrl && (this.audio.src = audioUrl,this.audio.play());
                }
            }
        };
        {
            // option 阅读选项
            // .ended 对话结束标识
            // .dialogue 对话选项总元素
            // .choice 分支选项总元素
            // .choiceArray 分支选项子元素集合
            // .setChoiceArray() 设置对话分支选项
            const option = gameMessage.option = {
                ended: true,finallyFn: null,choiceArray: null,
                dialogue: document.getElementById('messageDialogue'),
                choice: document.getElementById('messageChoice'),
                reset(){
                    this.choice.classList.add('disappear'),this.dialogue.classList.remove('disappear');
                    for(var i of Array.from(this.choice.children)){i.remove();}
                },
                /**
                 * 
                 * @param {{string: any}} choiceArray 
                 * @param {Function | undefined} finallyFn 
                 */
                setChoiceArray(choiceArray,finallyFn){
                    const isEnded = gameManager.dialogueProcess.nowFn = ()=>this.ended ? this.finallyFn || (()=>{gameMessage.closer();}) : isEnded;
                    this.ended = false,finallyFn && (this.finallyFn = finallyFn),gameManager.playerMove.paused = true;
                    for(var i of Object.keys(choiceArray)){
                        this.choice.insertAdjacentElement('beforeend',makeElement('div',{textContent: i,onclick: choiceArray[i]}));
                    }
                    this.choiceArray[0] && (this.dialogue.classList.add('disappear'),this.choice.classList.remove('disappear'));
                }
            };
            option.choiceArray = option.choice.children;
        }
    }
    
    {
        // 交互设置
        const constArray = {};
        // document.onmousemove = e=>{const gameTip = window.gameManager.gameBody.gameTip;gameTip.tipFn(e,false);};
        document.addEventListener('scroll',e=>{
            // scroll2view
            const limit = getWindowWidth() * .5625 - getWindowHeight();
            limit < document.documentElement.scrollTop && window.scrollTo(0,limit);
        },true);
        document.addEventListener('click',e=>{
            // 三维click2move
            var temp = e.target;
            switch(temp.parentElement.parentElement?.id){
                case 'gameMapBoard':{
                    const previous = [
                        (temp = gameManager.gameMap.board.array.indexOf(temp)) % mapWidth,
                        ~~(temp / mapWidth),
                        gameManager.gamePlayer.xyz[2]
                    ];
                    (!gameManager.gameMap.board.zone || gameManager.gameMap.board.zone[previous[1]][previous[0]])
                    && gameManager.gamePlayer.loader(gameManager.gamePlayer.id,previous).then(()=>gameManager.gamePlayer.focus());
                    break;
                }
                default:;
            }
        },true);
        document.addEventListener('click',e=>{
            // 二维click2move
            var temp = e.target;
            switch(temp.parentElement.id){
                case 'SL':{
                    gameManager.gameInfoSL.temp = gameManager.gameFileSL.origin[gameManager.gameInfoSL.index = temp.textContent.at(-1)];
                    Array.prototype.forEach.call(gameManager.gameFileSL.array,x=>x.classList.remove('focus'));
                    temp.classList.add('focus');
                    gameManager.gameInfoSL.shower();
                    break;
                }
                case 'option':{
                    Array.prototype.forEach.call(gameManager.gameBody.menuBoard.self.children,x=>x.classList.add('disappear'));
                    switch(temp = temp.id){
                        case 'importGame':gameManager.gameFileSL.importFileSL();break;
                        case 'exportGame':{
                            const link = document.createElement('a');
                            confirm('即将下载json存档文件！是否继续？') && (
                                link.href = window.URL.createObjectURL(
                                    new Blob([JSON.stringify(gameManager.gameFileSL.origin,null,'\t')],{type:'application/json'})
                                ),link.download = 'save.json',link.click()
                            ),window.URL.revokeObjectURL(link.href);
                            break;
                        }
                        case 'resetGame':confirm('即将删除浏览器内的存档并刷新游戏！是否继续？') && (localStorage.clear(),location.reload());break;
                        case 'title':if(!confirm('是否显示操作说明？')){break;}
                        default:gameManager.gameBody.menuBoard[temp].self.classList.remove('disappear');
                    }
                    break;
                }
                default:;
            }
            gameManager.clickAudio.currentTime = 0,gameManager.clickAudio.play();
        },true);
        document.addEventListener('click',e=>{
            // 一维click2move
            var temp = e.target;
            switch(temp.id){
                case 'messageImage':;break;
                case 'messageVideo':;break;
                case 'messageNext':gameManager.gameMessage.option.ended = true;break;
                case 'messageAuto':{
                    let previousTextLength = 0,nowTextLength;
                    const nowText = gameManager.gameMessage.content.text,
                    autoDialogue = gameManager.globalProcess.nowFn = ()=>(
                        nowTextLength = nowText.textContent.length,
                        !gameManager.gameMessage.self.className && !gameManager.gameMessage.option.dialogue.className
                        ? previousTextLength === nowTextLength ? (gameManager.gameMessage.option.ended = true,previousTextLength = 0)
                        : (previousTextLength = nowTextLength,autoDialogue) : null
                    )
                    break;
                }
                case 'messageSkip':{
                    const skipDialogue = gameManager.globalProcess.nowFn = ()=>(
                        !gameManager.gameMessage.self.className && !gameManager.gameMessage.option.dialogue.className
                        && (gameManager.gameMessage.option.ended = true,skipDialogue)
                    );
                    break;
                }
                case 'messageNormal':gameManager.globalProcess.nowFn = null;break;
                case 'loadSL':gameManager.gameInfoSL.loader();break;
                case 'saveSL':gameManager.gameInfoSL.index !== '0' ? gameManager.gameInfoSL.saver() : alert('！！！自动存档不支持写入！！！');break;
                case 'deleteSL':gameManager.gameInfoSL.index !== '0' ? gameManager.gameInfoSL.deleter() : alert('！！！自动存档不支持删除！！！');break;
                case 'config':{
                    for(let i of Object.keys(configArray.globalArray)){
                        temp = [configArray.globalArray[i],gameManager.gameBody.menuBoard.config[i],null];
                        temp[2] = temp[1].nextElementSibling;
                        switch(i){
                            case 'textSep':temp[1].textContent = 100 / temp[0];temp[2].scrollTop = (Math.log10(temp[0]) - 1) * 1000;break;
                            case 'modeHard':temp[1].textContent = temp[0];temp[2].scrollTop = (10 - temp[0]) * 100;break;
                            case 'worldSpeed':temp[1].textContent = temp[0] / 30;temp[2].scrollTop = (6 - temp[0] / 30) * 200;break;
                            default:temp[1].textContent = temp[0] * 100;temp[2].scrollTop = (1 - temp[0]) * 1000;
                        }
                    }
                    break;
                }
                case 'saveConfig':{
                    for(let i of Object.keys(configArray.globalArray)){
                        temp = gameManager.gameBody.menuBoard.config[i];
                        switch(i){
                            case 'textSep':configArray.globalArray[i] = 100 / +temp.textContent;break;
                            case 'modeHard':configArray.globalArray[i] = +temp.textContent;break;
                            case 'worldSpeed':configArray.globalArray[i] = +temp.textContent * 30;break;
                            default:configArray.globalArray[i] = +temp.textContent / 100;
                        }
                    }
                    gameManager.gameBody.menuBoard.config.loader();
                    localStorage.setItem('configArray',LZString.compress(JSON.stringify(configArray)));
                    alert('设置保存成功！');config.click();
                    break;
                }
                case 'resetConfig':{
                    // const resetArrray = [.25,.25,.25,1,100,1,0],keyArray = Object.keys(configArray.globalArray);
                    // for(var i = keyArray.length - 1;i > -1;i--){
                    //     temp = [resetArrray[i],gameManager.gameBody.menuBoard.config[keyArray[i]],null];
                    //     temp[2] = temp[1].nextElementSibling;
                    //     switch(keyArray[i]){
                    //         case 'textSep':temp[1].textContent = 100 / temp[0];temp[2].scrollTop = (Math.log10(temp[0]) - 1) * 1000;break;
                    //         case 'modeHard':temp[1].textContent = temp[0];temp[2].scrollTop = (10 - temp[0]) * 100;break;
                    //         case 'worldSpeed':temp[1].textContent = temp[0] / 30;temp[2].scrollTop = (6 - temp[0] / 30) * 200;break;
                    //         default:temp[1].textContent = temp[0] * 100;temp[2].scrollTop = (1 - temp[0]) * 1000;
                    //     }
                    // }
                    // gameManager.gameBody.menuBoard.config.loader();
                    temp = gameManager.gameBody.menuBoard.config,Object.keys(configArray.globalArray).forEach(function(key,i){
                        const temp0 = this[i],temp1 = temp[key].nextElementSibling;
                        switch(key){
                            case 'textSep':temp1.scrollTop = (Math.log10(temp0) - 1) * 1000;break;
                            case 'modeHard':temp1.scrollTop = (10 - temp0) * 100;break;
                            case 'worldSpeed':temp1.scrollTop = (6 - temp0 / 30) * 200;break;
                            default:temp1.scrollTop = (1 - temp0) * 1000;
                        }
                    },[.25,.25,.25,1,100,30,0]),temp.loader();
                    break;
                }
                default:console.log(temp.id);
            }
            gameManager.clickAudio.currentTime = 0,gameManager.clickAudio.play();
        },true);
        constArray.mouseenter = [['loadSL','saveSL','deleteSL','saveConfig','resetConfig'],['option','SL','messageDialogue','messageChoice']];
        document.addEventListener('mouseenter',e=>void(
            // hoverAudio
            (constArray.mouseenter[0].includes(e.target.id) || constArray.mouseenter[1].includes(e.target.parentElement?.id)) &&
            (gameManager.hoverAudio.currentTime = 0,gameManager.hoverAudio.play())
        ),true);

        document.addEventListener('keydown',e=>{
            // key2move
            if(gameManager.gameBody.menu.className){
                const moveD = gameManager.constTemp.moveDiraction,key = e.key.toLowerCase();
                'sawd'.includes(key) && (moveD[key][2] ||= --moveD._);
            }
        },true);
        document.addEventListener('keyup',e=>{
            // stop&sth.
            const moveD = gameManager.constTemp.moveDiraction,temp = e.key.toLowerCase();
            moveD[temp] && (moveD[temp][2] = 0,moveD._ = Math.min(moveD.a[2],moveD.s[2],moveD.d[2],moveD.w[2]));
            switch(temp){
                case 'c':gameManager.gamePlayer.photo.self.classList.toggle('disappear');break;
                case 'q':gameManager.gameMessage.self.classList.toggle('disappear');break;
                case 'control':gameManager.gameMap.mapID && gameManager.gameBody.menu.classList.toggle('disappear');break;
            }
        },true);
        constArray.configScroll = function(e){
            // scroll2set
            const configStage = e.target.previousElementSibling;
            switch(e.target.parentElement.id){
                case 'textSep':configStage.textContent = (10 ** (1 - e.target.scrollTop / 1000)).toFixed(1);break;
                case 'modeHard':configStage.textContent = 10 - ~~(e.target.scrollTop / 100);break;
                case 'worldSpeed':configStage.textContent = ~~(6 - e.target.scrollTop / 200);break;
                default:configStage.textContent = 100 - ~~(e.target.scrollTop / 10);
            }
        }
        for(let element of document.querySelectorAll('.scrollDiv')){element.onscroll = constArray.configScroll;}
    }
    console.log('请无视图片请求报错，此为fn.js: getImage()函数的容错。');
    gameManager.makePromise(()=>{gameManager.gameBody.self.animate([{marginLeft:'0',marginTop:'0'}],gameManager.constTemp.moveConfig);});
    
    return gameManager.completeSelf('main1.js');
}