(()=>{
    const oldWindowOnload = window.onload;
    window.onload = ()=>{
        oldWindowOnload();
        window.gameManager.constTemp.UTmoveConfig = {duration: 33,fill: 'forwards',easing: 'steps(4, start)'};
        const old_gameInfoSL_loader = window.gameManager.gameInfoSL.loader;
        window.gameManager.gameInfoSL.loader = function(){
            old_gameInfoSL_loader.call(this);
            undertaleManager.body.self.classList.add('disappear');
            undertaleManager.undertaleProcess.paused = true;
        }
        const undertaleManager = window.gameManager.undertaleManager = {
            body: {self: makeElement('div',{id: 'undertaleBody',className: 'disappear'})},tempMemory: undefined,enemyID: undefined,
            undertaleProcess: window.gameManager.undertaleProcess = {
                intervalID: undefined,timeSep: undefined,paused: true,onEvent: undefined,nowFn: undefined,
                defaultFn: ()=>{
                    let temp;
                    if(undertaleManager.fighter.id !== undefined){
                        const previous = [undertaleManager.fighter.x,undertaleManager.fighter.y];
                        if(temp = Object.values(window.gameManager.constTemp.moveDiraction).at(-1)){
                            switch(temp[0]){
                                case 'Left': previous[0] = Math.min(Math.max(0,undertaleManager.fighter.x + +(temp[1]+'1')),50);break;
                                case 'Top': previous[1] = Math.min(Math.max(0,undertaleManager.fighter.y + +(temp[1]+'1')),50);break;
                            }
                            undertaleManager.fighter.loader(undertaleManager.fighter.id,...previous);
                            undertaleManager.fighter.x % 50 || undertaleManager.fighter.y % 50 || undertaleManager.closer();
                        }
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
                this.fighterCondition.loader(fighterID);
                this.UTtheater.fighter.loader(fighterID,25,25);
                this.body.self.classList.remove('disappear');
                setTimeout(()=>{this.undertaleProcess.paused = false;},500);
            },
            closer(fn){
                this.undertaleProcess.paused = true;
                undertaleManager.closeTempMemory();
                this.body.self.classList.add('disappear');
                setTimeout(()=>{window.gameManager.playerMove.paused = false;},500);
                fn?.();
            }
        };
        {
            let temp;
            const fighterCondition = undertaleManager.fighterCondition = {
                id: undefined,array: undefined,self: makeElement('div',{id: 'fighterConditionStage'}),
                loader(){
                    if(this.array){return;}else{
                        var temp = [];
                        this.array = [window.gameManager.gamePlayer.id,undertaleManager.enemyID,...window.gameManager.gameFileSL.origin[0].partner];
                        this.fighterThis.innerHTML = '';
                        for(let id of this.array){
                            temp.push('<div>',memoryHandle('characterArray.'+id+'.name'),'</div>');
                        }
                        this.fighterThis.innerHTML = temp.join('');
                        setTimeout(()=>{this.fighterThis.firstChild.click();});
                    }
                },
                shower(id){}
            };
            ['Charge','Debuff','Buff','MP','HP','This'].reduce(
                (a,b)=>fighterCondition[temp = 'fighter'+b] = a.insertAdjacentElement('beforebegin',makeElement('div',{id: temp})),
                fighterCondition.self.
                insertAdjacentElement('beforeend',fighterCondition.fighterPhoto = makeElement('canvas',{id: 'fighterPhoto',width: 720,height: 2025}))
            );
            ['Charge','MP','HP'].forEach(a=>fighterCondition['fighter'+a].
            insertAdjacentElement('beforeend',makeElement('div',{textContent: a,className: 'fighterInfoName'})).
            insertAdjacentElement('afterend',makeElement('div',{className: 'fighterInfoText'})));
        }
        {
            let temp;
            const UTtheater = undertaleManager.UTtheater = {
                self: makeElement('div',{id: 'UTtheater'}),
                loader(){}
            };
            UTtheater.cornerNodeArray = [0,1,2,3].map(x=>(
                temp = UTtheater.self.insertAdjacentElement('beforeend',makeElement('div',{id: 'UTtheaterCorner'+x,className: 'UTtheaterCorner'})),
                temp.style.cssText = `margin-left: ${50 * !(x % 3)}vw; margin-top: ${50 * (x > 1)}vw;`,temp
            ));
            {
                const UTenemyAttack = UTtheater.enemyAttack = {
                    array: undefined,nodeArray:{},tempNode: makeElement('div',{className: 'enemyAttack',innerHTML: '<div></div>'}),
                    loader(enemyID){
                        for(let i in this.nodeArray){this.nodeArray[i].remove();}
                        this.array = {};
                        this.nodeArray = {};
                    },
                    mover(){}
                };
            }
            {
                const fighter = undertaleManager.fighter = UTtheater.fighter = {
                    id: 1,object: undefined,x: 25,y: 25,
                    self: UTtheater.self.insertAdjacentElement('beforeend',makeElement('div',{id: 'UTfighter'})),
                    loader(id,x,y){
                        const moveKeyframe = window.gameManager.constTemp.moveKeyframes[0];
                        this.id === id || (this.display.style.backgroundImage = `url(${memoryHandle('characterArray.'+(this.id = id)+'.display')})`);
                        moveKeyframe.marginLeft = (this.x = x)+'vw',moveKeyframe.marginTop = (this.y = y)+'vw';
                        return this.self.animate(moveKeyframe,window.gameManager.constTemp.UTmoveConfig).finished;
                    }
                };
                fighter.display = fighter.self.insertAdjacentElement('beforeend',makeElement('div',{id: 'UTfighterDisplay'}));
            }
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
            document.addEventListener('click',e=>{
                var temp = e.target;
                switch(temp.parentElement.id){
                    case 'fighterThis':{
                        for(let i of temp.parentElement.children){i.id = '';}
                        temp.id = 'thisFighter';
                        memoryHandle('characterArray.'+objectArray.characterArray.list.indexOf(temp.textContent)+'.strength');
                        break;
                    }
                }
            },true);
        }
    }
})();