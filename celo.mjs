export default (function (){

  // Defining variables
  let config = window.celoConfig ? window.celoConfig : {}
  const componentsPath =  config.componentsPath ? config.componentsPath : "/components"
  const containerId = config.containerId ? config.containerId : "_celo"

  // A list to keep track of loaded components, so we don't fetch them twice.
  const loadedComponents = []

  // Sets up an observer that reacts to elements being added to the DOM.
  function setUpObserver () {
    const observer = new MutationObserver(parseElements)
    observer.observe(document, { childList: true, subtree: true })
    return observer
  }

  // If the element is <body>, set up a container and cache. If it has a hyphen,
  // then its a custom: we must fetch it if we don't have done it already.
  // This is a recursive function, so it will allow deeply parsing (necessary
  // for use in React).
  function parseElements (elementList) {
    elementList.forEach(el => {
      if (el.addedNodes) el = el.addedNodes[0]
      if (el instanceof HTMLElement) parseElements( el.childNodes )
      else return false
      if( !el.tagName.includes('-')) return false

      const tagName = el.tagName.toLowerCase()
      if( loadedComponents.includes(tagName)) return

      setUpContainer()
      markDefined(tagName)
      getMarkUp(tagName)
        .then(markUp => injectMarkup(markUp))
        .then(frag => recreateScripts(frag))
        .then(frag => addToDOM(frag))
        .then(() => el.shadowRoot && parseElements(el.shadowRoot.childNodes))
    })
  }

  // A hidden div is needed to hold the components' templates. Let's check if it
  // exists, and create it if it doesn't.
  function setUpContainer () {
    if( !document.querySelector(`#${containerId}`) && document.querySelector('body') ){
        const container = document.createElement('div')
        container.id = containerId
        document.body.appendChild(container)
      }
  }

  // Checks if component hasn't been loaded yet.
  function isNew( tagName ){
    return !loadedComponents.includes( tagName.toLowerCase() )
  }

  // Make a note of loaded web component
  function markDefined( tagName ){
    loadedComponents.push( tagName )
  }

  // Fetches the needed markup from the server
  function getMarkUp( tagName ){
    return fetch(`${componentsPath}/${ tagName }.html`)
    .then( res => {
      if( !res.ok )
        console.warn(`Component <${ tagName }> not found. Is it a subcomponent?`)
      else
        return res.text()
    })
  }

  // Append the html text to a DOM element. This will parse the element, but
  // the scripts won't run.
  function injectMarkup( markUp ){
    if( !markUp ) return false

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
    if( !element ) return false

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
    if( !fragment ) return false
    document.querySelector(`#${containerId}`).append( fragment )
  }

  // Scans elements parsed before the observer was in effect and
  // reparse them
  function backSearch(){
    const elList = Array.from( document.getElementsByTagName("*") )
                  .filter( el => el.tagName.includes("-"))
    elList.forEach( el => reparseElement( el ))
  }

  // Remove an element and attach it to the same position, forcing it to be reparsed.
  function reparseElement( el ){
    let parent = el.parentNode
    let sibling = el.nextSibling
    el.parentNode.removeChild(el)
    if( sibling )
      parent.insertBefore( el, sibling )
    else
      parent.appendChild( el )
  }

  // Extends customElements.define to keep synchrounous tag on the custom elements
  const originalCustomElementDefinition = customElements.define
  customElements.define = function(){
    loadedComponents.push( arguments[0] )
    return originalCustomElementDefinition.apply( customElements, arguments )
  }

  setUpContainer()
  let watcher = setUpObserver()
  backSearch()
  return watcher
})()
