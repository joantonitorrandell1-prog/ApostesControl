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

    let token = localStorage.getItem('auth_token');
    if (!token) {
        alert('🔒 Error: No hi ha sessió iniciada. Inicia sessió primer a la web de control.');
        return;
    }

    fetch('https://apostes-control-back.vercel.app/api/apostes/importar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ apostes: llistaApostes })
    })
    .then(response => {
        if (response.status === 401) {
            alert('🔒 Error: La sessió ha expirat. Torna a iniciar sessió a la web de control.');
        } else if (response.ok) {
            return response.json().then(data => {
                alert('✅ ' + data.message);
            });
        } else {
            alert('❌ Error del servidor en processar les apostes.');
        }
    })
    .catch(error => {
        alert('🔌 Error de connexió amb el servidor.');
    });
})();
