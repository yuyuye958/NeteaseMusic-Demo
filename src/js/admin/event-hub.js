window.eventHub = {
    events: {
        //'羊城晚报': [fn],
        //'楚天都市报': [],
    }, // hash
    emit(eventName, data) { //发布
        for (let key in this.events) {
            if (key === eventName) {
                let fnList = this.events[key]
                fnList.map((fn) => {
                    fn.call(undefined, data)
                })
            }
        }
    },
    on(eventName, fn) { //订阅  把函数放到events这个哈希表里
        if (this.events[eventName] === undefined) {
            this.events[eventName] = []  // 没有就初始化
        }
        this.events[eventName].push(fn) // 有就直接push
    },
}