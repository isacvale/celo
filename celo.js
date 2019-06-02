(function(){

  // A list to keep track of loaded components, so we don't fetch them twice.
  const loadedComponents = []

  // Sets up an observer that reacts to elements being added to the DOM.
  function setUpObserver(){
    const observer = new MutationObserver( parseElements )
    observer.observe( document, {childList: true, subtree: true} )
    return this
  }

  // If the element is <body>, set up a container and cache. If it has a hyphen,
  // then its a custom: we must fetch it if we don't have done it already.
  function parseElements( elementList ){
    elementList.forEach( el => {
      el = el.addedNodes[0]

      if( el instanceof HTMLElement && el.tagName ){
        let tagName = el.tagName.toLowerCase()

        if( tagName == "body" )
          setUpContainer()
        else if( tagName.includes('-') && isNew( tagName )){
          getMarkUp( tagName )
          .then( markUp => splitMarkup( markUp ))
          .then( markUpSplit => recreateElements( markUpSplit ))
          .then( elementList => addMarkUp( elementList ))
        }
      }
    })
  }

  // Creates a hidden div to hold components markup
  function setUpContainer(){
    let container = document.createElement('div')
    container.id = "_celo"
    document.body.appendChild(container)
  }

  // Checks if component hasn't been loaded yet.
  function isNew( tagName ){
    tagName = tagName.toLowerCase()
    return loadedComponents.includes( tagName )
      ? false
      : loadedComponents.push( tagName )
  }

  // Fetches the needed markup from the server
  function getMarkUp( tagName ){
    return fetch(`/components/${ tagName }.html`)
    .then( res => {
      if( !res.ok )
        console.error(`Component <${ tagName }> not found.`)
      else {
        return res.text()
      }
    })
  }

  // Splits the markup between pure markup and code, which needs to be parsed differently
  function splitMarkup( markUp ){
    let matches = markUp.match(/<script[\S\s]*?>([\S\s]*?)<\/script>/i)
    let markUpText = markUp.replace(matches[0],"")
    let scriptText = matches[1]
    return {markUp:markUpText,script:scriptText}
  }

  // Parse the markep and code by turning them into fragments
  function recreateElements( markUpSplit ){
    let markUpFragment = document.createDocumentFragment()

    let temp = document.createElement('div')
    temp.innerHTML = markUpSplit.markUp
    while(temp.firstChild) markUpFragment.appendChild(temp.firstChild)

    let scriptElement = document.createElement('script')
    scriptElement.appendChild(document.createTextNode(markUpSplit.script))

    return [ markUpFragment, scriptElement ]
  }

  // Adds fragments to the DOM
  function addMarkUp( elementList ){
    let container = document.querySelector("#_celo")
    elementList.forEach( el => container.append(el) )
  }

  setUpObserver()

}())
