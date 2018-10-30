{
    let view = {
        el: '#app',
        init() {
            this.$el = $(this.el);
        },
        render(data) {
            let { song, status } = data
            this.$el.find('.song-bg').css('background-image', `url(${song.cover})`)
            this.$el.find('img.cover').attr('src', song.cover)
            if (this.$el.find('audio').attr('src') !== song.url) {
                this.$el.find('audio').attr('src', song.url)
                let audio = this.$el.find('audio')[0]
                audio.onended = () => {
                    window.eventHub.emit('songEnd')
                }
                audio.ontimeupdate = () => {
                    this.showLyric(audio.currentTime)
                }
            }
            if (status === "playing") {
                this.$el.find('.disc-container').addClass('playing')
            } else {
                this.$el.find('.disc-container').removeClass('playing')
            }
            this.$el.find('.song-description>h1').text(`${song.name} - ${song.singer}`) //歌名歌手
            let { lyrics } = song //歌词
            let array = lyrics.split('\n').map((string) => {
                let p = document.createElement('p')
                let regex = /\[([\d:.]+)\](.+)/  //正则 将歌词分成时间和内容的数组
                let matches = string.match(regex)
                if (matches) {
                    let parts = matches[1].split(':')
                    let minutes = parts[0]
                    let seconds = parts[1]
                    let time = parseInt(minutes) * 60 + parseFloat(seconds) - 0.5 //将时间转换为秒数 做0.5秒延迟
                    p.setAttribute('data-time', time)
                    p.textContent = matches[2]
                } else {
                    p.textContent = string
                }
                this.$el.find('.lines').append(p)
            })

        },
        play() {
            this.$el.find('audio')[0].play()
        },
        pause() {
            this.$el.find('audio')[0].pause()
        },
        showLyric(time) {
            let allLyric = this.$el.find('.lines p')
            let p
            for (let i = 0; i < allLyric.length; i++) {
                if (i === allLyric - 1) { //如果到歌词最后一行
                    p = allLyric[i]
                    break
                } else {
                    let currentTime = allLyric.eq(i).attr('data-time')
                    let nextTime = allLyric.eq(i + 1).attr('data-time')
                    if (currentTime <= time && time < nextTime) {
                        p = allLyric[i]
                        break
                    }
                }

            }
            let height = p.getBoundingClientRect().top - this.$el.find('.lines')[0].getBoundingClientRect().top
            this.$el.find('.lines').css('transform', `translateY(-${height - 24}px)`)
            $(p).addClass('active').siblings('.active').removeClass('active')
        }
    };
    let model = {
        data: {
            song: {
                id: '',
                name: '',
                singer: '',
                url: ''
            },
            status: 'paused'
        },
        get(id) {
            var query = new AV.Query('Song');
            return query.get(id).then((song) => {
                Object.assign(this.data.song, { id: song.id }, song.attributes)
                //等同于 Object.assign(this.data.song, { id: song.id, ...song.attributes })
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
            this.model.get(id).then(() => {
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
                if (this.view.$el.find('audio')[0].paused) { //移动端不自动播放 所以要判断一下不让碟片转动了
                    this.view.$el.find('.disc-container').removeClass('playing')
                }
            })
            this.bindEvents()
        },
        bindEvents() {
            this.view.$el.on('click', '.icon-play', () => {
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
            })
            this.view.$el.on('click', '.icon-pause', () => {
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
                this.view.pause()
            })
            window.eventHub.on('songEnd', () => {
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
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


