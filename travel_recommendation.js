// app.js

document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('destination_search_form');
  const input     = form.querySelector('input[type="text"]');
  const searchBtn = document.getElementById('search_button');
  const clearBtn      = document.getElementById('clear_button');
  const resultsHolder = document.getElementById('results');  // container for rendered results

  // helper: build and inject the result cards
  function renderResults(items) {
    resultsHolder.innerHTML = ''; // clear

    if (items.length === 0) {
      resultsHolder.innerHTML = '<p class="no-results">No matches found.</p>';
      return;
    }

    items.forEach(place => {
      const card = document.createElement('div');
      card.classList.add('result-card');

      // image
      const img = document.createElement('img');
      img.src = place.imageUrl;        // e.g. "enter_your_image_for_sydney.jpg"
      img.alt = place.name;
      card.appendChild(img);

      // title
      const h3 = document.createElement('h3');
      h3.textContent = place.name;
      card.appendChild(h3);

      // description
      const p = document.createElement('p');
      p.textContent = place.description;
      card.appendChild(p);

      // optional Visit button
      const btn = document.createElement('button');
      btn.textContent = 'Visit';
      btn.addEventListener('click', () => {
        // you could navigate somewhere or open a modal...
        alert(`You clicked Visit on ${place.name}`);
      });
      card.appendChild(btn);

      resultsHolder.appendChild(card);
    });
  }

  function clearResults() {
    input.value = '';
    resultsHolder.innerHTML = '';
  }

  searchBtn.addEventListener('click', e => {
    e.preventDefault();
    const rawQuery = input.value.trim();
    const query    = rawQuery.toLowerCase();

    if (!query) {
      console.warn('Please enter a search term');
      return;
    }

    fetch('travel_recommendation_api.json')
      .then(res => {
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // 1) build flat list of places
        const places = [];

        data.countries.forEach(country => {
          country.cities.forEach(city => {
            places.push({ type: 'city', parent: country.name, ...city });
          });
        });
        data.temples.forEach(t => places.push({ type: 'temple', ...t }));
        data.beaches.forEach(b => places.push({ type: 'beach', ...b }));

        // 2) prepare keyword sets
        const beachKeys  = ['beach', 'beaches'];
        const templeKeys = ['temple', 'temples'];
        // all country names lowercased
        const countryKeys = data.countries.map(c => c.name.toLowerCase());

        let results;

        // 3) match by keyword group
        if (beachKeys.includes(query)) {
          results = places.filter(p => p.type === 'beach');
        }
        else if (templeKeys.includes(query)) {
          results = places.filter(p => p.type === 'temple');
        }
        else if (countryKeys.includes(query)) {
          results = places.filter(p => p.parent.toLowerCase() === query);
        }
        else {
          // fallback: name contains
          results = places.filter(p =>
            p.name.toLowerCase().includes(query)
          );
        }

        console.log(`Search results for "${rawQuery}":`, results);
        // render `results` into DOM
        renderResults(results);
      })
      .catch(err => {
        console.error('Fetch failed:', err);
        resultsHolder.innerHTML = '<p class="error">Sorry, could not load recommendations.</p>';
      });
  });

  clearBtn.addEventListener('click', e => {
    e.preventDefault();
    clearResults();
  });
});