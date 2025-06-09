"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{background:'#1E1E1E', color:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h2 style={{fontSize:'2rem', marginBottom:'1rem'}}>Произошла ошибка 😢</h2>
        <pre style={{color:'#ff6b81', marginBottom:'1rem'}}>{error.message}</pre>
        <button onClick={reset} style={{padding:'0.5rem 1.5rem', background:'#6C5CE7', color:'#fff', borderRadius:'8px', border:'none', fontSize:'1rem'}}>Попробовать снова</button>
      </body>
    </html>
  );
} 