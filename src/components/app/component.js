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
    this.fetchRolls().then(rolls => {
      this.state.rolls = rolls
      this.select(this.state.category)
    })
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
        if (this.state.rolls[id].category == category) {
          rolls[id] = this.state.rolls[id]
        }
      })
      this.state.filtered_rolls = rolls
    }
  }

  filter (ev, el) {
    this.state.filter = el.value
  }

  async fetchRolls () {
    if (window.localStorage.ts && window.localStorage.ts < Date.now() + 1000 * 60 * 60 * 24 * 7) {
      return new Promise(rs => setTimeout(() => rs(JSON.parse(window.localStorage.rolls)), 100))
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
    return state
  }
}
