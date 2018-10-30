{
    let view = {
        el: '.newSongs',
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
            this.$el = $(this.el);
        },
        render(data) {
            let { songs } = data;
            songs.map((song) => {
                let $li = $(this.template
                    .replace('{{song.name}}', song.name)
                    .replace('{{song.singer}}', song.singer)
                    .replace('{{song.id}}', song.id)
                )
                this.$el.find('#songs').append($li)
            })
        }
    };
    let model = {
        data: {
            songs: []
        },
        find() {
            var query = new AV.Query('Song');
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return Object.assign({ id: song.id }, song.attributes);
                    // 等同于return { id: song.id, ...song.attributes }  但是这种语法在苹果手机safari上有bug
                });
                return songs;
            });
        }
    };
    let controller = {
        init(view, model) {
            this.view = view;
            this.view.init();
            this.model = model;
            this.model.find().then(() => {
                this.view.render(this.model.data)
            });
        },
    };
    controller.init(view, model);
}
