import "../styles/base.css";
import "./About.css";

function About() {
  return (
     <section className="about__section">
      <div className="about__container">
        <h1 className="about__title">Projeto Interdisciplinar — DSM (Fatec Franca)</h1>

        <p className="about__lead">
          
          <strong> Projeto Interdisciplinar (PI) </strong> do curso
          <strong> Desenvolvimento de Software Multiplataforma (DSM)</strong> — Fatec Franca.
          O objetivo do PI é integrar conhecimentos de diversas disciplinas em um produto funcional,
          cobrindo concepção, implementação, testes e entrega.
        </p>

        <h2 className="about__h2">Sobre o Projeto</h2>
        <p>
          O projeto propõe uma solução de <strong>gestão de academias</strong>, com monitoramento de
          <em> lotação/ocupação</em>, cadastro de academias, autenticação de usuários e fluxo de
          check-in/check-out de clientes. A solução inclui:
        </p>
        <ul className="about__list">
          <li>
            <strong>Aplicativo Mobile</strong> (React Native/Expo): interface para membros e equipe,
            exibindo ocupação em tempo real e permitindo operações rápidas.
          </li>
          <li>
            <strong>API Backend</strong> (Node.js/Express): autenticação (JWT), endpoints para
            academias, clientes e ocupação, com persistência em banco de dados.
          </li>
          <li>
            <strong>Integração IoT</strong> (opcional): botões físicos podem acionar check-in/checkout
            via HTTP seguro (X-API-Key) ou publicar eventos em MQTT; o backend processa e atualiza a ocupação.
          </li>
          <li>
            <strong>Deploy</strong> do backend na Render, expondo uma URL pública em HTTPS acessível por web e mobile.
          </li>
        </ul>

        <h2 className="about__h2">Principais Funcionalidades</h2>
        <ul className="about__list">
          <li>Autenticação de usuários (login/cadastro) com armazenamento seguro do token no app.</li>
          <li>Cadastro e listagem de academias, com capacidade e ocupação atuais.</li>
          <li>Check-in / Check-out de clientes, refletindo a movimentação de ocupação.</li>
          <li>Integração com dispositivos físicos para incrementar/decrementar ocupação (HTTP/MQTT).</li>
          <li>Configuração do backend via variáveis de ambiente e app.config (Expo) para fácil troca de ambiente.</li>
        </ul>

        <h2 className="about__h2">Tecnologias</h2>
        <ul className="about__list">
          <li><strong>Frontend Mobile:</strong> React Native (Expo)</li>
          <li><strong>Web (opcional):</strong> React</li>
          <li><strong>Backend:</strong> Node.js, Express, JWT</li>
          <li><strong>Banco de Dados:</strong> (por exemplo) MongoDB Atlas ou PostgreSQL</li>
          <li><strong>IoT:</strong> HTTP (X-API-Key) e/ou MQTT (broker externo)</li>
          <li><strong>Deploy:</strong> Render (Web Service, HTTPS público)</li>
        </ul>

        <p className="about__footer">
          Projeto acadêmico — Fatec Franca • DSM — Grupo 07 — 3º semestre • 2025/2
        </p>
      </div>
    </section>
  );
}

export default About;