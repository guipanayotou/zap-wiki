import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  BookOpen,
  Home,
  HelpCircle,
  AlertTriangle,
  Info,
  Link as LinkIcon,
  ChevronRight,
  Menu,
  X,
  FileText,
  Settings,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * ZAP POST — Wiki (estilo Wikipedia)
 * SPA React + Tailwind — arquivo único.
 * - Router por hash (#/slug)
 * - Busca com ranking simples
 * - Sidebar com categorias
 * - TOC (sumário) e InfoBox por artigo
 * - Rolagem ao topo ao trocar de página
 * - Ajuda abre WhatsApp em nova guia
 * - article.sections sempre tratado como array
 */

// ---------------------- Estilos utilitários ----------------------
const SHELL_BG =
  "min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100";
const CARD =
  "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm";
const LINK =
  "text-sky-800 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 underline underline-offset-2";

const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ---------------------- Domínio ----------------------
const CATS = {
  INTRO: "Introdução",
  FUNC: "Funcionalidades",
  CONF: "Configurações",
  SUP: "Suporte",
};

const SUPPORT_URL = "https://wa.me/555496396455";
const SUPPORT_EMAIL = "mailto:atendimento@zappost.app";

// ---------------------- Componentes básicos ----------------------
function WikiLink({ to, children, onNav }) {
  return (
    <button
      onClick={() => onNav?.(to)}
      className="text-left inline-flex items-center gap-1 text-sky-800 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 underline underline-offset-2"
    >
      {children}
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}

function NoticeBox({ variant = "info", title, children }) {
  const map = {
    info: {
      icon: <Info className="h-4 w-4" />,
      bg: "bg-sky-50",
      br: "border-sky-200",
      text: "text-sky-900",
    },
    warn: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bg: "bg-amber-50",
      br: "border-amber-200",
      text: "text-amber-900",
    },
    error: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bg: "bg-rose-50",
      br: "border-rose-200",
      text: "text-rose-900",
    },
  }[variant];
  return (
    <div
      className={`${map.bg} ${map.br} ${map.text} border rounded-xl p-3 sm:p-4 flex gap-2 items-start`}
    >
      <div className="mt-1 shrink-0">{map.icon}</div>
      <div>
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="hidden xl:block xl:sticky xl:top-24">
      <div className={`${CARD} p-4 w-80`}>
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Visão rápida
        </div>
        <dl className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="text-sm">
              <dt className="text-neutral-500">{it.label}</dt>
              <dd className="font-medium">{it.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function TOC({ sections, onJump }) {
  const items = Array.isArray(sections) ? sections : [];
  if (!items.length) return null;
  return (
    <div className={`${CARD} p-4`}>
      <div className="font-semibold mb-2">Conteúdo</div>
      <ul className="space-y-1 text-sm">
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                onJump?.(s.id);
              }}
              className="text-sky-800 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 flex items-center justify-center">
        <BookOpen className="h-4 w-4 text-sky-700 dark:text-sky-300" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function SectionCard({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`${CARD} p-4 sm:p-5`}>
        <SectionHeader title={title} />
        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-3" />
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </section>
  );
}

// ---------------------- Conteúdo ----------------------
const ARTICLES = [
  // INTRODUÇÃO
  {
    slug: "bem-vindo",
    title: "Bem-vindo ao ZAP POST",
    category: CATS.INTRO,
    summary: "Guia inicial e visão geral do sistema.",
    info: [
      { label: "Acesso", value: "Dashboard após login" },
      { label: "Módulos", value: "Posts, Roteiros, Carrosséis, Ideias" },
      { label: "Envio", value: "WhatsApp integrado" },
    ],
    sections: [
      {
        id: "sua-jornada",
        title: "Sua jornada começa aqui",
        content: (
          <div>
            <p>
              Sua jornada para posts incríveis começa aqui! Este é o seu guia
              completo para usar o <strong>ZAP POST</strong>. Vamos transformar
              suas ideias em conteúdo profissional, passo a passo.
            </p>
            <p className="mt-2">
              Se você já se sentiu sem tempo, sem criatividade ou perdido sobre
              o que postar nas redes sociais, o ZAP POST foi feito para você.
              Pense nele como seu assistente pessoal de marketing, que trabalha
              24 horas por dia para criar conteúdo que atrai seguidores e
              clientes.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Economize tempo: crie em minutos o que levaria horas.</li>
              <li>Nunca mais bloqueio criativo: ideias infinitas e gratuitas.</li>
              <li>Visual profissional: textos e imagens de alta qualidade.</li>
              <li>Mais engajamento: conteúdo pensado para gerar interação.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "como-funciona",
        title: "Como funciona (fluxo simplificado)",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Acesse o Dashboard e escolha o módulo (Posts, Roteiros, Carrosséis
              ou Ideias).
            </li>
            <li>Descreva o tema, o público e o objetivo.</li>
            <li>Gere o conteúdo e ajuste o que for necessário.</li>
            <li>
              Consumo de recursos: ⚡ ações (diárias) e 💎 créditos (quando
              preciso).
            </li>
            <li>Copie, baixe ou encaminhe diretamente ao WhatsApp.</li>
          </ol>
        ),
      },
      {
        id: "dica-ouro",
        title: "Dica de ouro: pedidos específicos",
        content: (
          <div>
            <p>O segredo de um bom resultado é ser específico no pedido.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>❌ Pedido genérico: “Post sobre marketing”.</li>
              <li>
                ✅ Pedido excelente: “Crie um post com 5 dicas de marketing
                digital para donos de pequenas lojas de roupa que querem vender
                mais pelo Instagram”.
              </li>
            </ul>
          </div>
        ),
      },
    ],
    seeAlso: ["dashboard", "creditos-e-acoes"],
  },

  // DASHBOARD
  {
    slug: "dashboard",
    title: "Entendendo o Dashboard",
    category: CATS.INTRO,
    summary: "Mapa da tela inicial e sua central de comando.",
    info: [
      { label: "Topo", value: "⚡ ações, 💎 créditos, notificações" },
      { label: "Menu", value: "Acesso a módulos e Perfil" },
    ],
    sections: [
      {
        id: "central",
        title: "Sua central de comando",
        content: (
          <div>
            <p>
              Ao entrar no ZAP POST, a primeira tela é o Dashboard. Pense nele
              como o painel do seu carro: mostra tudo o que você precisa saber
              de forma rápida.
            </p>
            <p className="mt-2">No Dashboard você enxerga:</p>
            <ol className="list-decimal pl-6 space-y-1 mt-2">
              <li>
                <strong>Menu Lateral</strong> (esquerda): mapa para navegar
                entre ferramentas.
              </li>
              <li>
                <strong>Header Superior</strong> (topo): saldos de ⚡ ações e 💎
                créditos.
              </li>
              <li>
                <strong>Ações Rápidas</strong> (centro): atalhos para criação.
              </li>
            </ol>
          </div>
        ),
      },
      {
        id: "dicas",
        title: "Dicas de uso inteligente",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Planeje o dia com base nas ⚡ ações disponíveis.</li>
            <li>Use atalhos rápidos para economizar tempo.</li>
            <li>Verifique notificações para novidades e alertas.</li>
          </ul>
        ),
      },
    ],
    seeAlso: ["creditos-e-acoes"],
  },

  // CRÉDITOS E AÇÕES
  {
    slug: "creditos-e-acoes",
    title: "Sistema de ⚡ Ações e 💎 Créditos",
    category: CATS.INTRO,
    summary: "Suas moedas para criar: o que renova e o que é sob demanda.",
    info: [
      { label: "Renovação", value: "⚡ resetam diariamente (não acumulam)" },
      { label: "Uso premium", value: "💎 habilitam recursos extras" },
    ],
    sections: [
      {
        id: "carteiras",
        title: "Duas carteiras, dois usos",
        content: (
          <div>
            <p>Pense que você tem duas carteiras para “pagar” suas criações:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>⚡ Ações Diárias:</strong> renovam à meia-noite, não
                acumulam.
              </li>
              <li>
                <strong>💎 Créditos:</strong> recursos premium (ex.: imagens
                IA). Podem ser adquiridos e não expiram.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "cenario",
        title: "Cenário prático (como funciona no dia a dia)",
        content: (
          <div>
            <p>Exemplo:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Post Simples (texto): 1 ⚡ → saldo ajustado.</li>
              <li>Post com Imagem IA: 1 ⚡ + 30 💎 → saldo ajustado.</li>
              <li>Ideias Criativas: grátis (sem custo de ⚡ ou 💎).</li>
            </ul>
            <p className="mt-2">
              O sistema prioriza usar ⚡ ações quando possível, para economizar
              seus 💎.
            </p>
          </div>
        ),
      },
    ],
    seeAlso: ["posts-legendas", "carrosseis"],
  },

  // POSTS & LEGENDAS
  {
    slug: "posts-legendas",
    title: "Posts & Legendas",
    category: CATS.FUNC,
    summary:
      "Crie posts em texto, com imagem IA ou usando sua própria imagem.",
    info: [
      { label: "Acesso", value: "Menu › Posts & Legendas" },
      { label: "Modalidades", value: "Texto | +Imagem IA | Sua imagem" },
    ],
    sections: [
      {
        id: "intro",
        title: "Introdução",
        content: (
          <p>
            Aqui é onde a mágica acontece. Você tem 3 opções de criação pensadas
            para necessidades diferentes: apenas texto, texto + imagem gerada
            por IA, ou texto otimizado a partir de uma imagem sua.
          </p>
        ),
      },
      {
        id: "passo-a-passo",
        title: "Guia: seu primeiro post (+ Imagem IA)",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Descreva seu post (público, objetivo, tema). Ex.: “benefícios do
              café para programadores, tom bem-humorado”.
            </li>
            <li>
              Escolha o Estilo da Imagem (ex.: Foto realista, Ilustração 3D).
            </li>
            <li>
              Clique em <strong>Gerar Conteúdo</strong> e aguarde.
            </li>
            <li>
              Use <strong>Copiar</strong>, <strong>Download</strong> ou{" "}
              <strong>Enviar via WhatsApp</strong>.
            </li>
          </ol>
        ),
      },
      {
        id: "dica-briefing",
        title: "Dica de ouro (especificidade)",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>❌ “Post sobre marketing”.</li>
            <li>
              ✅ “Post com 5 dicas de marketing para pequenas lojas de roupa que
              querem vender mais no Instagram”.
            </li>
          </ul>
        ),
      },
    ],
    seeAlso: ["envio-whatsapp", "perfil-configuracoes", "ideias-criativas"],
  },

  // ROTEIROS
  {
    slug: "roteiros",
    title: "Roteiros para Vídeos",
    category: CATS.FUNC,
    summary: "Estruturas prontas para Reels, TikTok e Shorts.",
    sections: [
      {
        id: "estrutura",
        title: "A estrutura secreta de vídeos virais",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              <strong>Hook</strong> (0–3s): frase polêmica/pergunta curiosa para
              parar o scroll.
            </li>
            <li>
              <strong>Desenvolvimento</strong>: entregue as dicas e o passo a
              passo com clareza.
            </li>
            <li>
              <strong>CTA</strong>: diga explicitamente a ação desejada (seguir,
              comentar, salvar).
            </li>
          </ol>
        ),
      },
      {
        id: "como-usar",
        title: "Como usar",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>Informe o tema e a plataforma.</li>
            <li>Gere o roteiro e ajuste o tom.</li>
            <li>Copie/baixe e publique.</li>
          </ol>
        ),
      },
    ],
    seeAlso: ["posts-legendas"],
  },

  // CARROSSEIS
  {
    slug: "carrosseis",
    title: "Carrosséis",
    category: CATS.FUNC,
    summary: "Eduque e venda com posts de múltiplos slides.",
    sections: [
      {
        id: "conceito",
        title: "Por que usar carrosséis",
        content: (
          <div>
            <p>
              Carrosséis são excelentes para ensinar e aprofundar um tema. O
              Instagram costuma favorecer esse formato e, em muitos nichos, o
              engajamento é superior ao de posts simples.
            </p>
          </div>
        ),
      },
      {
        id: "custos",
        title: "Atenção ao custo das imagens",
        content: (
          <div>
            <p>
              Carrossel só com texto: 1 ⚡. Ao gerar imagens IA por slide, há
              custo adicional de 30 💎 por slide.
            </p>
            <p className="mt-1">Ex.: 5 slides com imagens = 1 ⚡ + 150 💎.</p>
          </div>
        ),
      },
      {
        id: "passos",
        title: "Passo a passo",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>Defina tema, objetivo e nº de slides.</li>
            <li>Escolha usar ou não imagens IA por slide.</li>
            <li>Gere, revise e exporte.</li>
          </ol>
        ),
      },
    ],
    seeAlso: ["creditos-e-acoes"],
  },

  // IDEIAS CRIATIVAS
  {
    slug: "ideias-criativas",
    title: "Ideias Criativas",
    category: CATS.FUNC,
    summary: "O fim do bloqueio criativo — ferramenta 100% gratuita.",
    sections: [
      {
        id: "intro",
        title: "Como usar de forma inteligente",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>Gere ideias para obter o “tema da redação”.</li>
            <li>Selecione a ideia mais promissora.</li>
            <li>
              Vá para <em>Posts & Legendas</em> ou <em>Roteiros</em>.
            </li>
            <li>
              Cole a ideia escolhida e peça o desenvolvimento completo.
            </li>
          </ol>
        ),
      },
      {
        id: "boas-praticas",
        title: "Boas práticas",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Crie um banco de ideias semanal.</li>
            <li>Agrupe ideias por temas/séries para facilitar produção.</li>
          </ul>
        ),
      },
    ],
    seeAlso: ["posts-legendas", "roteiros", "carrosseis"],
  },

  // PERFIL
  {
    slug: "perfil-configuracoes",
    title: "Perfil e Configurações",
    category: CATS.CONF,
    summary: "Ensine a IA a falar como você para resultados melhores.",
    info: [{ label: "Impacto", value: "Personalização melhora resultados" }],
    sections: [
      {
        id: "campos",
        title: "O que preencher em cada campo",
        content: (
          <div>
            <p>
              <strong>Público-alvo</strong>: detalhe quem compra de você (idade,
              interesses, dores).
            </p>
            <p className="mt-1">
              <strong>Tom de comunicação</strong>: defina o estilo
              (profissional, acessível, divertido etc.).
            </p>
            <p className="mt-1">
              <strong>Temas de interesse / Temas proibidos</strong>: diga o que
              abordar e o que evitar.
            </p>
          </div>
        ),
      },
      {
        id: "beneficios",
        title: "Por que isso importa",
        content: (
          <p>
            Um perfil bem preenchido é a diferença entre um conteúdo “ok” e um
            “UAU, parece que foi eu que escrevi!”.
          </p>
        ),
      },
    ],
    seeAlso: ["posts-legendas", "ideias-criativas"],
  },

  // ENVIO WHATSAPP
  {
    slug: "envio-whatsapp",
    title: "Envio para WhatsApp",
    category: CATS.FUNC,
    summary: "Receba tudo no WhatsApp para publicar do celular.",
    sections: [
      {
        id: "por-que",
        title: "Por que isso é útil",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Agilidade: copie e cole direto nas redes.</li>
            <li>Backup: mantenha um histórico das criações.</li>
            <li>Equipe: encaminhe para sócios/clientes aprovarem.</li>
          </ul>
        ),
      },
      {
        id: "config",
        title: "Como configurar (uma vez)",
        content: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>Acesse <em>👤 Perfil</em>.</li>
            <li>Informe seu número com DDD e DDI +55 (Brasil).</li>
            <li>Salve. Pronto!</li>
          </ol>
        ),
      },
    ],
    seeAlso: ["posts-legendas"],
  },

  // DICAS & TRUQUES
  {
    slug: "dicas-truques",
    title: "Dicas e Truques",
    category: CATS.FUNC,
    summary: "Qualidade, economia de 💎 e produtividade.",
    sections: [
      {
        id: "regra-80-20",
        title: "A Regra do 80/20",
        content: (
          <p>
            Para cada 10 posts, faça 8 de valor (educar/entreter) e 2 de venda
            direta. Isso cria confiança e melhora conversão.
          </p>
        ),
      },
      {
        id: "reutilizacao",
        title: "Reutilização inteligente",
        content: (
          <div>
            <p>Trabalhe uma vez, aproveite várias:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Seg: Post com 5 dicas rápidas.</li>
              <li>Ter: Reel com tour/mostra rápida.</li>
              <li>Qua: Carrossel com passo a passo detalhado.</li>
              <li>Qui: Stories com enquetes de “antes e depois”.</li>
            </ul>
          </div>
        ),
      },
    ],
    seeAlso: ["ideias-criativas", "carrosseis"],
  },

  // FAQ
  {
    slug: "perguntas-frequentes",
    title: "Perguntas Frequentes (FAQ)",
    category: CATS.SUP,
    summary: "As dúvidas mais comuns, direto ao ponto.",
    sections: [
      {
        id: "acoes-acumulam",
        title: "As ações diárias (⚡) acumulam?",
        content: (
          <p>
            Não. Pense nelas como um prato feito diário. Se não usar hoje,
            amanhã você recebe um novo, não dois. Use suas ⚡ para aproveitar ao
            máximo!
          </p>
        ),
      },
      {
        id: "perdi-creditos",
        title: "Não gostei do conteúdo. Perdi meus 💎 créditos?",
        content: (
          <p>
            O consumo (⚡/💎) ocorre na geração. Se o resultado não ficou bom,
            refine o pedido: seja mais específico, detalhe o público e o
            objetivo, e mantenha o Perfil completo. Pequenos ajustes elevam
            muito a qualidade.
          </p>
        ),
      },
      {
        id: "editar",
        title: "Posso editar o texto gerado?",
        content: (
          <p>
            Sim — e deve! A IA entrega a base (90% do trabalho). Os 10% finais
            são seu toque: histórias, vocabulário, emojis. Isso dá
            autenticidade.
          </p>
        ),
      },
    ],
    seeAlso: ["solucao-de-problemas", "suporte"],
  },

  // SOLUÇÃO DE PROBLEMAS
  {
    slug: "solucao-de-problemas",
    title: "Solução de Problemas",
    category: CATS.SUP,
    summary: "Login, travamentos e WhatsApp.",
    sections: [
      {
        id: "login",
        title: "Não consigo fazer login",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Revise e-mail/senha (atenção a espaços extras).</li>
            <li>Use “Esqueci minha senha” e siga o e-mail recebido.</li>
            <li>Tente aba anônima ou outro navegador.</li>
          </ul>
        ),
      },
      {
        id: "travou",
        title: "A página travou/botão não funciona",
        content: (
          <div>
            <p>
              Recarregar (F5) resolve a maioria dos casos — limpa falhas de
              carregamento.
            </p>
          </div>
        ),
      },
    ],
  },

  // SUPORTE
  {
    slug: "suporte",
    title: "Suporte",
    category: CATS.SUP,
    summary: "Canais oficiais de atendimento.",
    info: [
      { label: "WhatsApp", value: "+55 (54) 9639-6455" },
      { label: "E-mail", value: "atendimento@zappost.app" },
    ],
    sections: [
      {
        id: "contatos",
        title: "Contatos",
        content: (
          <div className="space-y-2">
            <p>
              <strong>Suporte WhatsApp:</strong>{" "}
              <a className={LINK} href={SUPPORT_URL} target="_blank" rel="noreferrer">
                +55 (54) 9639-6455
              </a>
            </p>
            <p>
              <strong>Suporte E-mail:</strong>{" "}
              <a className={LINK} href={SUPPORT_EMAIL}>
                atendimento@zappost.app
              </a>
            </p>
          </div>
        ),
      },
      {
        id: "boas-praticas",
        title: "Boas práticas ao solicitar suporte",
        content: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Explique o problema e o que já tentou.</li>
            <li>Inclua prints e horário aproximado do erro.</li>
            <li>
              Informe seus saldos de ⚡/💎 e qual recurso estava usando.
            </li>
          </ul>
        ),
      },
    ],
  },
];

