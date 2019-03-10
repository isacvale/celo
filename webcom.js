const loaded = []

// Create an observer to parse any element added to DOM
function setUpWebcom(){
  const observer = new MutationObserver(this.parseElements)
  observer.observe(document,{childList: true,subtree: true})
}

// Evaluates if added is a web component
function parseElements( elementList ){
  elementList.forEach( el => {
    el = el.addedNodes[0]
    if(el instanceof HTMLElement && el.tagName){
      if(el.tagName.includes('-') && !loaded.includes(el.tagName)){
        loaded.push( el.tagName)
        parseWecom( el )
      }
      else if( el.tagName.toLowerCase() == "body")
        createContainer()
    }
  })
}

function parseWecom( element ){

  // Get component markup...
  let getMarkup = new Promise(function(resolve, reject){
    if( localStorage.getItem( getKey(element)))
      resolve( localStorage.getItem( getKey(element)))
    resolve( fetchComponentFromServer( element ))
  })

  .then(function( markUp ){
    return splitMarkup( markUp )
  })

  // Recreate element from markUp
  // qwerty: component is being inserted but script is not being evaluated
  .then(function( texts ){
    let markUpFragment = document.createDocumentFragment()
    let temp = document.createElement('div')
    temp.innerHTML = texts.markUp
    while(temp.firstChild) markUpFragment.appendChild(temp.firstChild)

    let scriptElement = document.createElement('script')
    scriptElement.appendChild(document.createTextNode(texts.script))
    return [markUpFragment,scriptElement]
  })

  // Injects element in the container
  .then(function( elements ){
    elements.forEach( el => document.querySelector("#_webcom").append(el))
    return true
  })

  .catch(e => {
    console.log(e)
  })
}

function splitMarkup( markUp ){
  // Splits markup into normal and script text
  let matches = markUp.match(/<script[\S\s]*?>([\S\s]*?)<\/script>/i)
  let markUpText = markUp.replace(matches[0],"")
  let scriptText = matches[1]
  return {markUp:markUpText,script:scriptText}
}

function createContainer(){
  let container = document.createElement('div')
  container.id = "_webcom"
  document.body.appendChild(container);
}

function fetchComponentFromServer( element ){
  const markUpPromise = fetch(`/components/${element.tagName.toLowerCase()}.html`)
  .then( res => {
            if(res.ok) return res.text()
            else {
              throw new Error(`Component <${element.tagName.toLowerCase()}> not found.`)
              return false
            }
          })
  .then( markUp => saveComponent( getKey(element), markUp ))
  .catch( e => console.log(e) )
}

function getKey( element ){
  return `w-c-${element.tagName.toLowerCase()}`
}

function saveComponent( key, markUp ){
  localStorage.setItem( key, markUp )
}

setUpWebcom()
