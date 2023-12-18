var moment = require('moment');

function formatoFechaResol(fecha: string): string {
  let result = ""; 
  if (fecha){
    result = moment(fecha).utc(true).format("DD/MM/YYYY");
  }
  return result;
}

export default formatoFechaResol