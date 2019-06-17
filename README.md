
# Celo
This is a loader script for [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that were written down in HTML, as they should be!
The _**C**ustom **E**lement **LO**ader_, aka Celo, listens for changes in DOM and when it detects a custom element, it fetches its markup and inserts it in the document.

## How do I use it?
Celo will autoload web components for you if your follow the rules:
+ [Import celo](#settingup), either as an ES6 module or a simple script.
+ Place your components should be in the root folder "/components" (or change the default location in the script file).
+ Each component's name must be lowercase and match the tag intended. So the "\<my-example>" component will be loaded from the file "my-example.html".

## And how does it work?
Celo uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for any element inserted in the DOM that carries a hyphen (ie. a custom element). Upon detection, if it hasn't done it already it fetches the markup and add its code to a hidden \<div> with an id of "\_celo".
Any custom element already parsed when Celo is called in is then reinserted  into the DOM to be reparsed.

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.
## <a name="settingup"></a>Setting up
Celo is an ES6 module (4.3kB) that could be called with the code below.
```
<script type="module">
	import celo from '/celo.mjs'
</script>
```
The minified version is not a module, and is transpiled to ES5. You could just link to it as an external script, or add a _nomodule_ attribute to make it a fallback:
```
<script nomodule src="/celo.js"></script>
```
Either way, celo is just an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) -- it won't pollute the global namespace, but it won't return you anything. You're just meant to unleash it.

## The fineprint you ought to know

### Backward compatibility
In this latest version Celo is an ES6 module. Under the hood, because modules are asynchronous, Celo will now retroactively address all components already parsed by the time it is loaded. This is done by detaching then appending the elements in the same position in the DOM, as not to brake any references.

From a developer's perspective this change only affects how Celo is imported into your app. It doesn't require being in the \<head> anymore, and you should preferably used as an ES6 module with a _nomodule_ fallback. If you update Celo on an app with the previous version without addressing this, _it will brake_.

### A word about subcomponents
You can have multiple components in a single html file, but you should only do it if you have one main component and then _subcomponents_ for it. Think of a subcomponent as:

+ dynamically added by the main component;
+ not suitable to be added as a standalone component; and
+ not intended to be reused by other components.

Subcomponents are separated from their masters only for clarity. If you add the subcomponent tag directly to your html, Celo will try to load it from a file matching its tagName, resulting in a non-fatal error.

### A word about \<script> tags
Any \<script> tag you include in the root of yout html file will be executed right away. That's typically not the case if your \<script> tags are inside \<template> tags. That's because web components typically use the _cloneNode()_ function which flags the scripts as being already executed. Please note that:

+ You probably don't need to include \<script> tags inside the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot);
+ Even if you do include it in the shadowRoot, _the script won't be scoped_;
+ But if you do need (want) to do it,  its is an issue to be dealt in the web component itself to fix, not in Celo.

If you _must_ for some reason have the \<script> execute from within the shadowRoot, you can check out Celo's _recreateScripts()_ function for a reference on how to do it. But, again, you would be much better off handling your scripts in the component's _class_ definition.

### What Celo doesn't do for you
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
+ It doesn't polyfill your components.

## And how am I supposed to be writing the components?
Below you will find how a "simple-example.html" file could look like (I'm not advocating this is the _right_ way to do it, just stating that it works). It has two root elements: a \<template> and a \<script>. All the markup goes into the \<template>, including any \<style>.

Note that \<script> is outside \<template> so it will run as soon as the component is fetched. It also means the code won't be inside the shadowRoot -- I would recommend placing all needed code inside the class definition and leave the \<template> clear of it.

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
