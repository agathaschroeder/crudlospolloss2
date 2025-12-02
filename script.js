document.addEventListener('DOMContentLoaded', () => {
    const paginaAtual = window.location.pathname.split('/').pop();

    // Simulação de usuários (substitua por backend)
    const usuarios = {
        'garcom1': { senha: 'senha123', papel: 'garcom' },
        'gerente1': { senha: 'admin123', papel: 'gerente' }
    };

    // Verificação para painel.html: Só redireciona se não logado
    if (paginaAtual === 'painel.html') {
        const token = localStorage.getItem('token');
        const papel = localStorage.getItem('papel');
        if (!token || !papel) {
            // Não logado: redirecionar para login (sem loop, pois login não redireciona de volta automaticamente)
            window.location.href = 'login.html';
        } else {
            // Logado: configurar painel
            configurarPainel(papel);
        }
    }
    // Removido: Redirecionamento automático em login.html se já logado (evita loop)

    // Configurar painel baseado no papel
    function configurarPainel(papel) {
        const navGerencia = document.getElementById('nav-gerencia');
        const secaoGerencia = document.getElementById('gerencia');

        if (papel === 'gerente') {
            navGerencia.style.display = 'block';
            secaoGerencia.style.display = 'block';
        } else {
            navGerencia.style.display = 'none';
            secaoGerencia.style.display = 'none';
        }

        carregarDados();
    }

    // Login: Sempre validar credenciais
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const user = usuarios[username];

            if (user && user.senha === password) {
                // Em produção: fetch('/api/login') para obter token e papel
                // Simulação: armazenar token fictício
                localStorage.setItem('token', 'token-ficticio-' + username);
                localStorage.setItem('papel', user.papel);
                window.location.href = 'painel.html';  // Redirecionar após login
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        });
    }

    // Logout: Limpar tudo e redirecionar
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('papel');
            window.location.href = 'index.html';
        });
    }

    // Carregar dados (cardápio, etc.)
    function carregarDados() {
        // Em produção: incluir token no header
        // headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        fetch('/api/cardapio')
            .then(response => {
                if (response.status === 401) {
                    // Token inválido: em produção, redirecionar; aqui, apenas logar erro para evitar loop
                    console.error('Token inválido. Faça login novamente.');
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;  // Evitar erro se não houver dados

                // Preencher selects e cardápio
                const selectPrato = document.getElementById('prato');
                const selectPratoPed = document.getElementById('prato-ped');
                const container = document.querySelector('.cardapio-container');

                if (container) container.innerHTML = '';
                if (selectPrato) selectPrato.innerHTML = '';
                if (selectPratoPed) selectPratoPed.innerHTML = '';

                data.forEach(prato => {
                    if (container) {
                        const div = document.createElement('div');
                        div.className = 'prato';
                        div.innerHTML = `<h3>${prato.nome}</h3><p>${prato.descricao}</p><p>Preço: R$ ${prato.preco}</p>`;
                        container.appendChild(div);
                    }
                    if (selectPrato) {
                        const option = document.createElement('option');
                        option.value = prato.id;
                        option.textContent = prato.nome;
                        selectPrato.appendChild(option);
                    }
                    if (selectPratoPed) {
                        const optionPed = option.cloneNode(true);
                        selectPratoPed.appendChild(optionPed);
                    }
                });
            })
            .catch(error => {
                // Erro de rede: logar, mas não redirecionar para evitar loop
                console.error('Erro ao carregar dados:', error);
            });
    }

    // Enviar pedido (público ou privado)
    const formPedido = document.getElementById('form-pedido');
    if (formPedido) {
        formPedido.addEventListener('submit', (e) => {
            e.preventDefault();
            const mesa = document.getElementById('mesa').value;
            const prato = document.getElementById('prato').value;
            fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mesa, prato })
            }).then(() => alert('Pedido enviado!')).catch(() => alert('Erro ao enviar pedido.'));
        });
    }

    // Adicione eventos para outros formulários (form-pedidos, form-caixa, etc.) com headers de token.
});
