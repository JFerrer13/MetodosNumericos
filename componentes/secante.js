Vue.component('secante', {
    template: //html
    `
    <div class="row" name="secante">
        <div class="col-10 offset-1">
            <div class="row justify-content-center">
                <div class="col-6 col-md-12 params text-centerparams text-center">
                    <strong class="text-right">X1 = </strong>
                    <input class="form-control" type="number" v-model="x1" />
                    <strong>,</strong>
                    <strong class="text-right">X2 = </strong>
                    <input class="form-control" type="number" v-model="x2" />
                    <strong>,</strong>
                    <strong class="text-right"> E = </strong>
                    <input class="form-control" type="number" v-model="e" />
                    <strong>, Presicion = </strong>
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
                <div class="col-7">
                    <div class="row justify-content-center">
                        <div class="col-10 tb-h1">
                        <h1>La tabla...</h1>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-10">
                            <div class="row">
                                <div class="col-2 tb-h2"><label>#</label></div>
                                <div class="col-2 tb-h2"><label>x</label></div>
                                <div class="col-2 tb-h2"><label>f(x)</label></div>
                                <div class="col-2 tb-h2"><label>Error</label></div>
                                <div class="col-2 tb-h2"><label>¿Continúo?</label></div>
                                <div class="col-2 tb-h2"><label>Errores</label></div>
                            </div>
                        </div>
                    </div>
                    <div class="row justify-content-center" v-for="(item, index) in tbValores">
                        <div class="col-10">
                            <div class="row">
                                <div class="col-2 tb-celda" v-text="index"></div>
                                <div class="col-2 tb-celda" v-text="truncarValor(item.x)"></div>
                                <div class="col-2 tb-celda" v-text="truncarValor(item.fx)"></div>
                                <div class="col-2 tb-celda" v-text="truncarValor(item.e)"></div>
                                <div class="col-2 tb-celda" v-text="item.aceptado"></div>
                                <div class="col-2 tb-celda" v-text="item.comentarios"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-5">
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
            x1: 0,
            x2: 1,
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
            if(!(this.x2 !== null && this.x1 !== null && this.e && termino)){
                return -1;
            }

            let nuevoTermino = {
                x: termino.x - ((termino.x - termino.terminoOld.x) * termino.fx)/(termino.fx - termino.terminoOld.fx),
                fx: null,
                e: null,
                aceptado: false,
                comentarios: "",
                terminoOld: termino
            }

            nuevoTermino.fx = app.calcularValoresPolinomial(nuevoTermino.x, this.terminos);
            nuevoTermino.e = Math.abs(termino.x - nuevoTermino.x);
            nuevoTermino.aceptado = nuevoTermino.e >= Number(this.e) ||!nuevoTermino.e ? true : false;

            this.tbValores.push(nuevoTermino);
            
            if(nuevoTermino.aceptado && this.max < 50){
                this.max++;
                console.log(this.max)
                this.calcularTerminoPolinomial(nuevoTermino);
            }
        },
        calcular: function (){
            this.terminos = app.analizadorLexico();
            this.derivados = app.analizadorLexico(this.derivada);

            if(!isNaN(Number(this.x1)) && !isNaN(Number(this.x2)) && !isNaN(Number(this.e)) && Number(this.e) > 0 ){
                this.tbValores = [{
                    x: Number(this.x1),
                    fx: app.calcularValoresPolinomial(Number(this.x1), this.terminos),
                    e: 0,
                    aceptado: true,
                    comentarios: "Valores iniciales",
                    terminoOld: null,
                },{
                    x: Number(this.x2),
                    fx: app.calcularValoresPolinomial(Number(this.x2), this.terminos),
                    e: Math.abs(this.x2 - this.x1),
                    aceptado: true,
                    comentarios: "Valores iniciales",
                    terminoOld: {
                        x: Number(this.x1),
                        fx: app.calcularValoresPolinomial(Number(this.x1), this.terminos),
                        e: 0,
                        aceptado: true,
                        comentarios: "Valores iniciales",
                        terminoOld: null,
                    },
                }]
    
                this.calcularTerminoPolinomial(this.tbValores[1]);

                this.seen = true;
            }
        },
        dibujarGráfica(){
            var ctx = document.getElementById('myChart').getContext('2d');
            let ejex = new Array();
            let fx  = new Array();
            let ejextmp = new Array();

            for (let i = 0; i < this.tbValores.length; i++) {
                const element = this.tbValores[i];
                ejextmp.push(element.x);
            }

            for (let i = 0; i < this.tbValores.length; i++) {
                const element = this.tbValores[i];

                fx.push(this.truncarValor(this.tbValores[i].fx));
                //ejey.push(this.truncarValor(app.calcularValoresPolinomial(i * (maxX - minX)/this.tbValores.length, this.terminos)));
                ejex.push(this.truncarValor(this.tbValores[i].x));
                
            }

            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ejex,
                    datasets: [
                        { 
                            data: fx,
                            label: "f(x)",
                            borderColor: "rgb(255, 201, 140)",
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
        this.terminos = app.analizadorLexico();
        
        this.tipo= "polinomial";  

        switch (this.tipo) {
            case "polinomial":
                
                break;
        }

    },
    updated: function () {
          
    },

});