// JavaScript Controller - Dashboard Climático

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let API_URL = localStorage.getItem('backend_api_url');
    if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
        API_URL = 'https://dashboard-climatico-b0zc.onrender.com';
        localStorage.setItem('backend_api_url', API_URL);
    }
    let isBackendOnline = false;
    let isFetching = false;
    let dataState = { regioes: [], estacoes: [], sensores: [], leituras: [], emissoes: [] };
    let climaticChart = null;
    let emissionsChart = null;

    // --- UI ELEMENTS ---
    const backendUrlInput = document.getElementById('backend-url');
    const btnSaveConfig    = document.getElementById('btn-save-config');
    const btnToggleConfig  = document.getElementById('btn-toggle-config');
    const configDropdown   = document.getElementById('config-dropdown');
    const apiStatus        = document.getElementById('api-status');
    const btnSync          = document.getElementById('btn-sync');
    const cityInput        = document.getElementById('city-input');
    const btnRefreshCharts = document.getElementById('btn-refresh-charts');
    const lastUpdatedEl    = document.getElementById('last-updated');

    const formRegiao  = document.getElementById('form-regiao');
    const formEstacao = document.getElementById('form-estacao');
    const formSensor  = document.getElementById('form-sensor');
    const formEmissao = document.getElementById('form-emissao');
    const formLeitura = document.getElementById('form-leitura');

    const tableRegioes  = document.getElementById('table-body-regioes');
    const tableEstacoes = document.getElementById('table-body-estacoes');
    const tableSensores = document.getElementById('table-body-sensores');
    const tableEmissoes = document.getElementById('table-body-emissoes');
    const tableLeituras = document.getElementById('table-body-leituras');

    const selectEstRegiao      = document.getElementById('est-regiao');
    const selectSensEstacao    = document.getElementById('sens-estacao');
    const selectEmRegiao       = document.getElementById('em-regiao');
    const selectLeitSensor     = document.getElementById('leit-sensor');
    const selectDashboardFilter = document.getElementById('dashboard-region-filter');

    backendUrlInput.value = API_URL;

    // --- INIT ---
    checkBackendStatus();
    setupEventListeners();
    // Verificar backend a cada 15s; atualizar dados a cada 30s
    setInterval(checkBackendStatus, 15000);
    setInterval(() => { if (isBackendOnline) fetchAllData(); }, 30000);

    // --- CONFIG ---
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
        let url = backendUrlInput.value.trim().replace(/\/$/, '');
        API_URL = url;
        localStorage.setItem('backend_api_url', url);
        configDropdown.classList.remove('show');
        showToast('URL do Backend atualizada!');
        isBackendOnline = false;
        checkBackendStatus();
    });

    // --- TABS ---
    const tabButtons  = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(tabId) {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const pane = document.getElementById(tabId);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });

    // --- BACKEND STATUS ---
    async function checkBackendStatus() {
        try {
            const res = await fetch(`${API_URL}/api/regioes`, { method: 'GET', signal: AbortSignal.timeout(5000) });
            if (res.ok) {
                updateStatusUI(true);
                if (!isBackendOnline) {
                    isBackendOnline = true;
                    fetchAllData();
                }
            } else {
                updateStatusUI(false);
                isBackendOnline = false;
            }
        } catch {
            updateStatusUI(false);
            isBackendOnline = false;
        }
    }

    function updateStatusUI(online) {
        const dot  = apiStatus.querySelector('.status-dot');
        const text = apiStatus.querySelector('.status-text');
        dot.className  = `status-dot ${online ? 'online' : 'offline'}`;
        text.textContent = online ? 'Backend Online' : 'Backend Offline';
    }

    // --- FETCH ---
    async function fetchAllData() {
        if (!isBackendOnline || isFetching) return;
        isFetching = true;

        // Ícone de carregamento no botão de refresh
        if (btnRefreshCharts) {
            btnRefreshCharts.innerHTML = '<i class="fa-solid fa-arrow-rotate-right fa-spin-manual"></i>';
        }

        try {
            const [reg, est, sens, leit, em] = await Promise.all([
                fetch(`${API_URL}/api/regioes`).then(r => r.json()),
                fetch(`${API_URL}/api/estacoes`).then(r => r.json()),
                fetch(`${API_URL}/api/sensores`).then(r => r.json()),
                fetch(`${API_URL}/api/leituras`).then(r => r.json()),
                fetch(`${API_URL}/api/emissoes`).then(r => r.json())
            ]);

            dataState.regioes  = reg   || [];
            dataState.estacoes = est   || [];
            dataState.sensores = sens  || [];
            dataState.leituras = leit  || [];
            dataState.emissoes = em    || [];

            updateDashboardUI();
            updateLastUpdatedTime();
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            showToast('Erro ao sincronizar com o backend!');
        } finally {
            isFetching = false;
            if (btnRefreshCharts) {
                btnRefreshCharts.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i>';
            }
        }
    }

    function updateLastUpdatedTime() {
        if (!lastUpdatedEl) return;
        const now = new Date();
        const hh  = String(now.getHours()).padStart(2, '0');
        const mm  = String(now.getMinutes()).padStart(2, '0');
        const ss  = String(now.getSeconds()).padStart(2, '0');
        lastUpdatedEl.textContent = `Atualizado às ${hh}:${mm}:${ss}`;
    }

    // --- UI UPDATE ---
    function updateDashboardUI() {
        populateTables();
        populateDropdowns();
        calculateMetrics();
        renderClimaticChart();
        renderEmissionsChart();
    }

    function calculateMetrics() {
        const filterVal = selectDashboardFilter.value || 'all';
        let readings  = [...dataState.leituras];
        let emissions = [...dataState.emissoes];
        let stations  = [...dataState.estacoes];

        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            stations  = stations.filter(e => e.regiao && e.regiao.idRegiao === regId);
            const stationIds = stations.map(e => e.idEstacao);
            readings  = readings.filter(l => l.sensor?.estacao && stationIds.includes(l.sensor.estacao.idEstacao));
            emissions = emissions.filter(e => e.regiao && e.regiao.idRegiao === regId);
        }

        const tempReadings = readings.filter(l => l.sensor?.tipoSensor?.toLowerCase() === 'temperatura');
        const tempSum  = tempReadings.reduce((s, r) => s + Number(r.valorMedido), 0);
        const tempAvg  = tempReadings.length ? (tempSum / tempReadings.length).toFixed(1) : '--';
        document.getElementById('val-temp-avg').textContent   = tempAvg !== '--' ? `${tempAvg}°C` : '--°C';
        document.getElementById('val-temp-count').textContent = `${tempReadings.length} medições`;

        const humReadings = readings.filter(l => l.sensor?.tipoSensor?.toLowerCase() === 'umidade');
        const humSum  = humReadings.reduce((s, r) => s + Number(r.valorMedido), 0);
        const humAvg  = humReadings.length ? (humSum / humReadings.length).toFixed(0) : '--';
        document.getElementById('val-humidity-avg').textContent   = humAvg !== '--' ? `${humAvg}%` : '--%';
        document.getElementById('val-humidity-count').textContent = `${humReadings.length} medições`;

        document.getElementById('val-stations-count').textContent = stations.length;
        document.getElementById('val-regions-count').textContent  = `${dataState.regioes.length} Regiões cadastradas`;

        const totalEmissions = emissions.reduce((s, e) => s + Number(e.emissaoAnualEstimada), 0);
        document.getElementById('val-emissions-total').textContent = `${totalEmissions.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`;
        document.getElementById('val-sources-count').textContent   = `${emissions.length} Fontes industriais`;
    }

    function populateTables() {
        const filterVal = selectDashboardFilter.value || 'all';
        let readings  = [...dataState.leituras];
        let emissions = [...dataState.emissoes];
        let stations  = [...dataState.estacoes];

        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            stations  = stations.filter(e => e.regiao && e.regiao.idRegiao === regId);
            const stationIds = stations.map(e => e.idEstacao);
            readings  = readings.filter(l => l.sensor?.estacao && stationIds.includes(l.sensor.estacao.idEstacao));
            emissions = emissions.filter(e => e.regiao && e.regiao.idRegiao === regId);
        }

        tableRegioes.innerHTML = dataState.regioes.map(r => `
            <tr>
                <td>${r.idRegiao}</td>
                <td><strong>${r.nomeRegiao}</strong></td>
                <td>${r.estadoProvincia || '--'}</td>
                <td>${r.pais}</td>
                <td>${r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : 'Sem coordenadas'}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma região cadastrada</td></tr>';

        tableEstacoes.innerHTML = stations.map(e => `
            <tr>
                <td>${e.idEstacao}</td>
                <td><strong>${e.nomeEstacao}</strong></td>
                <td>${e.regiao?.nomeRegiao || '--'}</td>
                <td>${e.dataInstalacao ? new Date(e.dataInstalacao).toLocaleDateString('pt-BR') : '--'}</td>
                <td><span class="badge ${getBadgeClass(e.statusOperacional)}">${e.statusOperacional}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma estação correspondente</td></tr>';

        tableSensores.innerHTML = dataState.sensores.map(s => `
            <tr>
                <td>${s.idSensor}</td>
                <td>${s.estacao?.nomeEstacao || '--'}</td>
                <td><strong>${s.tipoSensor}</strong></td>
                <td>${s.unidadeMedida}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum sensor cadastrado</td></tr>';

        tableEmissoes.innerHTML = emissions.map(e => `
            <tr>
                <td>${e.idFonte}</td>
                <td><strong>${e.nomeEmpresaLocal}</strong></td>
                <td>${e.regiao?.nomeRegiao || '--'}</td>
                <td>${e.tipoPoluente}</td>
                <td>${Number(e.emissaoAnualEstimada).toLocaleString('pt-BR')} t</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma fonte de emissão correspondente</td></tr>';

        tableLeituras.innerHTML = readings.map(l => `
            <tr>
                <td>#${l.idLeitura}</td>
                <td>${l.sensor?.estacao?.nomeEstacao || '--'} ➔ <strong>${l.sensor?.tipoSensor || '--'}</strong></td>
                <td>${l.sensor?.tipoSensor || '--'}</td>
                <td style="color: ${l.sensor?.tipoSensor?.toLowerCase() === 'temperatura' ? 'var(--accent-red)' : 'var(--accent-cyan)'}">
                    <strong>${Number(l.valorMedido).toFixed(1)} ${l.sensor?.unidadeMedida || ''}</strong>
                </td>
                <td>${formatDateTime(l.dataHoraLeitura)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhuma leitura correspondente</td></tr>';
    }

    function getBadgeClass(status) {
        switch ((status || '').toLowerCase()) {
            case 'ativa':      return 'badge-active';
            case 'manutenção': return 'badge-maint';
            case 'inativa':    return 'badge-inactive';
            default:           return 'badge-active';
        }
    }

    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '--';
        return new Date(dateTimeStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function populateDropdowns() {
        const regOptions = `<option value="">Selecione...</option>` +
            dataState.regioes.map(r => `<option value="${r.idRegiao}">${r.nomeRegiao}</option>`).join('');
        selectEstRegiao.innerHTML = regOptions;
        selectEmRegiao.innerHTML  = regOptions;

        const savedFilter = selectDashboardFilter.value || 'all';
        selectDashboardFilter.innerHTML = `<option value="all">Todas as Regiões (Geral)</option>` +
            dataState.regioes.map(r => `<option value="${r.idRegiao}">${r.nomeRegiao}</option>`).join('');
        selectDashboardFilter.value = savedFilter;

        selectSensEstacao.innerHTML = `<option value="">Selecione...</option>` +
            dataState.estacoes.map(e => `<option value="${e.idEstacao}">${e.nomeEstacao}</option>`).join('');

        selectLeitSensor.innerHTML = `<option value="">Selecione...</option>` +
            dataState.sensores.map(s => `
                <option value="${s.idSensor}">
                    ${s.estacao?.nomeEstacao || 'Estação ?'} ➔ ${s.tipoSensor} (${s.unidadeMedida})
                </option>
            `).join('');
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Alternar formulários com base no select
        const selectCadastroTipo = document.getElementById('select-cadastro-tipo');
        const flowSteps  = document.querySelectorAll('.flow-step');
        const contextBox = document.getElementById('form-context');
        const formMap    = { regiao: 0, estacao: 1, sensor: 2, leitura: 3, emissao: 0 };

        const contextMessages = {
            regiao:  { icon: '🌎', text: 'Você está adicionando uma <strong>cidade ou região</strong>. Ela vai aparecer no filtro do painel e poderá receber estações e fábricas.' },
            estacao: { icon: '📡', text: 'Você está adicionando uma <strong>estação de monitoramento</strong> dentro de uma cidade já cadastrada. A estação vai abrigar sensores.' },
            sensor:  { icon: '🔬', text: 'Você está adicionando um <strong>sensor</strong> a uma estação. Depois de criado, você pode registrar medições dele.' },
            emissao: { icon: '🏭', text: 'Você está registrando uma <strong>fábrica ou fonte de poluição</strong>. O valor de emissão anual aparece no gráfico de emissões.' },
            leitura: { icon: '📊', text: 'Você está registrando uma <strong>medição manual</strong> de um sensor. O valor vai aparecer nos gráficos e na tabela de leituras.' },
        };

        function updateActiveForm() {
            const val = selectCadastroTipo.value;
            [formRegiao, formEstacao, formSensor, formEmissao, formLeitura].forEach(f => f?.classList.remove('show'));
            document.getElementById(`form-${val}`)?.classList.add('show');
            flowSteps.forEach((step, i) => {
                step.classList.toggle('active', i === formMap[val]);
            });
            if (contextBox && contextMessages[val]) {
                const { icon, text } = contextMessages[val];
                contextBox.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
            }
        }

        if (selectCadastroTipo) {
            selectCadastroTipo.addEventListener('change', updateActiveForm);
            updateActiveForm();
        }

        // Filtro global de região
        selectDashboardFilter.addEventListener('change', () => {
            calculateMetrics();
            populateTables();
            renderClimaticChart();
            renderEmissionsChart();
        });

        // Presets de cidades rápidas
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const city = btn.getAttribute('data-city');
                cityInput.value = city;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                btnSync.click();
            });
        });

        // Remover destaque do preset ao digitar manualmente
        cityInput.addEventListener('input', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        });

        // Sincronizar cidade com OpenWeather
        btnSync.addEventListener('click', async () => {
            const cidade = cityInput.value.trim();
            if (!cidade) { showToast('Por favor, digite o nome de uma cidade!'); return; }
            if (!isBackendOnline) { showToast('Erro: Conecte o Backend Java antes de sincronizar!'); return; }

            btnSync.disabled = true;
            btnSync.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Adicionando...`;
            try {
                const res = await fetch(`${API_URL}/api/clima/sincronizar?cidade=${encodeURIComponent(cidade)}`, { method: 'POST' });
                if (res.ok) {
                    const clima = await res.json();
                    showToast(`Clima de ${clima.cidade} sincronizado e salvo no banco!`);
                    await fetchAllData();
                    activateTab('tab-leituras');
                } else {
                    showToast(`Falha: ${await res.text()}`);
                }
            } catch { showToast('Erro de rede ao sincronizar clima!'); }
            finally {
                btnSync.disabled = false;
                btnSync.innerHTML = `<i class="fa-solid fa-plus"></i> Adicionar`;
            }
        });

        // Atualizar dados manualmente
        btnRefreshCharts.addEventListener('click', async () => {
            await fetchAllData();
            showToast('Dados atualizados!');
        });

        // Unidade automática no sensor
        document.getElementById('sens-tipo').addEventListener('change', (e) => {
            const units = { 'Temperatura': '°C', 'Umidade': '%', 'CO2': 'ppm', 'Poeira/Partículas': 'µg/m³', 'Pressão': 'hPa' };
            document.getElementById('sens-unidade').value = units[e.target.value] || '';
        });

        // Submits dos formulários
        formRegiao.addEventListener('submit', async (e) => {
            e.preventDefault();
            await postData('/api/regioes', {
                nomeRegiao:      document.getElementById('reg-nome').value,
                estadoProvincia: document.getElementById('reg-estado').value,
                pais:            document.getElementById('reg-pais').value,
                latitude:  parseFloatOrNull('reg-lat'),
                longitude: parseFloatOrNull('reg-lon')
            }, formRegiao, 'Região adicionada!', 'tab-regioes');
        });

        formEstacao.addEventListener('submit', async (e) => {
            e.preventDefault();
            await postData('/api/estacoes', {
                nomeEstacao:       document.getElementById('est-nome').value,
                regiao:            { idRegiao: Number(document.getElementById('est-regiao').value) },
                dataInstalacao:    document.getElementById('est-data').value || null,
                statusOperacional: document.getElementById('est-status').value
            }, formEstacao, 'Estação adicionada!', 'tab-estacoes');
        });

        formSensor.addEventListener('submit', async (e) => {
            e.preventDefault();
            await postData('/api/sensores', {
                estacao:      { idEstacao: Number(document.getElementById('sens-estacao').value) },
                tipoSensor:   document.getElementById('sens-tipo').value,
                unidadeMedida: document.getElementById('sens-unidade').value
            }, formSensor, 'Sensor cadastrado!', 'tab-sensores');
        });

        formEmissao.addEventListener('submit', async (e) => {
            e.preventDefault();
            await postData('/api/emissoes', {
                nomeEmpresaLocal:      document.getElementById('em-empresa').value,
                regiao:                { idRegiao: Number(document.getElementById('em-regiao').value) },
                tipoPoluente:          document.getElementById('em-poluente').value,
                emissaoAnualEstimada:  Number(document.getElementById('em-estimativa').value)
            }, formEmissao, 'Fonte de emissão salva!', 'tab-emissoes');
        });

        formLeitura.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dtVal = document.getElementById('leit-data').value;
            await postData('/api/leituras', {
                sensor:          { idSensor: Number(document.getElementById('leit-sensor').value) },
                valorMedido:     Number(document.getElementById('leit-valor').value),
                dataHoraLeitura: dtVal ? new Date(dtVal).toISOString() : null
            }, formLeitura, 'Leitura registrada!', 'tab-leituras');
        });
    }

    function parseFloatOrNull(id) {
        const v = document.getElementById(id).value;
        return v ? Number(v) : null;
    }

    async function postData(endpoint, data, form, successMsg, tabToShow) {
        if (!isBackendOnline) { showToast('Erro: O backend Java está offline!'); return; }
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showToast(successMsg);
                form.reset();
                await fetchAllData();
                if (tabToShow) activateTab(tabToShow);
            } else {
                showToast(`Erro ao salvar: ${await res.text()}`);
            }
        } catch { showToast('Erro de conexão ao enviar dados!'); }
    }

    // --- CHARTS ---
    function renderClimaticChart() {
        const ctx = document.getElementById('climaticChart').getContext('2d');
        if (climaticChart) climaticChart.destroy();

        const filterVal = selectDashboardFilter.value || 'all';
        let readings = [...dataState.leituras];
        if (filterVal !== 'all') {
            const regId = Number(filterVal);
            const ids   = dataState.estacoes.filter(e => e.regiao?.idRegiao === regId).map(e => e.idEstacao);
            readings    = readings.filter(l => l.sensor?.estacao && ids.includes(l.sensor.estacao.idEstacao));
        }

        const sorted   = readings.filter(l => l.dataHoraLeitura).sort((a, b) => new Date(a.dataHoraLeitura) - new Date(b.dataHoraLeitura));
        const tempData = sorted.filter(r => r.sensor?.tipoSensor?.toLowerCase() === 'temperatura').slice(-15);
        const humData  = sorted.filter(r => r.sensor?.tipoSensor?.toLowerCase() === 'umidade').slice(-15);

        const labels = Array.from(new Set([
            ...tempData.map(r => formatDateTime(r.dataHoraLeitura)),
            ...humData.map(r => formatDateTime(r.dataHoraLeitura))
        ])).slice(-15);

        climaticChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: tempData.map(r => Number(r.valorMedido)),
                        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
                        borderWidth: 3, pointBackgroundColor: '#ef4444', tension: 0.35, fill: true, yAxisID: 'y'
                    },
                    {
                        label: 'Umidade (%)',
                        data: humData.map(r => Number(r.valorMedido)),
                        borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)',
                        borderWidth: 3, pointBackgroundColor: '#06b6d4', tension: 0.35, fill: true, yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#cbd5e1', font: { family: 'Inter' } } } },
                scales: {
                    x:  { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', font: { family: 'Inter' } } },
                    y:  { title: { display: true, text: 'Temperatura (°C)', color: '#ef4444' }, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8' }, position: 'left' },
                    y1: { title: { display: true, text: 'Umidade (%)', color: '#06b6d4' }, grid: { drawOnChartArea: false }, ticks: { color: '#94a3b8' }, position: 'right', min: 0, max: 100 }
                }
            }
        });
    }

    function renderEmissionsChart() {
        const ctx = document.getElementById('emissionsChart').getContext('2d');
        if (emissionsChart) emissionsChart.destroy();

        const filterVal = selectDashboardFilter.value || 'all';
        let emissions = [...dataState.emissoes];
        const map = {};

        if (filterVal !== 'all') {
            emissions = emissions.filter(e => e.regiao?.idRegiao === Number(filterVal));
            emissions.forEach(e => { const k = e.nomeEmpresaLocal || 'Desconhecido'; map[k] = (map[k] || 0) + Number(e.emissaoAnualEstimada); });
        } else {
            emissions.forEach(e => { const k = e.regiao?.nomeRegiao || 'Outros'; map[k] = (map[k] || 0) + Number(e.emissaoAnualEstimada); });
        }

        emissionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(map),
                datasets: [{ label: 'Emissões (t)', data: Object.values(map), backgroundColor: 'rgba(16,185,129,0.45)', borderColor: '#10b981', borderWidth: 2, borderRadius: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#cbd5e1' } } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8' } },
                    y: { title: { display: true, text: 'Toneladas (t)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // --- TOAST ---
    function showToast(message) {
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.innerHTML = `
                @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(style);
        }
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position:fixed; bottom:20px; right:20px; padding:.85rem 1.25rem;
            color:var(--text-primary); border-left:4px solid var(--accent-cyan);
            z-index:1000; box-shadow:0 10px 25px rgba(0,0,0,.5);
            animation:slideIn .3s cubic-bezier(.4,0,.2,1); font-size:.85rem; font-weight:500;
            background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--border-radius);
        `;
        toast.innerHTML = `<i class="fa-solid fa-bell" style="color:var(--accent-cyan);margin-right:.5rem;"></i>${message}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn .3s reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
});
