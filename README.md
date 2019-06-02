# Celo
This is a loader script for web components written down in HTML, as they should be! It listens for changes in DOM, and when it detects a custom element, it fetches its markup and inserts it in the DOM.

## How do I use it?
Each component must be an HTML located in a folder called "/components" (you can change where in the script file). The name of the HTML file must be lowercase and match the tag name used, so you must use "<my-example>" to call a component called "my-example.html".
Celo must be included at the top of your HTML, as it won't parse any elements before it.
Now you can just add the custom element tags and Celo will load the web components for you.

## And how does it work?
Celo uses a MutationObserver to listen for any element inserted in the DOM that carries a hyphen. Upon detection, it checks if that component has already been used. If it is a new component, it will fetch the markup and add its code to a hidden div with an id of "#\_celo".

## Requirements
Celo has no dependencies, but the non-minified version assumes ES6.

## What it doesn't do
+ The web components, for one. You must create them yourself: I suggest using on HTML file per component, with <template>, <style> and <script>.
+ It doesn't make your app descriptive, reactive, responsive or progressive. It just allows you to load web components and lets you do your other chores the whichever way you see fit.
+ It doesn't cache your components for other visits. Try setting that up with service workers.
