"use client";

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import { Canvas, useThree } from "@react-three/fiber";

import {
  useGLTF,
  OrbitControls,
  Html,
  TransformControls,
} from "@react-three/drei";

import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

// --- INTERFACE DE TEMA PARAMETRIZÁVEL ---
export interface GLBStudioTheme {
  containerBg?: string;
  headerBg?: string;
  viewerBg?: string;
  sidebarBg?: string;
  cardBg?: string;

  containerBorder?: string;
  headerBorder?: string;
  viewerBorder?: string;
  sidebarBorder?: string;
  cardBorder?: string;

  textPrimary?: string;
  textSecondary?: string;
  textMuted?: string;
  accentViewer?: string;
  accentSidebar?: string;

  btnPrimaryBg?: string;
  btnPrimaryBorder?: string;
  btnSecondaryBg?: string;
  btnSecondaryBorder?: string;
  btnSaveBg?: string;
  btnSaveBorder?: string;
  btnDeleteBg?: string;
  btnDeleteBorder?: string;

  toastBg?: string;
  toastText?: string;
  fontFamily?: string;
}

const DEFAULT_THEME: Required<GLBStudioTheme> = {
  containerBg: "#f4f0e8",
  headerBg: "#ffffff",
  viewerBg: "#eef3f6",
  sidebarBg: "#f8f6f1",
  cardBg: "#ffffff",

  containerBorder: "#d9d2c5",
  headerBorder: "#e2ddd4",
  viewerBorder: "#0b5a8f",
  sidebarBorder: "#0b5a8f",
  cardBorder: "#ddd7cd",

  textPrimary: "#fcfcfc",
  textSecondary: "#35516a",
  textMuted: "#6d7d89",
  accentViewer: "#0b5a8f",
  accentSidebar: "#0b5a8f",

  btnPrimaryBg: "#0b5a8f",
  btnPrimaryBorder: "#0b5a8f",
  btnSecondaryBg: "#f1eee8",
  btnSecondaryBorder: "#d2cbc0",
  btnSaveBg: "#0b5a8f",
  btnSaveBorder: "#0b5a8f",
  btnDeleteBg: "#de5b0a",
  btnDeleteBorder: "#de5b0a",

  toastBg: "#0b5a8f",
  toastText: "#ffffff",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const ThemeContext = createContext<Required<GLBStudioTheme>>(DEFAULT_THEME);

const useStudioTheme = () => useContext(ThemeContext);

// --- FILTRO DE WARNINGS ---
if (typeof window !== "undefined") {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }

    originalWarn(...args);
  };
}

