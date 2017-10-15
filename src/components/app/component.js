const url =
  'https://api.xivdb.com/search?string=Orchestrion+Roll&one=items&item_ui_category%7Cet=94&language=en&level_item%7Clt=1'

const categories = require('./categories.json')
const guide = require('./guide.json')

module.exports = class {
  onCreate () {
    this.state = {
      rolls: {},
      filtered_rolls: {},
      category: 'all',
      filter: ''
    }
    this.fetchRolls()
  }

  select (category) {
    this.state.category = category
    if (category === 'all') {
      this.state.filtered_rolls = this.state.rolls
    } else {
      if (category === 'unkown') {
        category = ''
      }

      const rolls = {}
      Object.keys(this.state.rolls).forEach(id => {
        this.state.rolls[id].category = this.state.rolls[id].category || ''
        if (this.state.rolls[id].category == category) {
          rolls[id] = this.state.rolls[id]
        }
      })
      this.state.filtered_rolls = rolls
    }
  }

  filter (ev, el) {
    if (ev instanceof KeyboardEvent) {
      switch (ev.Key) {
        case 'Enter':
          document.querySelector('[type="checkbox"]').click()
        case 'Escape':
          el.select()
          el.focus()
      }
    } else {
      this.state.filter += ev.key
    }
  }

  async fetchRolls (ignoreCache = false) {
    if (!ignoreCache && (window.localStorage.ts && window.localStorage.ts < Date.now() + 1000 * 60 * 60 * 24 * 7)) {
      return setTimeout(() => {
        this.state.rolls = JSON.parse(window.localStorage.rolls)
        this.select(this.state.category)
      }, 10)
    }

    let rolls = []
    let json = {
      paging: {
        next: 1
      }
    }
    do {
      json = await fetch(url + `&page=${json.paging.next}`).then(res => res.json()).then(json => json.items)
      rolls = rolls.concat(json.results)
    } while (json.paging.next && json.paging.page != json.paging.next)

    const state = {}
    rolls.forEach(
      roll =>
        (state[roll.id] = {
          category: categories[roll.id],
          guide: guide[roll.id],
          name: roll.name.replace(/Orchestrion Roll/i, '')
        })
    )
    window.localStorage.rolls = JSON.stringify(state)
    window.localStorage.ts = Date.now()
    this.state.rolls = state
    this.select(this.state.category)
  }
}
