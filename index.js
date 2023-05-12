// Defines the number of pokemon to display per page
const PAGE_SIZE = 10;
// Defines the current page of pokemon being displayed
let currentPage = 1;
// Defines an empty array to store the selected pokemon to display
let pokemons = []
// Defines an empty array to store the selected types to display
let selected_types = [];


// Function to update the pagination div with the correct page numbers and nav buttons
const updatePaginationDiv = (currentPage, numPages) => {
  // Clear the pagination div and style it with bootstrap
  $('#pagination').empty().addClass('d-flex justify-content-center');


  // Determine the start and end pages to display in the pagination div
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(numPages, currentPage + 2);


  // If there are not enough pages to fill the buttons, adjust the start and end accordingly
  if (endPage - startPage < 4) {
    if (currentPage <= 3) {
      endPage = Math.min(numPages, 5);
    } else {
      startPage = Math.max(1, numPages - 4);
    }
  }


  // Add previous button to the pagination div if not on first page
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">
        Previous
      </button>
    `);
  }


  // Add numbered buttons for visible pages to the pagination div
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">
        ${i}
      </button>
    `);
  }


  // Add "Next" button if not on last page to the pagination div
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">
        Next
      </button>
    `);
  }
};


// Function to display the pokemon cards for the current page
const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  // Calculate the pokemon to display on the current page
  selected_pokemons = pokemons
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Clear the pokemon cards div
  $('#pokeCards').empty()


  // Fetch and displays each pokemon's data to each card
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
      $('#pokeCards').append(`
        <div class="pokeCard card" pokeName=${res.data.name}   >
          <h3>${res.data.name.toUpperCase()}</h3> 
          <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
          </button>
        </div>  
      `)
  })


  // Display the total number of pokemon and the number of pokemon displayed
  $('#total-pokemons').text(pokemons.length)
  $('#displayed-pokemons').text(selected_pokemons.length)
}


// Add event listener to type filters for on click
$('body').on('click', '.typeFilter', function () {
  // Display the current page of pokemon with the selected type
  paginate(currentPage, PAGE_SIZE, pokemons);
  console.log("typeFilter clicked");
});


// Defines the setup function to run when the page loads populating the pokemon cards and pagination div
const setup = async () => {
  // Fetch the list of pokemon types from the pokeapi
  const results = await axios.get('https://pokeapi.co/api/v2/type');
  // Stores the list of pokemon types
  const types = results.data.results;

  // For each pokemon type, add a checkbox to the type filter div
  types.forEach(type => {
    // Appends a checkbox and label to the previous checkboxes and labels
    $('.pokemonFilter').append(`
      <div class="form-check form-check-inline">
        <input class="form-check-input typeChk" type="checkbox" typeurl="${type.url}">
        <label class="form-check-label" for="inlineCheckbox1">${type.name}</label>
      </div>
    `)
  })
  
  
  // Empty the pokeCards div
  $('#pokeCards').empty()


  // Fetch the list of all the pokemon from the pokeapi
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  // Display the first page of pokemon
  paginate(currentPage, PAGE_SIZE, pokemons)


  // Updates the pagination div with the correct page numbers and nav buttons
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)


  // Add event listener to the checkbox filter for on click
  $('body').on('click', '.typeChk', async function (e) {
    // If the checkbox is checked, add the type to the selected_types array
    if ($(this).is(':checked')) {
      selected_types.push($(this).attr('typeurl'))
    // If the checkbox is unchecked, remove the type from the selected_types array
    } else {
      selected_types = selected_types.filter((type) => type !== $(this).attr('typeurl'))
    }


    // Fetch the list of pokemon with the selected types 
    let filtered_type = [];


    // Loop through the array of selected_types and fetch the pokemon with the selected type
    for (let i = 0; i < selected_types.length; i++) {
      // Fetch the pokemon data for each selected type, push the data to the filtered_type array
      filtered_type.push((await axios.get(selected_types[i])).data.pokemon.map((pokemon) => pokemon.pokemon));
    }
    

    // Checkes if there any types are selected
    if (selected_types.length != 0) {
      // If the types are selected, filters the pokemon array to only include pokemon with the selected types
    pokemons = filtered_type.reduce((a,b) => a.filter(c => b.some(d => d.name === c.name)));
    } else {
      // If no types are selected, fetches the list of all pokemon
      pokemons = response.data.results;
    }


    // Display the first page of pokemon with the selected types
    paginate(currentPage, PAGE_SIZE, pokemons)


    // Calculate the total number of pages and update the pagination div
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages);
  })


  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card for when a card is clicked
  $('body').on('click', '.pokeCard', async function (e) {
    // Fetch the name of the clicked pokemon
    const pokemonName = $(this).attr('pokeName')
    // Fetch the data for the clicked pokemon
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // Fetch the types for the clicked pokemon
    const types = res.data.types.map((type) => type.type.name)
    

    // Display the pokemon data in the modal
    // Display the pokemon image
    // Display the pokemon abilities
    // Display the pokemon stats
    // Display the pokemon types
    $('.modal-body').html(`
        <div style="width:300px">
          <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
        `)
    

    // Display the pokemon name and id in the modal title
    $('.modal-title').html(`
      <div style="text-align:center">
        <h2>${res.data.name.toUpperCase()}</h2>
      </div>
        <h5>${res.data.id}</h5>
        `)
  })


  // Add event listener to pagination buttons on the page
  $('body').on('click', '.numberedButtons', async function (e) {
    // Get the page number from the value of the clicked button, and convert it to a number
    const newPage = Number(e.target.value);

    // Check if the newly selected page is different from the current page
    if (newPage !== currentPage) {
       // If it's different, update the current page to the new page
      currentPage = newPage;
      // Calculate the total number of pages based on the number of Pokemon and page size
      const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
       // Call the paginate function to display the Pokemon on the new page
      paginate(currentPage, PAGE_SIZE, pokemons);
       // Update the pagination buttons to reflect the new current page
      updatePaginationDiv(currentPage, numPages);
    }
  });
}


// Call the setup function when the page loads, prevents the JS from running before the page is loaded
$(document).ready(setup)
