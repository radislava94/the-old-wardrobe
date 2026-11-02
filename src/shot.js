const {chromium}=require('playwright-core');
const path=require('path');
const {pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
 for(const [name,w,dpr] of [['desktop',1440,1],['mobile',390,2]]){
  const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:dpr,isMobile:name==='mobile'});
  await p.goto(pathToFileURL(path.join(root,'mockup','index.html')).href,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  const f=await p.evaluate(()=>[document.fonts.check('700 20px "Playfair Display"'),document.fonts.check('16px "Courier Prime"'),[...document.images].filter(i=>!i.naturalWidth).length, document.documentElement.scrollWidth]);
  console.log(name,'playfair',f[0],'courier',f[1],'brokenImgs',f[2],'scrollW',f[3]);
  await p.screenshot({path:path.join(root,'mockup',`home-${name}.png`),fullPage:true});
 }
 await b.close();
})();
