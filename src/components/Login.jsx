export default function Login({ emailLogin, setEmailLogin, senhaLogin, setSenhaLogin, erroLogin, onLogin }) {
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onLogin}>
        <h1>HelpDesk Hospitalar</h1>
        <p>Acesso restrito ao sistema interno de chamados</p>

        <input
          type="email"
          placeholder="E-mail corporativo"
          value={emailLogin}
          onChange={(e) => setEmailLogin(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senhaLogin}
          onChange={(e) => setSenhaLogin(e.target.value)}
          required
        />

        {erroLogin && <div className="erro-login">{erroLogin}</div>}

        <button type="submit">Entrar no sistema</button>
      </form>
    </div>
  )
}
