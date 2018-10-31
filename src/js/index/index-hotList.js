{
    let view = {
        el: '.page-2',
        template: `
            <li>
                <a href="./song.html?id={{song.id}}">
                    <div class="rank">{{rank}}</div>
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
        init(){
            this.$el = $(this.el)
        },
        render(data) {
            data.map((song,index) => {
                let $li = $(this.template
                    .replace('{{rank}}', `${this.pad(index+1)}`)
                    .replace('{{song.name}}', song.name)
                    .replace('{{song.singer}}', song.singer)
                    .replace('{{song.id}}', song.id)
                )
                this.$el.find('#hotList').append($li)
            })    
            this.getDate()
        },
        show(){
            this.$el.addClass('active')
        },
        hide(){
            this.$el.removeClass('active')
        },
        getDate(){
            let today = new Date()
            let day = today.getDate()
            let month = today.getMonth() + 1
            $(this.el).find('.hot-music-date').text(`更新日期：${this.pad(month)}月${day}日`)
        },
        pad(number){
            return number >= 10 ? number + '' : '0' + number
        }
    }
    let model = {
        data: {
            songs: []
        },
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.bindEventHub()
        },
        bindEventHub(){
            window.eventHub.on('selectTab', (tabName)=>{
                if(tabName === 'page-2'){
                    this.view.show()
                }else{
                    this.view.hide()
                }
            })
            window.eventHub.on('songlist', (songs)=>{
                this.view.render(songs)
            })  
        }
    }
    controller.init(view, model)
}