{
  let view = {
    el: '#editArea',
    init() {
      this.$el = $(this.el)
    },
    template: `
        <form class="form">
          <div class="row">
            <label>
            歌名
            </label>
            <input name="name" type="text" value="__name__">
          </div>
          <div class="row">
            <label>
            歌手
            </label>
            <input name="singer" type="text" value="__singer__">
          </div>
          <div class="row">
            <label>
            外链
            </label>
            <input name="url" type="text" value="__url__">
          </div>
          <div class="row">
            <label>
            封面
            </label>
            <input name="cover" type="text" value="__cover__">
          </div>
          <div class="row">
            <label>
            歌词
            </label>
            <textarea cols=80 rows=10 name="lyrics">__lyrics__</textarea>
          </div>
          <div class="row actions">
            <button type="submit">保存</button>
          </div>
        </form>
      `,
    render(data = {}) {
      let placeholders = ['name', 'singer', 'url', 'id', 'cover', 'lyrics']
      let html = this.template
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '')
      })
      $(this.el).html(html)
      if (!data.id) {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      }
    },
  }

  let model = {
    data: {
      name: '', singer: '', url: '', id: '', cover: '', lyrics:''
    },
    create(data) { //存到leanCloud数据库里
      var Song = AV.Object.extend('Song');
      var song = new Song();
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      song.set('lyrics', data.lyrics);
      return song.save().then((newSong) => {
        let { id, attributes } = newSong
        Object.assign(this.data, { id, ...attributes })
        // 等同于
        // this.data.id = id
        // this.data.name = attributes.name
        // this.data.singer = attributes.singer
        // this.data.url = attributes.url
      }, (error) => {
        console.log(error)
      });
    },
    updata(data){
      var song = AV.Object.createWithoutData('Song', this.data.id)
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('url', data.url)
      song.set('cover', data.cover)
      song.set('lyrics', data.lyrics);
      return song.save().then((response)=>{
        Object.assign(this.data, data)
        return response
      })
    }
  }

  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.bindEvents()
      this.view.render(this.model.data)
      window.eventHub.on('select', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
      window.eventHub.on('new', (data) => { //点击新建
        if (this.model.data.id) {  //如果有id说明是从数据库里拿的 清空表单
          this.model.data = {}
        } else { //如果没id说明用户正在新建 还没保存的 不清空表单
          Object.assign(this.model.data, data)
        }
        this.view.render(this.model.data)
      })
    },
    create(){
      let needs = 'name singer url cover lyrics'.split(' ')  //数组
      let data = {}
      needs.map((string) => {  //获取input的值放进data里
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.create(data).then(() => {
        this.view.render({}) //清空表单
        //深拷贝！这里如果直接传this.model.data相当于传的是地址，会出bug！
        window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data)))
      })
    },
    update(){
      let needs = 'name singer url cover lyrics'.split(' ')  //数组
      let data = {}
      needs.map((string) => {  //获取input的值放进data里
        data[string] = this.view.$el.find(`[name="${string}"]`).val()
      })
      this.model.updata(data).then(()=>{
        window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data))) //修改并保存后 页面上修改的歌曲也要重新渲染
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        if(this.model.data.id){
          this.update()
        }else{
          this.create()
        }
      })
    }
  }
  controller.init(view, model)

}