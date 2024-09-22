import { useState, useEffect } from 'react';
import './App.css';
import { Client } from '@stomp/stompjs';

function App() {
  const [code, setCode] = useState('');
  const [user, setUser] = useState('');
  const [client, setClient] = useState<Client | null>(null); // Estado para armazenar o cliente STOMP

  // Função para enviar o código ao backend via WebSocket
  function sendCode() {
    if (client && client.active) { // Verifica se o cliente está conectado
      client.publish({
        destination: '/app/validate', // Rota definida no controller
        body: JSON.stringify({ code, username: user }), // Corpo da mensagem
      });
      console.log('Code sent:', { code, username: user });
    } else {
      console.log('STOMP client is not connected.');
    }
  }

  useEffect(() => {
    // Cria o cliente STOMP
    const stompClient = new Client({
      brokerURL: "wss://ferramentas-back.onrender.com/conn", // Certifique-se de que o WebSocket está no caminho correto
      onConnect: () => {
        console.log("WebSocket is connected.");

        // Subscrever ao canal de retorno (onde o servidor envia mensagens de volta)
        stompClient.subscribe('/apresentation', (message) => {
          console.log("Message from server: ", message.body);
        });
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    stompClient.activate(); // Ativa a conexão STOMP
    setClient(stompClient); // Armazena o cliente STOMP no estado

    // Limpeza ao desmontar o componente
    return () => {
      stompClient.deactivate(); // Desativa a conexão quando o componente é desmontado
    };
  }, []);

  return (
    <>
      <div>
        <h1>Teste de WebSocket</h1>
        <input
          placeholder="Insira o código"
          type="text"
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          placeholder="Insira o usuário"
          type="text"
          onChange={(e) => setUser(e.target.value)}
        />
        <button onClick={sendCode} id="sendButton">Enviar Código</button>
      </div>
    </>
  );
}

export default App;
