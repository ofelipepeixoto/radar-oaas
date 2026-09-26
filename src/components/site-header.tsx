import Link from '@/components/navigation';

export function Brand() {
  return <Link className="brand" href="/" aria-label="Radar OaaS — início"><span className="brand-symbol" aria-hidden="true"><i/><i/><i/></span><span>radar<span className="brand-light"> / oaas</span></span></Link>;
}

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return <header className="site-header"><div className="header-inner"><Brand/><nav aria-label="Navegação principal"><Link href="/metodologia">A metodologia</Link>{!compact && <Link href="/demo">Explorar demonstração</Link>}<Link className="nav-cta" href="/projetos">Meus projetos <span aria-hidden="true">↗</span></Link></nav></div></header>;
}

export function Footer() {
  return <footer className="footer"><div><Brand/><p>Tecnologia, capital e poder. Decisões com evidência.</p></div><div><Link href="/metodologia">Método e limitações</Link><span>Framework 2026-09-23 · Regras 0.1.0-experimental</span></div></footer>;
}