// --- ASSET ANEXADO ---
export interface AttachedAsset {
  id: string;
  src: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// --- PROPS ---
export interface GLBStudioProps {
  mainGlbSrc?: string;
  availableAssets?: string[];
  width?: string | number;
  height?: string | number;
  theme?: GLBStudioTheme;
  onSave?: (blob: Blob, fileName: string) => void;
}

type TransformMode = "translate" | "rotate";

// Estado compartilhado com a tela "Elementos".
// A tela Elementos grava aqui quais modelos estão ativos.
const ELEMENTOS_STORAGE_KEY = "senai-elementos-habilitados";
const ELEMENTOS_STATUS_EVENT = "elementos-status-alterado";

function getAssetStatusKeys(src: string): string[] {
  const keys = [src];

  try {
    keys.push(normalizeAssetUrl(src));
  } catch {
    // Mantém a chave original se a URL não puder ser normalizada.
  }

  const fileName = extractFileName(src);
  if (fileName) {
    keys.push(fileName);
  }

  return Array.from(new Set(keys.filter(Boolean)));
}

function isAssetEnabledFromStorage(
  src: string,
  status: Record<string, boolean>,
): boolean {
  // Se o elemento nunca foi configurado na tela Elementos, ele continua ativo.
  const keys = getAssetStatusKeys(src);

  for (const key of keys) {
    if (status[key] !== undefined) {
      return status[key] !== false;
    }
  }

  // Também compara pelo nome do arquivo para lidar com #, %23 e caminhos diferentes.
  const fileName = extractFileName(src).toLowerCase();

  for (const [savedKey, enabled] of Object.entries(status)) {
    if (extractFileName(savedKey).toLowerCase() === fileName) {
      return enabled !== false;
    }
  }

  return true;
}

function readElementosStatus(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const saved = window.localStorage.getItem(ELEMENTOS_STORAGE_KEY);
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// ============================================================
// CORREÇÃO IMPORTANTE PARA ARQUIVOS COM # NO NOME
// ============================================================

// --- EXTRAÇÃO DO NOME DO ARQUIVO ---
function extractFileName(src: string): string {
  if (!src) return "cenario.glb";

  // Blob URLs usam o # para armazenar o nome original.
  if (src.startsWith("blob:") && src.includes("#")) {
    const hashPart = src.substring(src.indexOf("#") + 1);

    if (hashPart) {
      try {
        return decodeURIComponent(hashPart);
      } catch {
        return hashPart;
      }
    }
  }

  const glbIndex = src.toLowerCase().indexOf(".glb");

  if (glbIndex !== -1) {
    const filePath = src.substring(0, glbIndex + 4);

    const parts = filePath.split("/");
    const lastPart = parts[parts.length - 1];

    try {
      return decodeURIComponent(lastPart);
    } catch {
      return lastPart;
    }
  }

  try {
    const urlObj = new URL(
      src,
      typeof window !== "undefined" ? window.location.href : "http://localhost",
    );

    const pathname = urlObj.pathname;
    const name = pathname.split("/").pop();

    if (name) {
      try {
        return decodeURIComponent(name);
      } catch {
        return name;
      }
    }
  } catch {
    // Não é uma URL válida.
  }

  const parts = src.split("/");
  const lastPart = parts[parts.length - 1];

  if (lastPart) {
    try {
      return decodeURIComponent(lastPart.split("?")[0]);
    } catch {
      return lastPart.split("?")[0];
    }
  }

  return "cenario.glb";
}

// --- NORMALIZAÇÃO DA URL DOS ASSETS ---
function normalizeAssetUrl(src: string): string {
  if (!src) return src;

  /*
   * Blob URLs precisam continuar com o # que guarda
   * o nome original.
   */
  if (src.startsWith("blob:")) {
    return src;
  }

  const lowerSrc = src.toLowerCase();

  /*
   * Procuramos .glb antes de interpretar a URL.
   *
   * Assim:
   *
   * /assets/.../Arm#U00e1rio.glb
   *
   * vira:
   *
   * /assets/.../Arm%23U00e1rio.glb
   */
  const glbIndex = lowerSrc.indexOf(".glb");

  if (glbIndex === -1) {
    return src;
  }

  const filePart = src.substring(0, glbIndex + 4);

  const suffix = src.substring(glbIndex + 4);

  const encodePath = (path: string) =>
    path
      .split("/")
      .map((segment) => {
        if (!segment) return "";

        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");

  /*
   * URLs absolutas:
   * http://localhost:3000/assets/...
   */
  const absoluteMatch = filePart.match(/^(https?:\/\/[^/]+)(\/.*)$/i);

  if (absoluteMatch) {
    return absoluteMatch[1] + encodePath(absoluteMatch[2]) + suffix;
  }

  /*
   * URLs relativas:
   * /assets/...
   * assets/...
   */
  return encodePath(filePart) + suffix;
}

// --- INDICADOR DE CARREGAMENTO ---
function CanvasLoader({ message }: { message: string }) {
  const theme = useStudioTheme();

  return (
    <Html center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          color: theme.textPrimary,
          padding: "8px 16px",
          borderRadius: "6px",
          border: `1px solid ${theme.cardBorder}`,
          fontSize: "12px",
          whiteSpace: "nowrap",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            border: `2px solid ${theme.viewerBorder}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        <span>{message}</span>
      </div>
    </Html>
  );
}

// --- MINIATURA DO ASSET ---
function MiniPreview({ src }: { src: string }) {
  /*
   * CORREÇÃO:
   * useGLTF não recebe mais diretamente:
   *
   * /assets/.../Arm#U00e1rio.glb
   *
   * Ele recebe:
   *
   * /assets/.../Arm%23U00e1rio.glb
   */
  const normalizedSrc = normalizeAssetUrl(src);

  const { scene } = useGLTF(normalizedSrc);

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);

    const center = box.getCenter(new THREE.Vector3());

    cloned.position.sub(center);

    return cloned;
  }, [scene]);

  return <primitive object={normalizedScene} />;
}

// --- ITEM DA MINIATURA ---
function ThumbnailItem({ src }: { src: string }) {
  const fileName = extractFileName(src);

  const theme = useStudioTheme();

  const normalizedSrc = normalizeAssetUrl(src);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("glbPath", normalizedSrc);
      }}
      style={{
        width: "100%",
        backgroundColor: theme.cardBg,
        borderRadius: "8px",
        border: `2px solid ${theme.cardBorder}`,
        cursor: "grab",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: "110px",
          width: "100%",
          backgroundColor: theme.viewerBg,
          position: "relative",
        }}
      >
        <Canvas
          camera={{
            position: [0, 1, 2.2],
            fov: 45,
          }}
        >
          <ambientLight intensity={1.5} />

          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          <Suspense fallback={<CanvasLoader message="Carregando..." />}>
            <MiniPreview src={src} />
          </Suspense>
        </Canvas>
      </div>

      <div
        style={{
          padding: "8px 12px",
          backgroundColor: theme.cardBg,
          borderTop: `1px solid ${theme.headerBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          title={fileName}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: theme.textSecondary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "70%",
          }}
        >
          {fileName}
        </span>

        <span
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            color: theme.accentSidebar,
            backgroundColor: `${theme.accentSidebar}26`,
            padding: "2px 6px",
            borderRadius: "4px",
            border: `1px solid ${theme.accentSidebar}66`,
          }}
        >
          ARRASTAR
        </span>
      </div>
    </div>
  );
}

// --- PAINEL DIREITO DE ASSETS ---
export function GLBThumbnailList({
  items,
  onLoadFolderClick,
}: {
  items: string[];
  onLoadFolderClick: () => void;
}) {
  const theme = useStudioTheme();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.sidebarBg,
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "12px",
          backgroundColor: theme.cardBg,
          borderBottom: `2px solid ${theme.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: "bold",
              color: theme.accentSidebar,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ASSETS (30%)
          </h3>

          <span
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: theme.textMuted,
              backgroundColor: theme.btnSecondaryBg,
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {items.length} itens
          </span>
        </div>

        <button
          onClick={onLoadFolderClick}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: `1px dashed ${theme.sidebarBorder}`,
            backgroundColor: `${theme.sidebarBorder}1A`,
            color: theme.accentSidebar,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          📁 Carregar Pasta de Assets
        </button>
      </div>

      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: theme.textMuted,
              textAlign: "center",
              fontSize: "12px",
              gap: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
              }}
            >
              Nenhum asset carregado.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "11px",
                opacity: 0.7,
              }}
            >
              Clique no botão acima para selecionar uma pasta com arquivos .glb
            </p>
          </div>
        ) : (
          items.map((src, index) => (
            <ThumbnailItem key={`${src}-${index}`} src={src} />
          ))
        )}
      </div>
    </div>
  );
}

// --- MODELO PRINCIPAL ---
function MainModel({
  src,
  availableAssets = [],
  onLoaded,
  onRestoreAssets,
}: {
  src: string;
  availableAssets?: string[];
  onLoaded: (box: THREE.Box3) => void;
  onRestoreAssets: (assets: AttachedAsset[]) => void;
}) {
  const normalizedMainSrc = normalizeAssetUrl(src);

  const { scene } = useGLTF(normalizedMainSrc);

  const { normalizedScene, restoredAssets, adjustedBox } = useMemo(() => {
    const cloned = scene.clone(true);

    const restored: AttachedAsset[] = [];

    const nodesToRemove: THREE.Object3D[] = [];

    cloned.traverse((child) => {
      if (
        child.userData &&
        child.userData.isAttachedAsset &&
        child.userData.assetData
      ) {
        const data = child.userData.assetData;

        const originalSrc = data.src || "";

        const assetFileName = data.fileName || extractFileName(originalSrc);

        let validSrc = normalizeAssetUrl(originalSrc);

        /*
         * Quando o cenário salvo foi exportado,
         * o src pode estar como Blob URL.
         *
         * Nesse caso procuramos o mesmo arquivo
         * dentro dos assets disponíveis.
         */
        if (originalSrc.startsWith("blob:")) {
          const matchedAsset = availableAssets.find(
            (item) =>
              extractFileName(item).toLowerCase() ===
              assetFileName.toLowerCase(),
          );

          if (matchedAsset) {
            validSrc = normalizeAssetUrl(matchedAsset);
          } else {
            return;
          }
        }

        restored.push({
          id:
            data.id ||
            `restored_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 7)}`,

          src: validSrc,

          position: data.position || [0, 0, 0],

          rotation: data.rotation || [0, 0, 0],

          scale: data.scale || [1, 1, 1],
        });

        nodesToRemove.push(child);
      }
    });

    nodesToRemove.forEach((node) => {
      if (node.parent) {
        node.parent.remove(node);
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);

    const center = box.getCenter(new THREE.Vector3());

    cloned.position.x = -center.x;

    cloned.position.y = -box.min.y;

    cloned.position.z = -center.z;

    const finalBox = new THREE.Box3().setFromObject(cloned);

    return {
      normalizedScene: cloned,
      restoredAssets: restored,
      adjustedBox: finalBox,
    };
  }, [scene, availableAssets]);

  useEffect(() => {
    onLoaded(adjustedBox);

    onRestoreAssets(restoredAssets);
  }, [adjustedBox, restoredAssets, onLoaded, onRestoreAssets]);

  return <primitive object={normalizedScene} />;
}

// --- ENQUADRADOR DA CÂMERA ---
function AutoFitCamera({
  box,
  orbitRef,
}: {
  box: THREE.Box3 | null;
  orbitRef: React.RefObject<any>;
}) {
  const { camera } = useThree();

  const fittedRef = useRef(false);

  useEffect(() => {
    if (box && !fittedRef.current) {
      fittedRef.current = true;

      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z) || 10;

      const perspCamera = camera as THREE.PerspectiveCamera;

      const fov = (perspCamera.fov || 45) * (Math.PI / 180);

      const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

      camera.position.set(0, maxDim * 0.4, distance);

      if (orbitRef.current) {
        orbitRef.current.target.set(0, maxDim * 0.1, 0);

        orbitRef.current.update();
      } else {
        camera.lookAt(0, maxDim * 0.1, 0);
      }

      camera.updateProjectionMatrix();
    }
  }, [box, camera, orbitRef]);

  return null;
}

// --- COMPONENTE INTERATIVO DO ASSET ---
function InteractiveAsset({
  asset,
  isSelected,
  onSelect,
  transformMode,
  orbitControlsRef,
  mainBox,
  onUpdateTransform,
}: {
  asset: AttachedAsset;
  isSelected: boolean;
  onSelect: (id: string, forceMode?: TransformMode) => void;
  transformMode: TransformMode;
  orbitControlsRef: React.RefObject<any>;
  mainBox: THREE.Box3 | null;
  onUpdateTransform: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number],
  ) => void;
}) {
  /*
   * CORREÇÃO:
   * Normaliza o caminho antes de passar para useGLTF.
   */
  const normalizedAssetSrc = normalizeAssetUrl(asset.src);

  const { scene } = useGLTF(normalizedAssetSrc);

  const [groupNode, setGroupNode] = useState<THREE.Group | null>(null);

  const transformRef = useRef<any>(null);

  const { clonedWrapper, initialScale } = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.position.set(0, 0, 0);

    cloned.rotation.set(0, 0, 0);

    cloned.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(cloned);

    const center = box.getCenter(new THREE.Vector3());

    cloned.position.set(-center.x, -center.y, -center.z);

    const wrapper = new THREE.Group();

    wrapper.add(cloned);

    const initialScale: [number, number, number] = [1, 1, 1];

    return {
      clonedWrapper: wrapper,
      initialScale,
    };
  }, [scene]);

  const currentScale = asset.scale || initialScale;

  const currentRotation = asset.rotation || [0, 0, 0];

  useEffect(() => {
    if (groupNode) {
      groupNode.userData = {
        isAttachedAsset: true,

        assetData: {
          id: asset.id,

          src: asset.src,

          fileName: extractFileName(asset.src),

          position: asset.position,

          rotation: currentRotation,

          scale: currentScale,
        },
      };
    }
  }, [
    groupNode,
    asset.id,
    asset.src,
    asset.position,
    currentRotation,
    currentScale,
  ]);

  useEffect(() => {
    const controls = transformRef.current;

    if (!controls) return;

    const handleDragging = (e: any) => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !e.value;
      }

      if (!e.value && groupNode) {
        const p = groupNode.position;

        const r = groupNode.rotation;

        const s = groupNode.scale;

        onUpdateTransform(
          asset.id,
          [p.x, p.y, p.z],
          [r.x, r.y, r.z],
          [s.x, s.y, s.z],
        );
      }
    };

    controls.addEventListener("dragging-changed", handleDragging);

    return () =>
      controls.removeEventListener("dragging-changed", handleDragging);
  }, [isSelected, orbitControlsRef, asset.id, onUpdateTransform, groupNode]);

  const handleSelectMe = (e: any) => {
    e.stopPropagation();
    onSelect(asset.id);
  };

  return (
    <>
      <group
        ref={setGroupNode}
        position={asset.position}
        rotation={currentRotation}
        scale={currentScale}
        onClick={handleSelectMe}
        onPointerDown={handleSelectMe}
        onDoubleClick={(e) => {
          e.stopPropagation();

          onSelect(asset.id, "translate");
        }}
      >
        <primitive object={clonedWrapper} />
      </group>

      {isSelected && groupNode && (
        <TransformControls
          ref={transformRef}
          object={groupNode}
          mode={transformMode}
        />
      )}
    </>
  );
}

// --- CONTROLLER DE DRAG & DROP ---
function CanvasDropController({
  onDropAsset,
  mainSceneGroupRef,
}: {
  onDropAsset: (src: string, position: [number, number, number]) => void;

  mainSceneGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const domElement = gl.domElement;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();

      let src = e.dataTransfer?.getData("glbPath");

      if (!src) return;

      /*
       * Garante novamente que um asset com # no nome
       * será enviado para o loader com URL segura.
       */
      src = normalizeAssetUrl(src);

      const rect = domElement.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;

      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const raycaster = new THREE.Raycaster();

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      let dropPos: [number, number, number] = [0, 0, 0];

      if (mainSceneGroupRef.current) {
        const intersects = raycaster.intersectObjects(
          mainSceneGroupRef.current.children,
          true,
        );

        if (intersects.length > 0) {
          const pt = intersects[0].point;

          dropPos = [pt.x, pt.y, pt.z];
        }
      }

      onDropAsset(src, dropPos);
    };

    domElement.addEventListener("dragover", handleDragOver);

    domElement.addEventListener("drop", handleDrop);

    return () => {
      domElement.removeEventListener("dragover", handleDragOver);

      domElement.removeEventListener("drop", handleDrop);
    };
  }, [camera, gl, onDropAsset, mainSceneGroupRef]);

  return null;
}

// --- VISUALIZADOR DA CENA ---
interface MainGLBViewerProps {
  mainGlbSrc: string;
  availableAssets?: string[];
  attachedAssets: AttachedAsset[];
  selectedId: string | null;
  transformMode: TransformMode;

  onSelectAsset: (id: string | null, forceMode?: TransformMode) => void;

  onDropAsset: (src: string, position: [number, number, number]) => void;

  onRestoreAssets: (assets: AttachedAsset[]) => void;

  onUpdateTransform: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number],
  ) => void;
}

export const MainGLBViewer = forwardRef<
  {
    getSceneGroup: () => THREE.Group | null;
  },
  MainGLBViewerProps
>(
  (
    {
      mainGlbSrc,
      availableAssets = [],
      attachedAssets,
      selectedId,
      transformMode,
      onSelectAsset,
      onDropAsset,
      onRestoreAssets,
      onUpdateTransform,
    },
    ref,
  ) => {
    const groupRef = useRef<THREE.Group>(null);

    const orbitRef = useRef<any>(null);

    const [mainBox, setMainBox] = useState<THREE.Box3 | null>(null);

    const theme = useStudioTheme();

    useImperativeHandle(ref, () => ({
      getSceneGroup: () => groupRef.current,
    }));

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.viewerBg,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px",
            backgroundColor: theme.cardBg,
            borderBottom: `2px solid ${theme.viewerBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: theme.accentViewer,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            CENÁRIO 3D (70%)
          </span>

          <span
            style={{
              fontSize: "11px",
              color: theme.textMuted,
            }}
          >
            Clique no item para movê-lo | Clique no fundo para desselecionar
          </span>
        </div>

        <div
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <Canvas
            camera={{
              position: [0, 10, 20],
              fov: 45,
            }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                onSelectAsset(null);
              }
            }}
          >
            <ambientLight intensity={1.5} />

            <directionalLight position={[10, 20, 15]} intensity={1.8} />

            <group ref={groupRef}>
              <Suspense
                fallback={<CanvasLoader message="Carregando cenário..." />}
              >
                <MainModel
                  key={mainGlbSrc}
                  src={mainGlbSrc}
                  availableAssets={availableAssets}
                  onLoaded={setMainBox}
                  onRestoreAssets={onRestoreAssets}
                />

                {attachedAssets.map((asset) => (
                  <InteractiveAsset
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedId === asset.id}
                    onSelect={onSelectAsset}
                    transformMode={transformMode}
                    orbitControlsRef={orbitRef}
                    mainBox={mainBox}
                    onUpdateTransform={onUpdateTransform}
                  />
                ))}
              </Suspense>
            </group>

            <AutoFitCamera box={mainBox} orbitRef={orbitRef} />

            <CanvasDropController
              onDropAsset={onDropAsset}
              mainSceneGroupRef={groupRef}
            />

            <OrbitControls
              ref={orbitRef}
              makeDefault
              rotateSpeed={0.4}
              zoomSpeed={0.5}
              panSpeed={0.4}
            />
          </Canvas>
        </div>
      </div>
    );
  },
);

