{
    const oldWindowOnload = window.onload;
    window.onload = ()=>oldWindowOnload().then(()=>{
        // undertaleSystem start
        {
            const old_gameInfoSL_loader = Symbol('old_gameInfoSL_loader');
            window.gameManager.gameInfoSL[old_gameInfoSL_loader] = window.gameManager.gameInfoSL.loader;
            window.gameManager.gameInfoSL.loader = function(){
                this[old_gameInfoSL_loader]();
                undertaleManager.body.self.classList.add('disappear'),undertaleManager.undertaleProcess.paused = true;
                const temp = window.gameManager.constTemp.memory.characterArray;
                objectArray.characterArray.forEach((value,key)=>{
                    value.strength = new Strength(temp[key]?.strength ?? arrayUT.characterArrayUT.get(key));
                });
            }
        }
        const undertaleManager = window.gameManager.undertaleManager = {
            body: {self: makeElement('div',{id: 'undertaleBody',className: 'disappear'})},tempMemory: null,enemyID: null,
            tempFn: ()=>void undertaleManager.closer(),
            undertaleProcess: window.gameManager.undertaleProcess = {
                intervalID: null,timeSep: null,paused: true,moveD: 0,
                onEvent: ()=>{
                    const [x,y] = undertaleManager.fighter.xy;
                    x % 960 || y % 960 || !undertaleManager.UTtheater.corners[+!x + +(y > 0) * 2] || undertaleManager.closer();
                    undertaleManager.UTtheater.enemyAttack.isHit();
                    undertaleManager.UTtheater.enemyAttack.mover();
                },
                nowFn: null,
                defaultFn(){
                    var temp,i;
                    const moveD = gameManager.constTemp.moveDiraction;
                    if(undertaleManager.fighter.id !== null && moveD._){
                        const previous = undertaleManager.fighter.xy.concat();
                        for(this.moveD = 0;this.moveD < 4;this.moveD++){
                            if(
                                (
                                    (temp = moveD['sawd'[this.moveD]])[2] === moveD._ ? temp[i = 0]
                                    ? previous[0] = Math.min(Math.max(0,undertaleManager.fighter.xy[0] + temp[0] * 15),960)
                                    : previous[i = 1] = Math.min(Math.max(0,undertaleManager.fighter.xy[1] + temp[1] * 15),960)
                                    : null
                                ) !== null
                            ){break;}
                        }
                        previous[i] === undertaleManager.fighter.xy[i]
                        || undertaleManager.fighter.loader(undertaleManager.fighter.id,...previous,this.moveD);
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
                this.fighterCondition.array = null,this.fighterCondition.loader(fighterID);
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
                self: makeElement('div',{id: 'fighterConditionStage'}),array: null,nodeArray: null,
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
                async loader(stageName = '_'){
                    const [stageUrl,...UrlArray] = mapArrayUT.get(stageName) ?? [],context = this.stage.self.getContext('2d');
                    if(stageUrl){
                        await this.stage.loader(stageUrl),this.corners = UrlArray;
                        for(var i = 0;i < 4;i++){
                            await getImage(UrlArray[i]).then(value=>(
                                value ? context.drawImage(value,!(i % 2) * 960,(i > 1) * 960) : UrlArray[i] && console.error('=> Wrong corner : '+i),
                                i === 0 && (context.globalAlpha = .75),i === 2 && (context.globalAlpha = .5),i === 3 && (context.globalAlpha = 1)
                            ));
                        }
                    }else{throw new Error(`=> There is no stageName '${stageName}' !`)}
                    return;
                }
            };
            UTtheater.stage = {
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(imageUrl){getImage(imageUrl).then(value=>(value && clearCanvas(this.self).drawImage(value,0,0)));}
            };
            UTtheater.enemyAttack = {
                array:[],tempImage: null,seedNum: 0,
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(enemyID){
                    this.changer().then(value=>!value ? this.drawer() : console.log(value+' is not found !'));
                },
                drawer(num = 16){
                    const temp0 = window.gameManager.constTemp.tempCanvas;
                    var temp;
                    num ||= (this.array = [],this.array.length),this.array.length > num && (this.array = this.array.slice(0,num));
                    if(this.tempImage){
                        const temp1 = clearCanvas(temp0);
                        for(--num;num > -1;num--){
                            temp1.drawImage(this.tempImage,0,0,120,120,(temp = this.array[num] ??= [getRandomZoneUT(),getRandomZoneUT(),0])[0],temp[1],120,120);
                        }
                        clearCanvas(this.self).drawImage(temp0,0,0);
                    }else{throw new Error('=> UTtheater.enemyAttack.tempImage is null !');}
                },
                mover(){
                    var i,temp;
                    if(this.tempImage){
                        for(i of this.array){
                            this.seedNum = (temp = getRandomDiractionUT(this.seedNum))[0] ** 2;
                            i[0] = Math.min(Math.max(0,i[0] + temp[0] * 15),960),i[1] = Math.min(Math.max(0,i[1] + temp[1] * 15),960);
                        }
                        this.drawer();
                    }else{throw new Error('=> UTtheater.enemyAttack.tempImage is null !');}
                },
                async changer(skill = './img/无名剑客.jpg'){
                    const selfContext = this.self.getContext('2d');
                    return this.tempImage = await getImage(skill) || null,skill ? getImage(skill) ? false : skill :
                    (selfContext.clearRect(0,0,1080,1080),selfContext.closePath(),this.tempImage = null,'None');
                },
                isHit(){
                    this.array.reduce((s,i)=>(s += i[2] !== 0 ? (i[2]--,0) : Math.hypot(
                        i[0] - UTtheater.fighter.xy[0],i[1] - UTtheater.fighter.xy[1]
                    ) < 120 && (i[2] = 11,1)),0) && (window.gameManager.hoverAudio.currentTime = 0,window.gameManager.hoverAudio.play());
                }
            };
            undertaleManager.fighter = UTtheater.fighter = {
                id: null,xy: [480,480],display: makeElement('canvas',{width: 1080,height: 1080}),
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),tempImage: null,
                async loader(id,x = 480,y = 480,moveD = 0){
                    Promise.resolve(this.id !== id ? (
                        this.tempImage = (await getImage(memoryHandle('characterArray.'+id+'.display'))) || null
                    ) : this.tempImage).then(value=>(value ? (
                        this.id = id,clearCanvas(this.display).drawImage(value,0,moveD * 120,120,120,480,480,120,120),
                        clearCanvas(this.self).drawImage(this.display,(this.xy[0] = x) - 480,(this.xy[1] = y) - 480)
                    ) : console.error(id+' has wrong display !')));
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
            for(let i of Object.keys(fighterBoard)){i === 'self' || fighterBoard.self.insertAdjacentElement('beforeend',fighterBoard[i].self);}
        }
        {}{}{}
        window.gameManager.gameBody.self.insertAdjacentElement('afterend',undertaleManager.body.self).
        insertAdjacentElement('beforeend',undertaleManager.fighterCondition.self).
        insertAdjacentElement('afterend',undertaleManager.UTtheater.self).
        insertAdjacentElement('afterend',undertaleManager.fighterBoard.self);
        window.gameManager.setGameInterval('undertaleProcess',16);

        {
            document.addEventListener('mousemove',e=>{
                // mouse2tip
                var temp = e.target;
                const gameTip = window.gameManager.gameBody.gameTip;
                switch(temp.parentElement?.id){
                    case 'fighterBuff':;
                    case 'fighterDebuff':gameTip.tipFn(e);break;
                    case 'fighterThis':gameTip.tipFn(e);break;
                    default:gameTip.tipFn(e,false);
                }
            },true);
            document.addEventListener('click',e=>{
                // click2change
                var temp = e.target;
                switch(temp.parentElement.id){
                    case 'fighterThis':undertaleManager.fighterCondition.shower(temp);break;
                }
            },true);
        }
        // undertaleSystem end
        return Promise.all(window.gameManager.promiseArray);
    },err=>console.error('=> Before "undertale-like-system"!\n\n'+err));
}