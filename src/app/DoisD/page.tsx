"use client";

import { useEffect, useRef, useState } from "react";
import Sala2D, { ViewMode2D } from "@/componentes/salaDoisD";
import jsPDF from "jspdf";

export default function DoisD() {
  const [scenarioUrl, setScenarioUrl] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState("Nenhum cenário carregado");
  const [viewMode, setViewMode] = useState<ViewMode2D>("top");

  const studentNameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scenarioUrl) {
        URL.revokeObjectURL(scenarioUrl);
      }
    };
  }, [scenarioUrl]);

  const handleOpenScenario = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".glb")) {
      alert("Selecione um arquivo .glb válido.");
      event.target.value = "";
      return;
    }

    if (scenarioUrl) {
      URL.revokeObjectURL(scenarioUrl);
    }

    setScenarioUrl(URL.createObjectURL(file));
    setScenarioName(file.name);
    setViewMode("top");

    event.target.value = "";
  };

  const waitForCanvas = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const canvas = viewerRef.current?.querySelector(
      "canvas",
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      throw new Error("Canvas não encontrado.");
    }

    return canvas;
  };

  const handleDownloadPDF = async () => {
    const studentName = studentNameRef.current?.value || "";

    if (!scenarioUrl) {
      alert("Abra um cenário antes de gerar o PDF.");
      return;
    }

    if (!studentName.trim()) {
      alert("Digite seu nome antes de baixar o PDF.");
      return;
    }

    try {
      setViewMode("top");

      const topCanvas = await waitForCanvas();
      const topImgData = topCanvas.toDataURL("image/png");

      setViewMode("side");

      const sideCanvas = await waitForCanvas();
      const sideImgData = sideCanvas.toDataURL("image/png");

      setViewMode("top");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleDateString("pt-BR");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const maxWidth = pdfWidth - 28;
      const maxHeight = pdfHeight - 55;

      pdf.setFontSize(18);
      pdf.text("Relatório da Sala 2D", 14, 18);

      pdf.setFontSize(11);
      pdf.text(`Aluno: ${studentName}`, 14, 26);
      pdf.text(`Cenário: ${scenarioName}`, 14, 32);
      pdf.text(`Data: ${dataFormatada}`, 14, 38);
      pdf.text("Visões: Superior e Lateral", 14, 44);

      let topWidth = maxWidth;
      let topHeight = (topCanvas.height * topWidth) / topCanvas.width;

      if (topHeight > maxHeight) {
        topHeight = maxHeight;
        topWidth = (topCanvas.width * topHeight) / topCanvas.height;
      }

      pdf.addImage(topImgData, "PNG", 14, 51, topWidth, topHeight);

      pdf.addPage();

      const sideMaxWidth = pdfWidth - 20;
      const sideMaxHeight = pdfHeight - 20;

      let sideWidth = sideMaxWidth;
      let sideHeight = (sideCanvas.height * sideWidth) / sideCanvas.width;

      if (sideHeight > sideMaxHeight) {
        sideHeight = sideMaxHeight;
        sideWidth = (sideCanvas.width * sideHeight) / sideCanvas.height;
      }

      const sideX = (pdfWidth - sideWidth) / 2;
      const sideY = (pdfHeight - sideHeight) / 2;

      pdf.addImage(sideImgData, "PNG", sideX, sideY, sideWidth, sideHeight);

      const safeFileName = studentName.toLowerCase().replace(/\s+/g, "_");

      pdf.save(`sala_2d_${safeFileName}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF do cenário.");
    }
  };

  return (
    <main className="doisDPage">
      <div className="doisDHeader">
        <div>
          <h1>Sala em 2D</h1>
          <p>
            Visualize o mesmo cenário criado na sala em 3D em diferentes
            ângulos.
          </p>
        </div>
      </div>

      <section className="doisDToolbar">
        <button
          className="primaryButton"
          onClick={() => fileInputRef.current?.click()}
        >
          📂 Abrir cenário .GLB
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          onChange={handleOpenScenario}
          hidden
        />

        <div className="studentField">
          <label htmlFor="studentName">NOME DO ALUNO</label>

          <input
            id="studentName"
            ref={studentNameRef}
            type="text"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="scenarioInfo">
          <span>CENÁRIO</span>
          <strong>{scenarioName}</strong>
        </div>

        <div className="viewSelector">
          <span>VISÃO DA SALA</span>

          <div className="viewButtons">
            <button
              type="button"
              className={
                viewMode === "top" ? "viewButton active" : "viewButton"
              }
              onClick={() => setViewMode("top")}
            >
              ⬇️ Superior
            </button>

            <button
              type="button"
              className={
                viewMode === "side" ? "viewButton active" : "viewButton"
              }
              onClick={() => setViewMode("side")}
            >
              ↪️ Lateral
            </button>
          </div>
        </div>

        <button className="pdfButton" onClick={handleDownloadPDF}>
          📄 Baixar PDF
        </button>
      </section>

      <section
        ref={viewerRef}
        className="doisDViewer"
        style={{
          height: viewMode === "top" ? "68vh" : "58vh",
          minHeight: viewMode === "top" ? "450px" : "380px",
          flex: "none",
        }}
      >
        {scenarioUrl ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: viewMode === "side" ? "translateY(80px)" : "none",
            }}
          >
            <Sala2D scenarioUrl={scenarioUrl} viewMode={viewMode} />
          </div>
        ) : (
          <div className="empty2D">
            <div className="emptyIcon">🗺️</div>

            <strong>Nenhum cenário carregado</strong>

            <span>
              Na sala 3D, salve o cenário e depois abra o arquivo .GLB aqui.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
