export function format(imgTaggate) {
  //console.log("tagsOfImagesJsonFormatter START");
  const tagsById = {};

  // Itera attraverso i dati e raggruppa i tag per ID
  if (imgTaggate != undefined) {
    imgTaggate.data.forEach(image => {
      const { id, 'tags.id': tagsId, 'tags.description': tagsDescription } = image;
      if (!tagsById[id]) {
        tagsById[id] = [];
      }
      tagsById[id].push(tagsId);
      tagsById[id].push(tagsDescription);
    });

    // Crea un nuovo array con i tag raggruppati
    const aggregatedTags = Object.keys(tagsById).map(id => ({
      id,
      tags: tagsById[id]
    }));

    //console.log("aggregatedTags: " + JSON.stringify(aggregatedTags));

    //modifica del json in uscita
    for (var i = 0; i < imgTaggate.data.length; i++) {
      if (imgTaggate.data[i - 1] != undefined && imgTaggate.data[i - 1].id === imgTaggate.data[i].id) {
        //console.log("imgTaggate ha l' array tags. Skip");
        continue;
      }
      else {
        /*cicla l' oggetto. Cerca in aggregatedTags l' id corrispondente e gli aggiunge l' arrai con le sue tag. 
        Possibilmente, elimina i campi non necessari da esporre
        */
        let tagsArray;
        for (var t = 0; t < aggregatedTags.length; t++) {
          if (aggregatedTags[t].id === imgTaggate.data[i].id) {
            tagsArray = aggregatedTags[t].tags;
            break;
          } //else //console.log("skip")
        }
        //
        //aggiungo l' array delle tag al json in uscita. Elimino le voci non necessarie
        //console.log("aggiungo l' array delle tag al json in uscita");
        imgTaggate.data[i].tags = tagsArray;
        //console.log("Elimino le voci non necessarie")
        delete imgTaggate.data[i]['tags.id'];
        delete imgTaggate.data[i]['tags.description'];
        delete imgTaggate.data[i]['tags.createdAt'];
        delete imgTaggate.data[i]['tags.updatedAt'];
      }
    }
    //filtro i dati con immagine id duplicata che non hanno l' array delle tag
    //console.log("tagsOfImagesJsonFormatter END");
    return imgTaggate.data = imgTaggate.data.filter(item => item.hasOwnProperty('tags'));
  }
  else return imgTaggate;
}