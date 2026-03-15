import React, { useState } from 'react'
import * as mammoth from 'mammoth'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './App.css'

// Typy dla danych
interface FieldData {
  [key: string]: string[]
}

function App() {
  const [step, setStep] = useState<number>(1)
  const [fileContent, setFileContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [generating, setGenerating] = useState<boolean>(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [fieldData, setFieldData] = useState<FieldData>({})
  const [bulkData, setBulkData] = useState<string>('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  setFileName(file.name)
  setLoading(true)

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'docx') {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml(
        { arrayBuffer: arrayBuffer },
        {
          styleMap: [
            // Mapowanie stylów akapitów
            "p[style-name='Tytuł'] => h1",
            "p[style-name='Podtytuł'] => h2",
            "p[style-name='Nagłówek 1'] => h1",
            "p[style-name='Nagłówek 2'] => h2",
            "p[style-name='Nagłówek 3'] => h3",
            "p[style-name='Normalny'] => p",
            
            // Zachowanie formatowania tekstu
            "r[style-name='Pogrubienie'] => strong",
            "r[style-name='Kursywa'] => em",
            "r[style-name='Podkreślenie'] => u",
            
            // Mapowanie stylów dla dyplomu
            "p[style-name='Dyplom Tytuł'] => h1.diploma-title",
            "p[style-name='Dyplom Treść'] => p.diploma-content",
            "p[style-name='Dyplom Podpis'] => p.diploma-signature",
            
            // Dodaj style dla tabel jeśli są
            "table => table.diploma-table",
            "tr => tr",
            "td => td"
          ],
          includeDefaultStyleMap: true
          // Usunąłem preserveEmptyParagraphs
        }
      )
      
      // Dodajemy dodatkowe informacje o stylach
      const styledHtml = wrapWithDiplomaStyles(result.value)
      setFileContent(styledHtml)
      
      if (result.messages.length > 0) {
        console.log('Ostrzeżenia:', result.messages)
      }
    } 
    else if (fileExtension === 'txt') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const htmlContent = content
          .split('\n')
          .map(line => line.trim() ? `<p>${line}</p>` : '<p>&nbsp;</p>') // Zamiast preserveEmptyParagraphs
          .join('')
        setFileContent(htmlContent)
      }
      reader.readAsText(file)
    }
    else {
      alert('Nieobsługiwany format pliku. Użyj .docx lub .txt')
      setLoading(false)
      return
    }

    setStep(2)
  } catch (error) {
    console.error('Błąd podczas wczytywania pliku:', error)
    alert('Nie udało się wczytać pliku.')
  } finally {
    setLoading(false)
  }
}

