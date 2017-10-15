require('./components/app/index.marko').render({}).then(dom => {
  const main = document.getElementById('main')
  while (main.firstChild) {
    main.removeChild(main.firstChild)
  }
  dom.appendTo(main)
})
