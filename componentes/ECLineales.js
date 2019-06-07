Vue.component('eclineales', {
    template: //html
    `
    <div class="row" name="eclineales">
        <div class="col-10 offset-1">
            <div class="row justify-content-center">
                <div class="col-6 params text-center">
                    <strong class="text-right">[</strong>
                    <input class="form-control" type="number" v-model="a" />
                    <strong class="text-center">,</strong>
                    <input class="form-control" type="number" v-model="b" />
                    <strong>],</strong>
                    <strong class="text-right"> E = </strong>
                    <input class="form-control" type="number" v-model="e" />
                    <strong>, P = </strong>
                    <input class="form-control" type="number" v-model="precision" />
                </div>
                <div class="col-10 text-center">
                    <button type="button" class="btn-success" @click="calcular()" style="margin:15px 0px"><i class="fas fa-square-root-alt"></i> Calcular</button> 
                    <button type="button" class="btn-info" @click="dibujarGráfica()" style="margin:15px 0px"> <i class="fas fa-chart-line"></i></button>
                </div>
                <div class="col-10">
                    <hr/>
                </div>
            </div>
        </div>
        <div  class="col-10 offset-1" v-if="!seen">
            <h5 class="text-muted text-center">Ingresa los parámetros y haz clic en el botón de calcular para deplegar la tabla</h5>
        </div>
        <div class="col-10 offset-1" v-if="seen">
            <div class="row">
                <div class="col-8">
                    <div class="row justify-content-center">
                        <div class="col-10 tb-h1">
                        <h1>La tabla...</h1>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-10">
                            <div class="row">
                                <div class="col-1 tb-h2"><label>#</label></div>
                                <div class="col-1 tb-h2"><label>XI</label></div>
                                <div class="col-1 tb-h2"><label>XD</label></div>
                                <div class="col-1 tb-h2"><label>XM</label></div>
                                <div class="col-1 tb-h2"><label>Error</label></div>
                                <div class="col-1 tb-h2"><label>f(XI)</label></div>
                                <div class="col-1 tb-h2"><label>f(XD)</label></div>
                                <div class="col-1 tb-h2"><label>f(XM)</label></div>
                                <div class="col-2 tb-h2"><label>¿Continúo?</label></div>
                                <div class="col-2 tb-h2"><label>Errores</label></div>
                            </div>
                        </div>
                    </div>
                    <div class="row justify-content-center" v-for="(item, index) in tbValores">
                        <div class="col-10">
                            <div class="row">
                                <div class="col-1 tb-celda" v-text="index"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.xi)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.xd)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.xm)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.fxi)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.fxd)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.fxm)"></div>
                                <div class="col-1 tb-celda" v-text="truncarValor(item.e)"></div>
                                <div class="col-2 tb-celda" v-text="item.aceptado"></div>
                                <div class="col-2 tb-celda" v-text="item.comentarios"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-4">
                    <canvas id="myChart" width="400" height="400"></canvas>
                </div>
            </div>
        </div>
      </div>
    `,
    props: ["ecuacion"],
    data: function(){
        return {
            tbValores: [],
            tipo: null,
            terminos:[],
            a: null,
            b: null,
            e: 0.001,
            max: 0,
            seen: false,
            precision: 4,
        };
    },
    methods: {
        calcularValores: function (){
            this.tbValores.push();
        },
        calcularTerminoPolinomial: function(termino){
            if(!(this.a &&  this.b && this.e && termino)){
                return -1;
            }

            let nuevoTermino = {
                xi: termino.fxm < 0 ? termino.xm : termino.xi,
                xd: termino.fxm > 0 ? termino.xm : termino.xd,
                xm: null,
                fxd: null,
                fxi: null,
                fxm: null,
                e: null,
                aceptado: false,
                comentarios: "",
            }

            nuevoTermino.xm = (nuevoTermino.xi + nuevoTermino.xd)/2;
            nuevoTermino.fxi = this.calcularValoresPolinomial(nuevoTermino.xi);
            nuevoTermino.fxd = this.calcularValoresPolinomial(nuevoTermino.xd);
            nuevoTermino.fxm = this.calcularValoresPolinomial(nuevoTermino.xm);
            nuevoTermino.e = Math.abs(termino.xm - nuevoTermino.xm);
            nuevoTermino.aceptado = nuevoTermino.e >= Number(this.e) ||!nuevoTermino.e ? true : false;

            
            if(nuevoTermino.aceptado && this.max < 50){
                this.max++;
                this.tbValores.push(nuevoTermino);
                this.calcularTerminoPolinomial(nuevoTermino);
            }
        },
        analizadorLexico: function () {
            this.terminos = new Array();
            var aux = this.ecuacion.split("=")[0].trim().split(" ");
            let variable = "x"

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

                    this.terminos.push(termino);
                }else{
                    try {
                        termino.exp = 0;
                        termino.coeficiente = Number(element);

                        if(!isNaN(termino.coeficiente)){
                            this.terminos.push(termino);
                        }
                    } catch (e) {
                        
                    }
                }
            }
        },
        calcularValoresPolinomial: function (x){
            let respuesta = 0;

            for (let i = 0; i < this.terminos.length; i++) {
                const element = this.terminos[i];

                let x1 = Math.pow(x, element.exp);

                respuesta += x1 * element.coeficiente;
            }

            return respuesta;
        },
        calcular: function (){
            this.analizadorLexico();

            if(!isNaN(Number(this.a)) && !isNaN(Number(this.b)) && !isNaN(Number(this.e)) && Number(this.e) > 0 ){
                this.tbValores = [{
                    xi: Number(this.a),
                    xd: Number(this.b),
                    xm: 0,
                    fxd: this.calcularValoresPolinomial(Number(this.a)),
                    fxi: this.calcularValoresPolinomial(Number(this.b)),
                    fxm: this.calcularValoresPolinomial(0),
                    e: 0,
                    aceptado: true,
                    comentarios: "Valores iniciales",
                }]
    
                this.calcularTerminoPolinomial(this.tbValores[0]);

                this.seen = true;
            }
        },
        dibujarGráfica(){
            var ctx = document.getElementById('myChart').getContext('2d');
            let ejex = new Array();
            let ejey = new Array();
            let fmx = new Array();
            let fmd = new Array();
            let fmi = new Array();
            let ejextmp = new Array();

            for (let i = 0; i < this.tbValores.length; i++) {
                const element = this.tbValores[i];
                ejextmp.push(element.xm);
                ejextmp.push(element.xi);
                ejextmp.push(element.xd);
            }

            let maxX = Math.max(...ejextmp);
            let minX = Math.min(...ejextmp);

            maxX = maxX > this.b ? this.b : maxX;
            minX = minX < this.a ? this.a : minX;

            for (let i = 0; i < this.tbValores.length; i++) {
                const element = this.tbValores[i];

                fmx.push(this.truncarValor(this.tbValores[i].fxm));
                fmd.push(this.truncarValor(this.tbValores[i].fxd));
                fmi.push(this.truncarValor(this.tbValores[i].fxi));
                ejey.push(this.truncarValor(this.calcularValoresPolinomial(i * (maxX - minX)/this.tbValores.length)));
                ejex.push(this.truncarValor(minX + (i * (maxX - minX)/this.tbValores.length)));
                
            }

            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ejex,
                    datasets: [
                        { 
                            data: ejey,
                            label: "f(x) = " + this.ecuacion.split("=")[0],
                            borderColor: "rgb(110, 178, 0)",
                            fill: false
                        },
                        { 
                            data: fmx,
                            label: "f(xm)",
                            borderColor: "rgb(255, 201, 140)",
                            fill: false
                        },
                        { 
                            data: fmd,
                            label: "f(xd)",
                            borderColor: "rgb(219, 191, 255)",
                            fill: false
                        },
                        { 
                            data: fmi,
                            label: "f(xi)",
                            borderColor: "rgb(191, 255, 219)",
                            fill: false
                        },
                        
                    ]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
        truncarValor: function (n){
            let exp = Math.pow(10,this.precision);
            return Math.trunc(n * exp)/ exp;
        },
    },
    mounted: function (params) {
        this.calcularValores();
        this.analizadorLexico();
        
        this.tipo= "polinomial";  

        switch (this.tipo) {
            case "polinomial":
                
                break;
        }

    },
    updated: function () {
          
    },

});