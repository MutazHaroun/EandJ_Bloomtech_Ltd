async function run() {
  const r = await fetch('https://eand-j-bloomtech-ltd.vercel.app/');
  const html = await r.text();
  const indexJs = html.match(/assets\/index-[^.]+\.js/);
  if (!indexJs) return console.log('no index js');
  const r2 = await fetch('https://eand-j-bloomtech-ltd.vercel.app/' + indexJs[0]);
  const js = await r2.text();
  const urlMatchLocal = js.match(/http:\/\/localhost:5001\/api/);
  console.log('Local URL in Vercel bundle:', urlMatchLocal ? 'Found localhost' : 'Not Found!');
  const allUrls = js.match(/https?:\/\/[^\/\"\']+/g) || [];
  console.log('Found URLs:', [...new Set(allUrls)].filter(u=>!u.includes('w3.org')&&!u.includes('react')));
}
run();
