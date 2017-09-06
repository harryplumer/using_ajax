let current = {games: 0, characters: 0};
let showForm = {games: false, characters: false}
let editing = {games: null, characters: null}

$(document).ready( function() {
  //RENDERS GAMES OR CHARACTERS
  getItem = (pane, params) => {
  
    let url = `/games/${params.games}`
    let editId = editing[`${pane}`]
    let retId = params[`${pane}`]
    
    if (pane === "characters")
      url = url + `/characters/${params.characters}`
      
    $.ajax({
      url: url,
      type: 'GET'
    }).done( (data) => {
      if (editId) {
        var li = $("[data-id='" + retId + "'").parents('li');
        $(li).replaceWith(data);
        if (pane === "characters")
          editing.characters = null
        else
          editing.games = null
      }
      else 
        $(`#${pane}-list`).append(data);
      })
    }

  //SHOWS AND HIDES FORMS 
  toggle = (pane) => {
    showForm[`${pane}`] = !showForm[`${pane}`]
    $(`#${pane}-form`).remove()
    $(`#${pane}`).toggle()

    if (showForm[`${pane}`]){      
      if((showForm.characters) && (current.games == 0)){
        alert("Please Select A Game From The Left Pane")
        showForm.characters = false
        $('#characters-form').remove();
        $('#characters').toggle();
        return
      }
      
      let data = {}
      if (pane === "characters")
        data.game_id = current.games
      if (editing[`${pane}`]) 
        data.id = editing[`${pane}`]
      
      let url = `/${pane}_form`
      
      $.ajax({
        url: `/${pane}_form`,
        type: 'GET',
        data: data
      }).done( (html) => {
        $(`#toggle-${pane}`).after(html);
      })
    }
  }

  //CLICK HANDLERS FOR EDIT/DELETE
  $(document).on('click', '.edit', function(){
    let pane = this.dataset.pane
    editing[`${pane}`] = this.dataset.id
    toggle(pane)
  })

  $(document).on('click', '.delete', function() {
    let pane = this.dataset.pane
    let id = this.dataset.id
    let url = ""
    if (pane === "games")
      url = `/games/${id}`
    else
      url = `/games/${current.games}/characters/${id}`

    $.ajax({
      url: url,
      type: 'DELETE'
    }).done( () => { $(this).parents('li').remove() })
  })

  //CLICK HANDLERS FOR FORM SUBMITS
  $(document).on('submit', '.std-form form', function(e) {
    e.preventDefault();
    let pane = $(this).parents('div').data().pane
    var params = $(this).serializeArray();
    let url = '/games/'
    var method = 'POST';
    
    if (pane === "characters")
      url = url + `${current.games}/characters`

    if (editing[`${pane}`]) {
      url = url + '/' + editing[`${pane}`];
      method = 'PUT'
    }

    $.ajax({
      url: url,
      type: method,
      data: params
    }).done( (data) => {
      let passParams = {}
      if (pane === "games")
        passParams.games = data.id
      else {
        passParams.games = current.games
        passParams.characters = data.id
      }
      toggle(pane)
      getItem(pane, passParams)
    }).fail( function(err) {
      alert(err.responseJSON.errors)
    })
  })

  //CLICK HANDLERS FOR SHOW FORM BUTTONS
  $('.toggle-button').on('click', function(){
    toggle($(this).data().pane)
  })

  //CLICK HANDLER FOR INDIVIDUAL GAMES TO SHOW CHARS IN RIGHT PANE
  $(document).on('click', '.games-item', function() {
    current.games = this.dataset.id
    let insertName = this.dataset.name
    $.ajax({
      url: '/games/' + current.games + '/characters/',
      type: 'GET'
    }).done( (characters) => {
      $('#game').text('Characters in ' + insertName);
      $('#characters-list').empty()
      let passParams = {}
      passParams.games = current.games
      for(char of characters){
        passParams.characters = char.id
        getItem("characters", passParams)
      }
    })
  })
})