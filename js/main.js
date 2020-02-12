/* SISTEMA GENERAL */
let valorUC = 0;
let vrealUC = valorUC;
let visualUC = 0;
let ucbase = 0;
let ucbaseMinor = 0;
let uctotal = 0;
let uctotalMinor = 0;
let ucpagar = 0;
let totalbs = 0;
let totalbsMinor = 0;
let ucrec = 0;

let sede;
let carrera;
let materias;
let coop;
let cober;

let limitProp = 27;
let limitBeca = 30;
let limitFab = 30;

let hoy = new Date();
let mode = "UC";

//PERIODOS TABLA SYSTEM
let diaAct = hoy.getDate();
let mesAct = hoy.getMonth() + 1;
let perBtnActivo = "";
let perActivo = 0;

let templateSelect = "";
let templateSelectMinor = "";

let infoTXT = `Materias Semi-Presenciales como electivas pueden variar su modalidad (TAXONOMIA) <br> Las materias de Comprensión de Contenidos en Inglés y Producción de Contenidos en Inglés aunque no aparezca el cambio en la malla curricular, el cambio de taxonomía de T6 a TA8 afecta a todos los alumnos <br> <a href="https://www.ucab.edu.ve/informacion-institucional/secretaria/servicios/plan-de-estudios/"> <br> Más información de pensums </a>`;
//FUNCIONES

function initVar(md) {
    LoadUC();

    vrealUC = valorUC;
    visualUC = 0;
    ucbase = 0;
    uctotal = 0;
    ucpagar = 0;
    totalbs = 0;
    ucrec = 0;

    sede = "";
    carrera = "";
    materias = "";
    coop = "";
    cober = "";

    limitProp = 27;
    limitBeca = 30;
    limitFab = 30;

    cleanTabla();
    cleanTableMat();
    actualizarTotalUC();

    if (md == "FAB") {
        //Codigo desactivado por autoridades
        mode = "FAB";

        //sede
        //sedeSelect('mtb');
        totalizarDonacion();
        document.getElementById("mesActual").innerHTML = `${loadMes()} <br> UC: ${formatNumber.new(
            getUCfecha(getFistDayThisMonth()),
            "Bs.S ",
            true
        )}`;
        //coop
        //coop = 'fab';
        //cober = 10; //min

        console.log("inicializando FAB");
    } else {
        mode = "UC";
        //Volvemos sede text a la normalidad
        let span = document.getElementById("sName");
        let parentElem = span.parentElement;
        span.innerHTML = "SEDE";
        parentElem.children[2].style.display = "block";
        console.log("inicializando UC");
    }
}

window.onload = () => {
    //Cargamos UC visual
    InicializarPeriodoSys();

    document.getElementById("ucvalue").innerHTML = `${formatNumber.new(LoadUC())} Bs.S`;
    UC = visualUC;

    //setGa(false);

    initAccordion();

    //ocultamos loader
    document.getElementsByClassName("loader")[0].style.display = "none";
    //Mostramos menu y footer
    document.getElementById("menu").style.display = "block";
    document.getElementsByTagName("footer")[0].style.display = "block";
};

/* SISTEMA PERIODO TABLA*/
function InicializarPeriodoSys() {
    if (
        (mesAct > 2 && mesAct < 8) ||
        (mesAct == 2 && diaAct >= 11) /* Mes febrero */ ||
        (mesAct == 8 && diaAct <= 15) /* Mes Agosto */
    ) {
        //PERIODO 1
        //console.warn("PERIODO 1");
        perActivo = 1;
    } else {
        //PERIODO 2
        //console.warn("PERIODO 2");
        perActivo = 2;
    }

    let botones = document.getElementById(`per${perActivo}`).children;
    let lastI = 0;
    for (i = 0; i < botones.length; i++) {
        let idBTN = `p${perActivo}b${i + 1}`;
        let codeGen = genPeriodoCode(perActivo, i);

        //Comprobar existencia del codigo en data.js ~ UC anunciada para periodo
        if (periodo[codeGen]) {
            perioact = codeGen;
            templateSelect = botones[i].dataset.table;
            templateSelectMinor = botones[i].dataset.minor;
            lastI = i;
            botones[i].disabled = false;
            botones[i].addEventListener("click", () => changePeriodo(idBTN, codeGen));
        }
    }

    botones[lastI].classList.add("active");
    perBtnActivo = botones[lastI].id;
}

