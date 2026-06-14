// JavaScript Controller - Dashboard Climático

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let API_URL = localStorage.getItem('backend_api_url');
    if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
        API_URL = 'https://dashboard-climatico-b0zc.onrender.com';
        localStorage.setItem('backend_api_url', API_URL);
    }
    let isBackendOnline = false;
    let dataState = {
        regioes: [],
        estacoes: [],
        sensores: [],
        leituras: [],
        emissoes: []
    };

    // Chart References
    let climaticChart = null;
    let emissionsChart = null;

    // --- UI ELEMENTS ---
    const backendUrlInput = document.getElementById('backend-url');
    const btnSaveConfig = document.getElementById('btn-save-config');
    const btnToggleConfig = document.getElementById('btn-toggle-config');
    const configDropdown = document.getElementById('config-dropdown');
    const apiStatus = document.getElementById('api-status');
    const btnSync = document.getElementById('btn-sync');
    const cityInput = document.getElementById('city-input');
    const btnRefreshCharts = document.getElementById('btn-refresh-charts');

    // Forms
    const formRegiao = document.getElementById('form-regiao');
    const formEstacao = document.getElementById('form-estacao');
    const formSensor = document.getElementById('form-sensor');
    const formEmissao = document.getElementById('form-emissao');
    const formLeitura = document.getElementById('form-leitura');

    // Table Bodies
    const tableRegioes = document.getElementById('table-body-regioes');
    const tableEstacoes = document.getElementById('table-body-estacoes');
    const tableSensores = document.getElementById('table-body-sensores');
    const tableEmissoes = document.getElementById('table-body-emissoes');
    const tableLeituras = document.getElementById('table-body-leituras');

    // Dropdowns
    const selectEstRegiao = document.getElementById('est-regiao');
    const selectSensEstacao = document.getElementById('sens-estacao');
    const selectEmRegiao = document.getElementById('em-regiao');
    const selectLeitSensor = document.getElementById('leit-sensor');
    const selectDashboardFilter = document.getElementById('dashboard-region-filter');

    // Set Initial Input Value
    backendUrlInput.value = API_URL;

    // --- INITIALIZATION ---
    checkBackendStatus();
    setupEventListeners();
    // Periodically poll backend status
    setInterval(checkBackendStatus, 15000);

    // --- CONFIGURATION LOGIC ---
    btnToggleConfig.addEventListener('click', (e) => {
        e.stopPropagation();
        configDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!configDropdown.contains(e.target) && e.target !== btnToggleConfig) {
            configDropdown.classList.remove('show');
        }
    });

    btnSaveConfig.addEventListener('click', () => {
        let url = backendUrlInput.value.trim();
        if (url.endsWith('/')) {
            url = url.slice(0, -1); // Remove trailing slash
        }
        API_URL = url;
        localStorage.setItem('backend_api_url', url);
        configDropdown.classList.remove('show');
        showToast('URL do Backend atualizada!');
        checkBackendStatus();
    });

    // --- TABS SYSTEM ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- API STATUS & FETCH LOGIC ---
    async function checkBackendStatus() {
        try {
            const response = await fetch(`${API_URL}/api/regioes`, { method: 'GET', signal: AbortSignal.timeout(4000) });
            if (response.ok) {
                updateStatusUI(true);
                if (!isBackendOnline) {
                    isBackendOnline = true;
                    fetchAllData();
                }
            } else {
                updateStatusUI(false);
                isBackendOnline = false;
            }
        } catch (error) {
            updateStatusUI(false);
            isBackendOnline = false;
        }
    }

    function updateStatusUI(online) {
        const dot = apiStatus.querySelector('.status-dot');
        const text = apiStatus.querySelector('.status-text');
        if (online) {
            dot.className = 'status-dot online';
            text.textContent = 'Backend Online';
        } else {
            dot.className = 'status-dot offline';
            text.textContent = 'Backend Offline';
        }
    }

    // Load all data
    async function fetchAllData() {
        if (!isBackendOnline) return;
        
        try {
            const [reg, est, sens, leit, em] = await Promise.all([
                fetch(`${API_URL}/api/regioes`).then(r => r.json()),
                fetch(`${API_URL}/api/estacoes`).then(r => r.json()),
                fetch(`${API_URL}/api/sensores`).then(r => r.json()),
                fetch(`${API_URL}/api/leituras`).then(r => r.json()),
                fetch(`${API_URL}/api/emissoes`).then(r => r.json())
            ]);

            dataState.regioes = reg || [];
            dataState.estacoes = est || [];
            dataState.sensores = sens || [];
            dataState.leituras = leit || [];
            dataState.emissoes = em || [];

            updateDashboardUI();
        } catch (error) {
            console.error("Erro ao carregar dados do backend:", error);
            showToast("Erro ao sincronizar com o backend!");
        }
    }

    // --- UI UPDATE LOGIC ---
    function updateDashboardUI() {
        populateTables();
        populateDropdowns();
        calculateMetrics();
        renderClimaticChart();
        renderEmissionsChart();
    }

    function calculateMetrics() {
        const filterVal = selectDashboardFilter.value || 'all';
        
        let readings = [...dataState.leituras];
        let emissions = [...dataState.emissoes];
        let stations = [...dataState.estacoes];
        
        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            stations = stations.filter(e => e.regiao && e.regiao.idRegiao === regId);
            const stationIds = stations.map(e => e.idEstacao);
            readings = readings.filter(l => l.sensor && l.sensor.estacao && stationIds.includes(l.sensor.estacao.idEstacao));
            emissions = emissions.filter(e => e.regiao && e.regiao.idRegiao === regId);
        }

        // Temp Average
        const tempReadings = readings.filter(l => l.sensor && l.sensor.tipoSensor.toLowerCase() === 'temperatura');
        const tempSum = tempReadings.reduce((sum, r) => sum + Number(r.valorMedido), 0);
        const tempAvg = tempReadings.length > 0 ? (tempSum / tempReadings.length).toFixed(1) : '--';
        document.getElementById('val-temp-avg').textContent = tempAvg !== '--' ? `${tempAvg}°C` : '--°C';
        document.getElementById('val-temp-count').textContent = `${tempReadings.length} medições`;

        // Humidity Average
        const humidityReadings = readings.filter(l => l.sensor && l.sensor.tipoSensor.toLowerCase() === 'umidade');
        const humiditySum = humidityReadings.reduce((sum, r) => sum + Number(r.valorMedido), 0);
        const humidityAvg = humidityReadings.length > 0 ? (humiditySum / humidityReadings.length).toFixed(0) : '--';
        document.getElementById('val-humidity-avg').textContent = humidityAvg !== '--' ? `${humidityAvg}%` : '--%';
        document.getElementById('val-humidity-count').textContent = `${humidityReadings.length} medições`;

        // Stations Count
        document.getElementById('val-stations-count').textContent = stations.length;
        document.getElementById('val-regions-count').textContent = `${dataState.regioes.length} Regiões cadastradas`;

        // Emissions Total
        const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emissaoAnualEstimada), 0);
        document.getElementById('val-emissions-total').textContent = `${totalEmissions.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
        document.getElementById('val-sources-count').textContent = `${emissions.length} Fontes industriais`;
    }

    function populateTables() {
        const filterVal = selectDashboardFilter.value || 'all';
        
        let readings = [...dataState.leituras];
        let emissions = [...dataState.emissoes];
        let stations = [...dataState.estacoes];
        
        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            stations = stations.filter(e => e.regiao && e.regiao.idRegiao === regId);
            const stationIds = stations.map(e => e.idEstacao);
            readings = readings.filter(l => l.sensor && l.sensor.estacao && stationIds.includes(l.sensor.estacao.idEstacao));
            emissions = emissions.filter(e => e.regiao && e.regiao.idRegiao === regId);
        }

        // Regiões Table (not filtered)
        tableRegioes.innerHTML = dataState.regioes.map(r => `
            <tr>
                <td>${r.idRegiao}</td>
                <td><strong>${r.nomeRegiao}</strong></td>
                <td>${r.estadoProvincia || '--'}</td>
                <td>${r.pais}</td>
                <td>${r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : 'Sem coordenadas'}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">Nenhuma região cadastrada</td></tr>';

        // Estações Table
        tableEstacoes.innerHTML = stations.map(e => `
            <tr>
                <td>${e.idEstacao}</td>
                <td><strong>${e.nomeEstacao}</strong></td>
                <td>${e.regiao ? e.regiao.nomeRegiao : '--'}</td>
                <td>${e.dataInstalacao ? new Date(e.dataInstalacao).toLocaleDateString('pt-BR') : '--'}</td>
                <td><span class="badge ${getBadgeClass(e.statusOperacional)}">${e.statusOperacional}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">Nenhuma estação correspondente</td></tr>';

        // Sensores Table
        tableSensores.innerHTML = dataState.sensores.map(s => `
            <tr>
                <td>${s.idSensor}</td>
                <td>${s.estacao ? s.estacao.nomeEstacao : '--'}</td>
                <td><strong>${s.tipoSensor}</strong></td>
                <td>${s.unidadeMedida}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhum sensor cadastrado</td></tr>';

        // Emissões Table
        tableEmissoes.innerHTML = emissions.map(e => `
            <tr>
                <td>${e.idFonte}</td>
                <td><strong>${e.nomeEmpresaLocal}</strong></td>
                <td>${e.regiao ? e.regiao.nomeRegiao : '--'}</td>
                <td>${e.tipoPoluente}</td>
                <td>${Number(e.emissaoAnualEstimada).toLocaleString('pt-BR')} t</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">Nenhuma fonte de emissão correspondente</td></tr>';

        // Leituras Table
        tableLeituras.innerHTML = readings.map(l => `
            <tr>
                <td>#${l.idLeitura}</td>
                <td>${l.sensor && l.sensor.estacao ? l.sensor.estacao.nomeEstacao : '--'} ➔ <strong>${l.sensor ? l.sensor.tipoSensor : '--'}</strong></td>
                <td>${l.sensor ? l.sensor.tipoSensor : '--'}</td>
                <td style="color: ${l.sensor && l.sensor.tipoSensor.toLowerCase() === 'temperatura' ? 'var(--accent-rose)' : 'var(--accent-cyan)'}">
                    <strong>${Number(l.valorMedido).toFixed(1)} ${l.sensor ? l.sensor.unidadeMedida : ''}</strong>
                </td>
                <td>${formatDateTime(l.dataHoraLeitura)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">Nenhuma leitura correspondente</td></tr>';
    }

    function getBadgeClass(status) {
        if (!status) return 'badge-active';
        switch (status.toLowerCase()) {
            case 'ativa': return 'badge-active';
            case 'manutenção': return 'badge-maint';
            case 'inativa': return 'badge-inactive';
            default: return 'badge-active';
        }
    }

    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '--';
        const d = new Date(dateTimeStr);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function populateDropdowns() {
        // Estações Regiões
        const regOptions = `<option value="">Selecione...</option>` + dataState.regioes.map(r => `<option value="${r.idRegiao}">${r.nomeRegiao}</option>`).join('');
        selectEstRegiao.innerHTML = regOptions;
        selectEmRegiao.innerHTML = regOptions;

        // Filtro Global de Região
        const selectedFilterVal = selectDashboardFilter.value || 'all';
        selectDashboardFilter.innerHTML = `<option value="all">Todas as Regiões (Geral)</option>` + dataState.regioes.map(r => `<option value="${r.idRegiao}">${r.nomeRegiao}</option>`).join('');
        selectDashboardFilter.value = selectedFilterVal;

        // Sensores Estações
        const estOptions = `<option value="">Selecione...</option>` + dataState.estacoes.map(e => `<option value="${e.idEstacao}">${e.nomeEstacao}</option>`).join('');
        selectSensEstacao.innerHTML = estOptions;

        // Leituras Sensores
        selectLeitSensor.innerHTML = `<option value="">Selecione...</option>` + dataState.sensores.map(s => `
            <option value="${s.idSensor}">
                ${s.estacao ? s.estacao.nomeEstacao : 'Estação Desconhecida'} ➔ ${s.tipoSensor} (${s.unidadeMedida})
            </option>
        `).join('');
    }

    // --- FORM ACTIONS ---
    function setupEventListeners() {
        // Filtro de Região do Dashboard
        selectDashboardFilter.addEventListener('change', () => {
            calculateMetrics();
            populateTables();
            renderClimaticChart();
            renderEmissionsChart();
        });

        // OpenWeather Synchronizer
        btnSync.addEventListener('click', async () => {
            const cidade = cityInput.value.trim();
            if (!cidade) {
                showToast("Por favor, digite o nome de uma cidade!");
                return;
            }

            if (!isBackendOnline) {
                showToast("Erro: Conecte o Backend Java antes de sincronizar!");
                return;
            }

            btnSync.disabled = true;
            btnSync.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando...`;

            try {
                const response = await fetch(`${API_URL}/api/clima/sincronizar?cidade=${encodeURIComponent(cidade)}`, { method: 'POST' });
                if (response.ok) {
                    const clima = await response.json();
                    showToast(`Clima de ${clima.cidade} sincronizado e salvo no Neon DB!`);
                    fetchAllData();
                } else {
                    const text = await response.text();
                    showToast(`Falha: ${text}`);
                }
            } catch (error) {
                console.error(error);
                showToast("Erro de rede ao sincronizar clima!");
            } finally {
                btnSync.disabled = false;
                btnSync.innerHTML = `<i class="fa-solid fa-rotate"></i> Sincronizar`;
            }
        });

        // Refresh Charts Button
        btnRefreshCharts.addEventListener('click', () => {
            fetchAllData();
            showToast("Dados atualizados!");
        });

        // Form Submit: Região
        formRegiao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                nomeRegiao: document.getElementById('reg-nome').value,
                estadoProvincia: document.getElementById('reg-estado').value,
                pais: document.getElementById('reg-pais').value,
                latitude: document.getElementById('reg-lat').value ? Number(document.getElementById('reg-lat').value) : null,
                longitude: document.getElementById('reg-lon').value ? Number(document.getElementById('reg-lon').value) : null
            };
            await postData('/api/regioes', data, formRegiao, "Região adicionada!");
        });

        // Form Submit: Estação
        formEstacao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                nomeEstacao: document.getElementById('est-nome').value,
                regiao: { idRegiao: Number(document.getElementById('est-regiao').value) },
                dataInstalacao: document.getElementById('est-data').value || null,
                statusOperacional: document.getElementById('est-status').value
            };
            await postData('/api/estacoes', data, formEstacao, "Estação adicionada!");
        });

        // Form Submit: Sensor
        formSensor.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                estacao: { idEstacao: Number(document.getElementById('sens-estacao').value) },
                tipoSensor: document.getElementById('sens-tipo').value,
                unidadeMedida: document.getElementById('sens-unidade').value
            };
            await postData('/api/sensores', data, formSensor, "Sensor cadastrado!");
        });

        // Form Submit: Emissão
        formEmissao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                nomeEmpresaLocal: document.getElementById('em-empresa').value,
                regiao: { idRegiao: Number(document.getElementById('em-regiao').value) },
                tipoPoluente: document.getElementById('em-poluente').value,
                emissaoAnualEstimada: Number(document.getElementById('em-estimativa').value)
            };
            await postData('/api/emissoes', data, formEmissao, "Fonte de emissão salva!");
        });

        // Form Submit: Leitura
        formLeitura.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                sensor: { idSensor: Number(document.getElementById('leit-sensor').value) },
                valorMedido: Number(document.getElementById('leit-valor').value),
                dataHoraLeitura: document.getElementById('leit-data').value ? new Date(document.getElementById('leit-data').value).toISOString() : null
            };
            await postData('/api/leituras', data, formLeitura, "Leitura registrada com sucesso!");
        });

        // Automatically set unit field in Sensor Form
        document.getElementById('sens-tipo').addEventListener('change', (e) => {
            const val = e.target.value;
            const unitInput = document.getElementById('sens-unidade');
            if (val === 'Temperatura') unitInput.value = '°C';
            else if (val === 'Umidade') unitInput.value = '%';
            else if (val === 'CO2') unitInput.value = 'ppm';
            else if (val === 'Poeira/Partículas') unitInput.value = 'µg/m³';
            else if (val === 'Pressão') unitInput.value = 'hPa';
        });
    }

    async function postData(endpoint, data, form, successMsg) {
        if (!isBackendOnline) {
            showToast("Erro: O backend Java está offline!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showToast(successMsg);
                form.reset();
                fetchAllData();
            } else {
                const text = await response.text();
                showToast(`Erro ao salvar: ${text}`);
            }
        } catch (error) {
            showToast("Erro de conexão ao enviar dados!");
            console.error(error);
        }
    }

    // --- CHARTS GENERATION (CHART.JS) ---
    function renderClimaticChart() {
        const ctx = document.getElementById('climaticChart').getContext('2d');
        
        // Destroy old chart if exists
        if (climaticChart) {
            climaticChart.destroy();
        }

        const filterVal = selectDashboardFilter.value || 'all';
        let readings = [...dataState.leituras];
        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            const stations = dataState.estacoes.filter(e => e.regiao && e.regiao.idRegiao === regId);
            const stationIds = stations.map(e => e.idEstacao);
            readings = readings.filter(l => l.sensor && l.sensor.estacao && stationIds.includes(l.sensor.estacao.idEstacao));
        }

        // Filter readings and sort chronologically (oldest to newest)
        const readingsSorted = readings
            .filter(l => l.dataHoraLeitura)
            .sort((a, b) => new Date(a.dataHoraLeitura) - new Date(b.dataHoraLeitura));

        const tempReadings = readingsSorted.filter(r => r.sensor && r.sensor.tipoSensor.toLowerCase() === 'temperatura').slice(-15);
        const humReadings = readingsSorted.filter(r => r.sensor && r.sensor.tipoSensor.toLowerCase() === 'umidade').slice(-15);

        // Standard labels (times)
        const labels = Array.from(new Set([
            ...tempReadings.map(r => formatDateTime(r.dataHoraLeitura)),
            ...humReadings.map(r => formatDateTime(r.dataHoraLeitura))
        ])).slice(-15);

        const tempDataset = tempReadings.map(r => Number(r.valorMedido));
        const humDataset = humReadings.map(r => Number(r.valorMedido));

        climaticChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: tempDataset,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ef4444',
                        tension: 0.35,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Umidade (%)',
                        data: humDataset,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#06b6d4',
                        tension: 0.35,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1', font: { family: 'Inter' } }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter' } }
                    },
                    y: {
                        title: { display: true, text: 'Temperatura (°C)', color: '#ef4444' },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8' },
                        position: 'left'
                    },
                    y1: {
                        title: { display: true, text: 'Umidade (%)', color: '#06b6d4' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#94a3b8' },
                        position: 'right',
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    function renderEmissionsChart() {
        const ctx = document.getElementById('emissionsChart').getContext('2d');

        if (emissionsChart) {
            emissionsChart.destroy();
        }

        const filterVal = selectDashboardFilter.value || 'all';
        let emissions = [...dataState.emissoes];
        const emissionsMap = {};
        let labelName = 'Emissões Totais por Região';

        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            emissions = emissions.filter(e => e.regiao && e.regiao.idRegiao === regId);
            emissions.forEach(e => {
                const sourceName = e.nomeEmpresaLocal || 'Desconhecido';
                emissionsMap[sourceName] = (emissionsMap[sourceName] || 0) + Number(e.emissaoAnualEstimada);
            });
            labelName = 'Emissões Industriais da Região (t)';
        } else {
            emissions.forEach(e => {
                const regName = e.regiao ? e.regiao.nomeRegiao : 'Outros';
                emissionsMap[regName] = (emissionsMap[regName] || 0) + Number(e.emissaoAnualEstimada);
            });
        }

        const labels = Object.keys(emissionsMap);
        const data = Object.values(emissionsMap);

        emissionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: labelName,
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.45)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        title: { display: true, text: 'Toneladas (t)', color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.03)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // --- DYNAMIC NOTIFICATION SYSTEM ---
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification glass';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            color: var(--text-primary);
            border-left: 4px solid var(--accent-cyan);
            z-index: 1000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.85rem;
            font-weight: 500;
        `;
        toast.innerHTML = `<i class="fa-solid fa-bell" style="color:var(--accent-cyan); margin-right: 0.6rem;"></i> ${message}`;
        document.body.appendChild(toast);

        // Slide animation injection
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.innerHTML = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
});
