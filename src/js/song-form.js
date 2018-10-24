{
  let view = {
    el: '.page > main',
    init() {
      this.$el = $(this.el)
    },
    template: `
        <h1>新建歌曲</h1>
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
          <div class="row actions">
            <button type="submit">保存</button>
          </div>
        </form>
      `,
    render(data = {}) {
      let placeholders = ['name', 'singer', 'url', 'id']
      let html = this.template
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '')
      })
      $(this.el).html(html)
    },
  }
  let model = {
    data: {
      name: '', singer: '', url: '', id: ''
    },
    create(data) { //存到leanCloud数据库里
      var Song = AV.Object.extend('Song');
      var song = new Song();
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
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
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.bindEvents()
      this.view.render(this.model.data)
      window.eventHub.on('upload', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
      window.eventHub.on('select', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        let needs = 'name singer url'.split(' ')  //数组
        let data = {}
        needs.map((string) => {  //获取input的值放进data里
          data[string] = this.view.$el.find(`[name="${string}"]`).val()
        })
        this.model.create(data).then(() => {
          this.view.render({}) //清空表单
          //深拷贝！这里如果直接传this.model.data相当于传的是地址，会出bug！
          window.eventHub.emit('create', JSON.parse(JSON.stringify(this.model.data)))
        })
      })
    }
  }
  controller.init(view, model)

}