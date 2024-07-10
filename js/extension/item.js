'use strict';
const itemArray = {
    onceArray: new Map([
        ['绷带',{
            type: '恢复',
            display: './img/无名剑客.jpg',
            note: '',
            fn(){}
        }],
        ['气血丹',{
            type: '成长',
            display: './img/林元.jpg',
            note: '',
            fn(){}
        }]
    ]),
    twiceArray: new Map([
        ['绷带',{
            type: '恢复',
            display: './img/无名剑客.jpg',
            note: '',
            fn(){}
        }],
        ['气血丹',{
            type: '成长',
            display: './img/林元.jpg',
            note: '',
            fn(){}
        }]
    ]),
    onfitArray: new Map([
        ['绷带',{
            type: '上肢',
            display: './img/无名剑客.jpg',
            note: '',
            fn(){}
        }],
        ['长袍',{
            type: '上衣',
            display: './img/林元.jpg',
            note: '',
            fn(){}
        }]
    ])
};
itemArray.onceArray.forEach(function(value,key){this[value.type].push(key);},itemArray.onceArray.list = {
    '恢复': [],
    '成长': [],
    '功能': [],
    '战斗': [],
    '材料': [],
    '杂类': []
});
itemArray.twiceArray.forEach(function(value,key){this[value.type].push(key);},itemArray.twiceArray.list = {
    '恢复': [],
    '成长': [],
    '功能': [],
    '战斗': [],
    '道具': []
});
itemArray.onfitArray.forEach(function(value,key){this[value.type].push(key);},itemArray.onfitArray.list = {
    '头部': [],
    '饰品': [],
    '上肢': [],'上衣': [],'内衣': [],
    '下肢': [],'下裤': [],'内裤': [],
    '足部': []
});