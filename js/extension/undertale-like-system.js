'use strict';
{
    const oldWindowOnload = window.onload;
    /**
     * 
     * @returns {Promise<gameManager | Error>}
     */
    window.onload = ()=>timeRecord(oldWindowOnload).then(({value: oldGameManager,time})=>{
        console.log('!! OldWindowOnload 用时',time,'ms');
        const gameManager = oldGameManager;
        // undertaleSystem start
        {
            // 重写 gameManager.gameInfoSL.loader() 方法
            const old_gameInfoSL_loader = Symbol('oldLoader -> undertale-like-system.js');
            gameManager.gameInfoSL[old_gameInfoSL_loader] = gameManager.gameInfoSL.loader;
            gameManager.gameInfoSL.loader = function(){
                this[old_gameInfoSL_loader]();
                undertaleManager.body.self.classList.add('disappear'),
                undertaleManager.undertaleProcess.paused = true,undertaleManager.undertaleProcess.nowFn = null;
                characterArray.forEach(function(value,key){
                    value.strength = new Strength(this[key]?.strength ?? characterStrengthArrayUT.get(key));
                },gameManager.constTemp.memory.characterArray);
            }
        }
        // *.loader() 加载

        // undertaleManager 战斗系统管理者
        // .body 战斗系统载体元素
        // .tempMemory 临时记忆信息
        // .enemyID 敌人ID
        // .tempFn 临时函数
        // .undertaleProcess 预定的游戏循环计时器参考对象
        // .loadTempMemory() 加载临时记忆信息
        // .closeTempMemory() 关闭并合并临时记忆信息
        // .closer() 关闭战斗系统
        const undertaleManager = gameManager.undertaleManager = {
            body: {self: makeElement('div',{id: 'undertaleBody',className: 'disappear'})},tempMemory: null,enemyID: null,
            tempFn: null,closerFn: null,endResolver: null,
            undertaleProcess: gameManager.undertaleProcess = {
                intervalID: null,timeSep: null,paused: true,moveD: 0,stop: true,nowFn: null,
                onEvent: ()=>{
                    const [x,y] = undertaleManager.fighter.xy;
                    x % 960 || y % 960 || undertaleManager.fighterCondition.charge !== undertaleManager.fighterCondition.chargeMax ||
                    !undertaleManager.UTtheater.corners[+!x + +(y > 0) * 2] || (
                        memoryHandle('characterArray.'+undertaleManager.enemyID+'.strength').condition.HP < 0 ? (
                            undertaleManager.undertaleProcess.nowFn = loopSelf,
                            undertaleManager.UTtheater.enemyAttack.array.length &&
                            undertaleManager.UTtheater.enemyAttack.drawer(0)
                        ) :
                        resolveVoid.then(undertaleManager.tempFn ?? (()=>undertaleManager.closer())).catch(errorThrow)
                    );
                    undertaleManager.fighterCondition.chargeChecker();
                    undertaleManager.UTtheater.enemyAttack.isHit();
                    undertaleManager.UTtheater.enemyAttack.mover();
                },
                defaultFn(){
                    var temp,i;
                    const moveD = gameManager.constTemp.moveDiraction,fighter = undertaleManager.fighter,previous = fighter.xy.slice();
                    if(null !== fighter.id && moveD._){
                        for(this.moveD = 0;this.moveD < 4;this.moveD++){
                            if(null !== (
                                moveD._ === (temp = moveD['sawd'[this.moveD]])[2] ? temp[0] ?
                                previous[i = 0] = Math.min(Math.max(0,fighter.xy[0] + temp[0] * 15),960) :
                                previous[i = 1] = Math.min(Math.max(0,fighter.xy[1] + temp[1] * 15),960) : null
                            )){break;}
                        }
                        (this.stop = previous[i] === fighter.xy[i]) || fighter.loader(fighter.id,previous,this.moveD);
                    }else this.stop = true;
                    null !== fighter.id && this.stop && 0 !== fighter.step &&
                    (fighter.step = -1,fighter.loader(fighter.id,previous,this.moveD));
                }
            },
            /**
             * 
             * @param {Number} enemyID 
             * @param {Number} fighterID 
             */
            loader(enemyID,{fighterID = gameManager.gamePlayer.id,teamMode = true,closerFn = ()=>{setTimeout(()=>{gameManager.playerMove.paused = false;},500);}} = {}){
                var temp;
                this.enemyID = enemyID,this.closerFn = closerFn;
                gameManager.playerMove.paused = true;
                (temp = this.body.self.classList).contains('disappear') ? undertaleManager.loadTempMemory() : temp.add('disappear');
                this.fighterCondition.array = null,this.fighterCondition.loader(teamMode),this.fighterCondition.chargeChecker(true);
                this.UTtheater.loader();
                this.UTtheater.fighter.loader(fighterID);
                this.UTtheater.enemyAttack.loader(enemyID);
                this.fighterBoard.fighterPartner.loader();
                temp.remove('disappear');
                setTimeout(()=>{this.undertaleProcess.paused = false;},500);
                return new Promise(resolve=>this.endResolver = resolve);
            },
            /**
             * 
             * @param {() => void} fn 
             */
            closer(closerFn){console.log(123);
                this.undertaleProcess.paused = true;
                this.closeTempMemory(),this.endResolver();
                this.body.self.classList.add('disappear');
                return (closerFn ?? this.closerFn)?.();
            },
            loadTempMemory(){this.tempMemory = copyObj(gameManager.constTemp.memory);},
            closeTempMemory(){gameManager.constTemp.memory = copyObj(this.tempMemory);}
        };
        {
            let temp;
            const fighterCondition = undertaleManager.fighterCondition = {
                self: temp = makeElement('div',{
                    id: 'fighterConditionStage',innerHTML: '<canvas id="fighterPhoto" width="720" height="1485"></canvas>'
                }),fighterPhoto: temp.firstChild,array: null,nowFighterNode: null,nowFighterID: null,
                nowCondition:{HP: [0,1],MP: [0,1]},charge: 0,chargeMax: 300,
                loader(teamMode){
                    if(this.array)return;else{
                        var temp = [],id;
                        this.array = [undertaleManager.enemyID,gameManager.gamePlayer.id].
                        concat(teamMode ? gameManager.gameFileSL.origin[0].partner : []);
                        this.fighterThis.innerHTML = '';
                        for(id of this.array){temp.push('<div>',memoryHandle('characterArray.'+id+'.name'),'</div>');}
                        this.fighterThis.innerHTML = temp.join('');
                        setTimeout(()=>this.fighterThis.children[0].click());
                    }
                },
                /**
                 * 
                 * @param {HTMLElement} nowFighterNode 
                 */
                shower(nowFighterNode){
                    this.showStrength(this.nowFighterID = characterArray.list.indexOf(nowFighterNode.textContent));
                    classNameAddOrRemove('nowThisDiv',this.nowFighterNode,this.nowFighterNode = nowFighterNode);
                    getImage(memoryHandle('characterArray.'+this.nowFighterID+'.photo')).
                    then(value=>clearCanvas(this.fighterPhoto).drawImage(value,0,270,720,1485,0,0,720,1485));
                },
                /**
                 * 
                 * @param {Number} nowFighterID 
                 */
                showStrength(nowFighterID){
                    const strength = memoryHandle('characterArray.'+nowFighterID+'.strength');
                    var temp;
                    this.fighterBuff.innerHTML = (temp = objArrayFilter(strength.buffArray,t=>Boolean(t)).
                    join('</div><div>')) && '<div>'+temp+'</div>',
                    this.fighterDebuff.innerHTML = (temp = objArrayFilter(strength.debuffArray,t=>Boolean(t)).
                    join('</div><div>')) && '<div>'+temp+'</div>';
                },
                conditionChecker(){
                    1
                },
                chargeChecker(isReset = false){
                    isReset ? this.fighterCharge.style.scale = (this.charge = 0)+' 1' :
                    undertaleManager.undertaleProcess.paused || undertaleManager.undertaleProcess.nowFn || (
                        this.chargeMax < ++this.charge ? (this.charge = this.chargeMax) :
                        this.fighterCharge.style.scale = (this.charge / this.chargeMax)+' 1'
                    );
                }
            };
            for(temp of ['Charge','Debuff','Buff','MP','HP','This']){
                fighterCondition.self.insertAdjacentElement('afterbegin',fighterCondition[temp = 'fighter'+temp] = makeElement('div',{id: temp}))
            }
            for(temp of ['Charge','MP','HP']){
                fighterCondition['fighter'+temp] = fighterCondition['fighter'+temp].
                insertAdjacentElement('beforeend',makeElement('div',{className: 'fighterInfoName',textContent: temp})).
                insertAdjacentElement('afterend',makeElement('div',{className: 'fighterInfoText'}));
            }
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
                                value ? context.drawImage(value,!(i % 2) * 960,(i > 1) * 960) :
                                UrlArray[i] && console.error('=> Wrong corner : '+i),
                                0 === i && (context.globalAlpha = .75),2 === i &&
                                (context.globalAlpha = .5),3 === i && (context.globalAlpha = 1)
                            ));
                        }
                    }else throw new Error(`=> There is no stageName "${stageName}" !`);
                    return 0;
                }
            };
            UTtheater.stage = {
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(imageUrl){getImage(imageUrl).then(value=>(value && clearCanvas(this.self).drawImage(value,0,0)));}
            };
            UTtheater.enemyAttack = {
                array: [],tempImage: null,seedNum: 0,skillArray: null,
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                loader(enemyID,loaderFn = UTtheater.enemyAttack.defaultLoaderFn){
                    '变' === (this.skillArray = loaderFn(enemyID))[2].vary[0] ? this.skillArray.fn(enemyID,UTtheater.fighter.id)
                    : this.changer(this.skillArray[2]).then(
                        value=>!value ? this.drawer(this.skillArray[2].drawerCount?.(enemyID,UTtheater.fighter.id) ?? 60) :
                        console.log(value+' is not found !')
                    );
                },
                defaultLoaderFn(enemyID){
                    const skillArray = Object.entries(memoryHandle('characterArray.'+enemyID+'.strength').skillArray).
                    reduce((temp,skillArray)=>('化' === (skillArray[2] = skillArrayUT.get(skillArray[0])).vary[0] || temp.push(skillArray),temp),[]);
                    return skillArray[~~(Math.random() * skillArray.length)];
                },
                drawer(num = this.array.length){
                    const temp0 = gameManager.constTemp.tempCanvas;
                    var temp;
                    (num = +num) >= 0 || (num = 0),this.array.length > num && (this.array = this.array.slice(0,num));
                    if(this.tempImage){
                        const temp1 = clearCanvas(temp0);
                        for(--num;num > -1;num--){
                            temp1.drawImage(
                                this.tempImage,0,0,120,120,
                                (temp = this.array[num] ??= [getRandomZoneUT(),getRandomZoneUT(),0])[0],temp[1],120,120
                            );
                        }
                        clearCanvas(this.self).drawImage(temp0,0,0);
                    }else throw new Error('=> UTtheater.enemyAttack.tempImage is null !');
                },
                mover(){
                    var i,temp;
                    if(this.tempImage){
                        for(i of this.array){
                            this.seedNum = (temp = getRandomDiractionUT(this.seedNum))[0] ** 2;
                            i[0] = Math.min(Math.max(0,i[0] + temp[0] * 15),960),i[1] = Math.min(Math.max(0,i[1] + temp[1] * 15),960);
                        }
                        this.drawer();
                    }else throw new Error('=> UTtheater.enemyAttack.tempImage is null !');
                },
                changer(skillObj = skillArrayUT.get('普攻')){
                    return getImage(skillObj?.display).then(value=>(
                        this.tempImage = value || null,
                        !value && (clearCanvas(this.self),this.tempImage = null,skillObj ? skillObj.display : 'None')
                    ));
                },
                isHit(){
                    0 !== this.array.reduce((s,i)=>(s += i[2] ? (i[2]--,0) : Math.hypot(
                        i[0] - UTtheater.fighter.xy[0],i[1] - UTtheater.fighter.xy[1]
                    ) < 120 && (i[2] = 29,1)),0) && (this.skillArray[2].fn(undertaleManager.enemyID,UTtheater.fighter.id));
                }
            };
            UTtheater.fighter = undertaleManager.fighter = {
                self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('canvas',{width: 1080,height: 1080})),
                id: null,xy: [480,480],step: 0,display: makeElement('canvas',{width: 1080,height: 1080}),tempImage: null,
                /**
                 * 
                 * @param {Number} id 
                 */
                loader(id,xy = [480,480],moveD = 0){
                    Promise.resolve(this.id !== id ? (
                        this.tempImage = getImage(memoryHandle('characterArray.'+id+'.display'))
                    ) : this.tempImage).then(value=>(value ? (
                        this.id = id,clearCanvas(this.display).drawImage(
                            value,(this.step = gameManager.constTemp.moveDiraction._ && (this.step + 1) % 4) * 120,moveD * 120,
                            120,120,480,480,120,120
                        ),clearCanvas(this.self).drawImage(this.display,(this.xy[0] = xy[0]) - 480,(this.xy[1] = xy[1]) - 480)
                    ) : console.error('=> '+id+' has wrong display !')));
                }
            };
        }
        {
            let temp;
            const fighterBoard = undertaleManager.fighterBoard = {
                self: temp = makeElement('div',{id: 'fighterBoard'}),
                fighterPartner: {
                    self: temp = temp.insertAdjacentElement('beforeend',makeElement('div',{id: 'fighterPartner'})),
                    partnerID: null,nowPartnerNode: null,
                    loader(){
                        this.self.innerHTML = undertaleManager.fighterCondition.array.slice(1).
                        reduce((teamList,id)=>(teamList.push('<div>',memoryHandle('characterArray.'+id+'.name'),'</div>'),teamList),[]).
                        join('');
                    },
                    shower(nowPartnerNode){
                        fighterBoard.fighterSkill.loader(nowPartnerNode.textContent);
                        classNameAddOrRemove('nowThisDiv',this.nowPartnerNode,this.nowPartnerNode = nowPartnerNode);
                        this.partnerID = characterArray.list.indexOf(nowPartnerNode.textContent);
                    }
                },
                fighterSkill: {
                    self: temp = temp.insertAdjacentElement('afterend',makeElement('div',{id: 'fighterSkill'})),nowSkillNode: null,
                    loader(name){
                        this.self.innerHTML = Object.entries(characterArray.getByName(name,'strength').skillArray).
                        sort((skillA,skillB)=>skillB[1] - skillA[1]).
                        reduce((temp,skill)=>(temp.push('<div>',skill[0],'<br>',skill[1],'</div>'),temp),[]).
                        join('');
                    },
                    /**
                     * 
                     * @param {HTMLDivElement} fighterSkillNode 
                     */
                    useSkill(fighterSkillNode){
                        fighterSkillNode === this.nowSkillNode ? (
                            undertaleManager.undertaleProcess.nowFn = null,
                            skillArrayUT.get(fighterSkillNode.innerText.split('\n')[0]).
                            fn({objectID: fighterBoard.fighterPartner.partnerID,subjectID: undertaleManager.enemyID})
                        ) :
                        classNameAddOrRemove('nowThisDiv',this.nowSkillNode,this.nowSkillNode = fighterSkillNode);
                    }
                },
                fighterItem: {
                    self: temp = temp.insertAdjacentElement('afterend',makeElement('div',{id: 'fighterItem'})),
                    menu: temp.insertAdjacentElement('beforeend',makeElement('div',{innerHTML: '<div>消耗品</div><div>复用品</div><div>穿戴品</div>'})),
                    stage: temp.insertAdjacentElement('beforeend',document.createElement('div')),
                    nowItemTypeNode: null,nowItemTypeIndex: null,nowItemNode: null,
                    /**
                     * 
                     * @param {HTMLDivElement} itemTypeNode 
                     */
                    loader(itemTypeNode){
                        classNameAddOrRemove('nowThisDiv',this.nowItemTypeNode,this.nowItemTypeNode = itemTypeNode);
                        var i = 0;
                        while(itemTypeNode = itemTypeNode.previousElementSibling){i++;}
                        this.nowItemTypeIndex = i;
                        this.stage.innerHTML = (Object.entries(undertaleManager.tempMemory.itemList[['onceArray','twiceArray','onfitArray'][i]])).
                        sort((itemA,itemB)=>itemB[1] - itemA[1]).
                        reduce((temp,item)=>(temp.push('<div>',item[0],' * ',item[1],'</div>'),temp),[]).
                        join('');
                    },
                    useItem(itemNode){
                        itemNode === this.nowItemNode ? (
                            undertaleManager.undertaleProcess.nowFn = null,
                            itemArray[['onceArray','twiceArray','onfitArray'][this.nowItemTypeIndex]].
                            get(itemNode.textContent.split(' * ')[0]).fn({
                                objectID: fighterBoard.fighterPartner.partnerID,subjectID: undertaleManager.enemyID
                            })
                        ) : classNameAddOrRemove('nowThisDiv',this.nowItemNode,this.nowItemNode = itemNode);
                    }
                }
            };
        }
        {}{}{}
        gameManager.makePromise(()=>{
            gameManager.gameBody.self.insertAdjacentElement('afterend',undertaleManager.body.self).
            insertAdjacentElement('beforeend',undertaleManager.fighterCondition.self).
            insertAdjacentElement('afterend',undertaleManager.UTtheater.self).
            insertAdjacentElement('afterend',undertaleManager.fighterBoard.self),
            gameManager.setGameInterval('undertaleProcess',16);
        });

        {
            document.addEventListener('mousemove',e=>{
                // mouse2tip
                var temp = e.target;
                const gameTip = gameManager.gameBody.gameTip;
                switch(temp.id){
                    case 'fighterSkill':{
                        gameTip.tipFn(e);
                        break;
                    }
                    default: switch(temp.parentElement?.id){
                        case 'fighterThis':{
                            gameTip.tipFn(e);
                            break;
                        }
                        case 'fighterBuff':case 'fighterDebuff':{
                            gameTip.tipFn(e);
                            break;
                        }
                        case 'fighterSkill':{
                            gameTip.tipFn(e);
                            break;
                        }
                        default: switch(temp.parentElement?.parentElement?.id){
                            case 'fighterItem':{
                                const fighterItem = undertaleManager.fighterBoard.fighterItem;
                                switch(temp.parentElement){
                                    case fighterItem.menu:{
                                        gameTip.tipFn(e);
                                        break;
                                    }
                                    case fighterItem.stage:{
                                        gameTip.tipFn(e);
                                        break;
                                    }
                                }
                                break;
                            }
                            default: gameTip.tipFn(e,false);
                        }
                    }
                }
            },true);
            document.addEventListener('click',e=>{
                // click2change
                var temp = e.target;
                switch(temp.id){
                    case 'fighterSkill': temp.classList.toggle('wider');break;
                    default: switch(temp.parentElement?.id){
                        case 'fighterThis': undertaleManager.fighterCondition.shower(temp);break;
                        case 'fighterPartner': undertaleManager.fighterBoard.fighterPartner.shower(temp);break;
                        case 'fighterSkill': undertaleManager.fighterBoard.fighterSkill.useSkill(temp);break;
                        default: switch(temp.parentElement?.parentElement?.id){
                            case 'fighterItem':{
                                const fighterItem = undertaleManager.fighterBoard.fighterItem;
                                switch(temp.parentElement){
                                    case fighterItem.menu: fighterItem.loader(temp);break;
                                    case fighterItem.stage: fighterItem.useItem(temp);break;
                                }
                                break;
                            }
                        }
                    }
                }
                
            },true);
        }

        // undertaleSystem end
        return gameManager.completeSelf('extension/undertale-like-system.js');
    });
}