// Funkcja dodająca style CSS dla dyplomu
const wrapWithDiplomaStyles = (html: string): string => {
  return `
    <div class="diploma-wrapper">
      <style>
        .diploma-wrapper {
          font-family: 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        .diploma-wrapper h1 {
          font-size: 36px;
          text-align: center;
          margin: 30px 0;
          font-weight: bold;
        }
        .diploma-wrapper h2 {
          font-size: 28px;
          margin: 25px 0;
        }
        .diploma-wrapper p {
          font-size: 18px;
          line-height: 1.6;
          margin: 15px 0;
        }
        .diploma-wrapper .diploma-title {
          font-size: 42px;
          color: #2c3e50;
          text-transform: uppercase;
          border-bottom: 3px solid gold;
          padding-bottom: 20px;
        }
        .diploma-wrapper .diploma-content {
          font-size: 22px;
          text-align: center;
          margin: 40px 0;
        }
        .diploma-wrapper .diploma-signature {
          font-size: 18px;
          text-align: right;
          margin-top: 60px;
          font-style: italic;
        }
        .diploma-wrapper table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .diploma-wrapper td {
          padding: 8px;
          border: 1px solid #ddd;
        }
      </style>
      ${html}
    </div>
  `
}

  const findPlaceholders = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = [...html.matchAll(regex)]
    return [...new Set(matches.map(match => match[1].trim()))]
  }

  const placeholders = findPlaceholders(fileContent)

  const parseBulkData = () => {
    if (!bulkData.trim()) {
      alert('Wprowadź dane!')
      return
    }

    const lines = bulkData.split('\n').filter(line => line.trim())
    const newData: FieldData = {}

    if (selectedFields.length === 1) {
      newData[selectedFields[0]] = lines.map(line => line.trim())
    } else {
      selectedFields.forEach(field => {
        newData[field] = []
      })

      lines.forEach(line => {
        const values = line.split(',').map(v => v.trim())
        selectedFields.forEach((field, index) => {
          if (values[index]) {
            newData[field].push(values[index])
          }
        })
      })
    }

    setFieldData(newData)
    setStep(4)
  }

  const replacePlaceholders = (html: string, values: {[key: string]: string}): string => {
    let result = html
    selectedFields.forEach(field => {
      const regex = new RegExp(`\\{\\{${field}\\}\\}`, 'g')
      result = result.replace(regex, values[field] || '')
    })
    return result
  }

  const generatePDF = (html: string, fileName: string): Promise<Blob> => {
    return new Promise((resolve) => {
      // Prosty generator PDF bez zewnętrznych bibliotek
      const styles = `
        <style>
          body { 
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            background: white;
          }
          .diploma {
            max-width: 1000px;
            margin: 0 auto;
            padding: 60px 40px;
            border: 15px solid gold;
            text-align: center;
          }
          h1 {
            color: #2c3e50;
            font-size: 48px;
            margin-bottom: 40px;
            text-transform: uppercase;
          }
          .content {
            font-size: 24px;
            line-height: 1.8;
          }
        </style>
      `

      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${fileName}</title>
            ${styles}
          </head>
          <body>
            <div class="diploma">
              <h1>DYPLOM</h1>
              <div class="content">${html}</div>
            </div>
          </body>
        </html>
      `

      // Tworzymy Blob z HTML
      const blob = new Blob([content], { type: 'text/html' })
      resolve(blob)
    })
  }

  const generateAll = async () => {
    setGenerating(true)
    
    const zip = new JSZip()
    const count = fieldData[selectedFields[0]]?.length || 0
    const errors: number[] = []

    for (let i = 0; i < count; i++) {
      try {
        const values: {[key: string]: string} = {}
        selectedFields.forEach(field => {
          values[field] = fieldData[field]?.[i] || ''
        })

        const diplomaHtml = replacePlaceholders(fileContent, values)
        
        const firstFieldValue = values[selectedFields[0]] || `dyplom_${i + 1}`
        const safeFileName = firstFieldValue
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
        const fileName = `dyplom_${safeFileName}_${i + 1}.html`

        const htmlBlob = await generatePDF(diplomaHtml, fileName)
        zip.file(fileName, htmlBlob)

      } catch (error) {
        console.error(`Błąd generowania dyplomu ${i + 1}:`, error)
        errors.push(i + 1)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `dyplomy_${new Date().toISOString().slice(0,10)}.zip`)

    if (errors.length > 0) {
      alert(`Wygenerowano ${count - errors.length} z ${count} dyplomów.\nBłędy: ${errors.join(', ')}`)
    } else {
      alert(`Sukces! Wygenerowano ${count} dyplomów.`)
    }

    setGenerating(false)
  }

  const previewFirst = () => {
    const count = fieldData[selectedFields[0]]?.length || 0
    if (count === 0) return

    const values: {[key: string]: string} = {}
    selectedFields.forEach(field => {
      values[field] = fieldData[field]?.[0] || ''
    })

    const previewHtml = replacePlaceholders(fileContent, values)
    
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Podgląd dyplomu</title>
            <style>
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0;
                background-color: #f5f5f5;
                font-family: Arial, sans-serif;
              }
              .diploma-container {
                max-width: 1000px;
                margin: 40px auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              }
              .diploma { 
                background: white;
                padding: 60px 40px;
                border: 15px solid gold;
                text-align: center;
              }
              .diploma h1 {
                color: #2c3e50;
                font-size: 48px;
                margin-bottom: 40px;
                text-transform: uppercase;
              }
              .diploma-content {
                font-size: 24px;
                line-height: 1.8;
              }
              .preview-header {
                background: #3498db;
                color: white;
                padding: 15px;
                text-align: center;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <div class="diploma-container">
              <div class="preview-header">
                Podgląd dyplomu (dane z pierwszego wiersza)
              </div>
              <div class="diploma">
                <h1>DYPLOM</h1>
                <div class="diploma-content">${previewHtml}</div>
              </div>
            </div>
          </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const dataCount = fieldData[selectedFields[0]]?.length || 0

  return (
    <div className="app">
      <header className="header">
        <h1>📜 Generator Dyplomów</h1>
      </header>

      <div className="steps">
        {[1, 2, 3, 4].map((num) => (
          <div 
            key={num}
            className={`step ${step === num ? 'active' : ''}`}
          >
            Krok {num}: {
              num === 1 ? 'Wgraj szablon' :
              num === 2 ? 'Wykryte pola' :
              num === 3 ? 'Wprowadź dane' :
              'Generuj'
            }
          </div>
        ))}
      </div>

      <div className="content">
        {step === 1 && (
          <div className="uploader">
            <h2>Krok 1: Wgraj szablon dyplomu</h2>
            
            <div className="file-input-container">
              <input 
                type="file" 
                onChange={handleFileUpload}
                accept=".docx,.txt"
                className="file-input"
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload" className="file-label">
                {loading ? '⏳ Wczytywanie...' : '📁 Wybierz plik'}
              </label>
            </div>

            {fileName && (
              <div className="file-info">
                <p>Wybrano: {fileName}</p>
              </div>
            )}

            <div className="supported-formats">
              <h3>Obsługiwane formaty:</h3>
              <ul>
                <li>📄 Microsoft Word (.docx) - z zachowaniem formatowania</li>
                <li>📝 Tekstowy (.txt) - prosty tekst</li>
              </ul>
            </div>

            <div className="hint">
              <p>💡 Wskazówka: W swoim szablonie użyj znaczników <code>{'{{nazwa_pola}}'}</code></p>
              <p className="example">Przykład: "Szanowny/a <strong>{'{{imie}} {{nazwisko}}'}</strong>"</p>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="preview">
            <h2>Krok 2: Wykryte pola</h2>
            
            {placeholders.length > 0 ? (
              <div className="detected-fields">
                <h3>🔍 Znalezione pola w szablonie:</h3>
                <div className="fields-list">
                  {placeholders.map((field, index) => (
                    <span key={index} className="field-tag">
                      {field}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setSelectedFields(placeholders)
                    setStep(3)
                  }} 
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  Dalej - wprowadź dane →
                </button>
              </div>
            ) : (
              <div className="no-fields">
                <p>⚠️ Nie znaleziono pól w formacie {'{{nazwa}}'}</p>
                <p>Dodaj je ręcznie w szablonie lub wróć do kroku 1</p>
                <button onClick={() => setStep(1)} className="btn-secondary">
                  ← Wróć do kroku 1
                </button>
              </div>
            )}
          </div>
        )}
        
        {step === 3 && (
          <div className="data-input">
            <h2>Krok 3: Wprowadź dane</h2>
            
            <div className="fields-summary">
              <p>Pola do wypełnienia:</p>
              <div className="fields-list">
                {selectedFields.map((field, index) => (
                  <span key={index} className="field-tag">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <textarea 
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder={
                selectedFields.length === 1 
                  ? `Wprowadź dane dla pola "${selectedFields[0]}"\nKażda linia = jeden dyplom\n\nPrzykład:\nJan Kowalski\nAnna Nowak\nPiotr Wiśniewski`
                  : `Wprowadź dane w formacie: ${selectedFields.join(', ')}\nKażda linia = jeden dyplom\n\nPrzykład:\nJan, Kowalski\nAnna, Nowak\nPiotr, Wiśniewski`
              }
              rows={10}
              className="data-textarea"
            />

            <div className="actions">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Wstecz
              </button>
              <button 
                onClick={parseBulkData} 
                className="btn-primary"
                disabled={!bulkData.trim()}
              >
                Przetwórz dane →
              </button>
            </div>
          </div>
        )}
        
        {step === 4 && (
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
        )}
      </div>
    </div>
  )
}

export default App