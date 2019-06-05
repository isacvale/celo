(function(){

  // Where components are located
  let folder = '/components'

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

        if( tagName.includes('-') ){

          if( isNew( tagName ) ){
            markDefined(tagName)
            getMarkUp( tagName )
              .then( markUp => splitMarkup( markUp ))
              .then( markUpSplit => recreateElements( markUpSplit ))
              .then( elementList => addMarkUp( elementList ))

          }
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
    return !loadedComponents.includes( tagName )
  }

  // Make a note of loaded web component
  function markDefined( tagName ){
    loadedComponents.push( tagName )
  }

  // Fetches the needed markup from the server
  function getMarkUp( tagName ){
    return fetch(`${folder}/${ tagName }.html`)
    .then( res => {
      if( !res.ok ){
        console.warn(`Component <${ tagName }> not found. Is it a subcomponent?`)
        return false
      }
      else {
        return res.text()
      }
    })
  }

  function splitMarkup( markUp ){
    if(!markUp) return {markUp:"",script:""}

    let textMarkup = markUp
    let textScript = ""

    let scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/gi
    let matchScript
    while( matchScript = scriptRegex.exec(markUp) ){
      textMarkup = textMarkup.replace( matchScript[0],"" )
      textScript += matchScript[1]
    }

    return {markUp:textMarkup,script:textScript}
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

  // Extend cusdtomElements.define to keep synchrounous tag on the custom elements
  let originalCustomElementDefinition = customElements.define
  customElements.define = function(){
    loadedComponents.push( arguments[0] )
    return originalCustomElementDefinition.apply( customElements, arguments )
  }
  setUpObserver()

}())
