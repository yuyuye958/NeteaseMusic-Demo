{
    let view = {
        el: '#app',
        template: `
            <audio src={{url}}></audio>
            <div>
                <button class="play">播放</button>
                <button class="pause">暂停</button>
            </div>
        `,
        init() {
            this.$el = $(this.el);
        },
        render(data){
            this.$el.html(this.template.replace('{{url}}',data.url))
        },
        play(){
            let audio = $(this.el).find('audio')[0]
            audio.play()
        },
        pause(){
            let audio = $(this.el).find('audio')[0]
            audio.pause()
        }
    };
    let model = {
        data: {
            id: '',
            name: '',
            singer: '',
            url: ''
        },
        get(id) {
            var query = new AV.Query('Song');
            return query.get(id).then((song) => {
                Object.assign(this.data, {id:song.id, ...song.attributes})
                return song
            }, function (error) {
                console.log(error)
            });
        }
    };
    let controller = {
        init(view, model) {
            this.view = view;
            this.view.init();
            this.model = model;
            let id = this.getSongId()
            this.model.get(id).then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvents()
        },
        bindEvents(){
            this.view.$el.on('click', '.play', ()=>{
                this.view.play()
            })
            this.view.$el.on('click', '.pause', ()=>{
                this.view.pause()
            })
        },
        getSongId() {//通过url中的查询参数获取id
            let search = window.location.search
            if (search.indexOf('?') === 0) {  //去掉问号
                search = search.substring(1)
            }

            let array = search.split('&').filter(v => v)  //过滤空字符串
            let id = ''

            for (let i = 0; i < array.length; i++) {
                let kv = array[i].split('=')
                let key = kv[0]
                let value = kv[1]
                if (key === 'id') {
                    id = value
                    break
                }
            }

            return id
        }
    };
    controller.init(view, model);
}


