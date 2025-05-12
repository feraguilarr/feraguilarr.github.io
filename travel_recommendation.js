// app.js

document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('destination_search_form');
  const input     = form.querySelector('input[type="text"]');
  const searchBtn = document.getElementById('search_button');

  searchBtn.addEventListener('click', e => {
    e.preventDefault();
    const query = input.value.trim().toLowerCase();
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
        console.log('📥 raw JSON:', data);

        // 1) gather all the places into one array
        const places = [];

        // countries → cities
        if (Array.isArray(data.countries)) {
          data.countries.forEach(country => {
            if (Array.isArray(country.cities)) {
              country.cities.forEach(city => {
                places.push({
                  type:   'city',
                  parent: country.name,
                  ...city
                });
              });
            }
          });
        }

        // temples
        if (Array.isArray(data.temples)) {
          data.temples.forEach(t => places.push({ type: 'temple', ...t }));
        }

        // beaches
        if (Array.isArray(data.beaches)) {
          data.beaches.forEach(b => places.push({ type: 'beach', ...b }));
        }

        // 2) filter by name match
        const results = places.filter(place =>
          place.name.toLowerCase().includes(query)
        );

        console.log(`✅ Search results for "${query}":`, results);
        // → results is an array of objects like:
        //    { name, imageUrl, description, type, parent? }

        // TODO: replace console.log with code that renders `results` into your page
      })
      .catch(err => console.error('Fetch failed:', err));
  });
});