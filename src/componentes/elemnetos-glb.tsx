"use client";

import {
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Button,
    Card,
    Empty,
    Input,
    Switch,
} from "antd";

import {
    FolderAddOutlined,
} from "@ant-design/icons";

import { Canvas } from "@react-three/fiber";

import {
    OrbitControls,
    useGLTF,
    Center,
    Environment,
} from "@react-three/drei";

const { Search } = Input;

export interface ElementoAsset {
    nome: string;
    id: string;
    src: string;
    categoria?: string;
}

interface ElementosStudioProps {
    assets?: ElementoAsset[];
}

const STORAGE_KEY =
    "senai-elementos-habilitados";

function Modelo3D({
    src,
}: {
    src: string;
}) {
    const { scene } = useGLTF(src);

    const modelo = useMemo(() => {
        const clone = scene.clone();

        clone.traverse((obj) => {
            if ("castShadow" in obj) {
                obj.castShadow = true;
            }

            if ("receiveShadow" in obj) {
                obj.receiveShadow = true;
            }
        });

        return clone;
    }, [scene]);

    return (
        <Center>
            <primitive
                object={modelo}
                scale={1}
            />
        </Center>
    );
}

function Preview3D({
    src,
}: {
    src: string;
}) {
    return (
        <div
            style={{
                width: "100%",
                height: "180px",
                borderRadius: "14px",
                overflow: "hidden",
                background:
                    "linear-gradient(145deg, #eef3f6 0%, #a9cde3 100%)",
                border: "1px solid #d8e0e4",
                boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9)",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    zIndex: 2,
                    background:
                        "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#35516a",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                3D
            </div>

            <Canvas
                camera={{
                    position: [3, 2, 4],
                    fov: 45,
                }}
                dpr={[1, 2]}
                shadows
            >
                <ambientLight
                    intensity={1.8}
                />

                <directionalLight
                    position={[5, 6, 5]}
                    intensity={2.2}
                    castShadow
                />

                <directionalLight
                    position={[-4, 3, -4]}
                    intensity={0.8}
                />

                <Suspense fallback={null}>
                    <Modelo3D src={src} />

                    <Environment
                        preset="studio"
                    />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={1.5}
                />
            </Canvas>
        </div>
    );
}

export default function ElementosStudio({
    assets = [],
}: ElementosStudioProps) {
    const [busca, setBusca] =
        useState("");

    const [categoria, setCategoria] =
        useState("Todos");

    const [habilitados, setHabilitados] =
        useState<Record<string, boolean>>(
            {}
        );

    useEffect(() => {
        try {
            const salvo =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (salvo) {
                setHabilitados(
                    JSON.parse(salvo)
                );
            }
        } catch {
            setHabilitados({});
        }
    }, []);

    const listaAssets = useMemo(() => {
        return Array.isArray(assets)
            ? assets
            : [];
    }, [assets]);

    const definirCategoria = (
        nome: string
    ) => {
        const texto =
            nome.toLowerCase();

        if (
            texto.includes("pallete") ||
            texto.includes("mesa") ||
            texto.includes("cadeira") ||
            texto.includes("armario") ||
            texto.includes("armário") ||
            texto.includes("prateleira") ||
            texto.includes("prateleiras") ||
            texto.includes("estante") ||
            texto.includes("quadro") ||
            texto.includes("lixeira") ||
            texto.includes("porta") ||
            texto.includes("janela")
        ) {
            return "Mobiliário";
        }

        if (
            texto.includes("impressora") ||
            texto.includes("projetor") ||
            texto.includes("computador") ||
            texto.includes("monitor") ||
            texto.includes("notebook") ||
            texto.includes("tablet") ||
            texto.includes("sensor") ||
            texto.includes("arduino") ||
            texto.includes("cpu")
        ) {
            return "Tecnologia";
        }

        return "Outros";
    };

    const elementosFiltrados =
        useMemo(() => {
            const texto =
                busca
                    .toLowerCase()
                    .trim();

            return listaAssets.filter(
                (elemento) => {
                    const nome =
                        elemento.nome.toLowerCase();

                    const correspondeBusca =
                        texto === "" ||
                        nome.includes(texto);

                    const correspondeCategoria =
                        categoria === "Todos" ||
                        definirCategoria(
                            elemento.nome
                        ) === categoria;

                    return (
                        correspondeBusca &&
                        correspondeCategoria
                    );
                }
            );
        }, [
            listaAssets,
            busca,
            categoria,
        ]);

    const estaHabilitado = (
        elemento: ElementoAsset
    ) => {
        if (
            habilitados[
                elemento.src
            ] === undefined
        ) {
            return true;
        }

        return habilitados[
            elemento.src
        ];
    };

    const alterarStatus = (
        elemento: ElementoAsset,
        ativo: boolean
    ) => {
        const novoEstado = {
            ...habilitados,
            [elemento.src]: ativo,
        };

        setHabilitados(
            novoEstado
        );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                novoEstado
            )
        );

        window.dispatchEvent(
            new CustomEvent(
                "elementos-status-alterado"
            )
        );
    };

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    margin: "20px",
                }}
            >
                <div
                    style={{
                        flex: 1,
                    }}
                >
                    <h1
                        style={{
                            fontSize: "32px",
                            color: "#004b85",
                            fontWeight: "700",
                            margin: 0,
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Elementos
                    </h1>

                    <p
                        style={{
                            color: "#71808d",
                            margin: "6px 0 0",
                            fontSize: "14px",
                        }}
                    >
                        Visualize os elementos já existentes,
                        ou adicione novos elementos.
                    </p>
                </div>

                <Search
                    placeholder="Pesquise o elemento"
                    size="large"
                    allowClear
                    value={busca}
                    onChange={(e) =>
                        setBusca(e.target.value)
                    }
                    style={{
                        width: 300,
                        height: "42px",
                    }}
                />

                <Button
                    type="primary"
                    size="large"
                    icon={
                        <FolderAddOutlined
                            style={{
                                fontSize: "18px",
                            }}
                        />
                    }
                    style={{
                        background: "#de5b0a",
                        border: "none",
                        height: "42px",
                        color: 'white',
                        padding: "0 24px",
                        borderRadius: "9px",
                        fontSize: "15px",
                        fontWeight: "600",
                        boxShadow:
                            "0 2px 5px #cf5001",
                    }}
                    disabled
                >
                    Criar Elemento
                </Button>
            </div>

            <Card
                style={{
                    borderRadius: "20px",
                    border: "1px solid #e8dfd2",
                    background:
                        "linear-gradient(145deg, #f7efe5 0%, #f2e8db 100%)",
                    boxShadow:
                        "0 8px 25px rgba(64,45,25,0.06)",
                }}
                styles={{
                    body: {
                        padding: "22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "28px",
                    },
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <Button
                        size="large"
                        icon={
                            <FolderAddOutlined
                                style={{
                                    fontSize: "18px",
                                }}
                            />
                        }
                        onClick={() =>
                            setCategoria("Todos")
                        }
                        style={{
                            background:
                                categoria ===
                                "Todos"
                                    ? "#d2cec7"
                                    : "#fbf2e5",
                            border:
                                categoria ===
                                "Todos"
                                    ? "1px solid #b8b1a7"
                                    : "1px solid #e2d2b9",
                            color: "#004b85",
                            borderRadius: "9px",
                            fontWeight: "600",
                            boxShadow:
                                categoria ===
                                "Todos"
                                    ? "0 3px 8px rgba(176,139,81,0.18)"
                                    : "none",
                        }}
                    >
                        Todos
                    </Button>

                    <Button
                        size="large"
                        icon={
                            <FolderAddOutlined
                                style={{
                                    fontSize: "18px",
                                }}
                            />
                        }
                        onClick={() =>
                            setCategoria(
                                "Mobiliário"
                            )
                        }
                        style={{
                            background:
                                categoria ===
                                "Mobiliário"
                                    ? "#d2cec7"
                                    : "#fbf2e5",
                            border:
                                categoria ===
                                "Mobiliário"
                                    ? "1px solid  #b8b1a7"
                                    : "1px solid #e2d2b9",
                            color: "#004b85",
                            borderRadius: "9px",
                            fontWeight: "600",
                            boxShadow:
                                categoria ===
                                "Mobiliário"
                                    ? "0 3px 8px rgba(176,139,81,0.18)"
                                    : "none",
                        }}
                    >
                        Mobiliário
                    </Button>

                    <Button
                        size="large"
                        icon={
                            <FolderAddOutlined
                                style={{
                                    fontSize: "18px",
                                }}
                            />
                        }
                        onClick={() =>
                            setCategoria(
                                "Tecnologia"
                            )
                        }
                        style={{
                            background:
                                categoria ===
                                "Tecnologia"
                                    ? "#d2cec7"
                                    : "#fbf2e5",
                            border:
                                categoria ===
                                "Tecnologia"
                                    ? "1px solid  #b8b1a7"
                                    : "1px solid #e2d2b9",
                            color: "#004b85",
                            borderRadius: "9px",
                            fontWeight: "600",
                            boxShadow:
                                categoria ===
                                "Tecnologia"
                                    ? "0 3px 8px rgba(176,139,81,0.18)"
                                    : "none",
                        }}
                    >
                        Tecnologia
                    </Button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                        gap: "18px",
                    }}
                >
                    {elementosFiltrados.length ===
                    0 ? (
                        <div
                            style={{
                                gridColumn:
                                    "1 / -1",
                                padding:
                                    "50px",
                                textAlign:
                                    "center",
                            }}
                        >
                            <Empty
                                description={
                                    listaAssets.length ===
                                    0
                                        ? "Nenhum elemento encontrado."
                                        : "Nenhum elemento corresponde à pesquisa."
                                }
                            />
                        </div>
                    ) : (
                        elementosFiltrados.map(
                            (
                                elemento
                            ) => {
                                const ativo =
                                    estaHabilitado(
                                        elemento
                                    );

                                return (
                                    <div
                                        key={
                                            elemento.id
                                        }
                                        style={{
                                            background:
                                                "#F6F0E8",
                                            border:
                                                ativo
                                                    ? "1px solid #e5d7c5"
                                                    : "1px solid #ddd8d0",
                                            borderRadius:
                                                "16px",
                                            padding:
                                                "12px",
                                            opacity:
                                                ativo
                                                    ? 1
                                                    : 0.58,
                                            transition:
                                                "all 0.25s ease",
                                            boxShadow:
                                                ativo
                                                    ? "0 5px 16px rgba(70,52,30,0.07)"
                                                    : "0 2px 8px rgba(70,52,30,0.03)",
                                        }}
                                    >
                                        <Preview3D
                                            src={
                                                elemento.src
                                            }
                                        />

                                        <div
                                            style={{
                                                marginTop:
                                                    "14px",
                                                padding:
                                                    "2px 4px 2px 4px",
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "space-between",
                                                gap:
                                                    "12px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    minWidth:
                                                        0,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "16px",
                                                        fontWeight:
                                                            "650",
                                                        color:
                                                            "#263746",
                                                        lineHeight:
                                                            "1.3",
                                                        overflow:
                                                            "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    {
                                                        elemento.nome
                                                    }
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "5px",
                                                        fontSize:
                                                            "11px",
                                                        color:
                                                            "#9a8d7d",
                                                    }}
                                                >
                                                    Elemento
                                                    3D
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap:
                                                        "8px",
                                                    flexShrink:
                                                        0,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            "700",
                                                        color:
                                                            ativo
                                                                ? "#277542"
                                                                : "#777",
                                                        background:
                                                            ativo
                                                                ? "#e5f4e9"
                                                                : "#eeeeee",
                                                        border:
                                                            ativo
                                                                ? "1px solid #cde7d4"
                                                                : "1px solid #dedede",
                                                        padding:
                                                            "4px 8px",
                                                        borderRadius:
                                                            "20px",
                                                    }}
                                                >
                                                    {ativo
                                                        ? "Ativado"
                                                        : "Desativado"}
                                                </span>

                                                <Switch
                                                    checked={
                                                        ativo
                                                    }
                                                    onChange={(
                                                        checked
                                                    ) =>
                                                        alterarStatus(
                                                            elemento,
                                                            checked
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )
                    )}
                </div>
            </Card>
        </div>
    );
}