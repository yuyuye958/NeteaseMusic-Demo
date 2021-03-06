{
    let view = {
        el: '.songList-container',
        template: `
        <ul class="songList">
        </ul>
      `,
        render(data) {
            let $el = $(this.el)
            $el.html(this.template)
            console.log(1)
            let { songs, selectedSongId } = data
            let liList = songs.map((song) =>{
                let $icon1 = $(`
                    <svg class="icon icon-music" aria-hidden="true">
                        <use xlink:href="#icon-music"></use>
                    </svg>
                `)
                let $icon2 = $(`
                    <svg class="icon icon-delete" aria-hidden="true">
                        <use xlink:href="#icon-delete"></use>
                    </svg>
                `)
                let $name = $('<p class="songName"></p>').text(song.name)
                let $singer = $('<p class="songSinger"></p>').text(song.singer)
                let $song = $('<div class="song"></div>').append($name).append($singer)
                let $li = $('<li></li>').append($icon1).append($song).append($icon2).attr('data-song-id', song.id)
                if (song.id === selectedSongId){
                    $li.addClass('active')
                }
                return $li
            })
            $el.find('ul').empty()
            liList.map((domLi) => {
                $el.find('ul').append(domLi)
            })
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: [],
            selectSongId: undefined
        },
        find() {
            var query = new AV.Query('Song')
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return { id: song.id, ...song.attributes }
                })
                return songs
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.getAllSongs()
            this.bindEvents()
            this.bindEventHub()
        },
        getAllSongs() {
            return this.model.find().then(() => { //从数据库获取数据并渲染页面
                console.log(1)
                this.view.render(this.model.data)
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                $('#uploadArea').hide()
                $('#editArea').show()
                
                let songId = e.currentTarget.getAttribute('data-song-id')

                this.model.data.selectedSongId = songId  //保存哪个li被选中了
                this.view.render(this.model.data)

                let data
                let songs =this.model.data.songs
                for(let i = 0; i<songs.length; i++){
                  if(songs[i].id === songId){
                    data = songs[i]
                    break
                  }
                }
                //深拷贝后再传数据
                window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
            })
            $(this.view.el).on('click', '.icon-delete', (e) => {
                let songLi = $(e.currentTarget).parent()
                let songId = songLi.attr('data-song-id')
                e.stopPropagation() //要阻止冒泡
                let song = AV.Object.createWithoutData('Song', songId);
                $('.ifDelete').addClass('active')

                $('.btnDelete').on('click',(e)=>{
                    song.destroy().then( (success) =>{
                        songLi.remove()
                        this.model.find()
                        this.view.render(this.model.data)
                        $('#uploadArea').show()
                        $('#editArea').hide()
                    }, function (error) {
                        alert('删除失败!')
                    });
                    $('.ifDelete').removeClass('active')
                })
                $('.btnNoDelete').on('click',(e)=>{
                    $('.ifDelete').removeClass('active')
                })
               
            })
        },
        bindEventHub() {
            window.eventHub.on('create', (songData) => {
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', () => {
                this.view.clearActive()
            })
            window.eventHub.on('update', (song) => { //遍历data的songs 如果id相同那么就是这个song要重新渲染
                let songs = this.model.data.songs
                for(let i=0; i<songs.length; i++){
                    if(songs[i].id === song.id){
                        Object.assign(songs[i], song)
                    }
                }
                this.view.render(this.model.data)
            })
        }
    }

    controller.init(view, model)
}