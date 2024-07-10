'use strict';
class Skill{
    /**
     * 
     * @param {{fn: ({objectID: Number,subjectID: Number,strength: Strength}) => any & "memoryHandle('characterArray.'+objectID+'.strength')",vary: String,buffArray: {}[],debuffArray: {}[]}} param0 
     */
    constructor({note,vary,typeQ,display,fn,buffArray,debuffArray}){
        this.note = note,
        this.vary = vary instanceof String ? vary : '体',
        this.typeQ = ['PQ','AQ','IQ'].includes(typeQ) ? typeQ : 'PQ',
        this.display = display instanceof String ? display : './img/无名剑客.jpg',
        fn instanceof Function && (this.fn = fn),
        buffArray instanceof Array && (this.buffArray = buffArray),
        debuffArray instanceof Array && (this.debuffArray = debuffArray);
    }
}
const skillArrayUT = new Map([
    ['普攻',new Skill({
        vary: '体',
        /**
         * 
         * @param {{objectID: Number,subjectID: Number}} param0 
         */
        fn({objectID,subjectID}){}
    })]
]);
skillArrayUT.forEach(function({vary},key){this[vary] ? this[vary].push(key) : this[vary] = [key];},skillArrayUT.list = {});
// 体-体
// 器-器
// 力-力
// 速-速
// 破-破
// 意-意
// 金/木/水/火/土-五行
// 光/暗-光暗
// 时/空-时空
// 精神-灵眸
// 万物-先天
// 变-变
// 化-化