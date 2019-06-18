
# Celo
This is a loader script for [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that were written down in HTML, as they should be!
The _**C**ustom **E**lement **LO**ader_, aka Celo, listens for changes in DOM and when it detects a custom element being added, it fetches its markup and inserts it in the document.

## How do I use it?
Celo will autoload web components for you if your follow the rules:
+ [Import celo](#settingup), either as an ES6 module or a simple script.
+ Place your components should be in the root folder "/components" (or change the default location in the [configuration](#configuration)).
+ Each component's name must be lowercase and match the tag intended. So the "\<my-example>" component will be loaded from the file "my-example.html".

## And how does it work?
Celo uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for any element inserted in the DOM that carries a hyphen (ie. a custom element). Upon detection, if it hasn't done it already, it fetches the markup and add its code to a hidden \<div> with an id of "\_celo".
Any custom element already parsed when Celo is called in is then reinserted  into the DOM to be reparsed.

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.
## <a name="settingup"></a>Setting up
Celo comes in two flavours: the preferred one is an EcmaScript 6 Module, but you can also just import it as a simple script. Either way, Celo is an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE). It will execute automatically, won't pollute your global namespace and it returns the Mutation Observer, but you most likely won't need to keep a reference to it.
### ES6 Module (4.5kB)
```
<script type="module">
	import '/celo.mjs'
</script>
```
In case you want a fallback, you can run the minified ES5 version with a _nomodule_ attribute:
```
<script nomodule src="/celo.min.js"></script>
```
Either way, celo is just an  -- it won't pollute the global namespace, but it won't return you anything. You're just meant to unleash it.
### Simple ES5 Script
```
<script src="/celo.min.js"></script>
```
### <a name="configuration">Configuration
To configure Celo you must create a global variable called celoConfig. Its "componentsPath" property determines the path you want to keep your components' HTML. The "containerId" property determines the id of the div that will receive the web components' templates. It is usually declared on a \<script> tag of its own just before importing Celo. In the example below, please note the use of "var" instead of "let" or "const".
```
<script>var celoConfig = { containerId: "_customId" }</script>
```

## The fineprint you ought to know

### Backward compatibility
Starting at version 1.1.0, Celo is an ES6 module. Because those a asynchronous, Celo has to retroactively address all components already parsed by the time it is loaded. On the plus side, it doesn't need to be imported in the \<head> anymore. If your app used Celo prior to 1.1.0 and you want to update, please double check how it is being called.

### A word about subcomponents
Usually, each web component has its own HTML file. If you want to have multiple components in a single HTML, it should be a single main component and its _subcomponents_. Think of a subcomponent as:

+ being dynamically added by the main component;
+ not suitable to be added as a standalone component; and
+ not intended to be reused by other main components.

Subcomponents are separated from their masters just for clarity. If you add the subcomponent tag directly to your HTML, Celo will try to load it from a file matching its tagName, resulting in a non-fatal error.

### A word about \<script> tags
Any \<script> tag you include in the root of yout HTML file will be executed right away. That's typically not the case if your \<script> tags are inside \<template> tags. That's because web components typically use the _cloneNode()_ function which flags the scripts as being already executed. Please note that:

+ You probably don't need to include \<script> tags inside the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot);
+ Even if you do include it in the shadowRoot, _the script won't be scoped_;
+ But if you do need (want) to do it,  its is an issue to be dealt with in the web component itself, it's not up to Celo.

If you _must_ for some reason have the \<script> execute from within the shadowRoot, you can check out Celo's _recreateScripts()_ function for a reference on how to do it. But, again, you would be much better off handling your scripts in the component's _class_ definition.

### What Celo doesn't do for you
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
+ It doesn't polyfill your components.

## And how am I supposed to be writing the components?
Below you will find how a "simple-example.html" file could look like (I'm not advocating this is the _right_ way to do it, just stating that it works). It has two root elements: a \<template> and a \<script>. All the markup goes into the \<template>, including any \<style>.

Note that \<script> is outside \<template> so it will run as soon as the component is fetched. It also means the code won't be inside the shadowRoot -- I would recommend placing all needed code inside the class definition and leave the \<template> clear of code.

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
