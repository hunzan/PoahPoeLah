// js/cups/image.js
export function makeImageCup({ id, name, yang, yin }) {
  return {
    id, name,
    render(side){
      const src = side==='yang' ? yang : yin;
      const label = (typeof name === 'object') ? (name.tl || name.en || name.zh || id) : (name || id);
      return `<img src="${src}" alt="${label}-${side}" width="100" height="100"
              style="display:block;width:100%;height:100%;object-fit:contain;" />`;
    }
  };
}

