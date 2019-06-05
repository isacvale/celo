# Celo
This is a loader script for web components that were written down in HTML, as they should be! It listens for changes in DOM, and when it detects a custom element, it fetches its markup and inserts it in the DOM. Its name comes from __C__ustom __E__lement __LO__ader and from the fact that good names in NPM are hard to get.

## How do I use it?
Celo will autoload the web component for you if your follow the rules:
+ Your should include Celo in your html's <head> since it reacts to the body element entering the DOM.
+ Your components should be in the root folder "/components" (you can change the location in the script file).
+ Each component's name must be lowercase and match the tag intended. So the "<my-example>" component will be loaded from the file "my-example.html".

### A word about subcomponents
You can have multiple components in a single html file, but you should only do it if you have a main component with one or more subcomponents. Think of a _subcomponent_ as:

+ necessary for the main component to function properly;
+ not suitable to be added as a standalone component;
+ not intended to be reused by other components.

Subcomponents are separated from their masters only for clarity. If you add the subcomponent tag to your html, Celo will try to load it from a file matching its tagName, resulting in an error.

## And how does it work?
Celo uses a MutationObserver to listen for any element inserted in the DOM that carries a hyphen (ie. a custom element).
Upon detection, it checks if that component has already been used. If it is a new component, it will fetch the markup and add its code to a hidden div with an id of "#\_celo".

### But, there's a caveat
In order to separate markup from code within your component, Celo uses regex instead of parsing the whole thing. Currently it assumes all <script> tags are meant to be added to the light DOM, so if you add them within the <template> tags, they'll be stripped away.
You probably don't _need_ <script> tags within the template and will be using lifecycle hooks anyway. But if you do, _then Celo currently isn't for you_.

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.

## What Celo doesn't do for you
+ The web components, for one. You must create them yourself.
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
+ It doesn't polyfill your components.

## And how am I supposed to be writing the components?
Here's how a "simple-example.html" file could look like (I'm not advocating this is the _right_ way to do it, just stating that it works):

  <template id="tpl-simple-example">
    &nbsp;&nbsp;&nbsp;&nbsp;<div>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<p>This is a demo web component.</p>
    &nbsp;&nbsp;&nbsp;&nbsp;</div>
    &nbsp;&nbsp;&nbsp;&nbsp;<style>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p{
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;padding: 5px 10px;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;background-color: antiquewhite;
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
    &nbsp;&nbsp;&nbsp;&nbsp;</style>
  </template>
  <script>
    &nbsp;&nbsp;&nbsp;&nbsp;class SimpleExample extends HTMLElement{
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;constructor(){
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;super()
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const el = document.querySelector("#tpl-simple-example")
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.content.cloneNode(true)
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.attachShadow({mode:'open'}).appendChild( el )
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}
    &nbsp;&nbsp;&nbsp;&nbsp;}
    &nbsp;&nbsp;&nbsp;&nbsp;customElements.define( 'simple-example',SimpleExample )
  </script>