function showPeriodo() {
    if (perActivo == 1) {
        //PERIODO 1
        document.getElementById("per1").style.display = "block";
    } else {
        //PERIODO 2
        document.getElementById("per2").style.display = "block";
    }
}

function changePeriodo(idElem, newPeriodo) {
    //Activamos boton
    if (perBtnActivo != "") document.getElementById(perBtnActivo).classList.remove("active");
    perBtnActivo = idElem;
    document.getElementById(idElem).classList.add("active");

    //CAMBIO
    perioact = newPeriodo;
    templateSelect = document.getElementById(idElem).dataset.table;
    templateSelectMinor = document.getElementById(idElem).dataset.minor;

    LoadUC();
    calcularMatricula();

    //console.info("#Periodo cambiado: ", newPeriodo);
}

function genPeriodoCode(Nper, Nbtn) {
    if (Nper == 1) {
        //PERIODO 1
        //Verano (cada 4 btn)Per1
        if (Nbtn % 3 == 0) {
            return `${Nbtn / 3 + 1}${hoy.getFullYear() % 100}`;
        } else {
            //Sem 1 = Part 1 y 2
            return `${hoy.getFullYear()}${hoy.getFullYear() % 100}${Nbtn}`;
        }
    } else {
        //PERIODO 2 ~ Cambio de year ~ Enero condicion
        // variable de modo
        let Kyear = 0;
        if (hoy.getMonth() < 2) {
            Kyear = -1;
        }

        //Verano (cada 4 btn)Per1
        if (Nbtn % 3 == 0) {
            if (Nbtn == 0) {
                //Ver anterior
                return `2${(hoy.getFullYear() + Kyear) % 100}`;
            } else {
                //Ver next year
                return `1${(hoy.getFullYear() + (1 + Kyear)) % 100}`;
            }
        } else {
            //Sem 1 = Part 1 y 2
            return `${hoy.getFullYear() + Kyear}${((hoy.getFullYear() + Kyear) % 100) + 1}${Nbtn}`;
        }
    }
}
/* END SISTEMA PERIODO TABLA*/

/* SISTEMA MENU */
function OpenDiv(name) {
    let elems_menu = document.getElementsByClassName("emenu");
    //ocultamos todos
    for (let elem of elems_menu) {
        elem.style.display = "none";
    }

    switch (name) {
        case "menu":
            document.getElementById("menu").style.display = "block";
            document.title = "UCalculadora";
            OnClickGa("backMenu", "Menu");
            break;

        case "ucalculadora":
            document.getElementsByTagName("header")[0].style.display = "block";
            document.getElementsByClassName("ucalculadora")[0].style.display = "block";
            document.title = "UCalculadora - Matrícula";
            initVar("UC");
            OnClickGa("openUC", "Menu");
            break;

        case "historico":
            OnClickGa("openHistorico", "Menu");
            document.title = "UCalculadora - Histórico";
            document.getElementsByTagName("header")[0].style.display = "block";
            document.getElementsByClassName("historico")[0].style.display = "block";
            document.getElementsByClassName("ct-chart")[0].__chartist__.update();
            break;

        case "tool":
            OnClickGa("openTool", "Menu");
            document.getElementsByTagName("header")[0].style.display = "block";
            document.getElementsByClassName("tool")[0].style.display = "block";
            break;

        case "fab":
            OnClickGa("openFab", "Menu");
            document.title = "UCalculadora - FAB";
            initVar("FAB");
            document.getElementsByTagName("header")[0].style.display = "block";
            document.getElementsByClassName("fab")[0].style.display = "block";
            break;
    }
}

/* END SISTEMA MENU*/

/* SISTEMA GENERAL */

//Google analytics togle
function setGa(value) {
    let a = "Set: " + value;
    gtag("event", "ToggleGA", {
        event_category: "DevInteraccion",
        event_label: a,
    });

    window["ga-disable-UA-33542195-1"] = !value;
    console.log("Establecido ga-disable como: ", value);
}

