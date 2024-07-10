'use strict';
{
    const oldWindowOnload = window.onload;
    /**
     * 
     * @returns {Promise<void>}
     */
    window.onload = ()=>timeRecord(oldWindowOnload).then(({time})=>(
        console.log('!!! TotalWindowOnload 用时',time,'ms'),window.onload = null,
        console.error('请无视图片请求报错，此为fn.js: getImage()函数的容错。')
    ));
}