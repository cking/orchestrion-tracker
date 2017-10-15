module.exports = class {
  onCreate (input) {
    let unlocked = {}
    if (localStorage.getItem('unlocked')) {
      try {
        unlocked = JSON.parse(localStorage.unlocked)
      } catch (err) {}
    }

    this.state = {
      rolls: [],
      unlocked
    }
  }

  onInput (input) {
    let rolls = input.rolls

    if (input.category === 'unkown') {
    } else if (input.category !== 'all') {
    }

    this.state.rolls = rolls
  }

  toggle (id) {
    this.state.unlocked[id] = !this.state.unlocked[id]
    window.localStorage.unlocked = JSON.stringify(this.state.unlocked)
  }
}