function OnClickGa(act, typeInter, lb) {
    //si existe etiqueta hacer:
    //console.log('LB', lb)
    if (lb) {
        //console.log('enter');
        gtag("event", act, {
            event_category: typeInter + "Interaccion",
            event_label: lb,
        });
    } else {
        //console.log('not enter');
        gtag("event", act, {
            event_category: typeInter + "Interaccion",
        });
    }
}

function cleanTabla() {
    document.getElementById("pagos").innerHTML = "";
    document.getElementById("pagoMinor").innerHTML = "";
    document.getElementById("alertmsg").style.display = "none";
}

function calcularMatricula() {
    if (sede && carrera && coop) {
        document.getElementById("alertmsg").style.display = "none";
        totalizacion();
        showPeriodo();
    } else {
        alert("Debes seleccionar una sede, carrera y ayuda economica!");
    }
}

let formatNumber = {
    separador: ".",
    sepDecimal: ",",
    formatear: function(num) {
        num += "";
        var splitStr = num.split(".");
        var splitLeft = splitStr[0];
        var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : "";
        var regx = /(\d+)(\d{3})/;
        while (regx.test(splitLeft)) {
            splitLeft = splitLeft.replace(regx, "$1" + this.separador + "$2");
        }
        return this.simbol + splitLeft + splitRight;
    },
    new: function(num, simbol, IsProc) {
        this.simbol = simbol || "";
        if (IsProc) {
            //console.log("Num entrante",num);
            return this.formatear(parseFloat(num).toFixed(2));
        }
        return this.formatear(num);
    },
};

function LoadUC() {
    let dataux = periodo[perioact];
    let uc = dataux.base;
    valorUC = uc;
    //Recorremos si existe lista de variacion
    /*
        if(dataux.variacion){
            let timecmp;
            for (let i = 0; i < dataux.variacion.length; i++) {
                timecmp = new Date(dataux.variacion[i][0]);
                    if(today.getTime() > timecmp.getTime()){
                        //Hoy es mayor que una fecha de variacion
                        //aplicar sobre base
                        uc = uc * (1+(dataux.variacion[i][1]/100));
                    }else{
                        //si variacion es mayor
                        //aun no ha llegado esa fecha
                        break;
                    }
            }
    }*/
    uc = getUCfecha(hoy);
    //console.log(uc);
    visualUC = uc;
    return uc;
}

//Retorna jsonData de carrera
function GetJsonDataMaterias(tx) {
    tx = tx.replace(/\s/g, "");
    tx = tx.replace(/\n/g, "");
    tx = tx.toLowerCase();

    //console.log("TX " + tx);
    return (tx = window[tx]);
}

//Arregla uc cambiado en el archivo debido al V y SP
function FixUC(taxNum, ucnum) {
    //console.log(taxNum);

    if (taxNum) {
        if (taxNum.includes("(V)") || taxNum.includes("(SP)")) {
            //si es una modalida sp y v
            //descontamos el 0.72
            let k = Number(ucnum) * 0.72;
            //console.log("K2 " + k);
            return Math.round(k);
        } else {
            //console.log(ucnum);
            return Math.round(Number(ucnum));
        }
    }
    return 0;
}

function UCrecargo(uc, tax) {
    let taxN = tax.replace(/^\D+/g, "");

    if (tax.includes("(V)") || tax.includes("(SP)")) {
        //if (taxN == "7" || taxN == "8" || taxN == "9") {
        //Recargo 20%
        //return uc * 1.2;
        //}
        //ya DB incluye recargo pro virtual
        //+40% =>> 30%
        //BAJ +30% => +20%
        return uc * 1.2;
    } else {
        switch (taxN) {
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
                //sin recargo
                //console.log("sin recargo");
                return uc;
                break;

            case "7":
            case "8":
                //+ 30% => 20%
                //console.log("+ 30% 20%");
                //BAJA +20% => 10%
                return uc * 1.1;

                break;

            case "9":
                return uc * 1.15;
                break;

            default:
                //console.log("error UC RECARGO");
                //alert('ERROR INESPERADO: #01');
                return 0;
                break;
        }
    }
}

