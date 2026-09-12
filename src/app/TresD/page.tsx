import fs from 'fs'
import path from 'path'
import GLBStudio from '@/componentes/glb-studio' // Ajuste o caminho de importação conforme sua estrutura

export default function Home() {
  // 1. Caminho físico da pasta dentro do projeto (dentro de "public")
  const elementosDir = path.join(process.cwd(), 'public', 'assets', 'animacoes', 'elementos')

  let availableAssets: string[] = []

  try {
    // 2. Lê os arquivos da pasta
    if (fs.existsSync(elementosDir)) {
      const files = fs.readdirSync(elementosDir)

      // 3. Filtra apenas arquivos .glb e monta a URL pública
      availableAssets = files
        .filter((file) => file.toLowerCase().endsWith('.glb'))
        .map((file) => `/assets/animacoes/elementos/${file}`)
    }
  } catch (error) {
    console.error('Erro ao ler a pasta de elementos:', error)
  }

  return (
    <main style={{ padding: '20px',
      display: "flex", 
        flexDirection: "column", 
        gap: "20px", 
        width: '1fr',
        height: '1fr',
     }}>

    <div>
          <h1 
            style={{ 
              fontSize: "32px", 
              color: "#004b85", 
              fontWeight: "bold", 
              margin: 0
            }}
          >
            Sala em 3D
          </h1>
          <p 
            style={{ 
              color: "#666", 
              margin: "4px 0 0 0", 
              fontSize: "14px" 
            }}
          >
            Visualize e organize os elementos da sala de aula.
          </p>
        </div>
      <div>
      <GLBStudio
        mainGlbSrc="/assets/animacoes/sala.glb"
        availableAssets={availableAssets}
      />
      </div>

    </main>
  )
}