const CATEGORIES = [
  { key: CATS.INTRO, slugs: ["bem-vindo", "dashboard", "creditos-e-acoes"] },
  {
    key: CATS.FUNC,
    slugs: [
      "posts-legendas",
      "roteiros",
      "carrosseis",
      "ideias-criativas",
      "envio-whatsapp",
      "dicas-truques",
    ],
  },
  { key: CATS.CONF, slugs: ["perfil-configuracoes"] },
  {
    key: CATS.SUP,
    slugs: ["perguntas-frequentes", "solucao-de-problemas", "suporte"],
  },
];

// ---------------------- Roteamento (hash) ----------------------
function useArticleRouter() {
  const initial = () => {
    if (typeof window === "undefined") return "bem-vindo";
    return window.location.hash.replace(/^#\/?/, "") || "bem-vindo";
    };
  const [slug, setSlug] = useState(initial);
  useEffect(() => {
    const onHash = () => setSlug(initial());
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }
  }, []);
  const nav = (s) => {
    if (typeof window !== "undefined") {
      window.location.hash = `/${s}`;
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }
    }
    setSlug(s);
  };
  return { slug, nav };
}

// ---------------------- Busca ----------------------
function SearchBar({ index, onPick }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q) return [];
    const nq = norm(q);
    return index
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        score:
          (norm(a.title).includes(nq) ? 3 : 0) +
          (norm(a.summary).includes(nq) ? 2 : 0) +
          (norm(a.joined).includes(nq) ? 1 : 0),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [q, index]);

  return (
    <div className="relative w-full max-w-xl">
      <div className={`${CARD} flex items-center gap-2 px-3 py-2`}>
        <Search className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar artigos, tópicos…"
          className="w-full bg-transparent outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
        />
      </div>
      {q && (
        <div className="absolute mt-2 w-full z-20 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-neutral-600 dark:text-neutral-400">
              Nada encontrado
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.slug}
                onClick={() => {
                  onPick(r.slug);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {r.slug}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------- Sidebar ----------------------
function Sidebar({ onNav, open }) {
  return (
    <aside className={`${open ? "block" : "hidden"} lg:block lg:w-72 shrink-0`}>
      <div className={`${CARD} p-3 lg:sticky lg:top-24 space-y-2`}>
        <div className="font-semibold mb-1 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Categorias
        </div>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="mb-3">
            <div className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-400 px-2 mt-2 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" /> {cat.key}
            </div>
            <ul className="mt-1 space-y-1">
              {cat.slugs.map((slug) => {
                const a = ARTICLES.find((x) => x.slug === slug);
                if (!a) return null;
                return (
                  <li key={slug}>
                    <button
                      onClick={() => onNav(slug)}
                      className="w-full text-left px-2 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    >
                      <div className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />{" "}
                        {a.title}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {a.summary}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ---------------------- Artigo ----------------------
function Article({ article, onNav }) {
  const [tocTarget, setTocTarget] = useState(null);
  useEffect(() => {
    if (tocTarget) {
      const el = document.getElementById(tocTarget);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocTarget(null);
    }
  }, [tocTarget]);

  if (!article) return null;
  const sections = Array.isArray(article.sections) ? article.sections : [];
  return (
    <div className="w-full">
      <div className="mb-3 text-xs text-neutral-500 flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span>Início</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{article.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-900 dark:text-neutral-200">
          {article.title}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-sky-600" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {article.title}
        </h1>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 mb-6 max-w-3xl">
        {article.summary}
      </p>

      <div className="grid xl:grid-cols-[1fr_20rem] gap-6">
        <div className="space-y-8">
          {sections.length === 0 ? (
            <NoticeBox title="Conteúdo em breve">
              Este artigo ainda não possui seções cadastradas.
            </NoticeBox>
          ) : (
            sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 border-b border-neutral-200 dark:border-neutral-800 pb-4"
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> {s.title}
                </h2>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  {s.content}
                </div>
              </section>
            ))
          )}

          {article.seeAlso?.length ? (
            <section>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-sky-600" /> Veja também
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                {article.seeAlso.map((slug) => (
                  <li key={slug}>
                    <WikiLink to={slug} onNav={onNav}>
                      {ARTICLES.find((a) => a.slug === slug)?.title}
                    </WikiLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-4">
          <TOC sections={sections} onJump={setTocTarget} />
          <InfoBox items={article.info} />
        </div>
      </div>
    </div>
  );
}

// ---------------------- App ----------------------
export default function App() {
  const { slug, nav } = useArticleRouter();
  const article = ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];
  const [menuOpen, setMenuOpen] = useState(false);

  // índice de busca (texto dentro das seções)
  const searchIndex = useMemo(
    () =>
      ARTICLES.map((a) => ({
        ...a,
        joined: (Array.isArray(a.sections) ? a.sections : [])
          .map((s) => {
            const c = s.content;
            if (typeof c === "string") return c;
            try {
              return JSON.stringify(c?.props?.children) || "";
            } catch {
              return "";
            }
          })
          .join(" "),
      })),
    []
  );

  return (
    <div className={SHELL_BG}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 select-none"
          >
            <BookOpen className="h-6 w-6 text-sky-600" />
            <button
              onClick={() => nav("bem-vindo")}
              className="font-semibold text-sky-700 dark:text-sky-300"
              title="Ir para a página inicial"
            >
              ZAP POST • Wiki
            </button>
          </motion.div>
          <div className="grow flex justify-center">
            <SearchBar
              index={searchIndex}
              onPick={(s) => {
                setMenuOpen(false);
                nav(s);
              }}
            />
          </div>
          <a
            data-test-id="help-link"
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            aria-label="Abrir suporte no WhatsApp em nova guia"
            title="Suporte no WhatsApp"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ajuda</span>
          </a>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="flex gap-6">
          <Sidebar
            onNav={(s) => {
              setMenuOpen(false);
              nav(s);
            }}
            open={menuOpen}
          />
          <Article article={article} onNav={nav} />
        </div>

        <footer className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span>Wiki inspirada na experiência de navegação da Wikipedia.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
