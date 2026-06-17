javascript:(function(){
    let filesAposta = document.querySelectorAll('.wl-BetSelection, .gl-MarketGroup, .wl-BetItem');
    let llistaApostes = [];

    if (filesAposta.length === 0) {
        alert('No s\'ha trobat cap aposta a la pantalla. Assegura\'t d\'estar a la secció d\'Historial d\'Apostes de Bet365.');
        return;
    }

    filesAposta.forEach(fila => {
        let textBrut = fila.innerText || "";
        let linies = textBrut.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        let esportICompeticio = linies.find(l => l.includes(' - ')) || "Altres - General";
        let [esport, competicio] = esportICompeticio.split(' - ').map(s => s.trim());

        if (!competicio) {
            competicio = esport;
            esport = "General";
        }

        let quota = parseFloat((textBrut.match(/\b\d+\.\d{2}\b/) || [0])[0]);
        let importApostat = parseFloat((textBrut.match(/Import:\s*([\d.,]+)/i) || [null, 0])[1]);

        llistaApostes.push({
            esport: esport,
            competicio: competicio,
            detall: linies[0] || "Aposta Bet365",
            quota: quota,
            import: importApostat
        });
    });

    let dadesCodificades = btoa(encodeURIComponent(JSON.stringify(llistaApostes)));
    let url = 'https://apostes-control-front.vercel.app/importar?data=' + dadesCodificades;
    window.open(url, '_blank');
})();
