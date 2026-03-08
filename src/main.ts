function main(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #e2e4ed; background: #0f1117; min-height: 100vh;">
      <h1>DocDiffer</h1>
      <p>Document comparison tool</p>
    </div>
  `;
}

main();