function totalizacion() {
    vrealUC = valorUC;
    let cobertura = cober / 100;
    if (mode == "UC") {
        cobertura = 1 - cober / 100;
    }

    let ucfuera = 0;

    //descuentos segun carrera
    if (
        carrera.includes("educacion") ||
        carrera.includes("letras") ||
        carrera.includes("filosofia")
    ) {
        //Aplicamos 30% de descuento >>
        vrealUC = valorUC * 0.7;
    }

    //descuento por sede
    switch (sede) {
        case "g":
        case "tq":
            //Guayana  /Los teques 20% descuento
            //document.getElementById("info2").innerHTML = "*¡Aplicado descuento del 20% de la sede!* <br>";
            vrealUC *= 0.8;

            break;
    }

    //Recargo por taxonomia
    let ucre = uctotal - ucbase;
    //descuento por cooperacion
    if (coop != "fab" && coop != "ninguna" && coop != "baup") {
        //Beca o Prop
        let limit = limitBeca;
        if (coop != "beca") {
            limit = limitProp;
        }

        if (ucbase <= limit) {
            // console.log("menor");
            //por debajo de coobertura
            //aplicamos %  a lo que queda
            ucfuera = ucre;
            ucpagar = ucbase * cobertura + ucre;
        } else if (ucbase > limit) {
            //console.log("mayor");
            //por encima de cobertura
            ucfuera = ucbase - limit + ucre;
            ucpagar = ucbase - limit + ucre + limit * cobertura;
        }
    } else if (coop != "ninguna" && coop != "baup") {
        //FAB
        if (ucbase <= limitFab) {
            // console.log("menor fab");
            //Por debajo
            if (mode == "UC") {
                ucfuera = ucre;
                ucpagar = ucbase * cobertura + ucre;
            } else {
                ucfuera = ucre;
                ucrec = ucre; //Recargo por tax
                ucpagar = ucbase * cobertura;
            }
        } else {
            //console.log("mayor fab");
            //Por encima
            if (mode == "UC") {
                ucfuera = ucbase - limitFab + ucre;
                ucpagar = ucbase - limitFab + ucre + limitFab * cobertura;
            } else {
                ucfuera = ucbase - limitFab + ucre;
                ucrec = ucre;
                ucpagar = limitFab * cobertura; //Solamente lo dentro del limite
            }
        }
    } else if (coop == "baup") {
        //Beca a Un Pana
        ucpagar = uctotal * cobertura;
    } else {
        //ninguna cooperacion
        ucpagar = uctotal;
    }

    if (ucfuera > 0) {
        msgAlert(
            `<b> ¡${Number(ucfuera).toFixed(
                2
            )} UC fuera de financiamiento! </b> <br> (Incluido en el total)`
        );
    }

    totalbs = Number(ucpagar * vrealUC).toFixed(2);
    totalbsMinor = Number(uctotalMinor * vrealUC).toFixed(2);

    /*
    console.warn("FINAL: ");
    console.log("Cobertura: ", cobertura);
    console.log("uctotal: ", uctotal);
    console.log("ucbase: ", ucbase);
    console.log("uctotal MINOR: ", uctotalMinor);
    console.log("ucbase MINOR: ", ucbaseMinor);
    console.log("Recargos: ", uctotal - ucbase);
    console.log("UC fuera cobertura: ", ucfuera);
    console.log("UC Recargo: ", ucrec);
    console.log("UCpagar: ", ucpagar);
    console.log("Valor real UC (BASE): ", vrealUC);
    console.log("Total totalbs*3: ", totalbs * 3);
    console.log("Total Minors bs*3: ", totalbsMinor * 3);*/

    if (mode == "UC") {
        GenerarTabla();
    } else {
        loadMontosAcordion(ucrec, ucfuera);
    }
}

function getUCfecha(fecha) {
    let f = new Date(fecha);
    let dataux = periodo[perioact];
    let uc = dataux.base;

    if (dataux.variacion) {
        let timecmp;
        for (let i = 0; i < dataux.variacion.length; i++) {
            timecmp = new Date(dataux.variacion[i][0]);
            if (f.getTime() >= timecmp.getTime()) {
                //Hoy es mayor que una fecha de variacion
                //aplicar sobre base
                uc = uc * (1 + dataux.variacion[i][1] / 100);
            } else {
                //si variacion es mayor
                //aun no ha llegado esa fecha
                break;
            }
        }
    }
    return Number(uc).toFixed(2);
}

