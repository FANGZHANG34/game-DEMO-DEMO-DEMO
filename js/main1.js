window.onload = function(){
    // 设置全局的函数、常量和变量
    // gameManager 游戏元素管理员，其属性包含了所有游戏元素
    // 大多数游戏元素都有self属性以指向其本体HTMLElement

    // gameManager 游戏管理者，游戏基框架的集合对象
    // .setGameInterval 设置游戏循环计时器的ID
    const gameManager = window.gameManager = {
        moveDiraction: {},
        setGameInterval(type,timeSep){
            let temp;
            if(!gameManager[type]){gameManager[type] = {intervalID: undefined,timeSep: undefined,paused: false,onEvent: ()=>{},nowFn: undefined};}
            temp = gameManager[type];
            timeSep = +timeSep;
            if(timeSep !== 0 && isFinite(timeSep) && timeSep !== temp.timeSep){
                temp.timeSep = timeSep;
                clearInterval(temp.intervalID);
                temp.intervalID = setInterval(()=>{
                    if(temp.paused){return;}
                    else {temp.onEvent?.();(temp.nowFn &&= temp.nowFn()) || temp.defaultFn?.();}
                },timeSep);
            }
            return temp;
        },
        globalProcess:{intervalID: undefined,timeSep: undefined,paused: false,onEvent: undefined,nowFn: undefined,defaultFn: undefined},
        dialogueProcess:{intervalID: undefined,timeSep: undefined,paused: false,onEvent: undefined,nowFn: undefined,defaultFn: undefined},
        tempProcess:{intervalID: undefined,timeSep: undefined,paused: false,onEvent: undefined,nowFn: undefined,defaultFn: undefined},
        playerMove:{
            intervalID: undefined,timeSep: undefined,paused: false,onEvent: undefined,nowFn: undefined,
            defaultFn: ()=>{
                const [limitWidth,limitHeight] = [mapWidth-1,mapHeight-1];
                let temp;
                if(gameManager.gamePlayer.id !== undefined){
                    const previous = gameManager.gamePlayer.xyz.concat();
                    if(temp = Object.values(gameManager.moveDiraction).at(-1)){
                        switch(temp[0]){
                            case 'Left': previous[0] = Math.min(Math.max(0,gameManager.gamePlayer.xyz[0] + +(temp[1]+'1')),limitWidth);break;
                            case 'Top': previous[1] = Math.min(Math.max(0,gameManager.gamePlayer.xyz[1] + +(temp[1]+'1')),limitHeight);break;
                        }
                        if(!gameManager.gameMap.board.zone || gameManager.gameMap.board.zone[previous[1]][previous[0]]){
                            if(gameManager.gameMap.onDirectionEvent(previous)){
                                gameManager.gamePlayer.loader(gameManager.gamePlayer.id,previous,'smooth');
                                gameManager.gameMap.onPointEvent(previous);
                            }
                        }
                    }
                }
            }
        }
    };
    
    // configArray 本地配置
    // singleStepLength 单位长度
    // mapWidth,mapHeight 地图相对长度
    // moveDiraction 方向
    const configArray = JSON.parse(LZString.decompress(localStorage.getItem('configArray')));
    const singleStepLength = 60;
    const [mapWidth,mapHeight] = [32,18];
    const [mapPositionWidth,mapPositionHeight] = [mapWidth * singleStepLength,mapHeight * singleStepLength];

    // *.self *的本体元素
    // *.style *的当前样式
    console.log(0);
    {
        let temp;
        // gameBody 游戏总体
        // .menu 菜单元素
        // .menuBoard 选项对应面板对象
        const gameBody = gameManager.gameBody = {
            self: document.getElementById('gameBody'),
            menu: document.getElementById('menu'),
            menuBoard: {
                self: document.getElementById('menuBoard'),
                title: {self: document.getElementById('guide')},
                characterGame: {self: document.getElementById('characterBoard')},
                gallery: {self: document.getElementById('myGallery')},
                config: {self: document.getElementById('myConfig')}
            }
        };
        (temp = Array.from(gameBody.menuBoard.config.self.children)).shift();
        for(let element of temp){
            gameBody.menuBoard.config[element.id] = element.children[1];
        }
        setTimeout(()=>gameBody.menuBoard.openGame = {self: gameManager.gameFileSL.self});
    }
    console.log(1);
    {
        // gameMap 游戏地图
        // .loader 加载地图
        // .mapConcat 地图元素集合
        const gameMap = gameManager.gameMap = {
            mapID: undefined,mapInfo: undefined,
            mapConcat: Array.from(document.getElementsByClassName('mapImg')),
            loader(mapID){
                this.mapID = mapID;
                this.mapInfo = mapDateArray.get(mapID);
                for(let i = 0; i<4; i++){
                    if(this.mapInfo[0][i]){
                        let temp = new Image();
                        temp.src = './img/'+this.mapInfo[0][i]+'.png';
                        temp.onload=()=>gameMap.mapConcat[i].getContext('2d').drawImage(temp,0,0);
                    }
                }
                gameManager.globalProcess.nowFn = this.mapInfo[4];
                setTimeout(()=>{gameManager.gameFileSL.origin[0].mapID = mapID;});
            },
            onDirectionEvent(xyz){
                for(let nodeCharacter of Object.values(this.objectManager.nodeArray)){
                    let temp = nodeCharacter.xyz.concat();
                    for(let i of xyz){if(temp.shift() !== i){return true;}}
                    (temp = this.objectManager.characterArray[nodeCharacter.id]).selfEvent && temp.selfEvent();
                    return temp.zone;
                };
                return true;
            },
            onPointEvent(xyz){
                for(let i of this.mapInfo[3]){
                    if(!((xyz[0] === null || xyz[0] === i[0]) && (xyz[1] === null || xyz[1] === i[1]) && (xyz[2] === null || xyz[2] === i[2])))
                    {continue;}else{objectArray.eventArray.get(i[3])[1]();return;}
                }
            }
        };
        for(let i of gameMap.mapConcat){i.style.zIndex = i.id[3];[i.width,i.height] = [singleStepLength * mapWidth,singleStepLength * mapHeight];}
        {
            // mapBoard 地图面板
            // .array 单位区块子元素集合
            // .zone 地图通行区域
            // .loader 加载地图通行区域
            const mapBoard = gameMap.board = {zone: undefined};
            mapBoard.self = document.getElementById('gameMapBoard');
            for(let i = mapHeight; i > 0; i--){
                let temp = mapBoard.self.insertAdjacentElement('beforeend',document.createElement('div'));
                for(let i = mapWidth; i > 0; i--){
                    temp.insertAdjacentElement('beforeend',document.createElement('div'));
                }
            }
            mapBoard.self.style.width = gameMap.mapConcat[0].width+'px';
            mapBoard.self.classList.remove('disappear');
            mapBoard.array = Array.from(mapBoard.self.querySelectorAll('div>div>div'));
            mapBoard.loader = function(boardZoneArray){
                this.zone = [];
                for(let i in boardZoneArray){
                    this.zone[i] = Array.from(boardZoneArray[i].toString(2)).map(i=>+i).reverse();
                    for(let j = mapWidth-1; j >= 0; j--){this.zone[i][j] = !this.zone[i][j];}
                }
            }
        }
        {
            // mapObjectManager 地图对象管理者，地图上的对象集合
            // .array 地图对象集合
            // .nodeArray 地图对象元素集合
            // .nodeTemp 地图对象元素模板
            // .loader 加载地图对象
            const mapObjectManager = gameMap.objectManager = {
                characterArray: undefined,nodeArray: {},
                characterLoader(characterInfoArray){
                    for(let i in this.nodeArray){this.nodeArray[i].remove();}
                    this.characterArray = {};
                    this.nodeArray = {};
                    for(let object of characterInfoArray){
                        let temp = object.id;
                        this.characterArray[temp] = objectArray.characterArray.get(temp);
                        temp = this.nodeArray[temp] = Object.assign({},gameManager.gamePlayer,{id: undefined,self: this.nodeTemp.cloneNode(true),photo: undefined});
                        temp.loader(object.id,object.xyz);
                        gameManager.gamePlayer.self.insertAdjacentElement('afterend',temp.self);
                    }
                }
            };
            {
                const nodeTemp = mapObjectManager.nodeTemp = makeElement('div',{className: 'mapObject'});
                nodeTemp.insertAdjacentHTML('beforeend','<canvas height="180" width="180" style="height: 60px; width: 60px;"></canvas>');
            }
        }
    }
    console.log(2);
    {
        // gamePlayer 游戏主角
        // .id 主角编号
        // .object 主角信息
        // .display 显现元素<canvas>
        // .xyz 主角方位
        // .loader 加载主角方位
        const gamePlayer = gameManager.gamePlayer = {
            id: undefined,xyz: undefined,object: undefined,display: undefined,self: document.getElementById('player'),
            loader(id,xyz,behavior){
                if(this.id !== id){
                    this.id = id;
                    this.object = objectArray.characterArray.get(id);
                    this.display = this.self.firstChild;
                    let temp = new Image();
                    temp.src = this.object.display;
                    temp.onload=()=>{gameManager.gameFileSL.origin[0].id = id;this.display.getContext('2d').drawImage(temp,0,0);};
                }
                if(!this.xyz || this.xyz[2] !== xyz[2]){ 
                    this.self.style.zIndex = xyz[2];
                    gameManager.gameMap.board.loader(gameManager.gameMap.mapInfo[1][xyz[2]]);
                }
                this.self.animate([{marginLeft: xyz[0] * singleStepLength+'px',marginTop: xyz[1] * singleStepLength+'px'}],{duration: 66,fill: 'both'});
                this.xyz = xyz.concat();
                behavior && setTimeout(()=>this.focus(behavior),66);
            },
            focus(behavior){
                const windowWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
                const windowHeight = windowWidth * 9/16;
                window.scrollTo({
                    left: Math.min(
                        Math.max(0,this.self.offsetLeft - (windowWidth - singleStepLength) / 2),
                        mapPositionWidth - windowWidth
                    ),
                    top: Math.min(
                        Math.max(0,this.self.offsetTop - (windowHeight - singleStepLength) / 2),
                        mapPositionHeight - windowHeight
                    ),
                    behavior: behavior
                });
            }
        };
        {
            let temp = gamePlayer.self.insertAdjacentElement("beforeend",makeElement('canvas',{width: 180,height: 180}));
            temp.style.width = temp.style.height = singleStepLength+'px';
            temp = null;
        }
        {
            // playerPhoto 立绘
            const gamePlayerPhoto = gamePlayer.photo = {
                self: document.getElementById('playerPhoto'),
                temp: new Image()
            };
            gamePlayerPhoto.content = gamePlayerPhoto.self.getContext('2d');
            gamePlayerPhoto.temp.src = './img/actor0.jpg';
            gamePlayerPhoto.temp.onload = ()=>{
                gamePlayerPhoto.self.width = 720;
                gamePlayerPhoto.self.height = 2025;
                gamePlayerPhoto.content.drawImage(gamePlayerPhoto.temp,0,0);
            }
        }
    }
    console.log(3);
    {
        // 设置循环计时器
        gameManager.setGameInterval('globalProcess',66);
        gameManager.setGameInterval('playerMove',66);
        gameManager.setGameInterval('dialogueProcess',66);
        gameManager.setGameInterval('tempProcess',100);
    }
    console.log(4);
    {
        // gameFileSL 游戏存档
        // .origin 存档管理元素
        // .array 存档元素的子元素集合
        // .importFileSL 加载存档元素的子元素集合
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
        for(let i in gameFileSL.origin){gameFileSL.self.insertAdjacentElement('beforeend',makeElement('div',{textContent: (i === '0' ? '自动存档' : '手动存档')+i}));}
    }
    console.log(5);
    {
        // gameInfoSL 当前存档对象
        // .stage 当前存档浏览
        // .temp 当前存档信息
        // .saveDataTemp 用于替代的存档信息
        // .shower 展示存档
        // .loader 加载存档
        // .saver 保存存档
        // .deleter 保存存档
        const gameInfoSL = gameManager.gameInfoSL = {
            temp: undefined,index: undefined,
            self: document.getElementById('infoSL'),
            saveDataTemp: {mapID: '001',id: 0,xyz: [16,9,0],partner: [],switch: [],memory: {characterArray: {},itemList: {},maprDateArray: {}}},
            nowInfoSL0: {mapID: undefined,id: undefined,xyz: undefined,item: undefined,partner: undefined,switch: undefined,memory: undefined},
            shower(){
                this.stage.textContent = this.index === '0' ? '当前信息（自动更新，只能读取）：' : '信息：';
                if(gameManager.gameInfoSL.temp){
                    for(let i of Object.values(this.temp)){this.stage.textContent += '\n'+String(i);}
                }else{this.stage.textContent += '\n'+'NULL'}
                this.self.classList.remove('disappear');
            },
            loader(){
                let temp = this.temp || this.saveDataTemp;
                gameManager.gameFileSL.origin[0] = null;
                gameManager.gameMap.loader(temp.mapID);
                gameManager.gameMap.board.loader(gameManager.gameMap.mapInfo[1][temp.xyz[2]]);
                gameManager.gameMap.objectManager.characterLoader(gameManager.gameMap.mapInfo[2]);
                gameManager.gamePlayer.loader(temp.id,temp.xyz,'smooth');
                gameManager.gameBody.menu.classList.add('disappear');
                gameManager.gameFileSL.origin[0] = Object.assign(copyObj(temp),{xyz:gameManager.gamePlayer.xyz});
            },
            saver(){
                if(gameManager.gameMap.mapID){
                    if(confirm('确认覆盖存档？')){
                        this.temp = gameManager.gameFileSL.origin[this.index] = copyObj(gameManager.gameFileSL.origin[0]);
                        localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)));
                        this.shower();
                    }else{alert('已取消保存。');}
                }else{alert('！！！写入失败！！！\n\n因为您未开始游玩');}
            },
            deleter(){
                if(confirm('确认删除存档？')){
                    this.temp = gameManager.gameFileSL.origin[this.index] = 0;
                    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)));
                    this.shower();
                }else{alert('已取消操作。');}
            }
        }
        gameInfoSL.stage = gameManager.gameInfoSL.self.querySelector('pre');
        gameManager.setGameInterval('autoSL',300000).onEvent = ()=>{
                if(gameManager.gameMap.mapID){
                    localStorage.setItem('saveDataArray',LZString.compress(JSON.stringify(gameManager.gameFileSL.origin)));
                }
            }
    }
    console.log(6);
    {
        // gameMessage 游戏消息
        // .loader 加载
        // .*.reset 重置
        // .*.loader 加载
        // .closer 关闭
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
                this.sender.reset();
                this.content.reset();
                this.option.reset();
            }
        };
        {
            // sender 发送人
            // .name 名字
            // .face 表情
            // .faceTemp 表情缓存
            const sender = gameMessage.sender = {
                self: document.getElementById('messageSenderInfo'),
                name: document.getElementById('messageSenderName'),
                face: document.getElementById('messageSenderStage'),
                faceTemp: new Image(),
                reset(){
                    this.name.textContent = '';
                    this.face.width = this.face.width;
                },
                loader(name,faceUrl){
                    if(name){this.name.textContent = name;}
                    if(faceUrl){this.faceTemp.src = faceUrl;}
                }
            };
            sender.face.width = sender.face.height = 300;
            sender.faceTemp.onload = ()=>{sender.face.getContext('2d').drawImage(sender.faceTemp,0,0);};
        }
        {
            // content 内容
            // .text 文本
            // .image 图片对象
            // .video 视频
            // .audio 音频
            const content = gameMessage.content = {textId: undefined};
            content.self = document.getElementById('messageContent');
            content.text = document.getElementById('messageText');
            {
                content.image = {autoReset: true};
                content.image.self = new Image();
                content.image.stage = document.getElementById('messageImage');
                [content.image.stage.width,content.image.stage.height] = [1920,1080];
                content.image.self.onload= function(){
                    // console.log(content.image.autoReset);
                    content.image.autoReset && (content.image.stage.width = content.image.stage.width);
                    content.image.stage.getContext('2d').drawImage(this,0,0);
                    content.image.stage.classList.remove('disappear');
                };
            }
            content.video = document.getElementById('messageVideo');
            content.audio = new Audio();
            content.video.addEventListener('ended',function(){this.classList.add('disappear');});
            content.reset = function(){
                this.image.stage.classList.add('disappear');
                this.video.classList.add('disappear');
                this.text.textContent = '';
                this.image.stage.width = this.image.stage.width;
                clearMedia(this.video);
                clearMedia(this.audio);
            }
            content.loader = function(text,audioUrl,imageUrl,videoUrl){
                this.video.volume = configArray.globalArray.globalVolume * configArray.globalArray.dialogueVolume;
                this.audio.volume = configArray.globalArray.globalVolume * configArray.globalArray.dialogueVolume;
                this.textId && clearInterval(this.textId);
                this.textId = undefined;
                if(text){
                    text = Array.from(text);
                    this.textId = setInterval(()=>{
                        this.text.textContent += text.shift() || (clearInterval(this.textId),'');
                        this.self.scrollTo({top:this.self.scrollHeight,behavior:'smooth'});
                    }, configArray.globalArray.textSep);
                }
                if(imageUrl){this.image.self.src = imageUrl}
                if(videoUrl){
                    this.video.src = videoUrl;
                    this.video.play();
                    this.video.classList.remove('disappear');
                }
                if(audioUrl){
                    this.audio.src = audioUrl;
                    this.audio.play();
                }
            }
        }
        {
            // option 阅读选项
            // .ended 对话结束标识
            // .dialogue 对话选项总元素
            // .choice 分支选项总元素
            // .choiceArray 分支选项子元素集合
            const option = gameMessage.option = {
                ended: true,finallyFn: undefined,choiceArray: undefined,
                dialogue: document.getElementById('messageDialogue'),
                choice: document.getElementById('messageChoice'),
                reset(){
                    this.choice.classList.add('disappear');
                    this.dialogue.classList.remove('disappear');
                    for(let i of Array.from(this.choice.children)){i.remove();}
                },
                setChoiceArray(choiceArray,finallyFn){
                    this.ended = false;
                    finallyFn && (this.finallyFn = finallyFn);
                    let isEnded = ()=>{
                        return this.ended ? this.finallyFn || (()=>{gameMessage.closer();}) : isEnded;
                    }
                    gameManager.dialogueProcess.nowFn = isEnded;
                    gameManager.playerMove.paused = true;
                    for(let i in choiceArray){
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
        document.addEventListener('click',function(e){
            // 三维click2move
            let temp;
            switch(temp = e.target.parentElement.parentElement.id){
                case 'gameMapBoard':{
                    let x = (temp = gameManager.gameMap.board.array.indexOf(e.target)) % mapWidth;
                    let y = Math.floor(temp / mapWidth);
                    if(!gameManager.gameMap.board.zone || gameManager.gameMap.board.zone[y][x]){
                        gameManager.gamePlayer.self.animate([
                            {marginLeft: (gameManager.gamePlayer.xyz[0] = x) * singleStepLength+'px',
                            marginTop: (gameManager.gamePlayer.xyz[1] = y) * singleStepLength+'px'}
                        ],{duration: 66,fill: 'both'});
                    }
                    setTimeout(()=>gameManager.gamePlayer.focus('smooth'),60);
                    break;
                }
                default:;
            }
        },true);
        document.addEventListener('click',function(e){
            // 二维click2move
            let temp;
            switch(temp = e.target.parentElement.id){
                case 'SL':{
                    gameManager.gameInfoSL.temp = gameManager.gameFileSL.origin[gameManager.gameInfoSL.index = e.target.textContent.at(-1)];
                    Array.prototype.forEach.call(gameManager.gameFileSL.array,x=>x.classList.remove('focus'));
                    e.target.classList.add('focus');
                    gameManager.gameInfoSL.shower();
                    break;
                }
                case 'option':{
                    Array.prototype.forEach.call(gameManager.gameBody.menuBoard.self.children,x=>x.classList.add('disappear'));
                    switch(temp = e.target.id){
                        case 'importGame':gameManager.gameFileSL.importFileSL();break;
                        case 'exportGame':{
                            if(confirm('即将下载json存档文件！是否继续？')){
                                const link = document.createElement('a');
                                link.href = window.URL.createObjectURL(new Blob([JSON.stringify(gameManager.gameFileSL.origin,null,'\t')],{type:'application/json'}));
                                link.download = 'save.json';
                                link.click();
                                window.URL.revokeObjectURL(link.href);
                            }
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
        },true);
        document.addEventListener('click',function(e){
            // 一维click2move
            let temp;
            switch(temp = e.target.id){
                case 'messageImage':e.target.classList.add('disappear');break;
                case 'messageVideo':;break;
                case 'messageNext':gameManager.gameMessage.option.ended = true;break;
                case 'messageAuto':{
                    const nowText = gameManager.gameMessage.content.text;
                    let previousTextLength = 0;
                    let autoDialogue = ()=>{
                        let nowTextLength = nowText.textContent.length;
                        if(!gameManager.gameMessage.self.className && !gameManager.gameMessage.option.dialogue.className){
                            if(previousTextLength === nowTextLength){
                                gameManager.gameMessage.option.ended = true;previousTextLength = 0;
                            }else{previousTextLength = nowTextLength;return autoDialogue;}
                        }
                    }
                    gameManager.globalProcess.nowFn = autoDialogue;
                    break;
                }
                case 'messageSkip':{
                    let skipDialogue = ()=>{
                        if(!gameManager.gameMessage.self.className && !gameManager.gameMessage.option.dialogue.className){
                            gameManager.gameMessage.option.ended = true;return skipDialogue;
                        }
                    }
                    gameManager.globalProcess.nowFn = skipDialogue;
                    break;
                }
                case 'messageNormal':gameManager.globalProcess.nowFn = undefined;break;
                case 'loadSL':gameManager.gameInfoSL.loader();break;
                case 'saveSL':gameManager.gameInfoSL.index !== '0' ? gameManager.gameInfoSL.saver() : alert('！！！自动存档不支持写入！！！');break;
                case 'deleteSL':gameManager.gameInfoSL.index !== '0' ? gameManager.gameInfoSL.deleter() : alert('！！！自动存档不支持删除！！！');break;
                case 'config':{
                    for(let i in configArray.globalArray){
                        temp = [configArray.globalArray[i],gameManager.gameBody.menuBoard.config[i],undefined];
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
                    for(let i in configArray.globalArray){
                        temp = gameManager.gameBody.menuBoard.config[i];
                        switch(i){
                            case 'textSep':configArray.globalArray[i] = 100 / +temp.textContent;break;
                            case 'modeHard':configArray.globalArray[i] = +temp.textContent;break;
                            default:configArray.globalArray[i] = +temp.textContent / 100;
                        }
                    }
                    localStorage.setItem('configArray',LZString.compress(JSON.stringify(configArray)));
                    alert('设置保存成功！');config.click();
                    break;
                }
                case 'resetConfig':{
                    const resetArrray = [0.2,1,1,1,100,0].reverse();
                    for(let i in configArray.globalArray){
                        temp = [resetArrray.pop(),gameManager.gameBody.menuBoard.config[i],undefined];
                        temp[2] = temp[1].nextElementSibling;
                        switch(i){
                            case 'textSep':temp[1].textContent = temp[0];temp[2].scrollTop = (Math.log10(temp[0]) - 1) * 1000;break;
                            case 'modeHard':temp[1].textContent = temp[0];temp[2].scrollTop = (10 - temp[0]) * 100;break;
                            default:temp[1].textContent = temp[0] * 100;temp[2].scrollTop = (1 - temp[0]) * 1000;
                        }
                    }
                    break;
                }
                default:console.log(temp);
            }
        },true);

        document.addEventListener('keydown',function(e){
            // key2move
            if(gameManager.gameBody.menu.className){
                switch(e.key){
                    case 'a':gameManager.moveDiraction.a = ['Left','-'];break;
                    case 's':gameManager.moveDiraction.s = ['Top','+'];break;
                    case 'd':gameManager.moveDiraction.d = ['Left','+'];break;
                    case 'w':gameManager.moveDiraction.w = ['Top','-'];break;
                }
            }
        },true);
        document.addEventListener('keyup',function(e){
            // stop&sth.
            let temp;
            delete gameManager.moveDiraction[e.key];
            switch(e.key){
                case 'c':gameManager.gamePlayer.photo.self.classList.toggle('disappear');break;
                case 'q':gameManager.gameMessage.self.classList.toggle('disappear');break;
                case 'Escape':gameManager.gameBody.menu.classList.toggle('disappear');break;
                case ' ':if((temp = gameManager.gameMessage.content.video).src){temp.controls = !temp.controls;}break;
            }
        },true);
        Array.prototype.forEach.call(document.querySelectorAll('.scrollDiv'),element=>element.onscroll = function(e){
            // scroll2set
            const configStage = e.target.previousElementSibling;
            switch(e.target.parentElement.id){
                case 'textSep':configStage.textContent = (10 ** (1 - e.target.scrollTop / 1000)).toFixed(1);break;
                case 'modeHard':configStage.textContent = 10 - Math.floor(e.target.scrollTop / 100);break;
                default:configStage.textContent = 100 - Math.floor(e.target.scrollTop / 10);
            }
        })
    }
    setTimeout(()=>{document.documentElement.scrollTo(0,0);},66);
}