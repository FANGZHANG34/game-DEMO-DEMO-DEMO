'use strict';
const characterArray = new Map([
    [0,{
        zone: false,
        selfEvent: null,
        name: '无名剑客',
        display: './img/wmjk.png',
        face: './img/actor0.jpg',
        photo: './img/actor0.jpg'
    }],
    [1,{
        zone: false,
        selfEvent: null,
        name: '林元',
        display: './img/actor1.jpg',
        face: './img/actor1.jpg',
        photo: './img/actor1.jpg'
    }]
]);
Object.assign(characterArray,{
    /**
     * 
     * @param {String} name 
     * @param {undefined ｜ String} key 
     * @returns {{} | any}
     */
    getByName(name,key){
        const id = this.list.indexOf(name);
        return key ? memoryHandle('characterArray.'+id+'.'+key) : this.get(id);
    }
}).forEach(function(value,key){this[key] = value.name;},characterArray.list = []);