function GetMontoTarifa(fecha) {
    return getUCfecha(fecha) * ucpagar;
}

function getFechaAnoActual(dia, mes) {
    //MM DD AAAA
    //Enero/Febrero caso borde
    let Kyear = 0;
    //Mes partida ano pasado y Mes destino next => +1
    //Mes partida next y Mes destino pasado => -1
    if (hoy.getMonth() + 1 >= 2 && mes <= 2) {
        Kyear = 1;
    } else if (hoy.getMonth() + 1 < 2 && mes > 2) {
        Kyear = -1;
    }

    return `${mes}/${dia}/${hoy.getFullYear() + Kyear}`;
}

/* END SISTEMA GENERAL */

/* SISTEMA DE MATERIAS */
function toggleList(elem) {
    if (mode == "UC") {
        elem.classList.toggle("active");
        var content = elem.nextElementSibling;

        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    } else {
        //actua como seleccionador de semestre en FAB mode
        //console.log(elem.innerHTML.trim());
        sem = elem.innerHTML.trim();
        document.getElementById("sSem").innerHTML = sem;

        delAllMaterias();
        addAllMaterias();
        closeModal();
    }
}

function actualizarTotalUC() {
    document.getElementById("totalUC").innerHTML = `${ucbase + ucbaseMinor} UC`;
}

function materiaSelect(elem, isMinor) {
    //Verificamos si es true o false
    let id = elem.getAttribute("id");
    if (elem.checked) {
        //activado
        addMateriaList(id, isMinor);
    } else {
        //desactivado >> eliminar
        deleteMateriaList(id, isMinor);
    }
}

function addMateriaList(id, isMinor) {
    let data = materias[id];

    let main = document.getElementsByClassName("materias")[0];

    let divC = document.createElement("div");
    divC.classList.add("container", id);
    divC.setAttribute("onclick", `desCheckMatList(${id}, ${isMinor});`);

    divC.innerHTML = `<table><tr><td class="nMat"> <span style="color: red;">X</span> ${data.Asignatura}</td><td> ${data.UC} UC</td></tr><tr><td>${data.Semestre}</td><td> ${data.Tax}</td></tr></table>`;

    main.appendChild(divC);

    gtag("event", "MateriaSelect", {
        event_category: "UCinteraccion",
        event_label: isMinor ? "(MINOR) " + data.Asignatura : data.Asignatura,
    });

    //ucbase += FixUC(data.Tax, data.UC);
    if (isMinor) {
        ucbaseMinor += data.UC;
        uctotalMinor += UCrecargo(data.UC, data.Tax);
    } else {
        ucbase += data.UC;
        uctotal += UCrecargo(data.UC, data.Tax);
    }

    actualizarTotalUC();
}

function deleteMateriaList(id, isMinor) {
    let elem = document.getElementsByClassName(id)[0];
    elem.parentNode.removeChild(elem);

    let data = materias[id];
    //ucbase -= FixUC(data.Tax, data.UC);
    if (isMinor) {
        ucbaseMinor -= data.UC;
        uctotalMinor -= UCrecargo(data.UC, data.Tax);
    } else {
        ucbase -= data.UC;
        uctotal -= UCrecargo(data.UC, data.Tax);
    }

    actualizarTotalUC();
}

function cleanTableMat() {
    document.getElementsByClassName("materias")[0].innerHTML = "";
}
/* END SISTEMA DE MATERIAS */

/* SISTEMA TABLA */
//SYSTEM TABLE
let ColorArray = ["#fed20180", "#34b2e466"];
let ScolorUsed = false;

