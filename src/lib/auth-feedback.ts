/** Show an actionable message without rendering provider diagnostics. */
export function authFailureMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  switch (code) {
    case 'invalid_credentials': return 'Não foi possível entrar com esse e-mail e senha. Confira os dados ou recupere sua senha.';
    case 'email_not_confirmed': return 'Confirme seu cadastro pelo link recebido no e-mail antes de entrar.';
    case 'weak_password': return 'Escolha uma senha exclusiva com ao menos oito caracteres.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.';
    default: return 'Não foi possível concluir o acesso. Confira sua conexão e tente novamente.';
  }
}
