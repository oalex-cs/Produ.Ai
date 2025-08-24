// A ideia e que o usuario digite alguma tarefa no input, pressione o butao para adicionar e seja armezenado na lista de tarefas de hoje

//Usar o DOM para selecionar os elementos HTML

const input = document.getElementById("add-tarefa");
const btnAdd = document.getElementById("btn-add");
const listaHoje = document.getElementById("lista-hoje");
const listaFracassos = document.getElementById("lista-fracassada");

// Ponto de luz flutuante
const light = document.querySelector(".spot-light");
const container = document.querySelector("body");


container.addEventListener("mousemove", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  // atualiza a posição da luz
  light.style.left = x + "px";
  light.style.top = y + "px";
});

// Se quiser sumir com a luz quando o mouse sair da tela:
container.addEventListener("mouseleave", () => {
  light.style.display = "none";
});

container.addEventListener("mouseenter", () => {
  light.style.display = "block";
});

//Animação de texto (typing)
const text = "Aumente sua produtividade diária com o Produ.io"
const obj = document.querySelector(".typing");

let index = 0;

function type() {
    if(index < text.length) {
        obj.textContent += text[index]; // irá adicionar letra por letra
        index++; //Incremento
        setTimeout(type, 100); // Intervalo entre cada letra (100 milisegundos)
    }
}

type();

/*Lógica: Precisamos buscar dados salvos no armazenamento local(localStorage) e salvar em uma variável(dados). Caso exista dados salvos,
o JSON.parse convertes esses dados de string -> objeto/array. Se não existir nenhum dados no local, o JSON cria um novo objeto com propriedades
necessárias para inicialização. */
let dados = JSON.parse(localStorage.getItem("listaDiaria")) // Aqui o JSON está pegando os objetos salvos(Em formato de String), Se existir , o JSON.parse faz a conversão de string -> objeto/array
         || { data: "", tarefas: [], fracassos: [], }; // Se nada existir, for a primeira vez abrindo o app, ele cria um objeto vazio com as propriedades necessárias para iniciar

// função para renderizar as listas no navegador
function renderizarListas(){
    // Limpar as listas
    listaHoje.innerHTML = ""; 
    listaFracassos.innerHTML = "";

    // Renderiza as tarefas do dia
    dados.tarefas.forEach(tarefa => {
        const li = document.createElement("li"); // Variável li para criar um elemento li dentro do HTML

        const btnRemove = document.createElement("button");
        btnRemove.textContent = "X";
        btnRemove.dataset.id = tarefa.id;

        //Funçao para adicionar o checkbox para marcar como concluída
        const checkbox = document.createElement("input"); // cria um input dentro de uma variável JS
        checkbox.type = "checkbox"; // Define o tipo com "checkbox"
        checkbox.checked = tarefa.concluida; // Se o obejto for checado, a tarefa é concluída 

        const span = document.createElement("span"); // Texto da tarefa
        span.textContent = tarefa.texto;

        checkbox.addEventListener("change", () => { // Evento de mudança de estado, se o checkbox for checado(clicado) a tarefa é definida como concluída
            tarefa.concluida = checkbox.checked;
            li.classList.toggle("concluida", checkbox.checked);
            salvarDados(); // Chamada da função para salvar os dados localmente
        });

        li.addEventListener("click", (e) => { // função que permite o usuária a pressionar em qualquer lugar do card da tarefa pra definir como concluída
            if(e.target !== checkbox) { // Condição lógica para verificar se a área onde foi clicada é diferente do checkbox
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change")); // Estudar sobre!!!!!!
            }
        });

        btnRemove.addEventListener("click", () => {
            dados.tarefas = dados.tarefas.filter(t => t.id !== tarefa.id);
            salvarDados();
            renderizarListas();
        })

        li.classList.toggle("concluida", tarefa.concluida);

        li.appendChild(checkbox); // adicionando um novo elemento(checkbox) ao elemento pai(li)
        li.appendChild(span);
        li.appendChild(btnRemove);
        listaHoje.appendChild(li); // adicionando a tarefa criada a lista
    });

    dados.fracassos.forEach(tarefa => {
        const li = document.createElement("li");
        li.textContent = tarefa.texto;
        li.classList.add("fracasso");
        listaFracassos.appendChild(li);
    });
}

//Função para salvar dados no armazenamento local
function salvarDados() {
    localStorage.setItem("listaDiaria", JSON.stringify(dados)); // Usando o stringify para converter os objetos/arrays em textos(strings)
}

// Funçao para criar uma tarefa
function adicionarTarefa() {
    const texto = input.value.trim();

    if(texto === "") {
        alert("Você precisa digitar alguma tarefa antes de adicionar!");
        return;
    }

    dados.tarefas.push({id: Date.now(), texto, concluida: false });
    input.value = "";
    salvarDados();
    renderizarListas();
}

function verificarDia() {
    const hoje = new Date().toISOString().slice(0, 10);

    if(dados.data !== hoje) {
        dados.fracassos.push(...dados.tarefas.filter(t => !t.concluida).map(t => ({ texto: t.texto })));

        dados.tarefas = [];
        dados.data = hoje;
        salvarDados();
    }
}

/*Fluxo de incialização: Assim que a página carregar, chamamos a função "verificarDia" para checar se a data salva é a mesma do dia atual. Depois
chamamos "renderizarListas" para mostrar as listas. */
verificarDia();
renderizarListas();

btnAdd.addEventListener("click", adicionarTarefa); // adiciona a tarefa ao clicar no botao
document.addEventListener("keydown", (event) => {
    if(event.key === 'Enter'){
        adicionarTarefa();
    };
});