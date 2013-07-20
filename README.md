BackboneTS
===========

BackboneTS is a port of BackboneJS 1.0.0 to TypeScript.

Why port Backbone if it works fine only with a definition file?

- Because I wanted to see how hard it would be to port an existing common library to TypeScript
- Because BackboneJS is very well tested to create objects .extend(), but doesn't work always correctly using 'new' and ES6 classes and extends.
- Because I wanted to change core features of Backbone and I wanted to do it in TypeScript without monkey patching.

Thanks to:

* Jeremy Ashkenas for [BackboneJS](http://backbonejs.org/)
* Boris Yankov and contributors for [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped)
