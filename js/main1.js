window.onload = ()=>{
    // 设置全局的函数、常量和变量
    // gameManager 游戏元素管理员，其属性包含了所有游戏元素
    // 大多数游戏元素都有self属性以指向其本体HTMLElement

    // gameManager 游戏管理者，游戏基框架的集合对象
    // .gameTip 布尔值，表示游戏提示元素是否显现，请勿修改！
    // .constTemp 游戏常量对象集合
    // .hoverAudio 鼠标移动至选项而使用的音频元素
    // .clickAudio 鼠标点击而使用的音频元素
    // .bgm 背景音乐使用的音频元素
    // .globalProcess ... .playerMove 预定的四个游戏循环计时器参考对象
    // .setGameInterval() 设置游戏循环计时器的ID
    // .bgs() 一次性地使用游戏音效
    const gameManager = window.gameManager = {
        gameTip: false,
        promiseArray:[],
        constTemp: {
            memory: null,tempImageArray: new Map(),tempAudioArray: new Map(),
            moveDiraction: {_: 0,s: [0,1,0],a: [-1,0,0],w: [0,-1,0],d: [1,0,0]},tempCanvas: makeElement('canvas',{width: 1920,height: 1080}),
            moveKeyframes: [{translate: null}],gameBodyKeyframes: [{translate: null}],moveConfig: {duration: 66,fill: 'forwards'}
        },
        hoverAudio: new Audio('./audio/1.ogg'),clickAudio: new Audio('./audio/Cancel2.ogg'),bgm: new Audio(),
        globalProcess:{intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        dialogueProcess:{intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        tempProcess:{intervalID: null,timeSep: null,paused: false,onEvent: null,nowFn: null,defaultFn: null},
        playerMove:{
            intervalID: null,timeSep: null,paused: true,onEvent: null,nowFn: null,
            promise: false,moveD: 0,step: 0,
            async stepFn(){return getImage(memoryHandle('characterArray.'+gameManager.gamePlayer.id+'.display')).then(value=>(
                clearCanvas(gameManager.gamePlayer.display).drawImage(value,-this.step * 120,-this.moveD * 120),this.step && this.step--
            ))},
            defaultFn(){
                var temp,i;
                const moveD = gameManager.constTemp.moveDiraction;
                if(gameManager.gamePlayer.id !== null && moveD._){
                    const previous = gameManager.gamePlayer.xyz.concat();
                    for(this.moveD = 0;this.moveD < 4;this.moveD++){
                        if(
                            (
                                (temp = moveD['sawd'[this.moveD]])[2] === moveD._ ? temp[i = 0]
                                ? previous[0] = Math.min(Math.max(0,gameManager.gamePlayer.xyz[0] + temp[0]),limitWidth)
                                : previous[i = 1] = Math.min(Math.max(0,gameManager.gamePlayer.xyz[1] + temp[1]),limitHeight)
                                : null
                            ) !== null
                        ){break;}
                    }
                    previous[i] !== gameManager.gamePlayer.xyz[i] && gameManager.gameMap.onDirectionEvent(previous) &&
                    (!gameManager.gameMap.board.zone || gameManager.gameMap.board.zone[previous[1]][previous[0]]) ? (
                        this.promise = gameManager.gamePlayer.loader(gameManager.gamePlayer.id,previous,true).
                        then(()=>gameManager.gameMap.onPointEvent(previous)),this.step = 3
                    ) : void this.stepFn();
                }
            }
        },
        makePromise(fn){this.promiseArray.push(new Promise(resolve=>setTimeout(()=>resolve(fn?.()))));},
        setGameInterval(type,timeSep,exMode = 0){
            const temp = gameManager[type] ??= {intervalID: null,timeSep: null,paused: false,onEvent: ()=>{},nowFn: null};
            exMode && (temp.promise ??= false),exMode > 1 && (temp.step ??= 0),
            (timeSep = +timeSep) !== 0 && isFinite(timeSep) && timeSep !== temp.timeSep && (
                temp.timeSep = timeSep,temp.intervalID?.constructor === Number && clearInterval(temp.intervalID),
                temp.intervalID = setInterval(
                    !exMode-- ? async()=>temp.paused || (temp.onEvent?.(),(temp.nowFn &&= temp.nowFn?.() ?? null) || temp.defaultFn?.())
                    : !exMode-- ? async()=>temp.paused || (
                        temp.promise = await temp.promise ?? false,
                        temp.onEvent?.(),(temp.nowFn &&= temp.nowFn?.() ?? null) || temp.defaultFn?.()
                    ) : !exMode-- ? async()=>temp.paused || temp.promise && await temp.stepFn?.() || (
                        temp.promise = await temp.promise ?? false,
                        temp.onEvent?.(),(temp.nowFn &&= temp.nowFn?.() ?? null) || temp.defaultFn?.()
                    ) : ()=>(clearInterval(temp.intervalID),console.error('=> Wrong exMode when setGameInterval !')),
                    timeSep
                )
            )
            return temp;
        },
        bgs(audioUrl){getAudio(audioUrl).then(value=>(
            value.currentTime = 0,value.volume = configArray.globalArray.globalVolume * configArray.globalArray.bgs,
            value.onended = ()=>clearMedia(value),value.play()
        ));}
    };
    gameManager.constTemp.tempImageArray.set('tempCanvas',gameManager.constTemp.tempCanvas);
    gameManager.makePromise(()=>(
        // 设置循环计时器
        gameManager.setGameInterval('globalProcess',100),gameManager.setGameInterval('playerMove',16,2),
        gameManager.setGameInterval('dialogueProcess',66),gameManager.setGameInterval('tempProcess',100),null
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
    console.log(0);
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
                        this.applyVolume();
                    },
                    applyVolume(){
                        gameManager.gameMessage.content.video.volume = gameManager.gameMessage.content.audio.volume =
                        configArray.globalArray.globalVolume * configArray.globalArray.dialogue,
                        gameManager.bgm.volume = configArray.globalArray.globalVolume * configArray.globalArray.bgm,
                        gameManager.hoverAudio.volume = gameManager.clickAudio.volume = configArray.globalArray.globalVolume * configArray.globalArray.bgs;
                    }
                }
            }
        };
        gameBody.gameTip.style = temp.style;
        (temp = Array.from(gameBody.menuBoard.config.self.children)).shift();
        for(let element of temp){gameBody.menuBoard.config[element.id] = element.children[1];}
        gameManager.makePromise(()=>{gameBody.menuBoard.openGame = {self: gameManager.gameFileSL.self},gameBody.menuBoard.config.loader()});
    }
    console.log(1);
    {
        // gameMap 游戏地图
        // .mapConcat 地图元素集合
        // .loader() 加载地图
        // .onDirectionEvent() 检测某位置的前进方向是否触发什么事件
        // .onPointEvent() 检测某位置触发什么事件
        const gameMap = gameManager.gameMap = {
            mapID: null,
            mapConcat: Array.from(document.getElementsByClassName('mapImg')),
            loader(mapID){
                var imgUrl = memoryHandle('mapDataArray.'+(gameManager.gameFileSL.origin[0].mapID = this.mapID = mapID)+'.0');
                getImage(imgUrl).then(value=>{
                    if(value){for(imgUrl = 0;imgUrl < 4;imgUrl++){
                        clearCanvas(this.mapConcat[imgUrl]).drawImage(value,0,-imgUrl * mapRealHeight);
                    }}else{console.error('=> Wrong map imgUrl: '+mapImageUrl);}
                });
                gameManager.globalProcess.nowFn = objectArray.eventArray.get(memoryHandle('mapDataArray.'+mapID+'.4'))?.[1];
            },
            onDirectionEvent(xyz){
                nodeArrayLoop:for(var nodeCharacter of this.objectManager.nodeArray){
                    var temp = nodeCharacter.xyz,i;
                    for(i = 0;i < 3;i++){if(temp[i] !== xyz[i]){continue nodeArrayLoop;}}
                    objectArray.eventArray.get(memoryHandle('characterArray.'+(temp = nodeCharacter.id)+'.selfEvent') || '0')[1](temp);
                    return memoryHandle('characterArray.'+temp+'.zone');
                };
                return true;
            },
            onPointEvent(xyz){
                mapEventLoop:for(var eventInfo of memoryHandle('mapDataArray.'+this.mapID+'.3')){
                    for(var i = 0;i < 3;i++){if(eventInfo[i] !== xyz[i] && eventInfo[i] !== null){continue mapEventLoop;}}
                    objectArray.eventArray.get(eventInfo[3])[1]();
                    return true;
                }
                return false;
            }
        };
        for(let i of gameMap.mapConcat){i.style.zIndex = i.id[3];[i.width,i.height] = [singleStepLength * mapWidth,singleStepLength * mapHeight];}
        {
            // mapBoard 地图面板
            // .zone 地图通行区域
            // .array 单位区块子元素集合
            // .loader() 加载地图通行区域
            const mapBoard = gameMap.board = {
                self: document.getElementById('gameMapBoard'),array: [],zone: null,
                loader(boardZoneArray){
                    this.zone = [];
                    for(let i of Object.keys(boardZoneArray)){
                        this.zone[i] = Array.from(boardZoneArray[i].toString(2)).map(i=>+i).reverse();
                        for(let j = mapWidth-1; j >= 0; j--){this.zone[i][j] = !this.zone[i][j];}
                    }
                }
            };
            for(let i = mapHeight; i > 0; i--){
                let temp = mapBoard.self.insertAdjacentElement('beforeend',document.createElement('div'));
                for(let i = mapWidth; i > 0; i--){
                    mapBoard.array.push(temp.insertAdjacentElement('beforeend',document.createElement('div')));
                }
            }
            mapBoard.self.style.width = gameMap.mapConcat[0].width+'px';
            mapBoard.self.classList.remove('disappear');
        }
        {
            // mapObjectManager 地图对象管理者，地图上的对象集合
            // .array 地图对象集合
            // .nodeArray 地图对象元素集合
            // .nodeTemp 地图对象元素模板
            // .loader() 加载地图对象
            const objectManager = gameMap.objectManager = {
                nodeArray: [],
                nodeTemp: makeElement('div',{className: 'mapObject'}),
                characterLoader(characterInfoArray){
                    var i,object;for(i of this.nodeArray){i.self.remove();}
                    this.nodeArray = [];
                    for(object of characterInfoArray){
                        this.nodeArray.push(i = Object.assign(
                            {},gameManager.gamePlayer,{id: null,xyz: [],self: this.nodeTemp.cloneNode(true),photo: null}
                        ));
                        i.loader(object.id,object.xyz);
                        gameManager.gamePlayer.self.insertAdjacentElement('beforebegin',i.self);
                    }
                }
            };
            objectManager.nodeTemp.insertAdjacentHTML('beforeend','<canvas height="120" width="120"></canvas>');
        }
    }
    console.log(2);
    {
        // gamePlayer 游戏主角
        // .id 主角编号
        // .display 显现元素<canvas>
        // .xyz 主角方位
        // .loader() 加载主角方位
        // .focus() 聚焦主角方位
        const gamePlayer = gameManager.gamePlayer = {
            id: null,xyz: [],display: null,self: document.getElementById('player'),
            loader(id,xyz,isFocus = false){
                const moveKeyframe = gameManager.constTemp.moveKeyframes[0];
                this.id !== id && (
                    this.id = id,
                    this.display = this.self.firstChild,
                    getImage(memoryHandle('characterArray.'+id+'.display')).then(value=>(
                        value ? clearCanvas(this.display).drawImage(value,0,0) : console.error('=> Wrong character display: '+mapImageUrl)
                    ))
                ),
                xyz && (
                    [this.xyz[0],this.xyz[1],this.xyz[2]] = xyz,
                    (!this.self.style.zIndex || +this.self.style.zIndex !== xyz[2]) && (this.self.style.zIndex = String(xyz[2])),
                    moveKeyframe.translate = `${xyz[0] * singleStepLength}px ${xyz[1] * singleStepLength}px 0px`
                ),
                isFocus && this.focus(),
                this === gamePlayer && (
                    gameManager.gameFileSL.origin[0].id = id,
                    this.photo.loader(memoryHandle('characterArray.'+id+'.photo')),
                    xyz && gameManager.gameMap.board.loader(memoryHandle('mapDataArray.'+gameManager.gameMap.mapID+'.1')[xyz[2]])
                );
                return this.self.animate(moveKeyframe,gameManager.constTemp.moveConfig).finished;
            },
            focus(){
                const windowWidth = getWindowWidth(),windowHeight = windowWidth * 9/16;
                const gameBodyKeyframes = gameManager.constTemp.gameBodyKeyframes[0];
                gameBodyKeyframes.translate = -Math.min(
                    Math.max(0,singleStepLength * this.xyz[0] - (windowWidth - singleStepLength) / 2),
                    mapRealWidth - windowWidth
                )+'px '+ -Math.min(
                    Math.max(0,singleStepLength * this.xyz[1] - (windowHeight - singleStepLength) / 2),
                    mapRealHeight - windowHeight
                )+'px 0px';
                gameManager.gameBody.self.animate(gameBodyKeyframes,gameManager.constTemp.moveConfig);
            }
        };
        gamePlayer.self.insertAdjacentElement("beforeend",makeElement('canvas',{width: 120,height: 120}));
        {
            // photo 立绘
            const photo = gamePlayer.photo = {
                self: document.getElementById('playerPhoto'),
                loader(imageUrl){getImage(imageUrl).then(value=>clearCanvas(this.self).drawImage(value,0,0));}
            };
            [photo.self.width,photo.self.height] = [720,2025];
        }
    }
    console.log(3);
    {
        // gameFileSL 游戏存档
        // .origin 存档管理元素
        // .array 存档元素的子元素集合
        // .importFileSL() 加载存档元素的子元素集合
        const gameFileSL = gameManager.gameFileSL = {
            self: document.getElementById('SL'),
            origin: JSON.parse(LZString.decompress(localStorage.getItem('saveDataArray'))),
            importFileSL(){
                const tempFile = document.createElement('input');
                [tempFile.type,tempFile.accept] = ['file','application/json'];
                tempFile.onchange = ()=>{
                    const reader = new FileReader();
                    reader.readAsText(tempFile.files[0]);
                    reader.onload = ()=>{
                        this.origin = JSON.parse(reader.result);
                        localStorage.setItem('saveDataArray',LZString.compress(reader.result));
                    }
                }
                this.self.classList.remove('disappear');
                gameManager.gameInfoSL.self.classList.add('disappear');
                tempFile.click();
            }
        };
        gameFileSL.array = gameFileSL.self.children;
        for(let i of Object.keys(gameFileSL.origin)){
            gameFileSL.self.insertAdjacentElement('beforeend',makeElement('div',{textContent: (i === '0' ? '自动存档' : '手动存档')+i}));
        }
    }
    console.log(5);
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
            self: document.getElementById('infoSL'),index: null,temp: null,
            saveDataTemp: {
                mapID: '001',id: 0,xyz: [16,9,0],partner: [],switch: [],record: {},
                memory: {itemList: {onceArray: {},twiceArray: {},onfitArray: {}},characterArray: {1:{selfEvent: '4'}},mapDataArray: {}}
            },
            shower(){
                this.stage.textContent = this.index === '0' ? '（自动更新，只读）当前信息：' : '信息：';
                if(gameManager.gameInfoSL.temp){
                    for(var i of Object.values(this.temp)){this.stage.textContent += '\n'+String(i);}
                }else{this.stage.textContent += '\n'+'NULL'}
                this.self.classList.remove('disappear');
            },
            loader(){
                var temp = this.temp || this.saveDataTemp;
                gameManager.constTemp.memory = (gameManager.gameFileSL.origin[0] = Object.assign(copyObj(temp),{xyz: gameManager.gamePlayer.xyz})).memory;
                gameManager.gameMap.loader(temp.mapID);
                gameManager.gameMap.board.loader(memoryHandle('mapDataArray.'+temp.mapID+'.1')[temp.xyz[2]]);
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
                    this.temp = gameManager.gameFileSL.origin[this.index] = 0,
                    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin))),
                    this.shower()
                ) : alert('已取消操作。');
            }
        }
        gameInfoSL.stage = gameManager.gameInfoSL.self.querySelector('pre');
        gameManager.setGameInterval('autoSL',3e5).onEvent = ()=>{
            gameManager.gameMap.mapID && localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)));
        };
    }
    console.log(6);
    {
        // gameMessage 游戏消息
        // .loader() 加载
        // .*.reset() 重置
        // .*.loader() 加载
        // .closer() 关闭
        const gameMessage = gameManager.gameMessage = {
            self: document.getElementById('gameMessage'),
            loader(senderObject = {},contentObject = {},choiceArray = {},finallyFn){
                this.closer();
                gameManager.playerMove.paused = true;
                this.sender.loader(senderObject.name,senderObject.faceUrl);
                this.content.loader(contentObject.text,contentObject.audioUrl,contentObject.imageUrl,contentObject.videoUrl);
                this.option.setChoiceArray(choiceArray,finallyFn);
                this.self.classList.remove('disappear');
            },
            closer(){
                this.self.classList.add('disappear');
                gameManager.playerMove.paused = false;
                this.sender.reset(),this.content.reset(),this.option.reset();
            }
        };
        {
            // sender 发送人
            // .name 名字
            // .face 表情
            const sender = gameMessage.sender = {
                self: document.getElementById('messageSenderInfo'),
                name: document.getElementById('messageSenderName'),
                face: document.getElementById('messageSenderStage'),
                reset(){this.name.textContent = '',clearCanvas(this.face);},
                loader(name,faceUrl){
                    name && (this.name.textContent = name),getImage(faceUrl).then(value=>(
                        value ? sender.face.getContext('2d').drawImage(value,0,0) : faceUrl && console.error('=> Wrong faceUrl :'+faceUrl)
                    ));
                }
            };
            sender.face.width = sender.face.height = 300;
        }
        {
            // content 内容
            // .textId 文本循环器ID
            // .text 文本
            // .image 图片对象
            // .video 视频
            // .audio 音频
            const content = gameMessage.content = {
                self: document.getElementById('messageContent'),
                textId: null,text: document.getElementById('messageText'),
                image: {self: document.getElementById('messageImage'),autoReset: true},
                video: document.getElementById('messageVideo'),audio: new Audio(),
                reset(){
                    const temp0 = this.image.self,temp1 = temp0.getContext('2d');
                    temp0.classList.add('disappear'),this.video.classList.add('disappear');
                    temp1.clearRect(0,0,temp0.width,temp0.height),temp1.closePath();
                    this.text.textContent = '',clearMedia(this.video),clearMedia(this.audio);
                },
                loader(text,audioUrl,imageUrl,videoUrl){
                    const autoReset = this.image.autoReset,temp0 = content.image.self,temp1 = temp0.getContext('2d');
                    this.video.volume = this.audio.volume = configArray.globalArray.globalVolume * configArray.globalArray.dialogue,
                    this.textId && clearInterval(this.textId),this.textId = null,
                    text && (text = Array.from(text),this.textId = setInterval(()=>(
                        this.text.textContent += text.shift() || (clearInterval(this.textId),''),
                        this.self.scrollTo({top:this.self.scrollHeight,behavior:'smooth'})
                    ), configArray.globalArray.textSep)),
                    imageUrl && (temp0.classList.remove('disappear'),getImage(imageUrl).then(value=>(
                        autoReset && (temp1.clearRect(0,0,temp0.width,temp0.height),temp1.closePath()),value && temp1.drawImage(value,0,0)
                    ))),
                    videoUrl && (this.video.src = videoUrl,this.video.classList.remove('disappear')),
                    audioUrl && (this.audio.src = audioUrl,this.audio.play());
                }
            };
            [content.image.self.width,content.image.self.height] = [1920,1080],
            content.video.oncanplay = function(){this.play(),this.classList.remove('disappear');};
            content.video.onended = function(){gameMessage.option.ended = true,this.classList.add('disappear');};
        }
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
                    this.choice.classList.add('disappear');
                    this.dialogue.classList.remove('disappear');
                    for(var i of Array.from(this.choice.children)){i.remove();}
                },
                setChoiceArray(choiceArray,finallyFn){
                    this.ended = false;
                    finallyFn && (this.finallyFn = finallyFn);
                    const isEnded = gameManager.dialogueProcess.nowFn = ()=>(this.ended ? this.finallyFn || (()=>{gameMessage.closer();}) : isEnded);
                    gameManager.playerMove.paused = true;
                    for(var i of Object.keys(choiceArray)){
                        this.choice.insertAdjacentElement('beforeend',makeElement('div',{textContent: i,onclick: choiceArray[i]}));
                    }
                    this.choiceArray[0] && (this.dialogue.classList.add('disappear'),this.choice.classList.remove('disappear'));
                }
            };
            option.choiceArray = option.choice.children;
        }
    }
    console.log(7);
    
    {
        // 交互设置
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
                        Math.floor(temp / mapWidth),
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
                    const nowText = gameManager.gameMessage.content.text;
                    let previousTextLength = 0,nowTextLength;
                    const autoDialogue = gameManager.globalProcess.nowFn = ()=>(
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
                            default:configArray.globalArray[i] = +temp.textContent / 100;
                        }
                    }
                    gameManager.gameBody.menuBoard.config.loader();
                    localStorage.setItem('configArray',LZString.compress(JSON.stringify(configArray)));
                    alert('设置保存成功！');config.click();
                    break;
                }
                case 'resetConfig':{
                    const resetArrray = [0.2,1,1,1,100,0].reverse();
                    for(let i of Object.keys(configArray.globalArray)){
                        temp = [resetArrray.pop(),gameManager.gameBody.menuBoard.config[i],null];
                        temp[2] = temp[1].nextElementSibling;
                        switch(i){
                            case 'textSep':temp[1].textContent = temp[0];temp[2].scrollTop = (Math.log10(temp[0]) - 1) * 1000;break;
                            case 'modeHard':temp[1].textContent = temp[0];temp[2].scrollTop = (10 - temp[0]) * 100;break;
                            default:temp[1].textContent = temp[0] * 100;temp[2].scrollTop = (1 - temp[0]) * 1000;
                        }
                    }
                    gameManager.gameBody.menuBoard.config.loader();
                    break;
                }
                default:console.log(temp.id);
            }
            gameManager.clickAudio.currentTime = 0,gameManager.clickAudio.play();
        },true);
        document.addEventListener('mouseenter',e=>{
            // hoverAudio
            if(
                ['loadSL','saveSL','deleteSL','saveConfig','resetConfig'].includes(e.target.id) ||
                ['option','SL','messageDialogue','messageChoice'].includes(e.target.parentElement?.id)
            ){gameManager.hoverAudio.currentTime = 0,gameManager.hoverAudio.play();}
        },true);

        document.addEventListener('keydown',e=>{
            // key2move
            if(gameManager.gameBody.menu.className){
                const moveD = gameManager.constTemp.moveDiraction;
                switch(e.key.toLowerCase()){
                    case 'a':moveD.a[2] ||= --moveD._;break;
                    case 's':moveD.s[2] ||= --moveD._;break;
                    case 'd':moveD.d[2] ||= --moveD._;break;
                    case 'w':moveD.w[2] ||= --moveD._;break;
                }
            }
        },true);
        document.addEventListener('keyup',e=>{
            // stop&sth.
            var temp = e.key.toLowerCase();
            const moveD = gameManager.constTemp.moveDiraction;
            moveD[temp] && (moveD[temp][2] = 0,moveD._ = Math.min(moveD.a[2],moveD.s[2],moveD.d[2],moveD.w[2]));
            switch(temp){
                case 'c':gameManager.gamePlayer.photo.self.classList.toggle('disappear');break;
                case 'q':gameManager.gameMessage.self.classList.toggle('disappear');break;
                case 'control':gameManager.gameBody.menu.classList.toggle('disappear');break;
                case ' ':if((temp = gameManager.gameMessage.content.video).src){temp.controls = !temp.controls;}break;
            }
        },true);
        Promise.resolve(function(e){
            // scroll2set
            const configStage = e.target.previousElementSibling;
            switch(e.target.parentElement.id){
                case 'textSep':configStage.textContent = (10 ** (1 - e.target.scrollTop / 1000)).toFixed(1);break;
                case 'modeHard':configStage.textContent = 10 - Math.floor(e.target.scrollTop / 100);break;
                default:configStage.textContent = 100 - Math.floor(e.target.scrollTop / 10);
            }
        }).then(fn=>Array.prototype.forEach.call(document.querySelectorAll('.scrollDiv'),element=>element.onscroll = fn));
    }
    console.clear();console.log('请无视图片请求报错，此为fn.js: getImage()函数的容错。');
    gameManager.makePromise(()=>{gameManager.gameBody.self.animate([{marginLeft:'0',marginTop:'0'}],gameManager.constTemp.moveConfig);});
    return Promise.all(gameManager.promiseArray);
}