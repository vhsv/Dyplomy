type StepProps ={
    step: number;
}

function Steps({step} : StepProps)
{
    return(
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
    )
} 
export default Steps