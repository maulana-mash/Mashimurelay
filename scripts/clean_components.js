const fs = require('fs');
const path = require('path');

const compJsonPath = path.join(__dirname, '..', 'components.json');
const compJsPath = path.join(__dirname, '..', 'js', 'components_data.js');

const data = JSON.parse(fs.readFileSync(compJsonPath, 'utf8'));

// Bogus keys to delete
const bogusKeys = ['icon%201024', 'icon', 'icon_1024', 'motor'];

bogusKeys.forEach(key => {
  if (data[key]) {
    delete data[key];
    console.log(`Deleted bogus key: ${key}`);
  }
});

// Write cleaned components.json
fs.writeFileSync(compJsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${compJsonPath} (Total components: ${Object.keys(data).length})`);

// Generate js/components_data.js
const header = `/**
 * Mashimurelay Components Data (Industrial IEC / NEMA Library)
 * Clean, verified components database without duplicate or bogus launcher icons.
 */
window.COMPONENTS_DATA = `;

const categoriesLogic = `

// Organized Component Categories for Palette UI
window.COMPONENT_CATEGORIES = (function() {
  const cats = {
    sources: [],
    protections: [],
    switches: [],
    contactors: [],
    coils: [],
    auxiliaries: [],
    motors: [],
    loads: [],
    others: []
  };

  for (const [key, comp] of Object.entries(window.COMPONENTS_DATA)) {
    const cat = (comp.info && comp.info.category) || comp.category || 'others';
    const targetCat = cats[cat] ? cat : 'others';
    cats[targetCat].push({
      svg: key,
      name: (comp.info && comp.info.name) || comp.name || key,
      category: targetCat,
      width: comp.width || 120,
      height: comp.height || 120
    });
  }

  return cats;
})();
`;

fs.writeFileSync(compJsPath, header + JSON.stringify(data, null, 2) + ';' + categoriesLogic, 'utf8');
console.log(`Updated ${compJsPath} (Total components: ${Object.keys(data).length})`);