function GenerarTabla(isMinor = false) {
    //let tabla = tables[perioact];
    //console.warn("isMinor? ", isMinor);
    if (uctotal > 0 || isMinor) {
        let tabla;
        let celmax;

        let divTable;
        if (isMinor) {
            tabla = templateTabla[templateSelectMinor];
            celmax = tabla[0];

            divTable = document.getElementById("pagoMinor");
        } else {
            //No Minors
            tabla = templateTabla[templateSelect];
            celmax = tabla[0];

            divTable = document.getElementById("pagos");
            document.getElementById("pagoMinor").innerHTML = "";
        }

        divTable.innerHTML = "";
        let tableHTML = document.createElement("table");
        tableHTML.style = "overflow-x:auto;";
        tableHTML.classList.add("tablaPagos");

        //Recorremos para obtener FILAS
        for (i = 1; i < tabla.length; i++) {
            let fila = tabla[i];
            //console.log('FILA ' + i)
            let filaHTML;

            if (!Number.isInteger(fila[0])) {
                //Si no es fila mixta
                filaHTML = GenColumnas(fila, celmax);
            } else {
                //Si es fila mixta
                let fmix = fila.slice(1, fila.length);
                let rspan = fila[0];

                //console.log('Fila mix');
                filaHTML = GenFilaMix(rspan, fmix, celmax);
            }

            tableHTML.appendChild(filaHTML);
        }
        divTable.appendChild(tableHTML);
    }

    //Generar Minor Table
    if (!isMinor && uctotalMinor > 0) {
        GenerarTabla(true);
    }
}

function GenColumnas(fila, celmax) {
    let filaHTML = document.createElement("tr");

    for (j = 0; j < fila.length; j++) {
        //Obtenemos cada columna
        let celda = fila[j];
        let LongFilAc = fila.length;

        let celdaHTML = document.createElement("th");

        celdaHTML.colSpan = GetColSpan(LongFilAc, celmax, j);
        SetStyle(celdaHTML, LongFilAc, j);
        //let content = document.createTextNode(celda);
        celdaHTML.innerHTML = evaluar(celda);
        //celdaHTML.appendChild(content);

        filaHTML.appendChild(celdaHTML);
    }

    return filaHTML;
}

function GetColSpan(LongFila, celmax, index) {
    //console.log('Long', LongFila);
    if (LongFila == 1) {
        //Elemento unico de la columna
        return celmax;
    } else if (LongFila == 2) {
        //Solamente dos elementos
        if (index == 0) {
            //Primero sera 1
            //console.log('Primero');
            return 1;
        } else {
            //El segundo lo que queda
            //console.log("celmax", celmax);
            return celmax - 1;
        }
    } else {
        //Mas de elementos mayores a las columnas maximas
        //console.log("Mayores");
        return 1;
    }
}

function GenFilaMix(rowS, fmix, celmax) {
    let LongMainf;
    let divAux = document.createElement("tbody");
    //console.log(fmix);

    for (k = 0; k < fmix.length; k++) {
        //Recorremos cada fila mixta
        let fHTML = document.createElement("tr");

        for (l = 0; l < fmix[k].length; l++) {
            //Recorremos cada celda
            let celdaHTML = document.createElement("th");
            celdaCont = fmix[k][l];

            LongMainf = fmix[k].length;

            if (k == 0 && l == 0) {
                //Si Estamos en el primer elmento de todo
                celdaHTML.rowSpan = rowS;
                SetStyle(celdaHTML, LongMainf, 0);
            }
            celdaHTML.colSpan = GetColSpan(LongMainf, celmax, l);

            //let content = document.createTextNode(celdaCont);
            celdaHTML.innerHTML = evaluar(celdaCont);
            fHTML.appendChild(celdaHTML);
        }

        divAux.appendChild(fHTML);
    }

    return divAux;
}

function evaluar(orig) {
    let text = orig;
    let start = orig.search("eval");

    if (start != -1) {
        let end = orig.lastIndexOf(")");
        let toEval = orig.substring(start, end + 1);

        let ftPart = orig.substring(0, start);
        let scPart = orig.substring(end + 1, orig.length);

        text = ftPart + eval(toEval) + scPart + "";
    }
    return text;
}

function SetStyle(elemt, long, ind) {
    if (long == 1) {
        //Unico elemento
        let a;
        if (ScolorUsed) {
            a = 1;
            ScolorUsed = false;
        } else {
            a = 0;
            ScolorUsed = true;
        }
        elemt.style = "background-color:" + ColorArray[a] + ";";
    } else {
        if (ind == 0) {
            //si es el primero de varios
            elemt.id = "tt";
        }
    }
}

/* END TABLA */
