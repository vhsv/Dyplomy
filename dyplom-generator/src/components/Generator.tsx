interface FieldData {
  [key: string]: string[]
}
type GeneratorProps =
{
    fileName: string
    selectedFields: string[]
    dataCount: number
    generating: boolean
    previewFirst: () => void
    setStep: React.Dispatch<React.SetStateAction<number>>;
    generateAll: () => void
    setBulkData: React.Dispatch<React.SetStateAction<string>>;
    setFieldData: React.Dispatch<React.SetStateAction<FieldData>>;
    setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
    setFileName: React.Dispatch<React.SetStateAction<string>>;
    setFileContent: React.Dispatch<React.SetStateAction<string>>;

}

function Generator({fileName, selectedFields, dataCount,generating, previewFirst, setStep, generateAll, setBulkData, setFieldData, setSelectedFields, setFileName, setFileContent} : GeneratorProps)
{
    return(
        <div className="generator">
            <h2>Krok 4: Generuj dyplomy</h2>
            
            <div className="summary">
              <h3>Podsumowanie:</h3>
              <p>📄 Szablon: <strong>{fileName}</strong></p>
              <p>🏷️ Pola: <strong>{selectedFields.join(', ')}</strong></p>
              <p>📊 Liczba dyplomów: <strong>{dataCount}</strong></p>
            </div>

            <div className="preview-section">
              <h3>Podgląd pierwszego dyplomu:</h3>
              <button onClick={previewFirst} className="btn-preview">
                👁️ Pokaż podgląd
              </button>
            </div>

            <div className="actions">
              <button onClick={() => setStep(3)} className="btn-secondary">
                ← Wstecz
              </button>
              <button 
                onClick={generateAll} 
                className="btn-generate"
                disabled={generating || dataCount === 0}
              >
                {generating ? '⏳ Generowanie...' : '📦 Generuj ZIP z dyplomami'}
              </button>
              <button onClick={() => {
                setStep(1)
                setFileContent('')
                setFileName('')
                setSelectedFields([])
                setFieldData({})
                setBulkData('')
              }} className="btn-reset">
                🔄 Zacznij od nowa
              </button>
            </div>
          </div>
    )
}
export default Generator