A crossword game written with AngularJS, node.js, socket.io, and probably mongoDB.

### Try it!

Requires node (tested with 0.10.x) and mongodb.

- `git clone https://github.com/abuchanan/dempsy.git`
- `cd dempsy`
- `npm install`
- `bower install` (choose angular 1.2.4 if you're asked to)
- (make sure mongodb is running)
- `node server.js`
- in another terminal, `node create_test_game.js`, and visit the URL it outputs. 

Sorry, this isn't simple to set up yet, and this project is likely very rough around the edges, especially when it comes to handling errors (such as mongodb missing). Hopefully I can resolve that within the next couple days.
