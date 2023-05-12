const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = []
let selected_types = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty().addClass('d-flex justify-content-center');

  // Determine the start and end pages to display
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

  // Add previous button if not on first page
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">
        Previous
      </button>
    `);
  }

  // Add numbered buttons for visible pages
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">
        ${i}
      </button>
    `);
  }

  // Add next button if not on last page
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">
        Next
      </button>
    `);
  }
};


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)


$('#pokeCards').empty()
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
  $('#total-pokemons').text(pokemons.length)
  $('#displayed-pokemons').text(selected_pokemons.length)
}


// Add event listener to type filters
$('body').on('click', '.typeFilter', function () {
  paginate(currentPage, PAGE_SIZE, pokemons);
  console.log("typeFilter clicked");
});

const setup = async () => {
  // test out poke api using axios here
  const results = await axios.get('https://pokeapi.co/api/v2/type');
  const types = results.data.results;

  types.forEach(type => {
    $('.pokemonFilter').append(`
      <div class="form-check form-check-inline">
        <input class="form-check-input typeChk" type="checkbox" typeurl="${type.url}">
        <label class="form-check-label" for="inlineCheckbox1">${type.name}</label>
      </div>
    `)
  })    

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)
 
  $('body').on('click', '.typeChk', async function (e) {
    if ($(this).is(':checked')) {
      selected_types.push($(this).attr('typeurl'))
    } else {
      selected_types = selected_types.filter((type) => type !== $(this).attr('typeurl'))
    }
    console.log("selected_types: ", selected_types);

    let filtered_type = [];

    for (let i = 0; i < selected_types.length; i++) {
      filtered_type.push((await axios.get(selected_types[i])).data.pokemon.map((pokemon) => pokemon.pokemon));
    }
    
    console.log("filtered_type: ", filtered_type);


    if (selected_types.length != 0) {
    pokemons = filtered_type.reduce((a,b) => a.filter(c => b.some(d => d.name === c.name)));
    } else {
      pokemons = response.data.results;
    }

    console.log("pokemons: ", pokemons);
    paginate(currentPage, PAGE_SIZE, pokemons)
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
    updatePaginationDiv(currentPage, numPages);
  })

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
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
    $('.modal-title').html(`
      <div style="text-align:center">
        <h2>${res.data.name.toUpperCase()}</h2>
      </div>
        <h5>${res.data.id}</h5>
      
        `)
  })

  // Add event listener to pagination buttons
  $('body').on('click', '.numberedButtons', async function (e) {
    const newPage = Number(e.target.value);

    if (newPage !== currentPage) {
      currentPage = newPage;
      const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
      paginate(currentPage, PAGE_SIZE, pokemons);
      updatePaginationDiv(currentPage, numPages);
    }
  });

}


$(document).ready(setup)