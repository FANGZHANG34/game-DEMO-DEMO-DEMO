(()=>{
    const oldWindowOnload = window.onload;
    window.onload = ()=>{
        oldWindowOnload();
        window.gameManager.constTemp.UTmoveConfig = {duration: 33,fill: 'forwards'};
        window.gameManager.constTemp.UTmoveKeyframes = [{translate: undefined}];
        const old_gameInfoSL_loader = window.gameManager.gameInfoSL.loader;
        window.gameManager.gameInfoSL.loader = function(){
            old_gameInfoSL_loader.call(this);
            undertaleManager.body.self.classList.add('disappear');
            undertaleManager.undertaleProcess.paused = true;
            const temp = window.gameManager.constTemp.memory.characterArray;
            objectArray.characterArray.forEach((value,key)=>{
                value.strength = new Strength(temp[key]?.strength ?? arrayUT.characterArrayUT.get(key));
            });
        }
        const undertaleManager = window.gameManager.undertaleManager = {
            body: {self: makeElement('div',{id: 'undertaleBody',className: 'disappear'})},tempMemory: undefined,enemyID: undefined,
            tempFn: ()=>void undertaleManager.closer(),
            undertaleProcess: window.gameManager.undertaleProcess = {
                intervalID: undefined,timeSep: undefined,paused: true,
                onEvent: ()=>{
                    var [x,y] = undertaleManager.fighter.xy;
                    x % 960 || y % 960 || !undertaleManager.UTtheater.corners[+!x + +(y > 0) * 2] || undertaleManager.closer();
                    undertaleManager.UTtheater.enemyAttack.isHit();
                    undertaleManager.UTtheater.enemyAttack.mover();
                },
                nowFn: undefined,
                defaultFn: ()=>{
                    const moveD = gameManager.constTemp.moveDiraction;
                    if(undertaleManager.fighter.id !== undefined && moveD._){
                        const previous = undertaleManager.fighter.xy.concat();
                        var temp;
                        for(var i of 'asdw'){
                            if(
                                (temp = (temp = moveD[i])[2] === moveD._ ? temp[i = 0]
                                ? previous[0] = Math.min(Math.max(0,undertaleManager.fighter.xy[0] + temp[0] * 30),960)
                                : previous[i = 1] = Math.min(Math.max(0,undertaleManager.fighter.xy[1] + temp[1] * 30),960)
                                : undefined) !== undefined
                            ){break;}
                        }
                        previous[i] === undertaleManager.fighter.xy[i]
                        || undertaleManager.fighter.loader(undertaleManager.fighter.id,...previous);
                    }
                }
            },
            loadTempMemory(){this.tempMemory = copyObj(window.gameManager.constTemp.memory);},
            closeTempMemory(){window.gameManager.constTemp.memory = copyObj(this.tempMemory);},
            loader(enemyID,fighterID = window.gameManager.gamePlayer.id){
                var temp;
                this.enemyID = enemyID;
                window.gameManager.playerMove.paused = true;
                (temp = this.body.self.classList).contains('disappear') ? undertaleManager.loadTempMemory() : temp.add('disappear');
                this.UTtheater.loader();
                this.fighterCondition.loader(fighterID);
                this.UTtheater.fighter.loader(fighterID);
                this.UTtheater.enemyAttack.loader();
                this.body.self.classList.remove('disappear');
                setTimeout(()=>{this.undertaleProcess.paused = false;},500);
            },
            closer(fn = ()=>{setTimeout(()=>{window.gameManager.playerMove.paused = false;},500);}){
                this.undertaleProcess.paused = true;
                undertaleManager.closeTempMemory();
                this.body.self.classList.add('disappear');
                return fn?.();
            }
        };
        {
            let temp;
            const fighterCondition = undertaleManager.fighterCondition = {
                id: undefined,array: undefined,nodeArray: undefined,self: makeElement('div',{id: 'fighterConditionStage'}),
                loader(){
                    if(this.array){return;}else{
                        var temp = [],id;
                        this.array = [window.gameManager.gamePlayer.id,undertaleManager.enemyID,...window.gameManager.gameFileSL.origin[0].partner];
                        this.fighterThis.innerHTML = '';
                        for(id of this.array){temp.push('<div>',memoryHandle('characterArray.'+id+'.name'),'</div>');}
                        this.fighterThis.innerHTML = temp.join('');
                        setTimeout(()=>{(this.nodeArray = Array.from(this.fighterThis.children))[0].click();});
                    }
                },
                shower(thisFighterNode){
                    var i = objectArray.characterArray,buff;
                    this.self.classList.add('disappear');
                    const strength = i.get(i.list.indexOf(thisFighterNode.textContent)).strength;
                    for(i of this.nodeArray){i.id = '';}
                    thisFighterNode.id = 'thisFighter';
                    // {i = 0;while(thisFighterNode = thisFighterNode.previousElementSibling){i++;}console.log(i);}
                    thisFighterNode = [];
                    for(buff of strength.buffArray){thisFighterNode.push('<div>'+buff+'</div>');}
                    this.fighterBuff.innerHTML = thisFighterNode.join('');
                    thisFighterNode = [];
                    for(buff of strength.debuffArray){thisFighterNode.push('<div>'+buff+'</div>');}
                    this.fighterDebuff.innerHTML = thisFighterNode.join('');
                    this.self.classList.remove('disappear');
                }
            };
            ['Charge','Debuff','Buff','MP','HP','This'].reduce(
                (a,b)=>fighterCondition[temp = 'fighter'+b] = a.insertAdjacentElement('beforebegin',makeElement('div',{id: temp})),
                fighterCondition.self.
                insertAdjacentElement('beforeend',fighterCondition.fighterPhoto = makeElement('canvas',{id: 'fighterPhoto',width: 720,height: 1485}))
            );
            ['Charge','MP','HP'].forEach(a=>fighterCondition['fighter'+a].
            insertAdjacentElement('beforeend',makeElement('div',{textContent: a,className: 'fighterInfoName'})).
            insertAdjacentElement('afterend',makeElement('div',{className: 'fighterInfoText'})));
        }
        {
            const UTtheater = undertaleManager.UTtheater = {
                self: makeElement('div',{id: 'UTtheater'}),corners: [],
                loader(stageName = '_'){
                    const [stageUrl,...UrlArray] = mapArrayUT.get(stageName) ?? [],context = this.stage.self.getContext('2d'),
                    tempImageArray = window.gameManager.constTemp.tempImageArray;
                    var temp;
                    if(stageUrl ?? false){
                        this.stage.loader(stageUrl),this.corners = UrlArray;
                        for(let i = 0;i < 4;i++){
                            (temp = tempImageArray.get(UrlArray[i])) ? context.drawImage(temp,!(i % 2) * 960,(i > 1) * 960)
                            : new Promise((resolve,reject)=>{
                                (temp = new Image()).onload = function(){
                                    UrlArray[i] ? (tempImageArray.set(UrlArray[i],this),resolve(this)) : resolve(false);
                                }
                                temp.onerror = ()=>reject(stageName+'.'+(i + 1)),temp.src = UrlArray[i];
                            }).then(value=>(
                                value && context.drawImage(value,!(i % 2) * 960,(i > 1) * 960),
                                i === 0 && (context.globalAlpha = .75),i === 2 && (context.globalAlpha = .5),i === 3 && (context.globalAlpha = 1)
                            ),error=>console.error('=> Please check wrong stage: '+error));
                        }
                    }else{throw new Error(`=> There is no stageName '${stageName}' !`)}
                }
            };
            UTtheater.stage = {
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(imageUrl){
                    const context = this.self.getContext('2d'),temp = window.gameManager.constTemp.tempImageArray;
                    var imageIf = temp.get(imageUrl);
                    context.clearRect(0,0,this.self.width,this.self.height);context.closePath();
                    if(imageIf){context.drawImage(imageIf,0,0);}else{
                        (imageIf = new Image()).onload = ()=>{
                            context.drawImage(imageIf,0,0);
                            temp.set(imageUrl,imageIf);
                        };
                        imageIf.src = imageUrl;
                    }
                }
            };
            UTtheater.enemyAttack = {
                array:[],tempImage: undefined,seedNum: 0,
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(enemyID){this.changer().then(()=>this.drawer(),error=>console.log(error+' is not found !'));},
                drawer(num = 16){
                    const temp0 = window.gameManager.constTemp.tempCanvas,temp1 = temp0.getContext('2d'),selfContext = this.self.getContext('2d');
                    num ||= (this.array = [],this.array.length),this.array.length > num && (this.array = this.array.slice(0,num));
                    if(this.tempImage){
                        temp1.clearRect(0,0,temp0.width,temp0.height),selfContext.clearRect(0,0,1080,1080),
                        temp1.closePath(),selfContext.closePath(),selfContext.globalAlpha === 0.5 || (selfContext.globalAlpha = 0.75);
                        for(--num;num > -1;num--){
                            let temp = this.array[num] ??= [getRandomZoneUT(),getRandomZoneUT()];
                            temp1.drawImage(this.tempImage,temp[0],temp[1]);
                        }
                        selfContext.drawImage(temp0,0,0);
                    }else{throw new Error('=> UTtheater.enemyAttack.tempImage is undefined !');}
                },
                mover(){
                    if(this.tempImage){for(let i of this.array){
                        let temp = getRandomDiractionUT(this.seedNum);this.seedNum = temp[0] ** 2;
                        i[0] = Math.min(Math.max(0,i[0] + temp[0] * 60),960),i[1] = Math.min(Math.max(0,i[1] + temp[1] * 60),960);
                    }this.drawer();}
                    else{throw new Error('=> UTtheater.enemyAttack.tempImage is undefined !');}
                },
                changer(skill = './img/无名剑客.jpg'){
                    var temp;
                    const tempImageArray = window.gameManager.constTemp.tempImageArray,tempImage = tempImageArray.get(skill),
                    selfContext = this.self.getContext('2d');
                    if(!skill){
                        this.tempImage = undefined;return Promise.reject('None'),
                        selfContext.clearRect(0,0,this.self.width,this.self.height),selfContext.closePath();
                    }else return tempImage ? (this.tempImage = tempImage,Promise.resolve())
                    : new Promise((resolve,reject)=>{
                        (temp = tempImageArray.get(skill)) ? resolve(temp) : (
                            (temp = new Image()).onerror = ()=>reject(skill),
                            temp.onload = function(){skill ? (tempImageArray.set(skill,UTtheater.enemyAttack.tempImage = this),resolve()) : reject(skill);},
                            temp.src = skill
                        );
                    })
                },
                isHit(){
                    this.array.reduce((s,i)=>(s += Math.hypot((i[0] - UTtheater.fighter.xy[0]),(i[1] - UTtheater.fighter.xy[1])) < 120),0)
                    && (window.gameManager.hoverAudio.currentTime = 0,window.gameManager.hoverAudio.play());
                }
            };
            undertaleManager.fighter = UTtheater.fighter = {
                id: undefined,xy: [480,480],display: makeElement('canvas',{width: 1080,height: 1080}),
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),tempImage: undefined,
                loader(id,x = 480,y = 480){
                    var temp;
                    const tempContext = this.display.getContext('2d'),tempImageArray = window.gameManager.constTemp.tempImageArray,
                    imageUrl = memoryHandle('characterArray.'+id+'.display'),context = this.self.getContext('2d');
                    tempContext.clearRect(0,0,1080,1080),context.clearRect(0,0,1080,1080),tempContext.closePath(),context.closePath();
                    Promise.resolve(this.id !== id ? (temp = tempImageArray.get(imageUrl)) ? (this.tempImage = temp) : new Promise(resolve=>{
                        (temp = new Image()).onerror = ()=>resolve(false);
                        temp.onload = ()=>{resolve(imageUrl ? (tempImageArray.set(imageUrl,temp),this.tempImage = temp) : false)};
                        temp.src = imageUrl;
                    }) : this.tempImage).then(
                        value=>value ? (
                            tempContext.drawImage(value,480,480),this.id = id,
                            context.drawImage(this.display,(this.xy[0] = x) - 480,(this.xy[1] = y) - 480)
                        )
                        : console.error(id+' has wrong display !')
                    );
                }
            };
        }
        {
            const fighterBoard = undertaleManager.fighterBoard = {
                self: makeElement('div',{id: 'fighterBoard'}),
                fighterSkill: {self: makeElement('div',{id: 'fighterSkill'})},
                fighterItem: {self: makeElement('div',{id: 'fighterItem'})},
                fighterPartner: {self: makeElement('div',{id: 'fighterPartner'})}
            }
            for(let i in fighterBoard){i === 'self' || fighterBoard.self.insertAdjacentElement('beforeend',fighterBoard[i].self);}
        }
        {}{}{}
        window.gameManager.gameBody.self.insertAdjacentElement('afterend',undertaleManager.body.self).
        insertAdjacentElement('beforeend',undertaleManager.fighterCondition.self).
        insertAdjacentElement('afterend',undertaleManager.UTtheater.self).
        insertAdjacentElement('afterend',undertaleManager.fighterBoard.self);
        window.gameManager.setGameInterval('undertaleProcess',33);

        {
            document.onmousemove = e=>{
                // mouse2tip
                var temp = e.target;
                const gameTip = window.gameManager.gameBody.gameTip;
                switch(temp.parentElement?.id){
                    case 'fighterBuff':;
                    case 'fighterDebuff':gameTip.tipFn(e);break;
                    case 'fighterThis':gameTip.tipFn(e);break;
                    default:gameTip.tipFn(e,false);
                }
            };
            document.addEventListener('click',e=>{
                // click2change
                var temp = e.target;
                switch(temp.parentElement.id){
                    case 'fighterThis':undertaleManager.fighterCondition.shower(temp);break;
                }
            },true);
        }
    }
})();