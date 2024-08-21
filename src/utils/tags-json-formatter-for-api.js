module.exports = function (dataToFormat) {
  console.log("tagsOfdatasJsonFormatter START");
  // IMPORTANTE ! SE MODIFICHI QUESTO FILE, INCOLLA IL CODICE ANCHE NEL FILE GEMELLO. DEVONO ESSERE UGUALI, TRANNE I CONSOLE.LOG E L'EXPORT !

  const tagsById = {};

  // Itera attraverso i dati e raggruppa i tag per ID
  if (dataToFormat != undefined) {
    dataToFormat.data.forEach(data => {
      const { id, 'tags.id': tagsId, 'tags.description': tagsDescription } = data;
      if (!tagsById[id]) {
        tagsById[id] = [];
      }
      //decommentalo se un giorno ti serviranno gli id del tag. NB: TOGLI L'ATTRIBUTE DA dataS.HOOKS IN QUEL CASO, O NON TI ARRIVANO !
      //tagsById[id].push(tagsId);
      tagsById[id].push(tagsDescription);
    });

    // Crea un nuovo array con i tag raggruppati
    const aggregatedTags = Object.keys(tagsById).map(id => ({
      id,
      tags: tagsById[id]
    }));

    //console.log("aggregatedTags: " + JSON.stringify(aggregatedTags));

    //modifica del json in uscita
    for (var i = 0; i < dataToFormat.data.length; i++) {
      if (dataToFormat.data[i - 1] != undefined && dataToFormat.data[i - 1].id === dataToFormat.data[i].id) {
        //console.log("dataToFormat ha l' array tags. Skip");
        continue;
      }
      else {
        /*cicla l' oggetto. Cerca in aggregatedTags l' id corrispondente e gli aggiunge l' arrai con le sue tag. 
        Poi, elimina i campi non necessari da esporre
        */
        let tagsArray;
        for (var t = 0; t < aggregatedTags.length; t++) {
          if (aggregatedTags[t].id === dataToFormat.data[i].id) {
            tagsArray = aggregatedTags[t].tags;
            break;
          } //else //console.log("skip")
        }
        //
        //aggiungo l' array delle tag al json in uscita. Elimino le voci non necessarie
        //console.log("aggiungo l' array delle tag al json in uscita");
        dataToFormat.data[i].tags = tagsArray;
        //console.log("Elimino le voci non necessarie")
        delete dataToFormat.data[i]['tags.id'];
        delete dataToFormat.data[i]['tags.description'];
        delete dataToFormat.data[i]['tags.createdAt'];
        delete dataToFormat.data[i]['tags.updatedAt'];
      }
    }
    //filtro i dati con immagine id duplicata che non hanno l' array delle tag
    console.log("tagsOfdatasJsonFormatter END");
    return dataToFormat.data = dataToFormat.data.filter(item => item.hasOwnProperty('tags'));
  }
  else return dataToFormat;
}