var app = new Vue({
  el: '#app',
  data: {
    Frameworks: [
      {
        icono: 'fab fa-vuejs',
        color: '#42b983',
        nombre:'Vue',
      },
      {
        icono: 'fab fa-font-awesome-flag',
        color: '#298be6',
        nombre:'FontAwesome',
      },
      {
        icono: 'fab fa-bootstrap',
        color: '#563d7c',
        nombre:'Bootstrap',
      },
    ],
    Menu: [
      {
        Nombre:'Bisección',
        Active: false,
        disabled: false,
      },{
        Nombre:'Regula Falsi',
        Active: false,
        disabled: false,
      },{
        Nombre:'Newton-Raphson',
        Active: true,
        disabled: false,
      },{
        Nombre:'Secante',
        Active: false,
        disabled: false,
      },{
        Nombre:'Aplicar Todos',
        Active: false,
        disabled: false,
      }
    ],
    Ecuacion: "x^3 + 4x^2 -10 = 0",
    menuActivo: "Newton-Raphson",
    analizar: false,
  },
  methods:{
    setMenu: function (o) {
      for (let i = 0; i < this.Menu.length; i++) {
        const element = this.Menu[i];

        if(this.Menu[i].Nombre == o){
          this.menuActivo = this.Menu[i].Nombre;
          this.Menu[i].Active = true;
        }else{
          this.Menu[i].Active = false;
        }
        
      }
    },
    calcularValoresPolinomial: function (x, terminos){
      let respuesta = 0;
  
      for (let i = 0; i < terminos.length; i++) {
          const element = terminos[i];
  
          let x1 = Math.pow(x, element.exp);
  
          respuesta += x1 * element.coeficiente;
      }
  
      return respuesta;
    },
    analizadorLexico: function (eqOpcional) {
      var terminos = new Array();
      var aux = this.Ecuacion.split("=")[0].trim().split(" ");
      let variable = "x"

      if(eqOpcional){
        aux = eqOpcional.split("=")[0].trim().split(" ");
      }

      for (let i = 0; i < aux.length; i++) {
          const element = aux[i];
          
          let termino = {
              coeficiente: 0,
              exp: 0,
          }

          if(element.indexOf(variable) != -1){
              let partes = element.split(variable);
              //Coeficiente
              if(partes[0] == ""){
                  termino.coeficiente =  1;
              }else if(partes[0] == "-"){
                  termino.coeficiente =  -1;
              }else if(partes[0].indexOf("/") != -1){
                  termino.coeficiente = Number(partes[0].split("/")[0]) / Number(partes[0].split("/")[1]);
              }else{
                  termino.coeficiente = Number(partes[0]);
              }
              //Exponente
              partes[1] = partes[1].replace("^", "");
              if(partes[1] == ""){
                  termino.exp =  1;
              }else if(partes[1].indexOf("/") != -1){
                  termino.exp = Number(partes[1].split("/")[0]) / Number(partes[1].split("/")[1]);
              }else{
                  termino.exp = Number(partes[1]);
              }

              terminos.push(termino);
          }else{
              try {
                  termino.exp = 0;
                  termino.coeficiente = Number(element);

                  if(!isNaN(termino.coeficiente)){
                      terminos.push(termino);
                  }
              } catch (e) {
                  
              }
          }
      }

      return terminos;
    },
  },
  
})
