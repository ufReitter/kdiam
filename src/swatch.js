let swresult = '';

let swstart = performance.now();
let swend = performance.now();

let swtimings = {};

function swatch(name){
    if(!swtimings[name]){
        swtimings[name] = { t0: performance.now() };
    } else {
        swtimings[name].t1 = performance.now();
    }
}


function swatchresult(){
    for (let name in swtimings){
        swresult += (swtimings[name].t1 - swtimings[name].t0).toFixed(1) + ' ms '+ name + '\n';
    }
    swend = performance.now();
    swresult += (swend - swstart).toFixed(1) + ' ms complete'
    console.log(swresult)
}

