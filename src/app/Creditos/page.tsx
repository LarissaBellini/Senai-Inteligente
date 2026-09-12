<<<<<<< HEAD
"use client";

import {
  TeamOutlined,
  CodeOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";

import "./creditos.css";
import { Avatar } from "antd";
import Alves from "@/app/Avatares/alves.png"
import Jonas from "@/app/Avatares/jonas.png"
import Larissa from "@/app/Avatares/lari.png"
import Alexandre from "@/app/Avatares/alexandre.png"
import Bruno from "@/app/Avatares/bruno.png"
import Djalma from "@/app/Avatares/djalma.png"

export default function Creditos() {
  const professores = [
    {
      avatar: Alexandre,
      nome: "Alexandre Vinícius Dias Simões Brito ",
      funcao: "Orientador",
    },
    {
      avatar: Bruno,
      nome: "Bruno Henrique de Paula",
      funcao: "Orientador",
    },
    {
      avatar: Djalma,
      nome: "Djalma Roberto Larocca Junior",
      funcao: "Cliente",
    },
  ];

  const desenvolvedores = [
    {
      avatar: Jonas,
      nome: "Jonas Luiz Oliveira de Lima",
      funcao: "Designer",
    },
    {
      avatar: Larissa,
      nome: "Larissa Santos Bellini",
      funcao: "Desenvolvedora",
    },
    {
      avatar: Alves,
      nome: "Murilo Alves dos Santos",
      funcao: "Artísta 3D",
    },
  ];

  return (
    <main className="creditos">

      <div className="creditosCabecalho">
        <h1>Colaboradores</h1>

        <p>
          Conheça os professores e alunos envolvidos no desenvolvimento
          deste projeto.
        </p>
      </div>

      <section className="sobreProjeto">

        <div className="sobreProjetoIcone">
          <BookOutlined />
        </div>

        <div>
          <h2>SENAI — Sala Inteligente</h2>

          <p>
            Projeto desenvolvido através da integração entre os cursos
            de Desenvolvimento de Sistemas e Almoxarife, com o objetivo
            de auxiliar os alunos na organização e compreensão do espaço
            da sala de aula.
          </p>
        </div>

      </section>

      <section className="secaoCreditos">

        <div className="tituloSecao">

          <div className="tituloIcone">
            <TeamOutlined />
          </div>

          <div>
            <h2>Instrutores</h2>

            <p>
              Instrutores responsáveis pela orientação e acompanhamento
              do projeto.
            </p>
          </div>

        </div>


        <div className="cardsCreditos">

          {professores.map((professor, index) => (

            <div className="cardCredito" key={index}>

              <div className="avatarCredito">
                <Avatar
                  size={70}
                  src={professor.avatar.src}
                />
              </div>

              <div className="informacoesCredito">
                <h3>{professor.nome}</h3>

                <span>{professor.funcao}</span>
              </div>

            </div>

          ))}

        </div>

      </section>

      <section className="secaoCreditos">

        <div className="tituloSecao">

          <div className="tituloIcone">
            <CodeOutlined />
          </div>

          <div>
            <h2>Desenvolvedores</h2>

            <p>
              Alunos responsáveis pelo desenvolvimento do site.
            </p>
          </div>

        </div>


        <div className="cardsCreditos">

          {desenvolvedores.map((aluno, index) => (

            <div className="cardCredito" key={index}>

              <div className="avatarCredito">
                <Avatar
                  size={70}
                  src={aluno.avatar.src}
                />
              </div>

              <div className="informacoesCredito">
                <h3>{aluno.nome}</h3>

                <span>{aluno.funcao}</span>
              </div>

            </div>

          ))}

        </div>

      </section>


      <footer className="rodapeCreditos">

        <span>SENAI • Oscar Lúcio Baldan</span>

        <span>Projeto Integrado • 2026</span>

      </footer>

    </main>
  );
=======
"use client";

import {
  TeamOutlined,
  CodeOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";

import "./creditos.css";
import { Avatar } from "antd";
import Alves from "@/app/Avatares/alves.png"
import Jonas from "@/app/Avatares/jonas.png"
import Larissa from "@/app/Avatares/lari.png"
import Alexandre from "@/app/Avatares/alexandre.png"
import Bruno from "@/app/Avatares/bruno.png"
import Djalma from "@/app/Avatares/djalma.png"

export default function Creditos() {
  const professores = [
    {
      avatar: Alexandre,
      nome: "Alexandre Vinícius Dias Simões Brito ",
      funcao: "Orientador",
    },
    {
      avatar: Bruno,
      nome: "Bruno Henrique de Paula",
      funcao: "Orientador",
    },
    {
      avatar: Djalma,
      nome: "Djalma Roberto Larocca Junior",
      funcao: "Cliente",
    },
  ];

  const desenvolvedores = [
    {
      avatar: Jonas,
      nome: "Jonas Luiz Oliveira de Lima",
      funcao: "Designer",
    },
    {
      avatar: Larissa,
      nome: "Larissa Santos Bellini",
      funcao: "Desenvolvedora",
    },
    {
      avatar: Alves,
      nome: "Murilo Alves dos Santos",
      funcao: "Artísta 3D",
    },
  ];

  return (
    <main className="creditos">

      <div className="creditosCabecalho">
        <h1>Colaboradores</h1>

        <p>
          Conheça os professores e alunos envolvidos no desenvolvimento
          deste projeto.
        </p>
      </div>

      <section className="sobreProjeto">

        <div className="sobreProjetoIcone">
          <BookOutlined />
        </div>

        <div>
          <h2>SENAI — Sala Inteligente</h2>

          <p>
            Projeto desenvolvido através da integração entre os cursos
            de Desenvolvimento de Sistemas e Almoxarife, com o objetivo
            de auxiliar os alunos na organização e compreensão do espaço
            da sala de aula.
          </p>
        </div>

      </section>

      <section className="secaoCreditos">

        <div className="tituloSecao">

          <div className="tituloIcone">
            <TeamOutlined />
          </div>

          <div>
            <h2>Instrutores</h2>

            <p>
              Instrutores responsáveis pela orientação e acompanhamento
              do projeto.
            </p>
          </div>

        </div>


        <div className="cardsCreditos">

          {professores.map((professor, index) => (

            <div className="cardCredito" key={index}>

              <div className="avatarCredito">
                <Avatar
                  size={70}
                  src={professor.avatar.src}
                />
              </div>

              <div className="informacoesCredito">
                <h3>{professor.nome}</h3>

                <span>{professor.funcao}</span>
              </div>

            </div>

          ))}

        </div>

      </section>

      <section className="secaoCreditos">

        <div className="tituloSecao">

          <div className="tituloIcone">
            <CodeOutlined />
          </div>

          <div>
            <h2>Desenvolvedores</h2>

            <p>
              Alunos responsáveis pelo desenvolvimento do site.
            </p>
          </div>

        </div>


        <div className="cardsCreditos">

          {desenvolvedores.map((aluno, index) => (

            <div className="cardCredito" key={index}>

              <div className="avatarCredito">
                <Avatar
                  size={70}
                  src={aluno.avatar.src}
                />
              </div>

              <div className="informacoesCredito">
                <h3>{aluno.nome}</h3>

                <span>{aluno.funcao}</span>
              </div>

            </div>

          ))}

        </div>

      </section>


      <footer className="rodapeCreditos">

        <span>SENAI • Oscar Lúcio Baldan</span>

        <span>Projeto Integrado • 2026</span>

      </footer>

    </main>
  );
>>>>>>> 415f6a0ee0d3853d4eb0460840a112922f3ab011
}