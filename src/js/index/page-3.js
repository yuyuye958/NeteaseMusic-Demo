{
    let view = {
        el: '.page-3',
        template: `
            <li>
                <a href="./song.html?id={{song.id}}">
                    <h3>{{song.name}}</h3>
                    <p>
                        <svg class="icon icon-sq" aria-hidden="true">
                            <use xlink:href="#icon-sq"></use>
                        </svg>
                        {{song.singer}}
                    </p>
                    <div class="playButton">
                        <svg class="icon icon-play" aria-hidden="true">
                            <use xlink:href="#icon-play"></use>
                        </svg>
                    </div>
                </a>   
            </li>        
        `,
        init() {
            this.$el = $(this.el)
        },
        render(data) {
            let { songs } = data;
            songs.map((song) => {
                if ($('.results li a').attr('href') !== `./song.html?id=${song.id}`) {
                    let $li = $(this.template
                        .replace('{{song.name}}', song.name)
                        .replace('{{song.singer}}', song.singer)
                        .replace('{{song.id}}', song.id)
                    )
                    this.$el.find('.results').append($li)
                }
            })
        },
        show() {
            $(this.el).addClass('active')
        },
        hide() {
            $(this.el).removeClass('active')
        }
    }
    let model = {
        data: {
            songs: []
        },
        find(data) { //组合查询
            let name = new AV.Query('Song');
            let singer = new AV.Query('Song');
            name.startsWith('name', data);
            singer.startsWith('singer', data);
            let query = AV.Query.or(name, singer);
            return query.find().then((results) => {
                this.data.songs = results.map((song) => {
                    return Object.assign({ id: song.id }, song.attributes);
                    // 等同于return { id: song.id, ...song.attributes }  但是这种语法在苹果手机safari上有bug
                });
                return results;
            });
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.view.init()
            this.model = model
            this.bindEventHub()
            this.bindEvents()
        },
        bindEventHub() {
            window.eventHub.on('selectTab', (tabName) => {
                if (tabName === 'page-3') {
                    this.view.show()
                } else {
                    this.view.hide()
                }
            })
        },
        bindEvents() {
            this.view.$el.on('input', '#search', (e) => {
                let val = $(e.currentTarget).val()
                if (val) {
                    $('.default').hide()
                    $('.results').show()
                    this.model.find(val).then(() => {
                        this.view.render(this.model.data)
                    })
                } else {
                    $('.default').show()
                    $('.results').hide()
                    this.view.$el.find('.results li').remove()
                }

            })
        }
    }
    controller.init(view, model)
}