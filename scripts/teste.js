function consertaValor(valor) {
    var text = valor.toString();
    text = text.replace('.', '')
  
    var num = Number.parseFloat(text).toFixed(2) / 100;
    if (num < 1000) num *= 100;
  
    return num.toString();
  }

console.log(consertaValor(18.4000)) // R$ 1.000,00