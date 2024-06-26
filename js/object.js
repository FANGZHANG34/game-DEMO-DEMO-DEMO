const objectArray = {characterArray: new Map(),eventArray: new Map()};
{
    objectArray.characterArray.set(0,{
        zone:false,
        selfEvent:undefined,
        name:'无名剑客',
        display:'./img/wmjk.png',
        face:'./img/actor0.jpg',
        photo:'./img/actor0.jpg'
    }).set(1,{
        zone:false,
        selfEvent:undefined,
        name:'林元',
        display:'./img/actor1.jpg',
        face:'./img/actor1.jpg',
        photo:'./img/actor1.jpg'
    })
    .forEach(function(value,key){this[key] = value.name;},objectArray.characterArray.list = []);
}
{
    objectArray.eventArray.getStoryByEvent = function(beginEventName){
        const story = [beginEventName];
        while(true){
            if(!this.get(story.at(-1))){return story;}else{story.push(this.get(story.at(-1))[2]);}
            if(story.at(-2) === (story.at(-1) || story.at(-2))){return story;}
        }
    }
    objectArray.eventArray.set('0',[
        '开始',(id = 1)=>{
            window.gameManager.gameMessage.loader(
                {name: memoryHandle('characterArray.'+id+'.name'),faceUrl: memoryHandle('characterArray.'+id+'.face')},
                {text:
`想要做什么事？`,audioUrl:'',videoUrl:'',imageUr:''},
                {
                    听歌: objectArray.eventArray.get('1')[1],
                    看片: objectArray.eventArray.get('2')[1],
                    看动画: objectArray.eventArray.get('3')[1],
                    战斗: objectArray.eventArray.get('4')[1],
                    无:()=>{
                        window.gameManager.gameMessage.closer();
                        window.gameManager.playerMove.paused = false;
                        window.gameManager.gameMessage.option.finallyFn = undefined;
                        window.gameManager.gameMessage.option.ended = true;
                        memoryHandle('mapDataArray.001.4','w',undefined);
                    }
                },
                objectArray.eventArray.get('0')[1]
            );
        },
        '0'
    ]).set('1',[
        '听歌',()=>{
            window.gameManager.gameMessage.loader(
                {name:'林元',faceUrl:'./img/林元.jpg'},
                {text:
`又到了一更时分身后传来敲门声
总在失魂散乱的夜里出现两个人
一阵儿欢心一阵儿惊惧
这命中带着病啊
只是春风吹乱了桃花林
错把痰唾上了身
这是个临行前的盛会一杯接一杯
我们开始纵情地哀嚎不再躬身肃立
总是在回忆总是在希冀
没有一刻能停啊
于是青冢邂逅了公子笑
从此薤露世上珍
君既不能解我忧 为何问我夜独行
穷途哪有星月光 公子为何慕皮囊
空荡泉台寂无声 执笔采花做凡尘
等过畅往烟消云散 世上少见有心人`,audioUrl:'./audio/10_画皮.opus',videoUrl:'',imageUrl:'./img/art_bg.png'},
                {}
            );
        }
    ]).set('2',[
        '看片',()=>{
            window.gameManager.gameMessage.loader(
                {name:'林元',faceUrl:'./img/林元.jpg'},
                {text:'',audioUrl:'',videoUrl:'./video/Never Gonna Give You Up.webm',imageUrl:''},
                {}
            );
        }
    ]).set('3',[
        '看动画',()=>{
            window.gameManager.gameMessage.self.classList.add('disappear');
            loadCartoon({timeSep: 100,mode: 2});
        }
    ]).set('4',[
        '战斗',()=>{
            window.gameManager.undertaleManager.loader(1);
        }
    ]).set('5',[
        '换人',()=>{
            window.gameManager.gamePlayer.loader(1,[5,4,1],true);
        }
    ])
    .forEach(function(value,key){this[key] = value[0];},objectArray.eventArray.list = {});
}
// file:///D:/Videos/◇魔法闘姫フロスティア_オープニングアニメ.mp4