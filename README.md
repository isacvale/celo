# Celo
This is a loader script for [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that were written down in HTML, as they should be! It listens for changes in DOM and when it detects a custom element, it fetches its markup and inserts it in the document. Its name comes from **C**ustom **E**lement **LO**ader and from the fact that good names in NPM are hard to get.

## How do I use it?
Celo will autoload the web component for you if your follow the rules:
+ Your should include Celo in your html's \<head> since it reacts to the body element entering the DOM.
+ Your components should be in the root folder "/components" (you can change the location in the script file).
+ Each component's name must be lowercase and match the tag intended. So the "\<my-example>" component will be loaded from the file "my-example.html".

## And how does it work?
Celo uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for any element inserted in the DOM that carries a hyphen (ie. a custom element).
Upon detection, it checks if that component has already been used. If it is a new component, it will fetch the markup and add its code to a hidden \<div> with an id of "\_celo".

### A word about subcomponents
You can have multiple components in a single html file, but you should only do it if you have one main component and then _subcomponents_ for it. Think of a subcomponent as:

+ dynamically added by the main component;
+ not suitable to be added as a standalone component; and
+ not intended to be reused by other components.

Subcomponents are separated from their masters only for clarity. If you add the subcomponent tag directly to your html, Celo will try to load it from a file matching its tagName, resulting in a non-fatal error.

### A word about \<script> tags
Any \<script> tag you include in the root of yout html file will be executed right away. That's typically not the case if your \<script> tags are inside \<template> tags. That's because web components typically use the _cloneNode()_ function which flags the scripts as being already executed. Please note that:

+ You probably won't need it though because even if it is inside the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot), _the script won't be scoped_;
+ But if you do need (want) it,  its is an issue to be fixed in the web component itself to fix, not Celo.

If you _must_ for some reason have the \<script> execute from within the shadowRoot, you can check out Celo's _recreateScripts()_ function for a reference on how to do it. But, again, you'd be much better off handling your scripts in the component's _class_ definition.

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.

## What Celo doesn't do for you
+ The web components, for one. You must create them yourself.
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
+ It doesn't polyfill your components.

## And how am I supposed to be writing the components?
Here's how a "simple-example.html" file could look like (I'm not advocating this is the _right_ way to do it, just stating that it works):

```
  <template id="tpl-simple-example">
    <div>
      <p>This is a demo web component.</p>
    </div>
    <style>
      p{
        padding: 5px 10px;
        background-color: antiquewhite;
      }
    </style>
  </template>

  <script>
    class SimpleExample extends HTMLElement{
      constructor(){
        super()
        const el = document.querySelector("#tpl-simple-example")
                            .content.cloneNode(true)
        this.attachShadow({mode:'open'}).appendChild( el )
      }
    }
    customElements.define( 'simple-example',SimpleExample )
  </script>
```
