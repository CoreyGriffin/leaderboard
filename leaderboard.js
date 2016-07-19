PlayersList = new Mongo.Collection('players');

Meteor.methods({
  'createPlayer': function(playerName){
    check(playerName, String);
    console.log("Hello World");
    var currentUserId = Meteor.userId();
    if (currentUserId) {
        PlayersList.insert({
          name: playerName,
          score: 0,
          createdBy: currentUserId
        });
    }
  },

  'removePlayer': function(selectedPlayer){
    //verifying that user is removing a String since that is all that should be accepted
     check(selectedPlayer, String);
    //users can only remove players if they are logged in
     var currentUserId = Meteor.userId();
     if (currentUserId) {
           PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
           //this statement prevents users from removing names from other leaderboards
     }
  },

  'updateScore':function(selectedPlayer, scoreValue){
    check(selectedPlayer, String);
    check(scoreValue, Number);
    var currentUserId = Meteor.userId();
    if (currentUserId) {
      PlayersList.update(
        { _id: selectedPlayer, createdBy: currentUserId },
        { $inc: {score: scoreValue} }
      );
    }
  }
}); //end of Meteor Methods block










if (Meteor.isClient) {
  //This code only runs on client
  // console.log("Hello World, from the client");

// subscribing to the publication on the client side so users can view the servers data

  Meteor.subscribe('thePlayers');



  //this helper directly affects the interface not server
  // new helpers format allows all helpers to be defined
  // in a single block seperated by commas
  Template.leaderboard.helpers({
    'player': function(){
      var currentUserId = Meteor.userId();
      return PlayersList.find({createdBy: currentUserId}, {sort: {score: -1, name: 1}});
    },
    'getPlayerCount': function(){
      return PlayersList.find().count();
    },
    'selectedClass': function(){
      var playerID = this._id
      var selectedPlayer = Session.get('selectedPlayer');
      if (playerID == selectedPlayer) {
        return "selected";
      }
    },
    'selectedPlayer': function(){
      var selectedPlayer = Session.get('selectedPlayer')
      return PlayersList.findOne({_id: selectedPlayer});
    }
  });

//------------------------------------------------------

  // create events here
  // events are created in JSON format
  Template.leaderboard.events({
      'click .player': function(){
        var playerID = this._id;
        Session.set('selectedPlayer', playerID);
      },
      'click .increment': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('updateScore', selectedPlayer, 5);
      },

      'click .decrement': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('updateScore', selectedPlayer, -5);
      },

      'click .remove': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('removePlayer', selectedPlayer);
      }
  }); // end of leaderboard events

  Template.addPlayerForm.events({
    'submit form' : function(event){
      event.preventDefault();
      var playerName = event.target.playerName.value;

      Meteor.call('createPlayer', playerName); // method call

      //clear the form after submitted
      event.target.playerName.value = " ";
    }
  });

} // end of client side code


if (Meteor.isServer) {
  //this code only runs on the server
  // console.log(PlayersList.find().fetch());

  //setting up the publication so users can access data on the client
  Meteor.publish('thePlayers', function(){

    //only show published data of currently logged in user
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});

    //this return statement will only return documents that hole the unique ID of the current user
  });
}
