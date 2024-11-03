const oggettoSvg = document.getElementById("letterSVG");
let lettere = [];
let angolo = 0;
let ampiezza = 15;
let coloreAlternato = true;
const lunghezzaScia = 20;

function generaAmpiezzaCasuale(min, max) {
  return Math.random() * (max - min) + min;
}

oggettoSvg.addEventListener("load", function () {
  const documentoSvg = oggettoSvg.contentDocument;
  const percorsi = documentoSvg.querySelectorAll("path");

  if (percorsi.length > 0) {
    percorsi.forEach((percorso) => {
      const lunghezzaPercorso = percorso.getTotalLength();
      const numeroPunti = 60;
      const punti = [];
      for (let i = 0; i < numeroPunti; i++) {
        const punto = percorso.getPointAtLength(
          (i / numeroPunti) * lunghezzaPercorso
        );
        punti.push({
          x: punto.x,
          y: punto.y,
          xOriginale: punto.x,
          scia: Array(lunghezzaScia).fill({ x: punto.x, y: punto.y }),
        });
      }
      lettere.push({ percorso, punti });
      const percorsoScia = documentoSvg.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      percorsoScia.setAttribute("fill", "none");
      percorsoScia.setAttribute("stroke", coloreAlternato ? "#333" : "#00f");
      percorsoScia.setAttribute("stroke-width", 1);
      percorsoScia.setAttribute("stroke-opacity", 0.7);
      documentoSvg.querySelector("svg").appendChild(percorsoScia);
      lettere[lettere.length - 1].percorsoScia = percorsoScia;
    });
    anima();
  } else {
    console.error("nessun SVG trovato.");
  }
});
function anima() {
  lettere.forEach((lettera, indiceLettera) => {
    let datiPercorso = "";
    let datiScia = "";

    lettera.punti.forEach((punto, indice) => {
      const offsetX = Math.sin(angolo + indice * 0.2) * ampiezza;
      const nuovoX = punto.xOriginale + offsetX;
      punto.scia.unshift({ x: nuovoX, y: punto.y });
      punto.scia = punto.scia.slice(0, lunghezzaScia);

      if (indice === 0) {
        datiPercorso += `M ${nuovoX},${punto.y}`;
      } else {
        datiPercorso += ` L ${nuovoX},${punto.y}`;
      }

      punto.scia.forEach((puntoScia, indiceScia) => {
        if (indiceScia === 0) {
          datiScia += `M ${puntoScia.x},${puntoScia.y}`;
        } else {
          datiScia += ` L ${puntoScia.x},${puntoScia.y}`;
        }
      });
    });
    lettera.percorso.setAttribute("d", datiPercorso);
    lettera.percorso.setAttribute("fill", "none");
    lettera.percorso.setAttribute("stroke", coloreAlternato ? "#333" : "#00f");
    lettera.percorso.setAttribute("stroke-width", 1);

    lettera.percorsoScia.setAttribute("d", datiScia);
  });
  angolo += 0.04;
  requestAnimationFrame(anima);
}

document.addEventListener("click", function () {
  ampiezza = generaAmpiezzaCasuale(1, 30);
  coloreAlternato = !coloreAlternato;
});