MainGLBViewer.displayName = "MainGLBViewer";

// --- COMPONENTE PRINCIPAL ---
export default function GLBStudio({
  mainGlbSrc,
  availableAssets = [],
  width,
  height = "650px",
  theme: customTheme,
  onSave,
}: GLBStudioProps) {
  const activeTheme = useMemo<Required<GLBStudioTheme>>(() => {
    return {
      ...DEFAULT_THEME,
      ...customTheme,
    };
  }, [customTheme]);

  const [activeGlbSrc, setActiveGlbSrc] = useState<string | null>(
    mainGlbSrc || null,
  );

  const [fileName, setFileName] = useState<string>(
    mainGlbSrc ? extractFileName(mainGlbSrc) : "Nenhum arquivo",
  );

  const [fileHandle, setFileHandle] = useState<any>(null);

  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [assetsList, setAssetsList] = useState<string[]>(availableAssets);

  const [attachedAssets, setAttachedAssets] = useState<AttachedAsset[]>([]);

  // Estado dos elementos definido na tela "Elementos".
  const [elementosStatus, setElementosStatus] = useState<
    Record<string, boolean>
  >({});

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");

  const viewerRef = useRef<{
    getSceneGroup: () => THREE.Group | null;
  }>(null);

  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mainGlbSrc) {
      setActiveGlbSrc(mainGlbSrc);

      setFileName(extractFileName(mainGlbSrc));
    }
  }, [mainGlbSrc]);

  useEffect(() => {
    if (availableAssets.length > 0) {
      setAssetsList(availableAssets);
    }
  }, [availableAssets]);

  // --- SINCRONIZAÇÃO COM A TELA ELEMENTOS ---
  useEffect(() => {
    const atualizarStatus = () => {
      setElementosStatus(readElementosStatus());
    };

    atualizarStatus();

    // Mesmo navegador/aba: a tela Elementos dispara este evento imediatamente.
    window.addEventListener(ELEMENTOS_STATUS_EVENT, atualizarStatus);

    // Outras abas/janelas: o evento storage mantém o 3D sincronizado também.
    window.addEventListener("storage", atualizarStatus);

    return () => {
      window.removeEventListener(ELEMENTOS_STATUS_EVENT, atualizarStatus);

      window.removeEventListener("storage", atualizarStatus);
    };
  }, []);

  const isAssetEnabled = useCallback(
    (src: string) => isAssetEnabledFromStorage(src, elementosStatus),
    [elementosStatus],
  );

  // Somente elementos ativos ficam disponíveis para arrastar para a sala.
  const activeAssetsList = useMemo(
    () => assetsList.filter((src) => isAssetEnabled(src)),
    [assetsList, isAssetEnabled],
  );

  // Elementos desativados desaparecem do cenário, mas continuam salvos em attachedAssets.
  // Assim, quando forem ativados novamente, voltam para a mesma posição.
  const visibleAttachedAssets = useMemo(
    () => attachedAssets.filter((asset) => isAssetEnabled(asset.src)),
    [attachedAssets, isAssetEnabled],
  );

  // Se um elemento selecionado for desativado, remove apenas a seleção visual.
  useEffect(() => {
    if (
      selectedId &&
      !visibleAttachedAssets.some((asset) => asset.id === selectedId)
    ) {
      setSelectedId(null);
    }
  }, [selectedId, visibleAttachedAssets]);

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não executar atalhos enquanto estiver digitando
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      ) {
        return;
      }

      // T = modo mover
      if (e.key === "t" || e.key === "T") {
        setTransformMode("translate");
        return;
      }

      // R = modo rotacionar
      if (e.key === "r" || e.key === "R") {
        setTransformMode("rotate");
        return;
      }

      // Delete ou Backspace = excluir elemento selecionado
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();

        setAttachedAssets((prev) =>
          prev.filter((item) => item.id !== selectedId),
        );

        setSelectedId(null);

        return;
      }

      // Se nenhum elemento estiver selecionado, não faz nada
      if (!selectedId) {
        return;
      }

      // Verifica se pressionou alguma seta
      const isArrow =
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";

      if (!isArrow) {
        return;
      }

      // Impede a página de rolar ao usar as setas
      e.preventDefault();

      // Movimento normal = 0.2
      // Com Shift = 1
      const step = e.shiftKey ? 0.05 : 0.2;

      setAttachedAssets((prev) =>
        prev.map((item) => {
          // Só movimenta o elemento selecionado
          if (item.id !== selectedId) {
            return item;
          }

          const [x, y, z] = item.position;

          let newX = x;
          let newY = y;
          let newZ = z;

          // =========================
          // SETA PARA CIMA
          // =========================
          if (e.key === "ArrowUp") {
            if (e.shiftKey) {
              // SHIFT + ↑ = SOBE
              newY += step;
            } else {
              // ↑ = MOVE PARA FRENTE
              newZ -= step;
            }
          }

          // =========================
          // SETA PARA BAIXO
          // =========================
          if (e.key === "ArrowDown") {
            if (e.shiftKey) {
              // SHIFT + ↓ = DESCE
              newY -= step;
            } else {
              // ↓ = MOVE PARA TRÁS
              newZ += step;
            }
          }

          // =========================
          // SETA PARA ESQUERDA
          // =========================
          if (e.key === "ArrowLeft") {
            // ← = MOVE PARA ESQUERDA
            newX -= step;
          }

          // =========================
          // SETA PARA DIREITA
          // =========================
          if (e.key === "ArrowRight") {
            // → = MOVE PARA DIREITA
            newX += step;
          }

          return {
            ...item,
            position: [newX, newY, newZ],
          };
        }),
      );
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId]);

  // --- ABRIR CENÁRIO ---
  const handleOpenScenarioFile = async () => {
    if ("showOpenFilePicker" in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Arquivos 3D GLB",
              accept: {
                "model/gltf-binary": [".glb"],
              },
            },
          ],
        });

        const file = await handle.getFile();

        const url =
          URL.createObjectURL(file) + "#" + encodeURIComponent(file.name);

        setFileHandle(handle);

        setFileName(file.name);

        setAttachedAssets([]);

        setSelectedId(null);

        setActiveGlbSrc(url);

        setSaveToast(`Cenário carregado: "${file.name}"`);

        setTimeout(() => setSaveToast(null), 3000);
      } catch {
        // Cancelado pelo usuário.
      }
    } else {
      const input = document.createElement("input");

      input.type = "file";

      input.accept = ".glb";

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];

        if (file) {
          const url =
            URL.createObjectURL(file) + "#" + encodeURIComponent(file.name);

          setFileHandle(null);

          setFileName(file.name);

          setAttachedAssets([]);

          setSelectedId(null);

          setActiveGlbSrc(url);
        }
      };

      input.click();
    }
  };

  // --- PASTA DE ASSETS ---
  const handleFolderSelectClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const glbFiles = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".glb"),
    );

    if (glbFiles.length === 0) {
      alert("Nenhum arquivo .glb foi encontrado na pasta selecionada.");

      return;
    }

    /*
     * Mantém o nome original no Blob URL,
     * mas quando esse valor for usado pelo
     * useGLTF ele será normalizado.
     */
    const newAssetUrls = glbFiles.map(
      (file) => URL.createObjectURL(file) + "#" + encodeURIComponent(file.name),
    );

    setAssetsList(newAssetUrls);

    setSaveToast(`✓ ${glbFiles.length} asset(s) carregado(s)!`);

    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDropAsset = (src: string, position: [number, number, number]) => {
    const newId = `asset_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const newAsset: AttachedAsset = {
      id: newId,

      src: normalizeAssetUrl(src),

      position,

      rotation: [0, 0, 0],
    };

    setAttachedAssets((prev) => [...prev, newAsset]);

    setSelectedId(newId);

    setTransformMode("translate");
  };

  const handleRestoreAssets = useCallback((restored: AttachedAsset[]) => {
    setAttachedAssets(restored);
  }, []);

  const handleSelectAsset = (id: string | null, forceMode?: TransformMode) => {
    setSelectedId(id);

    if (forceMode) {
      setTransformMode(forceMode);
    }
  };

  const handleUpdateTransform = (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number],
  ) => {
    setAttachedAssets((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              position,
              rotation,
              scale,
            }
          : item,
      ),
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;

    setAttachedAssets((prev) => prev.filter((item) => item.id !== selectedId));

    setSelectedId(null);
  };

  // --- SOBREESCREVER / SALVAR ---
  const handleSaveOverwrite = async () => {
    const group = viewerRef.current?.getSceneGroup();

    if (!group) return;

    setSelectedId(null);

    setTimeout(async () => {
      const exporter = new GLTFExporter();

      exporter.parse(
        group,
        async (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], {
            type: "application/octet-stream",
          });

          if (fileHandle && "createWritable" in fileHandle) {
            try {
              const writable = await fileHandle.createWritable();

              await writable.write(blob);

              await writable.close();

              setSaveToast(`✓ Arquivo "${fileName}" sobreescrito no disco!`);

              if (onSave) {
                onSave(blob, fileName);
              }

              setTimeout(() => setSaveToast(null), 4000);

              return;
            } catch (err) {
              console.error("Falha ao escrever diretamente no arquivo:", err);
            }
          }

          if ("showSaveFilePicker" in window) {
            try {
              const handle = await (window as any).showSaveFilePicker({
                suggestedName: fileName,

                types: [
                  {
                    description: "Arquivo GLB",

                    accept: {
                      "model/gltf-binary": [".glb"],
                    },
                  },
                ],
              });

              const writable = await handle.createWritable();

              await writable.write(blob);

              await writable.close();

              setFileHandle(handle);

              setFileName(handle.name);

              setSaveToast(`✓ Salvo em "${handle.name}" com sucesso!`);

              if (onSave) {
                onSave(blob, handle.name);
              }

              setTimeout(() => setSaveToast(null), 4000);

              return;
            } catch {
              return;
            }
          }

          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");

          link.href = url;

          link.download = fileName;

          link.click();

          URL.revokeObjectURL(url);

          setSaveToast(`✓ Salvo como "${fileName}"!`);

          if (onSave) {
            onSave(blob, fileName);
          }

          setTimeout(() => setSaveToast(null), 4000);
        },

        (error) => console.error("Erro ao exportar GLB:", error),

        {
          binary: true,
        },
      );
    }, 100);
  };

  return (
    <ThemeContext.Provider value={activeTheme}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width:
            width !== undefined
              ? typeof width === "number"
                ? `${width}px`
                : width
              : "100%",
          height: typeof height === "number" ? `${height}px` : height,
          border: `1px solid ${activeTheme.containerBorder}`,
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(23,50,77,0.08)",
          backgroundColor: activeTheme.containerBg,
          padding: "14px",
          gap: "14px",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily: activeTheme.fontFamily,
          position: "relative",
        }}
      >
        <input
          type="file"
          ref={folderInputRef}
          style={{
            display: "none",
          }}
          onChange={handleFolderChange}
          {...({
            webkitdirectory: "",
            directory: "",
            multiple: true,
          } as any)}
        />

        {/* NOTIFICAÇÃO DE SALVAMENTO */}
        {saveToast && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: activeTheme.toastBg,
              color: activeTheme.toastText,
              padding: "8px 18px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 6px 18px rgba(23,50,77,0.16)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            {saveToast}
          </div>
        )}

        {/* CABEÇALHO */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            backgroundColor: activeTheme.headerBg,
            border: `1px solid ${activeTheme.headerBorder}`,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(23,50,77,0.05)",
            flexShrink: 0,
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* FERRAMENTAS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: activeTheme.textMuted,
                marginRight: "4px",
              }}
            >
              FERRAMENTA:
            </span>

            {/* MOVER */}
            <button
              onClick={() => setTransformMode("translate")}
              disabled={!activeGlbSrc}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: `1px solid ${
                  transformMode === "translate"
                    ? activeTheme.btnPrimaryBorder
                    : activeTheme.btnSecondaryBorder
                }`,
                backgroundColor:
                  transformMode === "translate"
                    ? activeTheme.btnPrimaryBg
                    : activeTheme.btnSecondaryBg,
                color:
                  transformMode === "translate"
                    ? activeTheme.textPrimary
                    : activeTheme.textSecondary,
                cursor: activeGlbSrc ? "pointer" : "not-allowed",
                opacity: activeGlbSrc ? 1 : 0.5,
                transition: "all 0.15s ease",
              }}
            >
              ↔ Mover (T)
            </button>

            {/* ROTACIONAR */}
            <button
              onClick={() => setTransformMode("rotate")}
              disabled={!activeGlbSrc}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: `1px solid ${
                  transformMode === "rotate"
                    ? activeTheme.btnPrimaryBorder
                    : activeTheme.btnSecondaryBorder
                }`,
                backgroundColor:
                  transformMode === "rotate"
                    ? activeTheme.btnPrimaryBg
                    : activeTheme.btnSecondaryBg,
                color:
                  transformMode === "rotate"
                    ? activeTheme.textPrimary
                    : activeTheme.textSecondary,
                cursor: activeGlbSrc ? "pointer" : "not-allowed",
                opacity: activeGlbSrc ? 1 : 0.5,
                transition: "all 0.15s ease",
              }}
            >
              🔄 Rotacionar (R)
            </button>

            {/* DELETAR */}
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedId}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: `1px solid ${
                  selectedId
                    ? activeTheme.btnDeleteBorder
                    : activeTheme.btnSecondaryBorder
                }`,
                backgroundColor: selectedId
                  ? activeTheme.btnDeleteBg
                  : activeTheme.btnSecondaryBg,
                color: selectedId
                  ? activeTheme.textPrimary
                  : activeTheme.textMuted,
                cursor: selectedId ? "pointer" : "not-allowed",
                opacity: selectedId ? 1 : 0.5,
                transition: "all 0.15s ease",
              }}
            >
              🗑 Excluir Item (Del)
            </button>
          </div>

          {/* AÇÕES DE ARQUIVO */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleOpenScenarioFile}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: `1px solid ${activeTheme.btnSecondaryBorder}`,
                backgroundColor: activeTheme.btnSecondaryBg,
                color: activeTheme.textSecondary,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              📂 Abrir Cenário
            </button>

            {/* NOME */}
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: activeTheme.cardBg,
                borderRadius: "6px",
                border: `1px solid ${activeTheme.cardBorder}`,
                fontSize: "12px",
                fontWeight: 600,
                color: activeTheme.textSecondary,
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={fileName}
            >
              📄 {fileName}
            </div>

            {/* SALVAR */}
            <button
              onClick={handleSaveOverwrite}
              disabled={!activeGlbSrc}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "bold",
                borderRadius: "6px",
                border: `1px solid ${
                  activeGlbSrc
                    ? activeTheme.btnSaveBorder
                    : activeTheme.btnSecondaryBorder
                }`,
                backgroundColor: activeGlbSrc
                  ? activeTheme.btnSaveBg
                  : activeTheme.btnSecondaryBg,
                color: activeGlbSrc
                  ? activeTheme.textPrimary
                  : activeTheme.textMuted,
                cursor: activeGlbSrc ? "pointer" : "not-allowed",
                opacity: activeGlbSrc ? 1 : 0.5,
                transition: "all 0.15s ease",
              }}
            >
              💾 Salvar / Sobreescrever
            </button>
          </div>
        </header>

        {/* ÁREA PRINCIPAL */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: "12px",
            minHeight: 0,
            width: "100%",
          }}
        >
          {/* VIEWER 3D */}
          <div
            style={{
              flex: "7",
              height: "100%",
              borderRadius: "8px",
              border: `1px solid ${activeTheme.viewerBorder}`,
              boxShadow: "0 4px 14px rgba(23,50,77,0.08)",
              overflow: "hidden",
            }}
          >
            {activeGlbSrc ? (
              <MainGLBViewer
                ref={viewerRef}
                mainGlbSrc={activeGlbSrc}
                availableAssets={activeAssetsList}
                attachedAssets={visibleAttachedAssets}
                selectedId={selectedId}
                transformMode={transformMode}
                onSelectAsset={handleSelectAsset}
                onDropAsset={handleDropAsset}
                onRestoreAssets={handleRestoreAssets}
                onUpdateTransform={handleUpdateTransform}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: activeTheme.viewerBg,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: activeTheme.textMuted,
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                  }}
                >
                  🧊
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: activeTheme.textSecondary,
                  }}
                >
                  Nenhum cenário 3D carregado
                </div>

                <button
                  onClick={handleOpenScenarioFile}
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    border: `1px solid ${activeTheme.btnPrimaryBorder}`,
                    backgroundColor: activeTheme.btnPrimaryBg,
                    color: activeTheme.textPrimary,
                    cursor: "pointer",
                  }}
                >
                  Carregar Arquivo GLB
                </button>
              </div>
            )}
          </div>

          {/* PAINEL DE ASSETS */}
          <div
            style={{
              flex: "3",
              height: "100%",
              borderRadius: "8px",
              border: `1px solid ${activeTheme.sidebarBorder}`,
              boxShadow: "0 4px 14px rgba(23,50,77,0.08)",
              overflow: "hidden",
            }}
          >
            <GLBThumbnailList
              items={activeAssetsList}
              onLoadFolderClick={handleFolderSelectClick}
            />
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
