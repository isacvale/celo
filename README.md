
# Celo
This is a loader script for [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) that were written down in HTML, as they should be!
The _**C**ustom **E**lement **LO**ader_, or Celo, listens for changes in DOM and when it detects a custom element being added, it fetches its markup and inserts it in the document.

## How do I use it?
Celo will autoload web components for you if your follow the rules:
+ [Import celo](#settingup) either as an [ES6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) or a simple script.
+ Your components should be in the folder "/components" (or any single folder [set in the configuration](#configuration)).
+ Your components' names must be lowercase and match the tags intended. So the "\<my-example>" component will be loaded from the file "my-example.html".

## And how does it work?
Celo uses a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for any element inserted in the DOM that carries a hyphen (ie. a custom element). Upon detection, if it hasn't done so already, it fetches the markup and add its code to a hidden \<div> with an id of "\_celo" (also [configurable](#configuration)).

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.

## <a name="settingup"></a>Setting up
Celo comes in two flavours: you can import it as an ES6 Module or as a simple script. In either way, Celo is an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE). It will execute automatically, won't pollute your global namespace and though it returns the Mutation Observer, but you most likely don't need to keep a reference to it.

The difference is that importing a script will block the HTML parser, while ES6 Modules are deferred by default, allowing your page to show the appearance quick ans then (quite quickly) load the interactivity. That is a great idea.

But Celo is the kind of thing you'd _want_ to block the parser! As an ES6 Module, Celo will only be fired after the DOM is parsed, so it'll loop through all elements in your page and reinsert custom elements to be reparsed. Yikes! That means your page _will_ blink without the components, before inserting them half a second later.

Importing it directly as a script would do the opposite, loading Celo and the components as they are needed, so your page is loaded in one go. The delay is usually minor, and there's no blink. This is currently the preferred method for loading Celo (even is modules do usually rock!).

### ES6 Module (4.6kB)
```
<script type="module">
	import '/celo.mjs'
</script>
```
In case you want a fallback, you can run the minified ES5 version with a _nomodule_ attribute:
```
<script nomodule src="/celo.min.js"></script>
```
### Simple ES5 Script (4.3/1.6 kB)
```
<script src="/celo.js"></script>
```
or

```
<script src="/celo.min.js"></script>
```
The script version is transpiled to work under ES5.

## Useful information

### Backward compatibility
Methods of loading celo have changed slightly in recent version. Make sure to check the set up if you run into any troubles.

### <a name="configuration"></a>Configuration
You don't need to configure anything - the defaults are most likely fine.

But if you want to, you can set the path of the folder your components are in, and the id of the \<div> that will contain the templates. You do that by creating a global variable named "_celoConfig_" that can contain either or both of these properties: "componentsPath" and "containerId". The example below shows a simple way to configure Celo, but be sure to do it in a separate \<script> tag and use "var" instead or let or const.
```
<script>var celoConfig = { containerId: "_customId" }</script>
```

### Subcomponents
Each web component should be its own HTML file. If you want multiple components in a single HTML, make sure it's one main component and its _subcomponents_. Basically a subcomponent is:

+ dynamically added by the main component;
+ not suitable to be added as a standalone component; and
+ not intended to be reused by other main components.

If you add the subcomponent tag directly to your HTML, Celo will try to load it from a file matching its tagName, resulting in a non-fatal error.

### About \<script> tags
Any top level \<script> tags in your component's HTML file will be executed right away. _But \<script> tags inside \<template> tags are (typically) not._ That's because web components (typically) use the _cloneNode()_ function, which flags the scripts as "already executed". Please note that:

+ You don't need to include \<script> tags inside the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).;
+ Even if you do include it in the shadowRoot, _the script won't be scoped_;
+ And if you _want_ to do it for some reason, that's an issue for to fix in the web component itself. Celo's _recreateScripts()_ function could give you a tip on how to make the script self-executable, though.

### What Celo doesn't do for you
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
+ It doesn't polyfill your components.

## And how am I supposed to be writing the components?
Below you will find how a "simple-example.html" file could look like (it's not the "_right_" way to do it, but it's a way that works). Basically, you've got two top level tags: a \<template> and a \<script>. All the markup goes into the \<template>, including any \<style>, and it's best to avoid adding extra \<script> tags inside \<template>.

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
