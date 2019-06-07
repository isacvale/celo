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
              .then( markUp => injectMarkup( markUp ))
              .then( frag => recreateScripts( frag ))
              .then( frag => addToDOM( frag ))
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

  // Append the html text to a DOM element. This will parse the element, but
  // the scripts won't run.
  function injectMarkup( markUp ){
    let markUpFragment = document.createDocumentFragment()
    let container = document.createElement('div')
    container.innerHTML = markUp
    while( container.firstChild ) markUpFragment.appendChild( container.firstChild )
    return markUpFragment
  }

  // Oftentimes scripts are inserted/cloned with an "already started" flag on,
  // so they just don't run. To deal with that, we recreate them as new
  // elements.
  function recreateScripts( element ){
    element.querySelectorAll( 'script' ).forEach( script => {
      let scriptElement = document.createElement( 'script' )
      scriptElement.appendChild(document.createTextNode(script.innerHTML))
      let container = script.parentElement || element
      container.appendChild( scriptElement )
      container.removeChild( script )
    })
    return element
  }

  // Adds the component to the DOM
  function addToDOM( fragment ){
    const celo = document.querySelector("#_celo")
    celo.append( fragment )
  }

  // Extend cusdtomElements.define to keep synchrounous tag on the custom elements
  let originalCustomElementDefinition = customElements.define
  customElements.define = function(){
    loadedComponents.push( arguments[0] )
    return originalCustomElementDefinition.apply( customElements, arguments )
  }
  setUpObserver()

}())
