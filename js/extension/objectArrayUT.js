const metierGrowthArray = {
    _:['_HP','_MP','_HP_R','_MP_R','_AD','_AP','_C_AD','_C_AP','_AGI'],
    普通:{_HP: 300,_MP: 100,_HP_R: 300,_MP_R: 100,_AD: 10,_AP: 0,_C_AD: 10,_C_AP: 0,_AGI: 1},
    战士:{_HP: 300,_MP: 100,_HP_R: 300,_MP_R: 100,_AD: 10,_AP: 0,_C_AD: 10,_C_AP: 0,_AGI: 1}
};
class Strength{
    constructor(StrengthLikeArray){for(let key in (StrengthLikeArray ?? {})){
        (this[key] = StrengthLikeArray[key]) instanceof Object && void(this[key] = copyObj(StrengthLikeArray[key]));
    }
    this.fixStrength();}
    metier; LV = 0; EX = 0; R_EX = 0;
    condition = {};buffArray = []; debuffArray = []; skillArray = {};
    arms; armor; prop; BG;
    _HP; _MP; _HP_R; _MP_R;
    _AD; _AP; _C_AD; _C_AP;
    _AGI;
    fixStrength(){
        // 生成基础面板
        const growRateArray = metierGrowthArray[this.metier ??= '普通'];
        for(let key in growRateArray){this[key] = this.f1(growRateArray[key]);}
    }
    f1(growRate){
        // 数值计算
        return growRate * this.LV;
    }
    getRealStrength(){
        // 获取实时面板
        const temp = Object.assign({},this);
        var key,buff;
        for(buff of this.buffArray){
            buff = arrayUT.buffArray.get(buff);
            for(let strengthKey in temp){
                metierGrowthArray._.includes(key = '_'+strengthKey) || (key = strengthKey);
                temp[key] += buff[strengthKey]?.(this[strengthKey]) ?? buff[strengthKey] ?? 0;
            }
        }
        for(buff of Object.values(this.debuffArray)){
            buff = arrayUT.buffArray.get(buff);
            for(let strengthKey in temp){
                metierGrowthArray._.includes(key = '_'+strengthKey) || (key = strengthKey);
                temp[key] += buff[strengthKey]?.(this[strengthKey]) ?? buff[strengthKey] ?? 0;
            }
        }
        return temp;
    }
    strength2memory(id,thisMemory = window.gameManager.constTemp.memory){
        // 保存面板
        thisMemory.characterArray[id].strength = copyObj(objectArray.characterArray[id].strength);
    }
}
class Buff{
    constructor(strengthKey_fn_Object){
        var temp,key;
        for(key in strengthKey_fn_Object){
            ((temp = strengthKey_fn_Object[key]) instanceof Function || temp > 0 || temp < 0) && (this[key] = temp);
        }
    }
}
const arrayUT = {characterArrayUT: new Map(),buffArray: new Map(),debuffArray: new Map()};
{
    arrayUT.characterArrayUT.set(0,{
        metier: '普通',LV: 10,buffArray: ['主角光环','新手保护','天赋异禀'],debuffArray: ['经验不足','恐惧','半信半疑']
    })
    .forEach(function(value,key){this[key] = key;},arrayUT.characterArrayUT.list = []);
}