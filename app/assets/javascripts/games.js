var currentGame = {};
var showForm = false;
var editingGame;

var currentChar = {}
var showCharForm = false
var editingChar

$(document).ready( function() {

  function getGame(id) {
    $.ajax({
      url: '/games/' + id,
      type: 'GET'
    }).done( function(game) {
      if (editingGame) {
        var li = $("[data-id='" + id + "'").parents('li');
        $(li).replaceWith(game);
        editingGame = null;
      } else {
        $('#games-list').append(game);
      }
    });
  }

  function getChar(gameId, id){
    $.ajax({
      url: '/games/' + gameId + '/characters/' + id,
      type: 'GET'
    }).done( function(char) {
      if (editingChar) {
        var li = $("[data-id='" + id + "'").parents('li');
        $(li).replaceWith(char);
        editingChar = null;
      } else {
        $('#characters').append(char);
      }
    });
  }
  

  function toggle() {
    showForm = !showForm;
    $('#game-form').remove();
    $('#games-list').toggle();

    if (showForm) {
      let data = {};
      if (editingGame) 
        data.id = editingGame;
      $.ajax({
        url: "/game_form",
        type: 'GET',
        data: data
      }).done( function(html) {
        $('#toggle').after(html);
      });
    }
  }

  function toggleChar() {
    showCharForm = !showCharForm;
    $('#char-form').remove();
    $('#characters').toggle();

    if (showCharForm) {
      if (Object.getOwnPropertyNames(currentGame).length <= 0){
        alert("Please Select A Game From The Left Pane")
        showCharForm = !showCharForm;
        $('#char-form').remove();
        $('#characters').toggle();
        return
      }

      let data = {};
      data.game_id = currentGame.id;
      if (editingChar) 
        data.id = editingChar;
      $.ajax({
        url: "/char_form",
        type: 'GET',
        data: data
      }).done( function(html) {
        $('#toggle-char').after(html);
      });
    }
  }

  //EDIT AND DELETE FUNCTIONS
  $(document).on('click', '.edit-game', function() {
    editingGame = $(this).siblings('.game-item').data().id;
    toggle();
  });

  $(document).on('click', '.delete-game', function() {
    var id = $(this).siblings('.game-item').data().id
    $.ajax({
      url: '/games/' + id,
      type: 'DELETE'
    }).done( function() {
      var row = $("[data-id='" + id + "'").parents('li');
      row.remove();
    });
  });

  $(document).on('click', '.edit-char', function() {
    editingChar = $(this).siblings('.char-item').data().id;
    toggleChar();
  });

  $(document).on('click', '.delete-char', function() {
    var id = $(this).siblings('.char-item').data().id
    $.ajax({
      url: '/games/'+currentGame.id+'/characters/'+ id,
      type: 'DELETE'
    }).done( function() {
      var row = $("[data-id='" + id + "'").parents('li');
      row.remove();
    });
  });

  //FORM SUBMISSION BUTTON CLICK HANDLERS
  $(document).on('submit', '#game-form form', function(e) {
    e.preventDefault();
    var params = $(this).serializeArray();
    var url = '/games';
    var method = 'POST';

    if (editingGame) {
      url = url + '/' + editingGame;
      method = 'PUT'
    }

    $.ajax({
      url: url,
      type: method,
      data: params
    }).done( function(game) {
      toggle();
      getGame(game.id);
    }).fail( function(err) {
      alert(err.responseJSON.errors);
    });
  });

  $(document).on('submit', '#char-form form', function(e) {
    e.preventDefault();
    var params = $(this).serializeArray();
    var url = '/games/'+currentGame.id+'/characters';
    var method = 'POST';

    if (editingChar) {
      url = url + '/' + editingChar;
      method = 'PUT'
    }

    $.ajax({
      url: url,
      type: method,
      data: params
    }).done( function(char) {
      toggleChar();
      getChar(currentGame.id, char.id);
    }).fail( function(err) {
      alert(err.responseJSON.errors);
    });
  });


  //SHOW FORM BUTTON CLICK HANDLERS
  $('#toggle').on('click', function() {
    toggle();
  });

  $('#toggle-char').on('click', function() {
    toggleChar();
  });

  //SHOW CHARACTERS IN RIGHT PANE CLICK HANDLER
  $(document).on('click', '.game-item', function() {
    currentGame.id = this.dataset.id
    currentGame.name = this.dataset.name
    $.ajax({
      url: '/games/' + currentGame.id + '/characters/',
      type: 'GET'
    }).done( function(characters) {
      $('#game').text('Characters in ' + currentGame.name);
      var list = $('#characters');
      list.empty();
      characters.forEach( function(char) {
        getChar(currentGame.id, char.id)
      })
    })
  });
});