'use strict';
const metierGrowthArray = {
    _: ['PQ','AQ','IQ','UQ','HP','MP','HP_R','MP_R','AD','AP','C_AD','C_AP','AGI'],
    '普通': [2,2,0,0],
    '万物': [0,0,0,4],
    '力': [1,0,1,2],'五行': [0,0,2,2],
    '速': [0,1,1,2],'光暗': [0,1,2,1],
    '破': [0,0,1,3],'时空': [0,0,3,1],
    '意': [0,0,1,3],'精神': [0,0,3,1]
};
class Strength{
    constructor(strengthLikeArray = {}){
        Object.assign(this,copyObj(strengthLikeArray));
        this.fixStrength();
    }
    // PQ => HP,HP_R,C_AD
    // AQ => AD,C_AP,AGI
    // IQ => MP,MP_R,AP
    metier; LV = 0; EX = 0; R_EX = 0;
    buffArray = []; debuffArray = []; skillArray = {}; condition = {HP: 0, MP: 0,PQ: 20,AQ: 20,IQ: 20,UQ: 10};
    arms; armor; prop; BG;
    _HP; _MP; _HP_R; _MP_R;
    _AD; _AP; _C_AD; _C_AP;
    _AGI;
    fixStrength(metier = this.metier ?? '普通'){
        // 生成基础面板
        [metier] = metier.split(' '),metier !== '_' && Object.keys(metierGrowthArray).includes(metier) ?
        this.f1(metier) : console.error('=> Wrong metier "'+metier+'" !');
    }
    /**
     * 
     * @param {Strings} metier 
     */
    f1(metier){
        // 数值计算
        const keys = metierGrowthArray._,growthArray = metierGrowthArray[metier];
        this._condition = copyObj(this.condition);
        var i,buffName,buff;
        for(i = 0;i < 4;i++){
            (this['_'+keys[i]] = Math.max(growthArray[i] * this.LV + this._condition[keys[i]],0)) ||
            console.error('=> Get wrong '+keys[i],this['_'+keys[i]]);
        }
        for(buffName of objArrayFilter(this.buffArray,t=>Boolean(t)).concat(objArrayFilter(this.debuffArray,t=>Boolean(t)))){
            if(!((buff = skillArrayUT.get(buffName)) instanceof Object)){console.error('=> Wrong buff with '+buffName);continue;}
            buff = buff.vary === '化' ? buff.fn({strength: this}) : {};
            for(i of Object.keys(buff)){this._condition[i] += buff[i];}
        }
    }
    getRealStrength(){
        // 获取实时面板
        const temp = Object.assign({},this),tempKeys = metierGrowthArray._.slice(4);
        var key,buffName,buff,strengthKey;
        for(buffName of objArrayFilter(this.buffArray,t=>Boolean(t)).concat(objArrayFilter(this.debuffArray,t=>Boolean(t)))){
            buff = skillArrayUT.get(buffName);
            buff = buff.vary === 1 ? buff.fn({strength: this}) : {};
            for(strengthKey of Object.keys(temp)){
                key = tempKeys.includes(strengthKey) ? '_'+strengthKey : strengthKey;
                temp[key] += buff[strengthKey] ?? 0;
            }
        }
        return temp;
    }
    strength2memory(id,thisMemory = window.gameManager.constTemp.memory){
        // 保存面板
        thisMemory.characterArray[id].strength = copyObj(characterArray.get(id).strength);
    }
}
// class Buff{
//     constructor(strengthKey_fn_Object = {},{defaultFn = (target,source)=>console.log(target,source),level = 0} = {}){
//         var temp,key;
//         for(key of Object.keys(strengthKey_fn_Object)){
//             ((temp = strengthKey_fn_Object[key]) instanceof Function || temp > 0 || temp < 0) && (this[key] = temp);
//         }
//         defaultFn instanceof Function && (this.defaultFn = defaultFn),level.constructor === Number && (this.level = level);
//     }
// }
const characterStrengthArrayUT = new Map([
    [0,{
        metier: '普通',LV: 10,
        buffArray: [{'主角光环': -1,'新手保护': -1,'天赋异禀': -1}],
        debuffArray: [{'经验不足': -1,'恐惧': -1,'半信半疑': -1}],
        skillArray: Object.assign({'普攻': 1,'投降': 1},[1,1,1,1,1,1,12,2,2,2,,2,2,2,,2,2,2,1])
    }],
    [1,{
        metier: '普通',LV: 12,
        buffArray: [{'天赋异禀': -1}],
        debuffArray: [{}],
        skillArray: Object.assign({'普攻': 1})
    }]
]);
characterStrengthArrayUT.forEach(function(value,key){this[key] = key;},characterStrengthArrayUT.list = []);