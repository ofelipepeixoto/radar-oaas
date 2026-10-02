import Link from '@/components/navigation';
import { Footer, SiteHeader } from '@/components/site-header';

export default function HomePage() {
  return <><SiteHeader compact/><main id="conteudo">
    <section className="welcome-hero">
      <div className="welcome-copy"><span className="eyebrow">DA IDEIA AO PRIMEIRO TESTE</span>
        <h1>Qual é o primeiro teste da sua ideia de serviço com IA?</h1>
        <p>Responda perguntas simples e organize o que precisa testar antes de investir mais.</p>
        <div className="button-row"><Link href="/avaliar" className="button button-lime">Começar sem cadastro</Link><Link href="/avaliar?exemplo=1" className="welcome-secondary">Ver exemplo guiado</Link></div>
        <p className="welcome-note">Quatro etapas. Um teste com três passos. Suas respostas ficam só neste navegador.</p>
      </div>
      <aside className="welcome-example" aria-label="Exemplo fictício do que você recebe"><span className="example-label">UM EXEMPLO DO SEU PRÓXIMO PASSO</span>
        <div className="example-tags"><span>Pequenas empresas</span><span>Economizar tempo</span></div>
        <h2>Uma ideia mais clara.<br/>Uma ação por vez.</h2>
        <div className="example-action"><span aria-hidden="true">↗</span><div><strong>Comece por uma conversa</strong><p>Descubra como seu possível cliente resolve esse trabalho hoje e o que mais atrapalha.</p></div></div>
        <small>Exemplo ilustrativo. Suas respostas orientam a sugestão.</small>
      </aside>
    </section>
    <section className="welcome-benefits" aria-label="Como funciona">{[
      ['01','Organize sua ideia','Escolha as opções que mais combinam com o que você quer fazer.'],
      ['02','Encontre a principal dúvida','Tudo bem ainda não saber. Descobrir o que falta faz parte do caminho.'],
      ['03','Saiba o que testar agora','Receba uma ação e perguntas para a próxima conversa ou teste.'],
    ].map(([number,title,description])=><article key={number}><span>{number}</span><h2>{title}</h2><p>{description}</p></article>)}</section>
    <section className="welcome-detail"><div><h2>Comece simples. Aprofunde quando precisar.</h2><p>OaaS significa oferecer um resultado verificável, como um documento pronto para revisão. O guia ajuda a escolher o primeiro teste.</p></div><Link href="/avaliar?exemplo=1" className="text-link">Ver exemplo guiado <span aria-hidden="true">↗</span></Link></section>
    <p className="welcome-limit">O guia ajuda a preparar seu projeto. As respostas não comprovam demanda nem garantem sucesso. <Link href="/metodologia">Conheça o método.</Link></p>
  </main><Footer/></>;
}
