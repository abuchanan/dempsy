'use strict';

angular.module('dempsyApp')
  .controller('MainCtrl', function ($scope) {
    var peer = new Peer({key: 'lwjd5qra8257b9'});

    peer.on('open', function(ID) {
      console.log('peer ID', ID);
    });

  });
