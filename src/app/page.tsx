"use client";
import { Button, Card } from "antd";
import type { Metadata } from "next";
import Image from "next/image";

// Ícones dos cards
import CodeSandboxOutlined from "@ant-design/icons/es/icons/CodeSandboxOutlined";
import AppstoreOutlined from "@ant-design/icons/es/icons/AppstoreOutlined";
import DropboxOutlined from "@ant-design/icons/es/icons/DropboxOutlined";
import SaveOutlined from "@ant-design/icons/es/icons/SaveOutlined";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
          justifyContent: "space-between"
        }}>

        <div
          style={{
            flex: 1,
            marginTop: "20px"
          }}>
          <h1
            style={{
              fontSize: "56px",
              color: "#004b85",
              fontWeight: "bold",
              margin: 0,
              lineHeight: "1.1"
            }}>
            Bem-vindo!
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#555",
              marginTop: "20px",
              marginBottom: "35px",
              lineHeight: "1.6",
              maxWidth: "450px"
            }}>
            Crie, visualize e organize salas de aula em 3D de forma prática e intuitiva.
          </p>

          <Button
            type="primary"
            size="large"
            icon={<CodeSandboxOutlined />}
            style={{
              background: "#004b85",
              border: "none",
              height: "48px",
              padding: "0 24px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onClick={() => router.push("/TresD")}
          >
            Ir para Sala em 3D
          </Button>


          <Card
            style={{
              marginTop: "40px",
              borderRadius: "16px",
              background: "#eae2d5",
              border: "none",
              maxWidth: "450px"
            }}
            styles={{
              body: {
                padding: "20px",
                display: "flex",
                gap: "15px",
                alignItems: "center",
              },
            }}
          >
            <div
              style={{
                background: "#dccbb4",
                padding: "12px",
                borderRadius: "50%",
                display: "flex",
                fontSize: "24px",
                color: "#004b85"
              }}>
              <CodeSandboxOutlined />
            </div>
            <div>
              <h4
                style={{
                  margin: 0,
                  color: "#004b85",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}>
                Sobre a ferramenta
              </h4>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#555",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}>
                Esta ferramenta permite que você monte e organize salas de aula, arrastando e posicionando os elementos de acordo com a necessidade.
              </p>
            </div>
          </Card>
        </div>

        <div
          style={{
            flex: 1.2,
            display: "flex",
            justifyContent: "flex-end"
          }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "400px",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
            }}>
            <img
              src="/maqueteTD.png"
              alt="Maquete Sala Inteligente"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          </div>
        </div>

      </div>

      <div style={{ marginTop: "60px" }}>
        <h3
          style={{
            color: "#004b85",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px"
          }}>
          O que você pode fazer
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px"
          }}>

          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #e2d7c7",
              background: "transparent"
            }}>
            <div
              style={{
                background: "#eae2d5",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#004b85",
                marginBottom: "15px"
              }}>
              <CodeSandboxOutlined />
            </div>
            <h4
              style={{
                color: "#004b85",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "bold"
              }}>
              Montar em 3D
            </h4>
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.5"
              }}>
              Arraste e organize os elementos para criar sua sala em um ambiente 3D interativo.
            </p>
          </Card>

          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #e2d7c7",
              background: "transparent"
            }}>
            <div
              style={{
                background: "#eae2d5",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#004b85",
                marginBottom: "15px"
              }}>
              <AppstoreOutlined />
            </div>
            <h4
              style={{
                color: "#004b85",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "bold"
              }}>
              Visualizar em 2D
            </h4>
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.5"
              }}>
              Veja sua sala em planta baixa e faça ajustes com precisão.
            </p>
          </Card>

          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #e2d7c7",
              background: "transparent"
            }}>
            <div
              style={{
                background: "#eae2d5",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#004b85",
                marginBottom: "15px"
              }}>
              <DropboxOutlined />
            </div>
            <h4
              style={{
                color: "#004b85",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "bold"
              }}>
              Gerenciar elementos
            </h4>
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.5"
              }}>
              Adicione, visualize e desabilite os elementos da sua sala de aula.
            </p>
          </Card>

          <Card
            style={{
              borderRadius: "16px",
              border: "1px solid #e2d7c7",
              background: "transparent"
            }}>
            <div
              style={{
                background: "#eae2d5",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#004b85",
                marginBottom: "15px"
              }}>
              <SaveOutlined />
            </div>
            <h4
              style={{
                color: "#004b85",
                margin: "0 0 8px 0",
                fontSize: "15px",
                fontWeight: "bold"
              }}>
              Salvar configurações
            </h4>
            <p
              style={{
                color: "#666",
                fontSize: "13px",
                margin: 0,
                lineHeight: "1.5"
              }}>
              Salve seus projetos e retorne quando quiser para continuar.
            </p>
          </Card>

        </div>
      </div>

    </div>
  );
}