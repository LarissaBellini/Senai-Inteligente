import fs from "fs";
import path from "path";
import ElementosStudio from "@/componentes/elemnetos-glb";

export interface ElementoAsset {
    nome: string;
    id: string;
    src: string;
    categoria: "Mobiliário" | "Tecnologia" | "Outros";
}

function formatarNome(nomeArquivo: string): string {
    return nomeArquivo
        .replace(/\.glb$/i, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function definirCategoria(
    nome: string
): "Mobiliário" | "Tecnologia" | "Outros" {
    const texto = nome.toLowerCase();

    const mobiliario = [
        "pallete",
        "mesa",
        "cadeira",
        "armario",
        "armário",
        "prateleira",
        "prateleiras",
        "estante",
        "banco",
        "sofa",
        "sofá",
        "quadro",
        "lixeira",
        "janela",
        "porta",
    ];

    const tecnologia = [
        "computador",
        "pc",
        "cpu",
        "notebook",
        "monitor",
        "projetor",
        "televisao",
        "televisão",
        "tv",
        "tablet",
        "impressora",
        "teclado",
        "mouse",
        "camera",
        "câmera",
        "sensor",
        "arduino",
    ];

    if (
        mobiliario.some((palavra) =>
            texto.includes(palavra)
        )
    ) {
        return "Mobiliário";
    }

    if (
        tecnologia.some((palavra) =>
            texto.includes(palavra)
        )
    ) {
        return "Tecnologia";
    }

    return "Outros";
}

export default function ElementosPage() {
    const elementosDir = path.join(
        process.cwd(),
        "public",
        "assets",
        "animacoes",
        "elementos"
    );

    let assets: ElementoAsset[] = [];

    if (fs.existsSync(elementosDir)) {
        const arquivos = fs.readdirSync(elementosDir);

        assets = arquivos
            .filter((arquivo) =>
                arquivo
                    .toLowerCase()
                    .endsWith(".glb")
            )
            .map((arquivo) => {
                const nome = formatarNome(arquivo);

                return {
                    nome,
                    id: arquivo.replace(
                        /\.glb$/i,
                        ""
                    ),
                    src: `/assets/animacoes/elementos/${arquivo}`,
                    categoria:
                        definirCategoria(nome),
                };
            });
    }

    return (
        <ElementosStudio
            assets={assets}
        />
    );
}